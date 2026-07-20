import React, { useState } from "react";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { useUser } from "../../contexts/UserContext";
import { updateUser } from "../../services/auth";
import { YoutubeVideosSection } from "../profile/YoutubeVideosSection";

export const FeaturedVideosForm: React.FC = () => {
  const { user, setUser } = useUser();
  const [youtubeVideos, setYoutubeVideos] = useState<string[]>(
    user?.youtubeVideos ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const normalizedVideos = youtubeVideos
        .map((video) => video.trim())
        .filter(Boolean);

      const data = await updateUser(user.id, {
        youtubeVideos: normalizedVideos,
        onboardingStatus: MasterOnboardingStep.Availability,
      });

      if (data.status === "success") {
        setUser({
          ...user,
          ...data.user,
          youtubeVideos: data.user.youtubeVideos ?? normalizedVideos,
          onboardingStatus: MasterOnboardingStep.Availability,
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
        <h2 className="text-sm font-semibold text-[#2C2416]">YouTube videos</h2>
        <p className="mt-1 text-xs text-[#6B5A42]">
          Add links to your YouTube videos to showcase on your master profile.
        </p>
      </div>

      <YoutubeVideosSection
        youtubeVideos={youtubeVideos}
        onChange={setYoutubeVideos}
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
