// Ad-hoc smoke test for zod schemas. Run with: npx tsx scripts/test_zod.mts
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../server/schemas/auth.ts';
import { nutritionPlanSchema, trainingProgramSchema } from '../server/schemas/plans.ts';

const tests = [
  { name: 'register valid',     schema: registerSchema, input: { email: 'a@b.com', password: '12345678', name: 'Coach' }, expect: true },
  { name: 'register no name',   schema: registerSchema, input: { email: 'a@b.com', password: '12345678' }, expect: true },
  { name: 'register bad email', schema: registerSchema, input: { email: 'noemail', password: '12345678' }, expect: false },
  { name: 'register short pwd', schema: registerSchema, input: { email: 'a@b.com', password: '1234567' }, expect: false },
  { name: 'register no fields', schema: registerSchema, input: {}, expect: false },
  { name: 'login valid',        schema: loginSchema, input: { email: 'a@b.com', password: 'anything' }, expect: true },
  { name: 'login no pwd',       schema: loginSchema, input: { email: 'a@b.com', password: '' }, expect: false },
  { name: 'forgot valid',       schema: forgotPasswordSchema, input: { email: 'a@b.com' }, expect: true },
  { name: 'forgot bad email',   schema: forgotPasswordSchema, input: { email: 'no' }, expect: false },
  { name: 'reset valid',        schema: resetPasswordSchema, input: { access_token: 'tok', new_password: '12345678' }, expect: true },
  { name: 'reset short pwd',    schema: resetPasswordSchema, input: { access_token: 'tok', new_password: 'x' }, expect: false },
  { name: 'nutrition empty',    schema: nutritionPlanSchema, input: {}, expect: true },
  { name: 'nutrition full',     schema: nutritionPlanSchema, input: { name: 'Cut 1800', data_json: { meals: [{a:1}] } }, expect: true },
  { name: 'nutrition bad json', schema: nutritionPlanSchema, input: { data_json: 'not an object' }, expect: false },
  { name: 'training empty',     schema: trainingProgramSchema, input: {}, expect: true },
  { name: 'training full',      schema: trainingProgramSchema, input: { name: 'PPL', data_json: { days: [] } }, expect: true },
];

let pass = 0, fail = 0;
for (const t of tests) {
  const r = t.schema.safeParse(t.input);
  const got = r.success;
  if (got === t.expect) { pass++; console.log(`OK   ${t.name}`); }
  else { fail++; console.log(`FAIL ${t.name} (expected ${t.expect} got ${got})`); if (!r.success) console.log('  ', r.error.issues[0]?.message); }
}
console.log(`\n${pass}/${tests.length} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
