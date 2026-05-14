import { NextRequest, NextResponse } from 'next/server'
import { sendOTP, generateOTP } from '@/lib/telegram'

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const { mobile, telegramChatId } = await request.json()

    if (!mobile || !telegramChatId) {
      return NextResponse.json(
        { success: false, error: 'Mobile and Telegram Chat ID required' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP with 5 minute expiry
    otpStore.set(mobile, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    })

    // Send OTP via Telegram
    const result = await sendOTP(telegramChatId, otp, mobile)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'OTP sent to your Telegram'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send OTP' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API] Send OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
  try {
    const { mobile, otp } = await request.json()

    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile and OTP required' },
        { status: 400 }
      )
    }

    const stored = otpStore.get(mobile)

    if (!stored) {
      return NextResponse.json(
        { success: false, error: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(mobile)
      return NextResponse.json(
        { success: false, error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (stored.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // OTP verified, delete from store
    otpStore.delete(mobile)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    })
  } catch (error) {
    console.error('[API] Verify OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
