// src/components/situation/situationCategories.ts

export const situation_category_order = [
  "crowded",
  "nature",
  "closed",
  "boundary",
  "daily_shift",
  "outsider",
] as const;

export type SituationCategoryID =
  typeof situation_category_order[number];

export const situationCategories: Record<
  SituationCategoryID,
  { label: string; description?: string }
> = {
  crowded: {
    label: "人の集まる場所",
    description: "人の存在が世界を歪ませる",
  },
  nature: {
    label: "自然・外界",
    description: "人間の理解や管理が及ばない領域",
  },
  closed: {
    label: "閉じた空間・構造物",
    description: "内側で時間や意味が停滞",
  },
  boundary: {
    label: "境界・異界",
    description: "狭間にいるのか別世界か",
  },
  daily_shift: {
    label: "日常の歪み",
    description: "見慣れた風景が少しだけ信用できない",
  },
  outsider: {
    label: "枠外・異端",
    description: "概念外",
  },
};
