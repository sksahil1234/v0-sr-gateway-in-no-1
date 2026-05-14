'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  name: string
  mobile: string
  pin: string
  telegramId?: string
  balance: number
  isVip: boolean
  isVerified: boolean
  memberSince: string
  apiKey: string
  transactions: Transaction[]
  withdrawals: Withdrawal[]
  scratchCards: ScratchCard[]
  createdCodes: GiftCode[]
}

export interface Transaction {
  id: string
  type: 'credit' | 'debit' | 'transfer_in' | 'transfer_out'
  amount: number
  from?: string
  to?: string
  comment?: string
  timestamp: string
  status: 'success' | 'pending' | 'failed'
}

export interface Withdrawal {
  id: string
  amount: number
  upiId: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp: string
}

export interface ScratchCard {
  id: string
  amount: number
  isScratched: boolean
  timestamp: string
}

export interface GiftCode {
  code: string
  amount: number
  isUsed: boolean
  createdAt: string
  usedBy?: string
}

interface WalletContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (mobile: string, pin: string) => Promise<boolean>
  register: (name: string, mobile: string, pin: string, telegramId?: string) => Promise<boolean>
  logout: () => void
  updateBalance: (amount: number) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  addWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'timestamp' | 'status'>) => void
  updatePin: (newPin: string) => void
  regenerateApiKey: () => void
  redeemCode: (code: string) => Promise<{ success: boolean; message: string; amount?: number }>
  createGiftCode: (amount: number) => Promise<{ success: boolean; code?: string; message: string }>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const generateId = () => Math.random().toString(36).substring(2, 15)
const generateApiKey = () => `SR-${Math.random().toString(36).substring(2, 12).toUpperCase()}`

// Simulated gift codes database
const globalGiftCodes: GiftCode[] = [
  { code: 'WELCOME100', amount: 100, isUsed: false, createdAt: new Date().toISOString() },
  { code: 'BONUS50', amount: 50, isUsed: false, createdAt: new Date().toISOString() },
]

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('sr_gateway_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Save user to localStorage whenever it changes
    if (user) {
      localStorage.setItem('sr_gateway_user', JSON.stringify(user))
    }
  }, [user])

  const login = async (mobile: string, pin: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const savedUser = localStorage.getItem('sr_gateway_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.mobile === mobile && userData.pin === pin) {
        setUser(userData)
        return true
      }
    }
    
    // Demo account
    if (mobile === '9999999999' && pin === '1234') {
      const demoUser: User = {
        id: generateId(),
        name: 'Demo User',
        mobile: '9999999999',
        pin: '1234',
        balance: 500,
        isVip: true,
        isVerified: true,
        memberSince: 'MAY 2026',
        apiKey: generateApiKey(),
        transactions: [
          { id: generateId(), type: 'credit', amount: 500, comment: 'Welcome Bonus', timestamp: new Date().toISOString(), status: 'success' }
        ],
        withdrawals: [],
        scratchCards: [
          { id: generateId(), amount: 10, isScratched: false, timestamp: new Date().toISOString() },
          { id: generateId(), amount: 25, isScratched: false, timestamp: new Date().toISOString() },
        ],
        createdCodes: []
      }
      setUser(demoUser)
      return true
    }
    
    return false
  }

  const register = async (name: string, mobile: string, pin: string, telegramId?: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newUser: User = {
      id: generateId(),
      name,
      mobile,
      pin,
      telegramId,
      balance: 0,
      isVip: false,
      isVerified: false,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
      apiKey: generateApiKey(),
      transactions: [],
      withdrawals: [],
      scratchCards: [
        { id: generateId(), amount: Math.floor(Math.random() * 20) + 5, isScratched: false, timestamp: new Date().toISOString() },
      ],
      createdCodes: []
    }
    
    setUser(newUser)
    localStorage.setItem('sr_gateway_user', JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sr_gateway_user')
  }

  const updateBalance = (amount: number) => {
    if (user) {
      setUser({ ...user, balance: user.balance + amount })
    }
  }

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (user) {
      const newTransaction: Transaction = {
        ...transaction,
        id: generateId(),
        timestamp: new Date().toISOString()
      }
      setUser({
        ...user,
        transactions: [newTransaction, ...user.transactions]
      })
    }
  }

  const addWithdrawal = (withdrawal: Omit<Withdrawal, 'id' | 'timestamp' | 'status'>) => {
    if (user) {
      const newWithdrawal: Withdrawal = {
        ...withdrawal,
        id: generateId(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      }
      setUser({
        ...user,
        withdrawals: [newWithdrawal, ...user.withdrawals],
        balance: user.balance - withdrawal.amount
      })
      addTransaction({
        type: 'debit',
        amount: withdrawal.amount,
        comment: `Withdrawal to ${withdrawal.upiId}`,
        status: 'pending'
      })
    }
  }

  const updatePin = (newPin: string) => {
    if (user) {
      setUser({ ...user, pin: newPin })
    }
  }

  const regenerateApiKey = () => {
    if (user) {
      setUser({ ...user, apiKey: generateApiKey() })
    }
  }

  const redeemCode = async (code: string): Promise<{ success: boolean; message: string; amount?: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const giftCode = globalGiftCodes.find(gc => gc.code === code.toUpperCase() && !gc.isUsed)
    if (giftCode && user) {
      giftCode.isUsed = true
      giftCode.usedBy = user.mobile
      updateBalance(giftCode.amount)
      addTransaction({
        type: 'credit',
        amount: giftCode.amount,
        comment: `Gift Code: ${code}`,
        status: 'success'
      })
      return { success: true, message: 'Code redeemed successfully!', amount: giftCode.amount }
    }
    
    return { success: false, message: 'Invalid or already used code' }
  }

  const createGiftCode = async (amount: number): Promise<{ success: boolean; code?: string; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!user || user.balance < amount) {
      return { success: false, message: 'Insufficient balance' }
    }
    
    const code = `SR${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const newCode: GiftCode = {
      code,
      amount,
      isUsed: false,
      createdAt: new Date().toISOString()
    }
    
    globalGiftCodes.push(newCode)
    updateBalance(-amount)
    
    if (user) {
      setUser({
        ...user,
        balance: user.balance - amount,
        createdCodes: [newCode, ...user.createdCodes]
      })
    }
    
    addTransaction({
      type: 'debit',
      amount,
      comment: `Created Gift Code: ${code}`,
      status: 'success'
    })
    
    return { success: true, code, message: 'Gift code created successfully!' }
  }

  return (
    <WalletContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      register,
      logout,
      updateBalance,
      addTransaction,
      addWithdrawal,
      updatePin,
      regenerateApiKey,
      redeemCode,
      createGiftCode
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
