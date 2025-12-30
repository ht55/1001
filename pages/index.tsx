// src/pages/story/index.tsx

import { GeneratingOverlay } from "@/components/GeneratingOverlay"
import { useState } from "react"
import { useOpenAIKey } from "@/hooks/useOpenAIKey"

import { characters } from "@/data/characters"
import { themes } from "@/themes"
import { voices } from "@/voices"

import type { Theme } from "@/types/theme"
import type { voiceKey } from "@/types/voiceKeys"
import type { situationKey } from "@/types/situationKeys"
import { AffinitySymbol } from "@/types/affinity"

import AffinityMatrix from "@/components/affinity/AffinityMatrix"
import { CharacterThemeMatrix } from "@/components/reaction/CharacterThemeMatrix"
import ReactionSituationMatrix from "@/components/reaction/ReactionSituationMatrix"
import { ReferencePanel } from "@/components/common/ReferencePanel"
import { PlannedMetricsPanel } from "@/components/metrics/PlannedMetricsPanel"
import { MetricsPanel } from "@/components/metrics/MetricsPanel"
import { OpenAIKeyInput } from "@/components/OpenAIKeyInput"

import { affinityMap } from "@/affinities/affinityMap"
import { SITUATION_PRESETS } from "@/data/situationPresets"
import { situationLabelMap } from "@/utils/situationLabelMap"
import { voiceLabelMap } from "@/utils/voiceLabelMap"

import { getReactionProfile } from "@/lib/getReactionProfile"
import { mapSituationToWorldModifiers } from "@/lib/mapSituationToWorldModifiers"
import { mapSituationToRequiredFunctions } from "@/lib/mapSituationToRequiredFunctions"
import { normalizeMode3 } from "@/lib/constraints/normalizeMode3"
import { runWithLLM } from "@/lib/runWithLLM"

import type { StoryMetrics } from "@/lib/collectMetrics"
import { runWithFakerMode3 } from "@/lib/runWithFakerMode3"

