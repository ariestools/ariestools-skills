---
name: xy-agent
description: Repository documentation conventions for AI agents — the AGENTS.md entry point, thin per-tool adapters (CLAUDE.md, GEMINI.md, copilot-instructions), the docs/ lifecycle tree, and papers/ normative baselines. Covers required AGENTS.md sections, the size budget, front matter and document states, decision records, dated evidence documents, supersession and archiving, the generated docs index, and auditing for rot. Use when writing, reorganizing, or auditing AGENTS.md, adapter files, docs/, or papers/; adding a decision or evidence record; superseding or archiving a document; or when `xy check` or `xy agent lint` reports agents.*, docs.*, decisions.* or papers.* findings (toolchain 10.1.1+).
metadata:
  version: 0.1.7 # x-release-please-version
---

# Agent Documentation Conventions

**Authority.** This skill is maintained only in [`ariestools/ariestools-skills`](https://github.com/ariestools/ariestools-skills); edit there, not in installed copies.

**Skill identity.** When you present a plan, an acknowledgement, or a completion summary, state which skills informed it as `xy-agent v<version>`, and list each other active skill from this pack the same way. Read the version from this file's `metadata.version`, never from an example.

This skill defines how a repository tells an agent what is true. It covers one entry point (`AGENTS.md`), thin per-tool adapters, and a documentation tree whose folders encode lifecycle rather than topic — so that a document's age, authority, and supersession are readable without opening it.

**Read the repository's own `AGENTS.md` first.** It is authoritative for that repository. This skill describes the shape those files should take; it never overrides what a specific repository says about itself.

**Toolchain enforcement.** The stable `pnpm xy agent lint` checks this convention in `AGENTS.md`, the adapters, and the documents under `docs/`, `papers/` and `specs/`. `xy check` runs it only where a root `AGENTS.md` exists or the xy config declares `commands.agentLint`, and only two findings are errors by default: a missing `AGENTS.md` and a broken link in it. The rest — a missing required section, an adapter that does not lead with the import, a home-directory path, a `docs/README.md` that differs from the generated index — warn, and fail the gate only under `--strict` or `XY_STRICT=1`; `--rules` lists every rule and its level. The experimental `pnpm xyex plan lint` is an opt-in layout overlay: it is not part of `xy check`, it is not authoritative here, and it conflicts with agent lint on a symlinked `CLAUDE.md` and on `docs/README.md`. Never run `xyex plan lint --fix` without the owner's agreement: it moves product-named papers into `notes/` and prepends the `@AGENTS.md` import to an existing `CLAUDE.md`. After an agreed run, re-run `pnpm xy agent lint`.

**The rule this exists to enforce:** an instruction file is only useful while it is true. Every convention below exists to make untruth detectable — by a linter, by an audit, or by an agent that reads a status column and stops.

This skill builds on the [xy-development skill](../xy-development/SKILL.md); the `xy agent` and `xyex work` commands it relies on are documented in the [xy-toolchain skill](../xy-toolchain/SKILL.md). A repository that has not adopted this pattern still passes `xy check`: with no `AGENTS.md`, agent lint is skipped. Do not convert it mid-task, and do not declare `commands.agentLint` in `xy.config.ts` to quiet it — declaring the key, even only to turn rules off, opts `xy check` into agent lint. With the owner's agreement, adopt the pattern (`pnpm xy agent init` scaffolds the missing files). Without `xy agent`, follow whatever convention the repository already uses.

**Toolchain versions.** Verified against `@ariestools/toolchain` 10.1.5. `xy agent` exists from 10.1.1, and this skill describes it as it behaves from 10.1.2. 10.1.5 adds `--fix` repairs for adapters and for front matter without a `kind`, and the experimental `--fix-interactive`; the text marks both. A command the installed toolchain lacks prints `Command not found`, and before 10.1.2 it exits 0, which reads like a pass: check `pnpm xy --help`, and without `xy agent` run the [checks by hand](auditing.md#running-the-checks). On 10.1.1, read [Toolchain 10.1.1](auditing.md#toolchain-1011) before trusting a result or running a fixer: more rules fail the gate there, and two of its fixers damage files. The 10.1.2 row of the xy-toolchain skill's [Version notes](../xy-toolchain/toolchain.md#version-notes) lists every change from 10.1.1.

## References

### [Repository structure](structure.md)

Read first when orienting in a repository that follows this pattern, deciding where a new document belongs, or setting up the pattern in a repository that lacks it. Covers the canonical tree (including package READMEs and the tool-managed skills paths), what `xy agent init` scaffolds, the `papers/` vs `specs/` vs `docs/` split, lifecycle subfolders, immutable source archives, and the experimental `xyex plan lint` layout and where it conflicts.

### [The AGENTS.md entry point](agents-md.md)

Read when writing, editing, or trimming `AGENTS.md`, wiring the per-tool adapters, or fixing an `agents.*` finding. Covers the required sections and the heading keywords `xy agent lint` matches, the authority table's status column, what never goes in, the size budget and where overflow goes (`.claude/rules/`, package pairs, skills, `docs/`), the adapter contract (each adapter is absent or a symlink, or else `CLAUDE.md` and `GEMINI.md` lead with the `@AGENTS.md` import and `.github/copilot-instructions.md` links to `AGENTS.md`), and nested package files.

### [Document lifecycle](lifecycle.md)

Read when adding any document, changing a document's status, superseding one document with another, or archiving. Covers the front-matter schema, the state vocabulary, decision records and the naming `xy agent lint` checks, dated evidence documents and evidence bundles, staleness, supersession, archiving with `xy agent archive`, and the index `xy agent index` generates.

### [Auditing and maintenance](auditing.md)

Read when asked to audit repository documentation, when you need to interpret an `xy agent lint` finding, when you notice a document that no longer matches the code, or before declaring a documentation task complete. Covers the check catalog with its rule ids and where the shipped rules differ from it, the `xy agent` commands that automate it, what differs on toolchain 10.1.1, the hand-run fallback, drift detection, and how findings become `xyex work` items.

### [Templates](templates.md)

Read when creating a file this convention describes. Copy-paste skeletons that pass `xy agent lint`: `AGENTS.md`, the `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md` adapters, a decision record, an evidence record, a runbook, the archive banner, and a `.claude/rules/` file — plus the exact shape of the generated `docs/README.md`, which you never write by hand.

## Related skills

These are navigation links, not dependencies; each skill installs separately.

- **[xy-development](../xy-development/SKILL.md)** — the base this skill builds on: TypeScript, Git, testing, and the Definition of Done this pattern plugs into. Install: `npx skills add ariestools/ariestools-skills --skill xy-development`.
- **[xy-product-plan](../xy-product-plan/SKILL.md)** — what goes in the papers this skill places: the White, Yellow, Green, Red and Light papers in order, version pins between them, the roadmap's MVP line and per-version PRDs. Install: `npx skills add ariestools/ariestools-skills --skill xy-product-plan`.
- **[xy-toolchain](../xy-toolchain/SKILL.md)** — the `xy` CLI. [Documentation conventions](../xy-toolchain/commands.md#documentation-conventions) covers `xy agent` and the experimental `xyex plan`; [Skills and work tracking](../xy-toolchain/commands.md#skills-and-work-tracking) covers `xy skills` and the experimental `xyex work`, which this pattern uses to track documentation maintenance. Install: `npx skills add ariestools/ariestools-skills --skill xy-toolchain`.
