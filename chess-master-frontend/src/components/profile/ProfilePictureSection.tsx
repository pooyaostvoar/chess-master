import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
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
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Profile Picture</h3>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {previewImage ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
              <span className="text-4xl font-bold text-muted-foreground">
                {username?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="profilePicture" className="mb-2 block">
            Upload Profile Picture
          </Label>
          <div className="flex items-center gap-4">
            <Label
              htmlFor="profilePicture"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Choose Image
            </Label>
            <Input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF. Max size 2MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
