import { adminCommentListSchema, commentSchema } from "@chess-master/schemas";
import { In } from "typeorm";
import { AppDataSource } from "../database/datasource";
import { Comment } from "../database/entity/comment";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { User } from "../database/entity/user";
import { SlotStatus, UserStatus } from "../database/entity/types";
import { canViewUser } from "./user.service";

async function findComment(id: number) {
  const comment = await AppDataSource.getRepository(Comment).findOne({
    where: { id },
    relations: { user: true, master: true },
  });
  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }
  return comment;
}

export async function listCommentsForMaster(masterId: number, viewerId?: number) {
  const master = await AppDataSource.getRepository(User).findOne({
    where: { id: masterId },
    select: { id: true, isMaster: true, status: true, isPrivate: true },
  });
  if (
    !master ||
    !master.isMaster ||
    master.status !== UserStatus.Active ||
    !canViewUser(master, viewerId)
  ) {
    throw new Error("MASTER_NOT_FOUND");
  }

  const comments = await AppDataSource.getRepository(Comment).find({
    where: { master: { id: masterId } },
    relations: { user: true, master: true },
    order: { createdAt: "DESC", id: "DESC" },
  });

  return commentSchema.array().parse(
    comments.filter((comment) => canViewUser(comment.user, viewerId))
  );
}

export async function createCommentForUser(params: {
  userId: number;
  masterId: number;
  text: string;
}) {
  const master = await AppDataSource.getRepository(User).findOne({
    where: { id: params.masterId },
    select: { id: true, isMaster: true, status: true },
  });

  if (!master || !master.isMaster || master.status !== UserStatus.Active) {
    throw new Error("MASTER_NOT_FOUND");
  }

  const event = await AppDataSource.getRepository(ScheduleSlot)
    .createQueryBuilder("slot")
    .where('slot."masterId" = :masterId', { masterId: params.masterId })
    .andWhere('slot."reservedById" = :userId', { userId: params.userId })
    .andWhere("slot.status = :status", { status: SlotStatus.Booked })
    .andWhere("slot.endTime < :now", { now: new Date() })
    .getOne();
  if (!event) {
    throw new Error("NO_SHARED_EVENT");
  }

  const repo = AppDataSource.getRepository(Comment);
  const existing = await repo.findOne({
    where: {
      user: { id: params.userId },
      master: { id: params.masterId },
    },
  });
  if (existing) {
    throw new Error("COMMENT_EXISTS");
  }

  const saved = await repo.save(
    repo.create({
      text: params.text,
      master: { id: params.masterId } as User,
      user: { id: params.userId } as User,
    })
  );

  return commentSchema.parse(await findComment(saved.id));
}

async function assertUsersExist(userIds: number[]) {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return;

  const users = await AppDataSource.getRepository(User).find({
    where: { id: In(uniqueIds) },
    select: { id: true },
  });
  if (users.length !== uniqueIds.length) {
    throw new Error("USER_NOT_FOUND");
  }
}

async function assertMastersExist(masterIds: number[]) {
  const uniqueIds = [...new Set(masterIds)];
  if (uniqueIds.length === 0) return;

  const masters = await AppDataSource.getRepository(User).find({
    where: {
      id: In(uniqueIds),
      isMaster: true,
      status: UserStatus.Active,
    },
    select: { id: true },
  });
  if (masters.length !== uniqueIds.length) {
    throw new Error("MASTER_NOT_FOUND");
  }
}

async function loadCommentsInOrder(ids: number[]) {
  const comments = await AppDataSource.getRepository(Comment).find({
    where: { id: In(ids) },
    relations: { user: true, master: true },
  });
  const byId = new Map(comments.map((comment) => [comment.id, comment]));
  return commentSchema.array().parse(ids.map((id) => byId.get(id)));
}

