import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    // 認証チェック
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findFirst({
      where: {
        clerkId: params.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
