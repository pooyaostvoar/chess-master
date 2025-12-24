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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/masters" element={<Masters />} />
          <Route
            path="/calendar/:userId"
            element={<MasterScheduleCalendar />}
          />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/events" element={<FinishedEvents />} />
          <Route path="/events/:id/edit" element={<EditSlot />} />
          <Route path="/upcoming-events" element={<UpcomingEventsPage />} />
          <Route path="/users/:id" element={<PublicUserProfile />} />
          <Route path="/chat/:otherUserId" element={<ChatPage />} />
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
