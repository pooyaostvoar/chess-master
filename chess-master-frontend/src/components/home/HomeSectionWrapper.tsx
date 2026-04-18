import React from "react";
import { useNavigate } from "react-router-dom";

interface HomeSectionWrapperProps {
  title: string;
  description?: string;
  path: string;
  buttonText?: string;
  children: React.ReactNode;
}

export const HomeSectionWrapper: React.FC<HomeSectionWrapperProps> = ({
  title,
  description,
  path,
  buttonText = "View all",
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-10">
      <div className="flex justify-between items-baseline mb-5">
        <div>
          <h2
            className="text-lg font-medium text-[#1F1109]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[#6B5640] mt-0.5">{description}</p>
          )}
        </div>
        <button
          onClick={() => navigate(path)}
          className="text-xs text-[#B8893D] font-medium hover:underline whitespace-nowrap"
        >
          {buttonText} →
        </button>
      </div>
      {children}
    </div>
  );
};
