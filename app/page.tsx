'use client'

import { useState, useEffect } from 'react'
import { WalletProvider, useWallet } from '@/lib/wallet-context'
import { AuthPage } from '@/components/auth-page'
import { Dashboard } from '@/components/dashboard'
import { AddFundPage } from '@/components/add-fund-page'
import { WithdrawPage } from '@/components/withdraw-page'
import { SendMoneyPage } from '@/components/send-money-page'
import { BulkPayPage } from '@/components/bulk-pay-page'
import { HistoryPage } from '@/components/history-page'
import { ScratchCardPage } from '@/components/scratch-card-page'
import { SpinWheelPage } from '@/components/spin-wheel-page'
import { ReferEarnPage } from '@/components/refer-earn-page'
import { ClaimCodePage } from '@/components/claim-code-page'
import { ProfilePage } from '@/components/profile-page'
import { ApiSettingsPage } from '@/components/api-settings-page'
import { ChangePinPage } from '@/components/change-pin-page'
import { BotAlertPage } from '@/components/bot-alert-page'
import { GiftCodesPage } from '@/components/gift-codes-page'
import { Loader2, Zap } from 'lucide-react'

type Page = 'dashboard' | 'addFund' | 'withdraw' | 'send' | 'history' | 'scratch' | 'spin' | 'refer' | 'claim' | 'bulk' | 'profile' | 'api' | 'changePin' | 'bot' | 'giftCodes'

function WalletApp() {
  const { isLoggedIn, isLoading } = useWallet()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading SR GATEWAY...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not logged in
  if (!isLoggedIn) {
    return <AuthPage onSuccess={() => setCurrentPage('dashboard')} />
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'addFund':
        return <AddFundPage onBack={() => setCurrentPage('dashboard')} />
      case 'withdraw':
        return <WithdrawPage onBack={() => setCurrentPage('dashboard')} />
      case 'send':
        return <SendMoneyPage onBack={() => setCurrentPage('dashboard')} />
      case 'bulk':
        return <BulkPayPage onBack={() => setCurrentPage('dashboard')} />
      case 'history':
        return <HistoryPage onBack={() => setCurrentPage('dashboard')} />
      case 'scratch':
        return <ScratchCardPage onBack={() => setCurrentPage('dashboard')} />
      case 'spin':
        return <SpinWheelPage onBack={() => setCurrentPage('dashboard')} />
      case 'refer':
        return <ReferEarnPage onBack={() => setCurrentPage('dashboard')} />
      case 'claim':
        return <ClaimCodePage onBack={() => setCurrentPage('dashboard')} />
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('dashboard')} />
      case 'api':
        return <ApiSettingsPage onBack={() => setCurrentPage('dashboard')} />
      case 'changePin':
        return <ChangePinPage onBack={() => setCurrentPage('dashboard')} />
      case 'bot':
        return <BotAlertPage onBack={() => setCurrentPage('dashboard')} />
      case 'giftCodes':
        return <GiftCodesPage onBack={() => setCurrentPage('dashboard')} />
      default:
        return <Dashboard onNavigate={setCurrentPage} currentPage={currentPage} />
    }
  }

  return renderPage()
}

export default function Home() {
  return (
    <WalletProvider>
      <WalletApp />
    </WalletProvider>
  )
}
