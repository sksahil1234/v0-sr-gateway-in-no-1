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
  ExternalLink
} from 'lucide-react'

interface BotAlertPageProps {
  onBack: () => void
}

export function BotAlertPage({ onBack }: BotAlertPageProps) {
  const { user } = useWallet()
  const [telegramId, setTelegramId] = useState(user?.telegramId || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!telegramId.trim()) {
      toast.error('Please enter your Telegram ID')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Bot alert settings saved!')
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
          Connect Bot
        </h1>
      </div>

      {/* Info Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 gold-glow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Telegram Alerts</h2>
            <p className="text-sm text-muted-foreground">Get instant notifications</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect your Telegram to receive instant alerts for transactions, withdrawals, and important updates.
        </p>
      </div>

      {/* Setup Form */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Setup Bot Alert</h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Telegram ID</label>
            <Input
              type="text"
              placeholder="Enter your Telegram ID"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Start our bot to get your ID
            </p>
          </div>

          <a
            href="https://t.me/SRGatewayBot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-secondary rounded-xl text-primary hover:bg-secondary/80 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Start @SRGatewayBot
            <ExternalLink className="w-4 h-4" />
          </a>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Features */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">What you will receive</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <p className="text-muted-foreground">Instant payment notifications</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <p className="text-muted-foreground">Withdrawal status updates</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <p className="text-muted-foreground">OTP for registration/login</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <p className="text-muted-foreground">Security alerts</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <p className="text-muted-foreground">Promotional offers</p>
          </div>
        </div>
      </div>
    </div>
  )
}
