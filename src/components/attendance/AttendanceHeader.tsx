import React from "react";
import { Badge, Clock, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useAttendance } from "./AttendanceProvider";

export const AttendanceHeader: React.FC = () => {
  const { serverStatus } = useAttendance();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Badge className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Control de Asistencias</h1>
              <p className="text-sm text-muted-foreground">Sistema RFID de seguimiento</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {new Date().toLocaleString('es-CO', {
                  timeZone: 'America/Bogota',
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            
            <div className={`status-indicator status-indicator--${serverStatus}`}>
              {serverStatus === 'online' && <Wifi className="h-4 w-4" />}
              {serverStatus === 'offline' && <WifiOff className="h-4 w-4" />}
              {serverStatus === 'unknown' && <AlertCircle className="h-4 w-4" />}
              <span className="capitalize">{serverStatus === 'unknown' ? 'Verificando...' : serverStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};