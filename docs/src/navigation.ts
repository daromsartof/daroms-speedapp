// Plan du site : source unique de la barre latérale et de l'ordre de llms.txt / llms-full.txt.
export type Section = {
  label: string
  /** Pages dans l'ordre (slug sans extension) ; `autogenerate` : dossier complet trié par `sidebar.order`. */
  items: (string | { label: string; autogenerate: string })[]
  /** Résumé de la section pour llms.txt. */
  summary: string
}

export const SECTIONS: Section[] = [
  {
    label: 'Démarrer',
    summary: 'Ce qu’est le framework, installation, tutoriel complet et arborescence d’une app.',
    items: ['demarrer/introduction', 'demarrer/installation', 'demarrer/tutoriel', 'demarrer/structure-app'],
  },
  {
    label: 'Guides',
    summary: 'Une tâche précise par page, commandes exactes et vérification.',
    items: [
      'guides/ajouter-un-ecran',
      'guides/ajouter-une-table',
      'guides/ajouter-un-module',
      'guides/formulaires',
      'guides/textes-et-langues',
      'guides/changer-la-marque',
      'guides/verifier',
      'guides/publier',
      'guides/mettre-a-jour-le-coeur',
      'guides/developper-le-coeur',
      'guides/depanner',
    ],
  },
  {
    label: 'Référence',
    summary: 'CLI, manifest, marque, composants, tokens, paquets, modules, variantes, règles, skills et hooks.',
    items: [
      'reference/cli',
      'reference/manifest',
      'reference/marque',
      'reference/composants',
      'reference/tokens',
      'reference/paquets',
      { label: 'Modules', autogenerate: 'reference/modules' },
      'reference/variantes',
      'reference/regles',
      'reference/skills',
      'reference/hooks',
    ],
  },
  {
    label: 'Explications',
    summary: 'Pourquoi le framework est construit ainsi : architecture, couche IA, sécurité des données, Tamagui v3.',
    items: ['explications/architecture', 'explications/couche-ia', 'explications/donnees-et-securite', 'explications/tamagui-v3'],
  },
  {
    label: 'Agents IA',
    summary: 'Comment un agent consomme cette documentation et travaille dans une app daroms.',
    items: ['agents/utiliser-avec-un-agent'],
  },
]

/** Barre latérale Starlight dérivée du plan. */
export function sidebar() {
  return SECTIONS.map((section) => ({
    label: section.label,
    items: section.items.map((item) =>
      typeof item === 'string'
        ? { slug: item }
        : { label: item.label, collapsed: true, items: [{ autogenerate: { directory: item.autogenerate } }] },
    ),
  }))
}
