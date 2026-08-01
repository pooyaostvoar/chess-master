/**
 * Create weekly recurring availability for all active masters.
 *
 * Each master gets:
 *   - one random local-time window: 09:00–12:00, 12:00–15:00, or 15:00–20:00
 *   - 4 random weekdays
 *   - weekly repeats × 20 for each selected weekday (60-minute chunks)
 * Timezone: primary IANA zone for user.country, else Europe/Berlin (CET/CEST)
 *
 * Dry-run by default. Pass --apply to write.
 *
 * Usage:
 *   pnpm masters:seed-schedules
 *   pnpm masters:seed-schedules -- --apply
 *   pnpm masters:seed-schedules -- --apply --master-id 42
 */
import { Period } from "@chess-master/schemas";
import { AppDataSource } from "../database/datasource";
import { UserStatus } from "../database/entity/types";
import { User } from "../database/entity/user";
import { createPeriodicBatchSlots } from "../services/schedule.service";

const FALLBACK_TIME_ZONE = "Europe/Berlin";
const REPEAT_COUNT = 20;
const DAYS_PER_WEEK = 4;
const CHUNK_SIZE_MINUTES = 60;
const WINDOWS: Array<{ startHour: number; endHour: number }> = [
  { startHour: 9, endHour: 12 },
  { startHour: 12, endHour: 15 },
  { startHour: 15, endHour: 20 },
];
/** JS weekday: 0 = Sunday … 6 = Saturday */
const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function pickRandomWindow(): { startHour: number; endHour: number } {
  return WINDOWS[Math.floor(Math.random() * WINDOWS.length)];
}

function pickRandomWeekdays(count: number): number[] {
  const pool = [...ALL_WEEKDAYS];
  const picked: number[] = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked.sort((a, b) => a - b);
}

function formatWindow(window: { startHour: number; endHour: number }): string {
  const pad = (hour: number) => String(hour).padStart(2, "0");
  return `${pad(window.startHour)}:00–${pad(window.endHour)}:00`;
}

