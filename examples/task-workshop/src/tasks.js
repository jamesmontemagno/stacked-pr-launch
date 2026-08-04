export function createTaskStore() {
  const tasks = [];

  return {
    all: () => [...tasks],
    add(title) {
      const cleanTitle = title?.trim();
      if (!cleanTitle) throw new Error("A task title is required");
      const task = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        done: false
      };
      tasks.push(task);
      return task;
    },
    complete(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) throw new Error("Task not found");
      task.done = true;
      return task;
    }
  };
}
