import React, { useState } from "react";
import { FinishedEventsSection } from "../components/event/FinishedEventsSection";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";

const FinishedEvents: React.FC = () => {
  const [searchPhrase, setSearchPhrase] = useState<string>("");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Events Archive</h1>
        <p className="text-muted-foreground text-lg">
          Watch recordings of past master sessions
        </p>
      </div>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or master name..."
            value={searchPhrase}
            onChange={(e) => setSearchPhrase(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <FinishedEventsSection limit={null} searchPhrase={searchPhrase || null} />
    </div>
  );
};

export default FinishedEvents;
