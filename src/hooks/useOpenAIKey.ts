// src/hooks/useOpenAIKey.ts
"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "openai_api_key"

export function useOpenAIKey() {
  const [apiKey, setApiKey] = useState<string>("")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setApiKey(saved)
    setReady(true)
  }, [])

  const saveKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKey(key)
  }

  const clearKey = () => {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey("")
  }

  // ready を返す
  return { apiKey, saveKey, clearKey, ready }
}

