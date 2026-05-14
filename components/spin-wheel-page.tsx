'use client'

import { useState, useRef } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  RotateCw,
  Play,
  Sparkles
} from 'lucide-react'

interface SpinWheelPageProps {
  onBack: () => void
}

const WHEEL_SEGMENTS = [
  { label: '₹1', value: 1, color: '#1e293b' },
  { label: '₹5', value: 5, color: '#334155' },
  { label: '₹2', value: 2, color: '#1e293b' },
  { label: '₹10', value: 10, color: '#334155' },
  { label: '₹3', value: 3, color: '#1e293b' },
  { label: '₹50', value: 50, color: '#334155' },
  { label: '₹1', value: 1, color: '#1e293b' },
  { label: 'Jackpot', value: 100, color: '#eab308' },
]

export function SpinWheelPage({ onBack }: SpinWheelPageProps) {
  const { updateBalance, addTransaction } = useWallet()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<{ label: string; value: number } | null>(null)
  const [canSpin, setCanSpin] = useState(true)
  const wheelRef = useRef<HTMLDivElement>(null)

  const handleSpin = () => {
    if (isSpinning || !canSpin) return

    setIsSpinning(true)
    setResult(null)

    // Random number of full rotations (5-10) plus random segment
    const fullRotations = 5 + Math.floor(Math.random() * 5)
    const segmentAngle = 360 / WHEEL_SEGMENTS.length
    const randomSegment = Math.floor(Math.random() * WHEEL_SEGMENTS.length)
    const extraRotation = randomSegment * segmentAngle + segmentAngle / 2
    const totalRotation = rotation + (fullRotations * 360) + extraRotation

    setRotation(totalRotation)

    // Calculate result after animation
    setTimeout(() => {
      const winningSegment = WHEEL_SEGMENTS[WHEEL_SEGMENTS.length - 1 - randomSegment]
      setResult(winningSegment)
      setIsSpinning(false)
      setCanSpin(false)

      if (winningSegment.value > 0) {
        updateBalance(winningSegment.value)
        addTransaction({
          type: 'credit',
          amount: winningSegment.value,
          comment: `Spin Wheel Win: ${winningSegment.label}`,
          status: 'success'
        })
        toast.success(`You won ${winningSegment.label}!`)
      }

      // Reset spin availability after 1 hour (demo: 10 seconds)
      setTimeout(() => setCanSpin(true), 10000)
    }, 4000)
  }

  const segmentAngle = 360 / WHEEL_SEGMENTS.length

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="text-primary"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Wheel of Fortune</h1>
      </div>

      {/* Description */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-center">
        <p className="text-muted-foreground">Watch an Ad to spin and win cash!</p>
      </div>

      {/* Wheel Container */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Wheel */}
        <div className="relative w-72 h-72">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
          </div>

          {/* Wheel */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full border-4 border-primary shadow-lg overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {WHEEL_SEGMENTS.map((segment, i) => {
                const startAngle = i * segmentAngle - 90
                const endAngle = startAngle + segmentAngle
                const startRad = (startAngle * Math.PI) / 180
                const endRad = (endAngle * Math.PI) / 180
                const x1 = 50 + 50 * Math.cos(startRad)
                const y1 = 50 + 50 * Math.sin(startRad)
                const x2 = 50 + 50 * Math.cos(endRad)
                const y2 = 50 + 50 * Math.sin(endRad)
                const largeArc = segmentAngle > 180 ? 1 : 0

                const midAngle = startAngle + segmentAngle / 2
                const midRad = (midAngle * Math.PI) / 180
                const textX = 50 + 32 * Math.cos(midRad)
                const textY = 50 + 32 * Math.sin(midRad)

                return (
                  <g key={i}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="#0f172a"
                      strokeWidth="0.5"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill={segment.label === 'Jackpot' ? '#0f172a' : '#eab308'}
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {segment.label}
                    </text>
                  </g>
                )
              })}
              {/* Center circle */}
              <circle cx="50" cy="50" r="8" fill="#0f172a" stroke="#eab308" strokeWidth="2" />
              <text x="50" y="50" fill="#eab308" fontSize="4" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                SR
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-card border border-primary rounded-2xl p-6 mb-6 text-center gold-glow">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-muted-foreground mb-1">You Won</p>
          <p className="text-3xl font-bold text-primary">{result.label}</p>
        </div>
      )}

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || !canSpin}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
      >
        {isSpinning ? (
          <>
            <RotateCw className="w-6 h-6 mr-2 animate-spin" />
            Spinning...
          </>
        ) : !canSpin ? (
          <>
            <Play className="w-6 h-6 mr-2" />
            Wait for next spin...
          </>
        ) : (
          <>
            <Play className="w-6 h-6 mr-2" />
            WATCH AD & SPIN
          </>
        )}
      </Button>
    </div>
  )
}
