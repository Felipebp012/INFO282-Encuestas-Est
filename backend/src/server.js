import http from "node:http";
import { encuestaSchema } from "./encuestas/schema.js";
import * as repository from "./encuestas/repository.js";

const port = Number(process.env.PORT ?? 4009);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("Solicitud demasiado grande"));
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("El cuerpo JSON no es válido"));
      }
    });
    request.on("error", reject);
  });
}

function getId(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 ? parts[1] : null;
}

async function handleRequest(request, response) {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  if (url.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (!url.pathname.startsWith("/encuestas")) {
    sendJson(response, 404, { error: "Ruta no encontrada" });
    return;
  }

  const id = getId(url.pathname);
  if (request.method === "GET") {
    const encuesta = id
      ? await repository.obtenerEncuesta(id)
      : await repository.obtenerEncuestas();
    if (id && !encuesta) {
      sendJson(response, 404, { error: "Encuesta no encontrada" });
      return;
    }
    sendJson(response, 200, encuesta ?? []);
    return;
  }

  if (request.method === "POST" && !id) {
    const parsed = encuestaSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      return;
    }
    sendJson(response, 201, await repository.crearEncuesta(parsed.data));
    return;
  }

  if (request.method === "PUT" && id) {
    const parsed = encuestaSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      return;
    }
    sendJson(response, 200, await repository.actualizarEncuesta(id, parsed.data));
    return;
  }

  if (request.method === "DELETE" && id) {
    await repository.eliminarEncuesta(id);
    sendJson(response, 204, {});
    return;
  }

  sendJson(response, 405, { error: "Método no permitido" });
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    const status = error.code === "P2025" ? 404 : 500;
    sendJson(response, status, {
      error: status === 404 ? "Encuesta no encontrada" : "Error interno del servidor",
    });
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Backend escuchando en el puerto ${port}`);
});