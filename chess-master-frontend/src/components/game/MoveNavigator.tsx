import React from "react";

type Move = {
  from: string;
  to: string;
  piece: string;
};

type MoveNavigatorProps = {
  moves: Move[];
  currentIndex: number;

  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  onSelect: (index: number) => void;
};

export const MoveNavigator: React.FC<MoveNavigatorProps> = ({
  moves,
  currentIndex,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onSelect,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border space-y-3">
      {/* Navigation */}
      <div className="flex gap-2">
        <button onClick={onFirst} disabled={currentIndex === 0}>
          ⏮
        </button>
        <button onClick={onPrevious} disabled={currentIndex === 0}>
          ◀
        </button>
        <button onClick={onNext} disabled={currentIndex === moves.length - 1}>
          ▶
        </button>
        <button onClick={onLast} disabled={currentIndex === moves.length - 1}>
          ⏭
        </button>
      </div>

      {/* Move List */}
      <div className="max-h-48 overflow-y-auto text-sm space-y-1">
        {moves.length === 0 && (
          <div className="text-gray-400">No moves yet</div>
        )}

        {moves.map((move, index) => (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`cursor-pointer px-2 py-1 rounded ${
              index === currentIndex
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            {index + 1}. {formatMove(move)}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= helpers ================= */

function formatMove(move: { from: string; to: string; piece: string }) {
  return `${pieceSymbol(move.piece)} ${move.from} → ${move.to}`;
}

function pieceSymbol(piece: string) {
  switch (piece?.toLowerCase()) {
    case "p":
    case "pawn":
      return "♙";
    case "r":
    case "rook":
      return "♖";
    case "n":
    case "knight":
      return "♘";
    case "b":
    case "bishop":
      return "♗";
    case "q":
    case "queen":
      return "♕";
    case "k":
    case "king":
      return "♔";
    default:
      return piece;
  }
}
