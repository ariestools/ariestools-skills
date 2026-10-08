# Document Lifecycle

Every document under `docs/`, `papers/`, and `specs/` carries YAML front matter. The prose is for humans; the front matter is the machine layer that makes rot detectable.

## Front-matter schema

```yaml
---
title: "Gate 1 — Find the Remote (virtual): specification"
kind: spec
state: normative
version: "1.0"
date: "2026-08-22"
reviewed: "2026-08-22"
commit: "c3efe88"
amends: [{ date: "2026-09-03", change: "fixed broken link to the runbook" }]
status: "ratified by the owner 2026-08-22; supersedes MVP_Refocus.md §2"
supersededBy: ../plans/NEW.md
workItems: [XYW-20260828-44CAFA]
audience: "Project owner; engineering thread"
---
```

| Field | Notes |
|---|---|
| `kind` | `paper`, `spec`, `decision`, `plan`, `runbook`, `evidence`, `handoff`, `research` |
| `state` | `draft`, `active`, `normative`, `superseded`, `retired`, `archived` |
| `version` | Required for `kind: paper` and `kind: spec` |
| `date` | Created, or last substantive revision |
| `reviewed` | Required for `kind: runbook` |
| `commit` | Required for `kind: evidence` |
| `amends` | Evidence only |
| `supersededBy` | Required when `state: superseded`; relative to this file |

`status` is free prose and carries the nuance no enum will: who ratified it, what it supersedes, which section, and under what conditions. Keep it. The enumerated fields exist so a tool can act; `status` exists so a human understands.

`xy agent` reads front matter one line at a time. Keep every field on one line: write lists in flow form (`[a, b]`), and keep `status` a single quoted string with no `|`, because it becomes a cell in the generated index. Never put a trailing `# comment` after a value: the parser keeps it, so the comment lands in the index cell and makes `date` and `supersededBy` unreadable.

**What the linter checks.** From toolchain 10.1.1, `xy agent lint` (run by `xy check`) checks only that each Markdown file under `docs/`, `papers/` and `specs/`, other than a `README.md`, has front matter with a `kind`. It validates no values and none of the per-kind fields above, apart from requiring a `state` on decision records and a version, status and date in each paper; keeping them right is the author's job. `--fix` gives a file with no front matter `kind: doc`. Replace that with the real kind, then run `pnpm xy agent index`, because the fixing run built the index from the old front matter.

Where a document already shows a visible header block under its H1 (`- **Version:** 0.4.6-draft`), keep it — papers in particular benefit from wearing their status on their face. Just keep the two consistent.

## The state vocabulary

| State | Meaning | Where it lives |
|---|---|---|
| `draft` | Being written; not yet binding on anyone | `docs/plans/`, or beside its target |
| `active` | Current and in use, but not normative | `docs/` |
| `normative` | Binding. Code must conform to it | `papers/`, `specs/`, `docs/decisions/` |
| `superseded` | A named successor replaced it | `docs/archive/` |
| `retired` | No successor; no longer applies | `docs/archive/` |
| `archived` | Historical, reason not recorded. `xy agent archive` writes it; replace it with `superseded` or `retired` | `docs/archive/` |

`state` describes the document. `status` describes the *situation*. A specification can be `state: normative` while its `status` says its evidence tier is only "Specified" — normative and unproven are different axes, and conflating them is how a repository starts claiming things it has not earned.

**Keep authority separate from evidence.** That a requirement is binding says nothing about whether it has been demonstrated. Report them separately, always.

## Decision records

One decision per file in `docs/decisions/`. In a new repository, name it `<PREFIX>-D0001-kebab-title.md`, where `PREFIX` is the repository's short code (`CC`, `IMM`, `EK`). In an existing one, keep its scheme and write the id exactly as the repository already cites it, zero-padded to the same width (`CC-D021-kebab-title.md`, `ADR-0006-kebab-title.md`, `D-004-kebab-title.md`). Put the id in the filename — decisions get cited across documents, and an id that lives only in prose cannot be found.

`xy agent lint` (decisions.naming) warns when `docs/decisions/` mixes naming schemes or a record has no `state`. It checks ids for duplicates and gaps only in `0001-…` and `ADR-0001-…` names; prefixed ids such as `CC-D021` pass unchecked, so keep them unique and contiguous yourself.

