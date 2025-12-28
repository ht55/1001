import { voices } from '@/voices/voiceList'

export const voiceLabelMap: Record<string, string> =
  Object.fromEntries(
    voices.map(v => [v.id, v.label])
  )

