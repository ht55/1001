const REACTIONS = [
  { key: "resonance", label: "Resonance", color: "220" },      // blue
  { key: "tension", label: "Tension", color: "30" },          // orange
  { key: "distortion", label: "Distortion", color: "270" },   // purple
  { key: "collapse", label: "Collapse", color: "0" },         // red
  { key: "void", label: "Void", color: "0", gray: true },     // gray
  { key: "transcendence", label: "Transcendence", color: "130" } // green
];

export function ReactionLegend() {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
      {REACTIONS.map(r => (
        <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: r.gray
                ? "hsl(0,0%,40%)"
                : `hsl(${r.color},60%,45%)`
            }}
          />
          <span style={{ fontSize: 12 }}>{r.label}</span>
        </div>
      ))}
      <span style={{ fontSize: 12, opacity: 0.7 }}>
        Lv1＝白 ／ Lv5＝最大濃度
      </span>
    </div>
  );
}
