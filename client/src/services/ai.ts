import { api } from "../lib/api";
import { ActionType, ConditionField, ConditionOperator, TriggerType } from "../types";

export interface GeneratedAutomation {
  name: string;
  trigger: { type: TriggerType; config?: Record<string, unknown> };
  conditions: Array<{ field: ConditionField; operator: ConditionOperator; value: string }>;
  actions: Array<{ type: ActionType; config?: Record<string, unknown> }>;
}

export const aiApi = {
  classifyEmail: (input: { sender: string; subject: string; snippet?: string }) =>
    api.post("/ai/classify-email", input).then((r) => r.data),
  generateReply: (input: { subject: string; snippet: string; tone?: string }) =>
    api.post("/ai/generate-reply", input).then((r) => r.data),
  createAutomation: (prompt: string) =>
    api.post<{ automation: GeneratedAutomation; mode: string }>("/ai/create-automation", { prompt }).then((r) => r.data),
};
