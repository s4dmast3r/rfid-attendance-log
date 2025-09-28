import { useEffect } from "react";

type AttendanceEvent = {
  uid: string;
  user?: { id: number; name: string };
  direction?: "IN" | "OUT";
  ts?: string;
};

export function useCardStream(
  onAttendance: (e: AttendanceEvent) => void,
  onUnknown?: (e: AttendanceEvent) => void
) {
  useEffect(() => {
    const es = new EventSource("/api/stream"); // via proxy

    es.addEventListener("attendance", (evt) => {
      const data = JSON.parse((evt as MessageEvent).data) as AttendanceEvent;
      onAttendance?.(data);
    });

    es.addEventListener("unknown", (evt) => {
      const data = JSON.parse((evt as MessageEvent).data) as AttendanceEvent;
      onUnknown?.(data);
    });

    es.addEventListener("ping", () => {});
    es.onerror = () => {};

    return () => es.close();
  }, [onAttendance, onUnknown]);
}
