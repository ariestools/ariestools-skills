# Auditing and Maintenance

Documentation rots silently. An audit makes the rot visible and turns it into tracked work.

Run one when asked, when you notice a document contradicting the code, or before declaring a documentation task complete.

## Tooling

The stable `xy agent` command implements this catalog:

```text
pnpm xy agent lint            run the catalog. --rules (ids and levels), --json, --strict, --fix
pnpm xy agent audit           the lifecycle subset: live state, evidence, orphans, staleness, supersession
pnpm xy agent init            create missing files only: placeholder AGENTS.md, CLAUDE.md import,
                              docs/ tier folders, index. Absorbs nothing, never overwrites
pnpm xy agent index           regenerate docs/README.md from front matter
pnpm xy agent archive <path>  move under docs/archive/, keeping the path below docs/; set state: retired
                              unless superseded; write a dated banner; refresh the index.
                              Write <path> as docs/…, never ./docs/… or an absolute path
```

`xy check` runs `xy agent lint` only where a root `AGENTS.md` exists or the xy config declares `commands.agentLint`, and only `agents.file-present` and `agents.links-resolve` are errors by default. Every other finding warns, and fails the gate only under `--strict` or `XY_STRICT=1`. A repository tunes levels through `commands.agentLint.rules` in `xy.config.ts` — declaring that key also opts `xy check` in — and the thresholds are fixed. The banner `xy agent archive` writes names the successor or says "Retired"; add the reason for a retirement by hand, as the [archive procedure](lifecycle.md#archiving) shows. No rule covers document–code drift; that review stays manual.

**Check `pnpm xy --help` before assuming the command exists.** A toolchain without it prints `Command not found [agent]` and exits 0, which reads like a pass. Run the checks by hand there, and keep the [template](templates.md) shapes so the upgrade does not break the gate. On 10.1.1, read [Toolchain 10.1.1](#toolchain-1011) before trusting a result or running a fixer.

**Only structural fixers are safe:** index regeneration, archiving, and inserting missing front matter, because their failure is visible. Those are the fixers that ship — `xy agent lint --fix` (also run by `xy check --fix` wherever `xy check` runs agent lint) regenerates `docs/README.md` and gives a file with no front matter a `kind` inferred from its folder, and `xy agent index` and `xy agent archive` do the rest. The inferred kind is `decision`, `evidence`, `runbook` or `plan` under the matching `docs/` folder, `paper` under `papers/`, and `spec` under `specs/`; any other file keeps its `docs.front-matter` warning. **Never write a fixer that rewrites prose.** A prose fixer that gets it wrong reports success and leaves a document that reads plausibly and says the wrong thing.

An audit runs `xy agent lint` and `xy check` without `--fix` and proposes fixes to the owner first. After a front-matter fix, check each inferred `kind` and add the rest of the front matter by hand; the same run builds the index from the new front matter.

**Related linters.** Stable `xy repo lint`, also part of `xy check`, requires a consumer `README.md` in each workspace package. Experimental `pnpm xyex plan lint` is not part of `xy check` and is not authoritative here: its layout (fixed paper names, `docs/ROADMAP.md`, `notes/`) conflicts with this catalog in places. Never run `xyex plan lint --fix` during an audit — it scaffolds files, prepends `@AGENTS.md` to an existing `CLAUDE.md`, and moves non-canonical `papers/` files into `notes/`. If a repository's `.xy/plan.json` sets `metadata.source: manifest`, lifecycle metadata lives in the manifest: expect `docs.front-matter` warnings and lower that rule rather than running `--fix`.

### Toolchain 10.1.1

This skill describes `xy agent` as it behaves from 10.1.2. On 10.1.1 it differs in ways that fail the gate or damage files:

- `xy check` runs agent lint in every repository, so a repository without `AGENTS.md` fails. Adopt the pattern or, with the owner's agreement, turn the failing rules off in `commands.agentLint.rules`.
- `agents.adapter-thin`, `agents.required-sections`, `agents.no-absolute-paths` and `docs.index-current` are errors.
- `agents.required-sections` does not match *authoritative*, *what not to do* or *pitfall*. The [AGENTS.md template](templates.md#agentsmd) headings match on every version.
- An adapter passes only as a symlink or a lone `@AGENTS.md` line.
- `supersededBy` resolves only relative to the document, so write it relative to the archived location.
- `xy agent lint --fix` writes `kind: doc` and builds the index from the old front matter. Replace each `kind: doc` with the real kind, then run `pnpm xy agent index`.
- `xy agent archive` moves the file flat to `docs/archive/<name>`, sets `state: archived`, writes a generic banner, and strips quotes and block lists from the front matter. Restore the front matter, replace the banner, and set `superseded` or `retired`.

The 10.1.2 row of the xy-toolchain skill's [Version notes](../xy-toolchain/toolchain.md#version-notes) lists every change from 10.1.1.

## Check catalog

Each check is objectively decidable. Levels are defaults; a repository may tune them.

### Entry point

| Check | Rule | Level | What it means |
|---|---|---|---|
| `AGENTS.md` exists at the repository root | `agents.file-present` | error | Nothing else in this convention applies without it |
| Adapters are thin | `agents.adapter-thin` | warn | `CLAUDE.md` and `GEMINI.md` are absent, a symlink to `AGENTS.md`, or a file whose first visible line is `@AGENTS.md` (an HTML comment may sit above it). Tool-specific notes may follow the import, but never a copy or restatement of `AGENTS.md`. `.github/copilot-instructions.md` is absent, a symlink, or links to `AGENTS.md` |
| H1 names the product, not the filename | `agents.h1-not-filename` | warn | `# AGENTS.md` is what forces a maintainer to keep two copies |
| Required sections present | `agents.required-sections` | warn | Orient, authority, repository map, commands, failures. Headings are matched by keyword: `orient`, `overview`, `what this` or `about this`; `authorit` (authority, authoritative); `repository map`, `repo map`, `layout` or `packages`; `command`; and `fail`, `troubleshoot`, `what not to do` or `pitfall` |
| Within the size budget | `agents.size-budget` | warn | Under 200 lines: a file `wc -l` counts at 200 already warns |
| Every link resolves | `agents.links-resolve` | error | The single highest-value check — it catches renames, deletions, and moved packages |
| No absolute machine paths | `agents.no-absolute-paths` | warn | No `/Users/...` or `/home/...` in `AGENTS.md`, an adapter, a `packages/*/AGENTS.md`, or any Markdown under `docs/`, `papers/`, or `specs/` — example paths and pasted output included. Write `~/`, `$HOME/`, or `<repo>/`, and redact output before committing an evidence document: it cannot be cleaned up later without `amends` |
| No live state | `agents.no-live-state` | warn | Task assignments, branch names, claim state, in-flight status |
| Nested files are delta-only | `agents.nested-delta-only` | warn | A `packages/*/AGENTS.md` that restates the root |
| Authority rows resolve | `agents.authority-rows-resolve` | warn | Each row points at a file that exists, whose `kind` matches the table's Kind column where it has one |

### Documents

| Check | Rule | Level | What it means |
|---|---|---|---|
| Front matter present and valid | `docs.front-matter` | warn | Error under `--strict` once a repository has migrated |
| Index is current | `docs.index-current` | warn | `docs/README.md` matches what `pnpm xy agent index` generates from front matter |
| Superseded documents are archived | `docs.superseded-archived` | warn | `state: superseded` or `retired` ⇒ file is under `docs/archive/`; `superseded` ⇒ `supersededBy` resolves, relative to the file or from the repository root |
| Evidence documents are immutable | `docs.evidence-immutable` | warn | More than one content commit on a `docs/evidence/` file. Escape hatch: an `amends:` field |
| Nothing is stale | `docs.stale` | warn | `reviewed` (or `date`) older than 180 days; runbooks 90. Applies to documents edited in place — runbooks, handoffs, other active documents. `evidence/`, `decisions/`, `archive/`, and any `superseded` or `retired` document are exempt, and a stale plan is a prompt to supersede it, not a defect |
| No orphans | `docs.orphan` | warn | Not linked from `AGENTS.md` or another hand-written document. A row in the generated index does not count |
| Decision naming is consistent | `decisions.naming` | warn | One scheme; ids unique and contiguous; each carries a state |
| Paper headers are consistent | `papers.header` | warn | Version, status, date present, and matching any visible header block |

### Where the shipped rules differ

Read findings with these gaps in mind:

- `agents.links-resolve` checks only Markdown links (`[text](path)`), relative to `AGENTS.md`. Write repository paths as links; a code-span path is never checked.
- `agents.authority-rows-resolve` reads the first `##` section whose heading contains "authorit". It takes each row's path from the column headed Authority, Document or Path (column 1 when no column is), preferring a Markdown link's target, and otherwise from the first cell that holds a path. Only a word that contains `/` or ends in `.md` counts as a path, link targets included, so with `[package.json](package.json)` the rule reads another cell, often the task class; write `./package.json`. It compares `kind` with the column headed Kind; when no header cell names Authority, Document, Path or Kind, it treats every row as data and reads column 2 as the kind.
- `agents.no-live-state` matches "claimed by", "assigned to", "in-flight" and "in flight" even inside a prohibition, and any `feature/`, `fix/`, or `hotfix/` followed by a name. Write branch conventions as `feature/<name>`, and phrase prohibitions without the trigger words.
- `docs.front-matter` checks only that front matter and `kind` exist, and skips `README.md` files. Values and per-kind fields are not validated.
- `docs.stale` does not skip `README.md` files, so a dated `papers/README.md`, such as the one `xy repo init` writes, warns 180 days after its `date`. Re-read it and add or update `reviewed`.
- `decisions.naming` parses `<PREFIX>-D<n>` (such as `CC-D021`), `ADR-<n>` and `<n>-` ids, and treats a `YYYYMMDD-` prefix as a dated scheme. Dated names and other schemes, such as `D-004-…`, are not checked for uniqueness or gaps.
- The walker also lints Markdown under `docs/`, `papers/` and `specs/` that `.gitignore` excludes, such as a generated dump ([Where docs/ is not called docs/](structure.md#where-docs-is-not-called-docs)).

## Running the checks

Run the linter first:

```bash
pnpm xy agent lint --json     # the whole catalog
pnpm xy agent audit --json    # the lifecycle subset
```

Then run the code-span check below, which the linter does not cover, and the drift review in the next section.

Without `xy agent`, or to look past the gaps above, run the checks by hand. The scripts read tracked files only; the linter also reads untracked ones.

```bash
# Markdown links in AGENTS.md that no longer resolve
grep -oE '\]\([^)#[:space:]]+' AGENTS.md | sed 's/^](//' | grep -vE '^(https?|mailto):' \
  | sort -u | while read -r p; do [ -e "$p" ] || echo "MISSING $p"; done

# code-span paths. These resolve from the root, so a package-relative path
# in prose can report a false MISSING
grep -oE '`[a-zA-Z0-9._/-]+\.(md|json|ts|tsx|mjs|astro)`' AGENTS.md \
  | tr -d '`' | sort -u | while read -r p; do [ -e "$p" ] || echo "MISSING $p"; done

# absolute machine paths, in every file the linter reads
git ls-files AGENTS.md CLAUDE.md GEMINI.md .github/copilot-instructions.md 'packages/*/AGENTS.md' \
  ':(glob)docs/**/*.md' ':(glob)papers/**/*.md' ':(glob)specs/**/*.md' | xargs grep -nE '/(Users|home)/'

# adapters: absent, a symlink to AGENTS.md, or leading with the @AGENTS.md import.
# Then read any notes below the import: they must not restate AGENTS.md
for f in CLAUDE.md GEMINI.md; do
  if [ -L "$f" ]; then echo "$f -> $(readlink "$f")"
  elif [ -f "$f" ]; then
    case "$(sed 's/<!--.*-->//g' "$f" | grep -v '^[[:space:]]*$' | head -n 1 | tr -d '[:space:]')" in
      '@AGENTS.md'|'@./AGENTS.md') ;;
      *) echo "NO LEADING IMPORT $f" ;;
    esac
  fi
done
# Copilot: absent, a symlink, or a link to ../AGENTS.md
f=.github/copilot-instructions.md
if [ -L "$f" ]; then echo "$f -> $(readlink "$f")"
elif [ -f "$f" ]; then
  grep -qE '\]\(\.\./AGENTS\.md[)#]|^[[:space:]]*@(\.\./|\./)?AGENTS\.md[[:space:]]*$' "$f" || echo "NO AGENTS.md LINK $f"
fi

# evidence documents edited after creation (amends: is the escape hatch)
for f in $(git ls-files ':(glob)docs/evidence/**/*.md'); do
  grep -q '^amends:' "$f" && continue
  n=$(git log --oneline -- "$f" | wc -l)
  [ "$n" -gt 1 ] && echo "$n commits: $f"
done

# documents nothing links to (a mention in the generated index does not count)
for f in $(git ls-files ':(glob)docs/**/*.md' | grep -vx 'docs/README.md'); do
  grep -qF "$(basename "$f")" AGENTS.md \
    $(git ls-files ':(glob)docs/**/*.md' | grep -vx -e 'docs/README.md' -e "$f") \
    || echo "ORPHAN $f"
done

# size budget
wc -l AGENTS.md
```

If you search outside `git ls-files`, skip `.claude/worktrees/`, `node_modules/`, and any nested git checkout — a worktree holds a scratch copy of the repository, and linting it produces findings that belong to a different branch. The linter's walker already skips them.

## Detecting document–code drift

This is the check no tool can fully automate, and the one worth the most. When working in an area, compare what the documents claim against what the code does:

- Does the authority table name a status the code has outgrown?
- Does a repository map row describe a directory that has moved?
- Does an evidence document describe a surface that no longer exists?
- Does a paper specify behavior the implementation has since diverged from?

When you find a divergence, **write it into the `## Known divergences between documents and code` section of `AGENTS.md`** rather than fixing the code to match a superseded document. State which side is currently authoritative — usually the code and its passing gate — and raise the document lag as work. Retire the entry when it is resolved, so the section stays short enough to read.

## Turning findings into work

Audit findings become `xy work` items. `work` is experimental, so use `pnpm xyex work …`. Follow the rules for machine-generated items in the [xy-toolchain work reference](../xy-toolchain/commands.md#skills-and-work-tracking): get consent before the first `work` command, deduplicate by anchor and tag, fill in the triage fields, and close the loop with `work sync`. For a documentation audit:

- Anchor each item to the document it is about (`--file docs/plans/X.md`) and tag every item `docs-audit`, so a rerun finds and updates its own items:

  ```bash
  pnpm xyex work add debt "Reconcile docs/plans/X.md" --file docs/plans/X.md --tag docs-audit \
    --area docs --impact 2 --urgency 2 --acceptance "<what done looks like>" --verify "pnpm xy agent lint"
  ```

- Mark an item done when its finding is resolved, or wontfix when the owner rejects it. An audit that only ever opens items is a ratchet.

Batch findings by document rather than by check. One item saying "reconcile `docs/plans/X.md`: superseded, unarchived, two dead links" is actionable; three items about the same file are noise.

`.xy/work/` is a durable **backlog**, not a live coordination plane. It is a tracked file store: each worktree sees its own snapshot, and concurrent writers make it a merge hotspot. Claims are advisory, not exclusive — `work claim` overwrites an already-claimed item — so do not use them to coordinate concurrent agents. An audit only adds or queues items.

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
- `docs/README.md` regenerated with `pnpm xy agent index` if anything under `docs/` changed.
- Superseded documents actually moved to `archive/`, with banners.
- Every path you referenced resolves.
- `AGENTS.md` still within budget, and its authority table updated if you added an authority.
- New evidence documents name a commit and state which tiers they do *not* establish.
- `pnpm xy agent lint` reports no new errors and no new warnings, apart from an expected `docs.orphan` on an archived record that nothing else names. Most rules only warn, so a clean error count is not enough.
