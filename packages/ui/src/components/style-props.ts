import type { StackNonStyleProps, YStackProps } from 'tamagui'

/**
 * Props de style Tamagui acceptées sur le conteneur d'un composant : tokens et valeurs conditionnelles
 * (`<ListItem py="tight" bg="card press:background-press" />`). Ni gestionnaire, ni rôle, ni enfants :
 * les props du composant restent maîtresses. Placées après les valeurs par défaut, elles les remplacent.
 */
export type StyleProps = Omit<YStackProps, keyof StackNonStyleProps>
