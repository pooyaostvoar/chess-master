import { User } from "../database/entity/user";
import { getGoogleCleintID, getGoogleClientSecret } from "../utils/secret";
import { google } from "googleapis";

export async function createCalendarEvent({
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
  try {
    // ---------------------------
    // 1️⃣ Google OAuth (refresh token only)
    // ---------------------------
    const auth = new google.auth.OAuth2(
      getGoogleCleintID(),
      getGoogleClientSecret()
    );

    auth.setCredentials({
      refresh_token: master.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth });

    // ---------------------------
    // 2️⃣ Create Calendar Event + Meet link
    // ---------------------------
    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all", // Send calendar invite to attendees
      requestBody: {
        summary: "ChessWithMasters Class",
        description: `Chess class session between student and teacher.
            
    Join via Google Meet using the link below.`,
        start: {
          dateTime: startUtc.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endUtc.toISOString(),
          timeZone: "UTC",
        },
        attendees: [
          { email: user.email }, // Student
          { email: master.email }, // ✅ Add teacher email here
        ],
        conferenceData: {
          createRequest: {
            requestId: `chess-${Date.now()}-${crypto.randomUUID()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
        // ✅ Key settings for open meeting
        guestsCanModify: false,
        guestsCanInviteOthers: true,
        guestsCanSeeOtherGuests: true,
        anyoneCanAddSelf: true, // ✅ Anyone with link can join directly

        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      },
    });
    return event;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    throw error;
  }
}
