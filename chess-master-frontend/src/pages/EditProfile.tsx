import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMe, updateUser } from "../services/auth";
import { useUser } from "../contexts/UserContext";
import { API_URL } from "../services/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ProfilePictureSection } from "../components/profile/ProfilePictureSection";
import { BasicInfoSection } from "../components/profile/BasicInfoSection";
import { ChessProfileSection } from "../components/profile/ChessProfileSection";
import { ChessPlatformSection } from "../components/profile/ChessPlatformSection";
import { PricingSection } from "../components/profile/PricingSection";
import { AccountTypeSection } from "../components/profile/AccountTypeSection";
import { LanguagesSection } from "../components/profile/LanguagesSection";
import { LichessRatingsSection } from "../components/profile/LichessRatingsSection";

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getMe();
      if (!response.user) {
        navigate("/login");
      } else {
        const userData = {
          ...response.user,
        };
        setFormData(userData);
        if (response.user.profilePicture) {
          setPreviewImage(response.user.profilePicture);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const error = searchParams.get("error");
    const status = searchParams.get("status");

    if (status === "lichess_synced") {
      setMessage("Lichess profile synced successfully.");
      setMessageType("success");
      return;
    }

    if (error === "lichess_account_already_linked") {
      setMessage("That Lichess account is already linked to another user.");
      setMessageType("error");
      return;
    }

    if (error === "lichess_link_requires_login") {
      setMessage("Please sign in before linking a Lichess account.");
      setMessageType("error");
      return;
    }

    if (error === "lichess_auth_failed") {
      setMessage("Lichess sync failed. Please try again.");
      setMessageType("error");
    }
  }, [searchParams]);

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file");
        setMessageType("error");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setMessage("Image size should be less than 2MB");
        setMessageType("error");
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        setMessage("Error reading image file. Please try again.");
        setMessageType("error");
      };
      reader.onloadend = () => {
        try {
          const base64String = reader.result as string;
          if (!base64String) {
            throw new Error("Failed to read image");
          }
          setPreviewImage(base64String);
          setFormData({ ...formData, profilePicture: base64String });
          setMessage("Image loaded successfully");
          setMessageType("success");
          setTimeout(() => setMessage(""), 2000);
        } catch (err) {
          console.error("Error processing image:", err);
          setMessage("Error processing image. Please try again.");
          setMessageType("error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData({ ...formData, profilePicture: null });
  };

  const handlePricingChange = (value: number | null) => {
    setFormData({ ...formData, hourlyRate: value });
  };

  const handleLichessSync = () => {
    window.location.href = `${API_URL}/auth/lichess?mode=link`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await updateUser(formData.id, {
        email: formData.email,
        username: formData.username,
        title: formData.title,
        rating: formData.rating,
        bio: formData.bio,
        isMaster: formData.isMaster,
        profilePicture: formData.profilePicture,
        chesscomUrl: formData.chesscomUrl,
        lichessUrl: formData.lichessUrl,
        hourlyRate: formData.hourlyRate,
        languages: formData.languages,
        phoneNumber: formData.phoneNumber,
      });

      if (data.status === "success") {
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setUser(data.user);
        if (data.user.profilePicture) {
          setPreviewImage(data.user.profilePicture);
        } else {
          setPreviewImage(null);
        }
      } else {
        setMessage("Something went wrong");
        setMessageType("error");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Error updating profile. Please try again.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Profile</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <ProfilePictureSection
              previewImage={previewImage}
              username={formData.username}
              onImageChange={handleImageChange}
              onRemoveImage={removeImage}
            />

            <BasicInfoSection
              username={formData.username}
              email={formData.email}
              phoneNumber={formData.phoneNumber}
              onChange={handleChange}
            />

            <ChessProfileSection
              title={formData.title}
              rating={formData.rating}
              bio={formData.bio}
              onChange={handleChange}
            />

            <LanguagesSection
              name="languages"
              languages={formData.languages ?? []}
              onChange={handleChange}
            />

            <ChessPlatformSection
              chesscomUrl={formData.chesscomUrl}
              lichessUrl={formData.lichessUrl}
              onChange={handleChange}
            />

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold">Sync from Lichess</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your Lichess account to import your title and ratings
                    without changing your coaching or pricing details.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={handleLichessSync}>
                  {formData.lichessId ? "Refresh from Lichess" : "Connect Lichess"}
                </Button>
              </div>
            </div>

            <LichessRatingsSection
              lichessRatings={formData.lichessRatings}
              lichessUrl={formData.lichessUrl}
            />

            {formData.isMaster && (
              <PricingSection
                pricing={formData.hourlyRate}
                onPricingChange={handlePricingChange}
              />
            )}

            <AccountTypeSection
              isMaster={formData.isMaster}
              onChange={(isMaster) => setFormData({ ...formData, isMaster })}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>

            {message && (
              <div
                className={`p-4 rounded-md text-center ${
                  messageType === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
