import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Game from "./pages/Game";
import EditProfile from "./pages/EditProfile";
import Masters from "./pages/Masters";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/masters" element={<Masters />} />
      </Routes>
    </Router>
  );
};

export default App;
