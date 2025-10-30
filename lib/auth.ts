// lib/getCurrentUser.ts
import { NextRequest } from "next/server";
import prisma from "./prisma";
import jwt from "jsonwebtoken";

export async function getCurrentUser(request: NextRequest) {
  try {
    // 1. Read token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: number};

    // 3. Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { uid: decoded.id },
      select: {
        uid: true,  
        username: true,
        email: true,  
        role: true,
        created_at: true,
      },
    });

    return user;
  } catch (err) {
    return null; // agar invalid/expired token hai toh null
  }
}
