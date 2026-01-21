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

  if (session?.user?.role !== "USER"){
    return NextResponse.json({message:"User only"}, {status:200});
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

const ALLOWED_FIELDS = [
  "username",
  "gender",
  "interests",
  "firstName",
  "lastName",
];

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: Record<string, any>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Build safe update object
  const data: Record<string, any> = {};

  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        username: true,
        gender: true,
        interests: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PATCH /user error:", error);

    // Prisma unique constraint (e.g. username)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Value already in use" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
