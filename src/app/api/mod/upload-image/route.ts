import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();

  const image = formData.get("image");
  const isFreeRaw = formData.get("isFree");

  if (!image) {
    return NextResponse.json(
      { success: false, message: "Missing information" },
      { status: 400 }
    );
  }

  const isFree = isFreeRaw === "true";

  try {
    // Upload image to imgbb
    const formData = new FormData();
    formData.append("image", image as Blob);
    
    const imgbbResponse = await fetch(
      "http://imgbb.webepex.com/upload.php?key=hjbd34uyf875g48bqru",
      {
        method: "POST",
        body: formData,
      }
    );
    

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      console.log("IMAGE-BB-DATA", imgbbData);
      return NextResponse.json({
        success: false,
        message: "Error uploading image",
        data: imgbbData,
      });
    }

    const imageUrl = imgbbData.data.url.replace("https://", "http://");

    // ✅ Insert into Image table WITH isFree
    const imageRecord = await prisma.image.create({
      data: {
        imageUrl,
        isFree,
      },
    });

    return NextResponse.json({
      success: true,
      imageId: imageRecord.id,
    });

  } catch (error) {
    console.error("UPLOAD IMAGE ERROR", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
