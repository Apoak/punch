import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EmployeeService {
  async getAll() {
    return prisma.employee.findMany({ include: { availability: true } });
  }

  async getById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: { availability: true },
    });
  }

  async create(data: { name: string; role: string; hoursPerWeek: number }) {
    return prisma.employee.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; role: string; hoursPerWeek: number }>) {
    return prisma.employee.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.employee.delete({ where: { id } });
  }
}
