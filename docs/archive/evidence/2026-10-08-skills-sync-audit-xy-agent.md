---
title: "Skills sync audit 2026-10-08 — xy-agent"
kind: evidence
state: superseded
date: "2026-10-08"
commit: "7e78933a8"
status: "Partial audit of the xy-agent skill at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.0 (main 7eb43c3c2) and @ariestools/sdk 9.0.1 (298fbb5bb); 43 merged items, 0 verified by two lenses, 43 unverified because the run was paused."
audience: "ariestools-skills maintainers and agents updating the skill pack"
supersededBy: ../../evidence/2026-10-08-skills-sync-audit-complete-xy-agent.md
---

# Skills sync audit — xy-agent

> **Archived 2026-10-08.** Superseded by [`docs/evidence/2026-10-08-skills-sync-audit-complete-xy-agent.md`](../../evidence/2026-10-08-skills-sync-audit-complete-xy-agent.md).
> Original path: `docs/evidence/2026-10-08-skills-sync-audit-xy-agent.md`. Retained as a record of the partial audit (verification paused,
> toolchain 10.1.0) that was current until the complete audit replaced it; do not follow it.

This document records what auditors found when they checked the claims in `skills/xy-agent/` (ariestools-skills `7e78933a8`) against `@ariestools/toolchain` 10.1.0 (main `7eb43c3c2`), `@ariestools/sdk` 9.0.1 (`298fbb5bb`), the workspace repositories, and vendor documentation for Claude Code, Codex, Copilot and Gemini CLI. In this audit, a `verified` item is one that two independent verifiers confirmed, one for code truth and one for skill text. The verification pass was paused before it reached this skill, so every item below is `unverified`. Each was checked against source by one auditor and has not been independently confirmed. 107 raw findings from overlapping auditors were merged into 43 items. Nothing here has been applied to the skills, and this is not a remediation plan. The fixes are the auditors' recommendations. Back to the [Audit index](2026-10-08-skills-sync-audit.md).

## Summary

The skill was written on 2026-09-01. Shortly afterwards the toolchain shipped three things: the experimental `xy plan lint` / `xy plan init`, the repository Markdown contract in `docs/repo-docs.md`, and Plan Manifest v1 (`.xy/plan.json`). Most high-severity items come from that collision. The skill accepts a symlinked or absent CLAUDE.md and recommends nested package AGENTS.md files. It uses paper names the linter rejects, and the linter's `--fix` moves those papers into `notes/`. Its AGENTS.md template has none of the Markdown links the linter requires. It describes a generated `docs/README.md` and a `pnpm xy agent index` command, and neither exists. A second group covers `xy work` guidance the CLI cannot carry out: there is no `--id` flag, the command is experimental, and `list` writes files during read-only orientation. Two audit scripts also silently miss files and links. One decision is still open and blocks several fixes: whether the skill or the toolchain owns the docs contract.

| | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 0 | 0 | 0 | 0 |
| Update | 7 | 16 | 8 | 31 |
| Add | 0 | 9 | 3 | 12 |
| **Total** | **7** | **25** | **11** | **43** |

Status: 0 verified · 0 partially verified · 43 unverified (from 107 raw findings; 0 refuted).

## `skills/xy-agent/SKILL.md`

### Update

- 🔴 **Router never states the toolchain's enforced docs contract, or which side wins when the two disagree** · `unverified`
  - **Now:** SKILL.md:14 makes the repository's AGENTS.md authoritative and says nothing about tooling. SKILL.md:24 and :28 route to files that teach `<PRODUCT>_*_PAPER.md` names (structure.md:50), nested `packages/<pkg>/AGENTS.md` (structure.md:24), and `ln -s AGENTS.md CLAUDE.md` (agents-md.md:110-114).
  - **Actual:** The toolchain ships `xy plan lint`, which is experimental, has `xyex` as the preferred spelling, is monorepo-scoped, and is not part of `xy check`. It enforces a fixed layout:
    - Root AGENTS.md, CLAUDE.md, CHANGELOG.md, CONTRIBUTING.md and README.md must be regular files.
    - CLAUDE.md imports `@AGENTS.md`, and AGENTS.md uses no `@` imports.
    - `papers/` may hold only README.md, WHITE-PAPER.md, YELLOW-PAPER.md and an optional GREEN-PAPER.md.
    - `docs/README.md`, `docs/ROADMAP.md` and `notes/README.md` are required.

    `docs/repo-docs.md:16` also forbids AGENTS.md and CLAUDE.md inside packages. The toolchain repo itself follows this layout. The same owner now maintains two sources of truth that disagree.
  - **Fix:** First, record which contract owns the layout. Auditors lean towards making the toolchain's `repo-docs.md` and `plan-manifest.md` the mechanical authority, with xy-agent deferring to them. Then add a short "Toolchain-enforced contract" paragraph after SKILL.md:14. It should list the rules above, say they win in repos that run `xyex plan lint` / `xy repo lint`, and point to xy-toolchain for the commands. Remove "nested package files" from the :28 summary and add `notes/` to :24. The per-file items below carry the detailed edits.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:19-38, :151-154; ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:38-124; ariestools/toolchain/docs/repo-docs.md:5, :16, :22, :37-44; `node packages/toolchain/dist/bin/xy.mjs plan lint --rules` (8 error rules); ariestools/toolchain/packages/toolchain/src/xy/stability.ts:60-62; `ls ariestools/toolchain/{papers,docs,notes}`.
  - <sub>ids: skills/xy-agent/SKILL.md#0, arch-distribution#2, arch-coverage#5, cov-config#10</sub>
- 🟠 **Authority line claims redirect stubs exist in xyo-skills; none exist** · `unverified`
  - **Now:** SKILL.md:10 "Copies under `XYOracleNetwork/xyo-skills` are redirect stubs — edit here, never there." This was copied as boilerplate from the xy-development and xy-toolchain routers.
  - **Actual:** xyo-skills has no `skills/xy-agent` on main or develop, and its history has never had one. Only xy-development and xy-toolchain have stubs, matching the toolchain's `MIGRATED_SKILLS`.
  - **Fix:** Replace the sentence with: "This skill is maintained only in ariestools/ariestools-skills. It has never shipped in `XYOracleNetwork/xyo-skills`; do not add a copy or stub there."
  - **Evidence:** `git -C XYOracleNetwork/xyo-skills ls-tree --name-only origin/main skills/` (no xy-agent; same on develop); `git log --all -- skills/xy-agent` in xyo-skills → empty; ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:33-40.
  - <sub>ids: skills/xy-agent/SKILL.md#1, arch-distribution#14, arch-coverage#12, arch-layering#13</sub>
- 🟠 **The skill presents `xy work` as a stable command throughout; it is experimental** · `unverified`
  - **Now:** SKILL.md:3, :36, :45 ("the `xy` CLI, including `xy work`, which this pattern uses…"); agents-md.md:80; auditing.md:100-105 (`xy work triage`, `xy work done`); templates.md:23 (`pnpm xy work list`).
  - **Actual:** `stability.ts` classifies `work` and every subcommand as experimental. Under `xy`, each one prints "(experimental — prefer xyex)", and its flags may change in a minor release. ROADMAP D2 makes the `xy` spelling a hard error in the next major. The xy-toolchain `commands.md` work section that this skill routes to does not mention experimental status either.
  - **Fix:** Use `pnpm xyex work …` wherever the skill invokes it. Qualify the mention once, for example at SKILL.md:45: "…including `xy work` (experimental; use `xyex work`)…". Link auditing.md to `../xy-toolchain/commands.md#skills-and-work-tracking`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:68; ariestools/toolchain/packages/toolchain/src/xy/common/work/index.ts:19-43; ariestools/toolchain/packages/toolchain/src/xy/experimentalCommand.ts:8-13; `xy.mjs work --help`; ariestools/toolchain/docs/STABILITY.md:14, :94; ariestools/toolchain/docs/ROADMAP.md:52; `grep -n 'experimental\|xyex' skills/xy-toolchain/commands.md` → no matches.
  - <sub>ids: skills/xy-agent/SKILL.md#4, skills/xy-agent/auditing.md#4, skills/xy-agent/agents-md.md#10, cov-toolchain-history#29, cov-cli#11, arch-layering#12</sub>
- ⚪ **No Skill identity block, and the trigger is broad enough to load in almost any session** · `unverified`
  - **Now:** The SKILL.md:3 description includes "Use when orienting in an unfamiliar repository…". There is no identity block like the sibling skills have.
  - **Actual:** That trigger overlaps the discovery checklist in xy-development/workflow.md:3-35. As a result, this five-file skill would load at the start of most sessions, even though SKILL.md:18 calls it "recommended, not required".
  - **Fix:** Add the Skill identity block the other skills use. Narrow the trigger to writing, reorganizing or auditing AGENTS.md, the CLAUDE.md adapters, docs/ or papers/, or to repositories that already follow the pattern.
  - **Evidence:** skills/xy-agent/SKILL.md:3, :18; skills/xy-development/workflow.md:3-35.
  - <sub>ids: arch-layering#13</sub>

