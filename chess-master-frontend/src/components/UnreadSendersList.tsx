import React, { useEffect, useState } from "react";
import { getUnreadSenders, UnreadSender } from "../services/api/messages.api";
import { useNavigate } from "react-router-dom";
import { getMediaUrl } from "../services/config";

interface UnreadSendersListProps {
  userId: number;
}

const UnreadSendersList: React.FC<UnreadSendersListProps> = ({ userId }) => {
  const [senders, setSenders] = useState<UnreadSender[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        const data = await getUnreadSenders(userId);
        setSenders(data);
      } catch (error) {
        console.error("Failed to fetch unread senders", error);
      }
    };

    fetchSenders();
    // Poll every 30 seconds
    const interval = setInterval(fetchSenders, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  if (senders.length === 0) {
    return null; // Or a message saying "No unread messages" if preferred
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[#FAF5EB] p-1.5 md:p-4">
      <h3
        className="mb-4 hidden text-sm font-medium text-[#1F1109] md:block"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Chats
      </h3>
      <ul className="space-y-2">
        {senders.map((sender) => (
          <li
            key={sender.userId}
            className="relative flex cursor-pointer items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-[#F4ECDD] md:justify-between md:p-2"
            onClick={() => navigate(`/chat/${sender.userId}`)}
            title={sender.username}
          >
            <div className="flex items-center md:space-x-2">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#1F1109] md:h-10 md:w-10">
                {sender.profilePictureThumbnailUrl ? (
                  <img
                    src={getMediaUrl(sender.profilePictureThumbnailUrl)}
                    alt={sender.username}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[#F4ECDD]">
                    {sender.username.charAt(0).toUpperCase()}
                  </span>
                )}
                {sender.unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white md:hidden"></span>
                )}
              </div>
              <span className="hidden md:block truncate max-w-[120px]">
                {sender.username}
              </span>
            </div>
            {sender.unreadCount > 0 && (
              <span className="hidden rounded-full bg-[#7A2E2E] px-2 text-sm font-medium text-white md:block">
                {sender.unreadCount}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnreadSendersList;
