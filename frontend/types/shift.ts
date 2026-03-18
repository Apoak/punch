export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  date: string;   // ISO date string
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface ShiftRequirement {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  minStaff: number;
  roles?: string[];
}
