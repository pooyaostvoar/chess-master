import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import Chat from "../components/Chat";
import { useUser } from "../contexts/UserContext";

const ChatPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const { otherUserId } = useParams<{ otherUserId: string }>();
  if (userLoading === false && !user) {
    navigate("/login");
    return null;
  }
  return <Chat userId={user?.id!} otherUserId={Number(otherUserId)} />;
};

export default ChatPage;
