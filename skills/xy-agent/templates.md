# Templates

Copy, then delete every placeholder you do not fill. An unfilled template section is worse than an absent one — it reads as an answer.

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
2. `docs/<HANDOFF>.md` — where the active effort stood on <date>. Dated:
   check it against `git log` before trusting a specific claim.
3. `pnpm xy work list` — the open work items.

Then read only the authority for the task in hand, from the table below.
Do not read the papers end to end to make a scoped change.

## Which document is authoritative

| When the task touches | Authority | Status of that authority |
| --- | --- | --- |
| <task class> | `<path>` | <how much this answer is worth> |

`docs/evidence/*.md` are dated records of what passed once, under a named
commit and command. Cite them; do not edit one to match new behavior —
write a new evidence document instead.

## Repository map

| Path | What it holds | Handling |
| --- | --- | --- |
| `papers/` | <...> | Normative baseline |
| `references/` | <...> | Immutable historical input — never edit |
| `generated/` | <...> | Never hand-edit; change <source> and run `<cmd>` |

## Commands you will actually need

| Command | Use |
| --- | --- |
| `pnpm validate` | The complete local gate: <what it covers>. Excludes <what it does not> |

<The traps that bite repeatedly, stated compactly, with a pointer to the
full explanation.>

## What NOT to do

- <compiled from actual past mistakes, not imagined ones>

## Completion discipline

- <the gate to run>
- <actions that remain with the owner: publish, deploy, spend, alias>
```

## CLAUDE.md

```markdown
@AGENTS.md

## Claude Code

<Claude-specific additions only — delete this section if there are none>
```

Or, with nothing Claude-specific to add:

```bash
ln -s AGENTS.md CLAUDE.md
```

## .github/copilot-instructions.md

```markdown
# <Product>

Repository guidance lives in [`AGENTS.md`](../AGENTS.md). Read it first.

## Copilot-specific

<additions only>
```

## Decision record

`docs/decisions/<PREFIX>-D0001-kebab-title.md`

```markdown
---
title: "<Decision, stated as a rule>"
kind: decision
state: normative
date: "YYYY-MM-DD"
status: "accepted YYYY-MM-DD"
workItems: []
---

# <PREFIX>-D0001 — <Title>

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

Prepend when moving a file into `docs/archive/`:

```markdown
> **Archived YYYY-MM-DD.** Superseded by [`docs/plans/NEW.md`](../plans/NEW.md).
> Original path: `docs/plans/OLD.md`. Retained as a record of the design that
> was current until that date; do not follow it.
```

For a retirement with no successor:

```markdown
> **Archived YYYY-MM-DD.** Retired: <why it no longer applies>. Original
> path: `docs/runbooks/OLD.md`. Nothing supersedes it.
```

## docs/README.md

Generated — do not hand-edit. Regenerate whenever anything under `docs/` changes.

```markdown
<!-- Generated. Do not edit. Run: pnpm xy agent index -->

# <Product> documentation

The authority table in [`AGENTS.md`](../AGENTS.md) says which document to
read for a given task. This is the full inventory.

| Document | Kind | State | Date | Title |
| --- | --- | --- | --- | --- |
| `decisions/CC-D0001-....md` | decision | normative | 2026-08-22 | ... |
| `evidence/2026-08-29-....md` | evidence | active | 2026-08-29 | ... |
| `archive/plans/....md` | plan | superseded | 2026-07-14 | ... |
```

## .claude/rules/ path-scoped rule

For instructions that apply to a file pattern rather than every session:

```markdown
---
paths:
  - "packages/*/src/**/*.ts"
---

# <Topic>

<Instructions that only matter when touching matching files. This is
where AGENTS.md overflow belongs.>
```
