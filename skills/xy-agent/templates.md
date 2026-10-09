# Templates

Copy, then delete every placeholder you do not fill. An unfilled template section is worse than an absent one — it reads as an answer.

`xy agent lint` checks these shapes, and `xy check` runs it where AGENTS.md exists or `commands.agentLint` is declared. An AGENTS.md, adapter or docs index that departs from them draws warnings, which fail under `--strict` or `XY_STRICT=1`; only a missing AGENTS.md or a broken link in it is an error. On a toolchain without `xy agent`, use the same shapes anyway, so the upgrade does not break the gate.

## AGENTS.md

```markdown
# <Product> agent guidance

<Product> is <one sentence: what it is>. This repository is a <topology>
governed by the Aries `xy` toolchain, holding <inventory of what is
physically here>. This file is the entry point for every agent session;
read it in full before acting.

One rule governs the rest: **<the single constraint an agent must not
violate even where every other instruction is silent>.**

## Orient before acting

1. This file.
2. [docs/<HANDOFF>.md](docs/<HANDOFF>.md) — where the active effort stood
   on <date>. Dated: check it against `git log` before trusting a specific
   claim.
3. `pnpm xyex work list` — the open work items. <Keep this step only if
   `.xy/work/config.json` is committed; elsewhere the command creates the
   store.>

Then read only the authority for the task in hand, from the table below.
Do not read the papers end to end to make a scoped change.

## Authority: which document wins

| When the task touches | Authority | Status of that authority |
| --- | --- | --- |
| <task class> | [<path>](<path>) | <how much this answer is worth> |

`docs/evidence/*.md` are dated records of what passed once, under a named
commit and command. Cite them; do not edit one to match new behavior —
write a new evidence document instead.

## Repository map

| Path | What it holds | Handling |
| --- | --- | --- |
| [papers/](papers/) | <...> | Normative baseline |
| [docs/](docs/README.md) | Decisions, runbooks, plans, evidence, archive | Lifecycle tree; the index is generated |
| [references/](references/) | <...> | Immutable historical input — never edit |
| [generated/](generated/) | <...> | Never hand-edit; change <source> and run `<cmd>` |

## Commands you will actually need

| Command | Use |
| --- | --- |
| `<gate command — a repo script such as pnpm validate, or pnpm xy check && pnpm xy build && pnpm xy test>` | The complete local gate: <what it covers>. Excludes <what it does not> |

<The traps that bite repeatedly, stated compactly, with a pointer to the
full explanation.>

## Failures: what NOT to do

- <compiled from actual past mistakes, not imagined ones>

## Completion discipline

- <the gate to run>
- <actions that remain with the owner: publish, deploy, spend, alias>
```

`xy agent lint` finds the required sections by keyword. If you retitle one, keep its keyword (Orient, Authority, Repository map, Command, Fail), which matches on every toolchain version; [Required sections](agents-md.md#required-sections) lists the alternatives and the version that added each. Write every repository path as a Markdown link, never a code span or an `@path` import: the linter resolves links only, and an import would load its target into every session. Keep the authority table task-first, with the linked path in the column headed Authority, which is where `agents.authority-rows-resolve` reads it. Link every Authority cell to a target that contains `/` or ends in `.md` (a root `package.json` as `./package.json`): otherwise the rule takes the first such word anywhere in the row, and a task class such as "Build and CI/CD" warns as a missing file. `xy work` is experimental, hence `xyex`; usage is in the [xy-toolchain commands reference](../xy-toolchain/commands.md#skills-and-work-tracking). See [agents-md.md](agents-md.md) for what each section is for.

## CLAUDE.md

```markdown
@AGENTS.md
```

Keep the import alone, with at most an HTML comment above it. This is what `pnpm xy agent init` writes. `agents.adapter-thin` also accepts notes after the import, provided the import stays the first visible line. It reports a duplicate only when the notes repeat AGENTS.md's H1 and half its H2 headings, so keep any restatement out by hand. An import further down warns as `pointer-not-import`. Prefer a `.claude/rules/` file (template below) for Claude-only instructions, and put instructions every agent needs in AGENTS.md.

A symlink (`ln -s AGENTS.md CLAUDE.md`) also passes `xy agent lint`, but prefer the file. Experimental `xyex plan lint` rejects a symlinked CLAUDE.md, Claude's Edit and Write tools refuse to write through it, and a Windows clone without `core.symlinks` gets a one-line text file instead of the instructions.

## GEMINI.md

Gemini CLI loads `GEMINI.md`, not AGENTS.md, by default, and expands `@file` imports. Either commit the same one-line adapter:

```markdown
@AGENTS.md
```

or omit GEMINI.md (an absent adapter passes) and point Gemini at AGENTS.md in a committed `.gemini/settings.json`:

```json
{
  "context": {
    "fileName": ["AGENTS.md", "GEMINI.md"]
  }
}
```

## .github/copilot-instructions.md

Default: do not create it. An absent file passes, and Copilot's cloud agent, Copilot CLI and Copilot Chat in VS Code read AGENTS.md directly. Copilot Chat on github.com and in Visual Studio, JetBrains, Eclipse and Xcode does not read AGENTS.md; it reads this file. If the team relies on those surfaces, symlink it so they get the full instructions, and confirm the surface picks it up:

```bash
ln -s ../AGENTS.md .github/copilot-instructions.md
```

Copilot documents no `@` import, so a one-line `@AGENTS.md` file gives those surfaces nothing. If a repository genuinely needs Copilot-only text here, write a regular file that links to AGENTS.md and adds only that text; `agents.adapter-thin` passes it:

```markdown
Follow the repository instructions in [AGENTS.md](../AGENTS.md).

<Copilot-only instructions>
```

A link is a pointer, not an import, so do not rely on Copilot following it. A file with no link to AGENTS.md warns. Copilot path rules go in `.github/instructions/` (below).

## Decision record

`docs/decisions/<id>-kebab-title.md` — name and number it as [lifecycle.md](lifecycle.md) describes, keeping the scheme the repository already uses.

```markdown
---
title: "<Decision, stated as a rule>"
kind: decision
state: normative
date: "YYYY-MM-DD"
status: "accepted YYYY-MM-DD"
workItems: []
---

# <id> — <Title>

## Context

<What forced a choice. The constraints that were real at the time.>

## Decision

<What was chosen, stated as a rule someone can follow.>

## Consequences

<What this commits the project to, including what it forecloses.>

## Revisit triggers

- <Observable condition under which this should be reconsidered.>
```

## Evidence record

`docs/evidence/YYYY-MM-DD-slug.md`

```markdown
---
title: "<What was demonstrated> — YYYY-MM-DD evidence"
kind: evidence
state: active
date: "YYYY-MM-DD"
commit: "<sha>"
workItems: [<XYW-...>]
---

# <What was demonstrated> — YYYY-MM-DD evidence

<One paragraph: what ran, where, and what it establishes.>

**Tier.** This is <local | local-chain | testnet | hosted> evidence. It
does not establish <the tiers it explicitly does not>.

## Command

<the exact command, and the commit it ran at>

## Result

<counts, hashes, identifiers — the specifics a reader would otherwise
have to re-derive>
```

## Runbook

`docs/runbooks/<NAME>.md`

```markdown
---
title: "<System> runbook"
kind: runbook
state: active
date: "YYYY-MM-DD"
reviewed: "YYYY-MM-DD"
status: "<what is live, and what this does not cover>"
---

# <System> Runbook

Status: **<current | retained as specification only>**
Last verified: YYYY-MM-DD

## What is still true, and what is not

<Say this explicitly whenever any part of the procedure has been
overtaken. A runbook is the one tier that is dangerous when stale.>

## Procedure

<numbered steps, with the exact commands>

## Recovery

<what to do when a step fails>
```

## Archive banner

Prepend when moving a file into `docs/archive/`, where it keeps its path below `docs/`. Links resolve from the file's new location, one folder deeper: from `docs/archive/plans/`, a successor in `docs/plans/` is `../../plans/NEW.md`.

```markdown
> **Archived YYYY-MM-DD.** Superseded by [`docs/plans/NEW.md`](../../plans/NEW.md).
> Original path: `docs/plans/OLD.md`. Retained as a record of the design that
> was current until that date; do not follow it.
```

For a retirement with no successor:

```markdown
> **Archived YYYY-MM-DD.** Retired: <why it no longer applies>. Original
> path: `docs/runbooks/OLD.md`. Nothing supersedes it.
```

`pnpm xy agent archive <path>` moves the file and regenerates the index. It keeps the path below `docs/`, sets `state: retired` unless the document is already `superseded`, leaves the rest of the front matter alone, and prepends its own dated banner with the successor from `supersededBy`, or "Retired", and the original path. Write `<path>` as `docs/…`, not `./docs/…` or an absolute path, or the file lands flat in `docs/archive/`. Add the reason to a retirement banner, or replace it with one of these. See [lifecycle.md](lifecycle.md#archiving).

## docs/README.md

Do not write this file. Run `pnpm xy agent index` after any change under `docs/`. `xy agent lint --fix`, `xy check --fix` (where it runs agent lint) and `xy agent archive` regenerate it too, and `xy agent init` and `xy repo init` create it when missing. `xy agent lint` warns with `docs.index-current` when the committed file differs from the generated text at all, which fails `xy check --strict`.

The generator writes exactly this shape: one row per `docs/**/*.md` except the index itself, sorted by path, with the front-matter `status`, or `state` when there is no `status`.

```markdown
# Docs

| Document | Kind | Status |
| --- | --- | --- |
| [archive/plans/OLD.md](archive/plans/OLD.md) | plan | superseded |
| [decisions/<id>-....md](decisions/<id>-....md) | decision | accepted 2026-08-22 |
| [evidence/2026-08-29-....md](evidence/2026-08-29-....md) | evidence | active |
```

Keep `status` to one line with no `|`, because it lands in a table cell. `papers/` and `specs/` are not indexed; AGENTS.md links them directly. On a toolchain without `xy agent`, maintain the file by hand in exactly this shape.

## .claude/rules/ path-scoped rule

For instructions that apply to a file pattern rather than every session:

```markdown
---
paths:
  - "packages/*/src/**/*.ts"
---

# <Topic>

<Instructions that only matter when touching matching files.>
```

Only Claude Code reads `.claude/rules/`. Omit `paths:` for a Claude-only instruction that applies in every session: such a file loads unconditionally, and it keeps that text out of the CLAUDE.md adapter. A rule every agent must follow stays in AGENTS.md. Copilot's equivalent is `.github/instructions/<name>.instructions.md`, with an `applyTo:` glob in front matter instead of `paths:`.
