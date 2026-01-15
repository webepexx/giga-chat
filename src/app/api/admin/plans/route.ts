import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// FETCH ALL PLANS
export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

// UPDATE A PLAN
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}