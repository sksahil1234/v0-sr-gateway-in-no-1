import { NextRequest, NextResponse } from 'next/server'
import { 
  sendTransactionAlert, 
  sendWithdrawalUpdate,
  sendWelcomeMessage,
  sendSecurityAlert,
  generateTransactionId 
} from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, chatId, ...data } = body

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Telegram Chat ID required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'welcome':
        result = await sendWelcomeMessage(chatId, data.name, data.mobile)
        break

      case 'transaction':
        const transactionId = data.transactionId || generateTransactionId()
        result = await sendTransactionAlert(
          chatId,
          transactionId,
          data.transactionType,
          data.amount,
          data.status,
          {
            from: data.from,
            to: data.to,
            upiId: data.upiId,
            comment: data.comment,
            balance: data.balance
          }
        )
        if (result.success) {
          return NextResponse.json({ success: true, transactionId })
        }
        break

      case 'withdrawal':
        result = await sendWithdrawalUpdate(
          chatId,
          data.withdrawalId,
          data.amount,
          data.upiId,
          data.status,
          data.adminNote
        )
        break

      case 'security':
        result = await sendSecurityAlert(chatId, data.alertType, {
          ip: data.ip,
          device: data.device,
          location: data.location
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid notification type' },
          { status: 400 }
        )
    }

    if (result?.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      return NextResponse.json(
        { success: false, error: result?.error || 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API] Notify error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