### Add

- 🟠 **The skill never mentions the toolchain's plan manifest (`.xy/plan.json`)** · `unverified`
  - **Now:** Absent from SKILL.md, from the structure.md tree (which has only `.xy/work/items/`, :26), from the templates.md Orient list and authority table (:18-44), and from the agents-md.md authority table (:25-37).
  - **Actual:** Toolchain 10.x ships the Plan Manifest v1 schema (included in the npm `files`) and the experimental `xy plan init`, which writes a `status: bootstrap` `.xy/plan.json`. The toolchain calls it "the machine-readable entry point for an agent that needs to orient itself". It contains:
    - a document catalog with planRole, authorityFor and standing
    - paper slots
    - roadmap phases with `workItems`
    - a read-only interrogation sequence for agents

    No workspace repo has adopted it yet.
  - **Fix:**
    - SKILL.md: add a router line.
    - structure.md: add `.xy/plan.json` (optional, experimental, created by `xyex plan init`) to the tree next to `.xy/work/`.
    - templates.md: add an Orient entry to the AGENTS.md template: "`.xy/plan.json` (if present) — reviewed authority and roadmap index; treat `status: bootstrap` as candidates only."
    - agents-md.md, after :37: "If a reviewed `.xy/plan.json` exists, the authority table summarizes it and must not contradict it."
    - Link ariestools/toolchain/docs/plan-manifest.md.
  - **Evidence:** ariestools/toolchain/docs/plan-manifest.md:1-7, :17-34, :50-72, :287-297; ariestools/toolchain/packages/toolchain/schemas/plan-manifest.v1.schema.json; ariestools/toolchain/packages/toolchain/src/actions/plan/index.ts:23-24; ariestools/toolchain/packages/toolchain/package.json (`files` includes `schemas`); ariestools/toolchain/packages/toolchain/src/xy/stability.ts:60-62.
  - <sub>ids: skills/xy-agent/SKILL.md#3, skills/xy-agent/structure.md#8, skills/xy-agent/templates.md#4, skills/xy-agent/agents-md.md#12, cov-agent-docs#8, arch-coverage#5</sub>

## `skills/xy-agent/agents-md.md`

### Update

- 🔴 **The skill accepts a symlinked or absent CLAUDE.md; the toolchain lint rejects both** · `unverified`
  - **Now:** agents-md.md:110-116 "A symlink works equally well when there is nothing Claude-specific to add: `ln -s AGENTS.md CLAUDE.md`". templates.md:75-79 repeats this. auditing.md:32 passes a CLAUDE.md that is "an `@AGENTS.md` import, a symlink, or absent". All three contradict structure.md:7 ("required, not optional").
  - **Actual:** `xy plan lint` requires root CLAUDE.md to be a regular, non-symlink file (`plan.root.required-files`, error) that contains `@AGENTS.md` (`plan.root.claude-imports-agents`, error). repo-docs.md:22 calls the bridge "a real import, not a Markdown link and not a symlink". Claude Code's docs add two problems with symlinks: Edit/Write refuse to write through one, and Git on Windows checks one out as text. With no CLAUDE.md, Claude Code does not read AGENTS.md in this workspace, because the workspace-root CLAUDE.md suppresses the native read. crypto-cards, the source of the skill's examples, has no CLAUDE.md and fails lint because of it.
  - **Fix:**
    - Delete the symlink option in agents-md.md:110-116 and templates.md:75-79.
    - Make the only adapter a regular CLAUDE.md that matches the toolchain template: `<!-- Canonical agent instructions live in AGENTS.md. Claude Code imports that file. -->` followed by `@AGENTS.md`, with Claude-only notes below.
    - Change auditing.md:32 to: "CLAUDE.md is a regular file that imports `@AGENTS.md`; a symlink, an absent file, a prose pointer or a copy is a finding". Cite both rule ids.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:19-25, :84-91, :145-156, :468-475; ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:35-39, :49-64; ariestools/toolchain/packages/toolchain/src/actions/plan/templates.ts:30-32; ariestools/toolchain/docs/repo-docs.md:22 (present at v10.1.0); `xyex plan lint --json` in XYOracleNetwork/crypto-cards → "CLAUDE.md is required and must be a regular, non-symlink file"; https://code.claude.com/docs/en/memory (AGENTS.md section; symlink caveats).
  - <sub>ids: skills/xy-agent/agents-md.md#0, skills/xy-agent/templates.md#1, skills/xy-agent/auditing.md#1, cov-agent-docs#0, arch-layering#0, cov-toolchain-history#28, arch-distribution#2, arch-coverage#5</sub>
- 🔴 **Nested `packages/<pkg>/AGENTS.md` is forbidden by the toolchain contract and does not "load on demand"** · `unverified`
  - **Now:** agents-md.md:91 "Package-specific instructions → `packages/<pkg>/AGENTS.md`, which loads on demand"; agents-md.md:130-136 (Nested files); structure.md:24 "delta only"; auditing.md:39 treats delta-only nested files as fine.
  - **Actual:**
    - **Toolchain contract.** repo-docs.md:16 says "Keep agent instructions at the repository root. Do not add `AGENTS.md` or `CLAUDE.md` inside packages." No lint rule enforces this.
    - **Claude Code.** It reads an AGENTS.md, including one in a subdirectory, only when no CLAUDE.md exists in the working directory or above it. The root `@AGENTS.md` adapter this skill mandates suppresses that read, so a lone nested AGENTS.md never loads.
    - **Codex.** It builds its instruction chain once at startup, from the Git root down to the working directory, so a session started at the root never sees a package file.
    - **Current repos.** No ariestools repo tracks a nested AGENTS.md. xl1-protocol and ariestools/ariestools still have four between them.
  - **Fix:**
    - Remove the nested tier from structure.md:24 and from agents-md.md:91 and :130-136.
    - Send package-specific agent guidance to the root AGENTS.md, a path-scoped rule, or a skill. Send package consumer docs to `packages/<pkg>/README.md`.
    - Change auditing.md:39 to warn on any `packages/*/AGENTS.md` or `CLAUDE.md`.
    - If a non-toolchain repo keeps a nested file, say that it needs a sibling `CLAUDE.md` containing `@AGENTS.md`, and that Codex sees it only when launched inside the package.

    Resolution note: auditors offered two options, dropping the tier or keeping it as a recorded exception to repo-docs.md. The load-behaviour facts make the current text wrong under either option. Following repo-docs.md is consistent with the rest of this audit.
  - **Evidence:** ariestools/toolchain/docs/repo-docs.md:5, :16; https://code.claude.com/docs/en/memory ("When Claude Code reads AGENTS.md"); learn.chatgpt.com/docs/agent-configuration/agents-md (via developers.openai.com/codex/guides/agents-md); `git ls-files | grep AGENTS.md` in ariestools/{toolchain,cli-kit,sdk-js,actor-kit,browser-kit,sdk-react,ariestools-skills} → root only; `find` → XYOracleNetwork/xl1-protocol/packages/{protocol,sdk}/AGENTS.md, ariestools/ariestools/packages/{dashboard,datalake-saas}/AGENTS.md.
  - <sub>ids: skills/xy-agent/agents-md.md#1, skills/xy-agent/structure.md#5, skills/xy-agent/auditing.md#10, cov-agent-docs#11, cov-toolchain-history#28, arch-layering#11, arch-distribution#2, arch-coverage#5</sub>
- 🟠 **"Claude Code reads CLAUDE.md, not AGENTS.md" is outdated** · `unverified`
  - **Now:** agents-md.md:100 "Claude Code reads `CLAUDE.md`, not `AGENTS.md`, and supports `@path` imports…". agents-md.md:124 names only `/context` as the way to verify.
  - **Actual:** Claude Code v2.1.277 and later reads AGENTS.md natively, but only when no CLAUDE.md, .claude/CLAUDE.md or CLAUDE.local.md exists in the working directory or above it. A CLAUDE.md that imports `@AGENTS.md` never causes a double load. The import claims (expanded at launch, recursive to four hops) are accurate. ariestools/toolchain/docs/repo-docs.md:22 repeats the same outdated sentence.
  - **Fix:** Replace :100 with: "Recent Claude Code reads AGENTS.md directly only when no CLAUDE.md or CLAUDE.local.md exists in the working directory or above it. The workspace-root CLAUDE.md suppresses that, and `xy plan lint` requires a CLAUDE.md, so always commit a regular CLAUDE.md that imports `@AGENTS.md`." Add `/memory` to "Verifying the adapter loaded". Report repo-docs.md:22 to the toolchain.
  - **Evidence:** https://code.claude.com/docs/en/memory (sections "AGENTS.md" and "Import additional files").
  - <sub>ids: skills/xy-agent/agents-md.md#2, cov-agent-docs#7</sub>
