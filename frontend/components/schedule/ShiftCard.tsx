import { Shift } from "@/types/shift";

interface ShiftCardProps {
  shift: Shift;
}

export function ShiftCard({ shift }: ShiftCardProps) {
  return (
    <div>
      <span>{shift.employeeName}</span>
      <span>{shift.startTime} – {shift.endTime}</span>
    </div>
  );
}
