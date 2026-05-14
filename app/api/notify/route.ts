import { NextRequest, NextResponse } from 'next/server'
import { 
  sendTransactionAlert, 
  sendWithdrawalUpdate,
  sendWelcomeMessage,
  sendSecurityAlert,
  sendToGlobalChannel,
  sendWithdrawalToChannel,
  sendNewUserToChannel,
  generateTransactionId 
} from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, chatId, ...data } = body

    if (!chatId && type !== 'channel_only') {
      return NextResponse.json(
        { success: false, error: 'Telegram Chat ID required' },
        { status: 400 }
      )
    }

    let result
    let channelResult

    switch (type) {
      case 'welcome':
        result = await sendWelcomeMessage(chatId, data.name, data.mobile)
        // Also send to channel
        channelResult = await sendNewUserToChannel(data.name, data.mobile)
        break

      case 'transaction':
        const transactionId = data.transactionId || generateTransactionId()
        
        // Send to user's personal Telegram
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
        
        // Map transaction type for channel
        const channelType = data.transactionType === 'credit' ? 'credit' 
          : data.transactionType === 'debit' ? 'debit'
          : data.transactionType === 'transfer_in' ? 'transfer'
          : data.transactionType === 'transfer_out' ? 'transfer'
          : 'credit'
        
        // Send to global channel with masked info
        channelResult = await sendToGlobalChannel(
          transactionId,
          channelType,
          data.amount,
          data.status,
          data.userMobile || 'Unknown',
          data.userName,
          {
            comment: data.comment,
            method: data.method
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
        
        // Send to global channel
        channelResult = await sendWithdrawalToChannel(
          data.withdrawalId,
          data.amount,
          data.status,
          data.userMobile || 'Unknown',
          data.upiId
        )
        break

      case 'security':
        result = await sendSecurityAlert(chatId, data.alertType, {
          ip: data.ip,
          device: data.device,
          location: data.location
        })
        break
        
      case 'add_fund':
        const addFundTxnId = data.transactionId || generateTransactionId()
        
        // Send to user
        result = await sendTransactionAlert(
          chatId,
          addFundTxnId,
          'credit',
          data.amount,
          data.status,
          {
            comment: `Add Fund via UPI - UTR: ${data.utrNumber}`,
            balance: data.balance
          }
        )
        
        // Send to channel
        channelResult = await sendToGlobalChannel(
          addFundTxnId,
          'add_fund',
          data.amount,
          data.status,
          data.userMobile || 'Unknown',
          data.userName,
          {
            method: 'UPI',
            comment: `UTR: ${data.utrNumber?.slice(0, 4)}****`
          }
        )
        
        if (result.success) {
          return NextResponse.json({ success: true, transactionId: addFundTxnId })
        }
        break
        
      case 'spin_win':
      case 'scratch_win':
        const winTxnId = data.transactionId || generateTransactionId()
        
        // Send to user
        result = await sendTransactionAlert(
          chatId,
          winTxnId,
          'credit',
          data.amount,
          'success',
          {
            comment: type === 'spin_win' ? 'Spin & Win Prize' : 'Scratch Card Prize',
            balance: data.balance
          }
        )
        
        // Send to channel
        channelResult = await sendToGlobalChannel(
          winTxnId,
          type,
          data.amount,
          'success',
          data.userMobile || 'Unknown',
          data.userName
        )
        
        if (result.success) {
          return NextResponse.json({ success: true, transactionId: winTxnId })
        }
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
