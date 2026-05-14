'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  History,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Download
} from 'lucide-react'

interface HistoryPageProps {
  onBack: () => void
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const { user } = useWallet()
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('transactions')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'transfer_in':
        return <ArrowDownLeft className="w-5 h-5 text-success" />
      case 'debit':
      case 'transfer_out':
        return <ArrowUpRight className="w-5 h-5 text-destructive" />
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'transfer_in':
        return 'text-success'
      case 'debit':
      case 'transfer_out':
        return 'text-destructive'
      default:
        return 'text-foreground'
    }
  }

  const handleExportPdf = () => {
    // In a real app, this would generate a PDF
    alert('PDF export feature coming soon!')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            History
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
          className="border-primary text-primary"
        >
          <Download className="w-4 h-4 mr-1" />
          PDF
        </Button>
      </div>

      {/* Balance Card */}
      <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 gold-glow">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Available Balance</span>
        </div>
        <h2 className="text-3xl font-bold text-primary">₹{user?.balance.toFixed(2)}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
            activeTab === 'transactions'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground border border-border'
          }`}
        >
          TRANSACTIONS
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
            activeTab === 'withdrawals'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground border border-border'
          }`}
        >
          WITHDRAWALS
        </button>
      </div>

      {/* Content */}
      {activeTab === 'transactions' ? (
        <div className="space-y-3">
          {user?.transactions && user.transactions.length > 0 ? (
            user.transactions.map((txn) => (
              <div 
                key={txn.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.type === 'credit' || txn.type === 'transfer_in'
                        ? 'bg-success/20'
                        : 'bg-destructive/20'
                    }`}>
                      {getTransactionIcon(txn.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        {txn.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {txn.to && `To: ${txn.to}`}
                        {txn.from && `From: ${txn.from}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(txn.type)}`}>
                      {txn.type === 'credit' || txn.type === 'transfer_in' ? '+' : '-'}₹{txn.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(txn.timestamp)}</p>
                  </div>
                </div>
                {txn.comment && (
                  <p className="text-sm text-muted-foreground bg-secondary rounded-lg p-2 mt-2">
                    {txn.comment}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {user?.withdrawals && user.withdrawals.length > 0 ? (
            user.withdrawals.map((withdrawal) => (
              <div 
                key={withdrawal.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">₹{withdrawal.amount}</p>
                    <p className="text-sm text-muted-foreground">{withdrawal.upiId}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(withdrawal.timestamp)}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    withdrawal.status === 'approved'
                      ? 'bg-success/20 text-success'
                      : withdrawal.status === 'rejected'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {withdrawal.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No withdrawals yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
