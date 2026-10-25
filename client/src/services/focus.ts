import { api } from "../lib/api";
import { FocusSession } from "../types";

export const focusApi = {
  status: () => api.get<{ active: FocusSession | null; history: FocusSession[] }>("/focus").then((r) => r.data),
  start: (reason?: string) => api.post<{ session: FocusSession }>("/focus", { reason }).then((r) => r.data.session),
  toggle: (id: string) => api.patch<{ session: FocusSession }>(`/focus/${id}/toggle`).then((r) => r.data.session),
};
