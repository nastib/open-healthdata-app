import { ref, watchEffect } from 'vue'
import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_SESSION_SECRET || 'default-secret-key'
const SESSION_KEY = 'app_session'
const FALLBACK_STORE = ref<Record<string, any>>({})

interface SessionData {
  user: any
  tokens: {
    access: string
    refresh: string
  }
  preferences: Record<string, any>
  lastActivity: number
  expiresAt: number
}

/**
 *
 * @returns
 */
export function useSessionPersistence() {
  const isLocalStorageAvailable = typeof localStorage !== 'undefined'
  const sessionData = ref<SessionData | null>(null)

  const encrypt = (data: any): string  => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
  }

  const decrypt = (encrypted: string): any => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    } catch {
      return null
    }
  }
  //
  const saveSession = (data: SessionData) =>{

    const encrypted = encrypt(data)

    try {
      if (isLocalStorageAvailable) {
        localStorage.setItem(SESSION_KEY, encrypted)

      } else {
        FALLBACK_STORE.value[SESSION_KEY] = encrypted
      }
    } catch (e) {
      console.error('Storage limit exceeded', e)
    }
  }

  const loadSession = (): SessionData | null => {
    try {
      let encrypted: string | null
      if (isLocalStorageAvailable) {
        encrypted = localStorage.getItem(SESSION_KEY)
      } else {
        encrypted = FALLBACK_STORE.value[SESSION_KEY] || null
      }

      if (!encrypted) return null

      const data = decrypt(encrypted)
      if (!data || data.expiresAt < Date.now()) {
        clearSession()
        return null
      }
      return data
    } catch (e) {
      console.error('Session load failed', e)
      return null
    }
  }

  const clearSession = () => {
    if (isLocalStorageAvailable) {
      localStorage.removeItem(SESSION_KEY)
    } else {
      delete FALLBACK_STORE.value[SESSION_KEY]
    }
  }

  // Sync across tabs
  if (isLocalStorageAvailable) {
    window.addEventListener('storage', (event) => {
      if (event.key === SESSION_KEY) {
        sessionData.value = loadSession()
      }
    })
  }

  return {
    isLocalStorageAvailable,
    sessionData,
    saveSession,
    loadSession,
    clearSession
  }
}
