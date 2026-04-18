import React from "react";
import { Upload, X } from "lucide-react";
import { MEDIA_URL } from "../../services/config";

interface ProfilePictureSectionProps {
  previewImage: string | null;
  username: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  previewImage,
  username,
  onImageChange,
  onRemoveImage,
}) => {
  const imageUrl = previewImage ? MEDIA_URL + previewImage : undefined;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Profile picture</h3>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {previewImage ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Profile preview"
                className="w-24 h-24 rounded-xl object-cover border border-[#B8893D]/40"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#7A2E2E] text-white flex items-center justify-center hover:bg-[#7A2E2E]/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl bg-[#3D2817] flex items-center justify-center border border-[#B8893D]/40">
              <span className="text-3xl font-medium text-[#F4ECDD]">
                {username?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 pt-2">
          <p className="text-xs text-[#3D2817] font-medium mb-2">Upload profile picture</p>
          <div className="flex items-center gap-3">
            <label
              htmlFor="profilePicture"
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#B8893D] text-[#1F1109] rounded-lg text-xs font-medium hover:bg-[#A37728] transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Choose image
            </label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
            <p className="text-[11px] text-[#8B6F4E]">
              JPG, PNG or GIF. Max size 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
