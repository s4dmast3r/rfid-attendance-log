import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useAttendance } from "./AttendanceProvider";

export const UserRegistration: React.FC = () => {
  const { registerUser } = useAttendance();
  const [name, setName] = useState("");
  const [cardUid, setCardUid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return false;
    }

    if (!cardUid.trim()) {
      setError("El UID es obligatorio");
      return false;
    }

    // Basic UID validation (should be hex-like)
    const uidPattern = /^[A-F0-9]+$/i;
    if (!uidPattern.test(cardUid.trim())) {
      setError("El UID debe contener solo caracteres hexadecimales (0-9, A-F)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await registerUser(name, cardUid);
      setSuccess("Usuario registrado exitosamente");
      setName("");
      setCardUid("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardUidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCardUid(value);
    setError(null);
    setSuccess(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError(null);
    setSuccess(null);
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Registrar Usuario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Nombre completo</Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Nombre y apellido"
              value={name}
              onChange={handleNameChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-uid">UID de la tarjeta</Label>
            <Input
              id="reg-uid"
              type="text"
              placeholder="A1B2C3D4"
              value={cardUid}
              onChange={handleCardUidChange}
              required
              disabled={isSubmitting}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              UID en formato hexadecimal y mayúsculas (ej: A1B2C3D4)
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !name.trim() || !cardUid.trim()}
          >
            {isSubmitting ? "Registrando..." : "Registrar Usuario"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-status-in bg-status-in/10 text-status-in">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};