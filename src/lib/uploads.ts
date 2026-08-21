import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

type FileRule = {
  maxSizeBytes: number;
  extensions: string[];
  mimeTypes: string[];
};

export const CV_RULE: FileRule = {
  maxSizeBytes: 5 * 1024 * 1024,
  extensions: [".pdf", ".doc", ".docx"],
  mimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const PHOTO_RULE: FileRule = {
  maxSizeBytes: 2 * 1024 * 1024,
  extensions: [".jpg", ".jpeg", ".png", ".webp"],
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
};

export function validateFile(file: File, rule: FileRule): string | null {
  if (file.size === 0) return "Choose a file to upload.";
  if (file.size > rule.maxSizeBytes) {
    return `File is too large. Maximum size is ${Math.round(rule.maxSizeBytes / (1024 * 1024))}MB.`;
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!rule.extensions.includes(ext)) {
    return `Unsupported file type. Allowed: ${rule.extensions.join(", ")}.`;
  }
  if (file.type && !rule.mimeTypes.includes(file.type)) {
    return `Unsupported file type. Allowed: ${rule.extensions.join(", ")}.`;
  }
  return null;
}

/** Saves under public/uploads/<subdir>/ and returns a URL the browser can load directly. */
export async function saveUploadedFile(file: File, subdir: string) {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase();
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    url: `/uploads/${subdir}/${filename}`,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}