A decision record is **immutable once accepted**. Revisit a decision by writing a new one that supersedes it; do not edit history into agreement with the present.

Every record carries:

- **Context** — what forced a choice.
- **Decision** — what was chosen, stated as a rule.
- **Consequences** — what this now commits the project to, including what it forecloses.
- **Revisit triggers** — the concrete conditions under which this should be reconsidered.

**Revisit triggers are the field that matters most and the one most often omitted.** Without them, nobody can tell a still-correct decision from a fossil, and an audit cannot either. Write them as observable conditions: *"Review when a second real runtime adapter appears, or when external consumers require a stable composition facade."*

Keep `docs/decisions/README.md` as a register — id, title, state, date — or let the generated index cover it. Do not maintain both by hand.

## Evidence documents

An evidence document records **what passed, once, under a named commit and command**. In a new repository, name it `docs/evidence/YYYY-MM-DD-slug.md` so the directory sorts chronologically. A repository with its own naming scheme keeps it. Either way, keep the records under `docs/evidence/`: only files there get the immutability check.

Rules:

- **Cite an evidence document; never edit one to match new behavior.** If behavior changed, write a new evidence document. The old one remains true about the commit it names.
- **Name the commit.** `commit:` in front matter, and the exact command in the body. An evidence document that does not say where it was true proves nothing.
- **Name the tier, and name the tiers it does not establish.** "This is local Node evidence, not hosted or production qualification." Negative statements are what keep an evidence document from being over-read later.
- Record counts, hashes, identifiers — the specifics a reader would otherwise have to re-derive.
- **Redact before the first commit.** `xy agent lint` errors on a home-directory path in any document, and removing one from pasted output later is an edit.

**Evidence bundles.** Machine-readable artifacts (JSON reports, receipts) go in a directory, `docs/evidence/YYYY-MM-DD-slug/`, beside a sibling `docs/evidence/YYYY-MM-DD-slug.md`. The Markdown file carries the front matter (`kind: evidence`, `commit`), the exact command and the tier statement, and links each artifact. Use the sibling file rather than a `README.md` inside the directory, because `xy agent lint` does not check front matter in `README.md` files. Each JSON report also records its own source commit and command, since JSON cannot carry front matter. The whole bundle is immutable, although the linter checks only the Markdown file.

If an evidence document must be corrected — a broken link, a wrong path — append the correction to `amends:` rather than silently rewriting it. A correction never changes the result; a changed result is a new evidence document. `xy agent lint` (docs.evidence-immutable) warns when an evidence file has more than one commit and no `amends`. Once the field exists it stops checking, so list every correction.

## Runbooks

A runbook is a live document and the only tier that is dangerous when stale. Every runbook carries `reviewed:` and is re-verified on a cadence.

When the system a runbook describes is retired, do not delete the runbook if it still specifies behavior that exists elsewhere. State plainly at the top what is still true and what is not, set `state` accordingly, and archive it when nothing depends on it.

**Staleness.** `xy agent lint` (docs.stale) warns when a document's `reviewed`, or failing that its `date`, is older than 180 days, or 90 under `docs/runbooks/`. On a live document — a runbook, a handoff, the roadmap — re-verify it and update `reviewed`. On an evidence, decision or archived record, accept the warning and leave the record unedited ([why it fires](auditing.md#where-the-shipped-rules-differ)).

## Supersession

When one document replaces another:

1. Set `state: superseded` and `supersededBy: <path>` on the old document. The path is relative to the document's own location, like a Markdown link. Write it for `docs/archive/`, where the document is about to go, so a successor in `docs/plans/` is `../plans/NEW.md`.
2. State in the new document's `status` what it supersedes, down to the section where the overlap is partial.
3. Archive the old document (below).
4. Run `pnpm xy agent index`.

A superseded document that stays in place is worse than a deleted one: it looks current, and the next agent has no way to tell.

