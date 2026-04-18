import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import socialRoutes from './routes/socialRoutes';
import accountRoutes from './routes/accountRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import loanRoutes from './routes/loanRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { authMiddleware } from './middlewares/auth';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'finhub-api' });
});

// Auth endpoints (Public)
app.use('/api/auth', authRoutes);

// Protected Core Endpoints
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api/accounts', authMiddleware, accountRoutes);
app.use('/api/schedules', authMiddleware, scheduleRoutes);
app.use('/api/loans', authMiddleware, loanRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

const PORT = process.env.PORT || 4000;

export const server = app.listen(PORT, () => {
  console.log(`🚀 FinHub API Server running on port ${PORT}`);
});

export default app;
