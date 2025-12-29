type Props = {
  visible: boolean
}

export function GeneratingOverlay({ visible }: Props) {
  if (!visible) return null

  return (
    <div className="generating-overlay">
      <div className="carousel" />
    </div>
  )
}
