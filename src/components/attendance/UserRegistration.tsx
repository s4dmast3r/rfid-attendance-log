import { useState } from "react";
import { registerUser } from "@/api";
import { normalizeUID, isValidUID } from "@/lib/uid";

export default function RegisterUserForm() {
  const [name, setName] = useState("");
  const [uidRaw, setUidRaw] = useState("");

  const norm = normalizeUID(uidRaw);
  const valid = isValidUID(norm) && name.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    await registerUser(name, norm); // <-- manda el UID normalizado
    setName("");
    setUidRaw("");
    // TODO: toast de éxito
  }

  return (
    <form onSubmit={onSubmit}>
      <label>Nombre completo</label>
      <input value={name} onChange={e => setName(e.target.value)} />

      <label>UID de la tarjeta</label>
      <input
        value={uidRaw}
        onChange={e => setUidRaw(e.target.value)}
        placeholder="Ej: 082A1062 o 08:2A:10:62"
      />

      {!isValidUID(norm) && uidRaw && (
        <p className="error">
          El UID debe ser hexadecimal; se aceptan pegados con ":" y se normaliza.
        </p>
      )}

      <button disabled={!valid}>Registrar usuario</button>
    </form>
  );
}
