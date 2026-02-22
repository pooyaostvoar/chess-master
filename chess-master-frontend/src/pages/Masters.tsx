import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Search, X } from "lucide-react";
import { findUsers } from "../services/auth";
import type { User } from "../services/auth";
import { MasterCard } from "../components/home/MasterCard";

/** Quick Start intent: label + helper text (transparent about no filtering yet) */
const INTENT_CONFIG: Record<
  string,
  { label: string; helperSuffix: string; searchPlaceholder: string }
> = {
  lesson: {
    label: "1-on-1 Lessons",
    helperSuffix: "1-on-1 lessons",
    searchPlaceholder: "Search coaches and teachers...",
  },
  review: {
    label: "Game Reviews",
    helperSuffix: "game reviews",
    searchPlaceholder: "Search masters for game reviews...",
  },
  play: {
    label: "Play a Master",
    helperSuffix: "play sessions",
    searchPlaceholder: "Search masters to play with...",
  },
  blitz: {
    label: "Blitz Sessions",
    helperSuffix: "blitz sessions",
    searchPlaceholder: "Search masters for blitz sessions...",
  },
  beginner: {
    label: "Beginner-Friendly Sessions",
    helperSuffix: "beginner-friendly sessions",
    searchPlaceholder: "Search beginner-friendly masters...",
  },
};

const Masters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [masters, setMasters] = useState<User[]>([]);
  const [filteredMasters, setFilteredMasters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const navigate = useNavigate();

  // Parse Quick Start intent from URL (TODO: apply to findUsers when API supports it)
  const intent = searchParams.get("intent");
  const intentConfig = intent ? INTENT_CONFIG[intent] : null;

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const response = await findUsers({ isMaster: true });
        setMasters(response.users);
        setFilteredMasters(response.users);
      } catch (err) {
        console.error(err);
        setError("Failed to load masters");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, []);

  useEffect(() => {
    let filtered = masters;

    if (searchTerm) {
      filtered = filtered.filter((m) =>
        m.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minRating) {
      const rating = parseInt(minRating, 10);
      filtered = filtered.filter((m) => m.rating && m.rating >= rating);
    }

    if (maxRating) {
      const rating = parseInt(maxRating, 10);
      filtered = filtered.filter((m) => m.rating && m.rating <= rating);
    }

    setFilteredMasters(filtered);
  }, [searchTerm, minRating, maxRating, masters]);

  const handleScheduleClick = (userId: number) => {
    navigate(`/calendar/${userId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMinRating("");
    setMaxRating("");
    const next = new URLSearchParams(searchParams);
    next.delete("intent");
    setSearchParams(next, { replace: true });
  };

  const clearIntent = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("intent");
    setSearchParams(next, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5" />
        <p className="text-muted-foreground">Loading masters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find Your Chess Master
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse and book sessions with experienced chess masters
        </p>
      </div>

      {/* Intent banner: acknowledge selected intent, transparent that filtering is not yet active */}
      {intentConfig && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-lg mb-1">
                  Looking for: {intentConfig.label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;re showing all masters for now. Session-type filtering is
                  coming soon. You can still browse profiles and choose a master
                  who offers {intentConfig.helperSuffix}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearIntent}
                className="flex-shrink-0"
                data-intent-clear
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TODO: Apply intent to findUsers or client-side filter when API supports it */}

      <Card className="mb-6">
        <CardHeader className="py-4 pb-2">
          <CardTitle className="text-base font-medium">Filter Masters</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <Label htmlFor="search">Search by name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder={
                    intentConfig?.searchPlaceholder ?? "Search masters..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rating">Minimum rating</Label>
              <Input
                id="rating"
                type="number"
                placeholder="e.g., 2000"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="maxRating">Maximum rating</Label>
              <Input
                id="maxRating"
                type="number"
                placeholder="e.g., 2500"
                value={maxRating}
                onChange={(e) => setMaxRating(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || minRating || maxRating || intent) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full md:w-auto mt-1"
            >
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {filteredMasters.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No masters found matching your criteria
            </p>
            {(searchTerm || minRating || maxRating || intent) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredMasters.length} master
              {filteredMasters.length !== 1 && "s"} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMasters.map((master) => (
              <MasterCard
                key={master.id}
                master={master}
                onViewSchedule={handleScheduleClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Masters;
