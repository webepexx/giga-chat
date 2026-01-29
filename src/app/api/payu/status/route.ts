import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txnid = searchParams.get("txnid");

  if (!txnid) {
    return NextResponse.json({ status: "INVALID" });
  }

  const payment = await prisma.payment.findUnique({
    where: { txnid },
  });

  if (!payment) {
    return NextResponse.json({ status: "INVALID" });
  }

  return NextResponse.json({
    status: payment.status, // PENDING | SUCCESS | FAILED
  });
}
