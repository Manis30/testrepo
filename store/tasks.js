import { randomUUID } from 'node:crypto';

// In-memory store: data is lost when the server restarts.
const tasks = new Map();

export const taskStore = {
  list({ status, page, limit }) {
    let items = [...tasks.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (status) items = items.filter((t) => t.status === status);
    const total = items.length;
    return { items: items.slice((page - 1) * limit, page * limit), total };
  },

  get(id) {
    return tasks.get(id) ?? null;
  },

  create({ title, description = '', status = 'todo' }) {
    const now = new Date().toISOString();
    const task = { id: randomUUID(), title, description, status, createdAt: now, updatedAt: now };
    tasks.set(task.id, task);
    return task;
  },

  update(id, data) {
    const task = tasks.get(id);
    if (!task) return null;
    const updated = { ...task, ...data, updatedAt: new Date().toISOString() };
    tasks.set(id, updated);
    return updated;
  },

  remove(id) {
    return tasks.delete(id);
  },
};