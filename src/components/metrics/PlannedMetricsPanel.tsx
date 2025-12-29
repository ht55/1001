// src/components/metrics/PlannedMetricsPanel.tsx
// ReactionAxis 日本語ラベル適用・最終版

import { ReferencePanel } from "@/components/common/ReferencePanel"
import type { PlannedMetrics } from "@/lib/buildPlannedMetrics"
import { structuralFunctionLabelMap } from "@/lib/structure/structuralFunctionLabels"
import { worldModifierLabelMap } from "@/lib/worldModifier/worldModifierLabels"
import { reactionAxisLabelMap } from "@/lib/reaction/reactionLabels"

export function PlannedMetricsPanel({ data }: { data: PlannedMetrics }) {
  return (
    <ReferencePanel title="生成前メトリクス（条件）">
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <div style={{ opacity: 0.7, marginBottom: 8 }}>
          この条件で関与する構造と歪み
        </div>

        <div>
          <strong>構造機能：</strong>
          {data.requiredFunctions.length
            ? data.requiredFunctions
                .map(f => structuralFunctionLabelMap[f])
                .join(", ")
            : "なし"}
        </div>

        <div>
          <strong>世界修飾子：</strong>
          {data.plannedModifiers.length
            ? data.plannedModifiers
                .map(m => worldModifierLabelMap[m.id])
                .join(", ")
            : "なし"}
        </div>

        <div>
          <strong>反応プロファイル：</strong>
          {Object.entries(data.reactionProfile)
            .map(([k, v]) => `${reactionAxisLabelMap[k as any]}:${v}`)
            .join(", ")}
        </div>
      </div>
    </ReferencePanel>
  )
}
