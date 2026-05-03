import { AppDataSource } from "../database/datasource";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { SlotStatus } from "../database/entity/types";
import { User } from "../database/entity/user";
import type { BaseUser } from "@chess-master/schemas";
import { EntityManager, In } from "typeorm";
import { formatUserMinimal } from "./user.service";
import {
  sendNotificationEmail,
  sendNotificationToTelegram,
} from "./notification.service";
import {
  sendReservationEmail,
  sendReservationRequestEmail,
} from "./brevo_email";

export interface CreateSlotData {
  masterId: number;
  startTime: Date;
  endTime: Date;
}

export interface SafeSlot {
  id: number;
  title?: string | null;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  master?: {
    id: number;
    username: string;
    email: string;
    title: string | null;
    rating: number | null;
    profilePictureThumbnailUrl: string | null;
    chesscomUrl: string | null;
    lichessUrl: string | null;
  };
  reservedBy?: {
    id: number;
    username: string;
    email: string;
    profilePictureThumbnailUrl: string | null;
  } | null;
  price: number | null;
}

/**
 * Format slot with safe user data
 */
export function formatSlot(slot: ScheduleSlot): SafeSlot {
  const formatted: SafeSlot = {
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status as SlotStatus,
    price: slot.price,
    title: slot.title,
  };

  if (slot.master) {
    formatted.master = {
      id: slot.master.id,
      username: slot.master.username,
      email: slot.master.email,
      title: slot.master.title,
      rating: slot.master.rating,
      profilePictureThumbnailUrl: slot.master.profilePictureThumbnailUrl,
      chesscomUrl: slot.master.chesscomUrl,
      lichessUrl: slot.master.lichessUrl,
    };
  }

  if (slot.reservedBy) {
    formatted.reservedBy = formatUserMinimal(slot.reservedBy);
  } else {
    formatted.reservedBy = null;
  }

  return formatted;
}

/** Maps a User entity to `userSchemaBase` shape for Zod-validated API payloads */
export function mapUserToSchemaBase(user: User): BaseUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    lastname: user.lastname,
    isMaster: user.isMaster,
    title: user.title,
    rating: user.rating,
    bio: user.bio,
    profilePictureThumbnailUrl: user.profilePictureThumbnailUrl,
    profilePictureUrl: user.profilePictureUrl,
    chesscomUrl: user.chesscomUrl,
    lichessUrl: user.lichessUrl,
    lichessRatings: user.lichessRatings as BaseUser["lichessRatings"],
    schedule: undefined,
    hourlyRate: user.hourlyRate != null ? Number(user.hourlyRate) : null,
    languages: user.languages ?? undefined,
    teachingFocuses: user.teachingFocuses ?? undefined,
    phoneNumber: user.phoneNumber,
    twitchUrl: user.twitchUrl,
    youtubeUrl: user.youtubeUrl,
    instagramUrl: user.instagramUrl,
    xUrl: user.xUrl,
    facebookUrl: user.facebookUrl,
    tiktokUrl: user.tiktokUrl,
    avgReviewRating:
      user.avgReviewRating != null && user.avgReviewRating !== ""
        ? Number(user.avgReviewRating)
        : null,
    studentsCount:
      user.studentsCount != null && user.studentsCount !== ""
        ? Number(user.studentsCount)
        : null,
  };
}

/**
 * Slot shape validated by `scheduleSlotSchema` — use for GET /schedule/slot/user/:userId
 */
export function formatMasterScheduleSlot(slot: ScheduleSlot) {
  if (!slot.master) {
    throw new Error("formatMasterScheduleSlot requires slot.master");
  }
  return {
    id: slot.id,
    master: mapUserToSchemaBase(slot.master),
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status as SlotStatus,
    title: slot.title,
    youtubeId: slot.youtubeId,
    reservedBy: slot.reservedBy ? mapUserToSchemaBase(slot.reservedBy) : null,
    price: slot.price != null ? Number(slot.price) : null,
    chunkIndex: slot.chunkIndex,
    periodicSlotConfig: slot.periodicSlotConfig
      ? {
          id: slot.periodicSlotConfig.id,
          chunkSizeMinutes: slot.periodicSlotConfig.chunkSizeMinutes,
          period: slot.periodicSlotConfig.period,
          repeatCount: slot.periodicSlotConfig.repeatCount,
        }
      : null,
  };
}