function formatWeekdays(weekdays: number[]): string {
  return weekdays.map((day) => WEEKDAY_NAMES[day]).join(",");
}
/** Primary (capital / most-used) IANA timezone per ISO 3166-1 alpha-2 country. */
const COUNTRY_TIME_ZONES: Record<string, string> = {
  AD: "Europe/Andorra",
  AE: "Asia/Dubai",
  AF: "Asia/Kabul",
  AG: "America/Antigua",
  AI: "America/Anguilla",
  AL: "Europe/Tirane",
  AM: "Asia/Yerevan",
  AO: "Africa/Luanda",
  AQ: "Antarctica/McMurdo",
  AR: "America/Argentina/Buenos_Aires",
  AS: "Pacific/Pago_Pago",
  AT: "Europe/Vienna",
  AU: "Australia/Sydney",
  AW: "America/Aruba",
  AX: "Europe/Mariehamn",
  AZ: "Asia/Baku",
  BA: "Europe/Sarajevo",
  BB: "America/Barbados",
  BD: "Asia/Dhaka",
  BE: "Europe/Brussels",
  BF: "Africa/Ouagadougou",
  BG: "Europe/Sofia",
  BH: "Asia/Bahrain",
  BI: "Africa/Bujumbura",
  BJ: "Africa/Porto-Novo",
  BL: "America/St_Barthelemy",
  BM: "Atlantic/Bermuda",
  BN: "Asia/Brunei",
  BO: "America/La_Paz",
  BQ: "America/Kralendijk",
  BR: "America/Sao_Paulo",
  BS: "America/Nassau",
  BT: "Asia/Thimphu",
  BV: "Atlantic/South_Georgia",
  BW: "Africa/Gaborone",
  BY: "Europe/Minsk",
  BZ: "America/Belize",
  CA: "America/Toronto",
  CC: "Indian/Cocos",
  CD: "Africa/Kinshasa",
  CF: "Africa/Bangui",
  CG: "Africa/Brazzaville",
  CH: "Europe/Zurich",
  CI: "Africa/Abidjan",
  CK: "Pacific/Rarotonga",
  CL: "America/Santiago",
  CM: "Africa/Douala",
  CN: "Asia/Shanghai",
  CO: "America/Bogota",
  CR: "America/Costa_Rica",
  CV: "Atlantic/Cape_Verde",
  CW: "America/Curacao",
  CX: "Indian/Christmas",
  CY: "Asia/Nicosia",
  CZ: "Europe/Prague",
  DE: "Europe/Berlin",
  DJ: "Africa/Djibouti",
  DK: "Europe/Copenhagen",
  DM: "America/Dominica",
  DO: "America/Santo_Domingo",
  DZ: "Africa/Algiers",
  EC: "America/Guayaquil",
  EE: "Europe/Tallinn",
  EG: "Africa/Cairo",
  EH: "Africa/El_Aaiun",
  ER: "Africa/Asmara",
  ES: "Europe/Madrid",
  ET: "Africa/Addis_Ababa",
  FI: "Europe/Helsinki",
  FJ: "Pacific/Fiji",
  FK: "Atlantic/Stanley",
  FM: "Pacific/Chuuk",
  FO: "Atlantic/Faroe",
  FR: "Europe/Paris",
  GA: "Africa/Libreville",
  GB: "Europe/London",
  GD: "America/Grenada",
  GE: "Asia/Tbilisi",
  GF: "America/Cayenne",
  GG: "Europe/Guernsey",
  GH: "Africa/Accra",
  GI: "Europe/Gibraltar",
  GL: "America/Nuuk",
  GM: "Africa/Banjul",
  GN: "Africa/Conakry",
  GP: "America/Guadeloupe",
  GQ: "Africa/Malabo",
  GR: "Europe/Athens",
  GS: "Atlantic/South_Georgia",
  GT: "America/Guatemala",
  GU: "Pacific/Guam",
  GW: "Africa/Bissau",
  GY: "America/Guyana",
  HK: "Asia/Hong_Kong",
  HM: "Indian/Kerguelen",
  HN: "America/Tegucigalpa",
  HR: "Europe/Zagreb",
  HT: "America/Port-au-Prince",
  HU: "Europe/Budapest",
  ID: "Asia/Jakarta",
  IE: "Europe/Dublin",
  IL: "Asia/Jerusalem",
  IM: "Europe/Isle_of_Man",
  IN: "Asia/Kolkata",
  IO: "Indian/Chagos",
  IQ: "Asia/Baghdad",
  IS: "Atlantic/Reykjavik",
  IT: "Europe/Rome",
  JE: "Europe/Jersey",
  JM: "America/Jamaica",
  JO: "Asia/Amman",
  JP: "Asia/Tokyo",
  KE: "Africa/Nairobi",
  KG: "Asia/Bishkek",
  KH: "Asia/Phnom_Penh",
  KI: "Pacific/Tarawa",
  KM: "Indian/Comoro",
  KN: "America/St_Kitts",
  KR: "Asia/Seoul",
  KW: "Asia/Kuwait",
  KY: "America/Cayman",
  KZ: "Asia/Almaty",
  LA: "Asia/Vientiane",
  LB: "Asia/Beirut",
  LC: "America/St_Lucia",
  LI: "Europe/Vaduz",
  LK: "Asia/Colombo",
  LR: "Africa/Monrovia",
  LS: "Africa/Maseru",
  LT: "Europe/Vilnius",
  LU: "Europe/Luxembourg",
  LV: "Europe/Riga",
  LY: "Africa/Tripoli",
  MA: "Africa/Casablanca",
  MC: "Europe/Monaco",
  MD: "Europe/Chisinau",
  ME: "Europe/Podgorica",
  MF: "America/Marigot",
  MG: "Indian/Antananarivo",
  MH: "Pacific/Majuro",
  MK: "Europe/Skopje",
  ML: "Africa/Bamako",
  MM: "Asia/Yangon",
  MN: "Asia/Ulaanbaatar",
  MO: "Asia/Macau",
  MP: "Pacific/Saipan",
  MQ: "America/Martinique",
  MR: "Africa/Nouakchott",
  MS: "America/Montserrat",
  MT: "Europe/Malta",
  MU: "Indian/Mauritius",
  MV: "Indian/Maldives",
  MW: "Africa/Blantyre",
  MX: "America/Mexico_City",
  MY: "Asia/Kuala_Lumpur",
  MZ: "Africa/Maputo",
  NA: "Africa/Windhoek",
  NC: "Pacific/Noumea",
  NE: "Africa/Niamey",
  NF: "Pacific/Norfolk",
  NG: "Africa/Lagos",
  NI: "America/Managua",
  NL: "Europe/Amsterdam",
  NO: "Europe/Oslo",
  NP: "Asia/Kathmandu",
  NR: "Pacific/Nauru",
  NU: "Pacific/Niue",
  NZ: "Pacific/Auckland",
  OM: "Asia/Muscat",
  PA: "America/Panama",
  PE: "America/Lima",
  PF: "Pacific/Tahiti",
  PG: "Pacific/Port_Moresby",
  PH: "Asia/Manila",
  PK: "Asia/Karachi",
  PL: "Europe/Warsaw",
  PM: "America/Miquelon",
  PN: "Pacific/Pitcairn",
  PR: "America/Puerto_Rico",
  PS: "Asia/Gaza",
  PT: "Europe/Lisbon",
  PW: "Pacific/Palau",
  PY: "America/Asuncion",
  QA: "Asia/Qatar",
  RE: "Indian/Reunion",
  RO: "Europe/Bucharest",
  RS: "Europe/Belgrade",
  RU: "Europe/Moscow",
  RW: "Africa/Kigali",
  SA: "Asia/Riyadh",
  SB: "Pacific/Guadalcanal",
  SC: "Indian/Mahe",
  SD: "Africa/Khartoum",
  SE: "Europe/Stockholm",
  SG: "Asia/Singapore",
  SH: "Atlantic/St_Helena",
  SI: "Europe/Ljubljana",
  SJ: "Arctic/Longyearbyen",
  SK: "Europe/Bratislava",
  SL: "Africa/Freetown",
  SM: "Europe/San_Marino",
  SN: "Africa/Dakar",
  SO: "Africa/Mogadishu",
  SR: "America/Paramaribo",
  SS: "Africa/Juba",
  ST: "Africa/Sao_Tome",
  SV: "America/El_Salvador",
  SX: "America/Lower_Princes",
  SZ: "Africa/Mbabane",
  TC: "America/Grand_Turk",
  TD: "Africa/Ndjamena",
  TF: "Indian/Kerguelen",
  TG: "Africa/Lome",
  TH: "Asia/Bangkok",
  TJ: "Asia/Dushanbe",
  TK: "Pacific/Fakaofo",
  TL: "Asia/Dili",
  TM: "Asia/Ashgabat",
  TN: "Africa/Tunis",
  TO: "Pacific/Tongatapu",
  TR: "Europe/Istanbul",
  TT: "America/Port_of_Spain",
  TV: "Pacific/Funafuti",
  TW: "Asia/Taipei",
  TZ: "Africa/Dar_es_Salaam",
  UA: "Europe/Kyiv",
  UG: "Africa/Kampala",
  UM: "Pacific/Wake",
  US: "America/New_York",
  UY: "America/Montevideo",
  UZ: "Asia/Tashkent",
  VA: "Europe/Vatican",
  VC: "America/St_Vincent",
  VE: "America/Caracas",
  VG: "America/Tortola",
  VI: "America/St_Thomas",
  VN: "Asia/Ho_Chi_Minh",
  VU: "Pacific/Efate",
  WF: "Pacific/Wallis",
  WS: "Pacific/Apia",
  YE: "Asia/Aden",
  YT: "Indian/Mayotte",
  ZA: "Africa/Johannesburg",
  ZM: "Africa/Lusaka",
  ZW: "Africa/Harare",
};

