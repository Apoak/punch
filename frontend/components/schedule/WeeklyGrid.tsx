import { Schedule } from "@/types/schedule";
import { ShiftCard } from "./ShiftCard";

interface WeeklyGridProps {
  schedule: Schedule;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyGrid({ schedule }: WeeklyGridProps) {
  return (
    <div>
      {DAYS.map((day) => (
        <div key={day}>
          <h3>{day}</h3>
          {schedule.shifts
            .filter((shift) => shift.day === day)
            .map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
        </div>
      ))}
    </div>
  );
}
