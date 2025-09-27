import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, FileX } from "lucide-react";
import { useAttendance } from "./AttendanceProvider";

const AttendanceBadge: React.FC<{ direction: "IN" | "OUT" }> = ({ direction }) => {
  if (direction === "IN") {
    return <span className="attendance-badge-in">ENTRADA</span>;
  }
  return <span className="attendance-badge-out">SALIDA</span>;
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const AttendanceTable: React.FC = () => {
  const { attendanceRecords, attendanceLoading, attendanceError, searchAttendance } = useAttendance();

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const handleRetry = () => {
    // Get current filter values and retry
    const today = new Date().toISOString().split('T')[0];
    searchAttendance(today, "07:00", "18:00");
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registros de Asistencia</CardTitle>
          <Badge variant="secondary" className="ml-2">
            {attendanceRecords.length} registros
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {attendanceLoading && <LoadingSkeleton />}
        
        {attendanceError && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="font-medium">Error al cargar registros</h3>
              <p className="text-sm text-muted-foreground mt-1">{attendanceError}</p>
            </div>
            <Button variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}
        
        {!attendanceLoading && !attendanceError && attendanceRecords.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <FileX className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-medium">No hay registros</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No se encontraron asistencias para el rango seleccionado.
              </p>
            </div>
          </div>
        )}
        
        {!attendanceLoading && !attendanceError && attendanceRecords.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Dirección</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={`${record.id}-${record.ts}`}>
                    <TableCell className="font-mono">
                      {formatTime(record.ts)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.card_uid}
                    </TableCell>
                    <TableCell>
                      <AttendanceBadge direction={record.direction} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};