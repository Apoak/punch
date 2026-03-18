import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ScheduleService {
  async getAll() {
    return prisma.schedule.findMany({ include: { shifts: true } });
  }

  async getByWeek(weekStartDate: string) {
    return prisma.schedule.findUnique({
      where: { weekStartDate },
      include: { shifts: { include: { employee: true } } },
    });
  }

  async create(data: {
    weekStartDate: string;
    shifts: Array<{
      employeeId: string;
      day: string;
      startTime: string;
      endTime: string;
    }>;
  }) {
    return prisma.schedule.create({
      data: {
        weekStartDate: data.weekStartDate,
        shifts: { create: data.shifts },
      },
      include: { shifts: true },
    });
  }

  async update(weekStartDate: string, data: unknown) {
    return prisma.schedule.update({
      where: { weekStartDate },
      data: data as Parameters<typeof prisma.schedule.update>[0]["data"],
    });
  }
}
