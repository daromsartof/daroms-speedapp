// Analyse minimale des arguments : positionnels, --cle valeur, --cle=valeur, --drapeau.
export type Args = { _: string[]; flags: Record<string, string | boolean> }

export function parseArgs(argv: string[]): Args {
  const out: Args = { _: [], flags: {} }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (!arg.startsWith('--')) {
      out._.push(arg)
      continue
    }
    const [key, inline] = arg.slice(2).split('=', 2) as [string, string | undefined]
    if (inline !== undefined) out.flags[key] = inline
    else if (argv[i + 1] && !argv[i + 1]!.startsWith('--')) out.flags[key] = argv[++i]!
    else out.flags[key] = true
  }
  return out
}

export function flag(args: Args, name: string): string | undefined {
  const value = args.flags[name]
  return typeof value === 'string' ? value : undefined
}

export function bool(args: Args, name: string): boolean {
  return args.flags[name] === true || args.flags[name] === 'true'
}
