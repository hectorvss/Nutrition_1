/**
 * Generadores (Fase 3) — el patrón subgrafo-como-tool de PostHog:
 * planner LLM (structured output) → matcher DETERMINISTA contra la biblioteca
 * (el modelo no puede inventar ejercicios/alimentos) → builder del data_json
 * EXACTO de los editores → validator con reglas duras.
 *
 * El draft se guarda en ai_artifacts y se asigna con assign_* (dangerous).
 */
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { ChatAnthropic } from '@langchain/anthropic';
import { NulyTool, type ToolCtx } from '../tool.js';
import { supabaseAdmin } from '../../db/index.js';
import { AI_MODEL } from '../graph.js';

const UUID = z.string().uuid();

/* ─────────────────────────── helpers comunes ─────────────────────────── */

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/** Matcher determinista nombre→fila de biblioteca (exacto > incluye > incluido). */
function matchByName<T extends { name: string }>(query: string, rows: T[]): T | undefined {
  const q = normalize(query);
  return (
    rows.find(r => normalize(r.name) === q) ||
    rows.find(r => normalize(r.name).includes(q)) ||
    rows.find(r => q.includes(normalize(r.name)))
  );
}

async function ownClient(clientId: string, managerId: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, profiles!user_id (full_name), clients_profiles!user_id (weight, height, age, gender, goal)')
    .eq('id', clientId)
    .eq('manager_id', managerId)
    .eq('role', 'CLIENT')
    .maybeSingle();
  if (!data) return null;
  const profile: any = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  const cp: any = Array.isArray(data.clients_profiles) ? data.clients_profiles[0] : data.clients_profiles;
  return { id: data.id, name: profile?.full_name || 'Cliente', ...(cp || {}) };
}

