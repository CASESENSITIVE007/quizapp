import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }  // quiz id
) {
  try {
    const { question, answers } = await request.json();

    // 1. Create the question
    const newQuestion = await prisma.questionTable.create({
      data: {
        question,
        quiz_id: Number(params.id),
        // 2. Create related answers in one go
        answers: {
          create: answers.map((ans: { text: string; isCorrect: boolean }) => ({
            answer_text: ans.text,
            is_correct: ans.isCorrect,
          })),
        },
      },
      include: {
        answers: true,  // So we get the created answers in response
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};




export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const questions = await prisma.questionTable.findMany({
    where: { quiz_id: Number(params.id) },
    include: { answers: true },
  });
  return NextResponse.json(questions);
}
