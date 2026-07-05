import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../services/media";
import { isAdmin } from "../middleware/passport";

export const adminImagesRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WebP are allowed"));
    }
  },
});

adminImagesRouter.post(
  "/",
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    const fileSizeKb = (req.file?.size ?? 0) / 1024;
    if (fileSizeKb > 5 * 1024) {
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
      res.json({
        success: true,
        url: file.url,
      });
    } catch {
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  }
);
