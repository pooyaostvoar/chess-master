import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { Button } from "../ui/button";
import { Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { AccountHeader } from "../profile/AccountHeader";

interface Props {
  event: any;
  onClick: () => void;
}

export const UpcomingEventCard: React.FC<Props> = ({ event, onClick }) => {
  const navigate = useNavigate();
  const { user, loading: isUserloading } = useUser();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const durationMinutes = (end.getTime() - start.getTime()) / 60000;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl m-1">
          {event.title ?? "Blitz session"}
        </CardTitle>
        <AccountHeader user={event.master} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {start.toLocaleString()} · {durationMinutes} min
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-lg font-semibold">${event.price ?? 0}</span>
        </div>

        {/* Book Button */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => {
            if (!user && !isUserloading) {
              navigate("/login");
              return;
            }
            onClick();
          }}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};
