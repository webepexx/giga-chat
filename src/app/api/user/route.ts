import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.log("SESSION",session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    

    return NextResponse.json({
      success: true,
      data:user.chatCount
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST() {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          chatCount: {
            decrement: 1,
          },
        },
        select: {
          chatCount: true,
        },
      });
  
      return NextResponse.json({
        success: true,
        chats_left: user.chatCount,
      });
    } catch (error) {
      console.error("Decrease Chat Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }