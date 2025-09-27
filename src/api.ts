// src/api.ts
export type AttendanceRow = {
  id: number;
  name: string;
  card_uid: string;
  direction: "IN" | "OUT";
  ts: string; // "YYYY-MM-DD HH:MM:SS"
};

export type PresentRow = { id: number; name: string; card_uid: string };

async function handle(r: Response) {
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as any).error || `HTTP ${r.status}`);
  return data;
}

export async function getAttendance(date: string, from: string, to: string) {
  const r = await fetch(`/api/attendance?date=${date}&from=${from}&to=${to}`);
  return handle(r) as Promise<AttendanceRow[]>;
}

export async function getPresent() {
  const r = await fetch(`/api/present`);
  return handle(r) as Promise<PresentRow[]>;
}

export async function registerUser(name: string, card_uid: string) {
  const r = await fetch(`/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim(),
      card_uid: card_uid.trim().toUpperCase(),
    }),
  });
  return handle(r) as Promise<{ id: number }>;
}
