import e, { Router } from "express";
import multer from "multer";

import { compressImage, uploadImage } from "../../services/media";
import { AppDataSource } from "../../database/datasource";
import { User } from "../../database/entity/user";
import { isAuthenticated } from "../../middleware/passport";

export const imageRouter = Router();

// multer (store file in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WebP are allowed"));
    }
  },
});

async function compressedFileAndSave(
  userId: number,
  file: Express.Multer.File
) {
  const compressedBuffer = await compressImage(file.buffer, file.mimetype);
  const compressedFile = await uploadImage({
    ...file,
    buffer: compressedBuffer,
  });
  const userRepo = AppDataSource.getRepository(User);

  return userRepo.save({
    id: userId,
    profilePictureThumbnailUrl: compressedFile.url,
  });
}

// POST /upload
imageRouter.post(
  "/images",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const fileSize = (req.file?.size ?? 0) / 1024;
    if (fileSize > 5 * 1024) {
      return res
        .status(400)
        .json({ success: false, error: "Image size should be less than 5MB" });
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }

      const file = await uploadImage(req.file);
      const userRepo = AppDataSource.getRepository(User);
      await userRepo.save({
        id: (req.user as any).id,
        profilePictureUrl: file.url,
      });
      if (fileSize > 500) {
        compressedFileAndSave((req.user as any).id, req.file);
      } else {
        await userRepo.save({
          id: (req.user as any).id,
          profilePictureThumbnailUrl: file.url,
        });
      }
      res.json({
        success: true,
        url: file.url,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  }
);
