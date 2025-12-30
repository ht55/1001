// src/components/reaction/CharacterThemeMatrix.tsx

import { characters } from "@/data/characters"
import { themes } from "@/themes"
import { getReactionProfile } from "@/lib/getReactionProfile"
import { getDominantAxis } from "@/lib/getDominantAxis"
import type { ReactionAxis } from "@/types/reactionProfile"

const AXIS_COLOR: Record<ReactionAxis, string> = {
  resonance: "#2563eb",      // blue
  tension: "#c2410c",        // orange
  distortion: "#6b21a8",     // purple
  collapse: "#b91c1c",       // red
  void: "#525252",           // gray
  transcendence: "#16a34a",  // green
}

function LevelBar({
  level,
  color,
}: {
  level: number
  color: string
}) {
  return (
    <div style={{ display: "flex", gap: 2, marginTop: 4, justifyContent: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 6,
            borderRadius: 2,
            background: i < level ? color : "#e0e0e0",
          }}
        />
      ))}
    </div>
  )
}

export function CharacterThemeMatrix() {
  return (
  <div>
    <h3>Character × Theme</h3>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        特徴が強めなCharacter x Themeを掛け合わせた化学反応(ReactionProfile)の傾向とマグニチュードを可視化したものです。(左右にスクロールすると15 x 15全てのコンビネーションの反応をご覧になれます。)
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `140px repeat(${themes.length}, 1fr)`,
          gap: 8,
        }}
      >
        {/* Header */}
        <div />
        {themes.map(t => (
          <div
            key={t.id}
            style={{
              fontSize: 12,
              fontWeight: "bold",
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            {t.label}
          </div>
        ))}

        {/* Rows */}
        {characters.map(c => (
          <>
            <div
              key={c.id}
              style={{
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {c.name}
            </div>

            {themes.map(t => {
              const profile = getReactionProfile(c.id, t.id)
              const axis = getDominantAxis(profile)
              const level = profile[axis]

              return (
                <div
                  key={`${c.id}-${t.id}`}
                  style={{
                    background: "#a19b8fff",
                    borderRadius: 8,
                    padding: 6,
                    textAlign: "center",
                    fontSize: 10,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: AXIS_COLOR[axis],
                    }}
                  >
                    {axis}
                  </div>

                  <LevelBar level={level} color={AXIS_COLOR[axis]} />
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
