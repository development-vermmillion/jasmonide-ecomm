# Hosting on cPanel (Node.js)

Needs a cPanel with **Setup Node.js App** (Node 18 or newer). If you don't see it, ask your host to enable it.

## 1. Build on your own computer (recommended — shared hosts often run out of memory while building)
```
npm install
npm run build
```

## 2. Upload with FTP (FileZilla etc.)
Create a folder next to `public_html`, e.g. `jasmonoide` (not inside `public_html`), and upload:

- the `.next` folder
- `public` (if it exists), `scripts`, `package.json`, `package-lock.json`, `next.config.js`, `server.js`
- an empty `data` folder and an empty `uploads` folder

Do **not** upload `node_modules`, `.git`, or your local `data/store.db`.

## 3. Create the app in cPanel → Setup Node.js App
- Node version: 18 or higher (20 is ideal)
- Application mode: **Production**
- Application root: `jasmonoide`
- Application URL: your domain (or a sub-domain such as `shop.yourdomain.com`)
- Application startup file: `server.js`

Add these **environment variables**:

| Name | Value |
|---|---|
| `ADMIN_EMAIL` | your admin login email |
| `ADMIN_PASSWORD` | a strong password (used the first time the database is created) |
| `AUTH_SECRET` | any long random text (30+ characters) |
| `INSECURE_COOKIES` | `1` only if you open the site on plain `http://` — leave out when you have SSL |

## 4. Install and start
Click **Run NPM Install**, then **Start / Restart**. Open your domain — the first visit creates the database with sample data.

Then log in at `/admin`, change the password, and replace the demo products.

## 5. SSL
cPanel → **SSL/TLS Status** → run AutoSSL for the domain (free).

## Updating later
Build locally, upload the new `.next` folder (and any changed files), then **Restart** the app in cPanel.
Never overwrite the server's `data/` and `uploads/` folders — they hold your orders and images.

## If something fails
- *"Cannot find module"* → run NPM Install again.
- *libsql / native module error on install* → the host blocks the database library. Use a small VPS or Render/Railway instead (see README), or ask your host to allow it.
- *503 / app won't start* → cPanel → Node app → open the log (`stderr.log`) and send it to me.
