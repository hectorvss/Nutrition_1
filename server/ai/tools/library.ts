import { z } from 'zod';
import { NulyTool, type ToolCtx } from '../tool.js';
import { supabaseAdmin } from '../../db/index.js';

export class ListExercisesTool extends NulyTool<z.ZodType> {
  readonly name = 'list_exercises';
  readonly description =
    'Busca en la biblioteca de ejercicios (nombre, grupo muscular, equipamiento). Los programas SOLO pueden usar ejercicios de esta biblioteca — nunca inventes ejercicios.';
  readonly schema = z.object({
    search: z.string().max(80).optional(),
    muscle_group: z.string().max(40).optional(),
    limit: z.number().int().min(1).max(50).default(25),
  });

  protected async run(args: z.infer<typeof this.schema>, _ctx: ToolCtx): Promise<[string, unknown?]> {
    let q = supabaseAdmin.from('exercises').select('*').limit(args.limit);
    if (args.search) q = q.ilike('name', `%${args.search}%`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    let rows = data || [];
    if (args.muscle_group) {
      const g = args.muscle_group.toLowerCase();
      rows = rows.filter((e: any) =>
        JSON.stringify(e).toLowerCase().includes(g),
      );
    }
    const slim = rows.map((e: any) => ({
      id: e.id,
      name: e.name ?? e.name_es ?? e.name_en,
      muscle: e.muscle_group ?? e.category ?? null,
      equipment: e.equipment ?? null,
    }));
    return [JSON.stringify({ count: slim.length, exercises: slim })];
  }
}

export class SearchFoodsTool extends NulyTool<z.ZodType> {
  readonly name = 'search_foods';
  readonly description =
    'Busca alimentos en la biblioteca con sus macros (kcal, proteína, carbohidratos, grasa por 100g). Los planes de nutrición SOLO usan alimentos de aquí.';
  readonly schema = z.object({
    search: z.string().min(1).max(80),
    limit: z.number().int().min(1).max(30).default(15),
  });

  protected async run(args: z.infer<typeof this.schema>, _ctx: ToolCtx): Promise<[string, unknown?]> {
    const { data, error } = await supabaseAdmin
      .from('foods')
      .select('*')
      .ilike('name', `%${args.search}%`)
      .limit(args.limit);
    if (error) throw new Error(error.message);
    const slim = (data || []).map((f: any) => ({
      id: f.id,
      name: f.name ?? f.name_es ?? f.name_en,
      kcal: f.calories ?? f.kcal ?? null,
      protein: f.protein ?? null,
      carbs: f.carbs ?? f.carbohydrates ?? null,
      fat: f.fat ?? f.fats ?? null,
    }));
    return [JSON.stringify({ count: slim.length, foods: slim })];
  }
}
