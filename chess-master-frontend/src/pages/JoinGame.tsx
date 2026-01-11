import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  joinGame,
  getGameById,
  Game as GameType,
} from "../services/api/game.api";
import { useUser } from "../contexts/UserContext";

const JoinGame: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user, loading: isUserLoading } = useUser();
  const [game, setGame] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        setError("Game ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { game } = await getGameById(gameId);
        setGame(game);

        // Check if game already has two players
        if (game.blackPlayerId !== null && game.whitePlayerId !== null) {
          setError("This game already has two players");
        }

        // Check if user is trying to join their own game
        if (user && game.whitePlayerId === user.id) {
          setError("You cannot join your own game");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isUserLoading) {
      fetchGame();
    }
  }, [gameId, isUserLoading, user]);

  const handleJoinGame = async () => {
    if (!gameId || !user) return;

    setJoining(true);
    setError(null);

    try {
      await joinGame(gameId);
      // Navigate to the game page after successfully joining
      navigate(`/game/${gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (isUserLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 text-center flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-5 flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to join this game</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-5 flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Unable to Join Game
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/create-game")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Game
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-5 text-center flex justify-center items-center min-h-screen">
        <div>Game not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 flex justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-lg w-full">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-green-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Join Chess Game</h1>
          <p className="text-gray-600">
            You've been invited to play a chess game
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Game Details</p>
          <p className="text-xs text-gray-500 mb-2">Game ID: {game.id}</p>
          <p className="text-sm">
            <span className="font-semibold">You will play as:</span>{" "}
            <span className="text-gray-800">Black</span>
          </p>
        </div>

        <button
          onClick={handleJoinGame}
          disabled={joining}
          className="w-full px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
        >
          {joining ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Joining Game...
            </span>
          ) : (
            "Join Game"
          )}
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
