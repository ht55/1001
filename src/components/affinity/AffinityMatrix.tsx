// src/components/affinity/AffinityMatrix.tsx

import React from 'react'
import type { VoiceKey } from "@/types/voiceKeys"
import type { SituationKey } from "@/types/situationKeys"
import type { AffinityMap } from "@/affinities/affinityMap"

import strongIcon from '@/affinities/icons/strong.png'
import neutralIcon from '@/affinities/icons/neutral.png'
import mismatchIcon from '@/affinities/icons/mismatch.png'

type Props = {
  map: AffinityMap
  selectedSituation?: SituationKey | null
  selectedVoice?: VoiceKey | null
  situationLabelMap: Record<string, string>
  voiceLabelMap: Record<string, string>
}

const ICON_MAP = {
  '◎': strongIcon.src,
  '◯': neutralIcon.src,
  '△': mismatchIcon.src,
}

const VOICE_FIRST: VoiceKey = 'neutral'
const VOICE_LAST: VoiceKey = 'osaka_obahan'

const sortVoices = (voices: VoiceKey[]) => {
  const core = voices.filter(v => v !== VOICE_FIRST && v !== VOICE_LAST)
  return [
    ...(voices.includes(VOICE_FIRST) ? [VOICE_FIRST] : []),
    ...core,
    ...(voices.includes(VOICE_LAST) ? [VOICE_LAST] : []),
  ]
}

export default function AffinityMatrix({
  map,
  selectedSituation,
  selectedVoice,
  situationLabelMap,
  voiceLabelMap,
}: Props) {
  const situations = Object.keys(map) as SituationKey[]
  if (situations.length === 0) return null

  const voices = sortVoices(
    Object.keys(map[situations[0]] ?? {}) as VoiceKey[]
  )

  return (
    <div>
    <div style={{ fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: 'bold'}}>
      <img src={strongIcon.src} alt="strong" style={{ width: 14, verticalAlign: 'middle' }} /> = 好相性で王道
      <img src={neutralIcon.src} alt="neutral" style={{ width: 14, verticalAlign: 'middle' }} /> = 自然な物語が成立
      <img src={mismatchIcon.src} alt="mismatch" style={{ width: 14, verticalAlign: 'middle' }} /> = ズレを楽しむ
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `120px repeat(${voices.length}, 1fr)`,
        gap: 2,
      }}
    >
      <div />
      {voices.map(v => (
        <div
          key={`h-${v}`}
          style={{ fontSize: 11, textAlign: 'center', opacity: 0.7 }}
        >
          {voiceLabelMap[v] ?? v}
        </div>
      ))}

      {situations.map(situation => (
        <React.Fragment key={situation}>
          <div
            style={{
              fontSize: 11,
              opacity: 0.7,
              whiteSpace: 'nowrap',
            }}
          >
            {situationLabelMap[situation] ?? situation}
          </div>

          {voices.map(voice => {
            const cell = map[situation]?.[voice]
            if (!cell) {
              return (
                <div
                  key={`${situation}-${voice}`}
                  style={{ height: 28 }}
                />
              )
            }

            return (
              <div
                key={`${situation}-${voice}`}
                title={cell.comment}
                style={{
                  border: '1px solid #333',
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  background:
                    situation === selectedSituation ||
                    voice === selectedVoice
                      ? 'rgba(0,0,0,0.05)'
                      : 'transparent',
                }}
              >
                <img
                  src={ICON_MAP[cell.level]}
                  alt={cell.level}
                  style={{ width: 14, height: 14 }}
                />
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
    </div>
  )
}
