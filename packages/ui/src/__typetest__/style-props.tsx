// Vérifié par tsc : les composants acceptent les props de style à tokens, pas les autres props de conteneur.
import { Badge, Header, IconButton, ListItem, Screen, type StyleProps } from '../index'
import { Plus } from '../icons'

export const ok = (
  <Screen gap="section" px="section">
    <Header title="Titre" borderBottomWidth={1} borderColor="separator" right={<IconButton icon={Plus} label="Ajouter" onPress={() => {}} />} />
    <ListItem title="Élément" py="tight" bg="card press:background-press" />
    <Badge rounded="pill" px="3">
      Nouveau
    </Badge>
  </Screen>
)

// @ts-expect-error le rôle reste celui du composant
export const role = <ListItem title="Élément" role="link" />

// Les couleurs hex et nombres magiques sont refusés par ESLint et le hook daroms-check-rules, pas par les types.

// @ts-expect-error pas de gestionnaire dans les props de style
export const handler: StyleProps = { onPress: () => {} }
