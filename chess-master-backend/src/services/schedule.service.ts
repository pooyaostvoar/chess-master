import { AppDataSource } from "../database/datasource";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { SlotStatus } from "../database/entity/types";
import { User } from "../database/entity/user";
import { In } from "typeorm";
import { formatUserMinimal } from "./user.service";
import { sendNotificationEmail } from "./notification.service";

export interface CreateSlotData {
  masterId: number;
  startTime: Date;
  endTime: Date;
}

export interface SafeSlot {
  id: number;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  master?: {
    id: number;
    username: string;
    email: string;
    title: string | null;
    rating: number | null;
    profilePicture: string | null;
    chesscomUrl: string | null;
    lichessUrl: string | null;
  };
  reservedBy?: {
    id: number;
    username: string;
    email: string;
    profilePicture: string | null;
  } | null;
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
  };

  if (slot.master) {
    formatted.master = {
      id: slot.master.id,
      username: slot.master.username,
      email: slot.master.email,
      title: slot.master.title,
      rating: slot.master.rating,
      profilePicture: slot.master.profilePicture,
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
    .leftJoinAndSelect("slot.reservedBy", "reservedBy")
    .where("slot.master = :userId", { userId })
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
    relations: ["master", "reservedBy"],
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

  // Send notification email
  await sendNotificationEmail({
    master: updatedSlot?.master?.username ?? "",
    reservedBy: updatedSlot?.reservedBy?.username ?? "",
  });

  if (!updatedSlot) {
    throw new Error("Slot not found after reservation");
  }

  return updatedSlot;
}

/**
 * Update slot times (start and end)
 */
export async function updateSlot(
  slotId: number,
  masterId: number,
  data: {
    strartTime?: Date;
    endTime?: Date;
    title?: string;
    youtubeId?: string;
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

  await repo.save({ ...slot, ...data } as ScheduleSlot);

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
  status: SlotStatus
): Promise<ScheduleSlot> {
  const repo = AppDataSource.getRepository(ScheduleSlot);
  const slot = await repo.findOne({
    where: { id: slotId, master: { id: masterId } },
    relations: ["reservedBy", "master"],
  });

  if (!slot) {
    throw new Error("Slot not found or you are not the master");
  }

  // If making it "Free", clear user
  if (status === SlotStatus.Free) {
    slot.reservedBy = null;
  }

  slot.status = status;
  await repo.save(slot);

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
    .where("slot.reservedBy = :userId or slot.masterId = :userId", { userId })
    .andWhere("slot.status IN (:...statuses)", {
      statuses: [SlotStatus.Reserved, SlotStatus.Booked],
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
