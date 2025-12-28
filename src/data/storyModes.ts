// src/data/storyModes.ts

export type StoryMode = "faker_only" | "llm_only" | "faker_llm"

export const STORY_MODES = [
  {
    id: "faker_only",
    label: "Faker Only",
    description: "完全ローカル・生成装置モード",
    locked: false
  },
  {
    id: "llm_only",
    label: "LLM Only",
    description: "従来型プロンプト生成",
    locked: true
  },
  {
    id: "faker_llm",
    label: "Faker × LLM",
    description: "上位解放モード",
    locked: true
  }
] as const
