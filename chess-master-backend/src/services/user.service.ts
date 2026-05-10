import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import type { LichessRatingsMap, ProfileSections } from "../database/entity/user";
import { UserStatus } from "../database/entity/types";

export interface UpdateUserData {
  email?: string;
  username?: string;
  name?: string | null;
  lastname?: string | null;
  title?: string | null;
  rating?: number | null;
  bio?: string | null;
  profileSections?: ProfileSections | null;
  isMaster?: boolean;
  status?: UserStatus;
  profilePictureThumbnailUrl?: string | null;
  chesscomUrl?: string | null;
  lichessUrl?: string | null;
  lichessRatings?: LichessRatingsMap | null;
  hourlyRate?: number | null;
  languages?: string[] | null;
  teachingFocuses?: string[] | null;
  phoneNumber?: string | null;
  location?: string | null;
  twitchUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
}

export interface UserFilters {
  username?: string;
  email?: string;
  title?: string;
  isMaster?: boolean;
  minRating?: number;
  maxRating?: number;
  limit?: number;
}

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  name: string | null;
  lastname: string | null;
  title: string | null;
  rating: number | null;
  bio: string | null;
  profileSections: ProfileSections | null;
  isMaster: boolean;
  status: UserStatus;
  profilePictureThumbnailUrl: string | null;
  chesscomUrl: string | null;
  lichessUrl: string | null;
  lichessRatings: LichessRatingsMap | null;
  hourlyRate: number | null;
  languages?: string[] | null;
  teachingFocuses?: string[] | null;
  location?: string | null;
  twitchUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
}

/**
 * Format user object to exclude sensitive data
 */
export function formatUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    lastname: user.lastname,
    title: user.title,
    rating: user.rating,
    bio: user.bio,
    profileSections: user.profileSections,
    isMaster: user.isMaster,
    status: user.status,
    profilePictureThumbnailUrl: user.profilePictureThumbnailUrl,
    chesscomUrl: user.chesscomUrl,
    lichessUrl: user.lichessUrl,
    lichessRatings: user.lichessRatings,
    hourlyRate: user.hourlyRate,
    languages: user.languages,
    teachingFocuses: user.teachingFocuses,
    location: user.location,
    twitchUrl: user.twitchUrl,
    youtubeUrl: user.youtubeUrl,
    instagramUrl: user.instagramUrl,
    xUrl: user.xUrl,
    facebookUrl: user.facebookUrl,
    tiktokUrl: user.tiktokUrl,
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
    profilePictureThumbnailUrl: user.profilePictureThumbnailUrl,
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
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const userRepo = AppDataSource.getRepository(User);
  return await userRepo.findOne({ where: { username } });
}

/**
 * Update user by ID
 */
export async function updateUser(
  userId: number,
  data: UpdateUserData
): Promise<SafeUser> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Update user fields
  if (data.email !== undefined) user.email = data.email;
  if (data.username !== undefined) user.username = data.username;
  if (data.name !== undefined) user.name = data.name;
  if (data.lastname !== undefined) user.lastname = data.lastname;
  if (data.title !== undefined) user.title = data.title;
  if (data.rating !== undefined) user.rating = data.rating;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.profileSections !== undefined) user.profileSections = data.profileSections;
  if (data.isMaster !== undefined) user.isMaster = data.isMaster;
  if (data.status !== undefined) user.status = data.status;
  if (data.profilePictureThumbnailUrl !== undefined)
    user.profilePictureThumbnailUrl = data.profilePictureThumbnailUrl;
  if (data.chesscomUrl !== undefined) user.chesscomUrl = data.chesscomUrl;
  if (data.lichessUrl !== undefined) user.lichessUrl = data.lichessUrl;
  if (data.lichessRatings !== undefined) {
    user.lichessRatings = data.lichessRatings;
  }
  if (data.hourlyRate !== undefined) {
    user.hourlyRate = data.hourlyRate;
  }
  if (data.languages !== undefined) {
    user.languages = data.languages;
  }
  if (data.teachingFocuses !== undefined) {
    user.teachingFocuses = data.teachingFocuses;
  }
  if (data.phoneNumber !== undefined) {
    user.phoneNumber = data.phoneNumber;
  }
  if (data.location !== undefined) {
    user.location = data.location;
  }
  if (data.twitchUrl !== undefined) {
    user.twitchUrl = data.twitchUrl;
  }
  if (data.youtubeUrl !== undefined) {
    user.youtubeUrl = data.youtubeUrl;
  }
  if (data.instagramUrl !== undefined) {
    user.instagramUrl = data.instagramUrl;
  }
  if (data.xUrl !== undefined) {
    user.xUrl = data.xUrl;
  }
  if (data.facebookUrl !== undefined) {
    user.facebookUrl = data.facebookUrl;
  }
  if (data.tiktokUrl !== undefined) {
    user.tiktokUrl = data.tiktokUrl;
  }

  await userRepo.save(user);

  const updatedUser = await userRepo.findOne({
    where: { id: userId },
  });

  return formatUser(updatedUser || user);
}

/**
 * Find users with filters
 */
export async function findUsers(filters: UserFilters): Promise<User[]> {
  const repo = AppDataSource.getRepository(User);
  let qb = repo.createQueryBuilder("user");

  qb = qb.andWhere("user.status = :status", { status: UserStatus.Active });

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

  if (filters.limit) {
    qb = qb.limit(filters.limit);
  }

  return await qb.getMany();
}
