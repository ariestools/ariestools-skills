#!/usr/bin/env node
// Optional, dependency-free companion to repository-hygiene.md. Never deletes source state.
import { execFileSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, readdirSync } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const usage = `Usage: node repository-hygiene.mjs <audit|backup> [--repo <path>] [--base <ref>]...

audit   Print local inventory as JSON. No network, file writes, or deletions.
backup  Save inventory and a standalone bundle under the common Git directory's
        cleanup-backups/. Verify it in an independent temporary repository.

--repo  Checkout to inspect (default: current directory).
--base  Retained branch to check ancestry against; repeat for integration/release
        branches. Remote-tracking refs are a local snapshot, not live remote proof.

Requires Node >=24 and Git with --no-lazy-fetch support. No cleanup/apply mode;
review the companion guide.`

function options(argv) {
  if (argv.length === 1 && ['--help', '-h'].includes(argv[0])) return null
  const [command, ...args] = argv
  if (!['audit', 'backup'].includes(command)) throw new Error(usage)
  const result = { command, repo: process.cwd(), bases: [] }
  for (let i = 0; i < args.length; i++) {
    const flag = args[i]
    if (!['--repo', '--base'].includes(flag)) throw new Error(`Unknown option: ${flag}`)
    const value = args[++i]
    if (!value || value.startsWith('-')) throw new Error(`Missing value for ${flag}`)
    if (flag === '--repo') result.repo = path.resolve(value)
    else result.bases.push(value)
  }
  return result
}

