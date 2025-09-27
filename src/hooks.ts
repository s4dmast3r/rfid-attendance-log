import { useEffect, useState } from "react";
import { AttendanceRow, PresentRow, getAttendance, getPresent } from "./api";

export function useAttendance(date: string, from: string, to: string) {
  const [data, setData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const rows = await getAttendance(date, from, to);
      setData(rows);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // carga bajo demanda (desde botón) o auto si prefieres
  }, [date, from, to]);

  return { data, loading, error, reload: load };
}

export function usePresent(auto = false) {
  const [data, setData] = useState<PresentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const rows = await getPresent();
      setData(rows);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auto) load();
  }, [auto]);

  return { data, loading, error, reload: load };
}