export default function StoryPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [selectedSituation, setSelectedSituation] = useState<situationKey | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<voiceKey | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)

  const [generatedStory, setGeneratedStory] = useState("")
  const [resultMetrics, setResultMetrics] = useState<StoryMetrics | null>(null)

  const [mode, setMode] = useState<"faker" | "llm" | "faker_llm">("faker")

  // ===== 生成前 Metrics（表示専用）=====
  const reactionProfile =
    selectedCharacter && selectedTheme
      ? getReactionProfile(selectedCharacter, selectedTheme.id)
      : null

  const plannedMetrics =
    selectedSituation && reactionProfile
      ? {
          requiredFunctions: mapSituationToRequiredFunctions(selectedSituation),
          plannedModifiers: mapSituationToWorldModifiers(selectedSituation, reactionProfile),
          reactionProfile,
        }
      : null

  const [isGenerating, setIsGenerating] = useState(false)
  const { apiKey, ready } = useOpenAIKey()

    async function handleGenerateStory() {
      setIsGenerating(true)

      try {
        if (!ready) return

        if ((mode === "llm" || mode === "faker_llm") && !apiKey) {
          alert("OpenAI API key を入力してください")
          return
        }

        if (!selectedTheme || !selectedSituation || !selectedVoice || !selectedCharacter) {
          return
        }

    // Faker Mode3 用 snapshot
    const snapshot = {
      characterId: selectedCharacter,
      themeId: selectedTheme.id,
      situationId: selectedSituation,
      voiceId: selectedVoice,
    }

    // LLM 実行（apiKey を明示的に渡す）
    const result = await runWithFakerMode3(snapshot, apiKey!)

    setGeneratedStory(result.text)
    setResultMetrics(result.metrics)
    } catch (err) {
      console.error(err)
      alert("Story generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
    <GeneratingOverlay visible={isGenerating} />

      {/* 背景（固定） */}
      <div className="bg" />

      {/* 画面中央レイヤー */}
      <div className="content">
        <main className="glass">
          <h1><p>1001:ショートショート歪曲生成装置</p></h1>

          {/* OpenAI API Key */}
          <section style={{ marginBottom: 30 }}>
            <h2>OpenAI API 設定</h2>

            <div
              style={{
                display: "grid",
                gap: 24,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  color: "#ffc355ff",
                  background: "#111",
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    この装置の使用には"OpenAI API key"が必要です。
                  </span>
                </div>

                {/* 入力UI */}
                <OpenAIKeyInput />

                <div
                  style={{
                    fontSize: 11,
                    lineHeight: 1.6,
                    marginTop: 12,
                    color: "#ffc355ff",
                  }}
                >
                  <p>• この装置はあなた自身の OpenAI API key を使用します。</p>
                  <p>• API key はこのブラウザ内にのみ保存され、外部には送信されません。</p>
                  <p>
                    • API key の取得はこちら：
                    {" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#ffd27d",
                        textDecoration: "underline",
                        fontWeight: 500,
                      }}
                    >
                      OpenAI API Keys
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* Mode */}
          <section style={{ marginBottom: 30 }}>
            <h2>モード</h2>

            <div style={{ display: "grid", gap: 24, marginTop: 16 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  color: "#fff",
                  background: mode === "faker_llm" ? "#000000ff" : "#111",
                }}
              >
                <button
                  onClick={() => setMode("faker_llm")}
                  style={{
                    width: "30%",
                    marginBottom: 12,
                    padding: "8px 0",
                    fontWeight: 600,
                    textAlign: "center",
                    color: "#000000ff",
                  }}
                >
                  Faker × LLM
                </button>

                <div style={{ fontSize: 11, lineHeight: 1.6, color: "#ffc355ff" }}>

                  <p>• Fakerが物語構造・制約・歪みを先に確定し、LLMは文章表現のみを担当します。</p>
                  <p>• 物語の意味や構造はLLMに委ねられることはありません。</p>
                  <p>• 興味のある方は、各リアクションマトリクスをご覧ください。</p>
                </div>
              </div>
            </div>
          </section>

          {/* Character */}
          <section>
            <h2>キャラクター</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {characters.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCharacter(c.id)
                    setSelectedTheme(null)
                    setSelectedSituation(null)
                    setSelectedVoice(null)
                    setGeneratedStory("")
                    setResultMetrics(null)
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    background: c.id === selectedCharacter ? "#6c0202ff" : "#222",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </section>

          {/* Theme */}
          <section style={{ marginTop: 32, opacity: selectedCharacter ? 1 : 0.4 }}>
            <h2>テーマ</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTheme(t)
                    setSelectedSituation(null)
                    setSelectedVoice(null)
                    setGeneratedStory("")
                    setResultMetrics(null)
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    background: t.id === selectedTheme?.id ? "#6c0202ff" : "#222",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {selectedTheme && (
              <ReferencePanel title="Character × Theme Matrix (Reaction Matrix)">
                <CharacterThemeMatrix />
              </ReferencePanel>
            )}
          </section>

          {/* Situation */}
          <section style={{ marginTop: 32, opacity: selectedCharacter ? 1 : 0.4 }}>
            <h2>シチュエーション</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SITUATION_PRESETS.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSituation(s.id as situationKey)
                    setSelectedVoice(null)
                    setGeneratedStory("")
                    setResultMetrics(null)
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    background: s.id === selectedSituation ? "#6c0202ff" : "#222",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {selectedSituation && (
              <ReferencePanel title="Reaction × Situation Structure">
                <ReactionSituationMatrix />
              </ReferencePanel>
            )}
          </section>

          {/* Voice */}
          <section style={{ marginTop: 32, opacity: selectedCharacter ? 1 : 0.4 }}>
            <h2>文体・語り口</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {voices.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVoice(v.id as voiceKey)
                    setGeneratedStory("")
                    setResultMetrics(null)
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    background: v.id === selectedVoice ? "#6c0202ff" : "#222",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <ReferencePanel title="Situation × NarrativeVoice Matrix（参考）">
              <AffinityMatrix
                map={affinityMap}
                selectedSituation={selectedSituation}
                selectedVoice={selectedVoice}
                situationLabelMap={situationLabelMap}
                voiceLabelMap={voiceLabelMap}
              />
            </ReferencePanel>
          </section>

          {/* Generate */}
          {selectedTheme && selectedSituation && selectedVoice && selectedCharacter && (
            <section style={{ marginTop: 32 }}>
              <button
                onClick={handleGenerateStory}
                style={{
                  padding: "12px 24px",
                  background: "#0a0909ff",
                  color: "#ffc355ff",
                  borderRadius: 20,
                  fontSize: 16,
                  fontWeight: 1800,
                  border: "1px solid #0a0909ff",
                  fontFamily: "Georgia",
                }}
              >
                物語を生成する
              </button>
            </section>
          )}

          {isGenerating && (
            <div className="generating-overlay">
              <div className="carousel" />
            </div>
          )}

          {/* Result */}
          {generatedStory && (
            <section style={{ marginTop: 32 }}>
              <h2>生成された物語</h2>
              <pre style={{ whiteSpace: "pre-wrap" }}>{generatedStory}</pre>

              {resultMetrics && <MetricsPanel metrics={resultMetrics} />}
            </section>
          )}
        </main>
      </div>
    </>
  )
}
