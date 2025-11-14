const FALLBACK_BASE_URL = 'http://localhost:3000/'

declare global {
  interface Window {
    __APP_BASE_URL__?: string
  }
}

type EnvRecord = Record<string, string | undefined>

function readEnv(): EnvRecord {
  if (typeof process !== 'undefined' && process.env) {
    return process.env as EnvRecord
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env as EnvRecord
  }

  return {}
}

function normalizeBaseUrl(value: string | undefined | null) {
  if (!value) {
    return FALLBACK_BASE_URL
  }

  const trimmed = value.replace(/\/+$/, '')
  return `${trimmed || FALLBACK_BASE_URL.replace(/\/+$/, '')}/`
}

function isDevelopmentEnv(env: EnvRecord = readEnv()) {
  const mode =
    env.NODE_ENV ||
    env.MODE ||
    env.VITE_NODE_ENV ||
    env.VITE_MODE ||
    env.APP_ENV ||
    env.ENVIRONMENT

  if (typeof mode === 'string' && mode.toLowerCase() === 'development') {
    return true
  }

  const devFlag = env.DEV ?? env.VITE_DEV
  if (typeof devFlag === 'string') {
    return devFlag.toLowerCase() === 'true'
  }

  return false
}

export function resolveAppBaseUrl() {
  if (typeof window !== 'undefined') {
    const clientBase =
      (window as { __APP_BASE_URL__?: string }).__APP_BASE_URL__ ||
      window.location?.origin

    if (clientBase) {
      return normalizeBaseUrl(clientBase)
    }
  }

  const env = readEnv()

  const explicit =
    env.MCP_WIDGET_BASE_URL ||
    env.PUBLIC_BASE_URL ||
    env.VITE_PUBLIC_BASE_URL ||
    env.VITE_APP_BASE_URL

  if (explicit) {
    return normalizeBaseUrl(explicit)
  }

  if (isDevelopmentEnv(env)) {
    return normalizeBaseUrl(FALLBACK_BASE_URL)
  }

  const vercelHost =
    env.VERCEL_ENV === 'production'
      ? env.VERCEL_PROJECT_PRODUCTION_URL
      : env.VERCEL_BRANCH_URL || env.VERCEL_URL

  if (vercelHost) {
    const hasProtocol = /^https?:\/\//i.test(vercelHost)
    return normalizeBaseUrl(hasProtocol ? vercelHost : `https://${vercelHost}`)
  }

  return normalizeBaseUrl(env.HOST ?? env.URL ?? FALLBACK_BASE_URL)
}
