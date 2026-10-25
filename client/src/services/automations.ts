import { api } from "../lib/api";
import { Automation, AutomationExecution, TriggerType, ConditionField, ConditionOperator, ActionType } from "../types";

export interface AutomationInput {
  name: string;
  description?: string;
  trigger: { type: TriggerType; config?: Record<string, unknown> };
  conditions: Array<{ field: ConditionField; operator: ConditionOperator; value: string }>;
  actions: Array<{ type: ActionType; config?: Record<string, unknown> }>;
}

export const automationsApi = {
  list: () => api.get<{ automations: Automation[] }>("/automations").then((r) => r.data.automations),
  get: (id: string) => api.get<{ automation: Automation }>(`/automations/${id}`).then((r) => r.data.automation),
  create: (input: AutomationInput) => api.post<{ automation: Automation }>("/automations", input).then((r) => r.data.automation),
  update: (id: string, input: Partial<AutomationInput> & { isEnabled?: boolean }) =>
    api.put<{ automation: Automation }>(`/automations/${id}`, input).then((r) => r.data.automation),
  remove: (id: string) => api.delete(`/automations/${id}`),
  toggle: (id: string) => api.patch<{ automation: Automation }>(`/automations/${id}/toggle`).then((r) => r.data.automation),
  run: (id: string, context: Record<string, unknown> = {}) =>
    api.post<{ execution: AutomationExecution }>(`/automations/${id}/run`, { context }).then((r) => r.data.execution),
};