async function resolveCommentUserIds(
  comments: Array<{ userId?: number; username?: string }>
) {
  await assertUsersExist(
    comments.flatMap((comment) => (comment.userId ? [comment.userId] : []))
  );

  const usernames = [
    ...new Set(
      comments.flatMap((comment) =>
        comment.userId || !comment.username ? [] : [comment.username]
      )
    ),
  ];
  const userRepo = AppDataSource.getRepository(User);
  const existing = usernames.length
    ? await userRepo.find({
        where: { username: In(usernames) },
        select: { id: true, username: true },
      })
    : [];
  const userIdByUsername = new Map(
    existing.map((user) => [user.username, user.id])
  );

  const missingUsernames = usernames.filter(
    (username) => !userIdByUsername.has(username)
  );
  if (missingUsernames.length > 0) {
    const created = await userRepo.save(
      missingUsernames.map((username) =>
        userRepo.create({
          username,
          email: username,
          name: username,
        })
      )
    );
    for (const user of created) {
      userIdByUsername.set(user.username, user.id);
    }
  }

  return comments.map((comment) => {
    if (comment.userId) return comment.userId;
    const userId = comment.username
      ? userIdByUsername.get(comment.username)
      : undefined;
    if (!userId) {
      throw new Error("USER_NOT_FOUND");
    }
    return userId;
  });
}

export async function createCommentsAsAdmin(
  comments: Array<{
    userId?: number;
    username?: string;
    masterId: number;
    text: string;
  }>
) {
  const userIds = await resolveCommentUserIds(comments);
  await assertMastersExist(comments.map((comment) => comment.masterId));

  const repo = AppDataSource.getRepository(Comment);
  const saved = await repo.save(
    comments.map((comment, index) =>
      repo.create({
        text: comment.text,
        master: { id: comment.masterId } as User,
        user: { id: userIds[index] } as User,
      })
    )
  );

  return loadCommentsInOrder(saved.map((comment) => comment.id));
}

export async function updateCommentsAsAdmin(
  comments: Array<{
    id: number;
    text: string;
    userId?: number;
    masterId?: number;
  }>
) {
  const ids = comments.map((comment) => comment.id);
  const repo = AppDataSource.getRepository(Comment);
  const existing = await repo.find({ where: { id: In(ids) } });
  if (existing.length !== ids.length) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  await assertUsersExist(
    comments.flatMap((comment) => (comment.userId ? [comment.userId] : []))
  );
  await assertMastersExist(
    comments.flatMap((comment) => (comment.masterId ? [comment.masterId] : []))
  );

  const byId = new Map(existing.map((comment) => [comment.id, comment]));
  for (const item of comments) {
    const comment = byId.get(item.id);
    if (!comment) {
      throw new Error("COMMENT_NOT_FOUND");
    }
    comment.text = item.text;
    if (item.userId !== undefined) {
      comment.user = { id: item.userId } as User;
    }
    if (item.masterId !== undefined) {
      comment.master = { id: item.masterId } as User;
    }
  }

  await repo.save([...byId.values()]);
  return loadCommentsInOrder(ids);
}

export async function updateOwnComment(params: {
  commentId: number;
  userId: number;
  text: string;
}) {
  const comment = await findComment(params.commentId);
  if (comment.userId !== params.userId) {
    throw new Error("FORBIDDEN");
  }

  comment.text = params.text;
  await AppDataSource.getRepository(Comment).save(comment);
  return commentSchema.parse(await findComment(comment.id));
}

export async function deleteOwnComment(params: {
  commentId: number;
  userId: number;
}) {
  const comment = await findComment(params.commentId);
  if (comment.userId !== params.userId) {
    throw new Error("FORBIDDEN");
  }

  await AppDataSource.getRepository(Comment).delete({ id: comment.id });
  return true;
}

export async function listCommentsForAdmin(params: {
  page: number;
  pageSize: number;
  q?: string;
  masterId?: number;
}) {
  const qb = AppDataSource.getRepository(Comment)
    .createQueryBuilder("comment")
    .innerJoinAndSelect("comment.user", "commentUser")
    .innerJoinAndSelect("comment.master", "commentMaster");

  if (params.q) {
    qb.andWhere(
      "(comment.text ILIKE :q OR commentUser.username ILIKE :q OR commentMaster.username ILIKE :q)",
      { q: `%${params.q}%` }
    );
  }

  if (params.masterId) {
    qb.andWhere("commentMaster.id = :masterId", { masterId: params.masterId });
  }

  qb.orderBy("comment.createdAt", "DESC")
    .addOrderBy("comment.id", "DESC")
    .skip((params.page - 1) * params.pageSize)
    .take(params.pageSize);

  const [comments, total] = await qb.getManyAndCount();

  return adminCommentListSchema.parse({
    items: comments,
    total,
    page: params.page,
    pageSize: params.pageSize,
  });
}

export async function deleteCommentAsAdmin(commentId: number) {
  const result = await AppDataSource.getRepository(Comment).delete({
    id: commentId,
  });
  return (result.affected ?? 0) > 0;
}
