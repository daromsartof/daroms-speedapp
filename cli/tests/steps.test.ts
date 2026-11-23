import { describe, expect, it } from 'bun:test'

import defsJson from '../../_ai/context/daroms-steps.json'
import { currentIndex, findStep, markReady, renderGate, renderStatus, resetFrom, startState, validate, type StepsDefs } from '../lib/steps'

const defs = defsJson as unknown as StepsDefs
const at = '2026-11-22T10:00:00+00:00'

describe('parcours daroms-pilot', () => {
  it('commence à la première étape et la trouve par numéro ou par id', () => {
    const state = startState(at)
    expect(currentIndex(defs, state)).toBe(0)
    expect(findStep(defs, '3')).toBe(2)
    expect(findStep(defs, 'qualite')).toBe(4)
    expect(() => findStep(defs, '42')).toThrow('étape inconnue')
  })

  it('n accepte « prête à valider » que pour l étape en cours', () => {
    const state = startState(at)
    expect(() => markReady(defs, state, '2', 'design', at)).toThrow('étape en cours est la 1')
    markReady(defs, state, '1', 'cahier écrit', at)
    expect(state.steps.cadrage!.status).toBe('review')
    expect(currentIndex(defs, state)).toBe(0)
  })

  it('avance après validation et repart d une étape', () => {
    const state = startState(at)
    validate(defs, state, '1', at, '6 personnes')
    expect(() => validate(defs, state, '2', at)).toThrow('réponse attendue')
    validate(defs, state, '2', at, '2 appuis')
    expect(currentIndex(defs, state)).toBe(2)
    expect(renderStatus(defs, state)[2]!.startsWith('>')).toBe(true)
    resetFrom(defs, state, '2', at)
    expect(currentIndex(defs, state)).toBe(1)
  })

  it('montre les livrables, les points à vérifier et les commandes', () => {
    const gate = renderGate(defs, 0, 'cahier écrit').join('\n')
    expect(gate).toContain('À vérifier par vous')
    expect(gate).toContain('[ ]')
    expect(gate).toContain('/daroms-valider')
    expect(gate).toContain('/daroms-corriger')
    expect(gate).toContain('Question : Combien de personnes')
    expect(gate).toContain('/daroms-valider <votre réponse>')
  })

  it('pose une question d observation à chaque étape', () => {
    for (const step of defs.steps) expect(step.observe?.endsWith('?')).toBe(true)
  })

  it('chaque skill du parcours existe et n appartient qu à une étape', () => {
    const all = defs.steps.flatMap((s) => s.skills)
    expect(new Set(all).size).toBe(all.length)
    for (const skill of [...all, ...defs.free]) expect(Bun.file(`${import.meta.dir}/../../_ai/skills/${skill}/SKILL.md`).size).toBeGreaterThan(0)
  })
})
