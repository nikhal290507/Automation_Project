import { api } from "../lib/api";
import { Subscription } from "../types";

export const billingApi = {
  get: () => api.get<{ subscription: Subscription }>("/billing").then((r) => r.data.subscription),
  upgrade: () => api.post<{ subscription: Subscription }>("/billing/upgrade").then((r) => r.data.subscription),
  downgrade: () => api.post<{ subscription: Subscription }>("/billing/downgrade").then((r) => r.data.subscription),
};
