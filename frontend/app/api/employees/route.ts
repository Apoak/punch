import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  // TODO: fetch employees from backend
  return NextResponse.json({ employees: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: create employee via backend
  return NextResponse.json({ employee: body }, { status: 201 });
}
