import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import jwt from "jsonwebtoken";
import { getCurrentUser } from "../../../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Read token from cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 3. Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { uid: decoded.id },
      select: {
        uid: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      }, // never return password!
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Return safe user object
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
