import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getMyBookings } from "../services/bookings";
import { findUsers } from "../services/auth";
import type { Booking } from "../services/bookings";
import type { User } from "../services/auth";
import { HeroSection } from "../components/home/HeroSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { ArchiveSection } from "../components/home/ArchiveSection";
import { CTASection } from "../components/home/CTASection";
import { TopMastersSection } from "../components/home/TopMastersSection";
import { RecommendedMastersSection } from "../components/home/RecommendedMastersSection";
import { UpcomingSessionsSection } from "../components/home/UpcomingSessionsSection";

import { FinishedEventsSection } from "../components/event/FinishedEventsSection";
import { HomeSectionWrapper } from "../components/home/HomeSectionWrapper";
import { UpcomingEventsSection } from "../components/event/UpcomingEventsSection";
import { useUpcomingEvents } from "../hooks/useUpcomingEvents";

import { sortMastersByEvents } from "../services/users";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: isUserloading } = useUser();
  const [allMasters, setAllMasters] = useState<User[]>([]);
  const [topMasters, setTopMasters] = useState<User[]>([]);
  const [recommendedMasters, setRecommendedMasters] = useState<User[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Search & filter state for non-logged-in hero
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("All languages");

  const {
    events,
    loading: loadingUpcomingEvents,
    refetch: loadEvents,
  } = useUpcomingEvents(3);

  const loadBookings = async () => {
    setBookingsLoading(true);
    let bookings: Booking[] = [];
    try {
      const bookingsRes = await getMyBookings();
      bookings = bookingsRes.bookings || [];
      const upcoming = bookings
        .filter((b) => new Date(b.startTime) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        .slice(0, 3);
      setRecentBookings(upcoming);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setBookingsLoading(false);
    }
    return bookings;
  };

  const loadData = async () => {
    try {
      const response = await findUsers({ isMaster: true });
      const mastersWithRating = response.users.filter((m) => m.rating);

      const sorted = mastersWithRating.sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );

      setAllMasters(sorted);
      setTopMasters(sorted);

      if (user) {
        const bookings = await loadBookings();
        const allFetched = response.users;
        const bookingMasterIds = new Set<number>();
        if (!user.isMaster) {
          bookings.forEach((b) => {
            if (b.master?.id) {
              bookingMasterIds.add(b.master.id);
            }
          });
        }

        const recommended = allFetched.sort((a, b) => {
          if (!user.isMaster) {
            const aHasBooking = bookingMasterIds.has(a.id);
            const bHasBooking = bookingMasterIds.has(b.id);
            if (aHasBooking && !bHasBooking) return -1;
            if (!aHasBooking && bHasBooking) return 1;
          }
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          if (aRating !== bRating) return bRating - aRating;
          return a.id - b.id;
        });
        setRecommendedMasters(recommended);
      }
    } catch (err) {
      console.error("Failed to load masters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Client-side filtering for the non-logged-in view
  const isSearchActive = searchQuery.trim() !== "" || selectedLang !== "All languages";

  const filteredMasters = useMemo(() => {
    let results = allMasters;
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      results = results.filter((m) => {
        const searchableText = [
          m.username,
          m.bio,
          m.title,
          ...(m.languages || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchableText.includes(q);
      });
    }

    if (selectedLang !== "All languages") {
      results = results.filter((m) =>
        m.languages?.some(
          (lang) => lang.toLowerCase() === selectedLang.toLowerCase()
        )
      );
    }

    return results;
  }, [allMasters, searchQuery, selectedLang]);

  const handleViewSchedule = (userId: number) => {
    if (user) {
      navigate(`/calendar/${userId}`);
    } else {
      navigate("/login");
    }
  };
  if (isUserloading) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {user ? (
        <div className="bg-[#FAF5EB] min-h-screen">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
            {recentBookings.length > 0 && (
              <HomeSectionWrapper
                title="Your upcoming sessions"
                path="/bookings"
                buttonText="View all bookings"
              >
                <UpcomingSessionsSection
                  bookings={recentBookings}
                  loading={bookingsLoading}
                  currentUser={user}
                  loadBookings={loadBookings}
                />
              </HomeSectionWrapper>
            )}
            <HomeSectionWrapper
              title="Upcoming events"
              path="/upcoming-events"
              buttonText="View all events"
            >
              <UpcomingEventsSection
                events={events.slice(0, 3)}
                loadEvents={loadEvents}
                loading={loadingUpcomingEvents}
              />
            </HomeSectionWrapper>
            <HomeSectionWrapper
              title="Recommended masters"
              description="Discover talented chess masters to learn from"
              path="/masters"
              buttonText="View all masters"
            >
              <RecommendedMastersSection
                masters={sortMastersByEvents(recommendedMasters, events).slice(
                  0,
                  3
                )}
                loading={loading}
                onViewSchedule={handleViewSchedule}
              />
            </HomeSectionWrapper>
            <HomeSectionWrapper
              title="From the archive"
              description="Watch recordings of past master sessions"
              path="/events"
              buttonText="Browse all"
            >
              <FinishedEventsSection limit={3} searchPhrase={null} />
            </HomeSectionWrapper>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF5EB]">
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLang={selectedLang}
            onLangChange={setSelectedLang}
          />

          {/* Featured Masters */}
          <div className="px-5 sm:px-8 py-8 sm:py-10 border-t border-[#1F1109]/[0.08] max-w-5xl mx-auto">
            <div className="flex justify-between items-baseline mb-5">
              <div>
                <h2
                  className="text-lg font-medium text-[#1F1109]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {isSearchActive ? "Search results" : "Featured masters"}
                </h2>
                <p className="text-xs text-[#6B5640] mt-0.5">
                  {isSearchActive
                    ? `${filteredMasters.length} master${filteredMasters.length !== 1 ? "s" : ""} found`
                    : "Top rated masters available for sessions"}
                </p>
              </div>
              <button
                onClick={() => navigate("/masters")}
                className="text-xs text-[#B8893D] font-medium hover:underline"
              >
                View all →
              </button>
            </div>

            <TopMastersSection
              masters={
                isSearchActive
                  ? filteredMasters.slice(0, 6)
                  : sortMastersByEvents(topMasters, events).slice(0, 3)
              }
              loading={loading}
              onViewSchedule={handleViewSchedule}
            />

            {isSearchActive && filteredMasters.length > 6 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate("/masters")}
                  className="text-sm text-[#B8893D] font-medium hover:underline"
                >
                  View all {filteredMasters.length} results →
                </button>
              </div>
            )}
          </div>

          <HowItWorksSection />

          <ArchiveSection />

          <CTASection />
        </div>
      )}
    </div>
  );
};

export default Home;
