import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { PlayCircle } from "lucide-react";
import { AccountHeader } from "../profile/AccountHeader";

interface FinishedEvent {
  id: number;
  title: string;
  youtubeId: string;
  master: {
    id: number;
    username: string;
    profilePictureThumbnailUrl?: string;
  };
}

interface FinishedEventCardProps {
  event: FinishedEvent;
  onPlay: (youtubeId: string) => void;
}

export const FinishedEventCard: React.FC<FinishedEventCardProps> = ({
  event,
  onPlay,
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{event.title ?? "Title"}</CardTitle>

        <AccountHeader user={event.master as any} />
      </CardHeader>

      <CardContent onClick={() => onPlay(event.youtubeId)}>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img
            src={`https://img.youtube.com/vi/${event.youtubeId}/hqdefault.jpg`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <PlayCircle className="w-14 h-14 text-white" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Click to watch recording
        </p>
      </CardContent>
    </Card>
  );
};
