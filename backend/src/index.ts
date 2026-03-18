import express from "express";
import cors from "cors";
import { employeeRoutes } from "./routes/employees";
import { scheduleRoutes } from "./routes/schedules";
import { shiftRequirementRoutes } from "./routes/shiftRequirements";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.use("/api/employees", employeeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/shift-requirements", shiftRequirementRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
