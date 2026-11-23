import { describe, expect, it } from 'bun:test'

import { frameDiffs, framesSheet, motionWindow, nearestPreset, previewVideo, sheetIndices, videoKind } from '../lib/motion'

const bytes = (...parts: (string | number[])[]) => new Uint8Array(parts.flatMap((p) => (typeof p === 'string' ? [...p].map((c) => c.charCodeAt(0)) : p)))

describe('références de mouvement', () => {
  it('reconnaît mp4, webm et gif à leurs premiers octets', () => {
    expect(videoKind(bytes([0, 0, 0, 24], 'ftypisom'))).toBe('mp4')
    expect(videoKind(bytes([0x1a, 0x45, 0xdf, 0xa3, 0, 0]))).toBe('webm')
    expect(videoKind(bytes('GIF89a'))).toBe('gif')
    expect(videoKind(bytes([0x89], 'PNG'))).toBeUndefined()
  })

  it('trouve la vidéo d’une page : og:video, puis <video> ou <source> vidéo', () => {
    const page = 'https://ex.com/shot/42'
    expect(previewVideo('<meta property="og:video" content="/v/a.mp4">', page)).toBe('https://ex.com/v/a.mp4')
    expect(previewVideo('<meta property="og:video:secure_url" content="https://cdn.ex.com/b.mp4"><meta property="og:video" content="/x.mp4">', page)).toBe('https://cdn.ex.com/b.mp4')
    expect(previewVideo('<video autoplay><source src="c.webm" type="video/webm"></video>', page)).toBe('https://ex.com/shot/c.webm')
    expect(previewVideo('<source src="d.vtt" type="text/vtt">', page)).toBeUndefined()
    expect(previewVideo('<meta property="og:video" content="javascript:alert(1)">', page)).toBeUndefined()
  })

  it('mesure la différence moyenne entre images successives', () => {
    const raw = new Uint8Array([0, 0, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0])
    expect(frameDiffs(raw, 4)).toEqual([0, 0.5, 0])
  })

  it('découpe la fenêtre de mouvement en phases et ignore un creux d’une ou deux images', () => {
    // 30 i/s : mouvement des images 3 à 8, arrêt, retour des images 15 à 17 avec un creux à 16
    const d = Array(24).fill(0)
    ;[3, 4, 5, 6, 7, 8].forEach((i, k) => (d[i] = 0.05 - k * 0.006))
    d[15] = 0.02
    d[17] = 0.02
    const w = motionWindow(d, 30)!
    expect(w.phases).toBe(2)
    expect(w.parts[0]).toEqual({ startMs: 67, endMs: 267, durationMs: 200 })
    expect(w.parts[1]).toEqual({ startMs: 467, endMs: 567, durationMs: 100 })
    expect(w.peakMs).toBe(100)
    expect(motionWindow(Array(10).fill(0.001), 30)).toBeUndefined()
  })

  it('traduit une durée mesurée vers le préréglage le plus proche', () => {
    const durations = { fast: 160, medium: 280, slow: 420 }
    expect(nearestPreset(200, durations)).toBe('fast')
    expect(nearestPreset(300, durations)).toBe('medium')
    expect(nearestPreset(900, durations)).toBe('slow')
  })

  it('choisit les images de la planche autour du mouvement, au plus max', () => {
    const w = { startMs: 1000, endMs: 1500, durationMs: 500, peakMs: 1100, phases: 1, parts: [] }
    expect(sheetIndices(90, 30, 48, w)).toEqual(Array.from({ length: 20 }, (_, i) => 28 + i))
    expect(sheetIndices(300, 30, 48)).toHaveLength(43)
    expect(sheetIndices(300, 30, 48).every((i) => i < 300)).toBe(true)
  })

  it('dessine une planche horodatée et surligne les phases', () => {
    const w = motionWindow([0, 0.05, 0.05, 0, 0], 10)!
    const svg = framesSheet([0, 1, 2, 3].map((i) => ({ href: 'data:,', ms: i * 100, diff: i === 1 ? 0.05 : 0 })), { w: 100, h: 200 }, 2, w)
    expect(svg).toContain('100 ms')
    expect(svg.match(/#FFF3D6/g)).toHaveLength(3)
    expect(svg).toContain('width="224"')
  })
})
