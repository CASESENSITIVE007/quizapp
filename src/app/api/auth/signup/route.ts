import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import  prisma  from "../../../../../lib/prisma";
// import { sendEmail } from "@/helpers/mailer"; // keep your existing mailer

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, role } = body;

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Send verification email
    // await sendEmail({
    //   email,
    //   emailType: "VERIFY",
    //   userId: newUser.id, // Prisma uses `id` instead of `_id`
    // });

    return NextResponse.json(
      { message: "User registered successfully", success: true, newUser },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
