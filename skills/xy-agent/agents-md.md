# The AGENTS.md Entry Point

`AGENTS.md` is the file a cold agent reads before doing anything. It has one job: get a session from zero context to correctly scoped work without reading the whole repository. Everything that does not serve that job belongs somewhere else.

## Required sections

Five sections carry the load. Write them in this order.

### Opening

Two paragraphs, no preamble. The first states what the repository *is* and inventories what it physically contains, ending in a directive that this file is the entry point. The second states the one rule that governs the rest — the thing an agent must not violate even when every other instruction is silent.

### `## Orient before acting`

A **numbered read order**, not a list of links. Each entry says what the document is and how much to trust it. Include the staleness caveat inline where a document is dated:

```markdown
2. `docs/HANDOFF_2026_08_30.md` — where the active effort stood on
   2026-08-30. Dated: check it against `git log` before trusting a
   specific claim.
```

End with a negative instruction bounding the read: *"Then read only the authority for the task in hand, from the table below. Do not read the papers end to end to make a scoped change."* Without it, a thorough agent reads everything and burns its context before starting.

### `## Which document is authoritative`

A three-column table. The third column is the one that matters:

| When the task touches | Authority | Status of that authority |
| --- | --- | --- |
| Protocol, state machine, arithmetic | `papers/X_YELLOW_PAPER.md` | Baseline; the pending amendment is a draft, not adopted |
| Commands, workspace layout | `README.md` | Reference, not policy |
| Human research execution | `research/README.md` | Prepared only; never executed |

Most repositories answer *where do I look*. The status column answers *and how much is that answer worth*. It is one column and it prevents an agent from treating a plan as a contract, a draft as adopted, or a retired runbook as live.

Keep the table bounded by referring to **classes** of document. The exhaustive per-file inventory belongs in the generated `docs/README.md`.

### `## Repository map`

A table of paths with a **handling verdict**, not a description:

| Path | What it holds | Handling |
| --- | --- | --- |
| `references/initial-concept/` | The original artifacts | Immutable historical input — never edit |
| `generated/`, root `vercel.json` | Emitted deployment config | Never hand-edit; change the source model and regenerate |
| `packages/` | Workspace packages | Root stays orchestration-only |

"What it holds" is discoverable by looking. "Handling" is not, and it is the reason the table exists.

### `## Commands you will actually need`

A table of command to use, titled by what an agent needs rather than what exists. Each entry states scope **and exclusions** — "the complete local gate… *excludes* local-chain E2E" is worth more than a command list, because it tells an agent when a green result is not enough.

Follow it with the traps that bite repeatedly, stated compactly with a pointer to the full explanation. A named count helps: *"Three traps bite repeatedly, and README's 'Before you run one' section covers them in full."*

### `## What NOT to do`

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

Live state belongs in a `docs/` handoff document (which is dated, and archived when the effort ends) or in `xy work`. The test: if this sentence will be false next week and nothing will notice, it does not belong here.

Also keep out: anything derivable from the codebase itself (directory listings, dependency lists, architecture overviews an agent can read in ten seconds). Keep pitfalls, rationale, and conventions that differ from tool defaults.

## The size budget

**Target 200 lines.** Anthropic's documented guidance is under 200 lines per `CLAUDE.md`; longer files reduce adherence, and an `@AGENTS.md` import loads the whole file into context at launch — splitting into imports helps organization but does not reduce context.

When the file is over budget, move content rather than deleting it:

1. **Path-scoped instructions** → `.claude/rules/*.md` with `paths:` frontmatter. These load only when a matching file is touched.
2. **Package-specific instructions** → `packages/<pkg>/AGENTS.md`, which loads on demand.
3. **Anything with a lifecycle** → `docs/`, referenced from the authority table.

What must be in *every* session stays and competes for the 200 lines. Everything else moves.

## Per-tool adapters

`AGENTS.md` is canonical. Every other tool gets a thin adapter that **imports or links** it — never a copy.

Claude Code reads `CLAUDE.md`, not `AGENTS.md`, and supports `@path` imports expanded into context at launch:

```markdown
@AGENTS.md

## Claude Code

<Claude-specific additions only, if any>
```

A symlink works equally well when there is nothing Claude-specific to add:

```bash
ln -s AGENTS.md CLAUDE.md
```

Prefer the import on any repository that may be cloned on Windows, where creating a symlink requires Administrator privileges or Developer Mode.

**A prose pointer is not good enough.** `"See AGENTS.md for repository guidance"` asks the agent to go and read something; an import puts the content in context whether it chooses to or not. Convert existing prose stubs to the import — it is a one-line edit.

Other adapters follow the same rule: `.github/copilot-instructions.md` and `GEMINI.md` carry tool-specific *additions* only. Never maintain two complete copies of the same policy. Copies drift, and the drift is invisible until an agent follows the stale one.

### Verifying the adapter loaded

In a Claude Code session, run `/context` and confirm the file appears under **Memory files**. A repository can have a perfect `AGENTS.md` that no agent ever reads.

### Free context

Block-level HTML comments are stripped from `CLAUDE.md` before it enters context. Use them for maintainer notes — who owns a section, when it was last reconciled, why a rule exists — at zero context cost.

## Nested files

A package gets its own `AGENTS.md` only when it has materially different commands, architecture, generated paths, or safety constraints. It carries the **delta** and never restates the root.

Codex composes root toward leaf. Claude Code loads a nested `CLAUDE.md` on demand when it reads files in that directory, so a nested pair costs nothing until it is relevant.

If a nested file would mostly repeat the root, the instruction belongs in the root — or, if it applies to a file pattern rather than a directory, in `.claude/rules/` with `paths:` frontmatter.

## Title convention

The H1 names the repository or product — `# Crypto Cards agent guidance`, `# lifehash` — never `# AGENTS.md` or `# CLAUDE.md`.

This is not cosmetic. A file titled after its own filename cannot be imported or symlinked without the title being wrong, which is precisely what pushes a maintainer into keeping two copies with two titles. Name the file after the thing it describes and the adapter problem disappears.
