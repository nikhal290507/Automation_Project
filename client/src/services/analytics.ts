import { api } from "../lib/api";

export interface AnalyticsData {
  timeline: Array<{ date: string; success: number; failed: number; skipped: number }>;
  topAutomations: Array<{ name: string; runs: number }>;
  totalRuns: number;
  successRate: number;
}

export const analyticsApi = {
  get: () => api.get<AnalyticsData>("/analytics").then((r) => r.data),
};