type CliArgs = {
  apply: boolean;
  masterId: number | null;
};

function parseArgs(argv: string[]): CliArgs {
  let apply = false;
  let masterId: number | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--apply") {
      apply = true;
    } else if (arg === "--master-id" && next) {
      const parsed = Number(next);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid --master-id: ${next}`);
      }
      masterId = parsed;
      i += 1;
    } else if (arg === "--") {
      continue;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return { apply, masterId };
}

function resolveTimeZone(country: string | null): {
  timeZone: string;
  source: "country" | "fallback";
} {
  const code = country?.trim().toUpperCase() ?? "";
  if (code && COUNTRY_TIME_ZONES[code]) {
    return { timeZone: COUNTRY_TIME_ZONES[code], source: "country" };
  }
  return { timeZone: FALLBACK_TIME_ZONE, source: "fallback" };
}

function getZonedParts(
  date: Date,
  timeZone: string
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) throw new Error(`Missing Intl part: ${type}`);
    return Number(value);
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Convert a wall-clock local time in `timeZone` to a UTC Date. */
function zonedLocalToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const asUtc = new Date(utcGuess);
  const local = getZonedParts(asUtc, timeZone);
  const asLocalMs = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second
  );
  let result = new Date(utcGuess - (asLocalMs - utcGuess));

  // One more pass handles DST transition edges.
  const local2 = getZonedParts(result, timeZone);
  const asLocalMs2 = Date.UTC(
    local2.year,
    local2.month - 1,
    local2.day,
    local2.hour,
    local2.minute,
    local2.second
  );
  const desiredMs = Date.UTC(year, month - 1, day, hour, minute, second);
  if (asLocalMs2 !== desiredMs) {
    result = new Date(result.getTime() + (desiredMs - asLocalMs2));
  }

  return result;
}

function weekdayOfYmd(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function addCalendarDays(
  year: number,
  month: number,
  day: number,
  days: number
): { year: number; month: number; day: number } {
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** Next local calendar date in `timeZone` that falls on `targetWeekday` (today allowed). */
function nextOccurrenceOfWeekday(
  timeZone: string,
  targetWeekday: number
): { year: number; month: number; day: number } {
  const today = getZonedParts(new Date(), timeZone);
  let ymd = { year: today.year, month: today.month, day: today.day };
  for (let i = 0; i < 7; i += 1) {
    if (weekdayOfYmd(ymd.year, ymd.month, ymd.day) === targetWeekday) {
      return ymd;
    }
    ymd = addCalendarDays(ymd.year, ymd.month, ymd.day, 1);
  }
  throw new Error(`Could not find weekday ${targetWeekday} in ${timeZone}`);
}

function localWindowIntervalOnWeekday(
  timeZone: string,
  weekday: number,
  startHour: number,
  endHour: number
): { start: Date; end: Date } {
  const day = nextOccurrenceOfWeekday(timeZone, weekday);
  return {
    start: zonedLocalToUtc(timeZone, day.year, day.month, day.day, startHour),
    end: zonedLocalToUtc(timeZone, day.year, day.month, day.day, endHour),
  };
}

function estimateSlotsForMaster(window: {
  startHour: number;
  endHour: number;
}): number {
  const hours = window.endHour - window.startHour;
  return (
    hours * (60 / CHUNK_SIZE_MINUTES) * REPEAT_COUNT * DAYS_PER_WEEK
  );
}

async function createSchedulesForMaster(
  master: User,
  timeZone: string,
  window: { startHour: number; endHour: number },
  weekdays: number[],
  apply: boolean
): Promise<{ configs: number; slots: number }> {
  if (!apply) {
    return {
      configs: weekdays.length,
      slots: estimateSlotsForMaster(window),
    };
  }

  const price =
    master.hourlyRate != null && Number.isFinite(Number(master.hourlyRate))
      ? Number(master.hourlyRate)
      : null;

  let totalSlots = 0;

  for (const weekday of weekdays) {
    const interval = localWindowIntervalOnWeekday(
      timeZone,
      weekday,
      window.startHour,
      window.endHour
    );
    const result = await createPeriodicBatchSlots(master.id, {
      interval,
      chunkSizeMinutes: CHUNK_SIZE_MINUTES,
      period: Period.Weekly,
      repeatCount: REPEAT_COUNT,
      price,
    });
    totalSlots += result.slots.length;
  }

  return { configs: weekdays.length, slots: totalSlots };
}

async function main(): Promise<void> {
  const { apply, masterId } = parseArgs(process.argv.slice(2));

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  const userRepo = AppDataSource.getRepository(User);
  const qb = userRepo
    .createQueryBuilder("user")
    .where("user.isMaster = :isMaster", { isMaster: true })
    .andWhere("user.status = :status", { status: UserStatus.Active })
    .andWhere(
      `NOT EXISTS (
        SELECT 1 FROM schedule_slots slot
        WHERE slot."masterId" = "user".id
          AND slot."startTime" > :now
      )`,
      { now: new Date() }
    )
    .orderBy("user.id", "ASC");

  if (masterId != null) {
    qb.andWhere("user.id = :masterId", { masterId });
  }

  const masters = await qb.getMany();

  const summary = {
    masters: masters.length,
    withCountryTz: 0,
    fallbackTz: 0,
    configs: 0,
    slots: 0,
  };

  try {
    for (const master of masters) {
      const { timeZone, source } = resolveTimeZone(master.country);
      if (source === "country") summary.withCountryTz += 1;
      else summary.fallbackTz += 1;

      const window = pickRandomWindow();
      const weekdays = pickRandomWeekdays(DAYS_PER_WEEK);
      const result = await createSchedulesForMaster(
        master,
        timeZone,
        window,
        weekdays,
        apply
      );
      summary.configs += result.configs;
      summary.slots += result.slots;

      console.log(
        [
          `#${master.id}`,
          master.username,
          `country=${master.country ?? "null"}`,
          `tz=${timeZone}${source === "fallback" ? " (CET fallback)" : ""}`,
          `window=${formatWindow(window)}`,
          `days=${formatWeekdays(weekdays)}`,
          `price=${master.hourlyRate ?? "null"}`,
          apply
            ? `created ${result.slots} slots / ${result.configs} configs`
            : `would create ${result.slots} slots / ${result.configs} configs`,
        ].join(" | ")
      );
    }
  } finally {
    await AppDataSource.destroy();
  }

  console.log("");
  console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
  console.log(`Active masters without future slots: ${summary.masters}`);
  console.log(`Country timezone: ${summary.withCountryTz}`);
  console.log(`CET fallback: ${summary.fallbackTz}`);
  console.log(
    `${apply ? "Created" : "Would create"} configs: ${summary.configs}`
  );
  console.log(`${apply ? "Created" : "Would create"} slots: ${summary.slots}`);

  if (!apply) {
    console.log(
      "No database changes were made. Re-run with --apply to insert."
    );
  }
}

main().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
