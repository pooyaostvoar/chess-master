import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";

export interface UpdateUserData {
  email?: string;
  username?: string;
  title?: string | null;
  rating?: number | null;
  bio?: string | null;
  isMaster?: boolean;
  profilePicture?: string | null;
  chesscomUrl?: string | null;
  lichessUrl?: string | null;
}

export interface UserFilters {
  username?: string;
  email?: string;
  title?: string;
  isMaster?: boolean;
  minRating?: number;
  maxRating?: number;
}

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  title: string | null;
  rating: number | null;
  bio: string | null;
  isMaster: boolean;
  profilePicture: string | null;
  chesscomUrl: string | null;
  lichessUrl: string | null;
}

/**
 * Format user object to exclude sensitive data
 */
export function formatUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    title: user.title,
    rating: user.rating,
    bio: user.bio,
    isMaster: user.isMaster,
    profilePicture: user.profilePicture,
    chesscomUrl: user.chesscomUrl,
    lichessUrl: user.lichessUrl,
  };
}

/**
 * Format user object with minimal fields (for relations)
 */
export function formatUserMinimal(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  const userRepo = AppDataSource.getRepository(User);
  return await userRepo.findOne({ where: { id: userId } });
}

/**
 * Get authenticated user with safe fields
 */
export async function getAuthenticatedUser(userId: number): Promise<SafeUser | null> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: { id: userId },
    select: [
      "id",
      "username",
      "email",
      "title",
      "rating",
      "bio",
      "isMaster",
      "profilePicture",
      "chesscomUrl",
      "lichessUrl",
    ],
  });

  return user ? formatUser(user) : null;
}

/**
 * Update user by ID
 */
export async function updateUser(
  userId: number,
  data: UpdateUserData
): Promise<SafeUser> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Update fields
  if (data.email !== undefined) user.email = data.email;
  if (data.username !== undefined) user.username = data.username;
  if (data.title !== undefined) user.title = data.title;
  if (data.rating !== undefined) user.rating = data.rating;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.isMaster !== undefined) user.isMaster = data.isMaster;
  if (data.profilePicture !== undefined) user.profilePicture = data.profilePicture;
  if (data.chesscomUrl !== undefined) user.chesscomUrl = data.chesscomUrl;
  if (data.lichessUrl !== undefined) user.lichessUrl = data.lichessUrl;

  await userRepo.save(user);
  return formatUser(user);
}

/**
 * Find users with filters
 */
export async function findUsers(filters: UserFilters): Promise<User[]> {
  const repo = AppDataSource.getRepository(User);
  let qb = repo.createQueryBuilder("user");

  if (filters.username) {
    qb = qb.andWhere("user.username ILIKE :username", {
      username: `%${filters.username}%`,
    });
  }

  if (filters.email) {
    qb = qb.andWhere("user.email ILIKE :email", {
      email: `%${filters.email}%`,
    });
  }

  if (filters.title) {
    qb = qb.andWhere("user.title = :title", { title: filters.title });
  }

  if (filters.isMaster !== undefined) {
    qb = qb.andWhere("user.isMaster = :isMaster", {
      isMaster: filters.isMaster,
    });
  }

  if (filters.minRating) {
    qb = qb.andWhere("user.rating >= :minRating", {
      minRating: filters.minRating,
    });
  }

  if (filters.maxRating) {
    qb = qb.andWhere("user.rating <= :maxRating", {
      maxRating: filters.maxRating,
    });
  }

  return await qb.getMany();
}

