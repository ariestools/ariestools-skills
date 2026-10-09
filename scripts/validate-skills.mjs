#!/usr/bin/env node
// Zero-dep validator for Agent Skills.
// Usage: node scripts/validate-skills.mjs <skills-dir> [--upstream]
//
// Per skill directory:
//   - directory name, no symlinks, SKILL.md present
//   - frontmatter: `name` and `description` present, `name` matches the directory,
//     `description` at most 1024 characters (warning above 900)
//   - every relative Markdown link in every .md file resolves to an existing path
//     inside <skills-dir>, with exact case, and every #anchor resolves to a heading
//     in the target file (GitHub slug rules)
// Then every entry in PUBLIC_ANCHORS must still resolve, and every verified
// version (VERIFIED_PACKAGES) must agree: each SKILL.md that declares the
// metadata key, and every "verified against `<package>` X.Y.Z" or
// `<package>@X.Y.Z` in <skills-dir> and in the AGENTS.md beside it.
// --upstream also requires each verified version to equal the package's npm
// `latest` dist-tag (network). CI runs it on pull requests into main, the
// release path.
//
// Links inside fenced code blocks, inline code spans and HTML comments are ignored.
// Exits non-zero on errors, emitting GitHub-style ::error annotations; warnings
// (::warning) do not fail the run.

