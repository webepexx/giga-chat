import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const formData = await req.formData();

  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    data[key] = value.toString();
  });

  const {
    txnid,
    status,
    amount,
    productinfo,
    firstname,
    email,
    hash,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    udf6 = "",
    udf7 = "",
    udf8 = "",
    udf9 = "",
    udf10 = "",
  } = data;

  if (!txnid || !hash) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // 🔐 Verify hash
  const key = process.env.PAYU_MERCHANT_KEY!;
  const salt = process.env.PAYU_SALT!;

  const hashString = [
    salt,
    status,
    udf10,
    udf9,
    udf8,
    udf7,
    udf6,
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ].join("|");

  const calculatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  if (calculatedHash !== hash) {
    console.error("PayU webhook hash mismatch", txnid);
    return NextResponse.json({ error: "Hash mismatch" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { txnid },
  });

  // 🔁 Idempotency
  if (!payment || payment.status !== "PENDING") {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  const plan = await prisma.plan.findUnique({
    where: { id: payment.refId },
  });

  if (!plan) {
    console.error("Plan missing for txn", txnid);
    return NextResponse.json({ error: "Plan missing" }, { status: 500 });
  }

  if (status === "success") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { txnid },
        data: {
          status: "SUCCESS",
          createdAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          planId: payment.refId,
          billingDate: new Date(),
          chatCount: plan.maxDailyChats,
        },
      }),
    ]);
  } else {
    await prisma.payment.update({
      where: { txnid },
      data: {
        status: "FAILED",
      },
    });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
