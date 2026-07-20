import React, { useState } from "react";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { useUser } from "../../contexts/UserContext";
import { updateUser } from "../../services/auth";
import { SocialMediaSection } from "../profile/SocialMediaSection";

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const SocialLinksForm: React.FC = () => {
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    twitchUrl: user?.twitchUrl ?? "",
    youtubeUrl: user?.youtubeUrl ?? "",
    instagramUrl: user?.instagramUrl ?? "",
    xUrl: user?.xUrl ?? "",
    facebookUrl: user?.facebookUrl ?? "",
    tiktokUrl: user?.tiktokUrl ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        twitchUrl: emptyToNull(formData.twitchUrl),
        youtubeUrl: emptyToNull(formData.youtubeUrl),
        instagramUrl: emptyToNull(formData.instagramUrl),
        xUrl: emptyToNull(formData.xUrl),
        facebookUrl: emptyToNull(formData.facebookUrl),
        tiktokUrl: emptyToNull(formData.tiktokUrl),
        onboardingStatus: MasterOnboardingStep.FeaturedVideos,
      };

      const data = await updateUser(user.id, payload);

      if (data.status === "success") {
        setUser({
          ...user,
          ...data.user,
          ...payload,
          onboardingStatus: MasterOnboardingStep.FeaturedVideos,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#2C2416]">
          Social media links
        </h2>
        <p className="mt-1 text-xs text-[#6B5A42]">
          Add links to your social profiles. All fields are optional.
        </p>
      </div>

      <SocialMediaSection
        twitchUrl={formData.twitchUrl}
        youtubeUrl={formData.youtubeUrl}
        instagramUrl={formData.instagramUrl}
        xUrl={formData.xUrl}
        facebookUrl={formData.facebookUrl}
        tiktokUrl={formData.tiktokUrl}
        onChange={handleChange}
        compact
      />

      {error && <p className="text-xs text-[#7A2E2E]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#B8893D] text-[#1F1109] px-4 py-2 rounded-full text-xs font-medium hover:bg-[#A67B30] transition-colors disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save and continue"}
      </button>
    </form>
  );
};
