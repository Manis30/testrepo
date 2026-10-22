import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import healthRouter from './health.js';
import tasksRouter from './tasks.js';
import { notFound, errorHandler } from './errors.js';

const app = express();

const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: origins?.length ? origins : true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health checks are left outside the rate limiter so monitors never get blocked
app.use('/health', healthRouter);

app.use('/api', rateLimit({ windowMs: 60_000, limit: 100 }));
app.get('/api', (req, res) => {
  res.json({ name: 'express-backend', version: '1.0.0' });
});
app.use('/api/tasks', tasksRouter);

app.use(notFound);
app.use(errorHandler);

export default app;