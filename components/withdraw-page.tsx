'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Loader2,
  Wallet,
  Clock,
  Shield,
  IndianRupee,
  ArrowDownToLine
} from 'lucide-react'

interface WithdrawPageProps {
  onBack: () => void
}

export function WithdrawPage({ onBack }: WithdrawPageProps) {
  const { user, addWithdrawal } = useWallet()
  const [upiId, setUpiId] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!upiId || !amount) {
      toast.error('Please fill all fields')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 10) {
      toast.error('Minimum withdrawal is ₹10')
      return
    }

    if (user && amountNum > user.balance) {
      toast.error('Insufficient balance')
      return
    }

    if (!upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID')
      return
    }

    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    addWithdrawal({
      amount: amountNum,
      upiId
    })
    
    setIsLoading(false)
    toast.success('Withdrawal request submitted!')
    setUpiId('')
    setAmount('')
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
        <h1 className="text-xl font-bold text-foreground">Withdraw Funds</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 gold-glow">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Available Balance</span>
        </div>
        <h2 className="text-3xl font-bold text-primary">₹{user?.balance.toFixed(2)}</h2>
      </div>

      {/* Withdraw Form */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Transfer To (UPI ID)</label>
            <Input
              type="text"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Withdraw Amount (₹)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <IndianRupee className="w-5 h-5 text-muted-foreground" />
              </div>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary border-border text-foreground pl-10"
              />
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Minimum Withdraw</p>
              <p className="text-sm font-semibold text-foreground">₹10</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Processing Time</p>
              <p className="text-sm font-semibold text-foreground">Within 24 Hrs</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Transfer Fee</p>
              <p className="text-sm font-semibold text-success">₹0 (Free)</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-5 h-5 mr-2" />
                WITHDRAW YOUR FUND
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Security Notice */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Aapki withdraw request secure hai. Admin ise check karke 24 ghante ke andar process kar denge.
          </p>
        </div>
      </div>

      {/* Pending Withdrawals */}
      {user && user.withdrawals.filter(w => w.status === 'pending').length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Pending Withdrawals
          </h3>
          <div className="space-y-3">
            {user.withdrawals
              .filter(w => w.status === 'pending')
              .map((withdrawal) => (
                <div 
                  key={withdrawal.id}
                  className="bg-secondary rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-foreground font-semibold">₹{withdrawal.amount}</p>
                    <p className="text-xs text-muted-foreground">{withdrawal.upiId}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                    Pending
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
