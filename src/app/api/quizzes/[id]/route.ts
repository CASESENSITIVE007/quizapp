import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// GET quiz by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quiz = await prisma.quizz.findUnique({
    where: { qid: Number(params.id) },
    include: { questions: true, sessions: true },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  return NextResponse.json(quiz);
}

// PUT update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { title, description } = await request.json();
  const updatedQuiz = await prisma.quizz.update({
    where: { qid: Number(params.id) },
    data: { title, description },
  });
  return NextResponse.json(updatedQuiz);
}

// DELETE quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.quizz.delete({ where: { qid: Number(params.id) } });
  return NextResponse.json({ message: "Quiz deleted" });
}
