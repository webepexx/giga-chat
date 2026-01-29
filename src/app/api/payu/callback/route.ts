import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const txnid = formData.get("txnid");

  if (!txnid) {
    return NextResponse.redirect(
      new URL("/success?payment=failed", req.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL(`/success?txnid=${txnid}`, req.url),
    { status: 303 }
  );
}
