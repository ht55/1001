// src/components/voice/VoiceCard.tsx
import React from 'react'
import type { Voice } from '@/types/voice'
import styles from '@/components/common/styles/Card.module.css'

type Props = {
  title: string
  voices: Voice[]
  onSelect: (voice: Voice) => void
}

export function VoiceCard({ title, voices, onSelect }: Props) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      {voices.map(v => (
        <button
          key={v.id}
          onClick={() => onSelect(v)}
          className={styles.button}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
