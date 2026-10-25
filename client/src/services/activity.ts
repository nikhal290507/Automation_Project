import { api } from "../lib/api";
import { ActivityLogEntry } from "../types";

export const activityApi = {
  list: (limit = 50) => api.get<{ logs: ActivityLogEntry[] }>(`/activity?limit=${limit}`).then((r) => r.data.logs),
};
