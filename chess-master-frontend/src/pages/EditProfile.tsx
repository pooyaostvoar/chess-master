import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { getMe, updateUser } from "../services/auth";
import { useUser } from "../contexts/UserContext";
import { API_URL } from "../services/config";
import { ProfilePictureSection } from "../components/profile/ProfilePictureSection";
import { BasicInfoSection } from "../components/profile/BasicInfoSection";
import { ChessProfileSection } from "../components/profile/ChessProfileSection";
import { ChessPlatformSection } from "../components/profile/ChessPlatformSection";
import { PricingSection } from "../components/profile/PricingSection";
import { AccountTypeSection } from "../components/profile/AccountTypeSection";
import { LanguagesSection } from "../components/profile/LanguagesSection";
import { TeachingFocusesSection } from "../components/profile/TeachingFocusesSection";
import { LichessRatingsSection } from "../components/profile/LichessRatingsSection";
import { SocialMediaSection } from "../components/profile/SocialMediaSection";
import { ProfileSectionsSection } from "../components/profile/ProfileSectionsSection";
import { uploadProfilePicture } from "../services/api/user.api";

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState<any>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getMe();
      if (!response.user) {
        navigate(
          `/login?redirect=${encodeURIComponent(
            `${location.pathname}${location.search}`
          )}`
        );
      } else {
        const userData = {
          ...response.user,
          teachingFocuses: response.user.teachingFocuses ?? [],
          profileSections: response.user.profileSections ?? [],
        };
        setFormData(userData);
        if (response.user.profilePictureUrl) {
          setPreviewImage(response.user.profilePictureUrl);
        }
      }
    };

    checkAuth();
  }, [navigate, location.pathname, location.search]);

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
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size should be less than 5MB");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const result = await uploadProfilePicture(file);

      setPreviewImage(result.url);
      setUser({
        ...formData,
        profilePictureUrl: result.url,
        profilePictureThumbnailUrl: result.url,
      });
      setMessage("Image uploaded successfully");
      setMessageType("success");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error("Error uploading image:", err);
      setMessage("Error uploading image. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
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
        name: formData.name,
        lastname: formData.lastname,
        title: formData.title,
        rating: formData.rating,
        bio: formData.bio,
        profileSections: formData.isMaster
          ? (formData.profileSections ?? [])
              .map((section: any) => ({
                title: String(section.title ?? "").trim(),
                content: String(section.content ?? "").trim(),
              }))
              .filter((section: any) => section.title && section.content)
          : formData.profileSections,
        isMaster: formData.isMaster,
        chesscomUrl: formData.chesscomUrl,
        lichessUrl: formData.lichessUrl,
        hourlyRate: formData.hourlyRate,
        languages: formData.languages,
        teachingFocuses: formData.teachingFocuses,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        twitchUrl: formData.twitchUrl,
        youtubeUrl: formData.youtubeUrl,
        instagramUrl: formData.instagramUrl,
        xUrl: formData.xUrl,
        facebookUrl: formData.facebookUrl,
        tiktokUrl: formData.tiktokUrl,
      });

      if (data.status === "success") {
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setUser(data.user);
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
    <div className="bg-[#FAF5EB] min-h-screen">
      {/* Header */}
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Settings
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Edit profile
          </h1>
          <p className="text-[13px] text-[#5C4631] mt-1.5">
            Update your account information
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-6 sm:p-8">
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
              name={formData.name}
              lastname={formData.lastname}
              phoneNumber={formData.phoneNumber}
              location={formData.location}
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

            <TeachingFocusesSection
              teachingFocuses={formData.teachingFocuses ?? []}
              onChange={handleChange}
            />

            {formData.isMaster && (
              <ProfileSectionsSection
                sections={formData.profileSections ?? []}
                onChange={(profileSections) =>
                  setFormData({ ...formData, profileSections })
                }
              />
            )}

            <ChessPlatformSection
              chesscomUrl={formData.chesscomUrl}
              lichessUrl={formData.lichessUrl}
              onChange={handleChange}
            />

            <SocialMediaSection
              twitchUrl={formData.twitchUrl}
              youtubeUrl={formData.youtubeUrl}
              instagramUrl={formData.instagramUrl}
              xUrl={formData.xUrl}
              facebookUrl={formData.facebookUrl}
              tiktokUrl={formData.tiktokUrl}
              onChange={handleChange}
            />

            <div className="rounded-lg border border-[#1F1109]/[0.08] bg-[#F4ECDD]/50 p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-medium text-[#1F1109]">
                    Sync from Lichess
                  </h3>
                  <p className="text-xs text-[#6B5640] mt-1 leading-relaxed">
                    Connect your Lichess account to import your title and
                    ratings without changing your coaching or pricing details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLichessSync}
                  className="text-xs font-medium text-[#B8893D] border border-[#B8893D]/40 rounded-full px-4 py-1.5 hover:bg-[#B8893D]/10 transition-colors whitespace-nowrap"
                >
                  {formData.lichessId
                    ? "Refresh from Lichess"
                    : "Connect Lichess"}
                </button>
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg px-4 py-3 text-[13px] font-medium text-[#1F1109] transition-colors ${
                loading
                  ? "bg-[#8B6F4E] cursor-wait pointer-events-none"
                  : "bg-[#B8893D] hover:bg-[#A37728] active:scale-[0.99]"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            {message && (
              <div
                className={`p-3.5 rounded-lg text-center text-[13px] ${
                  messageType === "success"
                    ? "bg-[#B8893D]/10 border border-[#B8893D]/20 text-[#6B4F1F]"
                    : "bg-[#7A2E2E]/10 border border-[#7A2E2E]/20 text-[#7A2E2E]"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
