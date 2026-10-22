import { Router } from 'express';
import { z } from 'zod';
import { taskStore } from './store/tasks.js';

const router = Router();

const STATUSES = ['todo', 'in_progress', 'done'];

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(STATUSES).optional(),
});
const updateSchema = createSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: 'Provide at least one field to update',
});

// GET /api/tasks?status=todo&page=1&limit=20
router.get('/', (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;

  const { items, total } = taskStore.list({ status, page, limit });
  res.json({ items, page, limit, total });
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const task = taskStore.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /api/tasks
router.post('/', (req, res) => {
  const data = createSchema.parse(req.body);
  res.status(201).json(taskStore.create(data));
});

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  const data = updateSchema.parse(req.body);
  const task = taskStore.update(req.params.id, data);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  if (!taskStore.remove(req.params.id)) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

export default router;