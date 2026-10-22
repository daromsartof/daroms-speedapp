// Sortie courte et lisible (peu de tokens quand Claude lit la sortie).
const tty = process.stdout.isTTY
const paint = (code: number) => (text: string) => (tty ? `\x1b[${code}m${text}\x1b[0m` : text)

export const color = { green: paint(32), red: paint(31), yellow: paint(33), dim: paint(2), bold: paint(1), cyan: paint(36) }

export const log = {
  step: (text: string) => console.log(`${color.cyan('›')} ${text}`),
  ok: (text: string) => console.log(`${color.green('✓')} ${text}`),
  warn: (text: string) => console.log(`${color.yellow('!')} ${text}`),
  fail: (text: string) => console.error(`${color.red('✗')} ${text}`),
  info: (text: string) => console.log(color.dim(text)),
}

export class CliError extends Error {}

export function fail(message: string): never {
  throw new CliError(message)
}
