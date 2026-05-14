'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  MessageCircle,
  Save,
  Loader2,
  Bell,
  ExternalLink,
  CheckCircle2,
  Send,
  Shield
} from 'lucide-react'

interface BotAlertPageProps {
  onBack: () => void
}

export function BotAlertPage({ onBack }: BotAlertPageProps) {
  const { user, updateTelegramId, sendOtp, verifyOtp } = useWallet()
  const [telegramId, setTelegramId] = useState(user?.telegramId || '')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSendOtp = async () => {
    if (!telegramId.trim()) {
      toast.error('Please enter your Telegram Chat ID')
      return
    }

    setIsLoading(true)
    const result = await sendOtp(telegramId)
    setIsLoading(false)

    if (result.success) {
      setOtpSent(true)
      toast.success('OTP sent to your Telegram!')
    } else {
      toast.error(result.message)
    }
  }

  const handleVerifyAndSave = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP')
      return
    }

    setIsVerifying(true)
    const verifyResult = await verifyOtp(otp)
    
    if (verifyResult.success) {
      const updateResult = await updateTelegramId(telegramId)
      setIsVerifying(false)
      
      if (updateResult) {
        toast.success('Telegram connected successfully! You will now receive alerts.')
        onBack()
      } else {
        toast.error('Failed to save Telegram ID')
      }
    } else {
      setIsVerifying(false)
      toast.error(verifyResult.message)
    }
  }

  const handleDirectSave = async () => {
    if (!telegramId.trim()) {
      toast.error('Please enter your Telegram Chat ID')
      return
    }

    setIsLoading(true)
    const result = await updateTelegramId(telegramId)
    setIsLoading(false)

    if (result) {
      toast.success('Telegram connected successfully!')
      onBack()
    } else {
      toast.error('Failed to connect Telegram')
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
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Telegram Bot Alert
        </h1>
      </div>

      {/* Current Status */}
      {user?.telegramId && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-green-500 font-semibold">Bot Connected</p>
              <p className="text-sm text-muted-foreground">Chat ID: {user.telegramId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 gold-glow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Telegram Alerts</h2>
            <p className="text-sm text-muted-foreground">Real-time notifications</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect your Telegram to receive instant alerts for OTP, transactions, withdrawals, and security updates.
        </p>
      </div>

      {/* How to get Chat ID */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          How to get your Chat ID
        </h3>
        
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">1</span>
            <span>Click the button below to open our Telegram Bot</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">2</span>
            <span>Click &quot;Start&quot; or send /start command</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">3</span>
            <span>The bot will send you your Chat ID</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">4</span>
            <span>Copy and paste your Chat ID below</span>
          </li>
        </ol>

        <a
          href="https://t.me/SRGatewayBot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 mt-4 bg-[#0088cc] rounded-xl text-white hover:bg-[#0088cc]/90 transition-colors font-semibold"
        >
          <Send className="w-5 h-5" />
          Open @SRGatewayBot
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Setup Form */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Connect Your Telegram</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Telegram Chat ID</label>
            <Input
              type="text"
              placeholder="Enter your Telegram Chat ID (e.g., 123456789)"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          {!otpSent ? (
            <>
              <Button
                onClick={handleSendOtp}
                disabled={isLoading || !telegramId.trim()}
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-6 border border-border"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2 text-primary" />
                    Send OTP to Verify
                  </>
                )}
              </Button>

              <div className="text-center text-muted-foreground text-sm">or</div>

              <Button
                onClick={handleDirectSave}
                disabled={isLoading || !telegramId.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Connect Directly
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Enter OTP</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength={6}
                  className="bg-secondary border-border text-foreground text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  OTP sent to your Telegram. Valid for 5 minutes.
                </p>
              </div>

              <Button
                onClick={handleVerifyAndSave}
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Verify & Connect
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setOtpSent(false)
                  setOtp('')
                }}
                variant="outline"
                className="w-full border-border text-muted-foreground py-6"
              >
                Resend OTP
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">What you will receive</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
            <p className="text-sm text-muted-foreground">OTP for verification</p>
          </div>
          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Transaction alerts</p>
          </div>
          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Payment success</p>
          </div>
          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Payment failed</p>
          </div>
          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Withdrawal updates</p>
          </div>
          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Security alerts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
