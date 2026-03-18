import { NextRequest, NextResponse } from "next/server";
import { runSchedulingAgent } from "@/lib/agent/scheduler";

export async function POST(req: NextRequest) {
  const { weekStartDate, constraints } = await req.json();

  const schedule = await runSchedulingAgent({ weekStartDate, constraints });

  return NextResponse.json({ schedule });
}
