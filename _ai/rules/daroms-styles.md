---
paths:
  - "src/**/*.tsx"
  - "app/**/*.tsx"
---
# Styles et UI (Tamagui v3)

> Composants @daroms/ui et tokens Tamagui v3 uniquement ; ni hex, ni nombre magique, ni StyleSheet, ni style inline.

- Lire `core/packages/ui/CATALOG.md` avant d'écrire une UI. Composer : `Screen`, `Header`, `Card`, `List`, `ListItem`, `Button`...
- Mise en page : `YStack`, `XStack` (exportés par `@daroms/ui`) avec `gap="stack"`, `p="gutter"`, `items="center"`, `justify="space-between"`, `flex={1}`.
- Tokens v3 sans `$` : espaces `gutter|section|stack|inline|tight` ou `0..96` ; rayons `button|input|card|sheet|chip|pill` ;
  couleurs `background`, `card`, `separator`, `color`, `color-1..11`, `brand-500`, `accent-500`, `red-500`.
- États dans la valeur : `bg="card press:background-press"`, `opacity="1 disabled:0.5"`, `scale="1 press:0.97"` + `transition="fast"`.
  Jamais `hoverStyle`, `pressStyle`, `$4`, `$color10` (syntaxe v2 morte).
- Sous-thème local : `<YStack theme="soft" bg="background">` ; `brand` pour un plein, `danger|success|warning` teintés.
- Texte : `Title`, `Heading level={1|2|3}`, `Body`, `Caption` avec `tone="muted|brand|danger|success"` ; tailles `size="1".."10"`.
- Icônes : `import { Plus } from '@daroms/ui/icons'` ; `<Plus size="5" color="color-9" />`. Icône absente : `bun daroms icons add Nom`.
- Composant d'app réutilisé : `src/features/<x>/components/` (ou `src/components/` si partagé), styled(YStack, {...}) avec tokens.
- Mode sombre automatique : n'utiliser que des clés de thème ; vérifier avec `bun daroms shot /route --dark`.
