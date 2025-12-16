import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  event: any;
  onClick: () => void;
}

export const UpcomingEventCard: React.FC<Props> = ({ event, onClick }) => {
  const navigate = useNavigate();

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const durationMinutes = (end.getTime() - start.getTime()) / 60000;

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
            <CardTitle className="text-lg">
              {event.title || "Live Chess Session"}
            </CardTitle>
            <Badge variant="outline" className="mt-1">
              {event.master.username}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {start.toLocaleString()} · {durationMinutes} min
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-lg font-semibold">${10}</span>
        </div>

        {/* Book Button */}
        <Button className="w-full" onClick={() => onClick()}>
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};
