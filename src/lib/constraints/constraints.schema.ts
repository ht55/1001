// src/lib/constraints/constraints.schema.ts

export type ReactionProfileType =
  | "resonance"
  | "tension"
  | "distortion"
  | "collapse"
  | "void"
  | "transcendence"

export type TransitionVerb =
  | "amplify"
  | "stabilize"
  | "destabilize"
  | "fix"
  | "collapse"
  | "invert"

export type SenseType =
  | "vision"
  | "hearing"
  | "smell"
  | "touch"
  | "sixth"

export type ExpressionEntry =
  | {
      kind: "sense"
      sense: SenseType
    }
  | {
      kind: "prop"
      prop: string
    }

export interface StoryConstraints {
  meta: {
    mode: string,
    language: "ja" | "en"
    axisLock: true
  }

  core: {
    character: string
    theme: string
    situation: string
    voice: string
  }

  phase1: {
    reactionProfile: ReactionProfileType
    magnitude: number // 1–5（内部）
  }

  phase2: {
    transition: TransitionVerb
  }

  expression: {
    entry: ExpressionEntry
    axisLockTarget: "world_attribute" | "entity" | "self"
  }

  semantics?: {
    characterSense?: string[]
  }

  template: {
    sections: string[]
    rules: {
      oneEntryOnly: true
      noAbstractTerms: true
      noResolution: true
      noMoral: true
    }
    length: {
      min: number
      max: number
    }
  }
}
