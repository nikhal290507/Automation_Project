// Shared execution context passed through the trigger -> condition -> action
// pipeline. It's intentionally a loose bag of fields because different
// triggers (email vs calendar vs schedule) populate different parts of it.
export interface ExecutionContext {
  sender?: string;
  subject?: string;
  snippet?: string;
  keyword?: string;
  importance?: "high" | "normal" | "low";
  category?: string;
  time?: string;
  eventTitle?: string;
  [key: string]: unknown;
}
