import React from "react";
import { Chessboard } from "react-chessboard";

import { useUser } from "../../contexts/UserContext";
import { Game } from "./types";

interface GameBoardProps {
  game: Game;
  onPieceDrop?: ({
    piece,
    sourceSquare,
    targetSquare,
  }: {
    piece: any;
    sourceSquare: string;
    targetSquare: string | null;
  }) => boolean;
  position?: string;
  setPosition?: React.Dispatch<React.SetStateAction<string>>;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  position,
  onPieceDrop,
}) => {
  const { user } = useUser();

  return (
    <div data-game-id={game.id}>
      {user?.id !== undefined && (
        <Chessboard
          options={{
            position,
            onPieceDrop,
            boardOrientation:
              user.id === game.whitePlayerId ? "white" : "black",
          }}
        />
      )}
    </div>
  );
};
