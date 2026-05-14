'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Ticket,
  Loader2,
  Gift,
  Sparkles
} from 'lucide-react'

interface ClaimCodePageProps {
  onBack: () => void
}

export function ClaimCodePage({ onBack }: ClaimCodePageProps) {
  const { redeemCode } = useWallet()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastReward, setLastReward] = useState<{ amount: number } | null>(null)

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      toast.error('Please enter a code')
      return
    }

    setIsLoading(true)
    const result = await redeemCode(code)
    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      setLastReward({ amount: result.amount! })
      setCode('')
    } else {
      toast.error(result.message)
    }
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
        <h1 className="text-xl font-bold text-foreground">Claim Code</h1>
      </div>

      {/* Hero */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 text-center gold-glow">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Redeem Gift Code</h2>
        <p className="text-muted-foreground">Enter your code below to claim rewards</p>
      </div>

      {/* Claim Form */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Redeem Code
        </h3>
        
        <form onSubmit={handleClaim} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter gift code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="bg-secondary border-border text-foreground text-center text-lg tracking-widest uppercase"
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Claim Reward
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Last Reward */}
      {lastReward && (
        <div className="bg-card border border-success rounded-2xl p-6 text-center">
          <Sparkles className="w-10 h-10 text-success mx-auto mb-2" />
          <p className="text-muted-foreground mb-1">You Received</p>
          <p className="text-3xl font-bold text-success">₹{lastReward.amount}</p>
        </div>
      )}

      {/* Available Codes Hint */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Try: <span className="text-primary font-mono">WELCOME100</span> or <span className="text-primary font-mono">BONUS50</span>
        </p>
      </div>
    </div>
  )
}
