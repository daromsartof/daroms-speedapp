// Gates : un module peut exiger une redirection (onboarding, connexion, paywall bloquant).
// Chaque gate déclare une priorité ; seule la plus prioritaire non satisfaite redirige.
import { usePathname, useRouter, type Href } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type GateState = {
  /** false tant que l'état n'est pas connu (session, stockage...) : le splash reste affiché. */
  ready: boolean
  /** Route où envoyer l'utilisateur, ou null si la gate est satisfaite. */
  redirect: Href | null
  /** Chemins où la gate n'intervient pas (écrans de la gate elle-même). */
  allow: string[]
}

type Entry = GateState & { priority: number }
type Report = (slug: string, priority: number, state: GateState) => void

const GatesContext = createContext<Report>(() => undefined)

/** À appeler dans le Provider d'un module pour déclarer sa gate. */
export function useGate(slug: string, priority: number, state: GateState) {
  const report = useContext(GatesContext)
  const key = JSON.stringify(state)
  useEffect(() => {
    report(slug, priority, state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, slug, priority, key])
}

export function GateKeeper({ expected, children }: { expected: string[]; children: ReactNode }) {
  const [gates, setGates] = useState<Record<string, Entry>>({})
  const report = useCallback<Report>((slug, priority, state) => setGates((prev) => ({ ...prev, [slug]: { ...state, priority } })), [])
  const pathname = usePathname()
  const router = useRouter()
  const ready = expected.every((slug) => gates[slug]?.ready)
  const target = useMemo(() => {
    const active = Object.values(gates).sort((a, b) => a.priority - b.priority)
    const blocking = active.find((g) => g.redirect !== null)
    // écrans de développement (kitchen-sink) accessibles sans passer les gates
    if (__DEV__ && pathname.startsWith('/_dev')) return null
    if (!blocking || blocking.allow.some((path) => pathname.startsWith(path))) return null
    return blocking.redirect
  }, [gates, pathname])

  useEffect(() => {
    if (!ready) return
    if (target) router.replace(target)
    void SplashScreen.hideAsync().catch(() => undefined)
  }, [ready, target, router])

  return <GatesContext.Provider value={report}>{children}</GatesContext.Provider>
}
