import session from "express-session";
import RedisStore from "connect-redis";
import { getRedisClient } from "../services/redis";
import { readSecret } from "../utils/secret";

const redisClient = getRedisClient();

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

export const sessionMiddleware = session({
  store: redisStore,
  secret: readSecret("/run/secrets/session_secret") ?? "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});
