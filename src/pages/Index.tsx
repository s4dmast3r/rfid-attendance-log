import { useCallback, useState } from "react";
import { AttendanceHeader } from "@/components/attendance/AttendanceHeader";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { PresentUsers } from "@/components/attendance/PresentUsers";
import UserRegistration from "@/components/attendance/UserRegistration";
import { AttendanceProvider } from "@/components/attendance/AttendanceProvider";

// 👇 NUEVO: hook del stream SSE y toast
import { useCardStream } from "@/hooks/useCardStream";
import { toast } from "sonner";

type LastEvent = {
  uid: string;
  user?: { id: number; name: string };
  direction?: "IN" | "OUT";
  ts?: string;
};

const Index = () => {
  // 👇 NUEVO: guardamos el último evento para mostrarlo en un card discreto
  const [last, setLast] = useState<LastEvent | null>(null);

  // 👇 NUEVO: cuando el backend registra asistencia (tarjeta conocida)
  const onAttendance = useCallback((e: LastEvent) => {
    setLast(e);
    // Toast bonito (ya tienes <Toaster/> y Sonner montados en App)
    toast.success(
      `${e.user?.name ?? "Usuario"} ${e.direction === "IN" ? "entró" : "salió"}`,
      { description: `UID ${e.uid}${e.ts ? ` • ${e.ts}` : ""}` }
    );

    // Si tus tablas dependen de React Query o SWR, aquí podrías invalidar queries
    // (ej. queryClient.invalidateQueries([...])).
  }, []);

  // 👇 NUEVO: cuando llega un UID desconocido
  const onUnknown = useCallback((e: LastEvent) => {
    setLast(e);
    toast.warning("UID no registrado", { description: e.uid });
  }, []);

  // 👇 NUEVO: suscribirse al stream del backend (/api/stream)
  useCardStream(onAttendance, onUnknown);

  return (
    <AttendanceProvider>
      <div className="min-h-screen dashboard-bg">
        <AttendanceHeader />

        {/* 👇 NUEVO: tirita/aviso del último evento (opcional y no intrusivo) */}
        {last && (
          <div className="container mx-auto px-4 mt-4">
            <div className="rounded-md border bg-card p-3 card-elevated">
              <p className="text-sm text-muted-foreground">
                Último evento:&nbsp;
                <span className="font-medium text-foreground">
                  {last.user?.name ?? "UID no registrado"}
                </span>
                &nbsp;({last.uid})
                {last.direction && (
                  <>
                    &nbsp;→&nbsp;
                    <span
                      className={
                        last.direction === "IN"
                          ? "attendance-badge-in"
                          : "attendance-badge-out"
                      }
                    >
                      {last.direction}
                    </span>
                  </>
                )}
                {last.ts && <span className="ml-2 text-xs opacity-70">{last.ts}</span>}
              </p>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Filters and Attendance Table */}
            <div className="lg:col-span-2 space-y-6">
              <AttendanceFilters />
              <AttendanceTable />
            </div>

            {/* Right column - Present Users and Registration */}
            <div className="space-y-6">
              <PresentUsers />
              <UserRegistration />
            </div>
          </div>
        </main>

        <footer className="border-t bg-card py-4">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground">
              Zona horaria: America/Bogotá • © Control de Asistencias
            </p>
          </div>
        </footer>
      </div>
    </AttendanceProvider>
  );
};

export default Index;
