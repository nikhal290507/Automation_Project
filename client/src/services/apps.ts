import { api } from "../lib/api";
import { AppProvider, ConnectedApp } from "../types";

export const appsApi = {
  list: () => api.get<{ apps: ConnectedApp[] }>("/apps").then((r) => r.data.apps),
  connect: (provider: AppProvider, accountLabel: string) =>
    api.post<{ app: ConnectedApp }>("/apps/connect", { provider, accountLabel }).then((r) => r.data.app),
  disconnect: (id: string) => api.delete(`/apps/${id}`),
};
