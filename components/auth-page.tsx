'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  Smartphone, 
  Lock, 
  User, 
  LogIn, 
  UserPlus,
  Send,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Zap
} from 'lucide-react'

interface AuthPageProps {
  onSuccess: () => void
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useWallet()

  // Login state
  const [loginMobile, setLoginMobile] = useState('')
  const [loginPin, setLoginPin] = useState('')

  // Register state
  const [registerName, setRegisterName] = useState('')
  const [registerMobile, setRegisterMobile] = useState('')
  const [registerPin, setRegisterPin] = useState('')
  const [registerTelegramId, setRegisterTelegramId] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginMobile || !loginPin) {
      toast.error('Please fill all fields')
      return
    }
    
    setIsLoading(true)
    const success = await login(loginMobile, loginPin)
    setIsLoading(false)

    if (success) {
      toast.success('Login successful!')
      onSuccess()
    } else {
      toast.error('Invalid mobile number or PIN')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerName || !registerMobile || !registerPin) {
      toast.error('Please fill all required fields')
      return
    }
    if (registerPin.length !== 4) {
      toast.error('PIN must be 4 digits')
      return
    }
    if (!agreedToTerms) {
      toast.error('Please agree to terms and conditions')
      return
    }

    setIsLoading(true)
    const success = await register(registerName, registerMobile, registerPin, registerTelegramId)
    setIsLoading(false)

    if (success) {
      toast.success('Account created successfully!')
      onSuccess()
    } else {
      toast.error('Registration failed')
    }
  }

  const handleSendOtp = () => {
    if (!registerMobile || registerMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    setOtpSent(true)
    toast.success('OTP sent to your Telegram!')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-card border border-border rounded-2xl p-8 gold-glow">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
              <Zap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SR GATEWAY</h1>
            <p className="text-sm text-primary tracking-widest">PREMIUM ACCESS</p>
          </div>

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Mobile Input */}
              <div className="relative">
                <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-sm">+91</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="Mobile Number"
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value.slice(0, 10))}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* PIN Input */}
              <div className="relative">
                <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Security PIN"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value.slice(0, 4))}
                    maxLength={4}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                LOGIN NOW
              </Button>

              {/* Switch to Register */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogin(false)}
                className="w-full border-primary text-primary hover:bg-primary/10 font-semibold py-6 rounded-xl"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                CREATE ACCOUNT
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name Input */}
              <div className="relative">
                <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Mobile Input */}
              <div className="relative">
                <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-sm">+91</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="Mobile Number"
                    value={registerMobile}
                    onChange={(e) => setRegisterMobile(e.target.value.slice(0, 10))}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* PIN Input */}
              <div className="relative">
                <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <Input
                    type="password"
                    placeholder="4-Digit PIN"
                    value={registerPin}
                    onChange={(e) => setRegisterPin(e.target.value.slice(0, 4))}
                    maxLength={4}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Telegram ID Input */}
              <div className="relative">
                <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Telegram ID"
                    value={registerTelegramId}
                    onChange={(e) => setRegisterTelegramId(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                  <a 
                    href="https://t.me/SRGatewayBot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 text-primary text-sm hover:underline flex items-center gap-1"
                  >
                    Get ID <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* OTP Section */}
              {!otpSent ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-6 rounded-xl border border-border"
                >
                  <Send className="w-5 h-5 mr-2 text-primary" />
                  Send OTP
                </Button>
              ) : (
                <div className="relative">
                  <div className="flex items-center bg-secondary border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <Input
                      type="number"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                      className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}

              {/* Telegram Bot Link */}
              <a
                href="https://t.me/SRGatewayBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <Send className="w-4 h-4" />
                Start Bot For OTP
                <span className="text-muted-foreground">@SRGatewayBot</span>
              </a>

              {/* Terms Checkbox */}
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                {"I agree to the Terms & Conditions"}
              </label>

              {/* Register Button */}
              <Button 
                type="submit" 
                disabled={isLoading || !otpSent}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <UserPlus className="w-5 h-5 mr-2" />
                )}
                Create Account
              </Button>

              {/* Switch to Login */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogin(true)}
                className="w-full border-primary text-primary hover:bg-primary/10 font-semibold py-6 rounded-xl"
              >
                <LogIn className="w-5 h-5 mr-2" />
                LOGIN
              </Button>
            </form>
          )}
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo: 9999999999 / PIN: 1234</p>
        </div>
      </div>
    </div>
  )
}
