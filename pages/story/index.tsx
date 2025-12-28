// src/pages/story/index.tsx

import { useEffect, useState } from "react";

import { characters } from "@/data/characters"
import { themes } from "@/themes"
import { voices } from "@/voices"

import type { Theme } from "@/types/theme"
import type { VoiceKey } from "@/types/voiceKeys"
import type { SituationKey } from "@/types/situationKeys"
import { AffinitySymbol } from "@/types/affinity"

import { VoiceCard } from "@/components/voice/VoiceCard"
import AffinityMatrix from "@/components/affinity/AffinityMatrix"
import { CharacterThemeMatrix } from "@/components/reaction/CharacterThemeMatrix"
import ReactionSituationMatrix from "@/components/reaction/ReactionSituationMatrix"
import { ReferencePanel } from "@/components/common/ReferencePanel"
import { PlannedMetricsPanel } from "@/components/metrics/PlannedMetricsPanel"
import { MetricsPanel } from "@/components/metrics/MetricsPanel"

import { affinityMap } from "@/affinities/affinityMap"
import { SITUATION_PRESETS } from "@/data/situationPresets"
import { situationLabelMap } from "@/utils/situationLabelMap"
import { voiceLabelMap } from "@/utils/voiceLabelMap"

import { getReactionProfile } from "@/lib/getReactionProfile"
import { mapSituationToWorldModifiers } from "@/lib/mapSituationToWorldModifiers"
import { mapSituationToRequiredFunctions } from "@/lib/mapSituationToRequiredFunctions"

import type { StoryMetrics } from "@/lib/collectMetrics"

export default function StoryPage() {
 const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
 const [selectedSituation, setSelectedSituation] = useState<SituationKey | null>(null)
 const [selectedVoice, setSelectedVoice] = useState<VoiceKey | null>(null)
 const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)

 const [generatedStory, setGeneratedStory] = useState("")
 const [resultMetrics, setResultMetrics] = useState<StoryMetrics | null>(null)

 const [mode, setMode] = useState<"faker" | "llm" | "faker_llm">("faker")
 const [showApiKeyPopup, setShowApiKeyPopup] = useState(false)

 const hasApiKey =
 process.env.NEXT_PUBLIC_HAS_OPENAI_KEY === "true"

 const MODES = [
 { id: "faker", label: "Faker Only", locked: false },
 { id: "llm", label: "LLM Only", locked: !hasApiKey },
 { id: "faker_llm", label: "Faker × LLM", locked: !hasApiKey },
 ] as const

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

   async function handleGenerateStory() {
    if ((mode === "faker_llm" || mode === "llm") && !hasApiKey) {
      alert("This mode requires an API key")
      return
    }

    if (!selectedTheme || !selectedSituation || !selectedVoice || !selectedCharacter) {
      return
    }

    const res = await fetch("/api/mode3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId: selectedCharacter,
        themeId: selectedTheme.id,
        situationId: selectedSituation,
        voiceId: selectedVoice,
      }),
    })

    const json = await res.json()

    if (!res.ok || !json.ok) {
      alert(json.error ?? "Mode3 generation failed")
      return
    }

    setGeneratedStory(json.text)
    setResultMetrics(null)
  }

 function showApiKeyHelp() {
   alert(
     "このモードを使うには OpenAI API key が必要です。\n\n" +
     "1. OpenAIでAPI keyを取得\n" +
     "2. .env.local に OPENAI_API_KEY を設定\n" +
     "3. NEXT_PUBLIC_HAS_OPENAI_KEY=true を設定\n" +
     "4. 開発サーバーを再起動"
   )
 }

  return (
    <>
      {/* 背景（固定） */}
      <div className="bg" />

      {/* 画面中央レイヤー */}
      <div className="content">
        {/* すりガラスウィンドウ */}
        <main className="glass">
          <h1><p>1001:ショートショート歪曲生成装置</p></h1>

          {/* Mode */}
          <section style={{ marginBottom: 30 }}>
            <h2>モード</h2>

            <div
              style={{
                display: "grid",
                gap: 24,
                marginTop: 16,
              }}
            >
              {/* Mode3 */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  color: "#fff",
                  background: mode === "faker_llm" ? "#000000ff" : "#111",
                  opacity: hasApiKey ? 1 : 0.8,
                }}
              >
                <button
                  onClick={() => {
                    if (hasApiKey) setMode("faker_llm")
                    else setShowApiKeyPopup(true)
                  }}
                  style={{
                    width: "30%",
                    marginBottom: 12,
                    padding: "8px 0",
                    fontWeight: 600,
                    textAlign: "center",
                    color: "#000000ff",
                  }}
                >
                  Faker × LLM {hasApiKey ? "" : "🔒"}
                </button>

                <div style={{ 
                  fontSize: 11, 
                  lineHeight: 1.6, 
                  opacity: 1.0, 
                  color: '#ffc355ff'}}>
                  <strong>API key 必須</strong>
                  <p>• Fakerが物語構造・制約・歪みを先に確定し、LLMは文章表現のみを担当します。</p>
                  <p> • 物語の意味や構造はLLMに委ねられることはありません。</p>
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
                    setSelectedSituation(s.id as SituationKey)
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
                    setSelectedVoice(v.id as VoiceKey)
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
                  color: '#ffc355ff',
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
  )}
