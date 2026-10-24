import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import app from "../src/app.js";
import Task from "../src/models/Task.js";

let server;
let baseUrl;
let createdTaskId;

before(async () => {
  const uri = process.env.MONGODB_URI;
  assert.ok(uri, "MONGODB_URI must point to a test database");

  const databaseName = uri.match(/\/([^/?]+)(?:\?|$)/)?.[1] ?? "";
  assert.match(
    databaseName,
    /(?:^|[_-])test$/i,
    "Refusing to run API tests against a database not named test"
  );

  await mongoose.connect(uri);
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  try {
    if (createdTaskId) {
      await Task.findByIdAndDelete(createdTaskId);
    }
  } finally {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
    await mongoose.disconnect();
  }
});

test("tasks API supports create, read, update, validation, and delete", async () => {
  const healthResponse = await fetch(`${baseUrl}/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: "ok", database: "connected" });

  const invalidCreateResponse = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "A title is required" })
  });
  assert.equal(invalidCreateResponse.status, 400);

  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `API test task ${Date.now()}`,
      description: "Created by the API integration test"
    })
  });
  assert.equal(createResponse.status, 201);
  const createdTask = await createResponse.json();
  createdTaskId = createdTask._id;
  assert.ok(createdTaskId);
  assert.equal(createdTask.completed, false);

  const listResponse = await fetch(`${baseUrl}/tasks`);
  assert.equal(listResponse.status, 200);
  const tasks = await listResponse.json();
  assert.ok(tasks.some((task) => task._id === createdTaskId));

  const invalidUpdateResponse = await fetch(`${baseUrl}/tasks/not-an-object-id`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true })
  });
  assert.equal(invalidUpdateResponse.status, 400);

  const updateResponse = await fetch(`${baseUrl}/tasks/${createdTaskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Updated API test task", completed: true })
  });
  assert.equal(updateResponse.status, 200);
  const updatedTask = await updateResponse.json();
  assert.equal(updatedTask.title, "Updated API test task");
  assert.equal(updatedTask.completed, true);

  const deleteResponse = await fetch(`${baseUrl}/tasks/${createdTaskId}`, { method: "DELETE" });
  assert.equal(deleteResponse.status, 204);

  const missingDeleteResponse = await fetch(`${baseUrl}/tasks/${createdTaskId}`, {
    method: "DELETE"
  });
  assert.equal(missingDeleteResponse.status, 404);
  createdTaskId = undefined;
});
