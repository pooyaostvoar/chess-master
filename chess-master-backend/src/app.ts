import express, { Express } from "express";
import session from "express-session";
//typeorm
import "reflect-metadata";
import bodyParser from "body-parser";
import { AppDataSource } from "./database/datasource";
import { googleRouter } from "./api/google";
import { passwordAuthRouter } from "./api/auth-password";
import cors from "cors";
import { passport } from "./middleware/passport";
const cookieParser = require("cookie-parser");
import RedisStore from "connect-redis";
import { createClient } from "redis";
import { usersRouter } from "./api/user/router";
import { scheduleRouter } from "./api/schedule/router";
import { readSecret } from "./utils/secret";
import { testUtil } from "@chess-master/utils";

console.log(testUtil(), "bb!!");
export function createApp() {
  const isTesting = process.env.NODE_ENV === "test";

  if (!isTesting) {
    AppDataSource.initialize()
      .then(() => {
        // here you can start to work with your database
      })
      .catch((error) => console.log(error));
  }

  const app: Express = express();

  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

  const corsOptions = {
    origin: [
      "http://localhost:3000",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://185.141.61.15:3000",
      "http://185.141.61.15:3003",
      "http://185.141.61.15:3004",
    ],
    optionsSuccessStatus: 200, // For legacy browser support
    credentials: true,
  };

  app.use(cors(corsOptions));

  const redisClient = createClient({
    url:
      readSecret("/run/secrets/redis_url") ||
      process.env.REDIS_URL ||
      "redis://localhost:6378",
  });
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
  });

  app.use(
    session({
      store: redisStore,
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: false,
      // Configure other options as needed
    })
  );

  // Initialize Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("", googleRouter);
  app.use("", passwordAuthRouter);
  app.use("/users", usersRouter);
  app.use("/schedule", scheduleRouter);
  app.use(cookieParser());
  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = 3004;
  const app = createApp();
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}
