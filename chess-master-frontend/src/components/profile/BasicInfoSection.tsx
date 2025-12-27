import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface BasicInfoSectionProps {
  username: string;
  email: string;
  phoneNumber?: string | null;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  username,
  email,
  phoneNumber,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Basic Information</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            name="username"
            value={username || ""}
            onChange={onChange}
            placeholder="Your username"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={email || ""}
            onChange={onChange}
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone-number">Phone number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            value={phoneNumber || ""}
            onChange={onChange}
            placeholder="+44 207 946 0958"
          />
        </div>
      </div>
    </div>
  );
};
