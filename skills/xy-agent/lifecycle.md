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
supersededBy: "docs/plans/NEW.md"
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
| `supersededBy` | Required when `state: superseded`. A file, as a path from the repository root or relative to this file |

`status` is free prose and carries the nuance no enum will: who ratified it, what it supersedes, which section, and under what conditions. Keep it. The enumerated fields exist so a tool can act; `status` exists so a human understands.

Front matter is the leading `---` block, closed by another `---`. Since toolchain 10.2.0 `xy agent` reads it as YAML, keeping every value as written (a date or version stays a string), and uses only top-level fields: a key nested under another field is not the document's, and a list or mapping, such as `amends` or `workItems`, only counts as present. Quotes, trailing comments, block lists and block scalars read as YAML reads them. A block with a YAML error, such as an unquoted `title: ADR: use ESM`, is read one field at a time, so the other fields survive; quote such a value anyway. Keep `status` to one line with no `|`, because it becomes a cell in the generated index. On 10.1.5 and earlier the parser reads one line at a time: see [Toolchain 10.1.5 and earlier](auditing.md#toolchain-1015-and-earlier) for what to avoid there.

**What the linter checks.** `xy agent lint` (run by `xy check` where `AGENTS.md` exists or `commands.agentLint` is declared, since toolchain 10.1.2; 10.1.1 runs it in every repository) checks only that each Markdown file under `docs/`, `papers/` and `specs/`, other than a `README.md`, has front matter with a `kind`. It validates no values and none of the per-kind fields above, apart from requiring a `state` on decision records and a version, status and date for each paper, in its front matter or visible header; keeping them right is the author's job. `--fix` gives a file with no front matter, and since toolchain 10.1.5 one whose front matter has no `kind`, the `kind` its folder implies (`decision`, `evidence`, `runbook` or `plan` under `docs/`, `paper`, `spec`) and builds the index from it in the same run; a file elsewhere, such as a handoff at the `docs/` root, keeps its warning until you write the front matter.

Where a document already shows a visible header block under its H1 (`- **Version:** 0.4.6-draft`), keep it — papers in particular benefit from wearing their status on their face. Just keep the two consistent. `papers.header` reads labeled fields above a paper's first thematic break as its header, and since 10.2.0 reports a version or date there that differs from the front matter.

## The state vocabulary

| State | Meaning | Where it lives |
|---|---|---|
| `draft` | Being written; not yet binding on anyone | `docs/plans/`, or beside its target |
| `active` | Current and in use, but not normative | `docs/` |
| `normative` | Binding. Code must conform to it | `papers/`, `specs/`, `docs/decisions/` |
| `superseded` | A named successor replaced it | `docs/archive/` |
| `retired` | No successor; no longer applies | `docs/archive/` |
| `archived` | Historical, reason not recorded. `xy agent archive` wrote it before 10.1.2; replace it with `superseded` or `retired` | `docs/archive/` |

`state` describes the document. `status` describes the *situation*. A specification can be `state: normative` while its `status` says its evidence tier is only "Specified" — normative and unproven are different axes, and conflating them is how a repository starts claiming things it has not earned.

**Keep authority separate from evidence.** That a requirement is binding says nothing about whether it has been demonstrated. Report them separately, always.

## Decision records

One decision per file in `docs/decisions/`. In a new repository, name it `<PREFIX>-D0001-kebab-title.md`, where `PREFIX` is the repository's short code (`CC`, `IMM`, `EK`). In an existing one, keep its scheme and write the id exactly as the repository already cites it, zero-padded to the same width (`CC-D021-kebab-title.md`, `ADR-0006-kebab-title.md`, `D-004-kebab-title.md`). Put the id in the filename — decisions get cited across documents, and an id that lives only in prose cannot be found.

`xy agent lint` (decisions.naming) warns when `docs/decisions/` mixes naming schemes or a record has no `state`. It checks ids for duplicates and gaps in `0001-…`, `ADR-0001-…` and prefixed names such as `CC-D021-…`. Other schemes, such as `D-004-…`, pass unchecked, so keep their ids unique and contiguous yourself. Since 10.2.0 it counts archived records too (under `docs/archive/decisions/`, or anywhere in `docs/archive/` with `kind: decision`), so archiving a superseded decision leaves no gap, and it ignores a file in `docs/decisions/` marked as another kind, such as a `kind: handoff` stub.

