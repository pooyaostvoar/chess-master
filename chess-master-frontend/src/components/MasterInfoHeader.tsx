import React from "react";

interface MasterInfoHeaderProps {
  masterInfo: {
    username: string;
    title?: string | null;
    rating?: number | null;
  };
}

const MasterInfoHeader: React.FC<MasterInfoHeaderProps> = ({ masterInfo }) => {
  return (
    <div className="mb-6 pb-5 border-b border-[#1F1109]/[0.08]">
      <div className="flex items-center gap-2 mb-1">
        <h2
          className="text-2xl sm:text-3xl font-medium text-[#1F1109]"
          style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
        >
          {masterInfo.username}
          {masterInfo.title && (
            <span className="ml-2 text-[10px] font-medium bg-[#3D2817] text-[#F4ECDD] px-2 py-0.5 rounded tracking-[0.06em] align-middle">
              {masterInfo.title}
            </span>
          )}
        </h2>
      </div>
      {masterInfo.rating && (
        <p className="text-xs text-[#6B5640] mb-1.5">
          Rating: <span className="font-medium text-[#1F1109]">{masterInfo.rating}</span>
        </p>
      )}
      <p className="text-xs text-[#B8893D] font-medium">
        Click on green "Available" slots to book a session
      </p>
    </div>
  );
};

export default MasterInfoHeader;
