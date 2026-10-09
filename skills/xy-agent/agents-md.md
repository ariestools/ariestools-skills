# The AGENTS.md Entry Point

`AGENTS.md` is the file a cold agent reads before doing anything. It has one job: get a session from zero context to correctly scoped work without reading the whole repository. Everything that does not serve that job belongs somewhere else.

## Required sections

Five sections carry the load. Write them in this order.

`pnpm xy agent lint` warns on an `AGENTS.md` that lacks any of them (`agents.required-sections`). It matches heading text by case-insensitive substring: *orient* (or *overview*, *what this*, *about this*), *authorit* (*authority*, and since 10.1.2 *authoritative*), *repository map* (or *repo map*, *layout*, *packages*), *command*, and *fail* (or *troubleshoot*, and since 10.1.2 *what not to do* or *pitfall*). The headings below satisfy it on every toolchain version. If you reword one, keep its keyword; on [10.1.1](auditing.md#toolchain-1011) a missing section is an error.

Scaffolds give you headings, not content. `pnpm xy agent init` writes `# Project` with one-line stubs of the five sections. `xy repo init` writes an H1 named after the project with the five sections and a Documentation link block, plus the `papers/README.md` and `docs/README.md` it links; a repository scaffolded by an older `xy repo init` has `# AGENTS.md` with Documentation, Overview, Commands and Architecture. `pnpm xyex plan lint --fix` (experimental) writes `# Agent Instructions` with Documentation, Repository guidance and Verification. Retitle a placeholder H1 after the product, grow the file into the five sections, and replace the sample authority rows with the repository's real authorities, as Markdown links. Keep a Documentation link block if the repository runs plan lint, which requires Markdown links into `papers/` and `docs/`. The `agent init` and `repo init` stubs lint clean, so the linter will not tell you they are still placeholders.

### Opening

Two paragraphs, no preamble. The first states what the repository *is* and inventories what it physically contains, ending in a directive that this file is the entry point. The second states the one rule that governs the rest — the thing an agent must not violate even when every other instruction is silent.

### `## Orient before acting`

A **numbered read order**, not a list of links. Each entry links the document, says what it is, and says how much to trust it. Include the staleness caveat inline where a document is dated:

```markdown
2. [docs/HANDOFF_2026_08_30.md](docs/HANDOFF_2026_08_30.md) — where the
   active effort stood on 2026-08-30. Dated: check it against `git log`
   before trusting a specific claim.
```

End with a negative instruction bounding the read: *"Then read only the authority for the task in hand, from the table below. Do not read the papers end to end to make a scoped change."* Without it, a thorough agent reads everything and burns its context before starting.

### `## Authority: which document wins`

A three-column table. The third column is the one that matters:

```markdown
| When the task touches | Authority | Status of that authority |
| --- | --- | --- |
| Protocol, state machine, arithmetic | [papers/X_YELLOW_PAPER.md](papers/X_YELLOW_PAPER.md) | Baseline; the pending amendment is a draft, not adopted |
| Commands, workspace layout | [README.md](README.md) | Reference, not policy |
| Decisions, runbooks, plans, evidence | [docs/](docs/README.md) | Per document: trust its front-matter `state` |
| Human research execution | [research/README.md](research/README.md) | Prepared only; never executed |
```

Most repositories answer *where do I look*. The status column answers *and how much is that answer worth*. It is one column and it prevents an agent from treating a plan as a contract, a draft as adopted, or a retired runbook as live.

Keep the table bounded by referring to **classes** of document. The exhaustive per-file inventory belongs in the `docs/README.md` that `pnpm xy agent index` generates.

Keep the task class in the first column and the linked authority in a column headed *Authority*. `agents.authority-rows-resolve` reads each row's path from that column's Markdown link and checks that it exists, and `agents.links-resolve` checks every link in the file. Give every Authority cell a link whose target contains `/` or ends in `.md` (write a root `package.json` as `./package.json`). Otherwise the rule falls back to the first such word anywhere in the row, so a cell holding a command, "`package.json` scripts" or "the code" makes a task class such as "Build and CI/CD" warn as a missing file.

### `## Repository map`

A table of paths with a **handling verdict**, not a description:

```markdown
| Path | What it holds | Handling |
| --- | --- | --- |
| [references/initial-concept/](references/initial-concept/) | The original artifacts | Immutable historical input — never edit |
| [generated/](generated/), root [vercel.json](vercel.json) | Emitted deployment config | Never hand-edit; change the source model and regenerate |
| [packages/](packages/) | Workspace packages | Root stays orchestration-only |
```

"What it holds" is discoverable by looking. "Handling" is not, and it is the reason the table exists.

### `## Commands you will actually need`

A table of command to use, titled by what an agent needs rather than what exists. Each entry states scope **and exclusions** — "the complete local gate… *excludes* local-chain E2E" is worth more than a command list, because it tells an agent when a green result is not enough.

Follow it with the traps that bite repeatedly, stated compactly with a pointer to the full explanation. A named count helps: *"Three traps bite repeatedly, and README's 'Before you run one' section covers them in full."*

### `## Failures: what NOT to do`

One named failure section, spelled the same in every repository. Compile it from actual past mistakes, not imagined ones. Every entry should be traceable to something that went wrong.

## Optional sections, in this order

Add these when the repository has the content. Do not invent them to fill a template.

- **`## Current phase`** — what exists, and more prominently what does *not*. State what has received no review, no evidence, no validation. Preserve any owner-directed sequence with its date.
- **`## Governing boundaries`** — invariants, most usefully in the form *"X proves A. It does not prove B."* A signature proves attribution to a key; it does not prove personhood, honesty, or consent. This shape stops overclaiming better than any prohibition.
- **`## Normative product decisions`** — settled constants an agent must not re-derive: exact names, coefficients, identifiers, wire prefixes.
- **`## Known divergences between documents and code`** — where the documents are currently wrong, and which side wins. Retire entries as they are resolved so the section cannot grow without bound. This section is the honest alternative to letting an agent discover the divergence the hard way.
- **`## Source discipline`** — immutability rules for `references/` and `prototypes/`.
- **`## Completion discipline`** — the gate to run, and the actions an agent may never take (publish, deploy, spend, alias a domain).

## What never goes in

Instruction files carry **durable facts and enforceable rules**. They do not carry live state:

- No task assignments, branch names, claim or lease state.
- No "currently working on…" status that a merge will invalidate.
- No volatile model-specific or tool-specific workarounds.

`agents.no-live-state` (warn) matches words, not intent ([trigger list](auditing.md#where-the-shipped-rules-differ)). Write durable branch conventions with placeholders (`feature/<name>`), and phrase prohibitions without its trigger words.

Live state belongs in a `docs/` handoff document (which is dated, and archived when the effort ends) or in the work tracker, `pnpm xyex work` (experimental; see [Skills and work tracking](../xy-toolchain/commands.md#skills-and-work-tracking)). The test: if this sentence will be false next week and nothing will notice, it does not belong here.

Also keep out: anything derivable from the codebase itself (directory listings, dependency lists, architecture overviews an agent can read in ten seconds — link a human-facing `ARCHITECTURE.md` from the authority table instead). Keep pitfalls, rationale, and conventions that differ from tool defaults.

## The size budget

**Stay under 200 lines.** Anthropic's documented guidance is under 200 lines per `CLAUDE.md`; longer files reduce adherence, and an `@AGENTS.md` import loads the whole file into context at launch — splitting into imports helps organization but does not reduce context. `xy agent lint` warns from 200 lines, as `wc -l` counts them (`agents.size-budget`).

Codex stops adding `AGENTS.md` files once its combined instruction chain reaches `project_doc_max_bytes` (32 KiB by default). The 200-line target keeps you well under that, but nested files count toward the same cap.

When the file is over budget, move content rather than deleting it:

1. **Path-scoped instructions** → `.claude/rules/*.md` with `paths:` frontmatter. These load only when a matching file is touched, and only Claude Code reads them. Use them for Claude-specific or file-pattern detail. A rule every agent must obey stays in `AGENTS.md`; one Copilot must see is mirrored in `.github/instructions/*.instructions.md` with `applyTo`.
2. **Package-specific instructions** → a `packages/<pkg>/AGENTS.md` pair (see [Nested files](#nested-files)).
3. **Agent task procedures** → a skill under `.agents/skills/<name>/`, symlinked into `.claude/skills/`. It loads only when relevant. Installed skills are managed by `pnpm xy skills` — never hand-edit them ([Skills and work tracking](../xy-toolchain/commands.md#skills-and-work-tracking)). Operational runbooks for humans stay in `docs/runbooks/`.
4. **Anything with a lifecycle** → `docs/`, referenced from the authority table.

What must be in *every* session stays and competes for the 200 lines. Everything else moves.

## Per-tool adapters

`AGENTS.md` is canonical. A tool that does not read it natively gets a thin adapter that **imports** it — never a copy. Prefer the import alone. A short note that only one tool needs may follow the import, but anything every agent should obey belongs in `AGENTS.md`.

Claude Code reads `CLAUDE.md`. From v2.1.277 it also reads `AGENTS.md` directly, but only when no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists in the working directory or any parent. A workspace-level `CLAUDE.md`, a personal `CLAUDE.local.md`, an older client, or the `claude-md` **Project instructions** setting each prevent that. Always commit a `CLAUDE.md` that imports `AGENTS.md`; the import never loads it twice.

Prefer a regular `CLAUDE.md` whose only content is the import. An HTML comment above it is fine:

```markdown
<!-- Canonical agent instructions live in AGENTS.md. Claude Code imports that file. -->
@AGENTS.md
```

This is what `xy agent init` writes (without the comment), and it passes both `xy agent lint` and `xyex plan lint`; so does the import followed by notes, because both linters require only that the import is the first visible line. A symlink (`ln -s AGENTS.md CLAUDE.md`) passes `xy agent lint` but fails `xyex plan lint`, which requires a regular file. Claude's Edit and Write tools also refuse to write through it, and a Windows clone without `core.symlinks` gets a one-line text file in place of the instructions. The same caveats apply to a `GEMINI.md` or `.github/copilot-instructions.md` symlink.

**Adapters lead with the import.** `agents.adapter-thin` (warn) checks `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md`. It passes an absent file, a symlink to `AGENTS.md`, a `CLAUDE.md` or `GEMINI.md` whose first visible line — ignoring HTML comments, code spans and fenced blocks — is `@AGENTS.md` or `@./AGENTS.md`, whatever follows it, and a Copilot file that links to `AGENTS.md`. It reports a duplicate (a byte-for-byte copy, or text after the import that repeats `AGENTS.md`'s H1 and at least half of its H2 headings), an inverted symlink (pointing elsewhere, or `AGENTS.md` linked to an adapter), pointer-not-import (an import that is not the first line), a divergent adapter (no `@AGENTS.md` line at all), and a Copilot file with no link. A reworded or retitled copy below the import passes the linter, so read any notes after it by hand. Put a Claude-only instruction in `AGENTS.md` when other agents can safely read it, or in `.claude/rules/` — a rule file without `paths:` loads at launch. The per-tool forms are in [Templates](templates.md). Never maintain two complete copies of the same policy. Copies drift, and the drift is invisible until an agent follows the stale one.

**`@` imports belong only in adapter files.** `AGENTS.md` refers to other documents with Markdown links, never code spans or `@path`. Only links are verified (`agents.links-resolve`), and Claude expands imports recursively at launch, so an `@papers/…` line in `AGENTS.md` would load that paper into every session. `xyex plan lint` rejects one (`plan.root.agents-no-at-imports`).

**A prose pointer is not good enough.** `"See AGENTS.md for repository guidance"` asks the agent to go and read something; an import puts the content in context whether it chooses to or not, and the linter reports a `CLAUDE.md` or `GEMINI.md` pointer, even an inline `see @AGENTS.md`, as a divergent adapter. Convert existing prose stubs to the import — it is a one-line edit. Copilot is the exception: it has no import, so a Copilot file that is not a symlink links to `../AGENTS.md` ([Templates](templates.md#githubcopilot-instructionsmd)).

**Migrating a repository where `CLAUDE.md` holds the guidance**, or where both files are full copies: `xy agent init` will not do it, because it never touches an existing file. Merge the content into `AGENTS.md` by hand under the five sections, reduce `CLAUDE.md` to the import (keeping below it only a note that is genuinely Claude-specific), then run `pnpm xy agent lint`. `xyex plan lint --fix` is no shortcut: it only prepends the import, leaving the old guidance below it as a second copy of the policy. Agent lint usually will not flag that copy; it reports a duplicate only when the copy repeats `AGENTS.md`'s H1 and half its H2 headings.

### Verifying the adapter loaded

In a Claude Code session, run `/context` and confirm the file appears under **Memory files**; `/memory` lists the instruction files too. Then run `pnpm xy agent lint`, plus `pnpm xyex plan lint` in a repository on the toolchain's plan layout. A repository can have a perfect `AGENTS.md` that no agent ever reads.

### Free context

Block-level HTML comments are stripped from `CLAUDE.md` before it enters context, and `agents.adapter-thin` ignores them. A one-line comment above the import — that `AGENTS.md` is canonical and why the adapter is so short — costs nothing and stops a maintainer from "fixing" the adapter by pasting content into it.

## Nested files

A package gets its own `AGENTS.md` only when it has materially different commands, architecture, generated paths, or safety constraints. It carries the **delta** and never restates the root; `agents.nested-delta-only` warns when a `packages/<pkg>/AGENTS.md` repeats eight or more long lines of the root.

A package delta is a pair: `packages/<pkg>/AGENTS.md` plus a `packages/<pkg>/CLAUDE.md` containing only `@AGENTS.md`. Under the default **Project instructions** setting (`claude-md-or-agents-md`), a lone package `AGENTS.md` never loads in Claude Code, which reads `AGENTS.md` natively only when no `CLAUDE.md` exists in the working directory or above it — and the root adapter guarantees one does. With the pair, Claude Code loads the delta once it reads, writes or edits a file in that directory. Codex builds its chain once at startup, from the Git root down to the launch directory, so it sees the package file only when launched inside that package, and the whole chain shares that size cap.

If a nested file would mostly repeat the root, the instruction belongs in the root. If it applies to a file pattern rather than a directory, or only Claude Code needs it, `.claude/rules/` with `paths:` frontmatter is cheaper than a pair.

## Title convention

The H1 names the repository or product — `# Crypto Cards agent guidance`, `# lifehash` — never `# AGENTS.md` or `# CLAUDE.md`. `xy agent lint` warns on an `# AGENTS.md` H1 (`agents.h1-not-filename`).

This is not cosmetic. A file titled after its own filename cannot be imported or symlinked without the title being wrong, which is precisely what pushes a maintainer into keeping two copies with two titles. Name the file after the thing it describes and the adapter problem disappears.
