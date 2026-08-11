import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Store user data temporarily (in production, use a database)
const userStore = new Map<string, { visitorID: string, visitorMobile: string }>()

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    console.log('[v0] Telegram webhook received:', JSON.stringify(update, null, 2))
    
    // Handle message
    if (update.message) {
      const chatId = update.message.chat.id.toString()
      const text = update.message.text || ''
      const firstName = update.message.from?.first_name || 'User'
      const username = update.message.from?.username || ''
      
      // Handle /start command
      if (text === '/start') {
        const welcomeMessage = `*Welcome to SR GATEWAY Bot!*

Hello ${firstName}!

Main aapko SR GATEWAY app ke saare notifications yahan bhejunga:

*OTP Verification*
*Transaction Alerts*
*Withdrawal Updates*
*Security Notifications*

*Your Chat ID:* \`${chatId}\`

Is Chat ID ko copy karke SR GATEWAY app mein paste karo aur Bot Alert connect karo.

*Channel:* @SR_TECHNOLOGY_LTD1
Yahan sabhi transactions ka live history dekhein!

_Powered by SR GATEWAY_`

        await sendMessage(chatId, welcomeMessage)
      }
      
      // Handle /help command
      else if (text === '/help') {
        const helpMessage = `📚 *SR GATEWAY Bot Help*

*Available Commands:*
/start - Bot start karein aur Chat ID paayein
/id - Apna Chat ID dekhein
/status - Account status check karein
/help - Yeh help message dekhein

*Features:*
• Real-time transaction alerts
• OTP delivery for verification
• Withdrawal status updates
• Security notifications

*Support:*
Kisi bhi samasya ke liye SR GATEWAY app mein contact karein.

_Powered by SR GATEWAY_`

        await sendMessage(chatId, helpMessage)
      }
      
      // Handle /id command
      else if (text === '/id') {
        const idMessage = `🆔 *Your Chat ID*

\`${chatId}\`

👆 Tap to copy

Is ID ko SR GATEWAY app mein Bot Alert section mein paste karein.`

        await sendMessage(chatId, idMessage)
      }
      
      // Handle /status command
      else if (text === '/status') {
        const statusMessage = `📊 *Bot Status*

✅ Bot Active
✅ Notifications Enabled
📱 Chat ID: \`${chatId}\`

Aap successfully connected hain SR GATEWAY Bot se!`

        await sendMessage(chatId, statusMessage)
      }
      
      // Handle any other message
      else if (text && !text.startsWith('/')) {
        const defaultMessage = `👋 Hello!

Main SR GATEWAY Bot hoon. Main sirf notifications bhejne ke liye hoon.

Commands ke liye /help type karein.

📱 *Your Chat ID:* \`${chatId}\``

        await sendMessage(chatId, defaultMessage)
      }
    }
    
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackQuery = update.callback_query
      const chatId = callbackQuery.message.chat.id.toString()
      const data = callbackQuery.data
      
      // Answer callback query
      await answerCallbackQuery(callbackQuery.id)
      
      if (data === 'get_chat_id') {
        await sendMessage(chatId, `📱 *Your Chat ID:* \`${chatId}\`\n\nIs ID ko copy karke app mein paste karein.`)
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

async function sendMessage(chatId: string, text: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
  }
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  
  const result = await response.json()
  console.log('[v0] Send message result:', result)
  return result
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text,
    }),
  })
}

const PRODUCTION_WEBHOOK_URL = 'https://srwallet.vercel.app/api/telegram/webhook'

// GET request to inspect or configure the production webhook.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (!BOT_TOKEN) {
    return NextResponse.json({ success: false, error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 500 })
  }
  
  if (action === 'set') {
    // Always use the canonical production URL. Using the preview host here
    // leaves Telegram delivering updates to a temporary deployment.
    const webhookUrl = PRODUCTION_WEBHOOK_URL
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      success: result.ok,
      webhookUrl,
      result,
    })
  }
  
  if (action === 'info') {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    const response = await fetch(url)
    const result = await response.json()
    
    return NextResponse.json(result)
  }
  
  if (action === 'delete') {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    const response = await fetch(url)
    const result = await response.json()
    
    return NextResponse.json(result)
  }
  
  return NextResponse.json({
    message: 'SR GATEWAY Telegram Webhook',
    actions: {
      set: '/api/telegram/webhook?action=set',
      info: '/api/telegram/webhook?action=info', 
      delete: '/api/telegram/webhook?action=delete',
    }
  })
}
