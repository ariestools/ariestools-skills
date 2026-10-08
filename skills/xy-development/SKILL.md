---
name: xy-development
description: Core development standards for TypeScript conventions, Git workflow, testing principles, repository workflow, and the Definition of Done. Use when writing or reviewing TypeScript or organizing imports; writing tests; running a repo's build, lint, test, or dev commands; adding or upgrading dependencies; committing, branching, merging, or releasing; writing PRD acceptance criteria; or before declaring any task complete.
metadata:
  version: 0.1.5 # x-release-please-version
---

# Development Standards

**Authority.** This skill is maintained only in [`ariestools/ariestools-skills`](https://github.com/ariestools/ariestools-skills). Copies under `XYOracleNetwork/xyo-skills` are redirect stubs — edit here, never there.

**Skill identity.** When you present a plan, an acknowledgement, or a completion summary, state which skills informed it as `xy-development v<version>`, and list each other active skill from this pack the same way. Read the version from this file's `metadata.version`, never from an example.

This skill defines foundational development practices. Where a repository's own `AGENTS.md` or `CLAUDE.md` says otherwise, the repository wins. Load the sub-topic that matches your current task:

## Table of Contents

### [TypeScript Conventions](typescript.md)
Read when writing, reviewing, or refactoring TypeScript code, or organizing imports. Covers strictness markers and code-shape limits; the `any` policy; return types; interface vs type; readonly usage; erasable-syntax rules (no enums, parameter properties, or namespaces); ESM-only modules with explicit import extensions; root-barrel imports and import style; conditions, nullish values, and promises; and naming, export, and file conventions.

### [Git Workflow](git.md)
Read when committing, branching, pushing, merging or opening PRs, undoing a change, resolving a rejected push, or cutting a release. Covers conventional commits and PR titles, atomic commits, commit identity and repository hygiene, the history-rewrite policy, branching-model detection, merge methods, and releases.

### [Testing Principles](testing.md)
Read when writing tests, discussing test strategy, or evaluating coverage. Covers framework-agnostic principles: behavior-focused names, arrange/act/assert, one concept per test, testing the public interface, independent and deterministic tests, minimal mocking that still leaves the real wiring tested, and coverage priorities. Frameworks, runners, and spec layout are defined in the xy-toolchain skill ([xy-toolchain testing](../xy-toolchain/testing.md)).

### [Development Workflow](workflow.md)
Read before running any build, lint, test, or dev command; before adding or upgrading dependencies; when writing a PRD.md's acceptance criteria; and before declaring any task complete. Covers toolchain discovery (repo instructions, scripts, and CI before ad-hoc one-offs), dependency and peer-dependency rules, credential safety, the layered Definition of Done (including browser verification for apps), and writing project-specific acceptance criteria.

## Related skills

These are navigation links, not dependencies of this skill; each installs separately.

- **[xy-toolchain](../xy-toolchain/SKILL.md)** — the `xy` CLI, build/lint/test commands, and the tooling these principles run on. Install: `npx skills add ariestools/ariestools-skills --skill xy-toolchain`.
- **[ariestools-sdk](../ariestools-sdk/SKILL.md)** — which `@ariestools/*` utilities to use and how to import them. Read it when the repo depends on sdk-js packages; `xy skills lint` requires it only there, so it is often absent elsewhere. Install: `npx skills add ariestools/ariestools-skills --skill ariestools-sdk`.
- **[xy-agent](../xy-agent/SKILL.md)** — *recommended, not required.* Repository documentation conventions: the `AGENTS.md` entry point, per-tool adapters, and the `docs/` and `papers/` lifecycle. Read it when writing or reorganizing a repository's agent-facing documents, or when a repository already follows the pattern; otherwise follow the convention the repository already has. In `@ariestools/toolchain` repos, `pnpm xy check` runs `xy agent lint` (since toolchain 10.1.1). It enforces this convention with several error-level rules by default (including a missing root `AGENTS.md`, a `CLAUDE.md` adapter that is not a lone `@AGENTS.md` import or symlink, and missing required `AGENTS.md` sections), so a repository's own layout can fail the gate. See [xy-toolchain › `xy agent`](../xy-toolchain/commands.md#xy-agent) for the rules and `commands.agentLint.rules`. `pnpm xy agent init` scaffolds the convention without overwriting existing files. Install: `npx skills add ariestools/ariestools-skills --skill xy-agent`, or declare `{ "name": "xy-agent", "source": "ariestools/ariestools-skills" }` in package.json `xy.skills` (since toolchain 10.0.8) so `pnpm xy skills lint --fix` installs it. A package.json `xy` key replaces that directory's `xy.config.ts`, so read the caveat in [xy-toolchain › `xy skills`](../xy-toolchain/commands.md#xy-skills) first.
