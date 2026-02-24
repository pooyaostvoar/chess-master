import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getMyBookings } from "../services/bookings";
import { findUsers } from "../services/auth";
import type { Booking } from "../services/bookings";
import type { User } from "../services/auth";
import { HeroSection } from "../components/home/HeroSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { FeaturedSessionTypesSection } from "../components/home/FeaturedSessionTypesSection";
import { TopMastersSection } from "../components/home/TopMastersSection";
import { RecommendedMastersSection } from "../components/home/RecommendedMastersSection";
import { UpcomingSessionsSection } from "../components/home/UpcomingSessionsSection";
import { CTASection } from "../components/home/CTASection";

import { FinishedEventsSection } from "../components/event/FinishedEventsSection";
import { HomeSectionWrapper } from "../components/home/HomeSectionWrapper";
import { UpcomingEventsSection } from "../components/event/UpcomingEventsSection";
import { useUpcomingEvents } from "../hooks/useUpcomingEvents";

import { sortMastersByEvents } from "../services/users";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: isUserloading } = useUser();
  const [topMasters, setTopMasters] = useState<User[]>([]);
  const [recommendedMasters, setRecommendedMasters] = useState<User[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);

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
      const response = await findUsers({ isMaster: true, limit: 3 });
      const mastersWithRating = response.users.filter((m) => m.rating);

      const sorted = mastersWithRating.sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );

      setTopMasters(sorted);

      if (user) {
        const bookings = await loadBookings();
        const allMasters = response.users;
        const bookingMasterIds = new Set<number>();
        if (!user.isMaster) {
          bookings.forEach((b) => {
            if (b.master?.id) {
              bookingMasterIds.add(b.master.id);
            }
          });
        }

        const recommended = allMasters.sort((a, b) => {
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
        <div className="max-w-7xl mx-auto px-5 py-10">
          {/* <WelcomeSection user={user} /> */}
          {recentBookings.length > 0 && (
            <HomeSectionWrapper
              title="Your Upcoming Sessions"
              path="/bookings"
              buttonText="View All Bookings"
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
            title="Upcoming Events"
            path="/upcoming-events"
            buttonText="View All Events"
          >
            <UpcomingEventsSection
              events={events.slice(0, 3)}
              loadEvents={loadEvents}
              loading={loadingUpcomingEvents}
            />
          </HomeSectionWrapper>
          <HomeSectionWrapper
            title="Recommended Masters"
            description="Discover talented chess masters to learn from"
            path="/masters"
            buttonText="View All Masters"
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
            title="Events Archive"
            description="Watch recordings of past master sessions"
            path="/events"
            buttonText="View All Events"
          >
            <FinishedEventsSection limit={3} searchPhrase={null} />
          </HomeSectionWrapper>
        </div>
      ) : (
        <>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <FeaturedSessionTypesSection />
          <div className="max-w-7xl mx-auto px-5 py-16">
            <HomeSectionWrapper
              title="Upcoming Events"
              path="/upcoming-events"
              buttonText="View All Events"
            >
              <UpcomingEventsSection
                events={events.slice(0, 3)}
                loadEvents={loadEvents}
                loading={loadingUpcomingEvents}
              />
            </HomeSectionWrapper>
            <HomeSectionWrapper
              title="Top Rated Masters"
              description="Meet our highest-rated chess masters"
              path="/masters"
              buttonText="View All Masters"
            >
              <TopMastersSection
                masters={sortMastersByEvents(topMasters, events).slice(0, 3)}
                loading={loading}
                onViewSchedule={handleViewSchedule}
              />
            </HomeSectionWrapper>
            <HomeSectionWrapper
              title="Events Archive"
              description="Watch recordings of past master sessions"
              path="/events"
              buttonText="View All Events"
            >
              <FinishedEventsSection limit={3} searchPhrase={null} />
            </HomeSectionWrapper>
          </div>
          <CTASection />
        </>
      )}
    </div>
  );
};

export default Home;
