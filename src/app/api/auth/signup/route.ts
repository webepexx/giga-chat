import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { NextResponse } from "next/server";

function generateUsername(firstName: string, lastName: string) {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base}${random}`;
}

export async function POST(req: Request) {
  try {
    /* -------------------- Parse Body -------------------- */
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, password, gender } = body;

    /* -------------------- Validation -------------------- */
    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(phone)) {
      return NextResponse.json(
        { error: "Phone number must contain digits only" },
        { status: 400 }
      );
    }

    if (phone.length < 10 || phone.length > 15) {
      return NextResponse.json(
        { error: "Phone number must be between 10 and 15 digits" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    /* -------------------- Duplicate Phone -------------------- */
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number already exists" },
        { status: 409 }
      );
    }

    /* -------------------- Plan -------------------- */
    const freePlan = await prisma.plan.findFirst({
      where: { name: "Free" },
    });

    if (!freePlan) {
      console.error("❌ Free plan missing in DB");
      return NextResponse.json(
        { error: "System configuration error" },
        { status: 500 }
      );
    }

    /* -------------------- Username -------------------- */
    let username = "";
    let exists = true;

    let attempts = 0;
    while (exists) {
      if (attempts > 5) {
        throw new Error("Username generation failed");
      }

      username = generateUsername(firstName, lastName);
      const check = await prisma.user.findUnique({
        where: { username },
      });
      exists = !!check;
      attempts++;
    }

    /* -------------------- Create User -------------------- */
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        gender,
        password: hashedPassword,
        username,
        planId: freePlan.id,
        chatCount: freePlan.maxDailyChats,
      },
    });

    console.log("✅ User created:", user.id);

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
      },
      { status: 201 }
    );
  } catch (err: any) {
    /* -------------------- CRITICAL ERROR LOG -------------------- */
    console.error("🔥 Signup error:", {
      message: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? err?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