`xy agent lint` (docs.superseded-archived) reports a superseded document whose `supersededBy` does not resolve; fix those. It also prints "is not under archive/" for every superseded document, archived or not ([why](auditing.md#where-the-shipped-rules-differ)): ignore that message only when the document it names first is already under `docs/archive/`, and archive the document otherwise.

## Archiving

Archive rather than delete. The document is evidence of what was believed and when.

Move the file to `docs/archive/` under its own file name. The archive is flat; the banner records where the file came from. Prepend the banner:

```markdown
> **Archived 2026-09-01.** Superseded by [`docs/plans/NEW.md`](../plans/NEW.md).
> Original path: `docs/plans/OLD.md`. Retained as a record of the design
> that was current until that date; do not follow it.
```

Links now resolve from `docs/archive/`, so adjust any relative link the move broke. Set `state` to `superseded` or `retired`, keep `date` as written, and run `pnpm xy agent index`.

`pnpm xy agent archive <path>` (since toolchain 10.1.1) moves the file and regenerates the index, and refuses if the name is already taken in `docs/archive/`. It also sets `state: archived`, prepends a generic one-line banner, and rewrites the front matter line by line, stripping quotes and dropping block lists. A quoted value containing `: `, like the title in the schema above, comes out as invalid YAML. After running it, restore the front matter as it was before the command, including `supersededBy` (use `git show HEAD:<old path>` only if your supersession edits were committed), replace the banner with the one above, and set `superseded` or `retired`.

**What is archivable:** a plan whose work is done or abandoned; a runbook for a system that no longer exists; an evidence document for a surface that was removed; a handoff whose effort has ended; a proposal that was declined. **What is not:** anything still cited by `AGENTS.md`, a paper, or a live decision record. Fix the citation first, then archive.

## The generated index

`docs/README.md` is generated from front matter and never hand-edited. Run `pnpm xy agent index` (since toolchain 10.1.1) after any change under `docs/`. `xy agent lint --fix` and `xy agent archive` also rewrite it, and `xy agent init` creates it when it is missing. `xy check` fails with docs.index-current while the file differs from what the generator would write.

The generator writes a `# Docs` heading and a `Document | Kind | Status` table with one row per Markdown file under `docs/` except the index itself: a link to the file, its `kind`, and its `status`, or its `state` when it has no `status`. `papers/` and `specs/` are not listed; the `AGENTS.md` authority table routes to them. An older toolchain has no generator. Write the same table by hand there, so the file is already correct when the repository upgrades.

This is the piece that makes the rest work. A hand-maintained index is forgotten within weeks; a generated one cannot drift from what the front matter says. Treat it exactly like any other generated artifact — change the source, regenerate, and never edit the output.

`AGENTS.md` keeps the compact authority table (task class to authority, with status). `docs/README.md` is the exhaustive inventory. They serve different readers and should not be merged.

## Work items

`workItems:` links a document to the `xy work` items that produced or depend on it. It is the document-side link, maintained by hand. From the other side, a work item can point at a document through a file anchor (`pnpm xyex work add <type> <title> --file docs/plans/X.md`); the tool stores the path but does not interpret it. Leave off `--inline` for an evidence or decision record: it writes an `<!-- xy-work: <id> -->` comment into the file, which is an edit. In a repository with a reviewed `.xy/plan.json`, roadmap phases and planned paper slots also cite work ids. Treat ids as opaque: the prefix is configurable (`XYW` by default), and items imported from GitHub use `GH-<number>`. The commands themselves are in [xy-toolchain › Skills and work tracking](../xy-toolchain/commands.md#skills-and-work-tracking).

Use it on plans and evidence documents especially: it lets an audit notice a plan whose work items are all closed, and an evidence document that no open item references.

## Plan layout and manifest (experimental)

Some repositories opt into the toolchain's experimental plan tooling, described in [Repository structure](structure.md). Two parts of it touch this lifecycle:

- **`docs/ROADMAP.md` and `notes/`.** The roadmap is the living plan: `kind: plan`, `state: active`, with `reviewed`. Revise it in place rather than archiving it. `notes/` is non-governing and needs no front matter; `xy agent lint` does not read it.
- **`.xy/plan.json`.** The manifest can own each document's lifecycle metadata in its own vocabulary. Keep that metadata in front matter instead (`metadata.source: front-matter`), under the field names above, because those are what `xy agent lint` reads. Never record it in both places. When you read a manifest that does own it:

| Front matter | Plan manifest |
|---|---|
| `state: draft`, `active`, `superseded` | `lifecycle` with the same value (`proposed` reads as `draft`) |
| `state: normative` | `lifecycle: accepted` with `authorityLevel: normative` |
| `state: retired`, `archived` | `lifecycle: archived` or `deprecated` |
| `reviewed` | `lastReviewed` |
| `supersededBy` (a path) | `supersededBy` (a document id) |
