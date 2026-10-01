// Minimal static file server for local preview: node serve.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5210;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".mp4": "video/mp4",
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const rel = url === "/" ? "index.html" : url.replace(/^\/+/, "");
    const file = path.join(ROOT, rel);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        // Serve the real 404 document so local preview matches production, and
        // still send a 404 status so nothing treats it as a soft 404.
        fs.readFile(path.join(ROOT, "404.html"), (e2, page) => {
          res.writeHead(404, { "Content-Type": e2 ? "text/plain" : TYPES[".html"] });
          res.end(e2 ? "Not found" : page);
        });
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Serving ${ROOT} on http://localhost:${PORT}`));
