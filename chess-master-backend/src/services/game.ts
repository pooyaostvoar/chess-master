import { AppDataSource } from "../database/datasource";
import { Game } from "../database/entity/game";

export async function createGame(
  userId: number,
  color: "white" | "black" | "random"
): Promise<Game> {
  const gameRepo = AppDataSource.getRepository(Game);

  let whitePlayerId: number | null;
  let blackPlayerId: number | null;

  if (color === "random") {
    // Randomly assign color
    const isWhite = Math.random() < 0.5;
    whitePlayerId = isWhite ? userId : null;
    blackPlayerId = isWhite ? null : userId;
  } else if (color === "white") {
    whitePlayerId = userId;
    blackPlayerId = null;
  } else {
    // color === "black"
    whitePlayerId = null;
    blackPlayerId = userId;
  }

  const game = gameRepo.create({
    whitePlayerId,
    blackPlayerId,
    moves: [],
    finished: false,
  });

  return await gameRepo.save(game);
}

export async function joinGame(gameId: string, userId: number): Promise<Game> {
  const gameRepo = AppDataSource.getRepository(Game);

  const game = await gameRepo.findOne({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.whitePlayerId === null) {
    game.whitePlayerId = userId;
  } else if (game.blackPlayerId === null) {
    game.blackPlayerId = userId;
  } else {
    throw new Error("Game already has two players");
  }

  return await gameRepo.save(game);
}

export async function updateGameMoves(
  gameId: string,
  moves: { from: string; to: string; piece: string }[]
): Promise<Game> {
  const gameRepo = AppDataSource.getRepository(Game);

  const game = await gameRepo.findOne({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  game.moves = moves;
  return await gameRepo.save(game);
}

export async function finishGame(gameId: string): Promise<Game> {
  const gameRepo = AppDataSource.getRepository(Game);

  const game = await gameRepo.findOne({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  game.finished = true;
  return await gameRepo.save(game);
}

export async function getGameById(gameId: string): Promise<Game | null> {
  const gameRepo = AppDataSource.getRepository(Game);

  return await gameRepo.findOne({
    where: { id: gameId },
  });
}
