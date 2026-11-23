// Consignes périmées : un fichier d'instructions qui décrit un code disparu est suivi par l'agent
// plutôt que le code (90 % des choix dans Xu et Wu, 2026). On signale les chemins cités qui n'existent plus.

const PATH = /`((?:src|app|supabase|locales|assets|store|e2e|scripts)\/[^`\s]+)`/g
/** Exemples génériques et motifs : ni à vérifier ni à signaler. */
const PLACEHOLDER = /[<>*{}]|\.\.\.|\/x\/|XScreen|\bnom\b|<x>/

/** Chemins cités entre accents graves qui n'existent pas (`exists` reçoit le chemin relatif à l'app, sans / final). */
export function staleReferences(text: string, exists: (path: string) => boolean): string[] {
  const missing = new Set<string>()
  for (const match of text.matchAll(PATH)) {
    const path = match[1]!.replace(/[.,;:)]+$/, '').replace(/\/$/, '')
    if (PLACEHOLDER.test(path)) continue
    if (!exists(path)) missing.add(path)
  }
  return [...missing]
}
