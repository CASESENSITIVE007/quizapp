import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import {getCurrentUser} from "../../../../../../lib/auth"

export async function POST(request: NextRequest) {
  const { question_id, answer_id } = await request.json();

  // 1. Get logged-in user
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Find current active game session
  const gamePlayer = await prisma.gamePlayerTable.findFirst({
    where: { user_id: user.uid },
  });

  if (!gamePlayer) {
    return NextResponse.json({ error: "You have not joined any session yet" }, { status: 400 });
  }

  // 3. Submit the answer
  const answer = await prisma.playerAnswersTable.create({
    data: {
      gameplayer_id: gamePlayer.id,
      question_id,
      answer_id,
      answered_at: Math.floor(Date.now() / 1000),
    },
  });

  return NextResponse.json({ message: "Answer submitted", answer }, { status: 201 });
};

// View all submitted answers in a session
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const answers = await prisma.playerAnswersTable.findMany({
    where: { gameplayer_id: Number(params.id) },  // Or other relation depending on logic
    include: {
      player: true,
      question: true,
      answer: true,
    },
  });

  return NextResponse.json(answers);
};