- 🟠 **Title and required-section rules conflict with every AGENTS.md the toolchain scaffolds** · `unverified`
  - **Now:** agents-md.md:140 says the H1 is "never `# AGENTS.md`" and :142 adds "This is not cosmetic". Five sections are required (agents-md.md:5-59; templates.md:8, :18-62). auditing.md:33 checks the H1 (warn) and auditing.md:34 checks "Required sections present" (error).
  - **Actual:** `xy repo init` emits `# AGENTS.md` with Documentation/Overview/Commands/Architecture sections. `xy plan lint --fix` emits `# Agent Instructions` with Documentation/Repository guidance/Verification sections. The toolchain, sdk-js, sdk-react and ariestools-skills all title theirs `# AGENTS.md`, and none has the five sections, so these checks fail every ariestools repo that has an AGENTS.md. The skill never mentions the scaffolds.
  - **Fix:** Add a note to agents-md.md and templates.md: a scaffolded AGENTS.md is a placeholder. Retitle it after the product and grow it into the skeleton, keeping the `## Documentation` link block the linter requires. Note the drift under auditing.md:33-34, and file a toolchain work item to align `AGENTS.md.tmpl` and `plan/templates.ts` with the skill.

    Resolution note: auditors disagree on which side should change. One would lower "Required sections" to warn, which is consistent with SKILL.md:18 ("recommended, not required"). Others would keep the checks and change the scaffolds. Which side moves is a maintainer decision. All auditors agree on the retitle note and the toolchain work item.
  - **Evidence:** ariestools/toolchain/packages/toolchain/templates/repo/cli/root/AGENTS.md.tmpl:1-39; ariestools/toolchain/packages/toolchain/src/actions/plan/templates.ts:2-22; ariestools/toolchain/AGENTS.md:1; ariestools/toolchain/docs/repo-docs.md:48-50; `head -1` of ariestools/{sdk-js,sdk-react,ariestools-skills}/AGENTS.md.
  - <sub>ids: skills/xy-agent/agents-md.md#8, skills/xy-agent/templates.md#5, skills/xy-agent/auditing.md#14, cov-agent-docs#15</sub>
- 🟠 **Copilot and Gemini adapter guidance predates their native AGENTS.md and import support** · `unverified`
  - **Now:**
    - agents-md.md:98 says every other tool gets an adapter that "imports or links" AGENTS.md.
    - agents-md.md:120 says copilot-instructions.md and GEMINI.md carry additions only.
    - The Copilot template at templates.md:81-91 is a link-only pointer ("Read it first"), the kind of pointer agents-md.md:118 calls "not good enough".
    - templates.md has no GEMINI.md skeleton, although auditing.md:32 and SKILL.md:40 expect one.
  - **Actual:** Copilot reads AGENTS.md from anywhere in the repo, with the nearest file winning, and combines all instruction files. It also supports path-scoped `.github/instructions/*.instructions.md` files with `applyTo`. Gemini CLI does not read AGENTS.md by default. A GEMINI.md can import it with `@./AGENTS.md`, or `context.fileName` can list it.
  - **Fix:** Rewrite :120: "Copilot reads AGENTS.md natively. Add `.github/copilot-instructions.md` only for Copilot-specific additions, never as a pointer. Gemini CLI needs a `GEMINI.md` containing `@./AGENTS.md` (or a `context.fileName` entry), with Gemini-only additions below the import." Narrow :98 to tools that do not read AGENTS.md natively. Replace the Copilot template to match, and add a `## GEMINI.md` skeleton.
  - **Evidence:** docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions; geminicli.com/docs/cli/gemini-md; geminicli.com/docs/reference/memport; skills/xy-agent/agents-md.md:118, :120; skills/xy-agent/auditing.md:32; skills/xy-agent/SKILL.md:40.
  - <sub>ids: skills/xy-agent/agents-md.md#7, cov-agent-docs#12, skills/xy-agent/templates.md#10</sub>
- 🟠 **The `.claude/rules/` overflow advice omits that rules are Claude-only and ignores the legacy generated rule files** · `unverified`
  - **Now:** agents-md.md:90 "Path-scoped instructions → `.claude/rules/*.md` with `paths:` frontmatter"; :136. structure.md:25 lists `.claude/rules/*.md` with no caveat.
  - **Actual:** The path-scoping mechanics are accurate. However, Codex and Copilot never read `.claude/rules/`, so content moved there out of the canonical AGENTS.md reaches only Claude. Copilot's equivalent is `.github/instructions/*.instructions.md`. Many repos (sdk-react and nine XYOracleNetwork repos) still carry `xylabs-*.md` rule files with no `paths:` frontmatter, so they load in every session. Those files are headed "Auto-managed by `pnpm xy claude-rules`", a command that toolchain 8.7+ removed, and the workspace CLAUDE.md says to treat them as legacy and not hand-edit them.
  - **Fix:** Amend :90: `.claude/rules/` is Claude-only. Use it for Claude-specific or file-pattern detail that other agents can do without, keep cross-tool rules in AGENTS.md, and mirror rules to `.github/instructions/` when Copilot matters. Add: "Existing `.claude/rules/xylabs-*.md` files are legacy output of the removed `xy claude-rules` command; do not hand-edit or extend them, and prefer a skill for cross-repo guidance." Annotate structure.md:25 the same way.
  - **Evidence:** https://code.claude.com/docs/en/memory ("Organize rules with .claude/rules/"); docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions (`applyTo`); workspace-root CLAUDE.md and AGENTS.md:246, :258; ariestools/sdk-react/.claude/rules/xylabs-style.md:3; `grep -rn claude/rules ariestools/toolchain/packages/toolchain/src` → none.
  - <sub>ids: skills/xy-agent/agents-md.md#5, skills/xy-agent/structure.md#7, cov-agent-docs#20</sub>

### Add

- 🟠 **No rule that AGENTS.md uses Markdown links and never `@path` imports** · `unverified`
  - **Now:** Absent. agents-md.md:96-120 praises imports and never says AGENTS.md itself must not use them.
  - **Actual:** `plan.root.agents-no-at-imports` is an error and is not fixable. CLAUDE.md imports AGENTS.md, and Claude imports are recursive (up to four hops, loaded at launch). An `@papers/...` line in AGENTS.md would therefore pull whole papers into every session, while Codex treats the same line as literal text.
  - **Fix:** Add a "Machine-checked rules" subsection under Per-tool adapters:
    - `@` imports belong only in adapter files (CLAUDE.md, GEMINI.md).
    - AGENTS.md links papers/ and docs/ with Markdown links.
    - Verify with `pnpm xyex plan lint` as well as `/context`. The command is experimental, applies to monorepos, and is not part of `xy check`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:66-78, :112-117; ariestools/toolchain/packages/toolchain/src/actions/plan/markdown.ts:15-24; ariestools/toolchain/docs/repo-docs.md:31; https://code.claude.com/docs/en/memory ("Import additional files").
  - <sub>ids: cov-agent-docs#6, skills/xy-agent/agents-md.md#3</sub>
- ⚪ **Size budget omits Codex's 32 KiB combined cap** · `unverified`
  - **Now:** agents-md.md:84-94 cites only Anthropic's under-200-lines target, which is accurate.
  - **Actual:** Codex stops adding AGENTS.md content once the chain from the root to the working directory reaches `project_doc_max_bytes` (32 KiB by default). The rest is dropped silently.
  - **Fix:** Add: "Codex truncates the combined AGENTS.md chain at 32 KiB (`project_doc_max_bytes`). The 200-line target keeps you well under it, but nested files count toward the same cap."
  - **Evidence:** learn.chatgpt.com/docs/agent-configuration/agents-md (via developers.openai.com/codex/guides/agents-md); https://code.claude.com/docs/en/memory ("Write effective instructions").
  - <sub>ids: skills/xy-agent/agents-md.md#11, cov-agent-docs#20, cov-agent-docs#11</sub>

## `skills/xy-agent/auditing.md`

### Update

- 🔴 **"Pass an explicit stable id" cannot be done from the CLI** · `unverified`
  - **Now:** auditing.md:102 "Use a deterministic id. `createWorkId` embeds today's date… Pass an explicit stable id derived from the check and the path, and check existence before adding."
  - **Actual:**
    - `xy work add` / `xyex work add` has no `--id` option. Only the internal `workAdd()` accepts an `id`, and the package ships no runtime JS entry, only types.
    - yargs is not in strict mode, so a passed `--id` is silently ignored.
    - `createWorkId` appends 3 random bytes, so the id changes on every call, not just once a day.
    - Ids must match `^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$`, and an existing id is overwritten without warning.
  - **Fix:** Replace the bullet. Ids are random and cannot be set from the CLI. To avoid duplicates:
    - Anchor each item to its document with `--file <doc>` and give it a fixed tag, for example `--tag docs-audit`.
    - Before adding, search `pnpm xyex work list --json` (or read `.xy/work/items/*.json`) for a match on `anchors[].path` plus the tag.
    - If a match exists, run `xyex work update <id>` instead of adding a new item.

    Mention `--id` only once the toolchain ships it, and track that as a toolchain request.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/work/addCommand.ts:25-104; ariestools/toolchain/packages/toolchain/src/actions/work/index.ts:104, :171; ariestools/toolchain/packages/toolchain/src/actions/work/id.ts:13-32; ariestools/toolchain/packages/toolchain/src/actions/work/store.ts:92-95; ariestools/toolchain/packages/toolchain/package.json:30; `xyex work add --help`; `npm view @ariestools/toolchain@10.1.0 main exports module types`.
  - <sub>ids: skills/xy-agent/auditing.md#0, cov-agent-docs#4, skills/xy-agent/SKILL.md#6, arch-layering#12</sub>
