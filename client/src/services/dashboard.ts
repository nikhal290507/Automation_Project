import { api } from "../lib/api";
import { DashboardData } from "../types";

export const dashboardApi = {
  get: () => api.get<DashboardData>("/dashboard").then((r) => r.data),
};
