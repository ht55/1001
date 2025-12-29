// src/components/situation/SituationSelector.tsx

import { SITUATION_PRESETS } from "@/data/situationPresets";
import {
  situationCategories,
  situation_category_order,
} from "@/components/situation/situationCategories";
import { situation_category_map } from "@/components/situation/situationCategoryMap";

type Props = {
  onSelect: (situationId: string) => void;
  selectedId?: string;
};

export function SituationSelector({ onSelect, selectedId }: Props) {
  const grouped = SITUATION_PRESETS.reduce((acc, preset) => {
    const categoryId = situation_category_map[preset.id];
    if (!categoryId) return acc;

    acc[categoryId] ??= [];
    acc[categoryId].push(preset);
    return acc;
  }, {} as Record<string, typeof SITUATION_PRESETS>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {situation_category_order.map((categoryId) => {
        const category = situationCategories[categoryId];
        const items = grouped[categoryId] ?? [];

        if (items.length === 0) return null;

        return (
          <section key={categoryId}>
            <h2>{category.label}</h2>
            {category.description && (
              <p style={{ opacity: 0.6, marginBottom: 12 }}>
                {category.description}
              </p>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 14,
                    background:
                      selectedId === s.id ? "#333" : "#222",
                    border:
                      selectedId === s.id
                        ? "1px solid #666"
                        : "1px solid #333",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{s.label}</div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginTop: 4,
                    }}
                  >
                    {s.notes}
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
