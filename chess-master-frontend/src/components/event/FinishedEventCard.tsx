import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { PlayCircle } from "lucide-react";

interface FinishedEvent {
  id: number;
  title: string;
  youtubeId: string;
  master: {
    id: number;
    username: string;
    profilePicture?: string;
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
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onPlay(event.youtubeId)}
    >
      <CardHeader>
        <div className="flex items-center gap-4 mb-3">
          {event.master.profilePicture ? (
            <img
              src={event.master.profilePicture}
              alt={event.master.username}
              className="w-12 h-12 rounded-full object-cover border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {event.master.username.charAt(0)}
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <Badge variant="outline" className="mt-1">
              {event.master.username}
            </Badge>
          </div>
        </div>

        {/* Small Video Preview Box */}
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
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground text-center">
          Click to watch recording
        </p>
      </CardContent>
    </Card>
  );
};
