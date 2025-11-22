import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../services/auth";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getAuthUser();
      if (response.status === 401) {
        navigate("/login"); // redirect to login if unauthorized
      } else {
        setUser(response.data.user?.username || "Unknown");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Home Page</h2>
      {user ? <p>Welcome, {user}!</p> : <p>Loading...</p>}
    </div>
  );
};

export default Home;
