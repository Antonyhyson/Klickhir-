"use client"

import { useEffect, useState } from "react"

export function SandFlow() {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      size: number
      delay: number
      duration: number
      startY: number
      color: string
      behavior: "straight" | "deflect-up" | "deflect-down" | "curve-around" | "scatter"
    }>
  >([])

  useEffect(() => {
    const particleArray = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      size: Math.random() < 0.3 ? 1 : Math.random() < 0.7 ? 2.5 : 3,
      delay: Math.random() * 20,
      duration: 10 + Math.random() * 8,
      startY: Math.random() * 100,
      color: Math.random() < 0.4 ? "#d4af37" : Math.random() < 0.7 ? "#daa520" : "#b8860b",
      behavior:
        Math.random() < 0.3
          ? "straight"
          : Math.random() < 0.5
            ? "deflect-up"
            : Math.random() < 0.7
              ? "deflect-down"
              : Math.random() < 0.9
                ? "curve-around"
                : "scatter",
    }))
    setParticles(particleArray)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-1 h-1 rounded-full sand-particle sand-${particle.behavior}`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            top: `${particle.startY}%`,
            left: "-10px",
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            opacity: 0.7 + Math.random() * 0.3,
          }}
        />
      ))}
    </div>
  )
}
