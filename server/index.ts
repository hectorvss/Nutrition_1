import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import managerRoutes from './routes/manager.js';
import clientRoutes from './routes/client.js';
import messageRoutes from './routes/messages.js';
import checkInRoutes from './routes/check_ins.js';
import stripeRoutes from './routes/stripe.js';
import automationRoutes from './routes/automations.js';
import onboardingRoutes from './routes/onboarding.js';

const app = express();
const PORT = Number(process.env.PORT) || 3005;

// Middleware — CORS restringido a orígenes conocidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://nutrition-1-zeta.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (ej: curl, Postman en dev, serverless)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origen no permitido: ${origin}`));
    }
  },
  credentials: true,
}));

// IMPORTANT: Stripe Webhook needs the raw body for signature verification
// This must be defined BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

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
app.use('/api/onboarding', onboardingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Export for Vercel
export default app;

// Only listen if running directly (not as a serverless function)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}
