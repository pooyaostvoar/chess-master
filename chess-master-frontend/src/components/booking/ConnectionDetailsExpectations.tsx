import React from "react";
import { MessageCircle, Video, Bell } from "lucide-react";

export const ConnectionDetailsExpectations: React.FC = () => (
  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 text-sm text-muted-foreground">
    <p className="font-medium text-foreground">What happens next</p>
    <ul className="space-y-1.5">
      <li className="flex items-start gap-2">
        <MessageCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Once approved, you can coordinate details in chat.</span>
      </li>
      <li className="flex items-start gap-2">
        <Video className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>If needed, the master will share a video call link before the session.</span>
      </li>
      <li className="flex items-start gap-2">
        <Bell className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>You&apos;ll be notified when updates are available.</span>
      </li>
    </ul>
  </div>
);
