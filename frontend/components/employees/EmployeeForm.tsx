"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Employee } from "@/types/employee";

interface EmployeeFormProps {
  initial?: Partial<Employee>;
  onSubmit: (data: Omit<Employee, "id">) => Promise<void>;
}

export function EmployeeForm({ initial = {}, onSubmit }: EmployeeFormProps) {
  const [name, setName] = useState(initial.name ?? "");
  const [role, setRole] = useState(initial.role ?? "");
  const [hoursPerWeek, setHoursPerWeek] = useState(initial.hoursPerWeek ?? 40);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, role, hoursPerWeek });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" required />
      <input
        type="number"
        value={hoursPerWeek}
        onChange={(e) => setHoursPerWeek(Number(e.target.value))}
        min={1}
        max={60}
      />
      <Button type="submit" loading={loading}>Save</Button>
    </form>
  );
}
