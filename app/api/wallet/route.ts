import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

async function supabase(path: string, init?: RequestInit) {
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase is not configured')
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) throw new Error(data?.message || data?.hint || 'Supabase request failed')
  return data
}

function mapUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    pin: row.pin,
    telegramId: row.telegram_id || undefined,
    balance: Number(row.balance || 0),
    isVip: Boolean(row.is_vip),
    isVerified: Boolean(row.is_verified),
    memberSince: new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
    apiKey: row.api_key,
    transactions: [],
    withdrawals: [],
    scratchCards: [],
    createdCodes: [],
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    if (action === 'register') {
      const { name, mobile, pin, telegramId } = body
      if (!name || !/^\d{10}$/.test(mobile) || !/^\d{4}$/.test(pin)) return apiError('Invalid registration details')
      const rows = await supabase('wallet_users', {
        method: 'POST',
        body: JSON.stringify({ name, mobile, pin, telegram_id: telegramId || null, is_verified: Boolean(telegramId), api_key: `SR-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}` }),
      })
      return NextResponse.json({ success: true, user: mapUser(rows[0]) })
    }

    if (action === 'login') {
      const rows = await supabase(`wallet_users?mobile=eq.${encodeURIComponent(body.mobile)}&pin=eq.${encodeURIComponent(body.pin)}&limit=1`)
      if (!rows[0]) return apiError('Invalid mobile number or PIN', 401)
      return NextResponse.json({ success: true, user: mapUser(rows[0]) })
    }

    if (action === 'deposit') {
      const amount = Number(body.amount)
      if (!body.userId || !/^\d{12}$/.test(body.utr) || !Number.isFinite(amount) || amount < 10) return apiError('Invalid deposit details')
      const rows = await supabase('deposit_requests', { method: 'POST', body: JSON.stringify({ id: `DEP-${crypto.randomUUID()}`, user_id: body.userId, amount, utr: body.utr }) })
      return NextResponse.json({ success: true, request: rows[0], message: 'Deposit submitted for admin review' })
    }

    if (action === 'settings') {
      const rows = await supabase('wallet_settings?id=eq.true&limit=1')
      return NextResponse.json({ success: true, settings: rows[0] })
    }

    return apiError('Unknown wallet action')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected wallet error'
    return apiError(message, message.includes('duplicate') ? 409 : 500)
  }
}
