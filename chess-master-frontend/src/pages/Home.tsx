import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getMyBookings, getMasterBookings } from "../services/bookings";
import { findUsers } from "../services/auth";
import type { Booking } from "../services/bookings";
import type { User } from "../services/auth";
import { HeroSection } from "../components/home/HeroSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { TopMastersSection } from "../components/home/TopMastersSection";
import { RecommendedMastersSection } from "../components/home/RecommendedMastersSection";
import { UpcomingSessionsSection } from "../components/home/UpcomingSessionsSection";
import { CTASection } from "../components/home/CTASection";
import { WelcomeSection } from "../components/home/WelcomeSection";
import { FinishedEventsSection } from "../components/event/FinishedEventsSection";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [topMasters, setTopMasters] = useState<User[]>([]);
  const [recommendedMasters, setRecommendedMasters] = useState<User[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await findUsers({ isMaster: true });
        const mastersWithRating = response.users.filter((m) => m.rating);

        const sorted = mastersWithRating
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);

        setTopMasters(sorted);

        if (user) {
          setBookingsLoading(true);
          let bookings: Booking[] = [];
          try {
            const bookingsRes = await getMyBookings();
            bookings = bookingsRes.bookings || [];
            const upcoming = bookings
              .filter((b) => new Date(b.startTime) > new Date())
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() -
                  new Date(b.startTime).getTime()
              )
              .slice(0, 3);
            setRecentBookings(upcoming);
          } catch (err) {
            console.error("Failed to load bookings", err);
          } finally {
            setBookingsLoading(false);
          }

          const allMasters = response.users;
          const bookingMasterIds = new Set<number>();
          if (!user.isMaster) {
            bookings.forEach((b) => {
              if (b.master?.id) {
                bookingMasterIds.add(b.master.id);
              }
            });
          }

          const recommended = allMasters
            .filter((m) => m.id !== user.id)
            .sort((a, b) => {
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
            })
            .slice(0, 6);

          setRecommendedMasters(recommended);
        }
      } catch (err) {
        console.error("Failed to load masters", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleViewSchedule = (userId: number) => {
    if (user) {
      navigate(`/calendar/${userId}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen">
      {user ? (
        <div className="max-w-7xl mx-auto px-5 py-10">
          {/* <WelcomeSection user={user} /> */}

          <UpcomingSessionsSection
            bookings={recentBookings}
            loading={bookingsLoading}
            currentUser={user}
          />
          <RecommendedMastersSection
            masters={recommendedMasters}
            loading={loading}
            onViewSchedule={handleViewSchedule}
          />
          <FinishedEventsSection />
        </div>
      ) : (
        <>
          <HeroSection />
          <FeaturesSection />
          <div className="max-w-7xl mx-auto px-5 py-16">
            <TopMastersSection
              masters={topMasters}
              loading={loading}
              onViewSchedule={handleViewSchedule}
            />
          </div>
          <CTASection />
        </>
      )}
    </div>
  );
};

export default Home;
