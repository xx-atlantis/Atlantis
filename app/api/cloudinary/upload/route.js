import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "cms" }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
        .end(buffer);
    });

    const url = uploadResult.secure_url;

    // Catalogue in media library (fire-and-forget, don't block response)
    prisma.mediaAsset.create({
      data: {
        url,
        filename: file.name || null,
        folder: uploadResult.folder || "cms",
      },
    }).catch((e) => console.warn("MediaAsset save failed:", e.message));

    return NextResponse.json({ url });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
