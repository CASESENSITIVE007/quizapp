import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../../lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { pid: string } }) {
  const player = await prisma.gamePlayerTable.findUnique({
    where: { id: Number(params.pid) },
    select: {
      id: true,
      user_id: true,
      nickname: true,
      score: true,
    },
  });

  return NextResponse.json(player);
};
