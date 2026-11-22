import * as Sentry from '@sentry/react-native'

import crashPlugin from '../plugin'
import { crashReportsEnabled, initCrash, reportError, setCrashReportsEnabled } from '../sentry'

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
  expoRouterIntegration: jest.fn(() => ({ name: 'ExpoRouter' })),
}))
jest.mock('expo', () => ({ isRunningInExpoGo: () => false }))

const config = { organization: '', project: '', url: 'https://sentry.io/', tracesSampleRate: 0.1, sendDefaultPii: false, enableInDev: false }

describe('module crash', () => {
  const env = process.env.EXPO_PUBLIC_SENTRY_DSN
  afterEach(() => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = env
    jest.clearAllMocks()
  })

  it('ne démarre pas sans DSN et ne signale rien', () => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    initCrash(config)
    reportError(new Error('x'))
    expect(Sentry.init).not.toHaveBeenCalled()
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('démarre avec le DSN, sans données personnelles, et respecte le choix de l’utilisateur', () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://cle@o1.ingest.sentry.io/2'
    initCrash(config)
    const options = (Sentry.init as jest.Mock).mock.calls[0][0]
    expect(options.sendDefaultPii).toBe(false)
    expect(options.environment).toBe('development')
    const event = { message: 'boom' }
    expect(crashReportsEnabled()).toBe(true)
    expect(options.beforeSend(event)).toBe(event)
    setCrashReportsEnabled(false)
    expect(options.beforeSend(event)).toBeNull()
    setCrashReportsEnabled(true)
    reportError(new Error('y'), { feature: 'checkout' })
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), { extra: { feature: 'checkout' } })
  })

  it('n’ajoute le plugin Sentry (source maps) qu’avec organisation et projet', () => {
    expect(crashPlugin({ name: 'a', slug: 'a' }, {}).plugins).toBeUndefined()
    const out = crashPlugin({ name: 'a', slug: 'a', plugins: ['expo-router'] }, { organization: 'org', project: 'app' })
    expect(out.plugins).toEqual(['expo-router', ['@sentry/react-native/expo', { organization: 'org', project: 'app', url: 'https://sentry.io/' }]])
  })
})
