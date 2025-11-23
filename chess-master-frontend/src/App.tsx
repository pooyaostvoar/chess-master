import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EditProfile from "./pages/EditProfile";
import Masters from "./pages/Masters";
import MasterScheduleCalendar from "./pages/MasterCalender";
import Layout from "./components/Layout";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/home" element={<Home />} />
          {/* <Route path="/game/:gameId" element={<Game />} /> */}
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/masters" element={<Masters />} />
          <Route
            path="/calender/:userId"
            element={<MasterScheduleCalendar />}
          />
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