- 🟠 **"Tooling status" says every check is manual; `xyex plan lint` and `xy repo lint` already automate part of the catalog** · `unverified`
  - **Now:** auditing.md:9 "There is no `xy agent` command yet. The checks below are performed by hand today". :11-19 list only future `xy agent` verbs. SKILL.md:36 routes readers here for "the current tooling status".
  - **Actual:** `xy agent` still does not exist; it is ariestools/toolchain#98 / XYW-20260901-263436, still open. Two shipped commands already cover part of the catalog.
    - **`xyex plan lint`** (experimental). It has 8 error-level rules, the flags `--rules`, `--json`, `--strict` and `--fix`, and levels set through `commands.planLint.rules`. It is not part of `xy check`. It checks that AGENTS.md is present, that CLAUDE.md imports `@AGENTS.md`, and that AGENTS.md has no `@` imports. It also checks that README.md and AGENTS.md link papers/ and docs/, and that the root/papers/docs/notes file set is complete.
    - **`xyex plan init`** bootstraps `.xy/plan.json`.
    - **`xy repo lint`** (stable, run by `xy check`) enforces `repo.package-readme` and `repo.package-readme-files`.
  - **Fix:** Split the section into Shipped and Not shipped.
    - **Shipped:** run `pnpm xyex plan lint` first as a read-only pass, never with `--fix` during an audit. Map each catalog row it covers to its rule id; for example, "Adapters are thin" maps to `plan.root.claude-imports-agents`. Use `pnpm xy repo lint` for package READMEs.
    - **Not shipped:** `xy agent`, labelled as proposed, with a link to toolchain#98.
    - Keep "check `pnpm xy --help`" and add `pnpm xy --stability --json`.
    - Update SKILL.md:36 to match.
    - Warn that plan lint enforces its own fixed layout (see the papers and tree items under structure.md).
  - **Evidence:** `node packages/toolchain/dist/bin/xyex.mjs plan lint --rules`; `xy.mjs repo lint --rules`; `xy.mjs --stability --json`; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:13, :63-64; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:60-62; ariestools/toolchain/docs/repo-docs.md:33-46; ariestools/toolchain/docs/xy-config.md:58; `gh issue view 98 -R ariestools/toolchain` (OPEN); ariestools/toolchain/.xy/work/items/XYW-20260901-263436.json.
  - <sub>ids: skills/xy-agent/auditing.md#2, skills/xy-agent/SKILL.md#2, cov-agent-docs#5, cov-config#10, cov-cli#12, cov-toolchain-history#27, arch-layering#11, arch-distribution#2, arch-coverage#5, skills/xy-agent/agents-md.md#3</sub>
- 🟠 **"Do not claim work there" contradicts the claim flow taught in xy-toolchain** · `unverified`
  - **Now:** auditing.md:109 "Queue work there; do not claim work there." There is no cross-reference.
  - **Actual:** The reasoning behind the rule is correct: a claim is a plain timestamp overwrite with no lease. However, `xy work claim <id>` and `xy work next --claim` are shipped commands. skills/xy-toolchain/commands.md:185-186 and the toolchain's `.agents/skills/xy-work/SKILL.md` both tell agents to claim before starting. The two skills give opposite instructions. xy-agent also restates toolchain internals (`WorkAnchor`, `createWorkId`) that belong in Layer 2.
  - **Fix:** Narrow the rule to: "Claims are advisory and not exclusive across worktrees or clones; do not rely on them to coordinate concurrent agents." Move the operational `xy work` guidance (claim semantics, deduplication, dual-write, the xyex channel) into xy-toolchain's work section, and leave a short pointer in xy-agent.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/helpers.ts:56-69; ariestools/toolchain/packages/toolchain/src/actions/work/schema.ts:28; skills/xy-toolchain/commands.md:177-190; ariestools/toolchain/.agents/skills/xy-work/SKILL.md:22, :146-149.
  - <sub>ids: skills/xy-agent/auditing.md#13, arch-layering#12</sub>
- 🟠 **"Suppress the GitHub dual-write" names no mechanism** · `unverified`
  - **Now:** auditing.md:103 "Suppress the GitHub dual-write for machine-generated items, or confirm with the operator first."
  - **Actual:** No per-command or per-item switch exists. The only control is `stores.github.enabled` in `.xy/work/config.json`. That setting is repo-wide, defaults to `true`, and when set to false also disables `xy work sync`. In a repo without a store, any `xy work` command (add, list, show, triage) creates that config with dual-write on. An item added while `gh` is unavailable is still pushed to GitHub by the next `sync`.
  - **Fix:** State the mechanism. Suppressing dual-write means setting `stores.github.enabled: false` in `.xy/work/config.json`. That is a repo-wide change that also stops sync, so get operator consent first. If the repo has no `.xy/work/config.json`, run no `xy work` command without consent. Link to xy-toolchain/commands.md#skills-and-work-tracking.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/schema.ts:79-96; ariestools/toolchain/packages/toolchain/src/actions/work/store.ts:55-72; ariestools/toolchain/packages/toolchain/src/actions/work/sync.ts:29-36, :145-148; ariestools/toolchain/packages/toolchain/src/xy/common/work/addCommand.ts:25-80; ariestools/toolchain/docs/plan-manifest.md:285; skills/xy-toolchain/commands.md:221-229.
  - <sub>ids: skills/xy-agent/auditing.md#5, cov-agent-docs#18, arch-layering#12</sub>
- 🟠 **"Close the loop" command omits the required id, and `done` does not close the GitHub issue** · `unverified`
  - **Now:** auditing.md:105 "`xy work done --evidence <text>`"
  - **Actual:** The syntax is `xy work done <id> --evidence <text>`, and both arguments are required. `workDone` writes only the local item. The linked GitHub issue closes on the next `xy work sync`, and until then `xy work lint` reports the drift. A rejected finding takes `wontfix`, set with `xy work update <id> --status wontfix`.
  - **Fix:** Use `pnpm xyex work done <id> --evidence "<what proves it>"`. If the item is GitHub-linked, follow it with `pnpm xyex work sync`. Close rejected proposals with `pnpm xyex work update <id> --status wontfix`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/work/doneCommand.ts:15-22; ariestools/toolchain/packages/toolchain/src/actions/work/lifecycle.ts:42-59; ariestools/toolchain/packages/toolchain/src/actions/work/sync.ts:287-296, :424-430; `xyex work update --help`.
  - <sub>ids: skills/xy-agent/auditing.md#6</sub>
- 🟠 **The orphan-check pathspec skips every top-level `docs/*.md`** · `unverified`
  - **Now:** auditing.md:76-77 `for f in $(git ls-files 'docs/**/*.md'); do …`
  - **Actual:** Without `:(glob)` magic, git treats `docs/**/*.md` as an fnmatch pattern that needs an extra path segment. In the toolchain repo it returns 0 files, against 11 for `docs/*.md`. In crypto-cards it returns 331, against 560 with `:(glob)`. Top-level docs are never checked as orphans and never searched for links.
  - **Fix:** Use `git ls-files ':(glob)docs/**/*.md'` in both places in the loop, or `'docs/*.md'`, whose `*` already crosses `/`.
  - **Evidence:** In ariestools/toolchain: `git ls-files 'docs/**/*.md'` → empty; `git ls-files 'docs/*.md' | wc -l` → 11; `git ls-files ':(glob)docs/**/*.md' | wc -l` → 11.
  - <sub>ids: skills/xy-agent/auditing.md#7, cov-agent-docs#14</sub>
- 🟠 **The link-resolution script ignores Markdown links and directory paths** · `unverified`
  - **Now:** auditing.md:58-60 greps only for backticked paths that end in md, json, ts, tsx, mjs or astro. auditing.md:36 calls this "The single highest-value check".
  - **Actual:** The script never checks `[x](path)` targets, which is the form `plan.root.docs-index` requires. It never checks directory paths either, so it cannot catch moved packages. It also resolves package-relative prose paths against the repo root. Run on the toolchain's AGENTS.md, it finds 4 code-span paths, reports one of them as a false MISSING (`src/bin/xyex.ts`), and misses all 9 Markdown link targets.
  - **Fix:** Add a Markdown-link extraction such as `grep -oE '\]\([^)#[:space:]]+' AGENTS.md | sed -E 's/^\]\(//; s#^\./##'`. Skip http(s) links and resolve each target relative to the file. Keep the code-span grep as a secondary check, and also check backticked paths that end in `/`.
  - **Evidence:** Both greps run against ariestools/toolchain/AGENTS.md; ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:80-102.
  - <sub>ids: skills/xy-agent/auditing.md#8, cov-agent-docs#14</sub>
