import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Game: React.FC = () => {
  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h2>Game ID:</h2>
      <p>Player 1: </p>
      <p>Player 2: </p>
      {/* Here you can add your chess board component */}
    </div>
  );
};

export default Game;
