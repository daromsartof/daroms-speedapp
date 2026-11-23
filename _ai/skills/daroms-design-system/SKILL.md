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
| Typographie, hiérarchie | `Title`, `Heading level`, `Body`, `Caption`, `tone` ; police du corps via `brand.font`, police des titres via `brand.direction` |
| Composant (carte, liste, modal, toast) | Composant du catalogue (`Card`, `List`, `Sheet`, `Dialog`, `notify`) |
| Ajuster un composant (marges, fond, rayon, bordure) | ses props de style avec tokens : `<ListItem py="tight" />`, `<Badge rounded="pill" />`, `<Sheet gap="section" />` |
| Icônes (SF Symbols, Material, Feather) | Lucide via `@daroms/ui/icons` (`bun daroms icons add`) |
| Animations CSS, Framer Motion | `transition` + valeurs `enter:`/`press:`, Reanimated pour le geste |
| États (hover, pressed, disabled) | `bg="card press:background-press"`, `opacity="1 disabled:0.5"` |
| Thème sombre | automatique via les clés de thème ; vérifier `bun daroms shot --dark` |
| Dégradé, fond vivant, hero | `brand.direction` (`soft`, `vivid`) : `Gradient kind="brand"` ou `kind="halo"` dans un parent `position="relative"`, `Hero`, bouton principal en dégradé automatique ; jamais de dégradé CSS (mesuré par `daroms shot`) |
| Illustration, image d'accueil, état vide dessiné | `Illustration name="..."` (scènes aux couleurs de la marque, animées) ; `EmptyState illustration`, `OnboardingPager` pages `illustration` |
| Ombre, relief, carte qui flotte | relief de la direction (`Card` : 0, 1 ou 2), ou `elevation` explicite ; glassmorphism refusé |
| Entrées animées, apparition en cascade | `Reveal` (enfants l'un après l'autre, coupé si « réduire les animations ») |
| « Plus beau », « plus moderne » | jamais tel quel (cela invite d'autres réglages par défaut) : une mesure de `daroms shot` à corriger, ou un motif d'une référence de `## Inspiration` |

Garder des skills design : la direction (hiérarchie, densité, rythme, un seul accent), pas l'implémentation.
