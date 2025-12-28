// src/components/reaction/ReactionSituationMatrix.tsx

import React from "react"
import { situationCategories } from "@/situations/situationCategories"
import { applyTransition } from "@/lib/applyTransition"
import type { ReactionAxis } from "@/types/reactionProfile"

const REACTION_AXES: ReactionAxis[] = [
  "resonance",
  "tension",
  "distortion",
  "collapse",
  "void",
  "transcendence",
]

const TRANSITION_LABEL_MAP: Record<string, string> = {
  fix: "固定",
  destabilize: "不安定化",
  amplify: "増幅",
  transform: "変形",
  suppress: "抑制",
  invert: "反転",
}

export default function ReactionSituationMatrix() {
  const categories = situationCategories.map(c => ({
    id: c.categoryId,
    label: c.label,
  }))

  return (
    <div>
      <h3>Situation Category × ReactionProfile</h3>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        デフォルト遷移表（Phase2 下敷き）
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `140px repeat(${categories.length}, 1fr)`,
          gap: 2,
        }}
      >
        {/* Header */}
        <div />
        {categories.map(cat => (
          <div
            key={cat.id}
            style={{ fontSize: 12, textAlign: "center", fontWeight: "bold" }}
          >
            {cat.label}
          </div>
        ))}

        {/* Rows */}
        {REACTION_AXES.map(axis => (
          <React.Fragment key={axis}>
            <div
              style={{
                fontSize: 12,
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {axis}
            </div>

            {categories.map(cat => {
              const transition = applyTransition(axis, cat.id)
              return (
                <div
                  key={`${axis}-${cat.id}`}
                  style={{
                    border: "1px solid #333",
                    borderRadius: 4,
                    padding: "6px 4px",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {TRANSITION_LABEL_MAP[transition] ?? transition}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
