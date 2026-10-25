import { AutomationCondition } from "@prisma/client";
import { ExecutionContext } from "./types";

const FIELD_MAP: Record<string, keyof ExecutionContext> = {
  SENDER: "sender",
  SUBJECT: "subject",
  KEYWORD: "keyword",
  TIME: "time",
  IMPORTANCE: "importance",
  CATEGORY: "category",
};

function compare(operator: string, actual: string, expected: string): boolean {
  switch (operator) {
    case "EQUALS":
      return actual.toLowerCase() === expected.toLowerCase();
    case "NOT_EQUALS":
      return actual.toLowerCase() !== expected.toLowerCase();
    case "CONTAINS":
      return actual.toLowerCase().includes(expected.toLowerCase());
    case "GREATER_THAN":
      return actual > expected;
    case "LESS_THAN":
      return actual < expected;
    default:
      return false;
  }
}

// All conditions must pass (logical AND) for actions to run. Missing context
// values are treated as non-matches rather than throwing, so a partially
// populated context never crashes the engine.
export function evaluateConditions(conditions: Pick<AutomationCondition, "field" | "operator" | "value">[], context: ExecutionContext): boolean {
  return conditions.every((condition) => {
    const contextKey = FIELD_MAP[condition.field];
    const actual = contextKey ? context[contextKey] : undefined;
    if (actual === undefined || actual === null) return false;
    return compare(condition.operator, String(actual), condition.value);
  });
}
