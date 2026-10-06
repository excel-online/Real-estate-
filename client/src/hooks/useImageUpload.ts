import { useState, useCallback } from "react";
import { api } from "../lib/api";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // must match server multer limit
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export interface PendingImage {
  file: File;
  previewUrl: string; // ObjectURL for instant UI feedback
}

export function useImageUpload() {
  const [pending, setPending] = useState<PendingImage[]>([]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files);
    const errors: string[] = [];

    incoming.forEach((file) => {
      if (pending.length + 1 > MAX_FILES) return errors.push(`Maximum ${MAX_FILES} images`);
      if (!ALLOWED.includes(file.type)) return errors.push(`${file.name}: unsupported type`);
      if (file.size > MAX_SIZE) return errors.push(`${file.name}: exceeds 5MB`);
      setPending((prev) => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
    });

    return errors;
  }, [pending.length]);

  const removeFile = useCallback((index: number) => {
    setPending((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl); // free memory — easy to leak
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /** Append images to any FormData payload */
  const appendTo = useCallback((formData: FormData) => {
    pending.forEach(({ file }) => formData.append("images", file));
  }, [pending]);

  return { pending, addFiles, removeFile, appendTo };
}