- ⚪ **Fixer guidance contradicts itself and ignores `xy plan lint --fix`** · `unverified`
  - **Now:** auditing.md:21 "Only `index` and `archive` are safe to automate as fixers. … Structural fixes — move a file, regenerate the index, insert a missing front-matter key — are safe"
  - **Actual:** The paragraph first allows two fixers, then three kinds of fix. The shipped `xy plan lint --fix` covers 6 of its 8 rules: it scaffolds templates, prepends `@AGENTS.md`, and appends a Documentation section. It also flattens unexpected papers/ files into the top of notes/ (papers/archive/OLD.md becomes notes/OLD.md), which conflicts with this skill's docs/archive/ model.
  - **Fix:** Change the sentence to "Only structural fixers are safe (index regeneration, archive, front-matter key insertion)." Add that `xyex plan lint --fix` is an existing structural fixer that can move papers/ files into notes/, so an audit runs it without `--fix` and proposes the fix to the owner.
  - **Evidence:** ariestools/toolchain/docs/repo-docs.md:46; ariestools/toolchain/docs/plan-manifest.md:109-113; ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:49-64, :80-102; `xyex plan lint --rules`.
  - <sub>ids: skills/xy-agent/auditing.md#11</sub>
- ⚪ **Divergences heading differs from the one agents-md.md prescribes** · `unverified`
  - **Now:** auditing.md:96 "the `## Known divergences` section"
  - **Actual:** agents-md.md:68 defines the heading as `## Known divergences between documents and code`, so a grep or check keyed on the short name misses it.
  - **Fix:** Use the full heading, or say "the heading starting with 'Known divergences'".
  - **Evidence:** skills/xy-agent/agents-md.md:68; skills/xy-agent/auditing.md:96.
  - <sub>ids: skills/xy-agent/auditing.md#15</sub>

### Add

- 🟠 **The check catalog lacks the root-document rules the toolchain already enforces** · `unverified`
  - **Now:** Absent from auditing.md:27-53 (the Entry point and Documents tables).
  - **Actual:** The toolchain contract also requires the following, so an audit that follows this file passes repos the linter fails:
    - no `@path` imports in AGENTS.md
    - Markdown links from root README.md and AGENTS.md into papers/ and docs/
    - root CHANGELOG.md and CONTRIBUTING.md
    - docs/README.md and docs/ROADMAP.md
    - the papers/ allowlist
    - notes/README.md
  - **Fix:** Add two Entry point rows: "AGENTS.md uses no `@path` imports" (error) and "AGENTS.md and README.md Markdown-link papers/ and docs/" (error). Add one "Required layout" row that defers to `xyex plan lint`. Tag every row that has a shipped rule with its rule id, so agents run the tool instead of the grep.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:66-102; ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:19-42, :468-512; ariestools/toolchain/docs/repo-docs.md:33-42; ariestools/toolchain/docs/plan-manifest.md:86-106.
  - <sub>ids: skills/xy-agent/auditing.md#3, cov-agent-docs#6</sub>
- ⚪ **Work-item guidance names fields but not the item type or the flags** · `unverified`
  - **Now:** auditing.md:104 "Supply `area`, priority, acceptance criteria, and verification."
  - **Actual:**
    - `work add <type> <title>` needs a type: bug, todo, feature, idea, debt, research, question or risk.
    - Priority comes from any of `--impact`, `--urgency`, `--effort`, `--risk` and `--confidence`; unset values default to 3.
    - `--acceptance` and `--verify` can be repeated, `--file` and `--line` anchor the item, and `--tag` labels it.
    - Triage flags open items that are missing priority, area, acceptance criteria or verification.
  - **Fix:** Add one example, `pnpm xyex work add debt "Reconcile docs/plans/X.md" --area docs --file docs/plans/X.md --tag docs-audit --impact 2 --urgency 2 --acceptance "…" --verify "…"`, and say that doc rot is normally filed as `debt`.
  - **Evidence:** `xyex work add --help`; ariestools/toolchain/packages/toolchain/src/actions/work/schema.ts:1; ariestools/toolchain/packages/toolchain/src/actions/work/priority.ts:44-52; ariestools/toolchain/packages/toolchain/src/actions/work/list.ts:173-180.
  - <sub>ids: skills/xy-agent/auditing.md#12</sub>

## `skills/xy-agent/lifecycle.md`

### Update

- 🟠 **The front-matter `state` vocabulary and field names do not map onto Plan Manifest v1 document metadata** · `unverified`
  - **Now:**
    - lifecycle.md:11 `state: … # draft|active|normative|superseded|retired`.
    - lifecycle.md:14 requires `reviewed:` only for runbooks.
    - lifecycle.md:29-35 says normative documents live in papers/ and specs/.
    - The decision template (templates.md:98-105) sets `state: normative` and records acceptance only in prose.
    - The evidence template (templates.md:131-138) sets `state: active`, and the runbook template (templates.md:162-169) uses `reviewed:`.
    - The index example (templates.md:221) marks docs/decisions/ as normative.
  - **Actual:** The shipped schema keeps two axes separate: `lifecycle` (accepted, active, archived, deprecated, draft, proposed, superseded) and `authorityLevel` (descriptive, evidentiary, informative, normative). It uses `lastReviewed` and an id-valued `supersededBy`. A repo may hand exactly these fields to front matter with `metadata.source: front-matter`. The skill's single `state` field merges the two axes, which causes these gaps:
    - A decision cannot be both accepted and normative.
    - Evidence cannot be marked evidentiary.
    - `retired` has no schema equivalent.
    - There is no accepted or proposed state, although decisions are "immutable once accepted" (:45).

    The state table also contradicts where the decision template puts normative documents.
  - **Fix:** Settle the contract in lifecycle.md, then mirror it in the three templates and the index example.
    - Preferred: split `state` into `lifecycle:` and `authority:`, each using the schema's enum, and use or alias `lastReviewed`, recommended on every kind.
    - Otherwise, add a mapping table: draft→draft, active→active, normative→accepted + normative, superseded→superseded (path→manifest id), retired→archived or deprecated.
    - Add docs/decisions/ to the "Where it lives" cell for normative.
    - At minimum, make `accepted` a machine-readable field in the decision template.
  - **Evidence:** ariestools/toolchain/packages/toolchain/schemas/plan-manifest.v1.schema.json:334-420; ariestools/toolchain/docs/plan-manifest.md:29-34, :315; skills/xy-agent/templates.md:98-105, :221.
  - <sub>ids: skills/xy-agent/lifecycle.md#1, skills/xy-agent/templates.md#7, cov-agent-docs#10</sub>
- 🟠 **The claim that front matter is "the only structured connection" between documents and `xy work` is inaccurate** · `unverified`
  - **Now:** lifecycle.md:114 "Nothing in `xy work` links back — `WorkAnchor` supports only `kind: 'file'` … so this front-matter field is the only structured connection between the two"
  - **Actual:** It is correct that `WorkAnchor` supports only files. But a file anchor accepts any repo path, so `xy work add --file docs/plans/X.md` links an item to a document. A reviewed `.xy/plan.json` also links roadmap phases to work items (`workItems: [{id, relation: blocks|implements|tracks|verifies}]`), and a `planned` paper slot must cite at least one work id. Id prefixes are configurable: XYW by default, GH-* for imported issues.
  - **Fix:** Rewrite the paragraph. Work items can anchor to a document path with `--file` (file anchors only). Front-matter `workItems:` is the document-side link. Where a reviewed `.xy/plan.json` exists, phase and planned-paper links belong in the manifest and are not duplicated in front matter. Drop the `WorkAnchor` internals, or move them to xy-toolchain.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/schema.ts:17-21, :81, :181; ariestools/toolchain/packages/toolchain/src/actions/work/helpers.ts:16-23; ariestools/toolchain/packages/toolchain/src/actions/work/store.ts:134-147; `xy.mjs work add --help`; ariestools/toolchain/packages/toolchain/schemas/plan-manifest.v1.schema.json:158-186, :620-645; ariestools/toolchain/docs/plan-manifest.md:129, :232-246.
  - <sub>ids: skills/xy-agent/lifecycle.md#2, cov-agent-docs#19, skills/xy-agent/SKILL.md#3, arch-layering#12</sub>
