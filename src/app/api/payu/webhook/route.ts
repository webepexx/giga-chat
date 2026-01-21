import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayUPayment } from "@/lib/payu";

export async function POST(req: Request) {
  const form = await req.formData();

  const txnid = form.get("txnid") as string;
  const amount = Number(form.get("amount"));

  if (!txnid || !amount) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { txnid } });
  if (!payment) return NextResponse.json({ ok: false });

  // ✅ Idempotency
  if (payment.status === "SUCCESS") {
    return NextResponse.json({ ok: true });
  }

  // 🔐 Verify with PayU
  const verified = await verifyPayUPayment(txnid);
  if (!verified) {
    await prisma.payment.update({
      where: { txnid },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ ok: false });
  }

  // 🧠 APPLY PLAN
  const plan = await prisma.plan.findUnique({
    where: { id: payment.refId },
  });

  if (!plan) return NextResponse.json({ ok: false });

  const now = new Date();
  const billingEnd = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000
  );

  await prisma.user.update({
    where: { id: payment.userId },
    data: {
      planId: plan.id,
      billingDate: now,
    },
  });

  await prisma.payment.update({
    where: { txnid },
    data: { status: "SUCCESS" },
  });

  return NextResponse.json({ ok: true });
}
