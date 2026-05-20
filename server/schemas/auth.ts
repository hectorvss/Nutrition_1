// Zod schemas para validar el body de los endpoints de autenticacion.
//
// Por que zod:
// - Una unica fuente de verdad para el shape del request.
// - Mensajes de error consistentes y traducibles.
// - Eliminamos los chequeos ad-hoc (typeof === 'string', length, regex)
//   repartidos por cada handler.
//
// Uso en un endpoint:
//   const parsed = registerSchema.safeParse(req.body);
//   if (!parsed.success) {
//     return res.status(400).json({ error: parsed.error.issues[0].message });
//   }
//   const { email, password, name } = parsed.data;
import { z } from 'zod';

// Regex local; el de RFC es enorme y no aporta para este uso.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email es obligatorio')
  .regex(EMAIL_RE, 'Formato de email invalido');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede pasar de 72 caracteres'); // bcrypt cap

export const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .optional();

// POST /api/auth/register — manager self-registration desde la landing
export const registerSchema = z.object({
  email:    emailSchema,
  password: passwordSchema,
  name:     nameSchema,
});

// POST /api/auth/login
export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password es obligatorio'),
});

// POST /api/auth/forgot-password
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// POST /api/auth/reset-password
export const resetPasswordSchema = z.object({
  access_token: z.string().min(1, 'Token requerido'),
  new_password: passwordSchema,
});

export type RegisterInput        = z.infer<typeof registerSchema>;
export type LoginInput           = z.infer<typeof loginSchema>;
export type ForgotPasswordInput  = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput   = z.infer<typeof resetPasswordSchema>;
