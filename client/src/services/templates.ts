import { api } from "../lib/api";
import { Automation, Template } from "../types";

export const templatesApi = {
  list: () => api.get<{ templates: Template[] }>("/templates").then((r) => r.data.templates),
  use: (id: string) => api.post<{ automation: Automation }>(`/templates/${id}/use`).then((r) => r.data.automation),
};
