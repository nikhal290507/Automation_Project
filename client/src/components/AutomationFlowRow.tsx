import { Automation } from "../types";
import { triggerMeta, conditionMeta, actionMeta } from "../lib/automationMeta";
import { FlowChip, FlowArrow } from "./FlowChip";

export function AutomationFlowRow({ automation }: { automation: Automation }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {automation.triggers.map((t) => (
        <FlowChip key={t.id} icon={triggerMeta[t.type].icon} label={triggerMeta[t.type].label} tone="trigger" />
      ))}
      {automation.conditions.length > 0 && (
        <>
          <FlowArrow />
          {automation.conditions.map((c) => (
            <FlowChip key={c.id} icon={conditionMeta[c.field].icon} label={`${conditionMeta[c.field].label}: ${c.value}`} tone="condition" />
          ))}
        </>
      )}
      <FlowArrow />
      {automation.actions.map((a) => (
        <FlowChip key={a.id} icon={actionMeta[a.type].icon} label={actionMeta[a.type].label} tone="action" />
      ))}
    </div>
  );
}
