export const config = {
  runtime: "nodejs"
};

import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export default async function handler(req, res) {
  // URL correct parsen (Vercel-style)
  const url = new URL(req.url, `https://${req.headers.host}`);
  const status = url.searchParams.get("status") || "404";

  // Correct pad naar gate.html (serverless bundle)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "..", "gate.html");

  // Logging object
  const log = {
    timestamp: new Date().toISOString(),
    status,
    path: req.url,
    ip: req.headers["x-forwarded-for"] || "unknown"
  };

  console.log("GATE_LOG", log);

  // KV logging
  try {
    await kv.incr("gate:total");
    await kv.incr(`gate:status:${status}`);
    await kv.lpush("gate:events", JSON.stringify(log));
    await kv.ltrim("gate:events", 0, 499);
  } catch (e) {
    console.error("KV_WRITE_FAIL", e.message);
  }

  // HTML template laden
  let html = fs.readFileSync(filePath, "utf8");

  const messages = {
    "403": {
      title: "🔐 403 · Autorisatie Vereist",
      text: "Deze module is aanwezig, maar niet ontsloten binnen jouw huidige autorisatie."
    },
    "404": {
      title: "🛠️ 404 · Upgrade Vereist",
      text: "Deze route bestaat nog niet binnen de huidige resonantie-laag."
    },
    "451": {
      title: "⚖️ 451 · Toegang Wettelijk Beperkt",
      text: "Deze inhoud is juridisch afgeschermd en tijdelijk niet beschikbaar."
    },
    "503": {
      title: "⏳ 503 · Dienst Tijdelijk Onbeschikbaar",
      text: "Deze service is tijdelijk offline wegens onderhoud of audit."
    }
  };

  const msg = messages[status] || messages["404"];

  html = html
    .replace("{{TITLE}}", msg.title)
    .replace("{{TEXT}}", msg.text);

  res.status(Number(status));
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}
