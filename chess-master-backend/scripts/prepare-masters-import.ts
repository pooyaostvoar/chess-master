import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

type CsvRow = Record<string, string>;

const DEFAULT_INPUT = "data/lichess-coaches-2026-05-01.csv";
const DEFAULT_OUTPUT = "data/masters-import-prepared.csv";

const preparedFields = [
  "username",
  "email",
  "emailWasGenerated",
  "fullName",
  "name",
  "lastname",
  "title",
  "country",
  "languagesJson",
  "lichessUrl",
  "lichessUsername",
  "lichessRatingsJson",
  "rating",
  "hourlyRate",
  "hourlyRateRaw",
  "bio",
  "twitchUrl",
  "youtubeUrl",
  "instagramUrl",
  "xUrl",
  "facebookUrl",
  "tiktokUrl",
  "phoneNumber",
  "photoUrl",
  "isMaster",
  "status",
] as const;

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function writeCsv(filePath: string, rows: CsvRow[]): void {
  const output = stringify(rows, {
    header: true,
    columns: [...preparedFields],
  });

  fs.writeFileSync(filePath, output, "utf8");
}

function splitName(
  fullNameValue: string,
  titleValue: string
): { name: string; lastname: string } {
  let fullName = clean(fullNameValue);
  const title = clean(titleValue);

  if (title && fullName.toUpperCase().startsWith(`${title.toUpperCase()} `)) {
    fullName = fullName.slice(title.length).trim();
  }

  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { name: "", lastname: "" };
  if (parts.length === 1) return { name: parts[0], lastname: "" };

  return {
    name: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

function parseInteger(value: string): number | null {
  const text = clean(value).replace(/,/g, "");
  if (!text) return null;

  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;

  return Math.round(parsed);
}

function parseHourlyRate(value: string): number | null {
  const text = clean(value);
  if (!text) return null;

  const looksLikeRate = /(\$|€|£|usd|eur|\/h|\/hr|hour|час|руб|rs|₹)/i.test(
    text
  );
  if (!looksLikeRate) return null;

  const match = text.match(/\d+(?:[.,]\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0].replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 10000) return null;

  return parsed;
}

function splitLanguages(value: string): string[] {
  return clean(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractUrls(value: string): string[] {
  return clean(value).match(/https?:\/\/[^\s,;]+/gi) ?? [];
}

function detectSocialLinks(row: CsvRow): Partial<CsvRow> {
  const urls = extractUrls(row["Social links"]);
  const socialLinks: Partial<CsvRow> = {
    twitchUrl: "",
    youtubeUrl: "",
    instagramUrl: "",
    xUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
  };

  for (const url of urls) {
    let hostname = "";
    try {
      hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      continue;
    }

    if (!socialLinks.twitchUrl && hostname === "twitch.tv") {
      socialLinks.twitchUrl = url;
    } else if (
      !socialLinks.youtubeUrl &&
      (hostname === "youtube.com" || hostname === "youtu.be")
    ) {
      socialLinks.youtubeUrl = url;
    } else if (!socialLinks.instagramUrl && hostname === "instagram.com") {
      socialLinks.instagramUrl = url;
    } else if (
      !socialLinks.xUrl &&
      (hostname === "x.com" || hostname === "twitter.com")
    ) {
      socialLinks.xUrl = url;
    } else if (!socialLinks.facebookUrl && hostname === "facebook.com") {
      socialLinks.facebookUrl = url;
    } else if (!socialLinks.tiktokUrl && hostname === "tiktok.com") {
      socialLinks.tiktokUrl = url;
    }
  }

  return socialLinks;
}

function buildBio(row: CsvRow): string {
  const sections = [
    ["About me", row["About me"]],
    ["Best skills", row["Best skills"]],
    ["Playing experience", row["Playing experience"]],
    ["Teaching methodology", row["Teaching methodology"]],
  ] as const;

  return sections
    .map(([heading, body]) => {
      const text = clean(body);
      return text ? `${heading}\n${text}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function buildLichessRatings(row: CsvRow): Record<string, unknown> | null {
  const games = parseInteger(row["Games played"]);
  const ratings: Record<string, unknown> = {};

  const ratingColumns = [
    ["blitz", "Blitz"],
    ["rapid", "Rapid"],
    ["classical", "Classical"],
    ["bullet", "Bullet"],
  ] as const;

  for (const [key, column] of ratingColumns) {
    const rating = parseInteger(row[column]);
    if (rating === null) continue;

    ratings[key] = {
      rating,
      ...(games !== null ? { games } : {}),
    };
  }

  return Object.keys(ratings).length > 0 ? ratings : null;
}

function normalizeRow(row: CsvRow): CsvRow {
  const username = clean(row["Username"]);
  const rawEmail = clean(row["Email"]).toLowerCase();
  const email = rawEmail || `lichess-${username.toLowerCase()}@import.invalid`;
  const { name, lastname } = splitName(row["Full name"], row["Title"]);

  const ratings = buildLichessRatings(row);
  const displayRating =
    parseInteger(row["Rapid"]) ??
    parseInteger(row["Blitz"]) ??
    parseInteger(row["Classical"]) ??
    parseInteger(row["Bullet"]);
  const hourlyRate = parseHourlyRate(row["Hourly rate"]);
  const socialLinks = detectSocialLinks(row);

  return {
    username,
    email,
    emailWasGenerated: rawEmail ? "false" : "true",
    fullName: clean(row["Full name"]),
    name,
    lastname,
    title: clean(row["Title"]),
    country: clean(row["Country"]),
    languagesJson: JSON.stringify(splitLanguages(row["Languages"])),
    lichessUrl: clean(row["URL"]),
    lichessUsername: username,
    lichessRatingsJson: ratings ? JSON.stringify(ratings) : "",
    rating: displayRating === null ? "" : String(displayRating),
    hourlyRate: hourlyRate === null ? "" : String(hourlyRate),
    hourlyRateRaw: clean(row["Hourly rate"]),
    bio: buildBio(row),
    twitchUrl: socialLinks.twitchUrl ?? "",
    youtubeUrl: socialLinks.youtubeUrl ?? "",
    instagramUrl: socialLinks.instagramUrl ?? "",
    xUrl: socialLinks.xUrl ?? "",
    facebookUrl: socialLinks.facebookUrl ?? "",
    tiktokUrl: socialLinks.tiktokUrl ?? "",
    phoneNumber: clean(row["Phone"]),
    photoUrl: clean(row["Photo URL"]),
    isMaster: "true",
    status: "disabled",
  };
}

function verifyRowCount(
  originalRows: CsvRow[],
  preparedRows: CsvRow[]
): void {
  if (originalRows.length !== preparedRows.length) {
    throw new Error(
      `Row count mismatch: original=${originalRows.length}, prepared=${preparedRows.length}`
    );
  }
}

function main(): void {
  const inputArg = process.argv[2] ?? DEFAULT_INPUT;
  const outputArg = process.argv[3] ?? DEFAULT_OUTPUT;
  const inputPath = path.resolve(process.cwd(), inputArg);
  const outputPath = path.resolve(process.cwd(), outputArg);

  const source = fs.readFileSync(inputPath, "utf8");
  const rows = parse(source, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];
  const preparedRows = rows.map((row) => normalizeRow(row));

  verifyRowCount(rows, preparedRows);
  writeCsv(outputPath, preparedRows);

  const generatedEmails = preparedRows.filter(
    (row) => row.emailWasGenerated === "true"
  ).length;
  const usernames = new Set(
    preparedRows.map((row) => row.username.toLowerCase())
  );

  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  console.log(`Rows: ${preparedRows.length}`);
  console.log(`Unique usernames: ${usernames.size}`);
  console.log(`Actual emails: ${preparedRows.length - generatedEmails}`);
  console.log(`Generated emails: ${generatedEmails}`);
  console.log(
    `Numeric hourly rates: ${
      preparedRows.filter((row) => row.hourlyRate !== "").length
    }`
  );
  console.log("Verified: output row count matches input row count.");
}

main();
