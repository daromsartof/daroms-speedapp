---
name: daroms-design-system
description: Traduit les conseils des skills design (frontend-design, expo, React Native, ui-ux) vers @daroms/ui et les tokens Tamagui v3 - jamais de CSS, Tailwind, ni librairie tierce.
---

# daroms-design-system : interface entre conseils design et @daroms/ui

Quand un skill design propose une solution, la traduire ainsi :

| Conseil | Traduction daroms |
|---|---|
| Couleur, palette, Tailwind `bg-blue-500` | `brand.ts` (primary, accent) ; tokens `bg="card"`, `color="color-11"`, `brand-500` |
| Échelle d'espacement, marges | `p="gutter"`, `gap="section|stack|inline|tight"`, échelle 4 pt `"0".."96"` |
| Rayon, forme | `brand.radius` ; `rounded="card|button|chip|pill"` |
| Typographie, hiérarchie | `Title`, `Heading level`, `Body`, `Caption`, `tone` ; police via `brand.font` |
| Composant (carte, liste, modal, toast) | Composant du catalogue (`Card`, `List`, `Sheet`, `Dialog`, `notify`) |
| Ajuster un composant (marges, fond, rayon, bordure) | ses props de style avec tokens : `<ListItem py="tight" />`, `<Badge rounded="pill" />`, `<Sheet gap="section" />` |
| Icônes (SF Symbols, Material, Feather) | Lucide via `@daroms/ui/icons` (`bun daroms icons add`) |
| Animations CSS, Framer Motion | `transition` + valeurs `enter:`/`press:`, Reanimated pour le geste |
| États (hover, pressed, disabled) | `bg="card press:background-press"`, `opacity="1 disabled:0.5"` |
| Thème sombre | automatique via les clés de thème ; vérifier `bun daroms shot --dark` |
| Glassmorphism, ombres fortes, dégradés lourds | refuser sauf si le cahier l'exige ; `boxShadow="0 4px 12px shadow-3"` mesuré |
| « Plus beau », « plus moderne » | jamais tel quel (cela invite d'autres réglages par défaut) : une mesure de `daroms shot` à corriger, ou un motif d'une référence de `## Inspiration` |

Garder des skills design : la direction (hiérarchie, densité, rythme, un seul accent), pas l'implémentation.
