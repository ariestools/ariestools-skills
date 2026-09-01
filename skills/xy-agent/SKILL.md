---
name: xy-agent
description: Repository documentation conventions for AI agents — the AGENTS.md entry point, per-tool adapter files (CLAUDE.md, copilot-instructions), the docs/ lifecycle tree, and papers/ normative baselines in a monorepo. Covers required AGENTS.md sections, the size budget, YAML front matter and document states, supersession and archiving, decision records, dated evidence documents, the generated docs index, and how to audit all of it for rot and turn findings into xy work items. Use when orienting in an unfamiliar repository, writing or reorganizing AGENTS.md / docs / papers, adding a decision or evidence record, archiving a superseded document, or auditing repository documentation.
metadata:
  version: 0.1.5 # x-release-please-version
---

# Agent Documentation Conventions

**Authority.** This skill is maintained only in [`ariestools/ariestools-skills`](https://github.com/ariestools/ariestools-skills). Copies under `XYOracleNetwork/xyo-skills` are redirect stubs — edit here, never there.

This skill defines how a repository tells an agent what is true. It covers one entry point (`AGENTS.md`), thin per-tool adapters, and a documentation tree whose folders encode lifecycle rather than topic — so that a document's age, authority, and supersession are readable without opening it.

**Read the repository's own `AGENTS.md` first.** It is authoritative for that repository. This skill describes the shape those files should take; it never overrides what a specific repository says about itself.

**The rule this exists to enforce:** an instruction file is only useful while it is true. Every convention below exists to make untruth detectable — by a linter, by an audit, or by an agent that reads a status column and stops.

This skill builds on the [Development Skill](../xy-development/SKILL.md). It is recommended, not required: a repository that does not follow this pattern is not defective, and you should follow whatever convention that repository already uses rather than converting it mid-task.

## References

### [Repository structure](structure.md)

Read first when orienting in an unfamiliar repository, deciding where a new document belongs, or setting up the pattern in a repository that lacks it. Covers the canonical tree, the `papers/` vs `specs/` vs `docs/` split, lifecycle subfolders, and immutable source archives.

### [The AGENTS.md entry point](agents-md.md)

Read when writing, editing, or trimming `AGENTS.md`, or when wiring the per-tool adapters. Covers the required sections and what each is for, the authority table's status column, the size budget, `@AGENTS.md` imports, `.claude/rules/` path scoping, and nested package files.

### [Document lifecycle](lifecycle.md)

Read when adding any document, changing a document's status, superseding one document with another, or archiving. Covers the front-matter schema, the state vocabulary, decision records, dated evidence documents, the generated index, and the archive procedure.

### [Auditing and maintenance](auditing.md)

Read when asked to audit repository documentation, when you notice a document that no longer matches the code, or before declaring a documentation task complete. Covers the check catalog, staleness and orphan detection, how findings become `xy work` items, and the current tooling status.

### [Templates](templates.md)

Read when creating a file this convention describes. Copy-paste skeletons for `AGENTS.md`, the adapter files, a decision record, an evidence record, a runbook, the archive banner, and the docs index.

## Related skills

- **[xy-development](../xy-development/SKILL.md)** — TypeScript, Git, testing, and the definition of done this pattern plugs into.
- **[xy-toolchain](../xy-toolchain/SKILL.md)** — the `xy` CLI, including `xy work`, which this pattern uses to track documentation maintenance.
