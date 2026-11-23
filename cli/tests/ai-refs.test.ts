import { describe, expect, it } from 'bun:test'

import { staleReferences } from '../lib/ai-refs'

describe('consignes périmées', () => {
  it('signale les chemins cités qui n’existent plus, pas les exemples génériques', () => {
    const text = [
      'Le panier vit dans `src/features/cart/api.ts` et `src/features/basket/hooks.ts`.',
      'Routes : `app/(tabs)/index.tsx`, motif `src/features/<x>/api.ts`, `src/features/x/XScreen.tsx`, `src/**/*.ts`.',
      'Dossier `supabase/migrations/`.',
    ].join('\n')
    const present = new Set(['src/features/cart/api.ts', 'app/(tabs)/index.tsx', 'supabase/migrations'])
    expect(staleReferences(text, (p) => present.has(p))).toEqual(['src/features/basket/hooks.ts'])
  })
})
