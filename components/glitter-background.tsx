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
