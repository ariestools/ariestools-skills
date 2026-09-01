# Auditing and Maintenance

Documentation rots silently. An audit makes the rot visible and turns it into tracked work.

Run one when asked, when you notice a document contradicting the code, or before declaring a documentation task complete.

## Tooling status

**There is no `xy agent` command yet.** The checks below are performed by hand today, using `grep`, `git log`, and reading. This section is the specification the toolchain will implement; do not tell a user to run a command that does not exist, and check `pnpm xy --help` before assuming otherwise.

When it ships, the intended surface is:

```text
xy agent lint      run the check catalog. --rules, --json, --strict, --fix
xy agent init      scaffold the pattern; absorbs existing content, never overwrites
xy agent audit     staleness, orphans, unarchived supersessions, doc↔code drift
xy agent index     regenerate docs/README.md from front matter
xy agent archive   <path> → docs/archive/ with banner, state, and index refresh
```

Only `index` and `archive` are safe to automate as fixers. **Never write a fixer that rewrites prose.** Structural fixes — move a file, regenerate the index, insert a missing front-matter key — are safe because their failure is visible. A prose fixer that gets it wrong reports success and leaves a document that reads plausibly and says the wrong thing.

## Check catalog

Each check is objectively decidable. Levels are defaults; a repository may tune them.

### Entry point

| Check | Level | What it means |
|---|---|---|
| `AGENTS.md` exists at the repository root | error | Nothing else in this convention applies without it |
| Adapters are thin | error | `CLAUDE.md` is an `@AGENTS.md` import, a symlink, or absent — never a copy, never a divergent file. Same for `.github/copilot-instructions.md` and `GEMINI.md` |
| H1 names the product, not the filename | warn | `# AGENTS.md` is what forces a maintainer to keep two copies |
| Required sections present | error | Orient, authority table, repository map, commands, failures |
| Within the size budget | warn | Default 200 lines |
| Every path and link resolves | error | The single highest-value check — it catches renames, deletions, and moved packages |
| No absolute machine paths | error | `/Users/...` in a committed instruction file |
| No live state | warn | Task assignments, branch names, claim state, in-flight status |
| Nested files are delta-only | warn | A `packages/*/AGENTS.md` that restates the root |
| Authority rows resolve | warn | Each row points at a file that exists, whose `kind` matches the claim |

### Documents

| Check | Level | What it means |
|---|---|---|
| Front matter present and valid | warn | Error under `--strict` once a repository has migrated |
| Index is current | error | `docs/README.md` matches what the front matter would generate |
| Superseded documents are archived | warn | `state: superseded` ⇒ `supersededBy` resolves ⇒ file is under `archive/` |
| Evidence documents are immutable | warn | More than one content commit on a `docs/evidence/` file. Escape hatch: an `amends:` field |
| Nothing is stale | warn | `reviewed` (or `date`) older than the threshold. Default 180 days; runbooks 90 |
| No orphans | warn | Not linked from `AGENTS.md`, the index, or another document |
| Decision naming is consistent | warn | One scheme; ids unique and contiguous; each carries a state |
| Paper headers are consistent | warn | Version, status, date present, and matching any visible header block |

## Running the checks by hand

```bash
# links from AGENTS.md that no longer resolve
grep -oE '`[a-zA-Z0-9._/-]+\.(md|json|ts|tsx|mjs|astro)`' AGENTS.md \
  | tr -d '`' | sort -u | while read -r p; do [ -e "$p" ] || echo "MISSING $p"; done

# absolute machine paths
grep -rn '/Users/\|/home/' AGENTS.md CLAUDE.md .github/copilot-instructions.md 2>/dev/null

# is the adapter a copy rather than an import?
[ -f CLAUDE.md ] && { head -1 CLAUDE.md; wc -c < CLAUDE.md; }
diff -q AGENTS.md CLAUDE.md 2>/dev/null && echo "DUPLICATE — collapse to an import"

# evidence documents edited after creation
for f in docs/evidence/*.md; do
  n=$(git log --oneline -- "$f" | wc -l)
  [ "$n" -gt 1 ] && echo "$n commits: $f"
done

# documents nothing links to
for f in $(git ls-files 'docs/**/*.md'); do
  grep -rqF "$(basename "$f")" AGENTS.md docs/README.md $(git ls-files 'docs/**/*.md' | grep -v "^$f$") \
    || echo "ORPHAN $f"
done

# size budget
wc -l AGENTS.md
```

Skip `.claude/worktrees/`, `node_modules/`, and any nested git checkout — a worktree holds a scratch copy of the repository, and linting it produces findings that belong to a different branch.

## Detecting document–code drift

This is the check no tool can fully automate, and the one worth the most. When working in an area, compare what the documents claim against what the code does:

- Does the authority table name a status the code has outgrown?
- Does a repository map row describe a directory that has moved?
- Does an evidence document describe a surface that no longer exists?
- Does a paper specify behavior the implementation has since diverged from?

When you find a divergence, **write it into the `## Known divergences` section of `AGENTS.md`** rather than fixing the code to match a superseded document. State which side is currently authoritative — usually the code and its passing gate — and raise the document lag as work. Retire the entry when it is resolved, so the section stays short enough to read.

## Turning findings into work

Audit findings become `xy work` items. Four constraints, from the implementation:

- **Use a deterministic id.** `createWorkId` embeds today's date, so a re-derived id changes daily and every run creates a duplicate. Pass an explicit stable id derived from the check and the path, and check existence before adding.
- **Suppress the GitHub dual-write for machine-generated items,** or confirm with the operator first. It is enabled by default and opens a real issue per item as soon as `gh` is authenticated.
- **Supply `area`, priority, acceptance criteria, and verification.** An item missing any of them is flagged as untriaged and will drown `xy work triage`.
- **Close the loop.** When a finding is resolved, `xy work done --evidence <text>` — an audit that only ever opens items is a ratchet.

Batch findings by document rather than by check. One item saying "reconcile `docs/plans/X.md`: superseded, unarchived, two dead links" is actionable; three items about the same file are noise.

`.xy/work/` is a durable **backlog**, not a live coordination plane. It is a tracked file store — each worktree sees its own snapshot, concurrent writers make it a merge hotspot, and there is no lease or compare-and-swap. Queue work there; do not claim work there.

## Suggesting maintenance without doing it

Most audits should end in a proposal, not a rewrite. Documentation carries intent that is not always visible in the file, and archiving something an owner still considers live is worse than leaving it.

Propose, with the evidence for each:

- Documents to archive, and what supersedes them.
- Documents past their review threshold, with how far past.
- Divergences to record in `AGENTS.md`.
- Sections to move out of an over-budget `AGENTS.md`, and where to.

Then act on what the owner confirms. Archiving, index regeneration, and front-matter insertion are safe to do directly once agreed; rewriting a paper or a decision record is not.

## Before declaring a documentation task complete

- Front matter is present and correct on every file you added or changed.
- `docs/README.md` regenerated if anything under `docs/` changed.
- Superseded documents actually moved to `archive/`, with banners.
- Every path you referenced resolves.
- `AGENTS.md` still within budget, and its authority table updated if you added an authority.
- New evidence documents name a commit and state which tiers they do *not* establish.
