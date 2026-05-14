'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Lock,
  Loader2,
  Check
} from 'lucide-react'

interface ChangePinPageProps {
  onBack: () => void
}

export function ChangePinPage({ onBack }: ChangePinPageProps) {
  const { user, updatePin } = useWallet()
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current')
  const [isLoading, setIsLoading] = useState(false)

  const handlePinInput = (digit: string) => {
    if (step === 'current' && currentPin.length < 4) {
      setCurrentPin(currentPin + digit)
      if (currentPin.length === 3) {
        setTimeout(() => {
          if (currentPin + digit === user?.pin) {
            setStep('new')
          } else {
            toast.error('Invalid current PIN')
            setCurrentPin('')
          }
        }, 300)
      }
    } else if (step === 'new' && newPin.length < 4) {
      setNewPin(newPin + digit)
      if (newPin.length === 3) {
        setTimeout(() => setStep('confirm'), 300)
      }
    } else if (step === 'confirm' && confirmPin.length < 4) {
      setConfirmPin(confirmPin + digit)
      if (confirmPin.length === 3) {
        const finalConfirmPin = confirmPin + digit
        setTimeout(async () => {
          if (finalConfirmPin === newPin) {
            setIsLoading(true)
            await new Promise(resolve => setTimeout(resolve, 1000))
            updatePin(newPin)
            setIsLoading(false)
            toast.success('PIN changed successfully!')
            onBack()
          } else {
            toast.error('PINs do not match')
            setConfirmPin('')
          }
        }, 300)
      }
    }
  }

  const handleBackspace = () => {
    if (step === 'current') {
      setCurrentPin(currentPin.slice(0, -1))
    } else if (step === 'new') {
      setNewPin(newPin.slice(0, -1))
    } else if (step === 'confirm') {
      setConfirmPin(confirmPin.slice(0, -1))
    }
  }

  const getCurrentPinValue = () => {
    if (step === 'current') return currentPin
    if (step === 'new') return newPin
    return confirmPin
  }

  const getStepTitle = () => {
    if (step === 'current') return 'Enter Current PIN'
    if (step === 'new') return 'Enter New PIN'
    return 'Confirm New PIN'
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
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Lock className="w-6 h-6 text-primary" />
          Change PIN
        </h1>
      </div>

      {/* PIN Entry Card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Updating PIN...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">
              {getStepTitle()}
            </h3>
            
            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-6">
              <div className={`w-3 h-3 rounded-full ${step === 'current' ? 'bg-primary' : 'bg-primary/30'}`} />
              <div className={`w-3 h-3 rounded-full ${step === 'new' ? 'bg-primary' : 'bg-primary/30'}`} />
              <div className={`w-3 h-3 rounded-full ${step === 'confirm' ? 'bg-primary' : 'bg-primary/30'}`} />
            </div>
            
            {/* PIN Display */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center ${
                    getCurrentPinValue().length > i 
                      ? 'border-primary bg-primary/20' 
                      : 'border-border'
                  }`}
                >
                  {getCurrentPinValue().length > i && (
                    <span className="text-2xl text-primary">*</span>
                  )}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((digit, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={`h-16 text-2xl font-semibold ${
                    digit === '' ? 'invisible' : ''
                  } ${
                    digit === '⌫' ? 'text-destructive' : 'text-foreground'
                  }`}
                  onClick={() => {
                    if (digit === '⌫') handleBackspace()
                    else if (digit) handlePinInput(digit)
                  }}
                >
                  {digit}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {step === 'current' && 'Enter your current 4-digit PIN to continue'}
          {step === 'new' && 'Choose a new 4-digit PIN'}
          {step === 'confirm' && 'Re-enter your new PIN to confirm'}
        </p>
      </div>
    </div>
  )
}
