'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Wallet,
  QrCode,
  Shield
} from 'lucide-react'

interface AddFundPageProps {
  onBack: () => void
}

export function AddFundPage({ onBack }: AddFundPageProps) {
  const { user } = useWallet()
  const [utr, setUtr] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const upiId = 'srgateway@upi'

  const handleCopyUpi = async () => {
    await navigator.clipboard.writeText(upiId)
    setCopied(true)
    toast.success('UPI ID copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!utr || !amount) {
      toast.error('Please fill all fields')
      return
    }

    if (utr.length !== 12) {
      toast.error('UTR must be 12 digits')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 10) {
      toast.error('Minimum amount is ₹10')
      return
    }

    if (!user?.id) {
      toast.error('Please login again before submitting a deposit')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit', userId: user.id, amount: amountNum, utr }),
      })
      const data = await response.json()
      if (!data.success) {
        toast.error(data.error || 'Could not submit deposit')
        return
      }
      toast.success('Deposit submitted. Balance will update after admin approval.')
      setUtr('')
      setAmount('')
    } catch (error) {
      console.error('[v0] Deposit request failed', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
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
        <h1 className="text-xl font-bold text-foreground">Add VIP Fund</h1>
      </div>

      {/* UPI Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">Pay to Official UPI</p>
          <QrCode className="w-6 h-6 text-primary" />
        </div>

        <div className="bg-secondary rounded-xl p-4 mb-4">
          <p className="text-2xl font-bold text-primary text-center">{upiId}</p>
        </div>

        <Button
          onClick={handleCopyUpi}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              Copy UPI ID
            </>
          )}
        </Button>
      </div>

      {/* How it Works */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">How it works</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">UPI se Pay karo</p>
              <p className="text-sm text-muted-foreground">Upar diye UPI ID pe payment karo</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">UTR Number note karo</p>
              <p className="text-sm text-muted-foreground">Payment ke baad 12 digit UTR milega</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">Neeche submit karo</p>
              <p className="text-sm text-muted-foreground">UTR aur amount fill karke submit karo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Submit Details</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">UTR / Transaction No.</label>
            <Input
              type="text"
              placeholder="Enter 12 digit UTR"
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Amount Paid (₹)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Submit For Verification
              </>
            )}
          </Button>
        </form>

        <div className="flex items-start gap-2 mt-4 p-3 bg-destructive/10 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive">
            Exact UTR number daalo - galat UTR pe balance add nahi hoga!
          </p>
        </div>
      </div>

      {/* Current Balance */}
      <div className="mt-6 bg-card border border-primary/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Current Balance</span>
        </div>
        <span className="text-xl font-bold text-primary">₹{user?.balance.toFixed(2)}</span>
      </div>
    </div>
  )
}
