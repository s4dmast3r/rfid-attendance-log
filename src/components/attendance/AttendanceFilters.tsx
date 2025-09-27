import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertTriangle } from "lucide-react";
import { useAttendance } from "./AttendanceProvider";

export const AttendanceFilters: React.FC = () => {
  const { searchAttendance, attendanceLoading } = useAttendance();
  const [date, setDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [fromTime, setFromTime] = useState("07:00");
  const [toTime, setToTime] = useState("18:00");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateTimes = (from: string, to: string): boolean => {
    if (!from || !to) return false;
    return from <= to;
  };

  const handleSearch = async () => {
    setValidationError(null);
    
    if (!validateTimes(fromTime, toTime)) {
      setValidationError("La hora 'Desde' debe ser menor o igual a la hora 'Hasta'");
      return;
    }

    await searchAttendance(date, fromTime, toTime);
  };

  // Validation on input change
  useEffect(() => {
    if (fromTime && toTime && !validateTimes(fromTime, toTime)) {
      setValidationError("La hora 'Desde' debe ser menor o igual a la hora 'Hasta'");
    } else {
      setValidationError(null);
    }
  }, [fromTime, toTime]);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="filter-date">Fecha</Label>
            <Input
              id="filter-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filter-from">Desde</Label>
            <Input
              id="filter-from"
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filter-to">Hasta</Label>
            <Input
              id="filter-to"
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              required
            />
          </div>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {validationError}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleSearch} 
            disabled={attendanceLoading || !!validationError}
            className="w-full md:w-auto"
          >
            {attendanceLoading ? "Buscando..." : "Buscar Asistencias"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Selecciona la fecha y rango horario para consultar las asistencias.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};