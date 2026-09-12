import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

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

export const VERIFICATION_DOCUMENT_RULE: FileRule = {
  maxSizeBytes: 5 * 1024 * 1024,
  extensions: [".pdf", ".jpg", ".jpeg", ".png"],
  mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
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

/**
 * Saves an uploaded file and returns a URL the browser can load directly.
 *
 * Local disk (public/uploads/<subdir>/) only works on a single long-lived
 * server with a persistent filesystem - fine for local dev, but serverless
 * hosts like Vercel don't guarantee either. When BLOB_READ_WRITE_TOKEN is
 * present (set automatically once a Vercel Blob store is connected to the
 * project) we upload there instead; otherwise we fall back to local disk.
 */
export async function saveUploadedFile(file: File, subdir: string) {
  const ext = path.extname(file.name).toLowerCase();
  const filename = `${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${subdir}/${filename}`, file, {
      access: "public",
      contentType: file.type || undefined,
    });
    return {
      url: blob.url,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    };
  }

  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    url: `/uploads/${subdir}/${filename}`,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}
