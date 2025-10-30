import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import jwt from "jsonwebtoken";
import {getCurrentUser} from "../../../../lib/auth"

// ✅ GET all quizzes
export async function GET(request: NextRequest) {
  try {
      const user = await getCurrentUser(request)
      if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

    // 3. Fetch all quizzes (with creator info)
    const quizzes = await prisma.quizz.findMany({
      where: { created_by: user.uid },
      include: { creator: { select: { uid: true, username: true } } },
    });

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ✅ POST create new quiz
export async function POST(request: NextRequest) {
  try {
    // 1. Token read from cookies
    const user =await getCurrentUser(request)
      if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

    // 3. Request body se quiz data lo
    const { title, description } = await request.json();

    // 4. Quiz create with logged-in user's id
    const quiz = await prisma.quizz.create({
      data: {
        title,
        description,
        created_by: user.uid, // ✅ token se uid aa raha hai
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
