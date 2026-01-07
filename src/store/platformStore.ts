import { create } from 'zustand'
import apiClient from '@/services/apiClient'

export type PlatformSettings = {
  currency: string
  supported_currencies?: string[]
  currency_aliases?: Record<string, string>
}

type PlatformState = PlatformSettings & {
  supportedCurrencies: string[]
  currencyAliases: Record<string, string>
  loaded: boolean
  initialize: () => Promise<void>
  setCurrencyLocal: (currency: string) => void
}

const normalizeCurrency = (currency: string | null | undefined, aliases: Record<string, string>) => {
  const c = (currency ?? '').toUpperCase().trim()
  if (!c) return ''
  return aliases[c] || c
}

export const usePlatformStore = create<PlatformState>((set) => ({
  currency: '',
  supported_currencies: [],
  currency_aliases: {},
  supportedCurrencies: [],
  currencyAliases: {},
  loaded: false,
  initialize: async () => {
    try {
      const { data } = await apiClient.get<PlatformSettings>('/api/platform-settings')
      const aliases = (data?.currency_aliases && typeof data.currency_aliases === 'object') ? data.currency_aliases : {}
      const supported = Array.isArray(data?.supported_currencies) ? data.supported_currencies : []
      const normalizedCurrency = normalizeCurrency(data?.currency, aliases)
      set({
        currency: normalizedCurrency,
        supportedCurrencies: supported,
        currencyAliases: aliases,
        supported_currencies: supported,
        currency_aliases: aliases,
        loaded: true,
      })
    } catch {
      // Do not hardcode currency defaults; keep empty until configured.
      set({ loaded: true })
    }
  },
  setCurrencyLocal: (currency: string) => set((state) => ({
    currency: normalizeCurrency(currency, state.currencyAliases || {}),
  })),
}))
