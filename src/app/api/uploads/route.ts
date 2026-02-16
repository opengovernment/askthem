import { NextRequest, NextResponse } from "next/server";
import { requireModerator } from "@/lib/session";
import { classifyMimeType, MAX_UPLOAD_SIZE } from "@/lib/media";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// POST /api/uploads — moderator uploads a video or audio file
export async function POST(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_UPLOAD_SIZE / (1024 * 1024)} MB` },
      { status: 400 },
    );
  }

  const mediaType = classifyMimeType(file.type);
  if (!mediaType) {
    return NextResponse.json(
      { error: "Unsupported file type. Only video and audio files are accepted." },
      { status: 400 },
    );
  }

  // Generate a unique filename preserving the original extension
  const ext = file.name.split(".").pop() || "bin";
  const uniqueName = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "responses");

  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });

  const filePath = join(uploadDir, uniqueName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/responses/${uniqueName}`;

  return NextResponse.json(
    {
      url,
      originalFilename: file.name,
      mimeType: file.type,
      mediaType,
      size: file.size,
    },
    { status: 201 },
  );
}