- ⚪ **The decision filename pattern `<PREFIX>-D0001-` matches no repo and does not grep-match existing three-digit ids** · `unverified`
  - **Now:** lifecycle.md:43 "named `<PREFIX>-D0001-kebab-title.md`, where `PREFIX` is the repository's short code (`CC`, `IMM`, `EK`)". structure.md:15 shows the same pattern, and structure.md:18 shows evidence as `YYYY-MM-DD-slug.md`.
  - **Actual:** No workspace file uses `-D0001-`. The cited prefixes already appear with three digits in prose (CC-D019, CC-D021, IMM-D001 to IMM-D015), so `CC-D0021-…` filenames would not match the existing citations. Repos actually use `D-001-…` (dapp-kit, event-kit), `ADR-0001-…` (immortalizer) and `0001-…` (undestined-worlds). Evidence names also differ; see the evidence-bundle item below.
  - **Fix:** "Use the id exactly as the repository already cites it (e.g. `CC-D021-kebab-title.md`), zero-padded to the existing width; use four digits only when starting a new register." Label the structure.md:15 and :18 patterns as defaults for new repos, and tell agents to detect and keep a repo's existing naming, per SKILL.md:18.
  - **Evidence:** `find` across the workspace for `*-D0[0-9][0-9][0-9]-*.md` → none; `grep -ohE '(CC|IMM|EK)-D[0-9]+'` over XYOracleNetwork/crypto-cards/{AGENTS,PRD}.md and XYOracleNetwork/immortalizer/docs/decisions/*.md; `ls` of XYOracleNetwork/{event-kit,dapp-kit,immortalizer}/docs/decisions and ariestools/undestined-worlds/docs/decisions.
  - <sub>ids: skills/xy-agent/lifecycle.md#8, skills/xy-agent/structure.md#9</sub>
- ⚪ **`amends:` is used but missing from the front-matter schema** · `unverified`
  - **Now:** lifecycle.md:69 "record the correction in an `amends:` field". The schema block (:7-21) omits it. auditing.md:49 relies on it as the escape hatch from the immutability check, and the evidence template (templates.md:131-140) omits it.
  - **Actual:** The field is part of the contract, but its shape is never defined.
  - **Fix:** Add it to the schema block and the evidence template, for example `amends: [{ date: "YYYY-MM-DD", change: "fixed broken link to …" }]  # evidence only; corrections that do not change the result`.
  - **Evidence:** skills/xy-agent/lifecycle.md:7-21, :69; skills/xy-agent/auditing.md:49; skills/xy-agent/templates.md:131-140.
  - <sub>ids: skills/xy-agent/lifecycle.md#6</sub>

### Add

- 🟠 **The skill assumes front matter owns lifecycle metadata and ignores the manifest's single-owner rule** · `unverified`
  - **Now:** lifecycle.md:3 "Every document under `docs/`, `papers/`, and `specs/` carries YAML front matter". lifecycle.md:110 names only two indexes (the AGENTS.md table and docs/README.md). The front-matter, staleness and supersession checks in auditing.md:46-50 assume front matter is the only source.
  - **Actual:** Plan Manifest v1 gives each document exactly one metadata owner, set by `metadata.source: manifest | front-matter`: "Use inline manifest metadata until front matter is adopted; never maintain both." In a repo where the manifest owns the metadata, flagging missing front matter is a false positive, and adding front matter breaks the rule. No toolchain doc or paper carries YAML front matter today.
  - **Fix:** Add a "Plan manifest" subsection near "The generated index". Where `.xy/plan.json` exists, exactly one of the manifest or front matter owns lifecycle, authority, review date and supersession. Set `metadata.source: front-matter` once this skill's front matter is adopted, and never fill in both. In auditing.md, before the Documents checks, read each document's `metadata.source`; where it is `manifest`, take state and review dates from the manifest.
  - **Evidence:** ariestools/toolchain/docs/plan-manifest.md:17-34; ariestools/toolchain/packages/toolchain/schemas/plan-manifest.v1.schema.json:334-421 (description at :335); `head -1` of ariestools/toolchain/docs/*.md and papers/*.md (no `---`).
  - <sub>ids: skills/xy-agent/lifecycle.md#3, skills/xy-agent/auditing.md#9, cov-agent-docs#10</sub>
- 🟠 **No lifecycle rules for the docs/ROADMAP.md and notes/ that `xy plan lint` requires** · `unverified`
  - **Now:** lifecycle.md never mentions docs/ROADMAP.md or notes/, and :3 requires front matter on every document.
  - **Actual:** Plan lint requires docs/README.md, docs/ROADMAP.md, notes/README.md and the papers. Its `--fix` creates them from templates that have no front matter; the papers get a `## Status` / "Draft." section instead. notes/ is freeform and non-governing unless the manifest cites a file there, and it receives files moved out of papers/.
  - **Fix:** Add three rules:
    1. docs/ROADMAP.md is the living plan (kind: plan, state: active). It is revised in place and never superseded or archived, because lint requires it. Finished docs/plans/ files are what get archived.
    2. notes/ is non-governing and exempt from front matter unless AGENTS.md or the manifest cites a file there.
    3. After `xyex plan lint --fix`, add front matter to the scaffolded files.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:27-37; ariestools/toolchain/packages/toolchain/src/actions/plan/templates.ts:54-147; ariestools/toolchain/docs/plan-manifest.md:85-94, :109-113; `xy.mjs plan lint --rules`.
  - <sub>ids: skills/xy-agent/lifecycle.md#4</sub>
- 🟠 **Evidence rules cover only single dated `.md` files; real evidence is JSON, Markdown + JSON pairs, or dated directories** · `unverified`
  - **Now:** lifecycle.md:60 and structure.md:18 "Name it `docs/evidence/YYYY-MM-DD-slug.md`". lifecycle.md:65 puts the commit in front matter. auditing.md:49 checks immutability only for .md files.
  - **Actual:** Workspace repos record evidence in several forms:
    - xyo-chain `docs/evidence/2026-10-01-mainnet-durability/` holds 10 JSON files and no Markdown.
    - chain-event-service uses dated directories of JSON receipts.
    - actor-kit pairs `docs/ENGINE_MERGE_2026_09_18_EVIDENCE.md` with `docs/evidence/*.json`.
    - dapp-kit and crypto-cards pair `*_EVIDENCE.md` with `*_REPORT.json`.

    JSON cannot carry front matter, and no repo uses the single-file form the skill prescribes.
  - **Fix:** Add an "Evidence bundles" rule:
    - A dated directory `docs/evidence/YYYY-MM-DD-slug/` is valid, as is an .md with a sibling report JSON.
    - A README.md or sibling .md carries the front matter (commit, command, tier) and links each artifact.
    - JSON reports embed the commit and command as well.
    - Immutability covers every file in the record.
    - The date-first prefix stays the preferred form.
  - **Evidence:** `ls XYOracleNetwork/xyo-chain/docs/evidence/2026-10-01-mainnet-durability/`; `ls XYOracleNetwork/chain-event-service/docs/evidence/2026-10-08-current-graph/` and `…/2026-10-06-node26-beta/`; `git ls-files` in ariestools/actor-kit, XYOracleNetwork/dapp-kit and XYOracleNetwork/crypto-cards.
  - <sub>ids: skills/xy-agent/lifecycle.md#5, cov-agent-docs#21, skills/xy-agent/structure.md#9</sub>

## `skills/xy-agent/structure.md`

### Update

- 🔴 **The paper filename convention conflicts with the `xy plan lint` papers/ allowlist, and `--fix` moves such papers into notes/** · `unverified`
  - **Now:** structure.md:50 "The house convention is `<PRODUCT>_{WHITE,YELLOW,GREEN,LIGHT}_PAPER.md`". structure.md:55 describes a Light paper. The tree (:10) has no papers/README.md, and :29 says "an empty `papers/` directory is a lie". agents-md.md:31 uses the example `papers/X_YELLOW_PAPER.md`.
  - **Actual:** Plan lint allows only papers/README.md, WHITE-PAPER.md and YELLOW-PAPER.md, all three required, plus an optional GREEN-PAPER.md. The check is recursive and case-sensitive. Anything else is an error: product-prefixed names, LIGHT papers, PDFs, papers/archive/. `--fix` flattens those files into notes/ and creates Draft stubs. `xy plan init` still recognizes both naming styles.

    Usage in the workspace is split. The toolchain and simple-eula-dapp use `WHITE-PAPER.md`. crypto-cards, dapp-kit, event-kit, immortalizer, lifehash, webble and chain-event-service use `<PRODUCT>_*_PAPER.md`; crypto-cards gets three `plan.papers.unexpected-files` errors.
  - **Fix:**
    - Make `papers/{README,WHITE-PAPER,YELLOW-PAPER}.md`, plus an optional `GREEN-PAPER.md`, the canonical names for new repos and for any repo adopting `xyex plan lint`. Add papers/README.md to the tree.
    - Move Light papers and PDFs outside papers/: to notes/, a release asset, or the manifest's `light` slot.
    - Keep `<PRODUCT>_*_PAPER.md` recognized in existing repos until the owner agrees to rename.
    - Warn: never run `xy plan lint --fix` on such a repo first, because it moves the papers into notes/.
    - Change agents-md.md:31 to `[papers/YELLOW-PAPER.md](papers/YELLOW-PAPER.md)`.

    Resolution note: auditors split between "adopt the toolchain names" and "document both conventions". This fix combines the two, in line with SKILL.md:18 (follow the repo's existing convention). The alternative, making the allowlist configurable through `commands.planLint`, would need a toolchain change.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:27-41, :296-314, :476-496; ariestools/toolchain/packages/toolchain/src/actions/plan/index.ts:163-185; `xy.mjs plan lint --rules` ("fixes flatten other regular files into notes/"); ariestools/toolchain/CHANGELOG.md:30; ariestools/toolchain/docs/plan-manifest.md:85-94, :118-131; `xyex plan lint --json` in XYOracleNetwork/crypto-cards (12 errors).
  - <sub>ids: skills/xy-agent/structure.md#0, cov-agent-docs#1, skills/xy-agent/agents-md.md#4, cov-cli#1, arch-layering#1, cov-toolchain-history#26, arch-distribution#2, arch-coverage#5, cov-config#10</sub>
- ⚪ **"Where docs/ is not called docs/" ignores that plan lint hard-codes docs/** · `unverified`
  - **Now:** structure.md:91 "if the generated-API dump owns `docs/`, keep prose in the other directory and apply every convention here to it unchanged."
  - **Actual:** The repo descriptions are accurate: sdk-js and sdk-react gitignore `/docs` and keep prose in `documents/`, and 6502-wasm uses `tech-doc/`. But plan lint always requires docs/README.md and docs/ROADMAP.md and checks for links into `docs/`. In those repos its fixer would write the files into an ignored directory.
  - **Fix:** Add: in a repo where a generated dump owns docs/, do not adopt `xyex plan lint` until the dump moves, for example to docs/api/ or out of docs/ entirely.
  - **Evidence:** ariestools/sdk-js/.gitignore:4; ariestools/sdk-react/.gitignore:11; arietrouw/6502-wasm/tech-doc; ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:33-36; ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:80-102.
  - <sub>ids: skills/xy-agent/structure.md#10</sub>

### Add

- 🟠 **The canonical tree lacks files plan lint requires: CHANGELOG.md, CONTRIBUTING.md, docs/ROADMAP.md, notes/** · `unverified`
  - **Now:** In structure.md:5-27 the root has only AGENTS.md, CLAUDE.md and README.md, docs/ has only lifecycle subfolders, and there is no notes/. :29 forbids placeholder tiers.
  - **Actual:** Plan lint requires root CHANGELOG.md and CONTRIBUTING.md, plus docs/README.md, docs/ROADMAP.md and notes/README.md, all at error level. notes/ is the sanctioned non-governing home for irregular material. `--fix` creates white and yellow papers that say only "Draft.", which is exactly the placeholder :29 forbids. Lifecycle subfolders in docs/ are allowed and not linted. The toolchain repo follows this layout.
  - **Fix:** Add CHANGELOG.md, CONTRIBUTING.md, docs/ROADMAP.md (the canonical forward plan, parent of docs/plans/) and notes/ (freeform, non-governing) to the tree and to the "Which tier" table. Mark them as required when a repo adopts `xyex plan lint`. Reconcile :29: in plan-lint repos the papers tier is mandatory, so fill in the scaffolded drafts rather than leaving them as placeholders.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:19-37, :468-512; ariestools/toolchain/packages/toolchain/src/actions/plan/templates.ts:23-147; `xy.mjs plan lint --rules`; ariestools/toolchain root (CHANGELOG.md, CONTRIBUTING.md, notes/README.md, docs/ROADMAP.md); XYOracleNetwork/simple-eula-dapp/notes/README.md.
  - <sub>ids: skills/xy-agent/structure.md#2, cov-agent-docs#9, cov-cli#1, arch-layering#1, cov-toolchain-history#26, arch-distribution#2</sub>
- 🟠 **The README audience split is missing: the root README is a maintainer guide that must link papers/ and docs/, and package READMEs are absent** · `unverified`
  - **Now:** structure.md:8 "README.md humans: what it is, install, commands. NOT policy." The skill never mentions `packages/<pkg>/README.md`, and the SKILL.md:24 summary omits it.
  - **Actual:** repo-docs.md defines an audience map. In a monorepo the root README is unpublished and covers how to develop the repo, plus an index of papers/ and docs/. `plan.root.docs-index` requires Markdown links into both. Each `packages/<pkg>/README.md` is the npm consumer doc. The stable `xy repo lint`, which `xy check` runs, errors when a workspace package lacks a README.md (`repo.package-readme`) or a publishable package leaves it out of `files` (`repo.package-readme-files`).
  - **Fix:** Reword :8 to "humans developing this repo: orientation plus Markdown links to papers/ and docs/; not policy; in a monorepo, install and usage live in the package READMEs". Add `packages/<pkg>/README.md`, described as "npm consumers: install, API, usage; required by xy repo lint; listed in files; never agent policy", to the tree. Mention the split in the SKILL.md:24 routing summary.
  - **Evidence:** ariestools/toolchain/docs/repo-docs.md:7-18, :41-44; `xy.mjs repo lint --rules`; ariestools/toolchain/packages/toolchain/src/actions/package-lint-docs.ts:54-121; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:63-64; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/README.md.tmpl:5-14; ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:80-124.
  - <sub>ids: skills/xy-agent/structure.md#3, skills/xy-agent/structure.md#4, skills/xy-agent/SKILL.md#5, cov-agent-docs#22, cov-toolchain-history#28, arch-layering#1</sub>
- 🟠 **Toolchain-managed skills appear neither in the tree nor as an overflow destination** · `unverified`
  - **Now:** Absent. The tree lists only `.claude/rules/*.md` and `.xy/work/items/` as agent dot-paths (structure.md:25-26). The overflow destinations in agents-md.md:88-94 are rules, nested AGENTS.md and docs/.
  - **Actual:** In this workspace, per-repo agent guidance is delivered as skills:
    - tracked content under `.agents/skills/**`
    - `.claude/skills/*` symlinks into it
    - `skills-lock.json`, pinning the set

    All of it is managed with `pnpm xy skills` and checked by `xy check`, and every current @ariestools repo has a skills-lock.json. Claude Code's own guidance sends multi-step procedures to skills, which load only when relevant.
  - **Fix:** Add `.agents/skills/`, `.claude/skills/` and `skills-lock.json` to the tree, each marked "managed by `pnpm xy skills`; do not hand-edit installed skills". Add a fourth overflow item to agents-md.md: "Procedures and task-specific how-tos → a skill (`.agents/skills/<name>/SKILL.md`, linked into `.claude/skills/`)", and point to xy-toolchain's `xy skills` reference.
  - **Evidence:** workspace-root CLAUDE.md and AGENTS.md:258; ariestools/toolchain/packages/toolchain/src/actions/skills/installed.ts:6; ariestools/toolchain/packages/toolchain/src/actions/skills/lock.ts:6; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:69-70; ariestools/toolchain/.agents/skills/xy-work; https://code.claude.com/docs/en/memory ("When to add to CLAUDE.md").
  - <sub>ids: skills/xy-agent/structure.md#6, skills/xy-agent/agents-md.md#6</sub>
- ⚪ **A root ARCHITECTURE.md is not placed in any tier** · `unverified`
  - **Now:** Absent from the tier table (structure.md:35-44). agents-md.md:82 keeps architecture overviews out of AGENTS.md without saying where they go.
  - **Actual:** Three of seven ariestools repos track one: toolchain/architecture.md, actor-kit/ARCHITECTURE.md and browser-kit/ARCHITECTURE.md. The toolchain's is a short pointer to its yellow paper.
  - **Fix:** Add a row: a root ARCHITECTURE.md is a human-facing overview that defers to the yellow paper. AGENTS.md's authority table links to it with a Markdown link instead of duplicating it.
  - **Evidence:** `git ls-files` in ariestools/{actor-kit,browser-kit,toolchain}; ariestools/toolchain/architecture.md:1-5.
  - <sub>ids: cov-agent-docs#23</sub>

## `skills/xy-agent/templates.md`

### Update

- 🔴 **docs/README.md is described as generated, and the template names `pnpm xy agent index`, which does not exist** · `unverified`
  - **Now:**
    - templates.md:209 "Generated — do not hand-edit. Regenerate whenever anything under `docs/` changes."
    - templates.md:212 `<!-- Generated. Do not edit. Run: pnpm xy agent index -->`
    - structure.md:14 "GENERATED index — never hand-edited", repeated at :85.
    - lifecycle.md:104-110 "generated from front matter and never hand-edited", plus "regenerate the index" at :56, :84 and :100.
    - agents-md.md:37 "the generated `docs/README.md`".
    - SKILL.md:3 "the generated docs index".
  - **Actual:** Neither `xy` nor `xyex` has an `agent` command, in 10.1.0 or on main; `xy.mjs agent index` returns "Command not found [agent]". `xy agent` is open work (toolchain#98, XYW-20260901-263436), and auditing.md:9 already says so. The toolchain treats docs/README.md as a hand-written Contents list:
    - `plan.docs.required-files` requires the file.
    - `--fix` writes a hand-written template that links ROADMAP.md.
    - The toolchain's own docs/README.md is hand-curated.
    - No workspace repo has a generated one.

    structure.md:87 itself says that "never hand-edit" without a working command is an instruction an agent cannot follow.
  - **Fix:**
    - In templates.md, remove the `Run: pnpm xy agent index` comment and replace :209 and :212 with, for example, "Maintained by hand from front matter until a generator ships (`xy agent index` is proposed; see auditing.md). Update it in the same change as any docs/ edit." Add a ROADMAP.md row to the example.
    - In structure.md:14 and :85, lifecycle.md:104-110 and agents-md.md:37, say "maintained by hand until a generator exists; `xyex plan lint` requires the file", and limit "never hand-edited" to repos that adopt a generator.
    - In lifecycle.md:84 and :100, change "Regenerate the index" to "Update docs/README.md (regenerate it if the repo has a generator)".
    - In SKILL.md:3, say "the docs index".

    Resolution note: three findings suggested a tool-neutral comment instead ("regenerate with the repository's index script"). No workspace repo has such a script, and structure.md:87 rules out an instruction an agent cannot follow, so the hand-maintained wording is kept.
  - **Evidence:** `node packages/toolchain/dist/bin/xy.mjs agent index`; `xy.mjs --stability --json` (no agent entry); ariestools/toolchain/packages/toolchain/src/xy/stability.ts:13-75; ariestools/toolchain/packages/toolchain/src/actions/plan/templates.ts:54-63; ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:33-36, :499-503; ariestools/toolchain/docs/README.md:1-11; ariestools/toolchain/.xy/work/items/XYW-20260901-263436.json; XYOracleNetwork/dapp-kit/docs/README.md; skills/xy-agent/structure.md:87; skills/xy-agent/auditing.md:9.
  - <sub>ids: skills/xy-agent/templates.md#0, cov-agent-docs#2, skills/xy-agent/structure.md#1, skills/xy-agent/lifecycle.md#0, skills/xy-agent/agents-md.md#9, arch-distribution#12, cov-cli#11, cov-toolchain-history#27, arch-layering#11, skills/xy-agent/SKILL.md#2</sub>
- 🔴 **The AGENTS.md skeleton has no Markdown links to papers/ or docs/, so it fails `plan.root.docs-index`** · `unverified`
  - **Now:** templates.md:7-63 writes every path as a code span (`docs/<HANDOFF>.md` at :21, `<path>` at :32, `papers/` at :42-44), with no `[text](path)` links. The examples in agents-md.md:17-21 and :29-33 do the same.
  - **Actual:** `plan.root.docs-index` (error) requires root AGENTS.md and README.md to contain real Markdown links into papers/ and docs/. Code spans, fences and comments are stripped before the check. Running the toolchain's own checker on the template returns `missing doc folders: ['papers','docs']`, and crypto-cards, which was built from this skill, fails the rule. `--fix` would append a generic `## Documentation` section and break the template's section order. Both toolchain scaffolds open with a Documentation link block.
  - **Fix:**
    - Add a `## Documentation` block of real links: `- [Papers](./papers/README.md)`, `- [Docs](./docs/README.md)`, `- [Roadmap](./docs/ROADMAP.md)`.
    - Make the Orient entries and the authority-table cells Markdown links, for example `[docs/<HANDOFF>.md](docs/<HANDOFF>.md)` and `[<path>](<path>)`.
    - In the repository map, make the papers row `[papers/](papers/README.md)` and add a `[docs/](docs/README.md)` row.
    - Add one line saying links must be Markdown links, never `@path` imports.
    - Apply the same changes to the agents-md.md examples.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/markdown.ts:5-9, :35-58; ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:80-102, :118-124; ariestools/toolchain/packages/toolchain/src/actions/plan/templates.ts:2-22; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/AGENTS.md.tmpl:1-8; ariestools/toolchain/docs/repo-docs.md:31, :40; a scratch script that imports markdown.ts and runs it on templates.md:8-62; `xyex plan lint --json` in XYOracleNetwork/crypto-cards.
  - <sub>ids: skills/xy-agent/templates.md#2, cov-agent-docs#3, skills/xy-agent/agents-md.md#3</sub>
- 🟠 **The Orient step `pnpm xy work list` creates a work store during read-only orientation** · `unverified`
  - **Now:** templates.md:23 "3. `pnpm xy work list` — the open work items."
  - **Actual:** In single-repo mode, `xy work list` calls readWorkConfig, which calls ensureWorkStore. When `.xy/work/` is missing, that creates `.xy/work/`, items/, queues/ and a default config.json with GitHub dual-write enabled, and it may query GitHub. The toolchain's plan-manifest docs say that side-effect-free interrogation must not call `xy work list` or `show`. The command is also experimental (see the SKILL.md item).
  - **Fix:** "3. If `.xy/work/config.json` is tracked, `pnpm xyex work list` — the open work items (or read `.xy/work/items/` directly). Do not run it in a repo that has no store, because it creates one."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/store.ts:55-72, :115-121; ariestools/toolchain/packages/toolchain/src/actions/work/workspace.ts:153-160; ariestools/toolchain/packages/toolchain/src/actions/work/list.ts:90, :141; ariestools/toolchain/packages/toolchain/src/actions/work/schema.ts:82-85; ariestools/toolchain/docs/plan-manifest.md:285, :296.
  - <sub>ids: skills/xy-agent/templates.md#3, cov-agent-docs#13, cov-cli#11, cov-toolchain-history#29</sub>
- 🟠 **The archive banner's relative link breaks when the original subpath is preserved** · `unverified`
  - **Now:** templates.md:195 and lifecycle.md:95 "Superseded by `` [`docs/plans/NEW.md`](../plans/NEW.md) ``". lifecycle.md:92 says to preserve the original relative path, and the index example at templates.md:223 uses `archive/plans/…`.
  - **Actual:** From `docs/archive/plans/OLD.md`, `../plans/NEW.md` resolves to `docs/archive/plans/NEW.md`, which does not exist. The link works only for a flat `docs/archive/OLD.md`. auditing.md:36 treats unresolved links as errors.
  - **Fix:** Use `../../plans/NEW.md` in the example, or a placeholder that depends on depth. In both templates.md and lifecycle.md, add: "recompute the relative link from the archived file's new location, then run the link check".
  - **Evidence:** Path resolution from docs/archive/plans/OLD.md; skills/xy-agent/templates.md:195, :223; skills/xy-agent/lifecycle.md:92-98; skills/xy-agent/auditing.md:36.
  - <sub>ids: skills/xy-agent/templates.md#6, skills/xy-agent/lifecycle.md#7</sub>
- ⚪ **`pnpm validate` appears as a literal gate command that no xy repo defines** · `unverified`
  - **Now:** templates.md:50 "| `pnpm validate` | The complete local gate: … |"
  - **Actual:** None of toolchain, sdk-js, sdk-react, actor-kit, browser-kit, cli-kit or ariestools-skills defines a `validate` script. The xy gate is `pnpm xy build` plus `pnpm xy test`, with `pnpm xy check` for repo, skills and packman lint. Unlike the other cells, this one is not a placeholder, so agents are likely to copy it verbatim.
  - **Fix:** Use a placeholder: `| <gate command, e.g. pnpm xy build && pnpm xy test> | The complete local gate: … |`.
  - **Evidence:** Root package.json scripts of ariestools/{toolchain,sdk-js,sdk-react,actor-kit,browser-kit,cli-kit,ariestools-skills}; `xy --help`.
  - <sub>ids: skills/xy-agent/templates.md#9, cov-agent-docs#3</sub>
- ⚪ **The evidence "Tier" ladder differs from the toolchain's assurance facets** · `unverified`
  - **Now:** templates.md:144-145 "This is <local | local-chain | testnet | hosted> evidence."
  - **Actual:** The manifest's evidence model records independent facets rather than one tier:
    - artifact: source, built, packed, published, deployed
    - environment: local, ci, preview, hosted, production
    - network: none, simulated, devnet, testnet, mainnet
    - plus execution, access and validation

    The schema docs say "The facets are not a maturity ladder". `local-chain` is not a value, and testnet and hosted belong to different facets.
  - **Fix:** "**Assurance.** artifact: <…>; environment: <…>; network: <…>. It does not establish <facets/values not covered>." Optionally add `observedOn` to the evidence front matter.
  - **Evidence:** ariestools/toolchain/packages/toolchain/schemas/plan-manifest.v1.schema.json:806-850; ariestools/toolchain/docs/plan-manifest.md:260-279.
  - <sub>ids: skills/xy-agent/templates.md#8</sub>

## Refuted during verification

None. Verification was paused before it reached this skill, so no finding was refuted (or confirmed).