/** Periodic batch UPDATE response: same slot fields as the calendar GET, without user relations. */
export function formatUpdatePeriodicBatchSlotResponse(slot: ScheduleSlot) {
  return {
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status as SlotStatus,
    title: slot.title,
    youtubeId: slot.youtubeId,
    price: slot.price != null ? Number(slot.price) : null,
    chunkIndex: slot.chunkIndex,
    periodicSlotConfig: slot.periodicSlotConfig
      ? {
          id: slot.periodicSlotConfig.id,
          chunkSizeMinutes: slot.periodicSlotConfig.chunkSizeMinutes,
          period: slot.periodicSlotConfig.period,
          repeatCount: slot.periodicSlotConfig.repeatCount,
        }
      : null,
  };
}

/**
 * Create a new schedule slot
 */
export async function createSlot(data: CreateSlotData): Promise<ScheduleSlot> {
  // Prevent creating slots in the past
  const now = new Date();
  if (new Date(data.startTime) < now) {
    throw new Error("Cannot create time slots in the past");
  }

  const repo = AppDataSource.getRepository(ScheduleSlot);
  const slot = repo.create({
    master: { id: data.masterId } as User,
    startTime: data.startTime,
    endTime: data.endTime,
  });

  return await repo.save(slot);
}

/**
 * Get slots for a specific master
 */
export async function getSlotsByMaster(
  userId: number
): Promise<ScheduleSlot[]> {
  const repo = AppDataSource.getRepository(ScheduleSlot);

  return await repo
    .createQueryBuilder("slot")
    .leftJoinAndSelect("slot.master", "master")
    .leftJoinAndSelect("slot.reservedBy", "reservedBy")
    .leftJoinAndSelect("slot.periodicSlotConfig", "periodicSlotConfig")
    .where("slot.master = :userId", { userId })
    .orderBy("slot.startTime", "ASC")
    .getMany();
}

/**
 * Master's slots that are still free and start in the future
 */
export async function getMasterActiveFreeSlots(
  masterId: number
): Promise<ScheduleSlot[]> {
  const repo = AppDataSource.getRepository(ScheduleSlot);
  const now = new Date();

  return await repo
    .createQueryBuilder("slot")
    .where("slot.master = :masterId", { masterId })
    .andWhere("slot.status = :status", { status: SlotStatus.Free })
    .andWhere("slot.startTime > :now", { now })
    .orderBy("slot.startTime", "ASC")
    .getMany();
}

/**
 * Get slot by ID with relations
 */
export async function getSlotById(
  slotId: number
): Promise<ScheduleSlot | null> {
  const repo = AppDataSource.getRepository(ScheduleSlot);
  return await repo.findOne({
    where: { id: slotId },
    relations: ["master", "reservedBy", "periodicSlotConfig"],
  });
}

/**
 * Get slot by ID and master ID
 */
export async function getSlotByMaster(
  slotId: number,
  masterId: number
): Promise<ScheduleSlot | null> {
  const repo = AppDataSource.getRepository(ScheduleSlot);
  return await repo.findOne({
    where: { id: slotId, master: { id: masterId } },
    relations: ["reservedBy", "master"],
  });
}

/**
 * Delete slots by IDs (only if owned by master)
 */
export async function deleteSlots(
  slotIds: number[],
  masterId: number
): Promise<number[]> {
  const repo = AppDataSource.getRepository(ScheduleSlot);

  const slots = await repo.find({
    where: {
      id: In(slotIds),
      master: { id: masterId },
    },
    relations: ["master"],
  });

  if (slots.length === 0) {
    throw new Error("No valid slots found");
  }

  await repo.remove(slots);
  return slots.map((s) => s.id);
}

/**
 * `DataSource.query` / `manager.query` with pg may return a plain row array, `{ rows }`, or
 * the node-pg tuple `[rows, fieldMetadata]`. Unwrap so we always map over row objects.
 */
function rowsFromSqlQueryResult(result: unknown): Record<string, unknown>[] {
  if (result == null) return [];
  if (
    typeof result === "object" &&
    !Array.isArray(result) &&
    "rows" in result
  ) {
    const rows = (result as { rows: unknown }).rows;
    return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
  }
  if (!Array.isArray(result)) return [];
  if (result.length === 0) return [];
  // Tuple [rows, fields] — first element is the row list
  if (Array.isArray(result[0])) {
    return result[0] as Record<string, unknown>[];
  }
  return result as Record<string, unknown>[];
}

