import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import managerRoutes from './routes/manager.js';
import clientRoutes from './routes/client.js';
import messageRoutes from './routes/messages.js';
import checkInRoutes from './routes/check_ins.js';

const app = express();
const PORT = Number(process.env.PORT) || 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/check-ins', checkInRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
