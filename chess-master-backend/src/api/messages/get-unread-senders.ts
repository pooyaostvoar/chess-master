import { Request, Response } from "express";
import { AppDataSource } from "../../database/datasource";
import { Message } from "../../database/entity/message";
import { User } from "../../database/entity/user";

export const getUnreadSenders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const messageRepo = AppDataSource.getRepository(Message);

    // Step 1: Get incoming messages (users who sent messages TO current user)
    const incomingMessages = await messageRepo
      .createQueryBuilder("message")
      .select("message.fromUserId", "userId")
      .addSelect(
        "SUM(CASE WHEN message.isSeen = false THEN 1 ELSE 0 END)",
        "unreadCount"
      )
      .where("message.toUserId = :userId", { userId })
      .groupBy("message.fromUserId")
      .getRawMany();

    // Step 2: Get outgoing messages (users who received messages FROM current user)
    const outgoingMessages = await messageRepo
      .createQueryBuilder("message")
      .select("message.toUserId", "userId")
      .where("message.fromUserId = :userId", { userId })
      .groupBy("message.toUserId")
      .getRawMany();

    // Map incoming results to a lookup object
    const userMap = new Map<number, { userId: number; unreadCount: number }>();

    incomingMessages.forEach((item) => {
      const id = parseInt(item.userId);
      userMap.set(id, { userId: id, unreadCount: parseInt(item.unreadCount) });
    });

    // Add outgoing conversation partners if not already present
    outgoingMessages.forEach((item) => {
      const id = parseInt(item.userId);
      if (!userMap.has(id)) {
        userMap.set(id, { userId: id, unreadCount: 0 });
      }
    });

    const allUserIds = Array.from(userMap.keys());

    if (allUserIds.length === 0) {
      return res.json([]);
    }

    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo
      .createQueryBuilder("user")
      .where("user.id IN (:...ids)", { ids: allUserIds })
      .getMany();

    const formattedResult = users.map((user) => ({
      userId: user.id,
      username: user.username,
      profilePictureThumbnailUrl: user.profilePictureThumbnailUrl,
      unreadCount: userMap.get(user.id)?.unreadCount || 0,
    }));

    return res.json(formattedResult);
  } catch (error) {
    console.error("Error fetching unread senders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
