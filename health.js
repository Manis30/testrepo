import { Router } from 'express';

const router = Router();

// Liveness: is the process running?
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Readiness: add real dependency checks here later (DB, Redis, agent service)
router.get('/ready', (req, res) => {
  res.json({ status: 'ready', checks: {} });
});

export default router;