import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  // TODO: fetch schedules from backend
  return NextResponse.json({ schedules: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: create schedule via backend
  return NextResponse.json({ schedule: body }, { status: 201 });
}
