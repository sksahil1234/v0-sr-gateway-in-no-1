// Telegram Bot Service for SR GATEWAY
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

export interface TelegramMessage {
  chatId: string
  message: string
  parseMode?: 'HTML' | 'Markdown'
}

// Generate unique transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SRTXN${timestamp}${random}`
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send message to Telegram
export async function sendTelegramMessage({ chatId, message, parseMode = 'HTML' }: TelegramMessage) {
  if (!BOT_TOKEN) {
    console.error('[Telegram] Bot token not configured')
    return { success: false, error: 'Bot token not configured' }
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
      }),
    })

    const data = await response.json()
    
    if (data.ok) {
      return { success: true, messageId: data.result.message_id }
    } else {
      console.error('[Telegram] Error sending message:', data.description)
      return { success: false, error: data.description }
    }
  } catch (error) {
    console.error('[Telegram] Network error:', error)
    return { success: false, error: 'Network error' }
  }
}

// Send OTP to user
export async function sendOTP(chatId: string, otp: string, mobile: string) {
  const message = `
🔐 <b>SR GATEWAY - OTP Verification</b>

Your OTP for mobile <b>${mobile}</b> is:

<code>${otp}</code>

⚠️ Do not share this OTP with anyone.
This OTP is valid for 5 minutes.

━━━━━━━━━━━━━━━
🔸 <b>SR GATEWAY</b> | Premium Access
`
  return sendTelegramMessage({ chatId, message })
}

// Send Welcome message after registration
export async function sendWelcomeMessage(chatId: string, name: string, mobile: string) {
  const message = `
🎉 <b>Welcome to SR GATEWAY!</b>

Hello <b>${name}</b>,

Your account has been created successfully!

📱 Mobile: <code>${mobile}</code>
🔑 Status: Active

━━━━━━━━━━━━━━━
Features Available:
• 💰 Add Fund via UPI
• 💸 Instant Withdrawals  
• 🔄 Send Money (P2P)
• 🎁 Scratch Cards
• 🎡 Spin & Win
• 🎟️ Gift Codes

━━━━━━━━━━━━━━━
🔸 <b>SR GATEWAY</b> | Premium Access
`
  return sendTelegramMessage({ chatId, message })
}

// Send transaction alert
export async function sendTransactionAlert(
  chatId: string,
  transactionId: string,
  type: 'credit' | 'debit' | 'transfer_in' | 'transfer_out' | 'withdrawal',
  amount: number,
  status: 'success' | 'pending' | 'failed',
  details: {
    from?: string
    to?: string
    upiId?: string
    comment?: string
    balance?: number
  }
) {
  const statusEmoji = status === 'success' ? '✅' : status === 'pending' ? '⏳' : '❌'
  const statusText = status.toUpperCase()
  
  const typeEmoji = {
    credit: '💰',
    debit: '💸',
    transfer_in: '📥',
    transfer_out: '📤',
    withdrawal: '🏧'
  }[type]

  const typeText = {
    credit: 'CREDIT',
    debit: 'DEBIT',
    transfer_in: 'RECEIVED',
    transfer_out: 'SENT',
    withdrawal: 'WITHDRAWAL'
  }[type]

  let detailsText = ''
  if (details.from) detailsText += `📤 From: <code>${details.from}</code>\n`
  if (details.to) detailsText += `📥 To: <code>${details.to}</code>\n`
  if (details.upiId) detailsText += `🏦 UPI: <code>${details.upiId}</code>\n`
  if (details.comment) detailsText += `💬 Note: ${details.comment}\n`

  const message = `
${statusEmoji} <b>Transaction ${statusText}</b>

${typeEmoji} <b>Type:</b> ${typeText}
💵 <b>Amount:</b> ₹${amount.toFixed(2)}
🆔 <b>TXN ID:</b> <code>${transactionId}</code>

${detailsText}
${details.balance !== undefined ? `💰 <b>Balance:</b> ₹${details.balance.toFixed(2)}` : ''}

📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

━━━━━━━━━━━━━━━
🔸 <b>SR GATEWAY</b> | Premium Access
`
  return sendTelegramMessage({ chatId, message })
}

// Send withdrawal status update
export async function sendWithdrawalUpdate(
  chatId: string,
  withdrawalId: string,
  amount: number,
  upiId: string,
  status: 'pending' | 'approved' | 'rejected',
  adminNote?: string
) {
  const statusEmoji = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❌'
  const statusText = status.toUpperCase()

  const message = `
🏧 <b>Withdrawal ${statusText}</b>

${statusEmoji} <b>Status:</b> ${statusText}
💵 <b>Amount:</b> ₹${amount.toFixed(2)}
🏦 <b>UPI ID:</b> <code>${upiId}</code>
🆔 <b>Request ID:</b> <code>${withdrawalId}</code>
${adminNote ? `\n📝 <b>Note:</b> ${adminNote}` : ''}

📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

━━━━━━━━━━━━━━━
🔸 <b>SR GATEWAY</b> | Premium Access
`
  return sendTelegramMessage({ chatId, message })
}

// Send security alert
export async function sendSecurityAlert(
  chatId: string,
  alertType: 'login' | 'pin_change' | 'new_device',
  details: {
    ip?: string
    device?: string
    location?: string
  }
) {
  const alertEmoji = {
    login: '🔓',
    pin_change: '🔐',
    new_device: '📱'
  }[alertType]

  const alertTitle = {
    login: 'New Login Detected',
    pin_change: 'PIN Changed',
    new_device: 'New Device Login'
  }[alertType]

  const message = `
${alertEmoji} <b>Security Alert</b>

⚠️ <b>${alertTitle}</b>

${details.ip ? `🌐 IP: <code>${details.ip}</code>\n` : ''}${details.device ? `📱 Device: ${details.device}\n` : ''}${details.location ? `📍 Location: ${details.location}\n` : ''}
📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

If this wasn't you, please change your PIN immediately!

━━━━━━━━━━━━━━━
🔸 <b>SR GATEWAY</b> | Premium Access
`
  return sendTelegramMessage({ chatId, message })
}

// Send daily summary
export async function sendDailySummary(
  chatId: string,
  summary: {
    totalCredit: number
    totalDebit: number
    transactionCount: number
    currentBalance: number
  }
) {
  const message = `
📊 <b>Daily Summary</b>

💰 <b>Total Credit:</b> ₹${summary.totalCredit.toFixed(2)}
💸 <b>Total Debit:</b> ₹${summary.totalDebit.toFixed(2)}
📈 <b>Transactions:</b> ${summary.transactionCount}
💵 <b>Current Balance:</b> ₹${summary.currentBalance.toFixed(2)}

📅 ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}

━━━━━━━━━━━━━━━
🔸 <b>SR GATEWAY</b> | Premium Access
`
  return sendTelegramMessage({ chatId, message })
}
