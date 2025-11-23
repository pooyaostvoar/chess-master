import express, { Express, Request, Response } from "express";
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

const isTesting = process.env.NODE_ENV === "test";

if (!isTesting) {
  AppDataSource.initialize()
    .then(() => {
      // here you can start to work with your database
    })
    .catch((error) => console.log(error));
}

const app: Express = express();
const port = 3004;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://localhost:3004",
  ],
  optionsSuccessStatus: 200, // For legacy browser support
  credentials: true,
};

app.use(cors(corsOptions));

const redisClient = createClient({
  url: "redis://:redis-pass@localhost:6378",
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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.use("", googleRouter);
app.use("", passwordAuthRouter);
app.use("/users", usersRouter);
app.use("/schedule", scheduleRouter);
app.use(cookieParser());

export default app;
