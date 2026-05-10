import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { UserStatus } from "../database/entity/types";

type CsvRow = Record<string, string>;

const DEFAULT_INPUT = "data/masters-import-prepared.csv";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function nullable(value: unknown): string | null {
  const text = clean(value);
  return text || null;
}

function parseBoolean(value: string): boolean {
  return clean(value).toLowerCase() === "true";
}

function parseNumber(value: string): number | null {
  const text = clean(value);
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseJson<T>(value: string, fallback: T): T {
  const text = clean(value);
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function normalizeLichessUrl(url: string): string {
  return clean(url).toLowerCase().replace(/\/+$/, "");
}

function normalizeEmail(email: string): string {
  return clean(email).toLowerCase();
}

function normalizeUsername(username: string): string {
  return clean(username).toLowerCase();
}

function isGeneratedEmail(row: CsvRow): boolean {
  return row.emailWasGenerated === "true" || row.email.endsWith("@import.invalid");
}

async function findExistingUser(row: CsvRow): Promise<User | null> {
  const repo = AppDataSource.getRepository(User);
  const username = normalizeUsername(row.username);
  const lichessUsername = normalizeUsername(row.lichessUsername);
  const lichessUrl = normalizeLichessUrl(row.lichessUrl);
  const email = normalizeEmail(row.email);

  const qb = repo
    .createQueryBuilder("user")
    .where("LOWER(user.username) = :username", { username })
    .orWhere("LOWER(user.lichessUsername) = :lichessUsername", {
      lichessUsername,
    })
    .orWhere("LOWER(user.lichessUrl) = :lichessUrl", { lichessUrl });

  if (!isGeneratedEmail(row)) {
    qb.orWhere("LOWER(user.email) = :email", { email });
  }

  return qb.getOne();
}

function applyRowToUser(user: User, row: CsvRow): void {
  user.username = clean(row.username);
  user.email = clean(row.email);
  user.name = nullable(row.name);
  user.lastname = nullable(row.lastname);
  user.title = nullable(row.title);
  user.location = nullable(row.country);
  user.languages = parseJson<string[]>(row.languagesJson, []);
  user.lichessUrl = nullable(row.lichessUrl);
  user.lichessUsername = nullable(row.lichessUsername);
  user.lichessRatings = parseJson(row.lichessRatingsJson, null);
  user.rating = parseNumber(row.rating);
  user.hourlyRate = parseNumber(row.hourlyRate);
  user.bio = nullable(row.bio);
  user.twitchUrl = nullable(row.twitchUrl);
  user.youtubeUrl = nullable(row.youtubeUrl);
  user.instagramUrl = nullable(row.instagramUrl);
  user.xUrl = nullable(row.xUrl);
  user.facebookUrl = nullable(row.facebookUrl);
  user.tiktokUrl = nullable(row.tiktokUrl);
  user.phoneNumber = nullable(row.phoneNumber);
  user.profilePictureUrl = nullable(row.photoUrl);
  user.profilePictureThumbnailUrl = nullable(row.photoUrl);
  user.isMaster = parseBoolean(row.isMaster);
  user.status = row.status === UserStatus.Disabled ? UserStatus.Disabled : UserStatus.Active;
  user.password = null as any;
  user.salt = null as any;
}

async function main(): Promise<void> {
  const inputArg =
    process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? DEFAULT_INPUT;
  const apply = process.argv.includes("--apply");
  const inputPath = path.resolve(process.cwd(), inputArg);

  const rows = parse(fs.readFileSync(inputPath, "utf8"), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  const repo = AppDataSource.getRepository(User);
  const summary = {
    rows: rows.length,
    created: 0,
    updatedDisabled: 0,
    skippedActive: 0,
    missingUsername: 0,
  };

  try {
    for (const row of rows) {
      if (!clean(row.username)) {
        summary.missingUsername += 1;
        continue;
      }

      const existing = await findExistingUser(row);

      if (existing?.status === UserStatus.Active) {
        summary.skippedActive += 1;
        continue;
      }

      const user = existing ?? repo.create();
      applyRowToUser(user, row);

      if (existing) {
        summary.updatedDisabled += 1;
      } else {
        summary.created += 1;
      }

      if (apply) {
        await repo.save(user);
      }
    }
  } finally {
    await AppDataSource.destroy();
  }

  console.log(`Input: ${inputPath}`);
  console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
  console.log(`Rows: ${summary.rows}`);
  console.log(`Would create / created: ${summary.created}`);
  console.log(`Would update disabled / updated disabled: ${summary.updatedDisabled}`);
  console.log(`Skipped active users: ${summary.skippedActive}`);
  console.log(`Missing username rows: ${summary.missingUsername}`);

  if (!apply) {
    console.log("No database changes were made. Re-run with --apply to insert/update.");
  }
}

main().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
