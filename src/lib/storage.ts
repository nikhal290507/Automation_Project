const PREFIX = 'autoflow:';

export const KEYS = {
  user: `${PREFIX}user`,
  connections: `${PREFIX}connections`,
  emails: `${PREFIX}emails`,
  events: `${PREFIX}events`,
  automations: `${PREFIX}automations`,
  tasks: `${PREFIX}tasks`,
  activity: `${PREFIX}activity`,
  focusSessions: `${PREFIX}focusSessions`,
  notificationPrefs: `${PREFIX}notificationPrefs`,
  theme: `${PREFIX}theme`,
  seeded: `${PREFIX}seeded`,
} as const;

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently in demo app
  }
}

export function clearAllAutoflowData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