async function saveArtifact(opts: {
  managerId: string;
  kind: 'training_draft' | 'nutrition_draft';
  clientId: string;
  name: string;
  data: unknown;
}): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('ai_artifacts')
    .insert({
      manager_id: opts.managerId,
      kind: opts.kind,
      client_id: opts.clientId,
      name: opts.name,
      data: opts.data,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

async function loadArtifact(id: string, managerId: string, kind: string) {
  const { data } = await supabaseAdmin
    .from('ai_artifacts')
    .select('id, kind, client_id, name, data')
    .eq('id', id)
    .eq('manager_id', managerId)
    .eq('kind', kind)
    .maybeSingle();
  return data || null;
}

// Distribución de días por frecuencia — copiada de TrainingNoPlan.tsx para que
// el schedule generado sea idéntico al del flujo manual.
const FREQ_DAY_SPREAD: Record<number, string[]> = {
  2: ['monday', 'thursday'],
  3: ['monday', 'wednesday', 'friday'],
  4: ['monday', 'tuesday', 'thursday', 'friday'],
  5: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
};

/* ─────────────────────── generate_training_program ─────────────────────── */

const plannedExercise = z.object({
  library_name: z.string().describe('Nombre EXACTO de un ejercicio de la lista proporcionada'),
  sets: z.number().int().min(1).max(10),
  reps: z.string().max(20).describe('p.ej. "8-10" o "12"'),
  rir: z.number().int().min(0).max(5).optional(),
  rest: z.string().max(10).default('90s'),
});
const plannedWorkout = z.object({
  name: z.string().max(60),
  blocks: z.array(
    z.object({
      name: z.string().max(60),
      type: z.enum(['warmup', 'main', 'cooldown']),
      exercises: z.array(plannedExercise).min(1).max(10),
    }),
  ).min(1).max(4),
});
const trainingPlanSchema = z.object({
  program_name: z.string().max(80),
  rationale: z.string().max(600).describe('Por qué este split y esta progresión, en 2-4 frases'),
  workouts: z.array(plannedWorkout).min(1).max(6),
});

export class GenerateTrainingProgramTool extends NulyTool<z.ZodType> {
  readonly name = 'generate_training_program';
  readonly description =
    'Genera un BORRADOR de programa de entrenamiento para un cliente usando SOLO ejercicios de la biblioteca. No asigna nada: devuelve un draft que el coach revisa y luego se aplica con assign_training_program. Consulta antes la ficha del cliente si no la tienes.';
  readonly schema = z.object({
    client_id: UUID,
    goal: z.string().max(200).describe('Objetivo del programa (p.ej. hipertrofia, fuerza, pérdida de grasa)'),
    days_per_week: z.number().int().min(2).max(6),
    equipment: z.string().max(200).optional().describe('Material disponible (p.ej. "gimnasio completo", "mancuernas en casa")'),
    notes: z.string().max(500).optional().describe('Restricciones: lesiones, preferencias, tiempo por sesión…'),
  });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const client = await ownClient(args.client_id, ctx.managerId);
    if (!client) return ['Ese cliente no pertenece a este coach.'];

    // Biblioteca: globales del idioma + custom del coach
    const { data: libraryRaw, error } = await supabaseAdmin
      .from('exercises')
      .select('id, name, category, subcategory, language, manager_id')
      .or(`manager_id.is.null,manager_id.eq.${ctx.managerId}`)
      .limit(600);
    if (error) throw new Error(error.message);
    const library = (libraryRaw || []).filter(
      (e: any) => !e.language || e.language === ctx.language || e.manager_id === ctx.managerId,
    );
    if (library.length < 10) return ['La biblioteca de ejercicios está casi vacía — no puedo generar un programa fiable.'];

    const libraryList = library.map((e: any) => `${e.name} [${e.category || '?'}]`).join('\n');
    const llm = new ChatAnthropic({ model: AI_MODEL, maxTokens: 8192, temperature: 0.5 });
    const planner = llm.withStructuredOutput(trainingPlanSchema, { name: 'training_plan' });

    const prompt = `Eres un entrenador experto. Diseña un programa de entrenamiento semanal.

CLIENTE: ${client.name} — objetivo declarado: ${client.goal || 'no indicado'}, peso ${client.weight || '?'}kg, edad ${client.age || '?'}, género ${client.gender || '?'}.
OBJETIVO DEL PROGRAMA: ${args.goal}
DÍAS/SEMANA: ${args.days_per_week} (genera EXACTAMENTE ${args.days_per_week} workouts, uno por día de entreno)
MATERIAL: ${args.equipment || 'gimnasio completo'}
${args.notes ? `RESTRICCIONES: ${args.notes}` : ''}

REGLAS DURAS:
- Cada ejercicio DEBE ser un nombre EXACTO de esta biblioteca (copia literal):
${libraryList}
- Cada workout: 1 bloque warmup (1-3 ejercicios), 1 bloque main (4-7 ejercicios), opcional cooldown.
- Volumen semanal sensato para el nivel; progresión implícita vía RIR 1-3 y reps.
- Respeta las restricciones/lesiones por encima de todo.`;

    let plan = await planner.invoke(prompt);

    // Matcher determinista + un reintento con feedback de no-matcheados
    const resolve = (p: typeof plan) => {
      const misses: string[] = [];
      const workouts = p.workouts.map(w => ({
        id: randomUUID(),
        name: w.name,
        blocks: w.blocks.map(b => ({
          id: randomUUID(),
          name: b.name,
          type: b.type,
          exercises: b.exercises
            .map(ex => {
              const row: any = matchByName(ex.library_name, library as any[]);
              if (!row) {
                misses.push(ex.library_name);
                return null;
              }
              return {
                id: row.id,
                name: row.name,
                muscleGroup: row.category || '',
                equipment: row.subcategory || '',
                sets: ex.sets,
                reps: ex.reps,
                rir: ex.rir ?? 2,
                rest: ex.rest || '90s',
              };
            })
            .filter(Boolean),
        })),
      }));
      return { workouts, misses };
    };

    let { workouts, misses } = resolve(plan);
    if (misses.length > 0) {
      plan = await planner.invoke(
        `${prompt}\n\nTu intento anterior usó nombres que NO existen en la biblioteca: ${[...new Set(misses)].join(', ')}. Sustitúyelos por nombres EXACTOS de la lista.`,
      );
      ({ workouts, misses } = resolve(plan));
    }

    // Validator con reglas duras
    const problems: string[] = [];
    if (plan.workouts.length !== args.days_per_week)
      problems.push(`pidió ${args.days_per_week} días pero generó ${plan.workouts.length} workouts`);
    for (const w of workouts) {
      const main = w.blocks.find(b => b.type === 'main');
      if (!main || (main.exercises as any[]).length < 3) problems.push(`"${w.name}" tiene un bloque principal demasiado corto`);
    }
    if (misses.length > 0) problems.push(`ejercicios sin match descartados: ${[...new Set(misses)].join(', ')}`);

    const days = FREQ_DAY_SPREAD[args.days_per_week] || FREQ_DAY_SPREAD[3];
    const weeklySchedule: Record<string, string> = {};
    days.forEach((d, i) => {
      weeklySchedule[d] = workouts[i % workouts.length].id;
    });

    const dataJson = { workouts, weeklySchedule };
    const artifactId = await saveArtifact({
      managerId: ctx.managerId,
      kind: 'training_draft',
      clientId: args.client_id,
      name: plan.program_name,
      data: dataJson,
    });

    const summary = workouts
      .map(w => `- ${w.name}: ${w.blocks.map(b => `${b.name} (${(b.exercises as any[]).length} ej.)`).join(', ')}`)
      .join('\n');

    return [
      `Draft de programa creado (draft_id: ${artifactId}) — "${plan.program_name}" para ${client.name}, ${args.days_per_week} días/semana.\n${plan.rationale}\n${summary}\n${problems.length ? `AVISOS: ${problems.join('; ')}. Coméntalos al coach.` : 'Validación OK.'}\nPresenta el resumen al coach y, si le encaja, llama a assign_training_program con este draft_id.`,
      {
        kind: 'training_draft',
        draft_id: artifactId,
        client_id: args.client_id,
        client_name: client.name,
        name: plan.program_name,
        rationale: plan.rationale,
        days_per_week: args.days_per_week,
        workouts: workouts.map(w => ({
          name: w.name,
          blocks: w.blocks.map(b => ({
            name: b.name,
            type: b.type,
            exercises: (b.exercises as any[]).map(e => ({ name: e.name, sets: e.sets, reps: e.reps, rir: e.rir, rest: e.rest })),
          })),
        })),
        warnings: problems,
      },
    ];
  }
}

export class AssignTrainingProgramTool extends NulyTool<z.ZodType> {
  readonly name = 'assign_training_program';
  readonly description =
    'Asigna un draft de programa (creado con generate_training_program) a su cliente. Requiere aprobación del coach. Sobrescribe el programa actual del cliente si existe.';
  readonly schema = z.object({ draft_id: UUID });

  isDangerous(): boolean {
    return true;
  }

  async preview(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<string> {
    const art = await loadArtifact(args.draft_id, ctx.managerId, 'training_draft');
    if (!art) return 'Draft no encontrado.';
    const dj: any = art.data;
    const lines = (dj.workouts || [])
      .map((w: any) => `- ${w.name} (${w.blocks?.reduce((n: number, b: any) => n + (b.exercises?.length || 0), 0)} ejercicios)`)
      .join('\n');
    return `**Asignar programa "${art.name}"** al cliente.\nSustituirá su programa actual.\n\n${lines}`;
  }

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const art = await loadArtifact(args.draft_id, ctx.managerId, 'training_draft');
    if (!art) return ['Draft no encontrado o no pertenece a este coach.'];
    const client = await ownClient(art.client_id, ctx.managerId);
    if (!client) return ['El cliente del draft ya no pertenece a este coach.'];

    // Mismo upsert que POST /manager/clients/:id/training-program
    const { data: programData, error } = await supabaseAdmin
      .from('training_programs')
      .upsert(
        {
          client_id: art.client_id,
          created_by: ctx.managerId,
          name: art.name,
          data_json: art.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id,created_by' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Mismo efecto colateral: trigger de workflows
    try {
      const { runWorkflowsForEvent } = await import('../../routes/workflows.js');
      void runWorkflowsForEvent(ctx.managerId, 'trigger.plan_assigned', {
        clientId: art.client_id,
        planKind: 'training',
        planId: programData?.id,
      });
    } catch {
      /* best-effort */
    }

    return [
      `Programa "${art.name}" asignado a ${client.name} correctamente.`,
      { kind: 'assigned', plan: 'training', client_id: art.client_id },
    ];
  }
}

/* ─────────────────────── generate_nutrition_plan ─────────────────────── */

const plannedMeal = z.object({
  name: z.string().max(40),
  time: z.string().max(10).describe('p.ej. "08:00 AM"'),
  items: z.array(
    z.object({
      food_name: z.string().describe('Nombre EXACTO de un alimento de la lista proporcionada'),
      quantity: z.number().min(0.25).max(6).describe('Multiplicador sobre la ración base del alimento'),
    }),
  ).min(1).max(8),
});
const nutritionPlanLLMSchema = z.object({
  plan_name: z.string().max(80),
  rationale: z.string().max(500),
  meals: z.array(plannedMeal).min(2).max(7),
});

const MEAL_ICONS: Record<string, string> = {
  desayuno: 'Sunrise', breakfast: 'Sunrise',
  almuerzo: 'Sun', comida: 'Sun', lunch: 'Sun',
  cena: 'Moon', dinner: 'Moon',
};

export class GenerateNutritionPlanTool extends NulyTool<z.ZodType> {
  readonly name = 'generate_nutrition_plan';
  readonly description =
    'Genera un BORRADOR de plan de nutrición diario para un cliente usando SOLO alimentos de la biblioteca, ajustado a un objetivo calórico y de macros (o calculado desde el perfil). Devuelve un draft; se aplica con assign_nutrition_plan tras aprobación.';
  readonly schema = z.object({
    client_id: UUID,
    target_calories: z.number().int().min(1000).max(6000).optional()
      .describe('Si se omite se estima con Mifflin-St Jeor + objetivo del cliente'),
    protein_g: z.number().int().min(40).max(400).optional(),
    meals_per_day: z.number().int().min(2).max(6).default(4),
    restrictions: z.string().max(400).optional().describe('Alergias, intolerancias, preferencias (vegetariano…)'),
  });

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const client = await ownClient(args.client_id, ctx.managerId);
    if (!client) return ['Ese cliente no pertenece a este coach.'];

    // Targets: explícitos o Mifflin-St Jeor con ajuste por objetivo
    let kcal = args.target_calories ?? 0;
    if (!kcal) {
      const w = Number(client.weight) || 75;
      const h = Number(client.height) || 172;
      const age = Number(client.age) || 30;
      const male = String(client.gender || '').toLowerCase().startsWith('m');
      const bmr = 10 * w + 6.25 * h - 5 * age + (male ? 5 : -161);
      const tdee = bmr * 1.5;
      const goal = normalize(String(client.goal || ''));
      const delta = /perd|loss|defin|cut/.test(goal) ? -0.15 : /gan|muscle|bulk|masa/.test(goal) ? 0.1 : 0;
      kcal = Math.round((tdee * (1 + delta)) / 50) * 50;
    }
    const protein = args.protein_g ?? Math.round((Number(client.weight) || 75) * 1.8);
    const fats = Math.round((kcal * 0.27) / 9);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fats * 9) / 4));

    const { data: foodsRaw, error } = await supabaseAdmin
      .from('foods')
      .select('id, name, category, calories, protein, carbs, fats, serving_size, language, manager_id')
      .or(`manager_id.is.null,manager_id.eq.${ctx.managerId}`)
      .limit(500);
    if (error) throw new Error(error.message);
    const foods = (foodsRaw || []).filter(
      (f: any) => (!f.language || f.language === ctx.language || f.manager_id === ctx.managerId) && f.calories != null,
    );
    if (foods.length < 10) return ['La biblioteca de alimentos está casi vacía — no puedo generar un plan fiable.'];

    const foodList = foods
      .map((f: any) => `${f.name} — ${f.calories}kcal P${f.protein} C${f.carbs} G${f.fats} (ración: ${f.serving_size || '100g'})`)
      .join('\n');

    const llm = new ChatAnthropic({ model: AI_MODEL, maxTokens: 8192, temperature: 0.4 });
    const planner = llm.withStructuredOutput(nutritionPlanLLMSchema, { name: 'nutrition_plan' });
    const prompt = `Eres un nutricionista experto. Diseña UN día tipo de alimentación.

CLIENTE: ${client.name} — objetivo: ${client.goal || 'no indicado'}.
TARGETS DIARIOS: ${kcal} kcal · proteína ${protein}g · carbohidratos ${carbs}g · grasas ${fats}g.
COMIDAS: exactamente ${args.meals_per_day}.
${args.restrictions ? `RESTRICCIONES (obligatorias): ${args.restrictions}` : ''}

REGLAS DURAS:
- Cada alimento DEBE ser un nombre EXACTO de esta biblioteca (con sus macros por ración base):
${foodList}
- quantity es el multiplicador de la ración base (0.5 = media ración).
- La suma total debe quedar dentro de ±8% de los targets de kcal y proteína.`;

    let plan = await planner.invoke(prompt);

    const resolveMeals = (p: typeof plan) => {
      const misses: string[] = [];
      let totK = 0, totP = 0, totC = 0, totF = 0;
      const meals = p.meals.map((m, i) => ({
        id: i + 1,
        name: m.name,
        time: m.time,
        iconName: MEAL_ICONS[normalize(m.name)] || 'Cookie',
        iconColor: 'bg-emerald-100 text-emerald-600',
        items: m.items
          .map(it => {
            const row: any = matchByName(it.food_name, foods as any[]);
            if (!row) {
              misses.push(it.food_name);
              return null;
            }
            const q = it.quantity;
            totK += (row.calories || 0) * q;
            totP += (row.protein || 0) * q;
            totC += (row.carbs || 0) * q;
            totF += (row.fats || 0) * q;
            return {
              id: randomUUID(),
              foodId: row.id,
              name: row.name,
              calories: Math.round((row.calories || 0) * q),
              protein: Math.round((row.protein || 0) * q * 10) / 10,
              carbs: Math.round((row.carbs || 0) * q * 10) / 10,
              fats: Math.round((row.fats || 0) * q * 10) / 10,
              servingSize: row.serving_size || '100g',
              quantity: q,
            };
          })
          .filter(Boolean),
      }));
      return { meals, misses, totals: { kcal: Math.round(totK), protein: Math.round(totP), carbs: Math.round(totC), fats: Math.round(totF) } };
    };

    let { meals, misses, totals } = resolveMeals(plan);
    const offTarget = () => Math.abs(totals.kcal - kcal) / kcal > 0.08 || Math.abs(totals.protein - protein) / protein > 0.12;
    if (misses.length > 0 || offTarget()) {
      plan = await planner.invoke(
        `${prompt}\n\nTu intento anterior ${misses.length ? `usó alimentos inexistentes (${[...new Set(misses)].join(', ')})` : ''} ${offTarget() ? `y sumó ${totals.kcal}kcal / P${totals.protein}g (targets: ${kcal}kcal / P${protein}g)` : ''}. Corrige usando SOLO nombres exactos y ajusta cantidades para cuadrar los targets.`,
      );
      ({ meals, misses, totals } = resolveMeals(plan));
    }

    const problems: string[] = [];
    if (misses.length) problems.push(`alimentos sin match descartados: ${[...new Set(misses)].join(', ')}`);
    if (offTarget()) problems.push(`totales fuera de rango: ${totals.kcal}kcal / P${totals.protein}g vs target ${kcal}/${protein}`);

    const dataJson = {
      config: { targetCalories: kcal, macros: { protein, carbs, fats } },
      meals,
      supplements: [],
    };
    const artifactId = await saveArtifact({
      managerId: ctx.managerId,
      kind: 'nutrition_draft',
      clientId: args.client_id,
      name: plan.plan_name,
      data: dataJson,
    });

    return [
      `Draft de plan de nutrición creado (draft_id: ${artifactId}) — "${plan.plan_name}" para ${client.name}.\nTargets: ${kcal}kcal P${protein} C${carbs} G${fats} · Totales del plan: ${totals.kcal}kcal P${totals.protein} C${totals.carbs} G${totals.fats}.\n${plan.rationale}\n${problems.length ? `AVISOS: ${problems.join('; ')}.` : 'Validación OK (±8%).'}\nPresenta el plan al coach y, si le encaja, llama a assign_nutrition_plan con este draft_id.`,
      {
        kind: 'nutrition_draft',
        draft_id: artifactId,
        client_id: args.client_id,
        client_name: client.name,
        name: plan.plan_name,
        rationale: plan.rationale,
        targets: { kcal, protein, carbs, fats },
        totals,
        meals: meals.map((m: any) => ({
          name: m.name,
          time: m.time,
          items: m.items.map((it: any) => ({ name: it.name, quantity: it.quantity, calories: it.calories })),
        })),
        warnings: problems,
      },
    ];
  }
}

