import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, resolve, sep } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch (error) {
    console.warn("Invalid request URL:", error.message);
    response.writeHead(400).end("Bad request");
    return;
  }
  if (pathname.split(/[/\\]/u).some((part) => part.startsWith("."))) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      response.writeHead(404).end("Not found");
      return;
    }
    console.error("Static file error:", error);
    response.writeHead(500).end("File read error");
  }
});
server.on("error", (error) => {
  console.error("Unable to start local preview:", error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Local preview: http://127.0.0.1:${port}`);
});
