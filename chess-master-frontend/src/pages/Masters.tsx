import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Masters: React.FC = () => {
  const [masters, setMasters] = useState<User[]>([]);
  const [filteredMasters, setFilteredMasters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const navigate = useNavigate();

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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Masters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Search by name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search masters..."
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

          {(searchTerm || minRating || maxRating) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full md:w-auto"
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
            {(searchTerm || minRating || maxRating) && (
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