function idsFromReturningRows(rows: Record<string, unknown>[]): number[] {
  const out: number[] = [];
  for (const r of rows) {
    const raw = r.id ?? r.Id;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

/**
 * Delete a slot and every other row in `schedule_slots` for the same master with the same
 * `periodicSlotConfigId` and `chunkIndex` (no relation joins — uses columns on the slot table).
 * If the row has no config or chunk index, only that id is deleted.
 */
export async function deleteBatchSlotsBySharedChunk(
  slotId: number,
  masterId: number
): Promise<number[]> {
  const repo = AppDataSource.getRepository(ScheduleSlot);

  const meta = await repo
    .createQueryBuilder("slot")
    .select("slot.periodicSlotConfigId", "configId")
    .addSelect("slot.chunkIndex", "chunkIndex")
    .where("slot.id = :slotId", { slotId })
    .andWhere("slot.masterId = :masterId", { masterId })
    .getRawOne<{ configId: number | null; chunkIndex: number | null }>();

  if (!meta) {
    throw new Error("Slot not found or you are not the master");
  }

  if (meta.configId == null || meta.chunkIndex == null) {
    await repo.delete({ id: slotId, master: { id: masterId } });
    return [slotId];
  }

  const raw = await repo.manager.query(
    `DELETE FROM "schedule_slots"
     WHERE "masterId" = $1 AND "periodicSlotConfigId" = $2 AND "chunkIndex" = $3
     RETURNING id`,
    [masterId, meta.configId, meta.chunkIndex]
  );

  return idsFromReturningRows(rowsFromSqlQueryResult(raw));
}

/**
 * Update one slot or every slot sharing the same periodic config row + chunk index (same
 * grouping as delete-batch). Uses a single UPDATE … WHERE. Time edits shift each row by the
 * anchor slot’s start/end delta via interval arithmetic.
 */
export async function updatePeriodicBatchSlotsBySharedChunk(
  slotId: number,
  masterId: number,
  data: {
    startTime?: Date;
    endTime?: Date;
    title?: string | null;
    youtubeId?: string | null;
    price?: number | null;
  }
): Promise<ScheduleSlot[]> {
  const repo = AppDataSource.getRepository(ScheduleSlot);

  const slot = await repo
    .createQueryBuilder("slot")
    .select("slot.periodicSlotConfigId", "configId")
    .addSelect("slot.chunkIndex", "chunkIndex")
    .addSelect("slot.startTime", "startTime")
    .addSelect("slot.endTime", "endTime")
    .where("slot.id = :slotId", { slotId })
    .andWhere("slot.masterId = :masterId", { masterId })
    .getRawOne<{
      configId: number | null;
      chunkIndex: number | null;
      startTime: Date;
      endTime: Date;
    }>();

  if (!slot) {
    throw new Error("Slot not found or you are not the master");
  }

  const { startTime, endTime, price, ...rest } = data;

  const updateTimes = startTime !== undefined && endTime !== undefined;

  let deltaStartMs = 0;
  let deltaEndMs = 0;

  if (updateTimes) {
    deltaStartMs = startTime!.getTime() - new Date(slot.startTime).getTime();
    deltaEndMs = endTime!.getTime() - new Date(slot.endTime).getTime();
  }

  const qb = AppDataSource.createQueryBuilder()
    .update(ScheduleSlot)
    .set({
      ...rest,
      ...(price !== undefined && {
        price,
      }),
      ...(updateTimes && {
        startTime: () =>
          `"startTime" + (interval '1 millisecond' * ${deltaStartMs})`,
        endTime: () => `"endTime" + (interval '1 millisecond' * ${deltaEndMs})`,
      }),
    })
    .where("chunkIndex = :chunkIndex", {
      chunkIndex: slot.chunkIndex,
    })
    .andWhere("periodicSlotConfigId = :configId", {
      configId: slot.configId,
    })
    .andWhere("status = :status", { status: SlotStatus.Free })
    .returning("*");

  const result = await qb.execute();

  return result.raw as ScheduleSlot[];
}

/**
 * Reserve a slot
 */
export async function reserveSlot(
  slotId: number,
  userId: number
): Promise<ScheduleSlot> {
  const repo = AppDataSource.getRepository(ScheduleSlot);
  const slot = await repo.findOne({
    where: { id: slotId },
    relations: ["master", "reservedBy"],
  });

  if (!slot) {
    throw new Error("Slot not found");
  }

  // Prevent booking slots in the past
  const now = new Date();
  if (new Date(slot.startTime) < now) {
    throw new Error("Cannot book time slots in the past");
  }

  if (slot.status !== SlotStatus.Free) {
    throw new Error("Slot is not available");
  }

  slot.status = SlotStatus.Reserved;
  slot.reservedBy = { id: userId } as User;

  await repo.save(slot);

  // Reload with relations
  const updatedSlot = await repo.findOne({
    where: { id: slotId },
    relations: ["master", "reservedBy"],
  });

  if (!updatedSlot) {
    throw new Error("Slot not found after reservation");
  }
  // Send notification email
  const input = {
    master: updatedSlot?.master?.username ?? "",
    reservedBy: updatedSlot?.reservedBy?.username ?? "",
  };
  await Promise.all([
    sendNotificationEmail(input),
    sendNotificationToTelegram(input),
    sendReservationRequestEmail({
      startDateTimeISO: updatedSlot.startTime.toISOString(),
      masterEmail: updatedSlot.master.email,
      masterName: updatedSlot.master.username,
      studentEmail: updatedSlot.reservedBy?.email ?? "",
      studentName: updatedSlot.reservedBy?.username ?? "",
    }),
  ]);

  return updatedSlot;
}

/**
 * Update slot times (start and end)
 */
export async function updateSlot(
  slotId: number,
  masterId: number,
  data: {
    startTime?: Date;
    endTime?: Date;
    title?: string;
    youtubeId?: string;
    price?: number | null;
  }
): Promise<ScheduleSlot> {
  const repo = AppDataSource.getRepository(ScheduleSlot);
  const slot = await repo.findOne({
    where: { id: slotId, master: { id: masterId } },
    relations: ["reservedBy", "master"],
  });

  if (!slot) {
    throw new Error("Slot not found or you are not the master");
  }

  // Prevent updating slots in the past

  await repo
    .createQueryBuilder()
    .update(ScheduleSlot)
    .set({
      ...data,
      periodicSlotConfig: null,
      chunkIndex: null,
    })
    .setParameter("price", data.price)
    .where("id = :id", { id: slot.id })
    .execute();

  // Reload with relations
  const updatedSlot = await repo.findOne({
    where: { id: slotId },
    relations: ["master", "reservedBy"],
  });

  if (!updatedSlot) {
    throw new Error("Slot not found after update");
  }

  return updatedSlot;
}

/**
 * Update slot status
 */
export async function updateSlotStatus(
  slotId: number,
  masterId: number,
  status: SlotStatus,
  trx?: EntityManager
): Promise<ScheduleSlot> {
  const repo = trx
    ? trx.getRepository(ScheduleSlot)
    : AppDataSource.getRepository(ScheduleSlot);
  const slot = await repo.findOne({
    where: { id: slotId, master: { id: masterId } },
    relations: ["reservedBy", "master"],
  });

  if (!slot) {
    throw new Error("Slot not found or you are not the master");
  }

  // If making it "Free", clear user
  if (status === SlotStatus.Free && slot.status === SlotStatus.Paid) {
    throw new Error("Cannot free a paid slot");
  }
  if (status === SlotStatus.Free) {
    slot.reservedBy = null;
  }

  slot.status = status;
  await repo.save(slot);

  if (status === SlotStatus.Booked && slot.reservedBy) {
    await sendReservationEmail({
      user: slot.reservedBy,
      master: slot.master,
      startUtc: slot.startTime,
      endUtc: slot.endTime,
    });
  }

  if (status === SlotStatus.Paid) {
    await Promise.all([
      sendNotificationToTelegram({
        master: slot.master.email ?? "",
        reservedBy: slot.reservedBy?.email ?? "",
      }),
      sendReservationRequestEmail({
        startDateTimeISO: slot.startTime.toISOString(),
        masterEmail: slot.master.email,
        masterName: slot.master.username,
        studentEmail: slot.reservedBy?.email ?? "",
        studentName: slot.reservedBy?.username ?? "",
      }),
    ]);
  }

  // Reload with relations
  const updatedSlot = await repo.findOne({
    where: { id: slotId },
    relations: ["master", "reservedBy"],
  });

  if (!updatedSlot) {
    throw new Error("Slot not found after update");
  }

  return updatedSlot;
}

/**
 * Get all bookings for any user
 */
export async function getUserBookings(userId: number): Promise<ScheduleSlot[]> {
  const repo = AppDataSource.getRepository(ScheduleSlot);

  return await repo
    .createQueryBuilder("slot")
    .leftJoinAndSelect("slot.master", "master")
    .leftJoinAndSelect("slot.reservedBy", "reservedBy")
    .where("slot.reservedBy = :userId or slot.masterId = :userId", { userId })
    .andWhere("slot.status IN (:...statuses)", {
      statuses: [SlotStatus.Reserved, SlotStatus.Booked, SlotStatus.Paid],
    })
    .orderBy("slot.startTime", "ASC")
    .getMany();
}

/**
 * Get bookings for a master (slots reserved by others)
 */
export async function getMasterBookings(
  masterId: number
): Promise<ScheduleSlot[]> {
  const repo = AppDataSource.getRepository(ScheduleSlot);

  return await repo
    .createQueryBuilder("slot")
    .leftJoinAndSelect("slot.reservedBy", "reservedBy")
    .where("slot.master = :masterId", { masterId })
    .andWhere("slot.reservedBy IS NOT NULL")
    .andWhere("slot.status IN (:...statuses)", {
      statuses: [SlotStatus.Reserved, SlotStatus.Booked],
    })
    .orderBy("slot.startTime", "ASC")
    .getMany();
}
