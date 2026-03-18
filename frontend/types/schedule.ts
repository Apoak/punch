import { Shift } from "./shift";

export interface Schedule {
  id: string;
  weekStartDate: string;
  createdAt: string;
  shifts: Shift[];
}
