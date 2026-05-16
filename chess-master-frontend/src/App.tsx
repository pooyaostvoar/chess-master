import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import Masters from "./pages/Masters";
import MasterScheduleCalendar from "./pages/MasterCalender";
import MyBookings from "./pages/MyBookings";
import Layout from "./components/Layout";
import FinishedEvents from "./pages/FinishedEvents";
import EditSlot from "./pages/EditSlot";
import { UpcomingEventsPage } from "./pages/UpcomingEvents";
import PublicUserProfile from "./pages/PublicUserProfile";
import ChatPage from "./pages/ChatPage";
import { PushPrompt } from "./components/push/PushPrompt";
import { useUser } from "./contexts/UserContext";
import ReserveSlotPage from "./pages/ReserveSlotPage";
import { ScheduleProvider } from "./contexts/ScheduleContext";

import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import Game from "./components/game/Game";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import PaymentResultPage from "./pages/PaymentResultPage";

import MasterProfilePage from "./pages/MasterProfilePage";
import BlogPostPage from "./pages/BlogPostPage";
import UpdateSlotStatusPage from "./pages/UpdateSlotStatusPage";
import { RequireAuth } from "./components/RequireAuth";

const App: React.FC = () => {
  const { user } = useUser();
  return (
    <>
      {user?.id && <PushPrompt />}
      <ScheduleProvider userId={user?.id?.toString()}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route
                path="/master-profile/:username"
                element={<MasterProfilePage />}
              />
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <RequireAuth>
                    <EditProfile />
                  </RequireAuth>
                }
              />
              <Route path="/masters" element={<Masters />} />
              <Route
                path="/calendar/:userId"
                element={<MasterScheduleCalendar />}
              />
              <Route
                path="/bookings"
                element={
                  <RequireAuth>
                    <MyBookings />
                  </RequireAuth>
                }
              />
              <Route path="/events" element={<FinishedEvents />} />
              <Route
                path="/events/:id/edit"
                element={
                  <RequireAuth>
                    <EditSlot />
                  </RequireAuth>
                }
              />
              <Route path="/upcoming-events" element={<UpcomingEventsPage />} />
              <Route path="/users/:id" element={<PublicUserProfile />} />
              <Route
                path="/chat"
                element={
                  <RequireAuth>
                    <ChatPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/chat/:otherUserId"
                element={
                  <RequireAuth>
                    <ChatPage />
                  </RequireAuth>
                }
              />
              <Route path="/events/:id" element={<ReserveSlotPage />} />
              <Route path="/game/:id" element={<Game />} />
              <Route
                path="/create-game"
                element={
                  <RequireAuth>
                    <CreateGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/join-game/:gameId"
                element={
                  <RequireAuth>
                    <JoinGame />
                  </RequireAuth>
                }
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/posts/:slug" element={<BlogPostPage />} />
              <Route
                path="/success"
                element={
                  <RequireAuth>
                    <PaymentResultPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/update-slot-status/:slotId/:newStatus"
                element={
                  <RequireAuth>
                    <UpdateSlotStatusPage />
                  </RequireAuth>
                }
              />
              <Route path="/:username" element={<MasterProfilePage />} />
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </ScheduleProvider>
    </>
  );
};

export default App;
