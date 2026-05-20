// Zod schemas para crear/actualizar planes de nutricion y programas de
// entrenamiento. El backend ya escribe `data_json` como JSON arbitrario
// (porque el frontend lo edita libremente), asi que el schema valida la
// envoltura (name + UUID + payload obligatorio como objeto) pero deja el
// interior del data_json permisivo. Eso evita rechazos por shape cuando
// el editor visual añade campos nuevos en un sprint sin tener que tocar
// el schema.
import { z } from 'zod';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z
  .string()
  .regex(UUID_RE, 'UUID invalido');

// data_json es un objeto JSON cuyo shape depende del editor del frontend.
// Lo aceptamos como Record<string, unknown> para no acoplar este schema
// a la estructura interna (comidas, macros, etc.) que aun esta evolucionando.
const jsonObject = z.record(z.string(), z.unknown());

// POST /api/manager/clients/:id/nutrition-plan
export const nutritionPlanSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  data_json: jsonObject.optional(),
});

// POST /api/manager/clients/:id/training-program
export const trainingProgramSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  data_json: jsonObject.optional(),
});

// POST /api/manager/nutrition-templates
// PUT  /api/manager/nutrition-templates/:id
export const nutritionTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Nombre obligatorio').max(200),
  description: z.string().max(1000).optional().nullable(),
  data_json: jsonObject.optional(),
});

// POST /api/manager/training-templates
// PUT  /api/manager/training-templates/:id
export const trainingTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Nombre obligatorio').max(200),
  description: z.string().max(1000).optional().nullable(),
  data_json: jsonObject.optional(),
});

export type NutritionPlanInput     = z.infer<typeof nutritionPlanSchema>;
export type TrainingProgramInput   = z.infer<typeof trainingProgramSchema>;
export type NutritionTemplateInput = z.infer<typeof nutritionTemplateSchema>;
export type TrainingTemplateInput  = z.infer<typeof trainingTemplateSchema>;
