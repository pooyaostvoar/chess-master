import React, { useState } from "react";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { useUser } from "../../contexts/UserContext";
import { updateUser } from "../../services/auth";
import { ProfileSectionsSection } from "../profile/ProfileSectionsSection";
import { TeachingFocusesSection } from "../profile/TeachingFocusesSection";

type ProfileSection = { title: string; content: string };

function normalizeProfileSections(sections: ProfileSection[]) {
  return sections
    .map((section) => ({
      title: section.title.trim(),
      content: section.content.trim(),
    }))
    .filter((section) => section.title && section.content);
}

export const BioAndSectionsForm: React.FC = () => {
  const { user, setUser } = useUser();
  const [profileSections, setProfileSections] = useState<ProfileSection[]>(
    user?.profileSections ?? []
  );
  const [teachingFocuses, setTeachingFocuses] = useState<string[]>(
    user?.teachingFocuses ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTeachingFocusesChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { value } = e.target as unknown as { value: string[] };
    setTeachingFocuses(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const normalizedSections = normalizeProfileSections(profileSections);

    if (normalizedSections.length === 0) {
      setError("Please add at least one profile tab with a title and description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await updateUser(user.id, {
        profileSections: normalizedSections,
        teachingFocuses,
        onboardingStatus: MasterOnboardingStep.SocialLinks,
      });

      if (data.status === "success") {
        setUser({
          ...user,
          ...data.user,
          profileSections: data.user.profileSections ?? normalizedSections,
          teachingFocuses: data.user.teachingFocuses ?? teachingFocuses,
          onboardingStatus: MasterOnboardingStep.SocialLinks,
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
          About your teaching
        </h2>
        <p className="mt-1 text-xs text-[#6B5A42]">
          Add profile tabs and teaching topics shown on your master profile.
        </p>
      </div>

      <TeachingFocusesSection
        teachingFocuses={teachingFocuses}
        onChange={handleTeachingFocusesChange}
        compact
      />

      <ProfileSectionsSection
        sections={profileSections}
        onChange={setProfileSections}
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
