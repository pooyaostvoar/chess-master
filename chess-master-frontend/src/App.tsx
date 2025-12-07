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
import { testUtil } from "@chess-master/utils";

const App: React.FC = () => {
  console.log(testUtil(), "aaaaaaaaa");
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
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
