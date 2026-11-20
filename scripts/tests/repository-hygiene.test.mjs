import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import test from 'node:test'

const helperPath = fileURLToPath(new URL('../../skills/xy-development/scripts/repository-hygiene.mjs', import.meta.url))
const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: os.devNull, GIT_OPTIONAL_LOCKS: '0' }
for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES']) delete env[key]

function git(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd()
}

function helper(repo, command, more = [], extraEnv = {}) {
  return spawnSync(process.execPath, [helperPath, command, '--repo', repo, ...more], { env: { ...env, ...extraEnv }, encoding: 'utf8' })
}

function success(result) {
  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout)
}

async function fixture(t, objectFormat = 'sha1') {
  const directory = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'hygiene-test-')))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const repo = path.join(directory, 'source')
  git(directory, 'init', '--quiet', '--template=', `--object-format=${objectFormat}`, '--initial-branch=main', repo)
  git(repo, 'config', 'user.name', 'Hygiene fixture')
  git(repo, 'config', 'user.email', 'hygiene@example.invalid')
  await fs.writeFile(path.join(repo, 'tracked.txt'), 'base\n')
  await fs.writeFile(path.join(repo, '.gitignore'), '.env\ncache/\n')
  git(repo, 'add', '.')
  git(repo, 'commit', '--quiet', '-m', 'base')
  return { directory, repo, base: git(repo, 'rev-parse', 'HEAD') }
}

function state(repo) {
  return {
    refs: git(repo, 'for-each-ref', '--format=%(refname) %(objectname)'),
    stashes: git(repo, 'stash', 'list', '--format=%H'),
    worktrees: git(repo, 'worktree', 'list', '--porcelain', '-z'),
    staged: git(repo, 'diff', '--cached', '--binary'),
    unstaged: git(repo, 'diff', '--binary'),
  }
}

test('audit is local and preserves source state while exposing ancestry and worktree risks', async t => {
  const { directory, repo, base } = await fixture(t)
  git(repo, 'branch', 'feature/merged')
  git(repo, 'switch', '--quiet', '-c', 'feature/unmerged')
  await fs.writeFile(path.join(repo, 'feature.txt'), 'unmerged\n')
  git(repo, 'add', '.')
  git(repo, 'commit', '--quiet', '-m', 'unmerged feature')
  git(repo, 'switch', '--quiet', 'main')
  // An unreachable remote makes an accidental fetch observable as a failure.
  git(repo, 'remote', 'add', 'origin', path.join(directory, 'missing-remote.git'))
  git(repo, 'update-ref', 'refs/remotes/origin/main', base)
  const extra = path.join(directory, 'detached tree\nwith newline')
  git(repo, 'worktree', 'add', '--quiet', '--detach', extra, base)
  git(repo, 'worktree', 'lock', '--reason', 'active fixture session', extra)
  await fs.writeFile(path.join(extra, '.env'), 'PRIVATE_FIXTURE_VALUE=keep\n')
  await fs.writeFile(path.join(extra, 'tracked.txt'), 'dirty detached tree\n')
  await fs.writeFile(path.join(repo, 'scratch.txt'), 'keep untracked\n')
  const before = state(repo)
  const index = await fs.readFile(path.join(repo, '.git/index'))
  const report = success(helper(repo, 'audit', ['--base', 'origin/main']))
  assert.deepEqual(state(repo), before)
  assert.deepEqual(await fs.readFile(path.join(repo, '.git/index')), index)
  assert.equal(report.branches.find(x => x.ref === 'refs/heads/feature/merged').ancestorOf[0], 'origin/main')
  assert.deepEqual(report.branches.find(x => x.ref === 'refs/heads/feature/unmerged').ancestorOf, [])
  const tree = report.worktrees.find(x => x.path === extra)
  assert.equal(tree.detached, true)
  assert.equal(tree.locked, 'active fixture session')
  assert.equal(tree.dirty, true)
  assert.ok(tree.ignoredPaths.includes('.env'))
  assert.ok(!JSON.stringify(report).includes('PRIVATE_FIXTURE_VALUE'))
  assert.equal(await fs.readFile(path.join(repo, 'scratch.txt'), 'utf8'), 'keep untracked\n')
  await assert.rejects(fs.access(path.join(repo, '.git/cleanup-backups')), { code: 'ENOENT' })
})

