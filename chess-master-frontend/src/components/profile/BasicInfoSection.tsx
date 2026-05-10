import React from "react";

interface BasicInfoSectionProps {
  username: string;
  email: string;
  name?: string | null;
  lastname?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  username,
  email,
  name,
  lastname,
  phoneNumber,
  location,
  onChange,
}) => {
  const inputClass =
    "w-full bg-white border border-[#1F1109]/[0.18] rounded-lg px-3.5 py-[11px] text-[13px] text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Basic information</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="username" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Username</label>
          <input id="username" type="text" name="username" value={username || ""} onChange={onChange} placeholder="Your username" className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Email</label>
          <input id="email" type="email" name="email" value={email || ""} onChange={onChange} placeholder="your.email@example.com" className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="name" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">First name</label>
            <input id="name" type="text" name="name" value={name || ""} onChange={onChange} placeholder="First name" className={inputClass} />
          </div>
          <div>
            <label htmlFor="lastname" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Last name</label>
            <input id="lastname" type="text" name="lastname" value={lastname || ""} onChange={onChange} placeholder="Last name" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Phone number</label>
          <input id="phoneNumber" type="tel" name="phoneNumber" value={phoneNumber || ""} onChange={onChange} placeholder="+44 207 946 0958" className={inputClass} />
        </div>
        <div>
          <label htmlFor="location" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Location</label>
          <input id="location" type="text" name="location" value={location || ""} onChange={onChange} placeholder="City, Country" className={inputClass} />
        </div>
      </div>
    </div>
  );
};
