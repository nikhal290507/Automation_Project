import { calendarProvider } from "../integrations";

export async function fetchUpcomingEvents() {
  return calendarProvider.fetchUpcomingEvents();
}

export async function createCalendarEvent(title: string, startsAt: string, endsAt: string) {
  return calendarProvider.createEvent({ title, startsAt, endsAt });
}
