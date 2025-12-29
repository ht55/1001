// src/components/metrics/MetricsPanel.tsx

import { ReferencePanel } from "@/components/common/ReferencePanel"
import type { StoryMetrics } from "@/lib/collectMetrics"

import { worldModifierLabelMap } from "@/lib/worldModifier/worldModifierLabels"

export function MetricsPanel({ metrics }: { metrics: StoryMetrics }) {
  return (
    <ReferencePanel title="生成後メトリクス（結果）">
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <div style={{ opacity: 0.7, marginBottom: 8 }}>
          実際に物語内で起きた構造変化の結果
        </div>

        <div>
          <strong>適用された世界修飾子：</strong>
          {metrics.appliedModifiers.length
            ? metrics.appliedModifiers
                .map(m => worldModifierLabelMap[m.id])
                .join(", ")
            : "なし"}
        </div>

        <div>
          <strong>無効化された構造数：</strong>
          {metrics.inactiveCount}
        </div>

        <div>
          <strong>反転した構造数：</strong>
          {metrics.invertedCount}
        </div>

        <div>
          <strong>平均歪み強度：</strong>
          {metrics.avgWeight.toFixed(2)}
        </div>
      </div>
    </ReferencePanel>
  )
}
