// emailService.ts
import * as SibApiV3Sdk from "@sendinblue/client";
import { readSecret } from "../utils/secret";

import crypto from "crypto";
import { User } from "../database/entity/user";
import { createCalendarEvent } from "./google";

// Read API key from Docker secret
const BREVO_API_KEY = readSecret("/run/secrets/brevo_api_key");

// Initialize Brevo client
let client: SibApiV3Sdk.TransactionalEmailsApi | undefined;
//  =
//   new SibApiV3Sdk.TransactionalEmailsApi();
// if (BREVO_API_KEY) {
//   client.setApiKey(
//     SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
//     BREVO_API_KEY
//   );
// } else {
//   client = undefined;
// }

function getClient() {
  client = new SibApiV3Sdk.TransactionalEmailsApi();
  if (BREVO_API_KEY) {
    client.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      BREVO_API_KEY
    );
  } else {
    client = undefined;
  }
  return client;
}

interface SendEmailOptions {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  fromEmail?: string;
  fromName?: string;
}

export async function sendEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  textContent,
  fromEmail = "welcome@chesswithmasters.com",
  fromName = "ChessWithMasters",
}: SendEmailOptions): Promise<void> {
  const client = getClient();
  if (!client) {
    console.log("Brevo client not initialized. Email not sent.");
    return;
  }
  try {
    const sendSmtpEmail: SibApiV3Sdk.SendSmtpEmail = {
      to: [{ email: toEmail, name: toName }],
      sender: { email: fromEmail, name: fromName },
      subject,
      htmlContent,
      textContent,
    };

    await client.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

interface WelcomeEmailOptions {
  toEmail: string;
  toName: string;
}

export async function sendWelcomeEmail({
  toEmail,
  toName,
}: WelcomeEmailOptions) {
  const subject = "Welcome to Chess with Masters";

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h1 style="color:#2a2a2a;">Welcome to Chess with Masters</h1>

        <p>
          Chess with Masters connects people who want to improve their chess
          with experienced masters.
        </p>

        <p><strong>If you want to learn:</strong></p>
        <ul>
          <li>Browse our masters</li>
          <li>Check their schedules</li>
          <li>Book sessions and start improving</li>
        </ul>

        <p><strong>If you are a master:</strong></p>
        <ul>
          <li>Add your profile and experience</li>
          <li>Set your availability</li>
          <li>Teach students and earn money</li>
        </ul>

        <p>
          We’re excited to have you with us and can’t wait to see you grow.
        </p>

        <p>— The Chess with Masters Team</p>
      </body>
    </html>
  `;

  const textContent = `
Welcome to Chess with Masters.

Chess with Masters connects people who want to improve their chess with experienced masters.

If you want to learn:
- Browse our masters
- Check their schedules
- Book sessions and improve your game

If you are a master:
- Add your profile
- Set your availability
- Teach students and earn money

— The Chess with Masters Team
  `.trim();

  await sendEmail({
    toEmail,
    toName,
    subject,
    htmlContent,
    textContent,
  });
}

export interface ReservationEmailOptions {
  startDateTimeISO: string;
  masterEmail: string;
  masterName: string;
  studentEmail: string;
  studentName: string;
}
export async function sendReservationRequestEmail({
  masterEmail,
  masterName,
  studentName,
  studentEmail,
  startDateTimeISO,
}: ReservationEmailOptions) {
  const date = new Date(startDateTimeISO);

  const formattedDateUTC = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);

  const subject = "New lesson reservation request";

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2>New Reservation Request</h2>

        <p>
          <strong>${studentName}</strong> (${studentEmail})
          has requested a lesson with you.
        </p>

        <p><strong>Requested time:</strong></p>
        <p>
          ${formattedDateUTC}<br/>
          <small>Time zone: UTC</small>
        </p>

        <p>
          Please log in to your dashboard to
          <strong>approve or reject</strong> this reservation.
        </p>

        <p>— Chess with Masters</p>
      </body>
    </html>
  `;

  const textContent = `
New Reservation Request

${studentName} (${studentEmail}) has requested a lesson with you.

Requested time:
${formattedDateUTC}
Time zone: UTC

Please log in to your dashboard to approve or reject this reservation.

— Chess with Masters
  `.trim();

  await sendEmail({
    toEmail: masterEmail,
    toName: masterName,
    subject,
    htmlContent,
    textContent,
  });
}

function generateICS({
  uid,
  startUtc,
  endUtc,
  summary,
  description,
  location,
  meetUrl,
}: {
  uid: string;
  startUtc: Date;
  endUtc: Date;
  summary: string;
  description?: string;
  location?: string;
  meetUrl?: string;
}) {
  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // RFC5545 escaping
  const escapeText = (text: string) =>
    text
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const isUrl = (v?: string) => !!v && /^https?:\/\//i.test(v.trim());

  // Prevent URLs from ever becoming a physical location
  const safeLocation = (() => {
    if (isUrl(location)) return "Online";
    if (location) return location;
    if (meetUrl) return "Online";
    return "";
  })();

  const fullDescription = [
    description,
    meetUrl ? `Join meeting: ${meetUrl}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ChessWithMasters//Reservation//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${format(new Date())}
DTSTART:${format(startUtc)}
DTEND:${format(endUtc)}
SUMMARY:${escapeText(summary)}
DESCRIPTION:${escapeText(fullDescription)}
${safeLocation ? `LOCATION:${escapeText(safeLocation)}` : ""}
${meetUrl ? `URL:${escapeText(meetUrl)}` : ""}
END:VEVENT
END:VCALENDAR
`.trim();
}

export async function sendReservationEmail({
  user,
  master,
  startUtc,
  endUtc,
}: {
  user: User;
  master: User;
  startUtc: Date;
  endUtc: Date;
}) {
  client = getClient();
  if (!client) return;

  const { email, username } = user;

  let meetLink: string | undefined;
  let calendarLink: string | undefined;
  let icsContent: string | undefined;

  // ---------------------------
  // 1️⃣ Try creating Google Calendar event
  // ---------------------------

  try {
    const event = await createCalendarEvent({
      user,
      master,
      startUtc,
      endUtc,
    });

    meetLink = event.data.hangoutLink ?? undefined;
    calendarLink = event.data.htmlLink ?? undefined;
  } catch (err) {
    console.error("⚠️ Calendar creation failed, using ICS fallback", err);
    meetLink = `https://meet.chesswithmasters.com/${user.id}-${
      master.id
    }-${new Date().getTime()}`;
    // ---------------------------
    // 2️⃣ Fallback: generate ICS
    // ---------------------------
    icsContent = generateICS({
      uid: `chess-${crypto.randomUUID()}`,
      startUtc,
      endUtc,
      summary: "ChessWithMasters Class",
      description: "Chess class session between student and teacher.",
      location: "Online",
      meetUrl: meetLink,
    });
  }

  // ---------------------------
  // 3️⃣ Email content
  // ---------------------------
  const formattedDate = startUtc.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  });

  const subject = "✅ Chess Class Confirmed";

  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Your Chess Class is Confirmed ♟️</h2>

    <p>Hi <strong>${username}</strong>,</p>

    <p><strong>📅 Date & Time:</strong><br>${formattedDate} (UTC)</p>

    ${
      meetLink
        ? `<p><strong>🎥 Join Class:</strong><br>
            <a href="${meetLink}">${meetLink}</a></p>`
        : `<p><strong>📎 Calendar Invite:</strong> Attached (.ics)</p>`
    }

    ${
      calendarLink
        ? `<p><a href="${calendarLink}">View in Google Calendar →</a></p>`
        : ""
    }

    <p>— ChessWithMasters Team</p>
  </div>
  `;

  const textContent = `
Chess Class Confirmed ♟️

Hi ${username},

Date & Time:
${formattedDate} (UTC)

${meetLink ? `Join Class:\n${meetLink}` : "Calendar invite attached (.ics)"}

— ChessWithMasters Team
`.trim();

  // ---------------------------
  // 4️⃣ Send email (attach ICS only if needed)
  // ---------------------------
  const sendSmtpEmail: SibApiV3Sdk.SendSmtpEmail = {
    to: [
      { email: user.email, name: username },
      { email: master.email, name: master.email },
    ],
    sender: {
      email: "no-reply@chesswithmasters.com",
      name: "ChessWithMasters",
    },
    subject,
    htmlContent,
    textContent,
    ...(icsContent && {
      attachment: [
        {
          name: "chess-class.ics",
          content: Buffer.from(icsContent).toString("base64"),
        },
      ],
    }),
  };

  await client.sendTransacEmail(sendSmtpEmail);

  return {
    success: true,
    meetLink,
    calendarLink,
    usedICSFallback: !!icsContent,
  };
}
