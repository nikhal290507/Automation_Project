import { CalendarProvider, IntegrationCalendarEvent } from "./types";

// MOCK PROVIDER: Google Calendar also requires OAuth approval. See gmailProvider.ts
// for the same pattern - swap this for a live implementation without touching
// the automation engine.
class MockCalendarProvider implements CalendarProvider {
  mode = "mock" as const;

  async fetchUpcomingEvents(): Promise<IntegrationCalendarEvent[]> {
    const now = Date.now();
    return [
      {
        id: "mock-event-1",
        title: "Sprint planning",
        startsAt: new Date(now + 1000 * 60 * 45).toISOString(),
        endsAt: new Date(now + 1000 * 60 * 105).toISOString(),
        attendees: ["you@company.com", "team-lead@company.com"],
      },
      {
        id: "mock-event-2",
        title: "1:1 with manager",
        startsAt: new Date(now + 1000 * 60 * 60 * 4).toISOString(),
        endsAt: new Date(now + 1000 * 60 * 60 * 4.5).toISOString(),
        attendees: ["you@company.com", "manager@company.com"],
      },
    ];
  }

  async createEvent(input: { title: string; startsAt: string; endsAt: string }): Promise<IntegrationCalendarEvent> {
    console.log(`[mock calendar] created event "${input.title}"`);
    return { id: `mock-event-${Date.now()}`, attendees: [], ...input };
  }
}

export const calendarProvider: CalendarProvider = new MockCalendarProvider();
