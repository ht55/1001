// src/components/OpenAIKeyInput.tsx
"use client"

import { useState } from "react"
import { useOpenAIKey } from "@/hooks/useOpenAIKey"

export function OpenAIKeyInput() {
  const { apiKey, saveKey, clearKey } = useOpenAIKey()
  const [input, setInput] = useState("")
  const [error, setError] = useState("")

  const handleSave = () => {
    if (!input.startsWith("sk-")) {
      setError("OpenAI API key の形式が正しくありません")
      return
    }
    saveKey(input.trim())
    setInput("")
    setError("")
  }

    if (apiKey) {
    return (
        <div
        style={{
            border: "3px solid #444444ff",     
            borderRadius: 12,             
            padding: 12,
            background: "#0f0f0f",
        }}
        >
        <div
            style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            }}
        >
            {/* チェックアイコン */}
            <span
            style={{
                color: "#6fbf73",         
                fontSize: 14,
            }}
            >
            ✓
            </span>

            <span
            style={{
                fontSize: 12,             
                color: "#e6e6e6",
            }}
            >
            OpenAI API key はこのブラウザに保存されています
            </span>
        </div>

        <button
            onClick={clearKey}
            style={{
            marginTop: 10,
            fontSize: 11,
            color: "#ccc",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            }}
        >
            API key を削除
        </button>
        </div>
    )
    }}
