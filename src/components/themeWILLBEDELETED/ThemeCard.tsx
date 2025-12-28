import React from 'react'
import type { SemanticMotif } from '@/types/theme'
import styles from '@/components/common/styles/Card.module.css' 

type Props = {
  title: string
  motifs: SemanticMotif[]
  onSelect: (motif: SemanticMotif) => void
}

export function ThemeCard({ motifs, onSelect, title }: Props) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      {motifs.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className={styles.button} 
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}