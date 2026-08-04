import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createTaskStore } from "./src/tasks.js";

const store = createTaskStore();
store.add("Review the model pull request");

export const server = createServer(async (request, response) => {
  response.setHeader("content-type", "application/json");

  if (request.method === "GET" && request.url === "/") {
    response.setHeader("content-type", "text/html");
    return response.end(await readFile("public/index.html", "utf8"));
  }

  if (request.method === "GET" && request.url === "/api/tasks") {
    return response.end(JSON.stringify(store.all()));
  }

  if (request.method === "POST" && request.url === "/api/tasks") {
    let body = "";
    for await (const chunk of request) body += chunk;

    try {
      const task = store.add(JSON.parse(body).title);
      response.writeHead(201);
      return response.end(JSON.stringify(task));
    } catch (error) {
      response.writeHead(400);
      return response.end(JSON.stringify({ error: error.message }));
    }
  }

  response.writeHead(404);
  response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(3000, () => console.log("Task API: http://localhost:3000"));