export class AssignNutritionPlanTool extends NulyTool<z.ZodType> {
  readonly name = 'assign_nutrition_plan';
  readonly description =
    'Asigna un draft de plan de nutrición (creado con generate_nutrition_plan) a su cliente. Requiere aprobación del coach. Sobrescribe el plan actual si existe.';
  readonly schema = z.object({ draft_id: UUID });

  isDangerous(): boolean {
    return true;
  }

  async preview(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<string> {
    const art = await loadArtifact(args.draft_id, ctx.managerId, 'nutrition_draft');
    if (!art) return 'Draft no encontrado.';
    const dj: any = art.data;
    const lines = (dj.meals || [])
      .map((m: any) => `- ${m.name} (${m.time}): ${(m.items || []).map((i: any) => i.name).join(', ')}`)
      .join('\n');
    return `**Asignar plan "${art.name}"** (${dj.config?.targetCalories} kcal) al cliente.\nSustituirá su plan actual.\n\n${lines}`;
  }

  protected async run(args: z.infer<typeof this.schema>, ctx: ToolCtx): Promise<[string, unknown?]> {
    const art = await loadArtifact(args.draft_id, ctx.managerId, 'nutrition_draft');
    if (!art) return ['Draft no encontrado o no pertenece a este coach.'];
    const client = await ownClient(art.client_id, ctx.managerId);
    if (!client) return ['El cliente del draft ya no pertenece a este coach.'];

    const { data: planData, error } = await supabaseAdmin
      .from('nutrition_plans')
      .upsert(
        {
          client_id: art.client_id,
          created_by: ctx.managerId,
          name: art.name,
          data_json: art.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id,created_by' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);

    try {
      const { runWorkflowsForEvent } = await import('../../routes/workflows.js');
      void runWorkflowsForEvent(ctx.managerId, 'trigger.plan_assigned', {
        clientId: art.client_id,
        planKind: 'nutrition',
        planId: planData?.id,
      });
    } catch {
      /* best-effort */
    }

    return [
      `Plan "${art.name}" asignado a ${client.name} correctamente.`,
      { kind: 'assigned', plan: 'nutrition', client_id: art.client_id },
    ];
  }
}
