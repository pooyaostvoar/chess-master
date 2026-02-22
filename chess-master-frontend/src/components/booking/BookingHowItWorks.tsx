import React from "react";
import { ShieldCheck, UserCheck, MessageCircle } from "lucide-react";

export const BookingHowItWorks: React.FC = () => (
  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
    <p className="text-sm font-semibold text-foreground mb-3">How it works</p>
    <ol className="space-y-2 text-sm text-muted-foreground">
      <li className="flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <span>Pay securely — your payment is protected</span>
      </li>
      <li className="flex items-start gap-2">
        <UserCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <span>The master reviews your request</span>
      </li>
      <li className="flex items-start gap-2">
        <MessageCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <span>Once approved, coordinate in chat and receive session details</span>
      </li>
    </ol>
  </div>
);
