import { Router } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

router.get("/", async (_request, response, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    response.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const task = await Task.create({
      title: request.body.title,
      description: request.body.description
    });
    response.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      error.status = 400;
    }
    next(error);
  }
});

router.patch("/:id", async (request, response, next) => {
  if (!isValidId(request.params.id)) {
    return response.status(400).json({ error: "Invalid task id" });
  }

  const updates = {};
  for (const field of ["title", "description", "completed"]) {
    if (Object.hasOwn(request.body, field)) {
      updates[field] = request.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return response.status(400).json({ error: "Provide at least one task field to update" });
  }

  try {
    const task = await Task.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!task) {
      return response.status(404).json({ error: "Task not found" });
    }
    response.json(task);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  if (!isValidId(request.params.id)) {
    return response.status(400).json({ error: "Invalid task id" });
  }

  try {
    const task = await Task.findByIdAndDelete(request.params.id);
    if (!task) {
      return response.status(404).json({ error: "Task not found" });
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
