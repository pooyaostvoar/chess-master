import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import type { Request } from "express";
import passport from "passport";
import { sessionMiddleware } from "../middleware/session";
import { AppDataSource } from "../database/datasource";
import { Message } from "../database/entity/message";
import { sendPushToUser } from "../services/push";

const pendingPushes = new Map<number, NodeJS.Timeout>();

/**
 * Shape of authenticated user
 * Extend if needed later
 */
interface AuthUser {
  id: number;
}

/**
 * Extend Socket.IO socket data
 */
interface SocketData {
  user: AuthUser;
}

/**
 * Events sent from client → server
 */
interface ClientToServerEvents {
  "join-chat": (payload: { otherUserId: number }) => void;
  message: (payload: { otherUserId: number; text: string }) => void;
  "message:seen": (payload: { messageId: number }) => void;
}

/**
 * Events sent from server → client
 */
interface ServerToClientEvents {
  message: (payload: {
    id?: number;
    from: number;
    text: string;
    createdAt: Date;
    isSeen: boolean;
  }) => void;
}

export function initSocket(server: HttpServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
  >(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://185.141.61.15:3000",
        "http://185.141.61.15:3001",
        "http://185.141.61.15:3003",
        "http://185.141.61.15:3004",
      ],
      credentials: true,
    },
  });

  // -----------------------------
  // Share Express session
  // -----------------------------
  io.use((socket, next) => {
    sessionMiddleware(socket.request as Request, {} as any, next as any);
  });

  // -----------------------------
  // Passport init
  // -----------------------------
  io.use((socket, next) => {
    passport.initialize()(socket.request as Request, {} as any, next as any);
  });

  io.use((socket, next) => {
    passport.session()(socket.request as IncomingMessage, {} as any, next);
  });

  // -----------------------------
  // Auth guard
  // -----------------------------
  io.use((socket, next) => {
    const req = socket.request as IncomingMessage & {
      user?: AuthUser;
    };

    if (!req.user) {
      return next(new Error("Unauthorized"));
    }

    socket.data.user = req.user;
    next();
  });

  // -----------------------------
  // Socket handlers
  // -----------------------------
  io.on(
    "connection",
    (
      socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
    ) => {
      const userId = socket.data.user.id;

      console.log(`Socket connected: user=${userId}`);

      socket.on(
        "join-chat",
        async ({ otherUserId }: { otherUserId: number }) => {
          const a = Math.min(userId, otherUserId);
          const b = Math.max(userId, otherUserId);
          const room = `chat:${a}:${b}`;

          socket.join(room);

          try {
            const messageRepo = AppDataSource.getRepository(Message);

            // Fetch last 20 messages between the two users, oldest first
            const messages = await messageRepo
              .createQueryBuilder("message")
              .where(
                "(message.fromUserId = :a AND message.toUserId = :b) OR (message.fromUserId = :b AND message.toUserId = :a)",
                { a, b }
              )
              .orderBy("message.createdAt", "DESC") // newest first
              .take(100)
              .getMany();

            // Reverse to send oldest first
            const orderedMessages = messages.reverse();

            // Publish them to the socket that joined
            orderedMessages.forEach((msg) => {
              socket.emit("message", {
                id: msg.id,
                from: msg.fromUserId,
                text: msg.text,
                createdAt: msg.createdAt,
                isSeen: msg.isSeen,
              });
            });
          } catch (err) {
            console.error("Failed to load chat history:", err);
          }
        }
      );

      socket.on(
        "message",
        async ({
          otherUserId,
          text,
        }: {
          otherUserId: number;
          text: string;
        }) => {
          try {
            // Save message to DB
            const messageRepo = AppDataSource.getRepository(Message);
            const newMessage = await messageRepo.save({
              fromUserId: userId,
              toUserId: otherUserId,
              text,
              isSeen: false,
            });

            // Determine room name
            const a = Math.min(userId, otherUserId);
            const b = Math.max(userId, otherUserId);
            const room = `chat:${a}:${b}`;

            // Emit message to room
            io.to(room).emit("message", {
              id: newMessage.id,
              from: newMessage.fromUserId,
              text: newMessage.text,
              createdAt: newMessage.createdAt,
              isSeen: newMessage.isSeen,
            });

            const timeout = setTimeout(async () => {
              const link =
                process.env.ENV === "production"
                  ? `https://chesswithmasters.com/chat/${newMessage.fromUserId}`
                  : `http://localhost:3000/chat/${newMessage.fromUserId}`;
              const msg = await messageRepo.findOne({
                where: { id: newMessage.id },
              });

              if (msg && !msg.isSeen) {
                await sendPushToUser(msg.toUserId, {
                  title: "New message",
                  body: msg.text,
                  data: { link },
                });
              }

              pendingPushes.delete(newMessage.id);
            }, 8000);

            pendingPushes.set(newMessage.id, timeout);

            console.log("Message sent:", text, "room:", room);
          } catch (err) {
            console.error("Failed to save message:", err);
          }
        }
      );

      socket.on("message:seen", async ({ messageId }) => {
        await AppDataSource.getRepository(Message).update(messageId, {
          isSeen: true,
        });

        const timeout = pendingPushes.get(messageId);
        if (timeout) {
          clearTimeout(timeout);
          pendingPushes.delete(messageId);
        }
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: user=${userId}`);
      });
    }
  );

  return io;
}
