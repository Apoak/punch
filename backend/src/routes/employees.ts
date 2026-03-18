import { Router } from "express";
import { EmployeeService } from "../services/employeeService";

export const employeeRoutes = Router();
const service = new EmployeeService();

employeeRoutes.get("/", async (_req, res) => {
  const employees = await service.getAll();
  res.json({ employees });
});

employeeRoutes.get("/:id", async (req, res) => {
  const employee = await service.getById(req.params.id);
  if (!employee) return res.status(404).json({ error: "Not found" });
  res.json({ employee });
});

employeeRoutes.post("/", async (req, res) => {
  const employee = await service.create(req.body);
  res.status(201).json({ employee });
});

employeeRoutes.put("/:id", async (req, res) => {
  const employee = await service.update(req.params.id, req.body);
  res.json({ employee });
});

employeeRoutes.delete("/:id", async (req, res) => {
  await service.delete(req.params.id);
  res.json({ deleted: req.params.id });
});
