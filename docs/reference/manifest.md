# Manifest et marque

## `app.manifest.ts` (validé par zod, réécrit par la CLI)

| Champ | Type | Défaut |
|---|---|---|
| `name`, `slug`, `bundleId` | texte | requis |
| `version` | semver | `1.0.0` |
| `scheme` | texte | slug |
| `variant` | `blank|list-detail|social|tracker|ai-chat|shop` | `blank` |
| `locales`, `defaultLocale` | `fr|en|es|de|it|pt` | `['fr','en']`, `fr` |
| `orientation` | `portrait|landscape|default` | `portrait` |
| `screens` | features attendues (doctor) | `[]` |
| `tabs` | `{ name, icon, titleKey }[]` | `[]` |
| `modules` | `{ <slug>: config }` | `{}` |
| `monetization` | `{ model, entitlement, trialDays }` | `free` |
| `supabase.projectRef`, `eas.projectId`, `eas.owner` | texte | - |
| `store` | `{ category, supportEmail, privacyUrl, termsUrl }` | - |

Lecture au runtime : `getManifest()` (`@daroms/lib/manifest`).

## `brand.ts`

`primary`, `accent` (hex) · `font` (`inter|system`) · `radius` (`none|sm|md|lg|xl|full`) · `tone` (`playful|pro|minimal`).
