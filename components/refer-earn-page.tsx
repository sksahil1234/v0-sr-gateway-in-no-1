'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Users,
  Copy,
  Share2,
  Gift,
  Check
} from 'lucide-react'

interface ReferEarnPageProps {
  onBack: () => void
}

export function ReferEarnPage({ onBack }: ReferEarnPageProps) {
  const { user } = useWallet()
  const [copied, setCopied] = useState(false)

  const referralCode = `SR${user?.mobile?.slice(-4) || '0000'}`
  const referralLink = `https://srgateway.app/refer/${referralCode}`

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SR GATEWAY - Refer & Earn',
          text: `Join SR GATEWAY using my referral code ${referralCode} and get ₹10 bonus!`,
          url: referralLink
        })
      } catch {
        // User cancelled sharing
      }
    } else {
      handleCopy(referralLink)
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
        <h1 className="text-xl font-bold text-foreground">Refer & Earn</h1>
      </div>

      {/* Hero Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 text-center gold-glow">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Earn ₹10 Per Referral</h2>
        <p className="text-muted-foreground">Invite friends and earn rewards when they join!</p>
      </div>

      {/* Referral Code */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm text-muted-foreground mb-3">Your Referral Code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-secondary rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary tracking-widest">{referralCode}</p>
          </div>
          <Button
            onClick={() => handleCopy(referralCode)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm text-muted-foreground mb-3">Your Referral Link</h3>
        <div className="flex items-center gap-3">
          <Input
            value={referralLink}
            readOnly
            className="bg-secondary border-border text-foreground text-sm"
          />
          <Button
            onClick={() => handleCopy(referralLink)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Share Button */}
      <Button
        onClick={handleShare}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Share with Friends
      </Button>

      {/* How it Works */}
      <div className="bg-card border border-border rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          How it Works
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">Share your code</p>
              <p className="text-sm text-muted-foreground">Share your referral code with friends</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">Friend joins</p>
              <p className="text-sm text-muted-foreground">They create account using your code</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">Earn rewards</p>
              <p className="text-sm text-muted-foreground">Get ₹10 when they add first fund</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">₹0</p>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </div>
      </div>
    </div>
  )
}
