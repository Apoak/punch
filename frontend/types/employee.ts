export interface Employee {
  id: string;
  name: string;
  role: string;
  hoursPerWeek: number;
  availability?: DayAvailability[];
}

export interface DayAvailability {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  available: boolean;
  earliestStart?: string; // HH:mm
  latestEnd?: string;     // HH:mm
}
