import { Router } from "express";
import { ShiftRequirementService } from "../services/shiftRequirementService";

export const shiftRequirementRoutes = Router();
const service = new ShiftRequirementService();

shiftRequirementRoutes.get("/", async (req, res) => {
  const week = req.query.week as string | undefined;
  const requirements = await service.getRequirements(week);
  res.json({ requirements });
});

shiftRequirementRoutes.post("/", async (req, res) => {
  const requirement = await service.create(req.body);
  res.status(201).json({ requirement });
});

shiftRequirementRoutes.put("/:id", async (req, res) => {
  const requirement = await service.update(req.params.id, req.body);
  res.json({ requirement });
});

shiftRequirementRoutes.delete("/:id", async (req, res) => {
  await service.delete(req.params.id);
  res.json({ deleted: req.params.id });
});
