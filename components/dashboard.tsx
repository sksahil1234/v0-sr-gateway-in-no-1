'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Menu,
  Plus,
  ArrowDownToLine,
  Send,
  History,
  Gift,
  RotateCw,
  Users,
  Ticket,
  Layers,
  User,
  Settings,
  Lock,
  MessageCircle,
  LogOut,
  ExternalLink,
  X,
  BadgeCheck,
  Crown,
  Webhook
} from 'lucide-react'

type Page = 'dashboard' | 'addFund' | 'withdraw' | 'send' | 'history' | 'scratch' | 'spin' | 'refer' | 'claim' | 'bulk' | 'profile' | 'api' | 'changePin' | 'bot' | 'giftCodes' | 'webhook'

interface DashboardProps {
  onNavigate: (page: Page) => void
  currentPage: Page
}

export function Dashboard({ onNavigate, currentPage }: DashboardProps) {
  const { user, logout } = useWallet()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const menuItems: { icon: React.ReactNode; label: string; page: Page }[] = [
    { icon: <Plus className="w-5 h-5" />, label: 'AddFund', page: 'addFund' },
    { icon: <ArrowDownToLine className="w-5 h-5" />, label: 'Withdraw', page: 'withdraw' },
    { icon: <Send className="w-5 h-5" />, label: 'Pay toUser', page: 'send' },
    { icon: <History className="w-5 h-5" />, label: 'Transaction', page: 'history' },
    { icon: <Gift className="w-5 h-5" />, label: 'MyScratch', page: 'scratch' },
    { icon: <RotateCw className="w-5 h-5" />, label: 'FreeSpin', page: 'spin' },
    { icon: <Users className="w-5 h-5" />, label: 'ReferEarn', page: 'refer' },
    { icon: <Ticket className="w-5 h-5" />, label: 'ClaimCode', page: 'claim' },
    { icon: <Layers className="w-5 h-5" />, label: 'Bulk Pay', page: 'bulk' },
  ]

  const sidebarItems = [
    { icon: <User className="w-5 h-5" />, label: 'Profile', page: 'profile' as Page },
    { icon: <Settings className="w-5 h-5" />, label: 'API Settings', page: 'api' as Page },
    { icon: <Lock className="w-5 h-5" />, label: 'Change PIN', page: 'changePin' as Page },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Bot Alert', page: 'bot' as Page },
    { icon: <Gift className="w-5 h-5" />, label: 'Gift Codes', page: 'giftCodes' as Page },
    { icon: <Webhook className="w-5 h-5" />, label: 'Webhook Setup', page: 'webhook' as Page },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-primary font-bold">SR MENU</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  currentPage === item.page 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <hr className="border-border my-4" />

            <a
              href="https://t.me/SRGateway"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Official Channel</span>
            </a>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Support</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>LOGOUT ACCOUNT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-primary"
          >
            <Menu className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SR GATEWAY</span>
          </div>

          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* User Info Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-semibold">{user.name}</span>
                  {user.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-primary" />
                  )}
                </div>
                <button 
                  onClick={() => onNavigate('profile')}
                  className="text-xs text-primary hover:underline"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-sm font-semibold text-success flex items-center gap-1">
                <BadgeCheck className="w-4 h-4" />
                {user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Member Since</p>
              <p className="text-sm font-semibold text-foreground">{user.memberSince}</p>
            </div>
          </div>

          {/* VIP Badge */}
          {user.isVip && (
            <div className="flex items-center gap-2 bg-primary/20 rounded-xl p-3 mb-4">
              <Crown className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">VIP Member</span>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 gold-glow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Wealth</p>
            <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
              {user.isVip ? 'VIP' : 'NORMAL'}
            </span>
          </div>
          <h2 className="text-4xl font-bold text-primary">
            ₹{user.balance.toFixed(2)}
          </h2>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 card-hover hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <span className="text-xs text-muted-foreground text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
