// Startup file for cPanel "Setup Node.js App" (Phusion Passenger) and any plain Node host.
// Usage: set "Application startup file" to server.js.  Locally you can also run: node server.js
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const { createServer } = require("http");
const next = require("next");

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => console.log(`Jasmonoide running on ${port}`));
}).catch((e) => { console.error(e); process.exit(1); });
