'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  Settings,
  Copy,
  RefreshCw,
  Check,
  AlertTriangle,
  Code,
  ExternalLink
} from 'lucide-react'

interface ApiSettingsPageProps {
  onBack: () => void
}

export function ApiSettingsPage({ onBack }: ApiSettingsPageProps) {
  const { user, regenerateApiKey } = useWallet()
  const [copied, setCopied] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const baseUrl = 'https://srgateway.app'
  const apiKey = user?.apiKey || 'SR-XXXXXXXXXX'

  const apiUrl = `${baseUrl}/api/pay?key=${apiKey}&paytm={number}&amount={amount}&comment=payout`
  const balanceUrl = `${baseUrl}/payment/balance?key=${apiKey}`
  const verifyUrl = `${baseUrl}/payment/verify?key=${apiKey}&number={number}`

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success('Copied!')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRegenerateKey = () => {
    regenerateApiKey()
    toast.success('API Key regenerated!')
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="text-primary"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          API SETTINGS
        </h1>
      </div>

      {/* API URL */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm text-muted-foreground mb-3">Payment API URL</h3>
        <p className="text-xs text-muted-foreground mb-2">FULL API URL</p>
        <div className="bg-secondary rounded-xl p-3 mb-3 overflow-x-auto">
          <code className="text-xs text-primary break-all font-mono">{apiUrl}</code>
        </div>
        <Button
          onClick={() => handleCopy(apiUrl, 'url')}
          variant="outline"
          className="w-full border-primary text-primary"
        >
          {copied === 'url' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          Copy URL
        </Button>
      </div>

      {/* Parameters */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm text-muted-foreground mb-4">Parameters</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-primary font-mono text-sm">key</span>
            <span className="text-destructive text-xs">*</span>
            <span className="text-muted-foreground text-sm">Your API Key</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-mono text-sm">paytm</span>
            <span className="text-destructive text-xs">*</span>
            <span className="text-muted-foreground text-sm">Receiver number</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-mono text-sm">amount</span>
            <span className="text-destructive text-xs">*</span>
            <span className="text-muted-foreground text-sm">{"Amount in ₹ (min ₹1)"}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-mono text-sm">comment</span>
            <span className="text-muted-foreground text-xs">(optional)</span>
            <span className="text-muted-foreground text-sm">Optional comment</span>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm text-muted-foreground mb-3">Your API Key</h3>
        <p className="text-xs text-muted-foreground mb-2">API KEY</p>
        <div className="flex items-center gap-3">
          <Input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            readOnly
            className="bg-secondary border-border text-primary font-mono flex-1"
          />
          <Button
            onClick={() => handleCopy(apiKey, 'key')}
            variant="outline"
            className="border-primary text-primary"
          >
            {copied === 'key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Button
            onClick={() => setShowKey(!showKey)}
            variant="outline"
            className="flex-1"
          >
            {showKey ? 'Hide Key' : 'Show Key'}
          </Button>
          <Button
            onClick={handleRegenerateKey}
            variant="outline"
            className="flex-1 border-destructive text-destructive"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            REGENERATE
          </Button>
        </div>
      </div>

      {/* Response Examples */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm text-muted-foreground mb-4">Response Examples</h3>
        
        {/* Success */}
        <div className="mb-4">
          <p className="text-xs text-success mb-2">SUCCESS RESPONSE</p>
          <div className="bg-secondary rounded-xl p-3 overflow-x-auto">
            <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">{`{
  "status": "success",
  "message": "Payment successful",
  "data": {
    "transaction_id": "TXNhgphgfqre1med5sc",
    "amount": 50,
    "receiver": {
      "name": "Name",
      "number": "number"
    },
    "comment": "payout",
    "timestamp": "16-03-2026 15:12:06"
  }
}`}</pre>
          </div>
        </div>

        {/* Errors */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-destructive mb-2">ERROR — INVALID KEY</p>
            <div className="bg-secondary rounded-xl p-3">
              <pre className="text-xs text-foreground font-mono">{`{
  "status": "error",
  "message": "Invalid API key"
}`}</pre>
            </div>
          </div>

          <div>
            <p className="text-xs text-destructive mb-2">ERROR — LOW BALANCE</p>
            <div className="bg-secondary rounded-xl p-3">
              <pre className="text-xs text-foreground font-mono">{`{
  "status": "error",
  "message": "Admin Balance Low"
}`}</pre>
            </div>
          </div>

          <div>
            <p className="text-xs text-destructive mb-2">ERROR — NUMBER NOT FOUND</p>
            <div className="bg-secondary rounded-xl p-3">
              <pre className="text-xs text-foreground font-mono">{`{
  "status": "error",
  "message": "Receiver 9876543210 not found"
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Other Endpoints */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm text-muted-foreground mb-4">Other Endpoints</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-primary mb-2">CHECK BALANCE</p>
            <div className="bg-secondary rounded-xl p-3 overflow-x-auto">
              <code className="text-xs text-muted-foreground font-mono break-all">{balanceUrl}</code>
            </div>
          </div>

          <div>
            <p className="text-xs text-primary mb-2">VERIFY NUMBER</p>
            <div className="bg-secondary rounded-xl p-3 overflow-x-auto">
              <code className="text-xs text-muted-foreground font-mono break-all">{verifyUrl}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-destructive/10 border border-destructive rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive mb-1">Strict Warning</p>
            <p className="text-sm text-destructive/80">
              NEVER share your API key with anyone. Anyone with this key can deduct balance from your wallet automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
