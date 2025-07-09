"use client"

export function GlitterBackground() {
  return (
    <div className="gradient-bg fixed inset-0 -z-10">
      {/* Generate multiple glitter elements */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="glitter" />
      ))}
    </div>
  )
}

export function SandstormBackground() {
  const sandParticles = Array.from({ length: 180 }, (_, i) => {
    const sizes = ["fine", "medium", "coarse", "", ""]
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)]
    return <div key={i} className={`sand-particle ${randomSize}`} />
  })

  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{sandParticles}</div>
}
