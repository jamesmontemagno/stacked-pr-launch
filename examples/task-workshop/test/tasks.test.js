import test from "node:test";
import assert from "node:assert/strict";
import { createTaskStore } from "../src/tasks.js";

test("adds and completes a task", () => {
  const store = createTaskStore();
  const task = store.add("Review the stack");

  assert.equal(store.all().length, 1);
  assert.equal(store.complete(task.id).done, true);
});

test("rejects an empty title", () => {
  const store = createTaskStore();
  assert.throws(() => store.add("  "), /title is required/);
});
