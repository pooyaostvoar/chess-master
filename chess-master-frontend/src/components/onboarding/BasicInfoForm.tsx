import React, { useState } from "react";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { useUser } from "../../contexts/UserContext";
import { updateUser } from "../../services/auth";
import { CountrySelect } from "../profile/CountrySelect";
import { LanguagesSection } from "../profile/LanguagesSection";

const inputClass =
  "w-full bg-white border border-[#1F1109]/[0.18] rounded-md px-3 py-2 text-xs text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]";

const labelClass = "block text-xs font-medium text-[#3D2817] mb-1";

export const BasicInfoForm: React.FC = () => {
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    name: user?.name ?? "",
    lastname: user?.lastname ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    country: user?.country ?? "",
    hourlyRate: user?.hourlyRate?.toString() ?? "",
    languages: user?.languages ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const data = await updateUser(user.id, {
        username: formData.username,
        email: formData.email,
        name: formData.name || null,
        lastname: formData.lastname || null,
        phoneNumber: formData.phoneNumber || null,
        country: formData.country || null,
        hourlyRate:
          formData.hourlyRate.trim() === ""
            ? null
            : Number.parseFloat(formData.hourlyRate),
        languages: formData.languages,
        onboardingStatus: MasterOnboardingStep.ChessProfile,
      });

      if (data.status === "success") {
        setUser({
          ...user,
          ...data.user,
          onboardingStatus: MasterOnboardingStep.ChessProfile,
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
          Basic information
        </h2>
        <p className="mt-1 text-xs text-[#6B5A42]">
          Tell us a bit about yourself to get started.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="name" className={labelClass}>
              First name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="First name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lastname" className={labelClass}>
              Last name
            </label>
            <input
              id="lastname"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Last name"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="username" className={labelClass}>
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Your username"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className={labelClass}>
            Phone number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+44 207 946 0958"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="country" className={labelClass}>
              Country
            </label>
            <CountrySelect
              country={formData.country}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="hourlyRate" className={labelClass}>
              Hourly rate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8B6F4E]">
                $
              </span>
              <input
                id="hourlyRate"
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`${inputClass} pl-7 text-left`}
              />
            </div>
          </div>
        </div>

        <LanguagesSection
          name="languages"
          languages={formData.languages}
          onChange={handleChange}
          compact
        />
      </div>

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
