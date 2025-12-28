// src/components/affinity/AffinityMap.tsx

import type { VoiceKey } from "@/types/voiceKeys"
import type { SituationKey } from "@/types/situationKeys"
import type { AffinityMap } from "@/affinities/affinityMap"

type Props = {
  situation: SituationKey
  map: AffinityMap
  selectedVoice: VoiceKey | null
}

const ICON_MAP: Record<string, string> = {
  '◎': '/icons/affinity/strong.png',
  '◯': '/icons/affinity/neutral.png',
  '△': '/icons/affinity/mismatch.png',
}

export default function AffinityMap({
  situation,
  map,
  selectedVoice,
}: Props) {
  const data = map[situation]
  if (!data) return null

  const voices = Object.keys(data)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 4,
      }}
    >
      {/* Voice header */}
      {voices.map(voice => (
        <div
          key={`header-${voice}`}
          style={{
            fontSize: 11,
            textAlign: 'center',
            opacity: 0.7,
          }}
        >
          {voice}
        </div>
      ))}

      {/* Affinity cells */}
      {voices.map(voice => {
        const v = data[voice as keyof typeof data]
        return (
          <div
            key={voice}
            title={v.comment}
            style={{
              border: '1px solid #333',
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'background-color 0.15s',
              background:
                voice === selectedVoice
                  ? 'rgba(0,0,0,0.05)'
                  : 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor =
                voice === selectedVoice
                  ? 'rgba(0,0,0,0.05)'
                  : 'transparent'
            }}
          >
            <img
              src={ICON_MAP[v.level]}
              alt={v.level}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )
      })}
    </div>
  )
}
