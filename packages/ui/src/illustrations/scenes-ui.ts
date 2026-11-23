// Scènes d'interface : accueil, progression, conversation, sécurité, état vide.
import { bar, brandGrad, card, check, dot, ground, softGrad, star, type IllustrationName, type Scene } from './shapes'

export const UI_SCENES: Record<Extract<IllustrationName, 'welcome' | 'growth' | 'chat' | 'secure' | 'empty'>, Scene> = {
  // accueil : écran de l'app posé, orbe de marque, puces flottantes
  welcome: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}${softGrad(`${id}s`, c.b1, c.card)}</defs>` +
    ground(c) +
    `<circle cx="232" cy="66" r="40" fill="url(#${id}g)"/>` +
    dot(232, 66, 40, c.card, 0.12) +
    card(88, 40, 144, 172, 24, c) +
    `<rect x="88" y="40" width="144" height="70" rx="24" fill="url(#${id}s)"/>` +
    dot(116, 70, 14, c.b3) +
    dot(116, 70, 7, c.b6) +
    bar(138, 62, 66, 7, c.b6, 0.9) +
    bar(138, 75, 44, 6, c.b4, 0.6) +
    bar(104, 128, 112, 8, c.line) +
    bar(104, 144, 84, 8, c.line) +
    `<rect x="104" y="170" width="112" height="26" rx="13" fill="url(#${id}g)"/>` +
    bar(138, 180, 44, 6, c.on, 0.9) +
    card(30, 112, 86, 38, 19, c) +
    dot(50, 131, 9, c.a4) +
    bar(65, 126, 38, 6, c.b5, 0.8) +
    bar(65, 137, 26, 5, c.line) +
    card(214, 150, 78, 34, 17, c) +
    check(236, 167, 7, c.b5, 3.5) +
    bar(252, 163, 28, 6, c.line) +
    star(60, 58, 9, c.a4) +
    star(282, 118, 6, c.b4) +
    dot(70, 190, 4, c.b3) +
    dot(276, 34, 3, c.a3),

  // progression : graphique qui monte, flèche, pièces
  growth: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}${softGrad(`${id}b`, c.b4, c.b6)}</defs>` +
    ground(c) +
    card(54, 46, 212, 166, 24, c) +
    bar(76, 68, 70, 8, c.b6, 0.85) +
    bar(76, 82, 46, 6, c.line) +
    [0, 1, 2, 3, 4].map((i) => {
      const h = [34, 52, 44, 74, 98][i]!
      const x = 84 + i * 34
      return `<rect x="${x}" y="${190 - h}" width="22" height="${h}" rx="8" fill="${i === 4 ? `url(#${id}g)` : c.b2}"/>`
    }).join('') +
    `<path d="M88 150 L130 128 L164 138 L206 104 L246 78" fill="none" stroke="${c.a4}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M232 74 L248 76 L244 92" fill="none" stroke="${c.a4}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
    dot(246, 78, 9, c.a4, 0.25) +
    `<circle cx="46" cy="166" r="22" fill="url(#${id}g)"/>` +
    `<circle cx="46" cy="166" r="14" fill="none" stroke="${c.on}" stroke-width="3" opacity="0.7"/>` +
    `<circle cx="62" cy="196" r="14" fill="${c.a3}"/>` +
    star(276, 42, 8, c.a4) +
    star(40, 66, 6, c.b4) +
    dot(284, 182, 4, c.b3),

  // conversation : bulle de l'utilisateur en dégradé, réponse, avatar
  chat: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}</defs>` +
    ground(c) +
    card(40, 50, 170, 74, 22, c) +
    bar(62, 72, 120, 8, c.line) +
    bar(62, 88, 92, 8, c.line) +
    bar(62, 104, 54, 8, c.b3) +
    `<path d="M58 124 L52 142 L76 124Z" fill="${c.card}"/>` +
    dot(36, 160, 18, c.b2) +
    dot(36, 156, 7, c.b6) +
    `<path d="M24 174 Q36 162 48 174" fill="${c.b6}"/>` +
    `<rect x="120" y="140" width="164" height="62" rx="22" fill="url(#${id}g)"/>` +
    `<path d="M262 202 L276 218 L250 202Z" fill="${c.g3}"/>` +
    bar(142, 160, 104, 8, c.on, 0.85) +
    bar(142, 176, 70, 8, c.on, 0.6) +
    card(214, 36, 70, 34, 17, c) +
    dot(234, 53, 4, c.b5) +
    dot(249, 53, 4, c.b4) +
    dot(264, 53, 4, c.b3) +
    star(288, 116, 9, c.a4) +
    star(108, 30, 6, c.b4) +
    dot(296, 160, 4, c.a3),

  // sécurité : bouclier en dégradé, coche, cadenas
  secure: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}${softGrad(`${id}h`, c.b1, c.b2)}</defs>` +
    ground(c) +
    `<circle cx="160" cy="118" r="88" fill="url(#${id}h)"/>` +
    `<circle cx="160" cy="118" r="62" fill="${c.card}" opacity="0.6"/>` +
    `<path d="M160 44 L216 64 V112 C216 152 190 176 160 190 C130 176 104 152 104 112 V64 Z" fill="${c.shadow}" opacity="0.08" transform="translate(0 8)"/>` +
    `<path d="M160 44 L216 64 V112 C216 152 190 176 160 190 C130 176 104 152 104 112 V64 Z" fill="url(#${id}g)"/>` +
    `<path d="M160 58 L204 74 V112 C204 144 184 164 160 176 Z" fill="${c.on}" opacity="0.14"/>` +
    check(160, 116, 22, c.on, 9) +
    card(232, 132, 58, 58, 18, c) +
    `<rect x="248" y="158" width="26" height="22" rx="6" fill="${c.a4}"/>` +
    `<path d="M253 158 V151 a8 8 0 0 1 16 0 V158" fill="none" stroke="${c.a5}" stroke-width="4"/>` +
    card(30, 86, 62, 30, 15, c) +
    dot(46, 101, 6, c.b5) +
    bar(58, 98, 24, 6, c.line) +
    star(78, 170, 8, c.a4) +
    star(250, 50, 7, c.b4) +
    dot(276, 92, 4, c.b3),

  // état vide : plateau ouvert, éléments en attente
  empty: (c, id) =>
    `<defs>${brandGrad(`${id}g`, c)}${softGrad(`${id}t`, c.b2, c.b3)}</defs>` +
    ground(c, 160, 230) +
    `<path d="M80 150 L110 112 H210 L240 150 V196 a14 14 0 0 1 -14 14 H94 a14 14 0 0 1 -14 -14 Z" fill="${c.shadow}" opacity="0.07" transform="translate(0 6)"/>` +
    `<path d="M80 150 L110 112 H210 L240 150 V196 a14 14 0 0 1 -14 14 H94 a14 14 0 0 1 -14 -14 Z" fill="url(#${id}t)"/>` +
    `<path d="M80 150 H124 a10 10 0 0 0 10 10 H186 a10 10 0 0 0 10 -10 H240 V196 a14 14 0 0 1 -14 14 H94 a14 14 0 0 1 -14 -14 Z" fill="${c.card}"/>` +
    card(118, 54, 84, 44, 14, c) +
    bar(132, 68, 44, 7, c.b5, 0.8) +
    bar(132, 81, 28, 6, c.line) +
    `<rect x="122" y="54" width="8" height="44" rx="4" fill="url(#${id}g)"/>` +
    `<circle cx="74" cy="80" r="16" fill="none" stroke="${c.b3}" stroke-width="3" stroke-dasharray="5 6"/>` +
    `<rect x="236" y="62" width="34" height="34" rx="10" fill="none" stroke="${c.a3}" stroke-width="3" stroke-dasharray="5 6"/>` +
    star(250, 136, 8, c.a4) +
    star(62, 126, 6, c.b4) +
    dot(160, 32, 4, c.b3),

}
