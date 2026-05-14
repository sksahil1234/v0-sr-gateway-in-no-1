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
  Send,
  HelpCircle,
  User
} from 'lucide-react'

interface SendMoneyPageProps {
  onBack: () => void
}

export function SendMoneyPage({ onBack }: SendMoneyPageProps) {
  const { user, updateBalance, addTransaction } = useWallet()
  const [receiverNumber, setReceiverNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!receiverNumber || !amount) {
      toast.error('Please fill required fields')
      return
    }

    if (receiverNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error('Minimum transfer is ₹1')
      return
    }

    if (user && amountNum > user.balance) {
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
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const amountNum = parseFloat(amount)
    
    updateBalance(-amountNum)
    addTransaction({
      type: 'transfer_out',
      amount: amountNum,
      to: receiverNumber,
      comment: comment || 'Money Transfer',
      status: 'success'
    })
    
    setIsLoading(false)
    toast.success(`₹${amountNum} sent to ${receiverNumber}`)
    setReceiverNumber('')
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
        <h1 className="text-xl font-bold text-foreground">Send Money</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Balance</span>
        </div>
        <span className="text-xl font-bold text-primary">₹{user?.balance.toFixed(2)}</span>
      </div>

      {/* Send Form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Receiver Number</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <Input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={receiverNumber}
                onChange={(e) => setReceiverNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="bg-secondary border-border text-foreground pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Amount (₹)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Comment (Optional)</label>
            <Input
              type="text"
              placeholder="Add a note"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                SEND MONEY
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Help */}
      <button className="mt-6 flex items-center gap-2 text-sm text-primary mx-auto">
        <HelpCircle className="w-4 h-4" />
        Need Help?
      </button>
    </div>
  )
}
