import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let gender = searchParams.get("gender");

    // Build initial where clause
    let where =
      gender && gender !== "random"
        ? { gender }
        : {};

    // If gender is specified, check its count
    if (gender && gender !== "random") {
      const genderCount = await prisma.randomUser.count({ where });

      // Fallback: if male count is 0 or 1 → use female
      if (gender === "male" && genderCount <= 1) {
        gender = "female";
        where = { gender: "female" };
      }
    }

    // Count again with final where
    const count = await prisma.randomUser.count({ where });

    if (count === 0) {
      return NextResponse.json(
        { error: "No users found" },
        { status: 404 }
      );
    }

    const skip = Math.floor(Math.random() * count);

    const user = await prisma.randomUser.findFirst({
      where,
      skip,
      select: {
        fullName: true,
        userName: true,
        pfpUrl: true,
        age: true,
        city: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        name: user.fullName,
        username: user.userName,
        avatarUrl: user.pfpUrl,
        age: user.age,
        city: user.city,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("USER API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
