import React, { useEffect, useState } from "react";
import { getUnreadSenders, UnreadSender } from "../services/api/messages.api";
import { useNavigate } from "react-router-dom";

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
    <div className="bg-white md:p-4 p-2 w-full h-full overflow-y-auto">
      <h3 className="font-semibold text-lg mb-4 hidden md:block">
        Unread Messages
      </h3>
      <ul className="space-y-2">
        {senders.map((sender) => (
          <li
            key={sender.userId}
            className="flex md:justify-between justify-center items-center p-2 hover:bg-gray-100 cursor-pointer rounded transition-colors relative"
            onClick={() => navigate(`/chat/${sender.userId}`)}
            title={sender.username}
          >
            <div className="flex items-center md:space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center relative">
                {sender.profilePictureThumbnailUrl ? (
                  <img
                    src={sender.profilePictureThumbnailUrl}
                    alt={sender.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
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
              <span className="bg-red-500 text-white rounded-full px-2 text-sm font-bold hidden md:block">
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
