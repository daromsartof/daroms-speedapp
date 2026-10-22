import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { getSupabase, isSupabaseConfigured } from './client'

type SessionState = { session: Session | null; user: User | null; loading: boolean }

const SessionContext = createContext<SessionState>({ session: null, user: null, loading: true })

/** Suit la session Supabase (connexion, déconnexion, rafraîchissement). */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ session: null, user: null, loading: isSupabaseConfigured() })

  useEffect(() => {
    if (!isSupabaseConfigured()) return undefined
    const auth = getSupabase().auth
    void auth.getSession().then(({ data }) => {
      setState({ session: data.session, user: data.session?.user ?? null, loading: false })
    })
    const { data } = auth.onAuthStateChange((_event, session) => {
      setState({ session, user: session?.user ?? null, loading: false })
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}

export function useUser() {
  return useContext(SessionContext).user
}
