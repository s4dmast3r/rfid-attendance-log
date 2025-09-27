import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, RefreshCw, AlertCircle, UserX } from "lucide-react";
import { useAttendance } from "./AttendanceProvider";

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export const PresentUsers: React.FC = () => {
  const { presentUsers, presentLoading, presentError, refreshPresent } = useAttendance();

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Presentes Ahora
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPresent}
            disabled={presentLoading}
          >
            <RefreshCw className={`h-4 w-4 ${presentLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {presentLoading && <LoadingSkeleton />}
        
        {presentError && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <h3 className="font-medium">Error al cargar</h3>
              <p className="text-sm text-muted-foreground mt-1">{presentError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={refreshPresent}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}
        
        {!presentLoading && !presentError && presentUsers.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <UserX className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Nadie presente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No hay personas registradas como presentes actualmente.
              </p>
            </div>
          </div>
        )}
        
        {!presentLoading && !presentError && presentUsers.length > 0 && (
          <div className="space-y-3">
            {presentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-in text-status-in-foreground">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {user.card_uid}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};