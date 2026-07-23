/**
 * Checkpointer de LangGraph sobre Supabase (PostgREST via supabaseAdmin).
 *
 * Mismo enfoque que el DjangoCheckpointer de PostHog: en lugar de exigir una
 * conexión pg directa (pooler en modo sesión, env extra), persistimos los
 * checkpoints serializados con el serde por defecto de LangGraph (JsonPlus)
 * como base64 en las tablas ai_checkpoints / ai_checkpoint_writes.
 *
 * Semántica modelada sobre el SqliteSaver oficial: el checkpoint completo
 * (incluidos channel_values) se serializa en un solo blob por fila.
 */
import {
  BaseCheckpointSaver,
  type Checkpoint,
  type CheckpointListOptions,
  type CheckpointMetadata,
  type CheckpointTuple,
  type ChannelVersions,
  type PendingWrite,
} from '@langchain/langgraph-checkpoint';
import type { RunnableConfig } from '@langchain/core/runnables';
import { supabaseAdmin } from '../db/index.js';

const b64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64');
const unb64 = (text: string): Uint8Array => new Uint8Array(Buffer.from(text, 'base64'));

interface CheckpointRow {
  thread_id: string;
  checkpoint_ns: string;
  checkpoint_id: string;
  parent_checkpoint_id: string | null;
  type: string | null;
  checkpoint: string;
  metadata: string;
}

export class SupabaseCheckpointer extends BaseCheckpointSaver {
  private async rowToTuple(row: CheckpointRow): Promise<CheckpointTuple> {
    const checkpoint = (await this.serde.loadsTyped(row.type ?? 'json', unb64(row.checkpoint))) as Checkpoint;
    const metadata = (await this.serde.loadsTyped(row.type ?? 'json', unb64(row.metadata))) as CheckpointMetadata;

    const { data: writeRows } = await supabaseAdmin
      .from('ai_checkpoint_writes')
      .select('task_id, idx, channel, type, value')
      .eq('thread_id', row.thread_id)
      .eq('checkpoint_ns', row.checkpoint_ns)
      .eq('checkpoint_id', row.checkpoint_id)
      .order('task_id')
      .order('idx');

    const pendingWrites = await Promise.all(
      (writeRows || []).map(async (w) => [
        w.task_id,
        w.channel,
        await this.serde.loadsTyped(w.type ?? 'json', unb64(w.value)),
      ] as [string, string, unknown]),
    );

    return {
      config: {
        configurable: {
          thread_id: row.thread_id,
          checkpoint_ns: row.checkpoint_ns,
          checkpoint_id: row.checkpoint_id,
        },
      },
      checkpoint,
      metadata,
      parentConfig: row.parent_checkpoint_id
        ? {
            configurable: {
              thread_id: row.thread_id,
              checkpoint_ns: row.checkpoint_ns,
              checkpoint_id: row.parent_checkpoint_id,
            },
          }
        : undefined,
      pendingWrites,
    };
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id as string | undefined;
    if (!threadId) return undefined;
    const ns = (config.configurable?.checkpoint_ns as string | undefined) ?? '';
    const checkpointId = config.configurable?.checkpoint_id as string | undefined;

    let q = supabaseAdmin
      .from('ai_checkpoints')
      .select('*')
      .eq('thread_id', threadId)
      .eq('checkpoint_ns', ns);
    q = checkpointId
      ? q.eq('checkpoint_id', checkpointId)
      : q.order('checkpoint_id', { ascending: false }).limit(1);

    const { data, error } = await q.maybeSingle();
    if (error) throw new Error(`SupabaseCheckpointer.getTuple: ${error.message}`);
    if (!data) return undefined;
    return this.rowToTuple(data as CheckpointRow);
  }

  async *list(config: RunnableConfig, options?: CheckpointListOptions): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id as string | undefined;
    if (!threadId) return;
    const ns = (config.configurable?.checkpoint_ns as string | undefined) ?? '';

    let q = supabaseAdmin
      .from('ai_checkpoints')
      .select('*')
      .eq('thread_id', threadId)
      .eq('checkpoint_ns', ns)
      .order('checkpoint_id', { ascending: false });
    const before = options?.before?.configurable?.checkpoint_id as string | undefined;
    if (before) q = q.lt('checkpoint_id', before);
    if (options?.limit) q = q.limit(options.limit);

    const { data, error } = await q;
    if (error) throw new Error(`SupabaseCheckpointer.list: ${error.message}`);
    for (const row of data || []) {
      yield await this.rowToTuple(row as CheckpointRow);
    }
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    _newVersions: ChannelVersions,
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id as string;
    if (!threadId) throw new Error('SupabaseCheckpointer.put: missing thread_id');
    const ns = (config.configurable?.checkpoint_ns as string | undefined) ?? '';

    const [type, cpBytes] = await this.serde.dumpsTyped(checkpoint);
    const [, metaBytes] = await this.serde.dumpsTyped(metadata);

    const { error } = await supabaseAdmin.from('ai_checkpoints').upsert(
      {
        thread_id: threadId,
        checkpoint_ns: ns,
        checkpoint_id: checkpoint.id,
        parent_checkpoint_id: (config.configurable?.checkpoint_id as string | undefined) ?? null,
        type,
        checkpoint: b64(cpBytes),
        metadata: b64(metaBytes),
      },
      { onConflict: 'thread_id,checkpoint_ns,checkpoint_id' },
    );
    if (error) throw new Error(`SupabaseCheckpointer.put: ${error.message}`);

    return {
      configurable: { thread_id: threadId, checkpoint_ns: ns, checkpoint_id: checkpoint.id },
    };
  }

  async putWrites(config: RunnableConfig, writes: PendingWrite[], taskId: string): Promise<void> {
    const threadId = config.configurable?.thread_id as string;
    const ns = (config.configurable?.checkpoint_ns as string | undefined) ?? '';
    const checkpointId = config.configurable?.checkpoint_id as string;
    if (!threadId || !checkpointId) throw new Error('SupabaseCheckpointer.putWrites: missing thread/checkpoint id');

    const rows = await Promise.all(
      writes.map(async ([channel, value], idx) => {
        const [type, bytes] = await this.serde.dumpsTyped(value);
        return {
          thread_id: threadId,
          checkpoint_ns: ns,
          checkpoint_id: checkpointId,
          task_id: taskId,
          idx,
          channel,
          type,
          value: b64(bytes),
        };
      }),
    );
    if (!rows.length) return;
    const { error } = await supabaseAdmin
      .from('ai_checkpoint_writes')
      .upsert(rows, { onConflict: 'thread_id,checkpoint_ns,checkpoint_id,task_id,idx' });
    if (error) throw new Error(`SupabaseCheckpointer.putWrites: ${error.message}`);
  }

  async deleteThread(threadId: string): Promise<void> {
    await supabaseAdmin.from('ai_checkpoint_writes').delete().eq('thread_id', threadId);
    await supabaseAdmin.from('ai_checkpoints').delete().eq('thread_id', threadId);
  }
}
