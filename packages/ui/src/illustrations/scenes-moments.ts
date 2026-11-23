// Scènes de moments : réussite, agenda, objectif, communauté, idée.
import { bar, brandGrad, card, check, dot, ground, star, type IllustrationName, type Scene } from './shapes'

export const MOMENT_SCENES: Record<Extract<IllustrationName, 'success' | 'calendar' | 'focus' | 'community' | 'spark'>, Scene> = {
  // réussite : grand badge en dégradé, coche, confettis
  success: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}</defs>` +
    ground(c, 160, 170) +
    `<circle cx="160" cy="114" r="84" fill="${c.b1}"/>` +
    `<circle cx="160" cy="120" r="56" fill="${c.shadow}" opacity="0.08"/>` +
    `<circle cx="160" cy="114" r="56" fill="url(#${id}g)"/>` +
    `<circle cx="160" cy="114" r="44" fill="none" stroke="${c.on}" stroke-width="3" opacity="0.35"/>` +
    check(160, 114, 22, c.on, 9) +
    `<rect x="62" y="56" width="14" height="6" rx="3" fill="${c.a4}" transform="rotate(-30 69 59)"/>` +
    `<rect x="246" y="70" width="16" height="6" rx="3" fill="${c.b4}" transform="rotate(35 254 73)"/>` +
    `<rect x="238" y="168" width="14" height="6" rx="3" fill="${c.a3}" transform="rotate(-20 245 171)"/>` +
    `<rect x="70" y="164" width="12" height="6" rx="3" fill="${c.b5}" transform="rotate(25 76 167)"/>` +
    dot(92, 40, 5, c.b3) +
    dot(228, 40, 4, c.a4) +
    dot(272, 124, 5, c.b2) +
    dot(48, 116, 4, c.a3) +
    star(256, 28, 9, c.a4) +
    star(54, 196, 7, c.b4),

  // agenda : calendrier, jour mis en avant, horloge
  calendar: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}</defs>` +
    ground(c) +
    card(60, 40, 176, 170, 24, c) +
    `<path d="M60 64 a24 24 0 0 1 24 -24 H212 a24 24 0 0 1 24 24 V78 H60 Z" fill="url(#${id}g)"/>` +
    bar(80, 54, 60, 8, c.on, 0.9) +
    [0, 1, 2, 3].map((row) =>
      [0, 1, 2, 3, 4].map((col) => {
        const x = 80 + col * 30
        const y = 96 + row * 28
        const on = row === 1 && col === 2
        return on ? `<rect x="${x - 2}" y="${y - 2}" width="24" height="22" rx="8" fill="${c.a4}"/>` : `<rect x="${x}" y="${y}" width="20" height="18" rx="6" fill="${row === 0 && col < 2 ? c.b2 : c.line}"/>`
      }).join(''),
    ).join('') +
    `<circle cx="244" cy="166" r="34" fill="${c.shadow}" opacity="0.08" transform="translate(0 6)"/>` +
    `<circle cx="244" cy="166" r="34" fill="${c.card}"/>` +
    `<circle cx="244" cy="166" r="26" fill="none" stroke="${c.b2}" stroke-width="5"/>` +
    `<path d="M244 166 V150 M244 166 L256 172" stroke="${c.b6}" stroke-width="5" stroke-linecap="round"/>` +
    star(46, 64, 8, c.a4) +
    star(276, 64, 6, c.b4) +
    dot(42, 160, 4, c.b3),

  // objectif : cible, flèche plantée
  focus: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}</defs>` +
    ground(c, 160, 190) +
    `<circle cx="150" cy="122" r="86" fill="${c.b1}"/>` +
    `<circle cx="150" cy="128" r="70" fill="${c.shadow}" opacity="0.07"/>` +
    `<circle cx="150" cy="122" r="70" fill="${c.card}"/>` +
    `<circle cx="150" cy="122" r="52" fill="${c.b2}"/>` +
    `<circle cx="150" cy="122" r="34" fill="${c.card}"/>` +
    `<circle cx="150" cy="122" r="18" fill="url(#${id}g)"/>` +
    `<path d="M150 122 L238 44" stroke="${c.b7}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M238 44 L232 26 L256 30 L250 50 Z" fill="${c.a4}"/>` +
    `<path d="M238 44 L258 50 L254 66 L236 58 Z" fill="${c.a3}"/>` +
    dot(150, 122, 5, c.on) +
    star(60, 58, 8, c.a4) +
    star(266, 150, 7, c.b4) +
    dot(254, 196, 4, c.b3),

  // communauté : trois avatars, cœur, réactions
  community: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}</defs>` +
    ground(c) +
    [
      { x: 104, fill: c.b2, face: c.b5 },
      { x: 216, fill: c.a2, face: c.a4 },
    ].map(({ x, fill, face }) => `<circle cx="${x}" cy="128" r="38" fill="${c.shadow}" opacity="0.07" transform="translate(0 6)"/><circle cx="${x}" cy="128" r="38" fill="${fill}"/><circle cx="${x}" cy="116" r="13" fill="${face}"/><path d="M${x - 22} 154 Q${x} 128 ${x + 22} 154" fill="${face}"/>`).join('') +
    `<circle cx="160" cy="112" r="50" fill="${c.shadow}" opacity="0.08" transform="translate(0 6)"/>` +
    `<circle cx="160" cy="112" r="50" fill="url(#${id}g)"/>` +
    `<circle cx="160" cy="98" r="17" fill="${c.on}" opacity="0.95"/>` +
    `<path d="M130 146 Q160 112 190 146" fill="${c.on}" opacity="0.95"/>` +
    card(214, 40, 74, 34, 17, c) +
    `<path d="M236 52 a5 5 0 0 1 9 -2 a5 5 0 0 1 9 2 c0 6 -9 11 -9 11 s-9 -5 -9 -11Z" fill="${c.a4}"/>` +
    bar(258, 54, 20, 6, c.line) +
    card(34, 52, 62, 30, 15, c) +
    star(52, 67, 6, c.b5) +
    bar(64, 64, 22, 6, c.line) +
    star(270, 186, 8, c.a4) +
    dot(50, 186, 4, c.b3),

  // idée : étincelle centrale en dégradé, rayons, petites étoiles
  spark: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}</defs>` +
    ground(c, 160, 160) +
    `<circle cx="160" cy="112" r="80" fill="${c.b1}"/>` +
    [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="157" y="20" width="6" height="22" rx="3" fill="${a % 90 === 0 ? c.b4 : c.a3}" transform="rotate(${a} 160 112)"/>`).join('') +
    `<g transform="translate(0 6)" opacity="0.08">${star(160, 112, 56, c.shadow)}</g>` +
    star(160, 112, 56, `url(#${id}g)`) +
    star(160, 112, 18, c.on) +
    star(236, 58, 14, c.a4) +
    star(82, 172, 10, c.b5) +
    star(250, 176, 7, c.b3) +
    dot(84, 62, 5, c.a3),
}
