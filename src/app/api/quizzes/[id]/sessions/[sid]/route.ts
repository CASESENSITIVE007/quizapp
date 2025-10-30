import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../../lib/prisma";

// Get session details or close session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sid: string } }
) {
  const session = await prisma.gameSessionTable.findUnique({
    where: { id: Number(params.sid) },
  });

  return NextResponse.json(session);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; sid: string } }
) {
  // Example: Mark session as closed by updating a flag
  const updatedSession = await prisma.gameSessionTable.update({
    where: { id: Number(params.sid) },
    data: { is_active: false },
  });

  return NextResponse.json({
    message:"session closed Successfully",
    session:updatedSession,
  });
}
