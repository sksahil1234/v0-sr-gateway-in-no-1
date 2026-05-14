'use client'

import { useState } from 'react'
import { ArrowLeft, Webhook, CheckCircle, XCircle, RefreshCw, Trash2, Info } from 'lucide-react'

interface WebhookSetupPageProps {
  onBack: () => void
}

export default function WebhookSetupPage({ onBack }: WebhookSetupPageProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    data?: Record<string, unknown>
  } | null>(null)

  const handleAction = async (action: string) => {
    setLoading(action)
    setResult(null)
    
    try {
      const response = await fetch(`/api/telegram/webhook?action=${action}`)
      const data = await response.json()
      
      if (action === 'set') {
        setResult({
          success: data.success,
          message: data.success 
            ? 'Webhook successfully set! Bot ab /start command ka response dega.' 
            : 'Webhook set karne mein error aaya.',
          data,
        })
      } else if (action === 'info') {
        setResult({
          success: true,
          message: 'Current webhook info:',
          data: data.result,
        })
      } else if (action === 'delete') {
        setResult({
          success: data.ok,
          message: data.ok ? 'Webhook deleted successfully.' : 'Error deleting webhook.',
          data,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Webhook Setup</h1>
            <p className="text-xs text-muted-foreground">Configure Telegram Bot</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-medium mb-1">Important!</p>
              <p className="text-muted-foreground">
                Pehle &quot;Set Webhook&quot; button dabao. Iske baad hi bot Telegram par /start command ka response dega.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Set Webhook */}
          <button
            onClick={() => handleAction('set')}
            disabled={loading !== null}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 flex items-center gap-3 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              {loading === 'set' ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Webhook className="w-6 h-6" />
              )}
            </div>
            <div className="text-left">
              <p className="font-bold">Set Webhook</p>
              <p className="text-xs opacity-80">Bot ko activate karein</p>
            </div>
          </button>

          {/* Check Info */}
          <button
            onClick={() => handleAction('info')}
            disabled={loading !== null}
            className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-card/80"
          >
            <div className="p-2 bg-primary/20 rounded-lg">
              {loading === 'info' ? (
                <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <Info className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Check Webhook Info</p>
              <p className="text-xs text-muted-foreground">Current status dekhein</p>
            </div>
          </button>

          {/* Delete Webhook */}
          <button
            onClick={() => handleAction('delete')}
            disabled={loading !== null}
            className="w-full bg-card border border-red-500/30 rounded-xl p-4 flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-red-500/10"
          >
            <div className="p-2 bg-red-500/20 rounded-lg">
              {loading === 'delete' ? (
                <RefreshCw className="w-6 h-6 text-red-500 animate-spin" />
              ) : (
                <Trash2 className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Delete Webhook</p>
              <p className="text-xs text-muted-foreground">Webhook hatayein</p>
            </div>
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 border ${
            result.success 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.message}
                </p>
                {result.data && (
                  <pre className="mt-2 p-2 bg-black/30 rounded-lg text-xs text-muted-foreground overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold text-foreground mb-3">Setup Steps:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>&quot;Set Webhook&quot; button dabao</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>Success message aane ka wait karo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>Telegram par @SRGatewayBot search karo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>/start command bhejo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">5</span>
              <span>Bot se Chat ID milega, woh app mein paste karo</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
