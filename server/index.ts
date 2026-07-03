import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Initialize Sentry before Express setup. Only active when SENTRY_DSN is set.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0.1,
  });
}
import authRoutes from './routes/auth.js';
import managerRoutes from './routes/manager.js';
import clientRoutes from './routes/client.js';
import messageRoutes from './routes/messages.js';
import checkInRoutes from './routes/check_ins.js';
import stripeRoutes from './routes/stripe.js';
import automationRoutes from './routes/automations.js';
import workflowRoutes from './routes/workflows.js';
import onboardingRoutes from './routes/onboarding.js';
import recipeRoutes from './routes/recipes.js';
import clientBillingRoutes from './routes/client-billing.js';
import coachWebhookRoutes from './routes/coach-webhook.js';

const app = express();
const PORT = Number(process.env.PORT) || 3005;

// Middleware — CORS restringido a orígenes conocidos
const frontendUrl = (process.env.FRONTEND_URL || 'https://nuly.app').replace(/\/+$/, '');
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nuly.app',
  'https://www.nuly.app',
  'https://nutrition-1-zeta.vercel.app',
  frontendUrl,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, serverless same-origin)
    if (!origin) return callback(null, true);
    // Strip trailing slash from origin before comparing
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origen no permitido: ${origin}`));
    }
  },
  credentials: true,
}));

// Rate limiting — protección contra brute-force y abuso
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Inténtalo de nuevo en 15 minutos.' },
  skip: (req) => req.path === '/api/health',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación. Inténtalo de nuevo en 15 minutos.' },
});

// Tighter limit on /setup (only used during initial onboarding) and /cron (called by scheduler).
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/setup', sensitiveLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/automations/cron', sensitiveLimiter);

// IMPORTANT: Stripe Webhooks need the raw body for signature verification.
// These must be defined BEFORE express.json(). The platform webhook handles
// manager→platform subscriptions; the coach webhook (per-coach signing secret)
// handles coach→client charges in real time.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use('/api/stripe/coach-webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/manager/client-billing', clientBillingRoutes);
app.use('/api/stripe/coach-webhook', coachWebhookRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler middleware (must be last)
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  // In production, never expose raw DB/ORM error messages (they can leak schema info).
  const isProduction = process.env.NODE_ENV === 'production';
  const safeMessage = isProduction
    ? (err.status < 500 ? err.message : 'Internal server error')
    : (err.message || 'Internal server error');
  res.status(err.status || 500).json({ error: safeMessage });
});

// Export for Vercel
export default app;

// Only listen if running directly (not as a serverless function)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}
