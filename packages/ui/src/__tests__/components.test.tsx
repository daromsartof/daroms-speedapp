import { fireEvent, screen } from '@testing-library/react-native'

import { Plus } from '../icons'
import { Badge, Body, Button, EmptyState, ErrorState, ListItem, ProgressBar, QueryView, SegmentedControl, Title } from '../index'
import { renderUI } from '../testing/render'

describe('@daroms/ui', () => {
  it('Button appelle onPress et se bloque pendant le chargement', async () => {
    const onPress = jest.fn()
    const { rerender } = await renderUI(<Button icon={Plus} onPress={onPress}>Ajouter</Button>)
    await fireEvent.press(screen.getByText('Ajouter'))
    expect(onPress).toHaveBeenCalledTimes(1)
    await rerender(<Button loading onPress={onPress}>Ajouter</Button>)
  })

  it('EmptyState et ErrorState affichent les textes par défaut du cœur', async () => {
    await renderUI(<EmptyState />)
    expect(screen.getByText('Rien pour le moment')).toBeTruthy()
    const onRetry = jest.fn()
    await renderUI(<ErrorState error={{ messageKey: 'daroms:errors.network' }} onRetry={onRetry} />)
    expect(screen.getByText('Connexion impossible. Vérifiez votre réseau.')).toBeTruthy()
    await fireEvent.press(screen.getByText('Réessayer'))
    expect(onRetry).toHaveBeenCalled()
  })

  it('QueryView gère chargement, erreur, vide et données', async () => {
    const base = { refetch: jest.fn(), error: null, isPending: false }
    await renderUI(<QueryView query={{ ...base, data: [] as string[] }}>{(d) => <Body>{d.join(',')}</Body>}</QueryView>)
    expect(screen.getByText('Rien pour le moment')).toBeTruthy()
    await renderUI(<QueryView query={{ ...base, data: ['a', 'b'] }}>{(d) => <Body>{d.join(',')}</Body>}</QueryView>)
    expect(screen.getByText('a,b')).toBeTruthy()
  })

  it('SegmentedControl change de valeur', async () => {
    const onChange = jest.fn()
    await renderUI(<SegmentedControl options={[{ value: 'a', label: 'Jour' }, { value: 'b', label: 'Semaine' }]} value="a" onChange={onChange} />)
    await fireEvent.press(screen.getByText('Semaine'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('rend les composants d affichage', async () => {
    await renderUI(
      <>
        <Title>Titre</Title>
        <Badge tone="success">Payé</Badge>
        <ListItem title="Élément" subtitle="détail" chevron onPress={() => undefined} />
        <ProgressBar value={0.4} />
      </>,
    )
    expect(screen.getByText('Titre')).toBeTruthy()
    expect(screen.getByLabelText('Progression 40 pour cent')).toBeTruthy()
  })
})
