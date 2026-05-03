import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../services/api/game.api";

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<
    "white" | "black" | "random"
  >("random");

  const handleCreateGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const { game } = await createGame(selectedColor);
      navigate(`/game/${game.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 flex flex-col justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-lg w-full">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-blue-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Create a New Game</h1>
          <p className="text-gray-600">Choose your color and start playing</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Select Your Color
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {/* White Option */}
            <button
              onClick={() => setSelectedColor("white")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedColor === "white"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 mb-2 flex items-center justify-center">
                  <span className="text-2xl">♔</span>
                </div>
                <span
                  className={`font-semibold ${
                    selectedColor === "white"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  White
                </span>
              </div>
            </button>

            {/* Black Option */}
            <button
              onClick={() => setSelectedColor("black")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedColor === "black"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-600 mb-2 flex items-center justify-center">
                  <span className="text-2xl text-white">♚</span>
                </div>
                <span
                  className={`font-semibold ${
                    selectedColor === "black"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  Black
                </span>
              </div>
            </button>

            {/* Random Option */}
            <button
              onClick={() => setSelectedColor("random")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedColor === "random"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-800 border-2 border-gray-400 mb-2 flex items-center justify-center">
                  <span className="text-2xl">🎲</span>
                </div>
                <span
                  className={`font-semibold ${
                    selectedColor === "random"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  Random
                </span>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={handleCreateGame}
          disabled={loading}
          className="w-full px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
        >
          {loading ? (
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
              Creating Game...
            </span>
          ) : (
            "Create Game"
          )}
        </button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {selectedColor === "white" && (
              <>
                <span className="font-semibold">You will play as White.</span>
                <br />
                White moves first!
              </>
            )}
            {selectedColor === "black" && (
              <>
                <span className="font-semibold">You will play as Black.</span>
                <br />
                You'll move second.
              </>
            )}
            {selectedColor === "random" && (
              <>
                <span className="font-semibold">
                  Random color will be assigned.
                </span>
                <br />
                Let fate decide your color!
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;
