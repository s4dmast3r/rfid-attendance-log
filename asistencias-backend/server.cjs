// server.cjs - Backend Node.js (Express + SQLite + Serial) - CommonJS

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // opcional si pones assets estáticos

// -------------------------
// BD SQLite
// -------------------------
const db = new Database("asistencias.db");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  card_uid TEXT UNIQUE NOT NULL,
  active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  direction TEXT CHECK(direction IN ('IN','OUT')) NOT NULL,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

const getUserByUID = db.prepare("SELECT * FROM users WHERE card_uid = ? AND active = 1");
const insertAttendance = db.prepare("INSERT INTO attendance (user_id, direction) VALUES (?, ?)");
const getLastDirection = db.prepare(`
  SELECT direction FROM attendance WHERE user_id = ? ORDER BY ts DESC LIMIT 1
`);
const getLastEvent = db.prepare(`
  SELECT direction, ts
  FROM attendance
  WHERE user_id = ?
  ORDER BY ts DESC
  LIMIT 1
`);

function nextDirectionFor(userId) {
  const row = getLastDirection.get(userId);
  if (!row) return "IN";
  return row.direction === "IN" ? "OUT" : "IN";
}

// -------------------------
// Anti-rebote backend
// -------------------------
const MIN_GAP_SEC = 3;        // cool-down por usuario (ajusta 3–5s si quieres)
const burstSeen = new Map();  // uid -> lastMs

function tooSoonBurst(uid) {
  const now = Date.now();
  const last = burstSeen.get(uid) || 0;
  if (now - last < 800) return true; // ignora ráfagas < 0.8s
  burstSeen.set(uid, now);
  return false;
}

// -------------------------
// SSE (Server-Sent Events)
// -------------------------
const sseClients = new Set();

function sseBroadcast(eventName, dataObj) {
  const payload = `event: ${eventName}\n` + `data: ${JSON.stringify(dataObj)}\n\n`;
  for (const res of sseClients) res.write(payload);
}

app.get("/api/stream", (req, res) => {
  // Mantener la conexión viva para SSE
  req.socket.setTimeout(0);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  res.write(`event: ping\ndata: "connected"\n\n`);

  const keepAlive = setInterval(() => {
    res.write(`event: ping\ndata: "keepalive"\n\n`);
  }, 15000);

  sseClients.add(res);
  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// -------------------------
// API REST
// -------------------------
app.post("/api/users", (req, res) => {
  const { name, card_uid } = req.body || {};
  if (!name || !card_uid) return res.status(400).json({ error: "name y card_uid requeridos" });
  try {
    const info = db
      .prepare("INSERT INTO users (name, card_uid) VALUES (?, ?)")
      .run(String(name).trim(), String(card_uid).trim().toUpperCase());
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/attendance", (req, res) => {
  const { date, from = "00:00", to = "23:59" } = req.query;
  if (!date) return res.status(400).json({ error: "date requerido (YYYY-MM-DD)" });
  const rows = db
    .prepare(
      `
      SELECT a.id, u.name, u.card_uid, a.direction, a.ts
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      WHERE date(a.ts) = ? AND time(a.ts) BETWEEN ? AND ?
      ORDER BY a.ts ASC
    `
    )
    .all(date, from, to);
  res.json(rows);
});

app.get("/api/present", (req, res) => {
  const rows = db
    .prepare(
      `
      WITH last_dir AS (
        SELECT user_id,
               (SELECT direction FROM attendance a2
                WHERE a2.user_id = a.user_id ORDER BY ts DESC LIMIT 1) AS dir
        FROM attendance a
        GROUP BY user_id
      )
      SELECT u.id, u.name, u.card_uid
      FROM users u
      JOIN last_dir l ON l.user_id = u.id
      WHERE l.dir = 'IN' AND u.active = 1
    `
    )
    .all();
  res.json(rows);
});

// Salud simple
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// -------------------------
// Serial
// -------------------------
const SERIAL_PATH = process.env.SERIAL_PATH || "COM3"; // ¡pásalo por env! (COM5 en tu PC)
const SERIAL_BAUD = parseInt(process.env.SERIAL_BAUD || "115200", 10);

let port;
try {
  port = new SerialPort({ path: SERIAL_PATH, baudRate: SERIAL_BAUD });
} catch (e) {
  console.error("No se pudo abrir el puerto serial:", e.message);
}

if (port) {
  port.on("open", () => console.log(`Serial abierto en ${SERIAL_PATH} @${SERIAL_BAUD}`));
  port.on("error", (e) => console.error("Error serial:", e.message));

  // Arduino en Windows suele mandar CRLF -> "\r\n"
  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  // DEBUG crudo (descomenta si necesitas ver bytes/lineas que llegan)
  port.on("data", (buf) => {
   console.log("RAW BYTES:", buf.toString("hex"), "| TEXT:", JSON.stringify(buf.toString()));
  });
    parser.on("data", (line) => {
  console.log("LINE:", JSON.stringify(line));
  });

  // Extraer UID en HEX (con o sin ':')
  const HEX_UID_RE = /([0-9A-F]{2})(?::[0-9A-F]{2}){3,10}|[0-9A-F]{8,}/i;
  function extractUid(line) {
    const m = String(line).toUpperCase().match(HEX_UID_RE);
    return m ? m[0].replace(/[^0-9A-F]/g, "") : null; // HEX sin separadores ni \r
  }

  parser.on("data", (line) => {
    const uid = extractUid(line);
    if (!uid) return;

    // Filtro anti-ráfaga del mismo UID
    if (tooSoonBurst(uid)) return;

    const user = getUserByUID.get(uid);
    if (!user) {
      console.log(`UID no registrado: ${uid}`);
      sseBroadcast("unknown", { uid, ts: Date.now() });
      return;
    }

    // Cool-down por usuario (evita ping-pong IN/OUT)
    const last = getLastEvent.get(user.id);
    if (last) {
      const lastTs = new Date(last.ts).getTime();
      const deltaSec = (Date.now() - lastTs) / 1000;
      if (deltaSec < MIN_GAP_SEC) return;
    }

    const dir = nextDirectionFor(user.id);
    insertAttendance.run(user.id, dir);

    const event = {
      uid,
      user: { id: user.id, name: user.name },
      direction: dir,
      ts: new Date().toISOString().replace("T", " ").slice(0, 19),
    };
    console.log(`Asistencia registrada: ${user.name} -> ${dir}`);
    sseBroadcast("attendance", event);
  });
} else {
  console.error("⚠️ El puerto serial no se abrió. Revisa SERIAL_PATH/BAUD o si otro programa lo ocupa.");
}

// -------------------------
// HTTP
// -------------------------
const HTTP_PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(HTTP_PORT, () => console.log(`API http://localhost:${HTTP_PORT}`));
