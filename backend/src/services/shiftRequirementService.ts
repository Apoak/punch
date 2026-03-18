import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ShiftRequirementService {
  async getRequirements(week?: string) {
    // Returns base requirements (and optionally week-specific overrides)
    return prisma.shiftRequirement.findMany();
  }

  async create(data: {
    day: string;
    startTime: string;
    endTime: string;
    minStaff: number;
    roles?: string[];
  }) {
    return prisma.shiftRequirement.create({ data });
  }

  async update(id: string, data: unknown) {
    return prisma.shiftRequirement.update({
      where: { id },
      data: data as Parameters<typeof prisma.shiftRequirement.update>[0]["data"],
    });
  }

  async delete(id: string) {
    return prisma.shiftRequirement.delete({ where: { id } });
  }
}
