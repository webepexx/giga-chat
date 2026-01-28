import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { id } = await context.params;

  const image = await prisma.image.findUnique({
    where: { id },
  });

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  // Fetch remote image as buffer
  const imageResponse = await fetch(image.imageUrl);

  if (!imageResponse.ok) {
    return new Response("Failed to fetch image", { status: 500 });
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const originalBuffer = Buffer.from(arrayBuffer);

  // ✅ Mods always see original
  if (session.user.role === "MOD") {
    return new Response(new Uint8Array(originalBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  }

  // ✅ Free images skip payment check
  if (image.isFree) {
    return new Response(new Uint8Array(originalBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  }

  // 🔍 Paid image → check payment
  const payment = await prisma.payment.findFirst({
    where: {
      refId: id,
      type: "IMAGE",
      status: "SUCCESS",
    },
  });

  const outputBuffer = payment
    ? originalBuffer
    : await sharp(originalBuffer).blur(25).toBuffer();

  return new Response(new Uint8Array(outputBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
