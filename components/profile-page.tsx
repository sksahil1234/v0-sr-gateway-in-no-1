'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  User,
  BadgeCheck,
  Crown,
  Calendar,
  Phone,
  Save,
  Loader2
} from 'lucide-react'

interface ProfilePageProps {
  onBack: () => void
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useWallet()
  const [name, setName] = useState(user?.name || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Profile updated!')
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
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      {/* Avatar Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-center">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          {user?.name}
          {user?.isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
        </h2>
        <p className="text-sm text-muted-foreground">+91 {user?.mobile}</p>
        
        {user?.isVip && (
          <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mt-3">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-semibold">VIP Member</span>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-xs">Status</span>
          </div>
          <p className={`font-semibold ${user?.isVerified ? 'text-success' : 'text-muted-foreground'}`}>
            {user?.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Member Since</span>
          </div>
          <p className="font-semibold text-foreground">{user?.memberSince}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Update Profile</h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Mobile Number</label>
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">+91 {user?.mobile}</span>
              <span className="ml-auto text-xs text-muted-foreground">(Cannot change)</span>
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
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Update Profile
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-card border border-border rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Info</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="text-foreground font-mono">{user?.id?.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Telegram ID</span>
            <span className="text-foreground">{user?.telegramId || 'Not linked'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">API Key</span>
            <span className="text-foreground font-mono">{user?.apiKey?.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
