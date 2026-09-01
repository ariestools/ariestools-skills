# Document Lifecycle

Every document under `docs/`, `papers/`, and `specs/` carries YAML front matter. The prose is for humans; the front matter is the machine layer that makes rot detectable.

## Front-matter schema

```yaml
---
title: "Gate 1 — Find the Remote (virtual): specification"
kind: spec                       # paper|spec|decision|plan|runbook|evidence|handoff|research
state: normative                 # draft|active|normative|superseded|retired
version: "1.0"                   # required for kind: paper|spec
date: "2026-08-22"               # created, or last substantive revision
reviewed: "2026-08-22"           # required for kind: runbook
commit: "c3efe88"                # required for kind: evidence
status: "ratified by the owner 2026-08-22; supersedes MVP_Refocus.md §2"
supersededBy: docs/plans/NEW.md  # required when state: superseded
workItems: [XYW-20260828-44CAFA]
audience: "Project owner; engineering thread"
---
```

`status` is free prose and carries the nuance no enum will: who ratified it, what it supersedes, which section, and under what conditions. Keep it. The enumerated fields exist so a tool can act; `status` exists so a human understands.

Where a document already shows a visible header block under its H1 (`- **Version:** 0.4.6-draft`), keep it — papers in particular benefit from wearing their status on their face. Just keep the two consistent.

## The state vocabulary

| State | Meaning | Where it lives |
|---|---|---|
| `draft` | Being written; not yet binding on anyone | `docs/plans/`, or beside its target |
| `active` | Current and in use, but not normative | `docs/` |
| `normative` | Binding. Code must conform to it | `papers/`, `specs/` |
| `superseded` | A named successor replaced it | `docs/archive/` |
| `retired` | No successor; no longer applies | `docs/archive/` |

`state` describes the document. `status` describes the *situation*. A specification can be `state: normative` while its `status` says its evidence tier is only "Specified" — normative and unproven are different axes, and conflating them is how a repository starts claiming things it has not earned.

**Keep authority separate from evidence.** That a requirement is binding says nothing about whether it has been demonstrated. Report them separately, always.

## Decision records

One decision per file in `docs/decisions/`, named `<PREFIX>-D0001-kebab-title.md`, where `PREFIX` is the repository's short code (`CC`, `IMM`, `EK`). Put the id in the filename — decisions get cited across documents, and an id that lives only in prose cannot be found.

A decision record is **immutable once accepted**. Revisit a decision by writing a new one that supersedes it; do not edit history into agreement with the present.

Every record carries:

- **Context** — what forced a choice.
- **Decision** — what was chosen, stated as a rule.
- **Consequences** — what this now commits the project to, including what it forecloses.
- **Revisit triggers** — the concrete conditions under which this should be reconsidered.

**Revisit triggers are the field that matters most and the one most often omitted.** Without them, nobody can tell a still-correct decision from a fossil, and an audit cannot either. Write them as observable conditions: *"Review when a second real runtime adapter appears, or when external consumers require a stable composition facade."*

Keep `docs/decisions/README.md` as a register — id, title, state, date — or let the generated index cover it. Do not maintain both by hand.

## Evidence documents

An evidence document records **what passed, once, under a named commit and command**. Name it `docs/evidence/YYYY-MM-DD-slug.md` so the directory sorts chronologically.

Rules:

- **Cite an evidence document; never edit one to match new behavior.** If behavior changed, write a new evidence document. The old one remains true about the commit it names.
- **Name the commit.** `commit:` in front matter, and the exact command in the body. An evidence document that does not say where it was true proves nothing.
- **Name the tier, and name the tiers it does not establish.** "This is local Node evidence, not hosted or production qualification." Negative statements are what keep an evidence document from being over-read later.
- Record counts, hashes, identifiers — the specifics a reader would otherwise have to re-derive.

If an evidence document must be corrected — a broken link, a wrong path — record the correction in an `amends:` field rather than silently rewriting it.

## Runbooks

A runbook is a live document and the only tier that is dangerous when stale. Every runbook carries `reviewed:` and is re-verified on a cadence.

When the system a runbook describes is retired, do not delete the runbook if it still specifies behavior that exists elsewhere. State plainly at the top what is still true and what is not, set `state` accordingly, and archive it when nothing depends on it.

## Supersession

When one document replaces another:

1. Set `state: superseded` and `supersededBy: <path>` on the old document.
2. State in the new document's `status` what it supersedes, down to the section where the overlap is partial.
3. Move the old document to `docs/archive/` with a retirement banner.
4. Regenerate the index.

A superseded document that stays in place is worse than a deleted one: it looks current, and the next agent has no way to tell.

## Archiving

Archive rather than delete. The document is evidence of what was believed and when.

Move the file to `docs/archive/`, preserving its original relative path where that carries meaning, and prepend the banner:

```markdown
> **Archived 2026-09-01.** Superseded by [`docs/plans/NEW.md`](../plans/NEW.md).
> Original path: `docs/plans/OLD.md`. Retained as a record of the design
> that was current until that date; do not follow it.
```

Set `state`, keep `date` as written, and regenerate the index.

**What is archivable:** a plan whose work is done or abandoned; a runbook for a system that no longer exists; an evidence document for a surface that was removed; a handoff whose effort has ended; a proposal that was declined. **What is not:** anything still cited by `AGENTS.md`, a paper, or a live decision record. Fix the citation first, then archive.

## The generated index

`docs/README.md` is generated from front matter and never hand-edited. One row per document: path, kind, state, date, title.

This is the piece that makes the rest work. A hand-maintained index is forgotten within weeks; a generated one cannot drift from what the front matter says. Treat it exactly like any other generated artifact — change the source, regenerate, and never edit the output.

`AGENTS.md` keeps the compact authority table (task class to authority, with status). `docs/README.md` is the exhaustive inventory. They serve different readers and should not be merged.

## Work items

`workItems:` links a document to the `xy work` items that produced or depend on it. Nothing in `xy work` links back — `WorkAnchor` supports only `kind: 'file'`, and there is no document or URL anchor kind — so this front-matter field is the only structured connection between the two, and it is maintained from the document side.

Use it on plans and evidence documents especially: it lets an audit notice a plan whose work items are all closed, and an evidence document that no open item references.
