'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, ShieldCheck, Users, WalletCards, Check, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

type AdminData = { users: any[]; deposits: any[]; withdrawals: any[]; p2p: any[]; settings: any }

export function AdminPanel() {
  const [secret, setSecret] = useState('')
  const [savedSecret, setSavedSecret] = useState('')
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<any>({})

  const load = async (token = savedSecret) => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch('/api/admin', { headers: { 'x-admin-secret': token } })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Unauthorized')
      setData(body)
      setSettings(body.settings || {})
      setSavedSecret(token)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load admin data')
    } finally { setLoading(false) }
  }

  const review = async (type: string, id: string, status: 'approved' | 'rejected') => {
    const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': savedSecret }, body: JSON.stringify({ type, id, status }) })
    const body = await response.json()
    if (!response.ok) return toast.error(body.error || 'Action failed')
    toast.success(`Request ${status}`)
    load()
  }

  const saveSettings = async () => {
    const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': savedSecret }, body: JSON.stringify({ action: 'settings', settings }) })
    if (!response.ok) return toast.error('Could not save settings')
    toast.success('Settings saved')
  }

  const pending = useMemo(() => [...(data?.deposits || []).filter(x => x.status === 'pending').map(x => ({ ...x, type: 'deposit' })), ...(data?.withdrawals || []).filter(x => x.status === 'pending').map(x => ({ ...x, type: 'withdrawal' }))], [data])

  if (!savedSecret) return <main className="min-h-screen bg-background p-4 flex items-center justify-center"><Card className="w-full max-w-md"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck /> Admin access</CardTitle><CardDescription>Enter the private admin secret to manage users and financial requests.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><Input type="password" placeholder="Admin secret" value={secret} onChange={e => setSecret(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(secret)} /><Button onClick={() => load(secret)} disabled={loading}>{loading ? 'Checking…' : 'Open admin panel'}</Button></CardContent></Card></main>

  return <main className="min-h-screen bg-background text-foreground"><header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck /></div><div><p className="text-sm font-semibold text-primary">SR GATEWAY</p><h1 className="text-xl font-bold">Admin control panel</h1></div></div><Button variant="outline" size="sm" onClick={() => load()}><RefreshCw data-icon="inline-start" /> Refresh</Button></div></header><div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6"><section className="grid gap-4 sm:grid-cols-3"><Card><CardHeader><CardDescription>Registered users</CardDescription><CardTitle className="flex items-center gap-2"><Users /> {data?.users.length || 0}</CardTitle></CardHeader></Card><Card><CardHeader><CardDescription>Total balances</CardDescription><CardTitle className="flex items-center gap-2"><WalletCards /> ₹{(data?.users || []).reduce((a, u) => a + Number(u.balance || 0), 0).toFixed(2)}</CardTitle></CardHeader></Card><Card><CardHeader><CardDescription>Pending reviews</CardDescription><CardTitle>{pending.length}</CardTitle></CardHeader></Card></section><Card><CardHeader><CardTitle>Deposit and withdrawal approvals</CardTitle><CardDescription>Balance changes happen only after approval.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{pending.length === 0 ? <p className="text-sm text-muted-foreground">No pending requests.</p> : pending.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"><div><p className="font-medium">{item.type} · ₹{Number(item.amount).toFixed(2)}</p><p className="text-sm text-muted-foreground">{item.wallet_users?.name} · {item.wallet_users?.mobile} {item.utr ? `· UTR ${item.utr}` : `· UPI ${item.upi_id}`}</p></div><div className="flex gap-2"><Button size="sm" onClick={() => review(item.type, item.id, 'approved')}><Check data-icon="inline-start" /> Approve</Button><Button size="sm" variant="destructive" onClick={() => review(item.type, item.id, 'rejected')}><X data-icon="inline-start" /> Reject</Button></div></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Deposit settings</CardTitle><CardDescription>These values appear in the user deposit screen.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm">UPI ID<Input value={settings.upi_id || ''} onChange={e => setSettings({ ...settings, upi_id: e.target.value })} /></label><label className="flex flex-col gap-2 text-sm">QR code URL<Input value={settings.qr_code_url || ''} onChange={e => setSettings({ ...settings, qr_code_url: e.target.value })} /></label><label className="flex flex-col gap-2 text-sm">API base URL<Input value={settings.api_base_url || ''} onChange={e => setSettings({ ...settings, api_base_url: e.target.value })} /></label><label className="flex flex-col gap-2 text-sm">Deposit fee %<Input type="number" value={settings.deposit_fee_percent || 0} onChange={e => setSettings({ ...settings, deposit_fee_percent: Number(e.target.value) })} /></label><label className="flex flex-col gap-2 text-sm">Withdrawal fee %<Input type="number" value={settings.withdrawal_fee_percent || 0} onChange={e => setSettings({ ...settings, withdrawal_fee_percent: Number(e.target.value) })} /></label><label className="flex flex-col gap-2 text-sm">P2P fee %<Input type="number" value={settings.p2p_fee_percent || 0} onChange={e => setSettings({ ...settings, p2p_fee_percent: Number(e.target.value) })} /></label><Button className="sm:col-span-2" onClick={saveSettings}><Save data-icon="inline-start" /> Save settings</Button></CardContent></Card><Card><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{(data?.users || []).map(user => <div className="flex items-center justify-between border-b border-border py-3" key={user.id}><div><p className="font-medium">{user.name} <Badge variant="secondary">{user.mobile}</Badge></p><p className="text-sm text-muted-foreground">Telegram: {user.telegram_id || 'not linked'}</p></div><strong>₹{Number(user.balance).toFixed(2)}</strong></div>)}</CardContent></Card></div></main>
}
