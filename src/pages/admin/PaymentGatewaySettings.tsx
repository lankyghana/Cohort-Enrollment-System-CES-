import { useEffect, useMemo, useState } from 'react'
import apiClient from '@/services/apiClient'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ActiveGateway = 'paystack' | 'bulkclix'

interface GatewayConfigResponse {
  data: {
    active_gateway: ActiveGateway
    paystack_public_key: string
    paystack_secret_key_set: boolean
    bulkclix_base_url: string
    bulkclix_api_key_set: boolean
  }
}

const getApiErrorMessage = (error: unknown): string => {
  const maybeAxios = error as { response?: { data?: unknown; status?: number }; message?: string }
  const data = maybeAxios?.response?.data

  if (data && typeof data === 'object') {
    const errors = (data as { errors?: unknown }).errors
    if (errors && typeof errors === 'object') {
      const errorsObj = errors as Record<string, unknown>
      const firstKey = Object.keys(errorsObj)[0]
      const firstVal = firstKey ? errorsObj[firstKey] : undefined
      if (Array.isArray(firstVal) && typeof firstVal[0] === 'string') return firstVal[0]
      if (typeof firstVal === 'string') return firstVal
    }

    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }

  if (typeof maybeAxios?.message === 'string' && maybeAxios.message.trim()) return maybeAxios.message
  return 'An unexpected error occurred'
}

export const PaymentGatewaySettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [activeGateway, setActiveGateway] = useState<ActiveGateway>('paystack')

  const [paystackPublicKey, setPaystackPublicKey] = useState('')
  const [paystackSecretKey, setPaystackSecretKey] = useState('')
  const [paystackSecretKeySet, setPaystackSecretKeySet] = useState(false)

  const [bulkclixBaseUrl, setBulkclixBaseUrl] = useState('https://api.bulkclix.com')
  const [bulkclixApiKey, setBulkclixApiKey] = useState('')
  const [bulkclixApiKeySet, setBulkclixApiKeySet] = useState(false)

  const canSave = useMemo(() => {
    if (activeGateway === 'paystack') {
      return Boolean(paystackPublicKey.trim()) && (Boolean(paystackSecretKey.trim()) || paystackSecretKeySet)
    }
    return Boolean(bulkclixBaseUrl.trim()) && (Boolean(bulkclixApiKey.trim()) || bulkclixApiKeySet)
  }, [activeGateway, paystackPublicKey, paystackSecretKey, paystackSecretKeySet, bulkclixBaseUrl, bulkclixApiKey, bulkclixApiKeySet])

  const loadConfig = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const { data } = await apiClient.get<GatewayConfigResponse>('/api/payment-gateway')
      const cfg = data.data

      setActiveGateway(cfg.active_gateway)

      setPaystackPublicKey(cfg.paystack_public_key || '')
      setPaystackSecretKey('')
      setPaystackSecretKeySet(cfg.paystack_secret_key_set)

      setBulkclixBaseUrl(cfg.bulkclix_base_url || 'https://api.bulkclix.com')
      setBulkclixApiKey('')
      setBulkclixApiKeySet(cfg.bulkclix_api_key_set)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload: Record<string, unknown> = {
        active_gateway: activeGateway,
      }

      if (activeGateway === 'paystack') {
        payload.paystack_public_key = paystackPublicKey
        if (paystackSecretKey.trim()) payload.paystack_secret_key = paystackSecretKey
      } else {
        payload.bulkclix_base_url = bulkclixBaseUrl
        if (bulkclixApiKey.trim()) payload.bulkclix_api_key = bulkclixApiKey
      }

      const { data } = await apiClient.put<GatewayConfigResponse>('/api/payment-gateway', payload)
      const cfg = data.data

      setActiveGateway(cfg.active_gateway)
      setPaystackPublicKey(cfg.paystack_public_key || '')
      setPaystackSecretKey('')
      setPaystackSecretKeySet(cfg.paystack_secret_key_set)
      setBulkclixBaseUrl(cfg.bulkclix_base_url || 'https://api.bulkclix.com')
      setBulkclixApiKey('')
      setBulkclixApiKeySet(cfg.bulkclix_api_key_set)

      setSuccess('Payment gateway settings updated.')
    } catch (e: unknown) {
      setError(getApiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-heading font-semibold text-text">Payment Gateway</h1>
        <Card className="p-6">
          <p className="text-sm text-text-light">Loading settings...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-text">Payment Gateway</h1>
          <p className="mt-1 text-sm text-text-light">Choose which gateway is active and update credentials.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadConfig} disabled={saving}>
            Refresh
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !canSave}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </Card>
      )}

      {success && (
        <Card className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </Card>
      )}

      <Card className="space-y-5 p-6">
        <div>
          <p className="text-sm font-semibold text-text">Active gateway</p>
          <p className="mt-1 text-xs text-text-light">Only one gateway is active at a time.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveGateway('paystack')}
              className={
                activeGateway === 'paystack'
                  ? 'rounded-2xl border border-primary bg-primary/10 px-4 py-3 text-left'
                  : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-primary/40'
              }
            >
              <p className="text-sm font-semibold text-text">Paystack</p>
              <p className="mt-1 text-xs text-text-light">Card & bank payments</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveGateway('bulkclix')}
              className={
                activeGateway === 'bulkclix'
                  ? 'rounded-2xl border border-primary bg-primary/10 px-4 py-3 text-left'
                  : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-primary/40'
              }
            >
              <p className="text-sm font-semibold text-text">Bulkclix</p>
              <p className="mt-1 text-xs text-text-light">Mobile money collection (x-api-key)</p>
            </button>
          </div>
        </div>

        {activeGateway === 'paystack' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="PAYSTACK_PUBLIC_KEY"
              value={paystackPublicKey}
              onChange={(e) => setPaystackPublicKey(e.target.value)}
              placeholder="pk_live_..."
            />
            <Input
              label={paystackSecretKeySet ? 'PAYSTACK_SECRET_KEY (set)' : 'PAYSTACK_SECRET_KEY'}
              value={paystackSecretKey}
              onChange={(e) => setPaystackSecretKey(e.target.value)}
              placeholder={paystackSecretKeySet ? 'Leave blank to keep existing' : 'sk_live_...'}
              type="password"
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="BULKCLIX_BASE_URL"
              value={bulkclixBaseUrl}
              onChange={(e) => setBulkclixBaseUrl(e.target.value)}
              placeholder="https://api.bulkclix.com"
            />
            <Input
              label={bulkclixApiKeySet ? 'BULKCLIX_API_KEY (set)' : 'BULKCLIX_API_KEY'}
              value={bulkclixApiKey}
              onChange={(e) => setBulkclixApiKey(e.target.value)}
              placeholder={bulkclixApiKeySet ? 'Leave blank to keep existing' : 'your-x-api-key'}
              type="password"
            />
          </div>
        )}

        {!canSave && (
          <p className="text-xs text-text-light">
            Provide the required credentials for the selected gateway to enable saving.
          </p>
        )}
      </Card>
    </div>
  )
}
