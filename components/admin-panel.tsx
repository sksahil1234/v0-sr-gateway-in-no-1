'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownToLine, ArrowUpRight, LogOut, RefreshCw, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type StoredUser = {
  name?: string
  mobile?: string
  balance?: number
  isVerified?: boolean
  isVip?: boolean
  memberSince?: string
  transactions?: Array<{ id: string; type: string; amount: number; status: string; timestamp: string; comment?: string }>
  withdrawals?: Array<{ id: string; amount: number; upiId: string; status: string; timestamp: string }>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AdminPanel() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const loadData = () => {
    const savedUser = window.localStorage.getItem('sr_gateway_user')
    setUser(savedUser ? JSON.parse(savedUser) : null)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    loadData()
  }, [])

  const transactions = user?.transactions ?? []
  const withdrawals = user?.withdrawals ?? []
  const pendingWithdrawals = withdrawals.filter((item) => item.status === 'pending')
  const totalVolume = useMemo(() => transactions.reduce((total, item) => total + item.amount, 0), [transactions])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck data-icon="inline-start" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-primary">SR GATEWAY</p>
              <h1 className="text-xl font-bold text-balance">Admin control panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw data-icon="inline-start" /> Refresh
            </Button>
            <Button variant="ghost" size="icon" aria-label="Admin logout" onClick={() => window.location.assign('/')}>
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Overview">
          <Card><CardHeader className="pb-2"><CardDescription>Registered user</CardDescription><CardTitle className="flex items-center gap-2 text-2xl"><Users /> {user ? '1' : '0'}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Local wallet account</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Wallet balance</CardDescription><CardTitle className="flex items-center gap-2 text-2xl"><WalletCards /> ₹{(user?.balance ?? 0).toFixed(2)}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Current available balance</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Transaction volume</CardDescription><CardTitle className="flex items-center gap-2 text-2xl"><ArrowUpRight /> ₹{totalVolume.toFixed(2)}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Across {transactions.length} transactions</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Pending withdrawals</CardDescription><CardTitle className="flex items-center gap-2 text-2xl"><ArrowDownToLine /> {pendingWithdrawals.length}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Needs review</p></CardContent></Card>
        </section>

        {!user ? (
          <Card><CardHeader><CardTitle>No wallet account found</CardTitle><CardDescription>Open the main app and sign in once. This panel reads the existing browser wallet data.</CardDescription></CardHeader><CardContent><Button onClick={() => window.location.assign('/')}>Open wallet app</Button></CardContent></Card>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader><CardTitle>Account overview</CardTitle><CardDescription>Wallet profile currently stored in this browser.</CardDescription></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{user.name ?? 'Unnamed user'}</p></div>
                <div><p className="text-sm text-muted-foreground">Mobile</p><p className="font-medium">{user.mobile ?? '—'}</p></div>
                <div><p className="text-sm text-muted-foreground">Member since</p><p className="font-medium">{user.memberSince ?? '—'}</p></div>
                <Separator />
                <div className="flex flex-wrap gap-2"><Badge variant={user.isVerified ? 'default' : 'secondary'}>{user.isVerified ? 'Verified' : 'Unverified'}</Badge>{user.isVip && <Badge variant="outline">VIP member</Badge>}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Latest wallet transactions and status.</CardDescription></CardHeader>
              <CardContent>
                {transactions.length === 0 ? <p className="text-sm text-muted-foreground">No transactions yet.</p> : <div className="flex flex-col gap-4">{transactions.slice(0, 8).map((transaction) => <div className="flex items-center justify-between gap-4" key={transaction.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{transaction.comment || transaction.type}</p><p className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</p></div><div className="text-right"><p className="font-semibold">₹{transaction.amount.toFixed(2)}</p><p className="text-xs capitalize text-muted-foreground">{transaction.status}</p></div></div>)}</div>}
              </CardContent>
            </Card>
          </section>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="size-3" /> Last refreshed {lastUpdated.toLocaleTimeString('en-IN')}</div>
      </div>
    </main>
  )
}