import { readdirSync, readFileSync, lstatSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { argv, cwd, exit } from 'node:process'

const SKILL_DIR_NAME_RE = /^[a-z0-9][a-z0-9-]*$/
const REQUIRED_FIELDS = ['name', 'description']
const DESCRIPTION_MAX = 1024
const DESCRIPTION_WARN = 900

// SKILL.md `metadata` keys that record the npm package version a skill's
// content was verified against. To pin another package, add its key here and
// declare it in the skill's metadata.
const VERIFIED_PACKAGES = {
  'verified-toolchain': '@ariestools/toolchain',
}
const SEMVER_RE = /^\d+\.\d+\.\d+$/
const NPM_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package'

// Paths and anchors that other packs (XYOracleNetwork/xyo-skills) deep-link into
// this one. Installed copies resolve those links against these files, so renaming
// a file or changing one of these headings breaks them. Entries are relative to
// <skills-dir>; an entry without `#` only requires the file to exist.
const PUBLIC_ANCHORS = [
  'xy-development/workflow.md#definition-of-done',
  'xy-development/workflow.md#applying-the-definition-of-done',
  'xy-development/workflow.md#writing-project-specific-acceptance-criteria',
  'xy-toolchain/commands.md#clean',
  'xy-toolchain/commands.md#skills-and-work-tracking',
  'xy-toolchain/project-profiles.md#package-roles-and-dependency-policy',
  'xy-toolchain/testing.md',
  'xy-toolchain/testing.md#full-app-playwright-e2e',
]

let errorCount = 0
let warningCount = 0
let linkCount = 0
let markdownCount = 0
let mentionCount = 0
// metadata key -> [{ version, file, line }], one entry per SKILL.md declaring it
const verifiedDeclarations = new Map()

function displayPath(file) {
  const rel = relative(cwd(), file)
  return rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel : file
}

function annotate(level, file, line, msg) {
  const path = displayPath(file)
  const loc = line ? `file=${path},line=${line}` : `file=${path}`
  console.error(`::${level} ${loc}::${msg}`)
}

function err(file, line, msg) {
  annotate('error', file, line, msg)
  errorCount++
}

function warn(file, line, msg) {
  annotate('warning', file, line, msg)
  warningCount++
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

function parseFrontmatter(content, filePath) {
  const lines = content.split('\n')
  if (lines[0] !== '---') {
    err(filePath, 1, 'SKILL.md must start with `---` frontmatter delimiter')
    return null
  }
  const endIdx = lines.indexOf('---', 1)
  if (endIdx === -1) {
    err(filePath, 1, 'frontmatter block is not closed with a `---` delimiter')
    return null
  }
  const fields = {}
  for (let i = 1; i < endIdx; i++) {
    const raw = lines[i]
    if (raw.trim() === '' || raw.trimStart().startsWith('#')) continue
    if (/^\s/.test(raw)) continue
    const match = raw.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/)
    if (!match) {
      err(filePath, i + 1, `unparseable frontmatter line: ${JSON.stringify(raw)}`)
      continue
    }
    const [, key, rawValue] = match
    const line = i + 1
    let value = rawValue.trim()
    // A scalar may continue on indented lines (plain/quoted multi-line or a
    // `>` / `|` block scalar). An empty value starts a nested mapping instead.
    const continuation = []
    if (value !== '') {
      while (i + 1 < endIdx && (lines[i + 1].trim() === '' || /^\s/.test(lines[i + 1]))) {
        continuation.push(lines[++i].trim())
      }
      while (continuation.length > 0 && continuation.at(-1) === '') continuation.pop()
    }
    if (/^[>|][0-9+-]*$/.test(value)) {
      value = value.startsWith('>')
        ? continuation.filter(Boolean).join(' ')
        : continuation.join('\n')
    } else if (continuation.length > 0) {
      value = [value, ...continuation.filter(Boolean)].join(' ')
    }
    fields[key] = { value: unquote(value), line }
    if (value === '') fields[key].children = parseNestedMapping(lines, i + 1, endIdx)
  }
  return fields
}

// One level of `  key: value` lines under an empty-valued key such as
// `metadata:`. A trailing ` # comment` after an unquoted value is dropped.
function parseNestedMapping(lines, start, end) {
  const children = {}
  for (let i = start; i < end && (lines[i].trim() === '' || /^\s/.test(lines[i])); i++) {
    const match = lines[i].match(/^\s+([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/)
    if (!match) continue
    const raw = match[2].trim()
    const quoted = raw.match(/^(["'])(.*?)\1/)
    children[match[1]] = { value: quoted ? quoted[2] : raw.replace(/\s+#.*$/, ''), line: i + 1 }
  }
  return children
}

function hasSymlinkAnywhere(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isSymbolicLink()) return p
    if (entry.isDirectory()) {
      const nested = hasSymlinkAnywhere(p)
      if (nested) return nested
    }
  }
  return null
}

// --- Markdown links and anchors -------------------------------------------

// Inline links and images: [text](dest "title"), with one level of nested
// brackets in the text and balanced parentheses in the destination.
const INLINE_LINK_RE = /!?\[(?:[^[\]\\]|\\.|\[[^[\]]*\])*\]\(\s*(<[^<>\n]*>|[^\s()<>]*(?:\([^\s()]*\)[^\s()<>]*)*)(?:\s+(?:"[^"]*"|'[^']*'|\([^()]*\)))?\s*\)/g
// Reference definitions: [label]: dest  (footnotes `[^1]:` are not links)
const REF_DEF_RE = /^ {0,3}\[(?!\^)[^\]]+\]:\s*(<[^<>]*>|\S+)/
const ATX_HEADING_RE = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/
const SETEXT_RE = /^ {0,3}(=+|-+)[ \t]*$/
const FENCE_OPEN_RE = /^[ \t]*(?:>[ \t]*)*(`{3,}|~{3,})(.*)$/
const FENCE_CLOSE_RE = /^[ \t]*(?:>[ \t]*)*(`{3,}|~{3,})[ \t]*$/
const HTML_ID_RE = /<[A-Za-z][^>]*?\s(?:id|name)\s*=\s*["']([^"']+)["'][^>]*>/g

// github-slugger: lowercase, drop everything except letters, marks, numbers,
// connector punctuation (`_`), spaces and hyphens, then spaces become hyphens.
function githubSlug(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-')
}

// The rendered text of a heading, which is what GitHub slugs. Code spans keep
// their content verbatim; links, images, HTML tags and emphasis are flattened.
function headingText(source) {
  const code = []
  const text = source
    .replace(/(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g, (_span, _ticks, content) => {
      code.push(/^ .* $/.test(content) && content.trim() !== '' ? content.slice(1, -1) : content)
      return `\u0000${code.length - 1}\u0000`
    })
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/(^|[^\p{L}\p{N}_])(_{1,2})(\S(?:.*?\S)?)\2(?=[^\p{L}\p{N}_]|$)/gu, '$1$3')
    .replace(/\\([!-/:-@[-`{-~])/g, '$1')
  return text.replace(/\u0000(\d+)\u0000/g, (_match, n) => code[Number(n)]).trim()
}

function stripInlineCode(text) {
  return text.replace(/(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g, (span) => ' '.repeat(span.length))
}

// Remove HTML comments from one line, carrying open-comment state across lines.
function stripComments(text, state) {
  let out = ''
  let rest = text
  while (rest.length > 0) {
    if (state.inComment) {
      const end = rest.indexOf('-->')
      if (end === -1) return out
      rest = rest.slice(end + 3)
      state.inComment = false
    } else {
      const start = rest.indexOf('<!--')
      if (start === -1) return out + rest
      out += rest.slice(0, start)
      rest = rest.slice(start + 4)
      state.inComment = true
    }
  }
  return out
}

function isParagraphLine(text) {
  const t = text.trim()
  return t !== '' && !/^(#{1,6}(\s|$)|[-*+]\s|\d+[.)]\s|>|\||<)/.test(t)
}

const scanCache = new Map()

// Returns { anchors: Set<string>, links: { target, line }[] } for a Markdown file.
function scanMarkdown(file) {
  const cached = scanCache.get(file)
  if (cached) return cached
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  const headings = []
  const anchors = new Set()
  const links = []
  let start = 0
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1)
    if (end !== -1) start = end + 1
  }
  let fence = null
  const comment = { inComment: false }
  let previous = null // prose text of the previous line, for setext headings
  for (let i = start; i < lines.length; i++) {
    const raw = lines[i]
    if (fence) {
      const close = raw.match(FENCE_CLOSE_RE)
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) fence = null
      previous = null
      continue
    }
    if (!comment.inComment) {
      const open = raw.match(FENCE_OPEN_RE)
      if (open && !(open[1][0] === '`' && open[2].includes('`'))) {
        fence = { char: open[1][0], length: open[1].length }
        previous = null
        continue
      }
    }
    const text = stripComments(raw, comment)
    for (const match of text.matchAll(HTML_ID_RE)) anchors.add(match[1])
    const atx = text.match(ATX_HEADING_RE)
    if (atx) {
      headings.push(headingText(atx[2] ?? ''))
    } else if (previous !== null && SETEXT_RE.test(text) && isParagraphLine(previous)) {
      headings.push(headingText(previous))
      previous = null
      continue
    }
    const prose = stripInlineCode(text)
    const ref = prose.match(REF_DEF_RE)
    if (ref) links.push({ target: ref[1], line: i + 1 })
    for (const match of prose.matchAll(INLINE_LINK_RE)) links.push({ target: match[1], line: i + 1 })
    previous = atx ? null : text
  }
  const occurrences = new Map()
  for (const heading of headings) {
    const base = githubSlug(heading)
    let slug = base
    while (occurrences.has(slug)) {
      occurrences.set(base, occurrences.get(base) + 1)
      slug = `${base}-${occurrences.get(base)}`
    }
    occurrences.set(slug, 0)
    anchors.add(slug)
  }
  const result = { anchors, links }
  scanCache.set(file, result)
  return result
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function isInside(root, target) {
  const rel = relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

// The first path segment under root whose on-disk spelling differs, or null.
// Catches links that resolve on case-insensitive filesystems but not in CI.
function caseMismatch(root, target) {
  let current = root
  for (const segment of relative(root, target).split(sep).filter(Boolean)) {
    if (!readdirSync(current).includes(segment)) return join(current, segment)
    current = join(current, segment)
  }
  return null
}

function checkLink(skillsDir, file, line, rawTarget) {
  const target = rawTarget.startsWith('<') && rawTarget.endsWith('>') ? rawTarget.slice(1, -1).trim() : rawTarget
  if (target === '') {
    err(file, line, 'link has an empty target')
    return
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) return
  linkCount++
  const hashIdx = target.indexOf('#')
  const pathPart = safeDecode((hashIdx === -1 ? target : target.slice(0, hashIdx)).split('?')[0])
  const anchor = hashIdx === -1 ? '' : safeDecode(target.slice(hashIdx + 1))
  if (pathPart.startsWith('/')) {
    err(file, line, `link "${target}" is absolute; use a path relative to this file`)
    return
  }
  const resolved = pathPart === '' ? file : resolve(dirname(file), pathPart)
  if (!isInside(skillsDir, resolved)) {
    err(file, line, `link "${target}" points outside ${displayPath(skillsDir)}, so installed skills cannot resolve it`)
    return
  }
  let stat
  try {
    stat = statSync(resolved)
  } catch {
    err(file, line, `link "${target}" does not resolve: ${displayPath(resolved)} does not exist`)
    return
  }
  const mismatch = caseMismatch(skillsDir, resolved)
  if (mismatch) {
    err(file, line, `link "${target}" differs in case from the file on disk at ${displayPath(mismatch)}; it breaks on case-sensitive filesystems`)
    return
  }
  if (anchor === '' || !stat.isFile() || !/\.md$/i.test(resolved)) return
  if (!scanMarkdown(resolved).anchors.has(anchor)) {
    err(file, line, `link "${target}" points at #${anchor}, which is not a heading in ${displayPath(resolved)}`)
  }
}

function markdownFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) files.push(...markdownFiles(p))
    else if (entry.isFile() && /\.md$/i.test(entry.name)) files.push(p)
  }
  return files.sort()
}

function validateLinks(skillsDir, dir) {
  for (const file of markdownFiles(dir)) {
    markdownCount++
    for (const { target, line } of scanMarkdown(file).links) {
      checkLink(skillsDir, file, line, target)
    }
  }
}

function validatePublicAnchors(skillsDir) {
  for (const entry of PUBLIC_ANCHORS) {
    const [relPath, anchor] = entry.split('#')
    const file = join(skillsDir, ...relPath.split('/'))
    let isFile = false
    try {
      isFile = statSync(file).isFile()
    } catch {}
    if (!isFile) {
      err(file, null, `public path ${entry} no longer exists; other skill packs link it, so restore it or migrate those links first`)
      continue
    }
    if (anchor && !scanMarkdown(file).anchors.has(anchor)) {
      err(file, null, `public anchor ${entry} no longer resolves; other skill packs link it, so keep that heading text or migrate those links first`)
    }
  }
}

// --- Skills ----------------------------------------------------------------

function validateSkill(skillsDir, name) {
  const dir = join(skillsDir, name)
  if (!SKILL_DIR_NAME_RE.test(name)) {
    err(dir, null, `skill directory name "${name}" must match ${SKILL_DIR_NAME_RE} (lowercase letters, digits, hyphens; cannot start with a hyphen or dot)`)
    return
  }
  const stat = lstatSync(dir)
  if (stat.isSymbolicLink()) {
    err(dir, null, 'skill directory is a symlink; symlinks are rejected to prevent path escape')
    return
  }
  if (!stat.isDirectory()) {
    err(dir, null, 'expected a directory')
    return
  }
  const symlinkPath = hasSymlinkAnywhere(dir)
  if (symlinkPath) {
    err(symlinkPath, null, 'symlinks are rejected inside skill directories to prevent path escape during sync')
  }
  validateLinks(skillsDir, dir)
  const skillMd = join(dir, 'SKILL.md')
  let content
  try {
    content = readFileSync(skillMd, 'utf8')
  } catch {
    err(skillMd, null, 'SKILL.md not found')
    return
  }
  const fields = parseFrontmatter(content, skillMd)
  if (!fields) return
  for (const key of REQUIRED_FIELDS) {
    const field = fields[key]
    if (!field) {
      err(skillMd, 1, `frontmatter missing required field: ${key}`)
      continue
    }
    if (typeof field.value !== 'string' || field.value.length === 0) {
      err(skillMd, field.line, `frontmatter field "${key}" must be a non-empty string`)
    }
  }
  const declaredName = fields.name?.value
  if (declaredName && declaredName !== name) {
    err(skillMd, fields.name.line, `frontmatter name "${declaredName}" does not match directory name "${name}"`)
  }
  const description = fields.description?.value
  if (description) {
    const length = [...description].length
    if (length > DESCRIPTION_MAX) {
      err(skillMd, fields.description.line, `frontmatter description is ${length} characters; Agent Skills allows at most ${DESCRIPTION_MAX}`)
    } else if (length > DESCRIPTION_WARN) {
      warn(skillMd, fields.description.line, `frontmatter description is ${length} characters; keep it under ${DESCRIPTION_WARN} to leave room below the ${DESCRIPTION_MAX}-character limit`)
    }
  }
  for (const [key, { value, line }] of Object.entries(fields.metadata?.children ?? {})) {
    if (!key.startsWith('verified-')) continue
    if (!Object.hasOwn(VERIFIED_PACKAGES, key)) {
      warn(skillMd, line, `metadata.${key} names no package; add it to VERIFIED_PACKAGES in scripts/validate-skills.mjs so its version is checked`)
      continue
    }
    if (!SEMVER_RE.test(value)) {
      err(skillMd, line, `metadata.${key} must be an exact version such as 1.2.3, not "${value}"`)
      continue
    }
    if (!verifiedDeclarations.has(key)) verifiedDeclarations.set(key, [])
    verifiedDeclarations.get(key).push({ version: value, file: skillMd, line })
  }
}

// --- Verified versions -----------------------------------------------------

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}

function compareVersions(left, right) {
  const a = left.split('.').map(Number)
  const b = right.split('.').map(Number)
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

// Returns Map<package, { key, version, file, line }> of the agreed pins.
function validateVerifiedVersions(skillsDir) {
  const pins = new Map()
  for (const [key, [first, ...rest]] of verifiedDeclarations) {
    for (const other of rest) {
      if (other.version !== first.version) {
        err(other.file, other.line, `metadata.${key} is ${other.version}, but ${displayPath(first.file)} declares ${first.version}; every skill that declares it must agree`)
      }
    }
    pins.set(VERIFIED_PACKAGES[key], { key, ...first })
  }
  if (pins.size === 0) return pins
  const patterns = [...pins].flatMap(([pkg, pin]) => [
    { pin, pkg, re: new RegExp(`verified against \`${escapeRegExp(pkg)}\` (\\d+\\.\\d+\\.\\d+)`, 'gi') },
    { pin, pkg, re: new RegExp(`${escapeRegExp(pkg)}@(\\d+\\.\\d+\\.\\d+)`, 'g') },
  ])
  const files = markdownFiles(skillsDir)
  const agentsMd = join(dirname(skillsDir), 'AGENTS.md')
  try {
    if (statSync(agentsMd).isFile()) files.push(agentsMd)
  } catch {}
  for (const file of files) {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((text, index) => {
      for (const { pin, pkg, re } of patterns) {
        for (const match of text.matchAll(re)) {
          mentionCount++
          if (match[1] !== pin.version) {
            err(file, index + 1, `names ${pkg} ${match[1]}, but metadata.${pin.key} in ${displayPath(pin.file)} is ${pin.version}; a verified version changes everywhere at once`)
          }
        }
      }
    })
  }
  return pins
}

async function npmLatest(pkg) {
  const response = await fetch(`${NPM_DIST_TAGS_URL}/${pkg}/dist-tags`, { signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const { latest } = await response.json()
  if (typeof latest !== 'string') throw new Error('no latest dist-tag')
  return latest
}

async function validateUpstream(pins) {
  for (const [pkg, pin] of pins) {
    let latest
    try {
      latest = await npmLatest(pkg)
    } catch (error) {
      err(pin.file, pin.line, `could not read the npm latest version of ${pkg}: ${error.message}`)
      continue
    }
    if (latest === pin.version) {
      console.log(`${pkg}: metadata.${pin.key} ${pin.version} is npm latest`)
    } else if (compareVersions(pin.version, latest) > 0) {
      err(pin.file, pin.line, `metadata.${pin.key} is ${pin.version}, ahead of npm latest ${latest} for ${pkg}; verify against a published version`)
    } else {
      err(pin.file, pin.line, `metadata.${pin.key} is ${pin.version}, but npm latest for ${pkg} is ${latest}. Re-verify the skills that describe it against ${latest}, then change metadata.${pin.key} and every mention of ${pin.version} together`)
    }
  }
}

async function main() {
  const args = argv.slice(2)
  const isUpstream = args.includes('--upstream')
  const positional = args.filter((arg) => arg !== '--upstream')
  const skillsDirArg = positional[0]
  if (!skillsDirArg || positional.length > 1 || skillsDirArg.startsWith('-')) {
    console.error('usage: node scripts/validate-skills.mjs <skills-dir> [--upstream]')
    exit(2)
  }
  const skillsDir = resolve(skillsDirArg)
  let topStat
  try {
    topStat = statSync(skillsDir)
  } catch {
    err(skillsDir, null, 'skills directory does not exist')
    exit(1)
  }
  if (!topStat.isDirectory()) {
    err(skillsDir, null, 'skills path is not a directory')
    exit(1)
  }
  const entries = readdirSync(skillsDir, { withFileTypes: true })
  const skillDirs = entries
    .filter((e) => e.isDirectory() || e.isSymbolicLink())
    .map((e) => e.name)
  if (skillDirs.length === 0) {
    err(skillsDir, null, 'skills directory contains no skill subdirectories — refusing to proceed (would wipe target on sync)')
    exit(1)
  }
  for (const name of skillDirs) {
    validateSkill(skillsDir, name)
  }
  validatePublicAnchors(skillsDir)
  const pins = validateVerifiedVersions(skillsDir)
  if (isUpstream) await validateUpstream(pins)
  const warnings = warningCount > 0 ? `, ${warningCount} warning(s)` : ''
  if (errorCount > 0) {
    console.error(`\nvalidation failed with ${errorCount} error(s)${warnings}`)
    exit(1)
  }
  const versions = pins.size > 0 ? `, ${mentionCount} mention(s) of ${pins.size} verified version(s)` : ''
  console.log(`validated ${skillDirs.length} skill(s), ${markdownCount} Markdown file(s), ${linkCount} relative link(s)${versions} in ${skillsDir}${warnings}`)
}

await main()
