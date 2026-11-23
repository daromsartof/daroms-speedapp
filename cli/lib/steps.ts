// Parcours /daroms-pilot : état des étapes (app.steps.json), lu et mis à jour par la CLI.
// Les validations viennent de l'utilisateur (hook daroms-steps sur /daroms-valider, ou `steps validate` au terminal).
/** `observe` : question dont l'utilisateur tape la réponse avec /daroms-valider (une observation, pas un simple oui). */
export type StepDef = { id: string; title: string; goal: string; skills: string[]; deliverables: string[]; checks: string[]; observe?: string }
export type StepsDefs = { steps: StepDef[]; free: string[] }
export type StepStatus = 'todo' | 'doing' | 'review' | 'changes' | 'done' | 'skipped'
export type StepEntry = { status: StepStatus; summary?: string; note?: string; history?: { status: StepStatus; at: string; by: string; note?: string }[] }
export type StepsState = { version: 1; started: string; steps: Record<string, StepEntry> }

export const STATE_FILE = 'app.steps.json'
export const LABELS: Record<StepStatus, string> = { todo: 'à faire', doing: 'en cours', review: 'à valider', changes: 'à corriger', done: 'validée', skipped: 'sautée' }
const CLOSED: StepStatus[] = ['done', 'skipped']

export const statusOf = (state: StepsState, id: string): StepStatus => state.steps[id]?.status ?? 'todo'

/** Index de la première étape ni validée ni sautée ; undefined quand le parcours est terminé. */
export function currentIndex(defs: StepsDefs, state: StepsState): number | undefined {
  const i = defs.steps.findIndex((s) => !CLOSED.includes(statusOf(state, s.id)))
  return i === -1 ? undefined : i
}

export function startState(at: string): StepsState {
  return { version: 1, started: at, steps: {} }
}

/** Étape désignée par son numéro (1..n) ou son id. */
export function findStep(defs: StepsDefs, ref: string): number {
  const n = Number(ref)
  const i = Number.isInteger(n) ? n - 1 : defs.steps.findIndex((s) => s.id === ref)
  if (i < 0 || i >= defs.steps.length) throw new Error(`étape inconnue : ${ref} (1 à ${defs.steps.length} ou ${defs.steps.map((s) => s.id).join(', ')})`)
  return i
}

function push(state: StepsState, id: string, status: StepStatus, by: string, at: string, note?: string) {
  const entry = (state.steps[id] ??= { status })
  entry.status = status
  ;(entry.history ??= []).push({ status, at, by, ...(note ? { note } : {}) })
  if (note) entry.note = note
}

/** L'agent déclare l'étape en cours terminée : elle attend la validation de l'utilisateur. */
export function markReady(defs: StepsDefs, state: StepsState, ref: string, summary: string, at: string): StepsState {
  const i = findStep(defs, ref)
  const current = currentIndex(defs, state)
  if (current !== i) throw new Error(current === undefined ? 'parcours terminé' : `l'étape en cours est la ${current + 1} (${defs.steps[current]!.title})`)
  const id = defs.steps[i]!.id
  push(state, id, 'review', 'agent', at)
  state.steps[id]!.summary = summary
  return state
}

/** Repart d'une étape : elle et les suivantes redeviennent à faire. */
export function resetFrom(defs: StepsDefs, state: StepsState, ref: string, at: string): StepsState {
  const i = findStep(defs, ref)
  for (const step of defs.steps.slice(i)) if (state.steps[step.id]) push(state, step.id, 'todo', 'reset', at)
  return state
}

/** Validation au terminal par un humain (le hook fait de même pour /daroms-valider). */
export function validate(defs: StepsDefs, state: StepsState, ref: string, at: string, note?: string): StepsState {
  const i = findStep(defs, ref)
  if (currentIndex(defs, state) !== i) throw new Error('seule l\'étape en cours se valide')
  const question = defs.steps[i]!.observe
  if (question && !note?.trim()) throw new Error(`réponse attendue : ${question}`)
  push(state, defs.steps[i]!.id, 'done', 'utilisateur (terminal)', at, note)
  return state
}

/** Tableau d'état, une ligne par étape, l'étape en cours marquée. */
export function renderStatus(defs: StepsDefs, state: StepsState): string[] {
  const current = currentIndex(defs, state)
  return defs.steps.map((s, i) => {
    const entry = state.steps[s.id]
    const last = entry?.history?.at(-1)
    const when = entry && last && ['done', 'skipped', 'changes'].includes(entry.status) ? ` (${last.at.slice(0, 10)}${entry.note ? ` : ${entry.note}` : ''})` : ''
    return `${i === current ? '>' : ' '} ${String(i + 1).padStart(2)}. ${s.title.padEnd(26)} ${LABELS[statusOf(state, s.id)]}${when}`
  })
}

/** Fin d'étape à montrer à l'utilisateur : livrables, points à vérifier, commandes de validation. */
export function renderGate(defs: StepsDefs, index: number, summary?: string): string[] {
  const s = defs.steps[index]!
  return [
    `Étape ${index + 1} « ${s.title} »${summary ? ` : ${summary}` : ''}`,
    'Livrables :',
    ...s.deliverables.map((d) => `  - ${d}`),
    'À vérifier par vous :',
    ...s.checks.map((c) => `  [ ] ${c}`),
    ...(s.observe ? [`Question : ${s.observe}`] : []),
    `Tapez ${s.observe ? '/daroms-valider <votre réponse>' : '/daroms-valider'} pour passer à la suite, /daroms-corriger <consigne> pour une correction, ou /daroms-valider passer : <raison> pour sauter l'étape.`,
  ]
}