test('backup restores all refs, staged/unstaged stash bytes, untracked binaries and detached commits', async t => {
  const { directory, repo, base } = await fixture(t)
  git(repo, 'tag', '-a', 'v-fixture', '-m', 'annotated fixture tag')
  await fs.writeFile(path.join(repo, 'tracked.txt'), 'staged\n')
  git(repo, 'add', 'tracked.txt')
  await fs.writeFile(path.join(repo, 'tracked.txt'), 'working\n')
  const binary = Buffer.from([0, 255, 1, 128, 0])
  await fs.writeFile(path.join(repo, 'untracked.bin'), binary)
  git(repo, 'stash', 'push', '--include-untracked', '-m', 'all three parents')
  const firstStash = git(repo, 'rev-parse', 'stash@{0}')
  await fs.writeFile(path.join(repo, 'tracked.txt'), 'second stash\n')
  git(repo, 'stash', 'push', '-m', 'second entry')
  const extra = path.join(directory, 'detached')
  git(repo, 'worktree', 'add', '--quiet', '--detach', extra, base)
  await fs.writeFile(path.join(extra, 'detached.txt'), 'only on detached HEAD\n')
  git(extra, 'add', '.')
  git(extra, 'commit', '--quiet', '-m', 'detached-only commit')
  const detached = git(extra, 'rev-parse', 'HEAD')
  await fs.writeFile(path.join(extra, '.env'), 'private fixture\n')
  await fs.writeFile(path.join(repo, 'tracked.txt'), 'do not overwrite current work\n')
  const before = state(repo)
  const saved = success(helper(repo, 'backup', ['--base', 'main']))
  assert.equal(saved.verified, true)
  assert.equal(saved.workingFilesIncluded, false)
  assert.deepEqual(state(repo), before)
  assert.equal(await fs.readFile(path.join(repo, 'tracked.txt'), 'utf8'), 'do not overwrite current work\n')
  assert.equal(await fs.readFile(path.join(extra, '.env'), 'utf8'), 'private fixture\n')
  const receipt = JSON.parse(await fs.readFile(saved.receipt, 'utf8'))
  assert.equal(receipt.verified, true)
  assert.equal(receipt.stashes.length, 2)
  assert.equal(receipt.bundleSha256, createHash('sha256').update(await fs.readFile(saved.bundle)).digest('hex'))
  if (process.platform !== 'win32') {
    assert.equal((await fs.stat(saved.directory)).mode & 0o777, 0o700)
    assert.equal((await fs.stat(saved.bundle)).mode & 0o777, 0o600)
    assert.equal((await fs.stat(saved.receipt)).mode & 0o777, 0o600)
  }
  const restored = path.join(directory, 'independent-restore')
  git(directory, 'init', '--quiet', '--template=', restored)
  git(restored, 'bundle', 'verify', saved.bundle)
  git(restored, 'fetch', '--quiet', saved.bundle, '+refs/recovery/*:refs/recovery/*')
  for (const [ref, sha] of Object.entries(receipt.recoveryRefs)) assert.equal(git(restored, 'rev-parse', ref), sha)
  assert.equal(git(restored, 'show', `${detached}:detached.txt`), 'only on detached HEAD')
  assert.equal(git(restored, 'show', `${firstStash}^2:tracked.txt`), 'staged')
  assert.equal(git(restored, 'show', `${firstStash}:tracked.txt`), 'working')
  git(restored, 'switch', '--quiet', '--detach', `${firstStash}^1`)
  git(restored, 'stash', 'store', '-m', 'recovered entry', firstStash)
  git(restored, 'stash', 'apply', '--index', 'stash@{0}')
  assert.equal(git(restored, 'show', ':tracked.txt'), 'staged')
  assert.equal(await fs.readFile(path.join(restored, 'tracked.txt'), 'utf8'), 'working\n')
  assert.deepEqual(await fs.readFile(path.join(restored, 'untracked.bin')), binary)
})

test('audit preserves unreadable/prunable registrations instead of deciding they are safe to remove', async t => {
  const { directory, repo, base } = await fixture(t)
  const missing = path.join(directory, 'missing-tree')
  git(repo, 'worktree', 'add', '--quiet', '--detach', missing, base)
  await fs.rm(missing, { recursive: true })
  const before = state(repo)
  const report = success(helper(repo, 'audit'))
  const tree = report.worktrees.find(x => x.path === missing)
  assert.ok(tree.prunable)
  assert.equal(tree.dirty, null)
  assert.ok(tree.inspectionError)
  assert.deepEqual(state(repo), before)
})

