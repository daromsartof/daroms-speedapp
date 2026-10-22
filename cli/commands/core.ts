import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { bool, type Args } from '../lib/args'
import { capture, run } from '../lib/exec'
import { readJson, writeJson } from '../lib/fsx'
import { color, fail, log } from '../lib/log'
import { CORE_DIR } from '../lib/paths'

type Bump = 'patch' | 'minor' | 'major'

export function bumpVersion(version: string, bump: Bump): string {
  const [major = 0, minor = 0, patch = 0] = version.trim().split('.').map(Number)
  if (bump === 'major') return `${major + 1}.0.0`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

const SECTIONS: [RegExp, string][] = [
  [/^feat/, 'Nouveautés'],
  [/^fix/, 'Corrections'],
  [/^(perf|refactor)/, 'Améliorations'],
  [/^(docs)/, 'Documentation'],
]

/** Regroupe des sujets de commits conventionnels en sections de changelog. */
export function changelogSection(version: string, date: string, subjects: string[]): string {
  const groups = new Map<string, string[]>()
  for (const subject of subjects) {
    const title = SECTIONS.find(([re]) => re.test(subject))?.[1] ?? 'Divers'
    groups.set(title, [...(groups.get(title) ?? []), subject.replace(/^\w+(\([^)]*\))?!?:\s*/, '')])
  }
  const body = [...groups].map(([title, items]) => `### ${title}\n${items.map((i) => `- ${i}`).join('\n')}`).join('\n\n')
  return `## v${version} (${date})\n\n${body || '- Maintenance'}\n`
}

function setPackageVersions(version: string) {
  const files = [join(CORE_DIR, 'package.json')]
  for (const group of ['packages', 'modules']) {
    const dir = join(CORE_DIR, group)
    if (existsSync(dir)) for (const name of readdirSync(dir)) files.push(join(dir, name, 'package.json'))
  }
  for (const file of files.filter(existsSync)) writeJson(file, { ...readJson<Record<string, unknown>>(file), version })
}

/** release-core <patch|minor|major> [--dry] : version, changelog, commit et tag du cœur. */
export async function releaseCore(args: Args) {
  const bump = (args._[0] ?? 'patch') as Bump
  if (!['patch', 'minor', 'major'].includes(bump)) fail('usage : daroms release-core <patch|minor|major>')
  const status = await capture(['git', '-C', CORE_DIR, 'status', '--porcelain'])
  if (status.out.trim() && !bool(args, 'dry')) fail('arbre git du cœur non propre : committer avant de publier')
  const current = readFileSync(join(CORE_DIR, 'VERSION'), 'utf8').trim()
  const next = bumpVersion(current, bump)
  const lastTag = await capture(['git', '-C', CORE_DIR, 'describe', '--tags', '--abbrev=0'])
  const range = lastTag.code === 0 ? `${lastTag.out.trim()}..HEAD` : 'HEAD'
  const log_ = await capture(['git', '-C', CORE_DIR, 'log', range, '--pretty=format:%s'])
  const subjects = log_.out.split('\n').filter((s) => s && !s.startsWith('chore(release)'))
  const section = changelogSection(next, new Date().toISOString().slice(0, 10), subjects)
  if (bool(args, 'dry')) return console.log(`${current} -> ${next}\n\n${section}`)

  writeFileSync(join(CORE_DIR, 'VERSION'), `${next}\n`)
  setPackageVersions(next)
  const changelog = join(CORE_DIR, 'CHANGELOG.md')
  const previous = existsSync(changelog) ? readFileSync(changelog, 'utf8').replace(/^# Changelog\n+/, '') : ''
  writeFileSync(changelog, `# Changelog\n\n${section}\n${previous}`)
  await run(['git', '-C', CORE_DIR, 'add', '-A'])
  await run(['git', '-C', CORE_DIR, 'commit', '-q', '-m', `chore(release): v${next}`])
  await run(['git', '-C', CORE_DIR, 'tag', '-a', `v${next}`, '-m', `daroms-speed-app v${next}`])
  log.ok(`cœur v${next} : commit et tag créés (non poussés)`)
  console.log(`\n  git -C ${CORE_DIR} push --follow-tags\n\n${color.bold('Mettre à jour une app :')}\n  cd core && git fetch --tags && git checkout v${next} && cd ..\n  bun install && bun daroms sync-ai && bun daroms doctor\n`)
}
