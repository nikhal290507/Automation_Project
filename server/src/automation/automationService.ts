import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";
import { matchesTrigger } from "./triggerService";
import { evaluateConditions } from "./conditionService";
import { runActions } from "./actionService";
import { ExecutionContext } from "./types";

const automationInclude = {
  triggers: true,
  conditions: true,
  actions: { orderBy: { order: "asc" as const } },
};

const automationIncludeWithExecutions = {
  ...automationInclude,
  executions: { orderBy: { createdAt: "desc" as const }, take: 20 },
};

export async function listAutomations(userId: string) {
  return prisma.automation.findMany({
    where: { userId },
    include: automationInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAutomation(userId: string, id: string) {
  const automation = await prisma.automation.findFirst({ where: { id, userId }, include: automationIncludeWithExecutions });
  if (!automation) throw new AppError("Automation not found", 404);
  return automation;
}

interface CreateAutomationInput {
  name: string;
  description?: string;
  trigger: { type: string; config?: Record<string, unknown> };
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ type: string; config?: Record<string, unknown> }>;
}

export async function createAutomation(userId: string, input: CreateAutomationInput) {
  return prisma.automation.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      triggers: { create: [{ type: input.trigger.type as never, config: input.trigger.config ?? {} }] },
      conditions: {
        create: input.conditions.map((c) => ({ field: c.field as never, operator: c.operator as never, value: c.value })),
      },
      actions: {
        create: input.actions.map((a, index) => ({ type: a.type as never, order: index, config: a.config ?? {} })),
      },
    },
    include: automationInclude,
  });
}

export async function updateAutomation(userId: string, id: string, input: Partial<CreateAutomationInput> & { isEnabled?: boolean }) {
  await getAutomation(userId, id); // ensures ownership + existence

  return prisma.$transaction(async (tx) => {
    if (input.name !== undefined || input.description !== undefined || input.isEnabled !== undefined) {
      await tx.automation.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.isEnabled !== undefined ? { isEnabled: input.isEnabled } : {}),
        },
      });
    }

    if (input.trigger) {
      await tx.automationTrigger.deleteMany({ where: { automationId: id } });
      await tx.automationTrigger.create({ data: { automationId: id, type: input.trigger.type as never, config: input.trigger.config ?? {} } });
    }

    if (input.conditions) {
      await tx.automationCondition.deleteMany({ where: { automationId: id } });
      if (input.conditions.length) {
        await tx.automationCondition.createMany({
          data: input.conditions.map((c) => ({ automationId: id, field: c.field as never, operator: c.operator as never, value: c.value })),
        });
      }
    }

    if (input.actions) {
      await tx.automationAction.deleteMany({ where: { automationId: id } });
      if (input.actions.length) {
        await tx.automationAction.createMany({
          data: input.actions.map((a, index) => ({ automationId: id, type: a.type as never, order: index, config: a.config ?? {} })),
        });
      }
    }

    return tx.automation.findUniqueOrThrow({ where: { id }, include: automationInclude });
  });
}

export async function deleteAutomation(userId: string, id: string) {
  await getAutomation(userId, id);
  await prisma.automation.delete({ where: { id } });
}

export async function toggleAutomation(userId: string, id: string) {
  const automation = await getAutomation(userId, id);
  return prisma.automation.update({ where: { id: automation.id }, data: { isEnabled: !automation.isEnabled }, include: automationInclude });
}

// ---------------------------------------------------------------------------
// Execution engine
//
//   Trigger -> Load Automation -> Check Conditions -> Execute Actions
//     -> Create Execution Log -> Return Result
// ---------------------------------------------------------------------------

export async function runAutomation(userId: string, id: string, context: ExecutionContext) {
  const startedAt = Date.now();
  const automation = await getAutomation(userId, id);

  if (!automation.isEnabled) {
    return prisma.automationExecution.create({
      data: { automationId: id, userId, status: "SKIPPED", resultSummary: "Automation is disabled", triggerSnapshot: context as never },
    });
  }

  const triggerMatched = automation.triggers.every((t) => matchesTrigger(t, context));
  if (!triggerMatched) {
    return prisma.automationExecution.create({
      data: { automationId: id, userId, status: "SKIPPED", resultSummary: "Trigger conditions not met", triggerSnapshot: context as never },
    });
  }

  const conditionsPass = evaluateConditions(automation.conditions, context);
  if (!conditionsPass) {
    return prisma.automationExecution.create({
      data: { automationId: id, userId, status: "SKIPPED", resultSummary: "Conditions not satisfied", triggerSnapshot: context as never },
    });
  }

  const results = await runActions(userId, automation.actions, context);
  const allOk = results.every((r) => r.ok);
  const status = allOk ? "SUCCESS" : results.some((r) => r.ok) ? "PARTIAL" : "FAILED";

  await prisma.automation.update({ where: { id }, data: { lastExecuted: new Date() } });
  await prisma.activityLog.create({
    data: { userId, type: "automation.executed", message: `${automation.name} ran (${status.toLowerCase()})` },
  });

  return prisma.automationExecution.create({
    data: {
      automationId: id,
      userId,
      status,
      resultSummary: results.map((r) => r.detail).join("; "),
      durationMs: Date.now() - startedAt,
      triggerSnapshot: context as never,
    },
  });
}