test('shallow and partial repositories cannot receive a verified standalone recovery receipt', async t => {
  const { directory, repo } = await fixture(t)
  const shallow = path.join(directory, 'shallow')
  git(directory, 'clone', '--quiet', '--depth=1', pathToFileURL(repo).href, shallow)
  assert.equal(success(helper(shallow, 'audit', ['--base', 'main'])).shallow, true)
  assert.equal(helper(shallow, 'backup').status, 1)
  await assert.rejects(fs.access(path.join(shallow, '.git/cleanup-backups')), { code: 'ENOENT' })
  git(repo, 'config', 'remote.origin.promisor', 'true')
  const report = success(helper(repo, 'audit', ['--base', 'main']))
  assert.equal(report.partial, true)
  assert.deepEqual(report.branches[0].ancestorOf, [])
  assert.equal(helper(repo, 'backup').status, 1)
  await assert.rejects(fs.access(path.join(repo, '.git/cleanup-backups')), { code: 'ENOENT' })
})

test('explicit repo overrides inherited Git location variables and unknown destructive modes are refused', async t => {
  const { directory, repo } = await fixture(t)
  const other = path.join(directory, 'other')
  git(directory, 'init', '--quiet', '--template=', other)
  const report = success(helper(repo, 'audit', [], { GIT_DIR: path.join(other, '.git'), GIT_WORK_TREE: other }))
  assert.equal(report.commonGitDir, path.join(repo, '.git'))
  const before = state(repo)
  for (const [command, flags] of [['cleanup', []], ['audit', ['--delete']], ['backup', ['--force']]]) assert.equal(helper(repo, command, flags).status, 1)
  assert.deepEqual(state(repo), before)
})

test('a tree-filtered partial clone audit cannot lazy-fetch missing objects or write new packs', async t => {
  const { directory, repo } = await fixture(t)
  git(repo, 'config', 'uploadpack.allowFilter', 'true')
  const partial = path.join(directory, 'tree-filtered')
  git(directory, 'clone', '--quiet', '--no-checkout', '--filter=tree:0', pathToFileURL(repo).href, partial)
  const packDir = path.join(partial, '.git/objects/pack')
  const before = (await fs.readdir(packDir)).sort()
  const trace = path.join(directory, 'partial-audit.trace')
  const report = success(helper(partial, 'audit', [], { GIT_TRACE: trace }))
  assert.equal(report.partial, true)
  assert.deepEqual((await fs.readdir(packDir)).sort(), before)
  assert.ok(report.worktrees.some(x => x.dirty === null && x.inspectionError))
  assert.doesNotMatch(await fs.readFile(trace, 'utf8'), /(?:run_command|built-in):[^\n]*\bfetch\b/)
  const failure = helper(partial, 'backup', [], { GIT_TRACE: trace })
  assert.equal(failure.status, 1)
  assert.deepEqual((await fs.readdir(packDir)).sort(), before)
  await assert.rejects(fs.access(path.join(partial, '.git/cleanup-backups')), { code: 'ENOENT' })
})

test('worktree-private refs survive backup from a linked checkout, including a missing checkout', async t => {
  const { directory, repo, base } = await fixture(t)
  const commits = []
  const trees = []
  for (let i = 0; i < 2; i++) {
    const extra = path.join(directory, `private-ref-${i}`)
    trees.push(extra)
    git(repo, 'worktree', 'add', '--quiet', '--detach', extra, base)
    await fs.writeFile(path.join(extra, 'private.txt'), `useful private work ${i}\n`)
    git(extra, 'add', '.')
    git(extra, 'commit', '--quiet', '-m', `private ${i}`)
    const sha = git(extra, 'rev-parse', 'HEAD')
    commits.push(sha)
    git(extra, 'update-ref', 'refs/worktree/useful', sha)
    git(extra, 'switch', '--quiet', '--detach', base)
  }
  await fs.rm(trees[1], { recursive: true })
  const saved = success(helper(trees[0], 'backup'))
  const record = JSON.parse(await fs.readFile(saved.receipt, 'utf8'))
  const scoped = Object.entries(record.recoveryRefs).filter(([ref]) => ref.startsWith('refs/recovery/scopes/') && ref.endsWith('/worktree/useful'))
  assert.deepEqual(scoped.map(([, sha]) => sha).sort(), [...commits].sort())
  const restored = path.join(directory, 'restore-private')
  git(directory, 'init', '--quiet', '--bare', '--template=', restored)
  git(restored, 'fetch', '--quiet', saved.bundle, '+refs/recovery/*:refs/recovery/*')
  for (let i = 0; i < commits.length; i++) assert.equal(git(restored, 'show', `${commits[i]}:private.txt`), `useful private work ${i}`)
  assert.equal(git(trees[0], 'rev-parse', 'refs/worktree/useful'), commits[0])
})

