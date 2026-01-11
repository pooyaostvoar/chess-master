// emailService.ts
import * as SibApiV3Sdk from "@sendinblue/client";

import { readSecret } from "../utils/secret";

// Read API key from Docker secret
const BREVO_API_KEY = readSecret("/run/secrets/brevo_api_key");

// Initialize Brevo client
let client: SibApiV3Sdk.TransactionalEmailsApi | undefined =
  new SibApiV3Sdk.TransactionalEmailsApi();
if (BREVO_API_KEY) {
  client.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    BREVO_API_KEY
  );
} else {
  client = undefined;
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
  if (!client) {
    console.warn("Brevo client not initialized. Email not sent.");
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
