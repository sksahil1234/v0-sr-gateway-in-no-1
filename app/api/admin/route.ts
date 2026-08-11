import { NextRequest, NextResponse } from 'next/server'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminSecret = process.env.ADMIN_PANEL_SECRET || 'srwallet-admin'

function authorized(request: NextRequest) {
  return request.headers.get('x-admin-secret') === adminSecret
}

async function db(path: string, init?: RequestInit) {
  if (!url || !key) throw new Error('Supabase is not configured')
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init?.headers ?? {}) }, cache: 'no-store' })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) throw new Error(data?.message || 'Database request failed')
  return data
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [users, deposits, withdrawals, p2p, settings] = await Promise.all([
    db('wallet_users?select=id,name,mobile,telegram_id,balance,is_vip,is_verified,created_at&order=created_at.desc'),
    db('deposit_requests?select=*,wallet_users(name,mobile)&order=created_at.desc'),
    db('withdrawal_requests?select=*,wallet_users(name,mobile)&order=created_at.desc'),
    db('p2p_requests?select=*,sender:wallet_users!sender_id(name,mobile),receiver:wallet_users!receiver_id(name,mobile)&order=created_at.desc'),
    db('wallet_settings?id=eq.true&limit=1'),
  ])
  return NextResponse.json({ users, deposits, withdrawals, p2p, settings: settings[0] })
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    if (body.action === 'settings') {
      const [settings] = await db('wallet_settings?id=eq.true', { method: 'PATCH', body: JSON.stringify({ ...body.settings, updated_at: new Date().toISOString() }) })
      return NextResponse.json({ success: true, settings })
    }
    const table = body.type === 'deposit' ? 'deposit_requests' : body.type === 'withdrawal' ? 'withdrawal_requests' : 'p2p_requests'
    if (body.status === 'approved' && body.type === 'withdrawal') {
      const [pending] = await db(`withdrawal_requests?id=eq.${encodeURIComponent(body.id)}&status=eq.pending&select=user_id,amount`)
      if (!pending) return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 })
      const [user] = await db(`wallet_users?id=eq.${encodeURIComponent(pending.user_id)}&select=balance`)
      if (!user || Number(user.balance) < Number(pending.amount)) return NextResponse.json({ error: 'User balance is no longer sufficient' }, { status: 409 })
    }
    const rows = await db(`${table}?id=eq.${encodeURIComponent(body.id)}&status=eq.pending`, { method: 'PATCH', body: JSON.stringify({ status: body.status, admin_note: body.note || null, reviewed_at: new Date().toISOString() }) })
    if (!rows[0]) return NextResponse.json({ error: 'Request already reviewed or not found' }, { status: 409 })
    if (body.status === 'approved' && (body.type === 'deposit' || body.type === 'withdrawal')) {
      const [user] = await db(`wallet_users?id=eq.${encodeURIComponent(rows[0].user_id)}&select=balance`)
      const currentBalance = Number(user?.balance || 0)
      const amount = Number(rows[0].amount)
      if (body.type === 'withdrawal' && currentBalance < amount) return NextResponse.json({ error: 'User balance is no longer sufficient' }, { status: 409 })
      const nextBalance = body.type === 'deposit' ? currentBalance + amount : currentBalance - amount
      await db(`wallet_users?id=eq.${encodeURIComponent(rows[0].user_id)}`, { method: 'PATCH', body: JSON.stringify({ balance: nextBalance }) })
      await db('wallet_transactions', { method: 'POST', body: JSON.stringify({ id: `TX-${crypto.randomUUID()}`, user_id: rows[0].user_id, type: body.type === 'deposit' ? 'credit' : 'debit', amount, fee: Number(rows[0].fee || 0), comment: `${body.type} approved`, status: 'success' }) })
    }
    if (body.status === 'approved' && body.type === 'p2p') {
      const amount = Number(rows[0].amount)
      const [sender] = await db(`wallet_users?id=eq.${encodeURIComponent(rows[0].sender_id)}&select=balance`)
      const [receiver] = await db(`wallet_users?id=eq.${encodeURIComponent(rows[0].receiver_id)}&select=balance`)
      if (!sender || !receiver || Number(sender.balance) < amount + Number(rows[0].fee || 0)) return NextResponse.json({ error: 'Sender balance is no longer sufficient' }, { status: 409 })
      await db(`wallet_users?id=eq.${encodeURIComponent(rows[0].sender_id)}`, { method: 'PATCH', body: JSON.stringify({ balance: Number(sender.balance) - amount - Number(rows[0].fee || 0) }) })
      await db(`wallet_users?id=eq.${encodeURIComponent(rows[0].receiver_id)}`, { method: 'PATCH', body: JSON.stringify({ balance: Number(receiver.balance) + amount }) })
      await db('wallet_transactions', { method: 'POST', body: JSON.stringify({ id: `TX-${crypto.randomUUID()}`, user_id: rows[0].sender_id, type: 'transfer_out', amount, fee: Number(rows[0].fee || 0), to_mobile: rows[0].receiver_id, comment: 'P2P approved', status: 'success' }) })
      await db('wallet_transactions', { method: 'POST', body: JSON.stringify({ id: `TX-${crypto.randomUUID()}`, user_id: rows[0].receiver_id, type: 'transfer_in', amount, from_mobile: rows[0].sender_id, comment: 'P2P received', status: 'success' }) })
    }
    return NextResponse.json({ success: true, request: rows[0] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Admin action failed' }, { status: 500 })
  }
}
