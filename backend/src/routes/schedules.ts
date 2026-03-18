import { Router } from "express";
import { ScheduleService } from "../services/scheduleService";

export const scheduleRoutes = Router();
const service = new ScheduleService();

scheduleRoutes.get("/", async (_req, res) => {
  const schedules = await service.getAll();
  res.json({ schedules });
});

scheduleRoutes.get("/:weekId", async (req, res) => {
  const schedule = await service.getByWeek(req.params.weekId);
  if (!schedule) return res.status(404).json({ error: "Not found" });
  res.json({ schedule });
});

scheduleRoutes.post("/", async (req, res) => {
  const schedule = await service.create(req.body);
  res.status(201).json({ schedule });
});

scheduleRoutes.put("/:weekId", async (req, res) => {
  const schedule = await service.update(req.params.weekId, req.body);
  res.json({ schedule });
});
