import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  // TODO: fetch single employee from backend
  return NextResponse.json({ id: params.id });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json();
  // TODO: update employee via backend
  return NextResponse.json({ id: params.id, ...body });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  // TODO: delete employee via backend
  return NextResponse.json({ deleted: params.id });
}
