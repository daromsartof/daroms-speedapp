import { fail } from './log'

export type RunOptions = { cwd?: string; env?: Record<string, string>; quiet?: boolean; allowFailure?: boolean }

/** Exécute une commande en héritant du terminal ; lève si elle échoue (sauf allowFailure). */
export async function run(cmd: string[], options: RunOptions = {}): Promise<number> {
  const proc = Bun.spawn(cmd, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdout: options.quiet ? 'ignore' : 'inherit',
    stderr: options.quiet ? 'ignore' : 'inherit',
    stdin: 'inherit',
  })
  const code = await proc.exited
  if (code !== 0 && !options.allowFailure) fail(`échec (${code}) : ${cmd.join(' ')}`)
  return code
}

/** Exécute et capture la sortie (stdout + stderr) sans l'afficher. */
export async function capture(cmd: string[], options: RunOptions = {}): Promise<{ code: number; out: string }> {
  const proc = Bun.spawn(cmd, { cwd: options.cwd, env: { ...process.env, ...options.env }, stdout: 'pipe', stderr: 'pipe' })
  const [out, err, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited])
  return { code, out: `${out}${err}` }
}

export function has(binary: string): boolean {
  return Bun.which(binary) !== null
}

/** Garde les N dernières lignes non vides (sortie économe pour Claude). */
export function tail(text: string, lines = 20): string {
  return text.split('\n').filter((l) => l.trim()).slice(-lines).join('\n')
}