test('clean/process filters are never executed by file inspection', async t => {
  const { directory, repo } = await fixture(t)
  const marker = path.join(directory, 'filter-executed')
  const driver = path.join(directory, 'clean.cjs')
  await fs.writeFile(driver, `const fs = require('node:fs'); fs.writeFileSync(${JSON.stringify(marker)}, 'executed'); process.stdout.write(fs.readFileSync(0));\n`)
  const quote = value => "'" + value.replaceAll("'", "'\\''") + "'"
  git(repo, 'config', 'filter.review.clean', `${quote(process.execPath)} ${quote(driver)}`)
  await fs.writeFile(path.join(repo, '.gitattributes'), '*.txt filter=review\n')
  await fs.writeFile(path.join(repo, 'tracked.txt'), 'BASE\n')
  const report = success(helper(repo, 'audit'))
  assert.equal(report.worktrees[0].dirty, null)
  assert.match(report.worktrees[0].inspectionError, /filters/)
  const saved = success(helper(repo, 'backup'))
  assert.equal(saved.verified, true)
  await assert.rejects(fs.access(marker), { code: 'ENOENT' })
  assert.equal(await fs.readFile(path.join(repo, 'tracked.txt'), 'utf8'), 'BASE\n')
})

test('standalone backup respects SHA-256 storage and overrides a conflicting init default', async t => {
  const { directory, repo, base } = await fixture(t, 'sha256')
  const saved = success(helper(repo, 'backup', [], { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'init.defaultObjectFormat', GIT_CONFIG_VALUE_0: 'sha1' }))
  const record = JSON.parse(await fs.readFile(saved.receipt, 'utf8'))
  assert.equal(record.objectFormat, 'sha256')
  const restored = path.join(directory, 'restore-sha256')
  git(directory, 'init', '--quiet', '--bare', '--object-format=sha256', '--template=', restored)
  git(restored, 'fetch', '--quiet', saved.bundle, '+refs/recovery/*:refs/recovery/*')
  assert.equal(git(restored, 'rev-parse', 'refs/recovery/source/heads/main'), base)
  assert.equal(git(restored, 'show', `${base}:tracked.txt`), 'base')
})

test('submodule file inspection remains explicitly uncertain', async t => {
  const { repo, base } = await fixture(t)
  git(repo, 'update-index', '--add', '--cacheinfo', `160000,${base},submodule`)
  const report = success(helper(repo, 'audit'))
  assert.equal(report.worktrees[0].dirty, null)
  assert.match(report.worktrees[0].inspectionError, /Submodule/)
})

test('backup remains inside the actual common Git directory when its path ends in whitespace', async t => {
  const { directory, repo } = await fixture(t)
  const metadata = path.join(directory, 'git metadata ')
  git(repo, 'init', '--quiet', '--separate-git-dir', metadata, repo)
  const saved = success(helper(repo, 'backup'))
  assert.equal(path.dirname(saved.directory), path.join(metadata, 'cleanup-backups'))
  assert.equal(JSON.parse(await fs.readFile(saved.receipt, 'utf8')).commonGitDir, metadata)
  await assert.rejects(fs.access(path.join(metadata.trimEnd(), 'cleanup-backups')), { code: 'ENOENT' })
})

test('concurrent ref changes fail recovery verification and preserve both current refs and failed evidence', async t => {
  const { directory, repo, base } = await fixture(t)
  const bin = path.join(directory, 'bin')
  await fs.mkdir(bin)
  const realGit = execFileSync('which', ['git'], { env, encoding: 'utf8' }).trim()
  // Inject a real concurrent branch creation precisely when bundle creation begins.
  const wrapper = `#!${process.execPath}\nconst { execFileSync, spawnSync } = require('node:child_process')\nconst args = process.argv.slice(2)\nif (args.includes('bundle') && args.includes('create')) execFileSync(${JSON.stringify(realGit)}, ['-C', ${JSON.stringify(repo)}, 'branch', 'feature/concurrent', ${JSON.stringify(base)}])\nconst result = spawnSync(${JSON.stringify(realGit)}, args, { stdio: 'inherit' })\nprocess.exit(result.status ?? 1)\n`
  await fs.writeFile(path.join(bin, 'git'), wrapper, { mode: 0o700 })
  const result = helper(repo, 'backup', [], { PATH: bin + path.delimiter + env.PATH })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Recovery verification failed; do not clean up/)
  assert.equal(git(repo, 'rev-parse', 'feature/concurrent'), base)
  const parent = path.join(repo, '.git/cleanup-backups')
  const [entry] = await fs.readdir(parent)
  const record = JSON.parse(await fs.readFile(path.join(parent, entry, 'audit.json'), 'utf8'))
  assert.equal(record.verified, false)
  assert.match(record.failure, /changed during backup/)
  assert.equal(git(repo, 'rev-parse', 'main'), base)
})
