// src/components/common/ReferencePanel.tsx

import { useState, ReactNode } from "react"

type Props = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function ReferencePanel({
  title,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: '#f8d300ff',
          fontSize: 15.5,
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
        }}
      >
        {open ? "▼" : "▶"} {title}
      </button>

      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  )
}