A decision record is **immutable once accepted**. Revisit a decision by writing a new one that supersedes it; do not edit history into agreement with the present.

Every record carries:

- **Context** — what forced a choice.
- **Decision** — what was chosen, stated as a rule.
- **Consequences** — what this now commits the project to, including what it forecloses.
- **Revisit triggers** — the concrete conditions under which this should be reconsidered.

**Revisit triggers are the field that matters most and the one most often omitted.** Without them, nobody can tell a still-correct decision from a fossil, and an audit cannot either. Write them as observable conditions: *"Review when a second real runtime adapter appears, or when external consumers require a stable composition facade."*

Keep `docs/decisions/README.md` as a hand-kept register — id, linked title, state, date. The generated index does not count as a link (`docs.orphan`), so a record that no other document names warns, and the register is what names it.

## Evidence documents

An evidence document records **what passed, once, under a named commit and command**. In a new repository, name it `docs/evidence/YYYY-MM-DD-slug.md` so the directory sorts chronologically. A repository with its own naming scheme keeps it. Either way, keep the records under `docs/evidence/`: only files there get the immutability check.

Rules:

- **Cite an evidence document; never edit one to match new behavior.** If behavior changed, write a new evidence document. The old one remains true about the commit it names.
- **Name the commit.** `commit:` in front matter, and the exact command in the body. An evidence document that does not say where it was true proves nothing.
- **Name the tier, and name the tiers it does not establish.** "This is local Node evidence, not hosted or production qualification." Negative statements are what keep an evidence document from being over-read later.
- Record counts, hashes, identifiers — the specifics a reader would otherwise have to re-derive.
- **Redact before the first commit.** `xy agent lint` flags a home-directory path in any document (`agents.no-absolute-paths`, a warning that fails under `--strict`), and removing one from pasted output later is an edit.

**Evidence bundles.** Machine-readable artifacts (JSON reports, receipts) go in a directory, `docs/evidence/YYYY-MM-DD-slug/`, beside a sibling `docs/evidence/YYYY-MM-DD-slug.md`. The Markdown file carries the front matter (`kind: evidence`, `commit`), the exact command and the tier statement, and links each artifact. Use the sibling file rather than a `README.md` inside the directory, because `xy agent lint` does not check front matter in `README.md` files. Each JSON report also records its own source commit and command, since JSON cannot carry front matter. The whole bundle is immutable, although the linter checks only the Markdown file.

If an evidence document must be corrected — a broken link, a wrong path — append the correction to `amends:` rather than silently rewriting it. A correction never changes the result; a changed result is a new evidence document. `xy agent lint` (docs.evidence-immutable) warns when an evidence file with no `amends` has more than one version of its body. Since 10.2.0 it reads the first-parent history of `docs/evidence/`, follows renames inside the folder, ignores front matter and whitespace (so the `kind` that `--fix` adds is not an edit), and counts an uncommitted edit; through 10.1.5 it counts commits. A copy, a move in from another folder, and a new file written from one the same commit archives start a new history. It needs full history: a shallow clone that shows one version reports nothing. Once `amends` exists the rule stops checking, so list every correction.

## Runbooks

A runbook is a live document and the only tier that is dangerous when stale. Every runbook carries `reviewed:` and is re-verified on a cadence.

When the system a runbook describes is retired, do not delete the runbook if it still specifies behavior that exists elsewhere. State plainly at the top what is still true and what is not, set `state` accordingly, and archive it when nothing depends on it.

**Staleness.** `xy agent lint` (docs.stale) warns when a document's `reviewed`, or failing that its `date`, is older than 180 days, or 90 under `docs/runbooks/`. On a live document — a runbook, a handoff, the roadmap — re-verify it and update `reviewed`. It skips `docs/evidence/`, `docs/decisions/`, `docs/archive/` and any `superseded` or `retired` document. Never add `reviewed:` to an immutable record.

## Supersession

When one document replaces another:

1. Set `state: superseded` and `supersededBy: <path>` on the old document. Write the path of the successor file from the repository root (`docs/plans/NEW.md`): it resolves before and after the move into `docs/archive/`, and `xy agent archive` copies it into the banner.
2. State in the new document's `status` what it supersedes, by path, down to the section where the overlap is partial. That mention is also what keeps the archived file from warning as `docs.orphan`; a bare file name counts only while no other Markdown file in the checkout shares it.
3. Archive the old document (below).
4. Run `pnpm xy agent index`.

