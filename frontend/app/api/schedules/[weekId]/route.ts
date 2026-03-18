import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { weekId: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  // TODO: fetch week schedule from backend
  return NextResponse.json({ weekId: params.weekId, shifts: [] });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json();
  // TODO: update week schedule via backend
  return NextResponse.json({ weekId: params.weekId, ...body });
}