function git(repo, args, allowFailure = false) {
  const env = { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_NO_LAZY_FETCH: '1', GIT_NO_REPLACE_OBJECTS: '1' }
  for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES']) delete env[key]
  try {
    return execFileSync('git', ['--no-lazy-fetch', '-c', 'gc.auto=0', '-c', 'maintenance.auto=false', '-c', 'core.fsmonitor=false', '-C', repo, ...args], {
      encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 120_000,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    if (allowFailure && Number.isInteger(error.status)) return null
    throw new Error(`Git ${args[0]} failed: ${String(error.stderr ?? error.message).trim()}`, { cause: error })
  }
}

const lines = value => value.trimEnd() ? value.trimEnd().split('\n') : []
const nulList = value => value.split('\0').filter(Boolean)

function refs(repo, gitDir) {
  return lines(git(repo, [...(gitDir ? ['--git-dir', gitDir] : []), 'for-each-ref', '--format=%(refname)%09%(objectname)%09%(symref)%09%(upstream)%09%(committerdate:iso-strict)']))
    .map(line => {
      const [ref, sha, symbolicTarget, upstream, committedAt] = line.split('\t')
      return { ref, sha, symbolicTarget, upstream, committedAt }
    })
}

function refScopes(repo) {
  const common = git(repo, ['rev-parse', '--path-format=absolute', '--git-common-dir']).replace(/\n$/, '')
  const directories = [common]
  try {
    const parent = path.join(common, 'worktrees')
    for (const entry of readdirSync(parent, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      if (entry.isSymbolicLink()) throw new Error('Cannot inventory symbolic worktree metadata safely.')
      if (entry.isDirectory()) directories.push(path.join(parent, entry.name))
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  // Private refs (refs/worktree/*, refs/bisect/*, etc.) differ by Git directory.
  // Inspect metadata directly even when a registered checkout's files are missing.
  return directories.map(gitDir => ({
    gitDir, HEAD: git(repo, ['--git-dir', gitDir, 'rev-parse', '--verify', 'HEAD'], true)?.trim() ?? null,
    refs: refs(repo, gitDir),
  }))
}

function stashEntries(repo) {
  return lines(git(repo, ['stash', 'list', '--format=%H%x09%gd%x09%cI'])).map(line => {
    const [sha, selector, createdAt] = line.split('\t')
    return { sha, selector, createdAt, parents: git(repo, ['rev-list', '--parents', '-n', '1', sha]).trim().split(' ').slice(1) }
  })
}

function worktrees(repo, inspectFiles) {
  const result = []
  let entry
  for (const field of git(repo, ['worktree', 'list', '--porcelain', '-z']).split('\0')) {
    if (field.startsWith('worktree ')) {
      entry = { path: field.slice(9) }
      result.push(entry)
    } else if (field && entry) {
      const space = field.indexOf(' ')
      entry[space < 0 ? field : field.slice(0, space)] = space < 0 ? true : field.slice(space + 1)
    }
  }
  if (inspectFiles) for (const item of result) {
    if (item.bare) continue
    const filters = git(item.path, ['config', '--name-only', '--get-regexp', /^filter\..*\.(clean|process)$/.source], true)
    const index = git(item.path, ['ls-files', '--stage', '-z'], true)
    const submodules = index !== null && nulList(index).some(line => line.startsWith('160000 '))
    if (filters || submodules) {
      Object.assign(item, {
        statusPorcelain: null, dirty: null, ignoredPaths: null,
        inspectionError: filters ? 'Configured clean/process filters may execute code; inspect separately.' : 'Submodule worktrees require separate inspection.',
      })
      continue
    }
    // Keep Git's NUL-delimited status verbatim, encoded safely by JSON.
    const status = git(item.path, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], true)
    item.statusPorcelain = status
    item.dirty = status === null ? null : status.length > 0
    item.ignoredPaths = status === null ? null : nulList(git(item.path, ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory', '-z']))
    if (status === null) item.inspectionError = 'Unavailable; preserve until inspected.'
  }
  return result
}

function fingerprint(repo) {
  return JSON.stringify({
    refs: refs(repo).map(({ ref, sha, symbolicTarget }) => ({ ref, sha, symbolicTarget })),
    scopes: refScopes(repo).map(({ gitDir, HEAD, refs: scopedRefs }) => ({ gitDir, HEAD, refs: scopedRefs.map(({ ref, sha, symbolicTarget }) => ({ ref, sha, symbolicTarget })) })),
    stashes: stashEntries(repo).map(({ sha }) => sha),
    worktrees: worktrees(repo, false),
  })
}

function inventory(repo, baseNames) {
  const commonGitDir = git(repo, ['rev-parse', '--path-format=absolute', '--git-common-dir']).replace(/\n$/, '')
  const allRefs = refs(repo)
  const bases = baseNames.map(ref => ({ ref, sha: git(repo, ['rev-parse', '--verify', `${ref}^{commit}`]).trim() }))
  const shallow = git(repo, ['rev-parse', '--is-shallow-repository']).trim() === 'true'
  const partialConfig = git(repo, ['config', '--get-regexp', /^(extensions\.partialclone|remote\..*\.promisor)$/.source], true) ?? ''
  const partial = lines(partialConfig).some(line => /^extensions\.partialclone\s+\S/.test(line) || /\s+(true|yes|on|1)$/i.test(line))
  const branches = allRefs.filter(({ ref, symbolicTarget }) => !symbolicTarget && /^refs\/(heads|remotes)\//.test(ref))
    .map(item => ({
      ...item,
      // Incomplete history cannot establish a cleanup decision.
      ancestorOf: shallow || partial ? [] : bases.filter(base => git(repo, ['merge-base', '--is-ancestor', item.sha, base.sha], true) !== null).map(base => base.ref),
    }))
  return {
    schemaVersion: 1, createdAt: new Date().toISOString(), repo: path.resolve(repo), commonGitDir,
    objectFormat: git(repo, ['rev-parse', '--show-object-format=storage']).trim(),
    shallow, partial, bases, refs: allRefs, refScopes: refScopes(repo), branches, worktrees: worktrees(repo, true), stashes: stashEntries(repo),
    limitations: [
      'Local inventory only: no fetch, live remote tips, hosting rules, PR state, process/session ownership or deployment inspection.',
      'Ancestry is evidence for review, not permission to delete. Missing ancestry does not prove useful work; squash/merge resolutions require review.',
      'Commit bundles exclude unstashed index/worktree files, untracked/ignored files, credentials, configuration files and reflog-only history outside the listed stashes.',
    ],
  }
}

async function privateDirectory(dir) {
  try { await fs.mkdir(dir, { mode: 0o700 }) } catch (error) { if (error.code !== 'EEXIST') throw error }
  const stat = await fs.lstat(dir)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Backup parent must be a real directory, not a symlink.')
  if (process.getuid && stat.uid !== process.getuid()) throw new Error('Backup parent must belong to the current user.')
  await fs.chmod(dir, 0o700)
}

async function backup(repo, bases) {
  // Capture before inventory too, so a concurrent change cannot silently enter it.
  const before = fingerprint(repo)
  const report = inventory(repo, bases)
  if (report.shallow || report.partial) throw new Error('Standalone recovery requires a complete repository; resolve shallow/partial history first.')
  if (!['sha1', 'sha256'].includes(report.objectFormat)) throw new Error('Unsupported object format; preserve repository state separately.')
  if (before !== fingerprint(repo)) throw new Error('Repository refs, stashes or worktrees changed during inventory; rerun before cleanup.')
  const recoveryRefs = {}
  for (const { ref, sha } of report.refs) recoveryRefs[`refs/recovery/source/${ref.slice(5)}`] = sha
  for (const [i, { sha }] of report.stashes.entries()) recoveryRefs[`refs/recovery/stashes/${i}`] = sha
  for (const [i, tree] of report.worktrees.entries()) if (tree.HEAD) recoveryRefs[`refs/recovery/worktrees/${i}`] = tree.HEAD
  for (const [i, scope] of report.refScopes.entries()) {
    for (const { ref, sha } of scope.refs) recoveryRefs[`refs/recovery/scopes/${i}/${ref.slice(5)}`] = sha
    if (scope.HEAD) recoveryRefs[`refs/recovery/scopes/${i}/HEAD`] = scope.HEAD
  }
  if (!Object.keys(recoveryRefs).length) throw new Error('No committed refs or worktree HEADs to bundle; preserve working files separately.')

  const parent = path.join(report.commonGitDir, 'cleanup-backups')
  await privateDirectory(parent)
  const directory = path.join(parent, `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}`)
  await fs.mkdir(directory, { mode: 0o700 })
  const bundle = path.join(directory, 'recovery.bundle')
  const receipt = path.join(directory, 'audit.json')
  const record = { ...report, recoveryRefs, bundle, verified: false, workingFilesIncluded: false }
  const save = () => fs.writeFile(receipt, JSON.stringify(record, null, 2) + '\n', { mode: 0o600 })
  await save()
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'repository-hygiene-'))
  try {
    const source = path.join(scratch, 'source.git')
    const restored = path.join(scratch, 'restore.git')
    git(scratch, ['init', '--bare', '--quiet', '--template=', `--object-format=${report.objectFormat}`, source])
    const entries = Object.entries(recoveryRefs)
    for (let i = 0; i < entries.length; i += 100) {
      git(source, ['fetch', '--quiet', '--no-tags', '--no-write-fetch-head', '--no-recurse-submodules', path.resolve(repo), ...entries.slice(i, i + 100).map(([ref, sha]) => `${sha}:${ref}`)])
    }
    git(source, ['bundle', 'create', bundle, '--all'])
    await fs.chmod(bundle, 0o600)
    git(scratch, ['init', '--bare', '--quiet', '--template=', `--object-format=${report.objectFormat}`, restored])
    git(restored, ['bundle', 'verify', bundle])
    git(restored, ['fetch', '--quiet', '--no-tags', '--no-recurse-submodules', bundle, '+refs/recovery/*:refs/recovery/*'])
    const actual = Object.fromEntries(refs(restored).map(({ ref, sha }) => [ref, sha]))
    if (Object.keys(actual).length !== entries.length || entries.some(([ref, sha]) => actual[ref] !== sha)) throw new Error('Restored recovery refs differ from the snapshot.')
    git(restored, ['fsck', '--full', '--no-reflogs'])
    if (before !== fingerprint(repo)) throw new Error('Repository refs, stashes or worktrees changed during backup; rerun before cleanup.')
    const hash = createHash('sha256')
    for await (const chunk of createReadStream(bundle)) hash.update(chunk)
    Object.assign(record, { verified: true, verifiedAt: new Date().toISOString(), bundleSha256: hash.digest('hex'), bundleBytes: (await fs.stat(bundle)).size })
    await save()
    return { directory, receipt, bundle, verified: true, refsVerified: entries.length, workingFilesIncluded: false }
  } catch (error) {
    record.failure = error.message
    await save()
    throw new Error(`Recovery verification failed; do not clean up. Inspect ${receipt}`, { cause: error })
  } finally {
    await fs.rm(scratch, { recursive: true, force: true })
  }
}

try {
  const args = options(process.argv.slice(2))
  if (!args) console.log(usage)
  else console.log(JSON.stringify(args.command === 'audit' ? inventory(args.repo, args.bases) : await backup(args.repo, args.bases), null, 2))
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
