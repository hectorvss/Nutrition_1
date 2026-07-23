import { z } from 'zod';
import { NulyTool, type ToolCtx } from '../tool.js';
import { supabaseAdmin } from '../../db/index.js';

const UUID = z.string().uuid();

export class ListClientsTool extends NulyTool<z.ZodType> {
  readonly name = 'list_clients';
  readonly description =
    'Lista los clientes del coach con nombre, email, objetivo, peso y estado. Úsala para localizar clientes o tener una vista general. Devuelve máx. 50.';
  readonly schema = z.object({
    search: z.string().max(100).optional().describe('Filtro por nombre o email (contiene)'),
    status: z.enum(['active', 'pending', 'archived']).optional(),
  });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    let q = supabaseAdmin
      .from('users')
      .select('id, email, status, created_at, profiles!user_id (full_name), clients_profiles!user_id (weight, goal, gender, age)')
      .eq('manager_id', ctx.managerId)
      .eq('role', 'CLIENT')
      .order('created_at', { ascending: false })
      .limit(50);
    if (args.status) q = q.eq('status', args.status);
    const { data, error } = await q;
    if (error) throw new Error(error.message);

    let rows = (data || []).map((u: any) => ({
      id: u.id,
      name: u.profiles?.[0]?.full_name || u.profiles?.full_name || null,
      email: u.email,
      status: u.status,
      goal: u.clients_profiles?.[0]?.goal ?? u.clients_profiles?.goal ?? null,
      weight: u.clients_profiles?.[0]?.weight ?? u.clients_profiles?.weight ?? null,
      age: u.clients_profiles?.[0]?.age ?? u.clients_profiles?.age ?? null,
    }));
    if (args.search) {
      const s = args.search.toLowerCase();
      rows = rows.filter(r => (r.name || '').toLowerCase().includes(s) || (r.email || '').toLowerCase().includes(s));
    }
    return [JSON.stringify({ count: rows.length, clients: rows })];
  }
}

export class GetClientTool extends NulyTool<z.ZodType> {
  readonly name = 'get_client';
  readonly description =
    'Ficha completa de un cliente: perfil, objetivo, últimos check-ins, planes activos de nutrición/entrenamiento y actividad reciente. Úsala antes de aconsejar o escribir nada sobre un cliente concreto.';
  readonly schema = z.object({ client_id: UUID });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, status, created_at, profiles!user_id (full_name, avatar_url), clients_profiles!user_id (weight, goal, notes, gender, age, height)')
      .eq('id', args.client_id)
      .eq('manager_id', ctx.managerId)
      .eq('role', 'CLIENT')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!user) return ['No existe ningún cliente con ese id para este coach. Usa list_clients para localizar el id correcto.'];

    const [checkins, nutrition, training, lastLogs] = await Promise.all([
      supabaseAdmin
        .from('client_checkin_submissions')
        .select('id, submitted_at, reviewed_at, answers_json')
        .eq('client_id', args.client_id)
        .order('submitted_at', { ascending: false })
        .limit(3),
      supabaseAdmin
        .from('nutrition_plans')
        .select('id, name, updated_at')
        .eq('client_id', args.client_id)
        .order('updated_at', { ascending: false })
        .limit(2),
      supabaseAdmin
        .from('training_programs')
        .select('id, name, updated_at')
        .eq('client_id', args.client_id)
        .order('updated_at', { ascending: false })
        .limit(2),
      supabaseAdmin
        .from('workout_logs')
        .select('logged_at')
        .eq('client_id', args.client_id)
        .order('logged_at', { ascending: false })
        .limit(5),
    ]);

    const profile: any = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;
    const cp: any = Array.isArray(user.clients_profiles) ? user.clients_profiles[0] : user.clients_profiles;
    return [
      JSON.stringify({
        id: user.id,
        name: profile?.full_name || null,
        email: user.email,
        status: user.status,
        since: user.created_at,
        profile: cp
          ? {
              goal: cp.goal, weight: cp.weight, height: cp.height, age: cp.age, gender: cp.gender,
              // Nota PRIVADA del coach: puedes usarla para razonar, PROHIBIDO citarla
              // en textos dirigidos al cliente.
              private_notes: cp.notes || null,
            }
          : null,
        recent_checkins: checkins.data || [],
        nutrition_plans: nutrition.data || [],
        training_programs: training.data || [],
        recent_workouts: (lastLogs.data || []).map((l: any) => l.logged_at),
      }),
    ];
  }
}
