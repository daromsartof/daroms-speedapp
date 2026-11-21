// Page de composition de la vidéo promo : `window.renderAt(t)` dessine l'image de l'instant t (secondes),
// sans animation CSS ni horloge, donc rendu image par image reproductible.
import type { Layout, Segment } from './promo'

export type PageData = {
  layout: Layout
  colors: Record<string, string>
  overshoot: number
  radius: number
  segments: Segment[]
  duration: number
  name: string
  icon: string
  hook: string
  end: string
  scenes: { img: string; caption: string }[]
  fonts: { medium?: string; bold?: string }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const words = (s: string) => s.split(/\s+/).filter(Boolean).map((w) => `<span class="w"><span class="i">${esc(w)}</span></span>`).join(' ')

export function promoPage(d: PageData): string {
  const { layout: L, colors: C } = d
  const bezel = Math.round(L.phone.w * 0.028)
  const screenRadius = Math.round(L.phone.w * 0.11)
  const iconSize = Math.round(Math.min(L.w, L.h) * 0.2)
  const font = (weight: number, src?: string) => (src ? `@font-face{font-family:P;font-weight:${weight};src:url(${src}) format('opentype')}` : '')
  const captions = d.scenes
    .map((s, i) => `<div class="cap" id="cap${i}"><div class="lab"><span class="w"><span class="i">${String(i + 1).padStart(2, '0')}</span></span></div><div class="txt">${words(s.caption)}</div><div class="bar"></div></div>`)
    .join('')
  const shots = d.scenes.map((s, i) => `<img class="shot" id="shot${i}" src="${s.img}" alt="">`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${font(500, d.fonts.medium)}${font(700, d.fonts.bold)}
*{box-sizing:border-box;margin:0}
html,body{width:${L.w}px;height:${L.h}px;overflow:hidden;background:${C.bg};font-family:P,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.abs{position:absolute}
#panel{left:${L.panel.x}px;top:${L.panel.y}px;width:${L.panel.w}px;height:${L.panel.h}px;background:${C.panel}}
.w{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;margin-bottom:-.08em}
.i{display:inline-block}
#hook,#end{left:0;top:0;width:${L.w}px;height:${L.h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.icon{width:${iconSize}px;height:${iconSize}px;border-radius:${Math.round(iconSize * 0.225)}px}
.name{font-weight:700;font-size:${Math.round(L.caption.size * 1.05)}px;letter-spacing:-.02em;margin-top:${Math.round(iconSize * 0.22)}px}
.line{font-weight:500;font-size:${Math.round(L.caption.size * 0.6)}px;margin-top:${Math.round(L.caption.size * 0.3)}px;max-width:${Math.round(L.w * 0.8)}px}
#hook .name{color:${C.ink}} #hook .line{color:${C.muted}}
#end .name{color:${C.onPanel}} #end .line{color:${C.onPanel};opacity:.86}
#phone{left:${L.phone.x - bezel}px;top:${L.phone.y - bezel}px;width:${L.phone.w + bezel * 2}px;height:${L.phone.h + bezel * 2}px;padding:${bezel}px;background:${C.bezel};border-radius:${screenRadius + bezel}px}
#screen{position:relative;width:100%;height:100%;overflow:hidden;border-radius:${screenRadius}px;background:${C.bg}}
.shot{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cap{position:absolute;left:${L.caption.x}px;top:${L.caption.y}px;width:${L.caption.w}px}
.lab{font-weight:700;font-size:${Math.round(L.caption.size * 0.36)}px;color:${C.label};letter-spacing:.04em;margin-bottom:${Math.round(L.caption.size * 0.28)}px}
.txt{font-weight:700;font-size:${L.caption.size}px;line-height:1.04;letter-spacing:-.025em;color:${C.ink}}
.bar{height:${Math.round(L.caption.size * 0.12)}px;width:${Math.round(L.caption.size * 1.6)}px;background:${C.accent};margin-top:${Math.round(L.caption.size * 0.4)}px;border-radius:${d.radius}px;transform-origin:left}
</style></head><body>
<div class="abs" id="panel"></div>
<div class="abs" id="phone"><div id="screen">${shots}</div></div>
${captions}
<div class="abs" id="hook"><img class="icon" src="${d.icon}" alt=""><div class="name"><span class="w"><span class="i">${esc(d.name)}</span></span></div><div class="line">${words(d.hook)}</div></div>
<div class="abs" id="end"><img class="icon" src="${d.icon}" alt=""><div class="name"><span class="w"><span class="i">${esc(d.name)}</span></span></div><div class="line">${words(d.end)}</div></div>
<script>
const D = ${JSON.stringify({ L, segments: d.segments, overshoot: d.overshoot, n: d.scenes.length, T: 0.5 })};
const $ = (s) => document.querySelector(s), $$ = (s) => Array.from(document.querySelectorAll(s))
const clamp = (v) => Math.min(1, Math.max(0, v))
const p = (t, a, dur) => clamp((t - a) / dur)
const outCubic = (x) => 1 - Math.pow(1 - x, 3)
const inCubic = (x) => x * x * x
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const outBack = (x) => { const s = D.overshoot; if (!s) return 1 - Math.pow(1 - x, 5); return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2) }
const lerp = (a, b, x) => a + (b - a) * x
const seg = (kind, i = 0) => D.segments.find((s) => s.kind === kind && s.index === i)
// mots qui montent un à un depuis leur masque
function reveal(root, t, start, stagger = 0.05, dur = 0.45) {
  root.querySelectorAll('.i').forEach((el, k) => { el.style.transform = 'translateY(' + (1 - outCubic(p(t, start + k * stagger, dur))) * 110 + '%)' })
}
function fade(el, t, start, dur = 0.3, dy = -40) { const x = inCubic(p(t, start, dur)); el.style.opacity = 1 - x; el.style.transform = 'translateY(' + x * dy + 'px)' }
window.renderAt = (t) => {
  const { L } = D, hook = seg('hook'), end = seg('end'), first = seg('scene', 0)
  // accroche : icône avec rebond du ton, nom puis phrase
  const icon = $('#hook .icon'), ki = outBack(p(t, 0.05, 0.6))
  icon.style.transform = 'scale(' + lerp(0.6, 1, ki) + ')'; icon.style.opacity = clamp(ki * 2)
  reveal($('#hook .name'), t, 0.3); reveal($('#hook .line'), t, 0.5)
  const hookOut = inCubic(p(t, first.start - 0.15, 0.45))
  $('#hook').style.opacity = 1 - hookOut; $('#hook').style.transform = 'translateY(' + -120 * hookOut + 'px)'
  // aplat de marque : monte avec le premier écran, couvre tout à la fin
  const panelIn = outCubic(p(t, first.start - 0.1, 0.7)), grow = inOut(p(t, end.start, 0.7))
  const panel = $('#panel')
  panel.style.transform = 'translateY(' + (1 - panelIn) * (L.h - L.panel.y + 10) + 'px)'
  panel.style.left = lerp(L.panel.x, 0, grow) + 'px'; panel.style.top = lerp(L.panel.y, 0, grow) + 'px'
  panel.style.width = lerp(L.panel.w, L.w, grow) + 'px'; panel.style.height = lerp(L.panel.h, L.h, grow) + 'px'
  // téléphone : entre avec le rebond du ton, sort à la fin
  const phoneIn = outBack(p(t, first.start, 0.75)), phoneOut = inCubic(p(t, end.start, 0.55))
  const phone = $('#phone')
  phone.style.transform = 'translateY(' + ((1 - phoneIn) * (L.h - L.phone.y + 60) + phoneOut * (L.h - L.phone.y + 120)) + 'px)'
  // écrans : chacun glisse depuis la droite au début de son segment
  for (let i = 0; i < D.n; i++) {
    const s = seg('scene', i), next = seg(i + 1 < D.n ? 'scene' : 'end', i + 1 < D.n ? i + 1 : 0)
    const enter = i === 0 ? 1 : inOut(p(t, s.start, D.T)), leave = i + 1 < D.n ? inOut(p(t, next.start, D.T)) : 0
    const shot = $('#shot' + i)
    shot.style.transform = 'translateX(' + ((1 - enter) * 100 - leave * 28) + '%)'
    shot.style.zIndex = i
    shot.style.visibility = t >= s.start - 0.01 || i === 0 ? 'visible' : 'hidden'
    const cap = $('#cap' + i)
    const shown = t >= s.start - 0.01 && t < next.start + 0.1
    cap.style.visibility = shown ? 'visible' : 'hidden'
    if (!shown) continue
    reveal(cap.querySelector('.lab'), t, s.start + 0.12, 0, 0.4); reveal(cap.querySelector('.txt'), t, s.start + 0.2)
    cap.querySelector('.bar').style.transform = 'scaleX(' + outCubic(p(t, s.start + 0.45, 0.5)) + ')'
    // l'ancienne légende part avant que la suivante n'arrive : jamais deux légendes à la fois
    fade(cap, t, next.start - 0.25)
  }
  // carte de fin
  const endIcon = $('#end .icon'), ke = outBack(p(t, end.start + 0.35, 0.6))
  $('#end').style.visibility = t >= end.start ? 'visible' : 'hidden'
  endIcon.style.transform = 'scale(' + lerp(0.6, 1, ke) + ')'; endIcon.style.opacity = clamp(ke * 2)
  reveal($('#end .name'), t, end.start + 0.55); reveal($('#end .line'), t, end.start + 0.75)
}
Promise.all([document.fonts.ready, ...$$('img').map((img) => img.decode().catch(() => {}))]).then(() => { window.renderAt(0); window.__ready = true })
</script></body></html>`
}
