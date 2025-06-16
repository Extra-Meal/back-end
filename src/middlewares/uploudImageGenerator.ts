import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import cloudinary from "../config/cloudinary";
export function createUploadMiddleware(folderName: string) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: () => ({
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
    }),
  });

  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
  });
}
