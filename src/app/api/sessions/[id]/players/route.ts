import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import {getCurrentUser} from "../../../../../../lib/auth"

// Add player to session or list players
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { nickname, pin } = await request.json();

    // Validate session PIN
    const session = await prisma.gameSessionTable.findUnique({
      where: { id: Number(params.id) },
    });

    if (!session || session.pin !== pin) {
      return NextResponse.json({ error: "Invalid session PIN" }, { status: 400 });
    }

    // Create new player entry
    const player = await prisma.gamePlayerTable.create({
      data: {
        session_id: session.id,
        user_id: user.uid,    // From authenticated user
        nickname,
        score: 0,
      },
    });

    return NextResponse.json({ message: "Player joined successfully", player }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const players = await prisma.gamePlayerTable.findMany({
      where: { session_id: Number(params.id) },
      select: {
        id: true,
        user_id: true,
        nickname: true,
        score: true,
      },
    });

    return NextResponse.json(players, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
