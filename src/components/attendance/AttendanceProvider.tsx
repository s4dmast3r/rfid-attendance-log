import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface AttendanceRecord {
  id: number;
  name: string;
  card_uid: string;
  direction: "IN" | "OUT";
  ts: string;
}

export interface PresentUser {
  id: number;
  name: string;
  card_uid: string;
}

interface AttendanceContextType {
  // Attendance data
  attendanceRecords: AttendanceRecord[];
  attendanceLoading: boolean;
  attendanceError: string | null;
  
  // Present users data
  presentUsers: PresentUser[];
  presentLoading: boolean;
  presentError: string | null;
  
  // Server status
  serverStatus: 'online' | 'offline' | 'unknown';
  
  // Actions
  searchAttendance: (date: string, from: string, to: string) => Promise<void>;
  refreshPresent: () => Promise<void>;
  registerUser: (name: string, cardUid: string) => Promise<void>;
  checkServerStatus: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider");
  }
  return context;
};

const API_BASE = "http://localhost:3000/api";

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([]);
  const [presentLoading, setPresentLoading] = useState(false);
  const [presentError, setPresentError] = useState<string | null>(null);
  
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  // API Functions
  const searchAttendance = useCallback(async (date: string, from: string, to: string) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    
    try {
      const response = await fetch(`${API_BASE}/attendance?date=${date}&from=${from}&to=${to}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error de conexión' }));
        throw new Error(errorData.error || 'Error cargando asistencias');
      }
      
      const data = await response.json();
      setAttendanceRecords(data);
      setServerStatus('online');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      setAttendanceError(errorMessage);
      setServerStatus('offline');
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAttendanceLoading(false);
    }
  }, [toast]);

  const refreshPresent = useCallback(async () => {
    setPresentLoading(true);
    setPresentError(null);
    
    try {
      const response = await fetch(`${API_BASE}/present`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error de conexión' }));
        throw new Error(errorData.error || 'Error cargando presentes');
      }
      
      const data = await response.json();
      setPresentUsers(data);
      setServerStatus('online');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      setPresentError(errorMessage);
      setServerStatus('offline');
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPresentLoading(false);
    }
  }, [toast]);

  const registerUser = useCallback(async (name: string, cardUid: string) => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          card_uid: cardUid.trim().toUpperCase(),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo registrar el usuario');
      }

      toast({
        title: "Éxito",
        description: `Usuario creado (#${data.id})`,
      });
      
      setServerStatus('online');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
      setServerStatus('offline');
      throw new Error(errorMessage);
    }
  }, [toast]);

  const checkServerStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/present`);
      setServerStatus(response.ok ? 'online' : 'offline');
    } catch {
      setServerStatus('offline');
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkServerStatus();
    refreshPresent();
  }, [checkServerStatus, refreshPresent]);

  const value: AttendanceContextType = {
    attendanceRecords,
    attendanceLoading,
    attendanceError,
    presentUsers,
    presentLoading,
    presentError,
    serverStatus,
    searchAttendance,
    refreshPresent,
    registerUser,
    checkServerStatus,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};