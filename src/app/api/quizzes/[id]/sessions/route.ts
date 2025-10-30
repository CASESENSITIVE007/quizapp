import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../../lib/auth";
// Create a new game session or list all sessions for a quiz
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }  // quiz id
) {
    const user = await getCurrentUser(request)
    if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
  const { pin } = await request.json();

  const newSession = await prisma.gameSessionTable.create({
    data: {
      quiz_id: Number(params.id),
      host_id: user.uid, 
      pin: Number(pin)
    },
  }); 

  return NextResponse.json(newSession, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessions = await prisma.gameSessionTable.findMany({
    where: { quiz_id: Number(params.id) },
  });

  return NextResponse.json(sessions);
}
