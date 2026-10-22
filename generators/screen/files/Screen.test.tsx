import { renderApp } from '@daroms/app/testing'
import { screen } from '@testing-library/react-native'

import fr from '~/locales/fr.json'
import config from '~/tamagui.config'

import {{Name}}Screen from './{{Name}}Screen'

// Données simulées : l'écran est testé sans réseau (les 4 états viennent de QueryView).
const mockQuery = { data: [] as unknown[], isPending: false, isRefetching: false, error: null as unknown, refetch: jest.fn() }
jest.mock('./api', () => ({ ...jest.requireActual('./api'), {{queryHook}}: () => mockQuery }))

describe('{{Name}}Screen', () => {
  it('affiche l état vide', async () => {
    await renderApp(<{{Name}}Screen />, { config, locales: { fr } })
    expect(await screen.findByText(fr.{{key}}.emptyTitle)).toBeTruthy()
  })

  it('affiche l erreur avec réessayer', async () => {
    mockQuery.error = { messageKey: 'daroms:errors.network' }
    await renderApp(<{{Name}}Screen />, { config, locales: { fr } })
    expect(await screen.findByText('Réessayer')).toBeTruthy()
    mockQuery.error = null
  })
})
