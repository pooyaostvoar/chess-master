import crypto from "crypto";
import { AppDataSource } from "../database/datasource";
import { AdminUser } from "../database/entity/admin-user";

const DEFAULT_USERNAME = "admin";
const DEFAULT_EMAIL = "admin@dev.local";
const DEFAULT_PASSWORD = "admin";

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
  return { salt, hash };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let username = DEFAULT_USERNAME;
  let email = DEFAULT_EMAIL;
  let password = DEFAULT_PASSWORD;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === "--") {
      continue;
    } else if (arg === "--username" && next) {
      username = next;
      i += 1;
    } else if (arg === "--email" && next) {
      email = next;
      i += 1;
    } else if (arg === "--password" && next) {
      password = next;
      i += 1;
    } else if (arg === "--force") {
      continue;
    } else if (!arg.startsWith("--")) {
      throw new Error(`Unknown argument: ${arg}`);
    } else {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return { username, email, password };
}

async function main() {
  if (process.env.ENV === "production" && !process.argv.includes("--force")) {
    console.error(
      "Refusing to create a dev admin in production. Pass --force to override."
    );
    process.exit(1);
  }

  const { username, email, password } = parseArgs();
  const { salt, hash } = hashPassword(password);

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  const repo = AppDataSource.getRepository(AdminUser);
  const existing = await repo.findOne({
    where: [{ username }, { email }],
  });

  if (existing) {
    existing.username = username;
    existing.email = email;
    existing.password = hash;
    existing.salt = salt;
    existing.status = "active";
    await repo.save(existing);
    console.log(`Updated admin user "${username}"`);
  } else {
    await repo.save(
      repo.create({
        username,
        email,
        password: hash,
        salt,
        status: "active",
      })
    );
    console.log(`Created admin user "${username}"`);
  }

  console.log("");
  console.log("Backoffice login:");
  console.log(`  URL:      http://localhost:3001`);
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
