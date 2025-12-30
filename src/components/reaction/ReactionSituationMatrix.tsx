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
  stabilize: "保留",
  fix: "固定",
  destabilize: "撹乱",
  amplify: "増幅",
  invert: "反転",
  collapse: "崩壊",
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
        Charcter x Theme によって得られたReaction ProfileをさらにSituationと掛け合わせた場合に起こり得る歪みパターンの内部構造の一部です。
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