A superseded document that stays in place is worse than a deleted one: it looks current, and the next agent has no way to tell.

`xy agent lint` (docs.superseded-archived) reports a `superseded` or `retired` document that is not under `docs/archive/`, and a superseded one whose `supersededBy` does not resolve. Archive the first, and fix the path in the second.

## Archiving

Archive rather than delete. The document is evidence of what was believed and when.

Move the file under `docs/archive/`, keeping its path below `docs/`: `docs/plans/OLD.md` becomes `docs/archive/plans/OLD.md`. The banner records where the file came from. Prepend the banner:

```markdown
> **Archived 2026-09-01.** Superseded by [`docs/plans/NEW.md`](../../plans/NEW.md).
> Original path: `docs/plans/OLD.md`. Retained as a record of the design
> that was current until that date; do not follow it.
```

Links now resolve from one folder deeper, so a relative link out of the document needs one more `../`; adjust any the move broke. Set `state` to `superseded` or `retired`, keep `date` as written, and run `pnpm xy agent index`.

`pnpm xy agent archive <path>` does the move and regenerates the index, and refuses if the destination is taken. It keeps the path below `docs/` (a file from outside `docs/` lands directly in `docs/archive/`), sets `state: retired` unless the document is already `superseded`, edits no other front matter, and prepends a dated banner: "Superseded by <supersededBy> on <date>" or "Retired on <date>", then the original path. Since 10.2.0 it reads `<path>` relative to the current folder, so from the repository root pass `docs/plans/OLD.md`; it refuses a symlink, a document already under `docs/archive/`, and one inside a nested Git checkout, and it leaves a hand-written `docs/README.md` alone. On 10.1.5 and earlier, run it from the root and pass `docs/plans/OLD.md` exactly: with a `./docs/…` or absolute argument the command does not see the `docs/` prefix, so the file lands flat in `docs/archive/`, links written for the deeper path break, and the banner records the path as typed. Set `superseded` and `supersededBy` before running it, add the reason to a retirement banner, and fix the links the move broke.

**What is archivable:** a plan whose work is done or abandoned; a runbook for a system that no longer exists; an evidence document for a surface that was removed; a handoff whose effort has ended; a proposal that was declined. **What is not:** anything still cited by `AGENTS.md`, a paper, or a live decision record. Fix the citation first, then archive. An archived document that nothing else names warns as `docs.orphan`. A superseded one is named by its successor's `status` (step 2 of [Supersession](#supersession)); a retirement with no successor usually is not, so expect and accept that warning.

## The generated index

`docs/README.md` is generated from front matter. Run `pnpm xy agent index` after any change under `docs/`. `xy agent lint --fix` and `xy agent archive` also rewrite it, and `xy agent init` and `xy repo init` create it when it is missing. `xy agent lint` warns (docs.index-current) while the file differs from what the generator would write, so `xy check --strict` fails on it.

The generator writes a `# Docs` heading and a `Document | Kind | Status` table with one row per Markdown file under `docs/` that Git does not ignore, except the index itself: a link to the file, its `kind`, and its `status`, or its `state` when it has no `status`. `papers/` and `specs/` are not listed; the `AGENTS.md` authority table routes to them. A row in the index is not a link: `docs.orphan` warns on every `docs/` file, decision, evidence and archived records included, that nothing but the index links to or names — not `AGENTS.md`, an adapter or a package `AGENTS.md`, and no other document under `docs/`, `papers/` or `specs/`. Without `xy agent` there is no generator: write the same table by hand, so the file is already correct when the repository upgrades.

Since toolchain 10.2.0 the generators rewrite only a `docs/README.md` that is missing or holds nothing but a generated index, or else only the lines between `<!-- xy agent index: start -->` and `<!-- xy agent index: end -->`, each on a line of its own ([template](templates.md#docsreadmemd)). Text outside the markers is kept, and links there count for `docs.orphan`. A `docs/README.md` with hand-written text and no markers is never overwritten: `docs.index-current` reports it, `--fix` and `xy agent archive` leave it alone, and `xy agent index` refuses it. Add the markers, or delete the file to have it generated whole. Nothing writes through a symlinked or hard-linked index. On 10.1.5 and earlier there are no markers, and every generator replaces the whole file.

This is the piece that makes the rest work. A hand-maintained index is forgotten within weeks; a generated one cannot drift from what the front matter says. Treat the table exactly like any other generated artifact — change the source, regenerate, and never edit the output.

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
