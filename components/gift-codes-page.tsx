'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Gift,
  Loader2,
  Copy,
  Check,
  Plus,
  Wallet
} from 'lucide-react'

interface GiftCodesPageProps {
  onBack: () => void
}

export function GiftCodesPage({ onBack }: GiftCodesPageProps) {
  const { user, createGiftCode } = useWallet()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error('Minimum amount is ₹1')
      return
    }

    if (user && amountNum > user.balance) {
      toast.error('Insufficient balance')
      return
    }

    setIsLoading(true)
    const result = await createGiftCode(amountNum)
    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      setGeneratedCode(result.code!)
      setAmount('')
    } else {
      toast.error(result.message)
    }
  }

  const handleCopy = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      toast.success('Code copied!')
      setTimeout(() => setCopied(false), 2000)
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
        <h1 className="text-xl font-bold text-foreground">VIP GIFT CODES</h1>
      </div>

      {/* Balance */}
      <div className="bg-card border border-primary/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Balance</span>
        </div>
        <span className="text-xl font-bold text-primary">₹{user?.balance.toFixed(2)}</span>
      </div>

      {/* Create Code Form */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Create Gift Code
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Deduct balance to make a code</p>
        
        <form onSubmit={handleCreateCode} className="space-y-4">
          <Input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-secondary border-border text-foreground"
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Generated Code */}
      {generatedCode && (
        <div className="bg-card border border-success rounded-2xl p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Share this Code:</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-secondary rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-success tracking-widest font-mono">{generatedCode}</p>
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="border-success text-success"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      )}

      {/* My Created Codes */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">MY CREATED CODES</h3>
        
        {user?.createdCodes && user.createdCodes.length > 0 ? (
          <div className="space-y-3">
            {user.createdCodes.map((code, index) => (
              <div 
                key={index}
                className={`bg-secondary rounded-xl p-4 flex items-center justify-between ${
                  code.isUsed ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <p className="font-mono text-primary font-semibold">{code.code}</p>
                  <p className="text-xs text-muted-foreground">₹{code.amount}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  code.isUsed 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-success/20 text-success'
                }`}>
                  {code.isUsed ? 'Used' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No codes created yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
