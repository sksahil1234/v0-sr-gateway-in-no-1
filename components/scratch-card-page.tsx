'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Gift,
  Sparkles,
  Check
} from 'lucide-react'

interface ScratchCardPageProps {
  onBack: () => void
}

export function ScratchCardPage({ onBack }: ScratchCardPageProps) {
  const { user, updateBalance, addTransaction } = useWallet()
  const [scratchedCards, setScratchedCards] = useState<Set<string>>(new Set())
  const [scratchProgress, setScratchProgress] = useState<Record<string, number>>({})

  const totalWinnings = user?.scratchCards
    .filter(card => card.isScratched || scratchedCards.has(card.id))
    .reduce((sum, card) => sum + card.amount, 0) || 0

  const handleScratch = (cardId: string, amount: number) => {
    if (scratchedCards.has(cardId)) return

    // Simulate scratching animation
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setScratchProgress(prev => ({ ...prev, [cardId]: progress }))
      
      if (progress >= 100) {
        clearInterval(interval)
        setScratchedCards(prev => new Set([...prev, cardId]))
        
        updateBalance(amount)
        addTransaction({
          type: 'credit',
          amount: amount,
          comment: 'Scratch Card Reward',
          status: 'success'
        })
        
        toast.success(`You won ₹${amount}!`)
      }
    }, 100)
  }

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
        <h1 className="text-xl font-bold text-foreground">My Rewards</h1>
      </div>

      {/* Total Winnings Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 gold-glow">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Total Winnings</span>
        </div>
        <h2 className="text-4xl font-bold text-primary">₹{totalWinnings.toFixed(2)}</h2>
      </div>

      {/* Scratch Cards */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Available Cards
        </h3>

        {user?.scratchCards && user.scratchCards.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {user.scratchCards.map((card) => {
              const isScratched = card.isScratched || scratchedCards.has(card.id)
              const progress = scratchProgress[card.id] || 0

              return (
                <div
                  key={card.id}
                  className={`relative bg-card border rounded-2xl overflow-hidden ${
                    isScratched ? 'border-success' : 'border-border'
                  }`}
                >
                  {/* Card Content */}
                  <div className="p-6 text-center">
                    {isScratched ? (
                      <>
                        <Check className="w-10 h-10 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold text-success">₹{card.amount}</p>
                        <p className="text-xs text-muted-foreground mt-1">Claimed!</p>
                      </>
                    ) : (
                      <>
                        <Gift className="w-10 h-10 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">Tap to Scratch</p>
                        <Button
                          onClick={() => handleScratch(card.id, card.amount)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={progress > 0 && progress < 100}
                        >
                          {progress > 0 && progress < 100 ? (
                            `${progress}%`
                          ) : (
                            'Scratch Now'
                          )}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Scratch Overlay */}
                  {progress > 0 && progress < 100 && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary transition-all duration-300"
                      style={{ 
                        clipPath: `polygon(0 0, 100% 0, 100% ${100 - progress}%, 0 ${100 - progress}%)` 
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No Cards Available</p>
            <p className="text-xs text-muted-foreground mt-1">Complete tasks to earn scratch cards</p>
          </div>
        )}
      </div>
    </div>
  )
}
