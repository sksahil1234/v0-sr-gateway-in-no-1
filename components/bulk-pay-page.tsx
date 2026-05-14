'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Loader2,
  Wallet,
  Layers,
  Send
} from 'lucide-react'

interface BulkPayPageProps {
  onBack: () => void
}

export function BulkPayPage({ onBack }: BulkPayPageProps) {
  const { user, updateBalance, addTransaction } = useWallet()
  const [mobileNumbers, setMobileNumbers] = useState('')
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')

  const getValidNumbers = () => {
    return mobileNumbers
      .split('\n')
      .map(num => num.trim().replace(/\D/g, ''))
      .filter(num => num.length === 10)
  }

  const totalAmount = () => {
    const nums = getValidNumbers()
    const amt = parseFloat(amount) || 0
    return nums.length * amt
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numbers = getValidNumbers()
    if (numbers.length === 0) {
      toast.error('Please enter at least one valid mobile number')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error('Minimum amount is ₹1')
      return
    }

    const total = totalAmount()
    if (user && total > user.balance) {
      toast.error('Insufficient balance')
      return
    }

    setShowPinModal(true)
  }

  const handlePinSubmit = async () => {
    if (pin !== user?.pin) {
      toast.error('Invalid PIN')
      return
    }

    setIsLoading(true)
    setShowPinModal(false)
    
    const numbers = getValidNumbers()
    const amountNum = parseFloat(amount)
    const total = totalAmount()
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    updateBalance(-total)
    
    numbers.forEach(num => {
      addTransaction({
        type: 'transfer_out',
        amount: amountNum,
        to: num,
        comment: comment || 'Bulk Payment',
        status: 'success'
      })
    })
    
    setIsLoading(false)
    toast.success(`₹${amountNum} sent to ${numbers.length} recipients!`)
    setMobileNumbers('')
    setAmount('')
    setComment('')
    setPin('')
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit)
    }
  }

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-foreground text-center mb-4">Security PIN</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">Verify your transaction</p>
            
            {/* PIN Display */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
                    pin.length > i ? 'border-primary bg-primary/20' : 'border-border'
                  }`}
                >
                  {pin.length > i && <span className="text-2xl text-primary">*</span>}
                </div>
              ))}
            </div>

            {/* PIN Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((digit, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={`h-14 text-xl font-semibold ${digit === '' ? 'invisible' : ''} ${
                    digit === '⌫' ? 'text-destructive' : 'text-foreground'
                  }`}
                  onClick={() => {
                    if (digit === '⌫') handlePinBackspace()
                    else if (digit) handlePinInput(digit)
                  }}
                >
                  {digit}
                </Button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPinModal(false)
                  setPin('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePinSubmit}
                disabled={pin.length !== 4}
                className="flex-1 bg-primary text-primary-foreground"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

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
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" />
          BULK SEND
        </h1>
      </div>

      {/* Balance Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">BALANCE</span>
        </div>
        <span className="text-xl font-bold text-primary">₹{user?.balance.toFixed(2)}</span>
      </div>

      {/* Bulk Send Form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm text-muted-foreground mb-4">RECIPIENTS</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              MOBILE NUMBERS (EK PER LINE)
            </label>
            <Textarea
              placeholder={`9876543210\n9123456789\n9999999999`}
              value={mobileNumbers}
              onChange={(e) => setMobileNumbers(e.target.value)}
              className="bg-secondary border-border text-foreground min-h-[120px] font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Valid numbers: {getValidNumbers().length}
            </p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              AMOUNT (₹) — SABKO SAME
            </label>
            <Input
              type="number"
              placeholder="Enter amount per person"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              COMMENT (OPTIONAL)
            </label>
            <Input
              type="text"
              placeholder="Add a note"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          {/* Summary */}
          {getValidNumbers().length > 0 && amount && (
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Recipients</span>
                <span className="text-foreground font-semibold">{getValidNumbers().length}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Amount Each</span>
                <span className="text-foreground font-semibold">₹{parseFloat(amount) || 0}</span>
              </div>
              <hr className="border-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Total</span>
                <span className="text-primary font-bold text-lg">₹{totalAmount()}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending to all...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                SEND TO ALL
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
