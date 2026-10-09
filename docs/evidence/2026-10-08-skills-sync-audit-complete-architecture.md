---
title: "Skills sync audit (complete) 2026-10-08 — architecture"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Completed audit of the skill-pack architecture and cross-repo distribution at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.1 (812b27a91) and @ariestools/sdk 9.0.1 (298fbb5bb); 44 merged open items from 78 raw findings, all verified by two lenses; 0 refuted, 0 resolved upstream; supersedes the partial 2026-10-08 audit."
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit (complete) — architecture

Each open item below was found by an auditor and then confirmed by two independent verifiers, one reading the code and one reading the skill text, against the commits named above. The toolchain side was re-checked at 10.1.1. Where a verifier adjusted severity, action or recommendation, the adjusted version is shown. This record does **not** establish that any fix has been applied, because none has. It is not a priority-ordered remediation plan, and no agent has yet tested the recommended replacement text by using the skill. Back to the [Audit index](2026-10-08-skills-sync-audit-complete.md). Member ids refer to the raw [findings JSON](2026-10-08-skills-sync-audit-complete-findings.json).

## Summary

Inside the pack the layers still point downward, and every link and anchor resolves today. The open problems sit at the seams. The fourth skill, `xy-agent`, has no declared layer and is unknown to the toolchain catalog. Yet since 10.1.1, `xy check` enforces its convention through a stable `xy agent lint`, and that lint misfires on documents written exactly to the skill. Distribution has three high-severity hazards: the xyo-skills install instructions overwrite the base skills with redirect stubs, retired `xy claude` output is still tracked in 10 repos, and the new `xy skills pick` can wipe a repo's `xy.config.ts`. The toolchain's own scaffold also fails its own `xy check`. All five high items are outside the skill text.

| | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 1 | 1 | 1 | 3 |
| Update | 4 | 21 | 9 | 34 |
| Add | 0 | 6 | 1 | 7 |
| **Total** | **5** | **28** | **11** | **44** |

44 open items (78 raw findings) · 0 refuted · 0 resolved upstream

## Assessment

The waterfall holds inside the pack. L3 `ariestools-sdk` links down to L2 `xy-toolchain`, which links down to L1 `xy-development`, and no lower layer depends on a higher one. Three things break the model:

1. **`xy-agent` sits outside it.** L1 links to it as "recommended, not required". Its conventions build only on L1, but its commands (`xy work`, and since 10.1.1 the stable `xy agent`) belong to L2. `xy check` now enforces it at error level in every toolchain repo, while the toolchain catalog, the marketplace metadata, the workspace map and this repo's own docs still describe a three-skill pack.
2. **"Layer N" is overloaded.** It names the skill stack, the Definition of Done (DoD) completion gate, and xyo-skills' own 1–9 numbering. In xyo-skills, "Layer 3" is `xyo-knowledge`, which hides that the domain pack depends on this pack's L3.
3. **L3 covers only sdk-js.** sdk-react, actor-kit, browser-kit and cli-kit have no skill, and nothing would install one.

Distribution runs through Skills.sh and the toolchain's `xy skills`. That path sees only catalog names, so `xy-agent`, legacy `xylabs-*` output and local forks go unchecked. It compares versions against a line that restarted at 0.1.x, and it gained a data-losing `pick` in 10.1.1. Downstream, xyo-skills still ships installable stubs under the base skill names.

**Current**

```
ariestools/ariestools-skills @ 7e78933a8 (v0.1.5) — only editable source
  L3  ariestools-sdk        sdk-js only; sdk-react / actor / browser / cli kits: no skill
  L2  xy-toolchain          no link to xy-agent; no xy.skills / presence docs; xy work = 3 versions
  L1  xy-development ──"recommended"──▶ xy-agent  (no layer; uses L2 `xy work`, `xy agent`)
        DoD "Layer 1/2/3" ≠ skill "Layer 1/2/3"
      │ release-please + scripts/marketplace-sync (copies the whole skills/ tree)
      ├──▶ ariestools-claude-plugin ─┐ metadata names 3 skills
      ├──▶ ariestools-codex-plugin  ─┘
      └──▶ Skills.sh  (README: `npx skills add … --all` → every agent)
               │
               ▼
@ariestools/toolchain 10.1.1 (812b27a91)
  xy skills defaults    --all from ariestools-skills (xy-agent installed, unmanaged)
                        + explicit --skill list from xyo-skills
  xy skills lint        catalog = sdk, development, toolchain           ✗ xy-agent
                        required = tier + sdk-js package set            ✗ other kits
                        semver.lt vs main (0.1.5) → 1.1.x copies "current"
                        non-catalog names ignored → xylabs-*, xy-work unseen
  xy skills pick (new)  catalog only; rewrites xy.config.ts lacking `skills:`
  xy check ──▶ xy agent lint (new, stable, unconditional, error-level)
                        enforces xy-agent; misfires on skill-conformant docs;
                        the toolchain's own repo-init scaffold fails it
               │
               ▼
consuming repos (.agents/skills + skills-lock.json)
  6 @ariestools repos: no xy-agent → xy-development's ../xy-agent link dangles
  10 repos track retired `xy claude` output (xylabs-* skills, rules, slash commands)
  sdk-js publishes a stale `xylabs` Claude marketplace
  workspace root: CLAUDE.md suppresses AGENTS.md; .claude/skills never loads in repos

XYOracleNetwork/xyo-skills (downstream domain pack)
  "Layer 3" xyo-knowledge → xl1-* (4–9); imports @ariestools/sdk, never links ariestools-sdk
  xy-development / xy-toolchain = redirect stubs v1.1.38 (installable, not internal)
  README: ariestools `--all`, then xyo-skills `--all` → stubs replace canonical copies
```

**Proposed**

```
ariestools/ariestools-skills
  L3  ariestools-sdk · ariestools-sdk-react (new) · ariestools-actor (new)
  L2  xy-toolchain   sole owner of `xy work`, `xy agent`, "how skills reach a repo"
  L1  xy-development
  ⟂   xy-agent       cross-cutting docs conventions; builds on L1, links L2 for commands
      skill text names skills, not layer numbers; DoD Layer 1 → xy-toolchain gates
  validate-skills.mjs: links, anchors, public-anchor allowlist, description ≤ 1024
      │
      ├──▶ claude / codex plugins (metadata lists every skill)
      └──▶ Skills.sh (explicit --skill selectors)
               │
               ▼
@ariestools/toolchain `xy skills` / `xy check`
  catalog = every ariestools-skills skill; xy-agent optional in every tier
  kit packages declare `xy.skills` (or detection sets) → lint --fix installs L3 siblings
  lint flags redirect stubs, 1.x copies and retired xylabs-* / .claude/{rules,commands}
  pick merges into xy.config.ts; agent lint gated on AGENTS.md, rules match the skill
  every scaffold passes its own `xy check`
               │
               ▼
consuming repos — every Related-skills link resolves or names its install command

XYOracleNetwork/xyo-skills
  L4+ xyo-knowledge → xl1-*  (requires L1–L3 incl. ariestools-sdk; absolute links)
  installs with explicit --skill; stubs marked internal, then retired
```

## Layering inside the pack

- 🟠 **`xy-agent` has no declared layer, and the pack's docs and marketplace metadata still describe three skills**
  - **Now:** README.md:7 "Three skill layers:", with a table at :9-13 that has no `xy-agent`. README.md:19 "**`xy-development` and `xy-toolchain` are owned only here.**" CLAUDE.md:27-35 has a three-row layer block and "the **only** editable source for those three skills". AGENTS.md:5 owns three skills. DEVELOPMENT.md:51 (ownership) and :57-68 (layout tree) omit it. scripts/marketplace-sync/metadata.json:5,7 (description, longDescription), :8-16 (keywords) and :36-41 (defaultPrompts) never mention it. skills/xy-agent/SKILL.md:18 "builds on the Development Skill … recommended, not required".
  - **Actual:** Four skills ship. `xy-agent` landed in 2d8f995 (2026-09-01), was released in 0.1.5, is listed in release-please-config.json:19 and is asserted by validate-plugins.yml:57. It builds on `xy-development`, and it uses L2 commands: `xy work` (SKILL.md:45) and, since 10.1.1, the stable `xy agent`, which `xy check` runs at error level. Both plugin renderers copy the whole skills/ tree (build-claude.mjs:7-8, build-codex.mjs:10), so it does ship. Only the listing text omits it, and agents trigger from the SKILL.md description, so discovery is barely affected.
  - **Fix:**
    - README: rename the heading to "Skill layers" and add a side-layer row: `— | xy-agent | AGENTS.md entry point, per-tool adapters, docs/ and papers/ lifecycle, documentation audits; builds on Layer 1; checked by xy agent lint (run by xy check, toolchain ≥ 10.1.1)`. Add one sentence: "Higher layers link down; xy-agent links to Layers 1 and 2."
    - README.md:19, CLAUDE.md:27-35 ("four skills"), AGENTS.md:5, DEVELOPMENT.md:51 and :57-68: name all four skills.
    - metadata.json: add "and repository documentation conventions for agents (AGENTS.md, docs/papers lifecycle, `xy agent` lint)" to description and shortDescription, add "(xy-agent)" to longDescription, add the keywords `agents-md` and `documentation`, and add a defaultPrompt such as "Fix `xy agent lint` findings in this repo's AGENTS.md and docs/".
    - xy-agent/SKILL.md:18: say it builds on xy-development and that the `xy agent` and `xy work` commands it relies on are documented in xy-toolchain. Keep the "not defective" stance only if `xy check` stops failing repos that have no AGENTS.md (see the agent-lint gate item).
    - *Contradiction resolved.* The auditors placed `xy-agent` as an "optional Layer-1 companion" (arch-layering#2), a "Layer-2 sibling" (arch-coverage#8) and "above Layer 2" (skills/xy-agent/SKILL.md#8). From the source: its conventions build only on xy-development (SKILL.md:18), but its tooling lives in L2 (SKILL.md:45; `'agent': 'stable'` at stability.ts:47). A side layer that builds on L1 and links to L2 for commands keeps L1 free of upward dependencies. Do not label it "optional", because `xy check` enforces it (checkCommand.ts:49-50).
  - **Evidence:** README.md:7-19; CLAUDE.md:27-35; AGENTS.md:5; DEVELOPMENT.md:49-68; scripts/marketplace-sync/metadata.json:5-41; release-please-config.json:19; .github/workflows/validate-plugins.yml:57-60; skills/xy-agent/SKILL.md:18,42-45; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:47; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:49-50.
  - <sub>ids: skills/xy-agent/SKILL.md#8, arch-layering#2, arch-distribution#10, arch-distribution#11, arch-distribution#15, arch-coverage#8</sub>

- 🟠 **"Layer N" means two things in xy-development, and the Definition of Done never maps to the xy-toolchain gates**
  - **Now:** skills/xy-development/workflow.md:114-118 defines the completion gate as "Layer 1 — Generic DoD", "Layer 2 — Domain DoD" and "Layer 3 — Project-specific acceptance criteria". skills/xy-development/SKILL.md:25 and skills/xy-development/testing.md:3 say tooling is "defined in the XY Toolchain skill (Layer 2)". skills/xy-toolchain/testing.md:197 links "`[Layer 1](../xy-development/testing.md)`". The DoD gates are "`pnpm build` or equivalent", "`pnpm lint` … zero warnings" and "`pnpm test` or equivalent" (workflow.md:68,73,81).
  - **Actual:** README.md:9-13 and CLAUDE.md:29-33 number the *skill stack* 1-3. Downstream xyo-skills depends on the *DoD* meaning: xl1-patterns/dapp-checklist.md:5-11, xl1-scaffold/SKILL.md:243-246 and xl1-build/SKILL.md:152-160. It also depends on the anchors `#definition-of-done`, `#applying-the-definition-of-done` and `#writing-project-specific-acceptance-criteria` (workflow.md:63,112,124). In XY repos the real gates are `pnpm xy build`, `pnpm xy test` and `pnpm xy check`. cli-kit and browser-kit have no root build or lint script, and `xy` exits 0 on warnings unless `--strict` is passed (xy-toolchain/commands.md:29).
  - **Fix:** Keep the DoD names, headings and anchors. In skill text, stop numbering skills: SKILL.md:25 and testing.md:3 become "defined in the xy-toolchain skill", and the link text at xy-toolchain/testing.md:197 becomes "xy-development testing principles". README and CLAUDE.md can keep 1-3 if each number is labelled "skill layer". Do not switch to "Tier", which already names ESLint rule tiers and the xy/xyo/xl1 skills-lint tiers. Under "Applying the Definition of Done", add: "In @ariestools/toolchain repos, Layer 1's build, lint and test gates are `pnpm xy build --strict`, `pnpm xy test` and `pnpm xy check` (`--strict` makes warnings fail); see `[lifecycle gates](../xy-toolchain/commands.md#lifecycle-gates)`."
  - **Evidence:** `grep -n 'Layer [0-9]'` across skills/, README.md, CLAUDE.md; skills/xy-development/workflow.md:63-82,112-124; skills/xy-toolchain/commands.md:29-42; XYOracleNetwork/xyo-skills/skills/xl1-build/SKILL.md:152-160, xl1-scaffold/SKILL.md:243-246, xl1-patterns/dapp-checklist.md:5-11.
  - <sub>ids: skills/xy-development/workflow.md#7, cov-dev-conventions#23, arch-coverage#10</sub>

- 🟠 **`xy work` rules live in three places that disagree on whether agents may claim items**
  - **Now:** skills/xy-toolchain/commands.md:185-186 shows `pnpm xy work next --claim` and `pnpm xy work claim <id>` with no caveat, and the file never says "experimental" or "xyex". skills/xy-agent/auditing.md:109 says ".xy/work/ is a durable backlog … Queue work there; do not claim work there." auditing.md:102-103 says to pass an explicit stable id and to suppress the GitHub dual-write per item. ariestools/toolchain/.agents/skills/xy-work/SKILL.md:22,146-149 says to claim before implementing.
  - **Actual:** `claimItem` (actions/work/helpers.ts:56-69) is a plain overwrite with no lock, lease or compare-and-swap, so xy-agent's warning is right for concurrent worktrees. `xy work add` has no `--id` and no per-item GitHub opt-out. Only the programmatic API takes `id` (work/index.ts:104,171), and dual-write is controlled only by `stores.github.enabled`, which defaults to true. `work` is experimental: stability.ts:69 and the help text "(experimental — prefer xyex)". 10.1.1 did not touch actions/work.
  - **Fix:** Make commands.md#skills-and-work-tracking the single owner of `xy work` usage. Mark it experimental (`xyex work`) and add: "Claiming is not atomic. Use claim only in single-agent, single-worktree flows; across worktrees, queue instead." Move xy-agent's rules for machine-generated items there, rewritten to what the CLI supports: `stores.github.enabled: false`, or the programmatic API for stable ids. Then replace auditing.md:100-109 with a link plus the documentation-specific batching advice. Retiring the toolchain-local copy is a separate item.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/helpers.ts:56-69, work/index.ts:104,171; `node packages/toolchain/dist/bin/xy.mjs work add --help` (no `--id`, no GitHub opt-out); `xy.mjs --stability --json` (work: experimental).
  - <sub>ids: arch-coverage#6</sub>

- ⚪ **`ariestools-sdk` repeats xy-toolchain's monolith docs, and the sdk-js docs it points to are stale**
  - **Now:** skills/ariestools-sdk/conventions.md:33-46 holds a maintainer command block ("`pnpm sync-sdk-layout   # after editing sdkModules / monolith layout`"), the line "Do not hand-edit generated monolith shims…", and "See the package README 'Monolithic layout' section."
  - **Actual:** The generic mechanics are already in skills/xy-toolchain/compilation.md:95-110 (`#monolith-mode`). `sdkModules` does not exist. Modules are listed in `compile.monolith.modules` in packages/sdk/xy.config.ts, `pnpm sync-sdk-layout` (root package.json:34) runs `package-sync-layout`, and the README's `scripts/sync-sdk-layout.mjs` does not exist. The block is in scope by design: sdk-js installs this skill, and SKILL.md:36 routes "how this monorepo relates to the `xy` toolchain" here. sdk-js's own AGENTS.md and CLAUDE.md never mention the monolith workflow, so for now this block is the only agent-facing description of it. Those files are also stale. sdk-js/CLAUDE.md:7,36,57,61,67,70 and AGENTS.md:3,26,33,65,68 mention tsup, `@ariestools/mongo`, `indexed-db`, `vitest-extended`/`-matchers`, "~53 TypeScript packages (`@xylabs/*`)" and a single dist/neutral exports map. packages/sdk/README.md:198 says Node 18.17.1+, and :221-224 describes `sdkModules`. packages/crypto-auth/README.md:14 says Node >= 18, but engines are >=26 and crypto-auth uses native `Uint8Array` base64.
  - **Fix:** Trim the block rather than move it yet. Replace the generic monolith text and the shim line with `[xy-toolchain compilation](../xy-toolchain/compilation.md#monolith-mode)`. Keep the sdk-js facts, corrected: "Modules are declared in `compile.monolith.modules` in `packages/sdk/xy.config.ts`; `pnpm sync-sdk-layout` (check: `pnpm --filter @ariestools/sdk sync-sdk-layout:check`) runs package-sync-layout." Drop the README pointer until that README is fixed. Open a separate sdk-js docs PR that:
    - lists the 12 published packages: the umbrella plus crypto (npm-deprecated), crypto-auth, eth-address, express, json-rpc-engine, sdk-meta, pixel, storage-adapters (indexed-db and mongo subpaths), telemetry, testing (matchers and extended subpaths) and threads, with threads-test private;
    - states Node >= 26, the native compiler, monolith mode and the per-package dist/neutral|node|browser outputs;
    - fixes README.md:198 and :221-224 and crypto-auth/README.md:14;
    - points sdk-js CLAUDE.md to the ariestools-sdk skill.

    Reduce the skill block to a one-line pointer only after sdk-js's AGENTS.md documents the workflow, and update SKILL.md:36 at the same time.
  - **Evidence:** skills/ariestools-sdk/conventions.md:33-46, SKILL.md:36; skills/xy-toolchain/compilation.md:9,95-110; ariestools/sdk-js/packages/sdk/xy.config.ts:8-13, package.json:34, packages/sdk/package.json:381-382; ariestools/sdk-js/CLAUDE.md, AGENTS.md, packages/sdk/README.md:198,221-224, packages/crypto-auth/README.md:14, packages/crypto-auth/src/base64.ts:8,13.
  - <sub>ids: skills/ariestools-sdk/conventions.md#14, cov-sdk-specialist#19</sub>

## Cross-repo distribution

- 🔴 **The xyo-skills install commands replace the canonical `xy-development` and `xy-toolchain` with redirect stubs**
  - **Now:** XYOracleNetwork/xyo-skills/README.md:145 `npx skills add ariestools/ariestools-skills --all`, then :147 `npx skills add XYOracleNetwork/xyo-skills --all`. The same pair appears with `-g` at :157-158, there is `--all --copy` at :166, and `npx skills update` at :174. README:23 calls ariestools-skills the "Required companion".
  - **Actual:** xyo-skills still ships *installable* skills named `xy-development` and `xy-toolchain`. They are redirect stubs at v1.1.38 with `metadata.status: redirect` and no `metadata.internal`, and each holds only SKILL.md plus workflow.md or testing.md. Skills.sh keys both the install directory and the lock entry by `name` (checked in 1.7.1, which toolchain 10.1.1 bundles, and in 1.5.12), and the last install wins. `installSkillForAgent` runs rm -rf on `.agents/skills/<name>`, or on each agent directory under `--copy`, and copies the stub in. That deletes the canonical-only files: typescript.md and git.md, commands.md, eslint.md and others.
    - `--all` only removes the prompt. Any whole-pack selection triggers the overwrite: `-y` with no `--skill`, or agent mode, which forces `-y`.
    - `-g` and `--copy` behave the same way.
    - The project lock is rewritten to `XYOracleNetwork/xyo-skills`, so `npx skills update` keeps reinstalling the stub.
    - In toolchain repos, `xy skills lint` (part of `xy check`) then fails `skills.migrated-source` (error, fixable). Global installs are never checked, because the toolchain reads only ./skills-lock.json, .claude/skills and .agents/skills.
    - `xy skills defaults` avoids the collision by naming the 7 XYO skills explicitly.
    - The xyo-skills marketplace build also copies all of skills/ (build-claude.mjs:7-8), so installing both plugins gives two skills with each base name.
    - No local repo holds a stub today: none of the 53 skills-lock.json files does.
  - **Fix:** In xyo-skills:
    1. At README:147, :158 and :166, replace `--all` with the list `xy skills defaults` uses: `--skill xyo-knowledge --skill xl1-knowledge --skill xl1-patterns --skill xl1-testing --skill xl1-dapp-kit --skill xl1-scaffold --skill xl1-build`. Also say "install ariestools-skills last".
    2. Add `internal: true` under the stubs' `metadata`. Skills.sh 1.5.26 and later then skip them for `--all`, `--skill '*'`, `-y` and the picker. An explicit `--skill xy-development`, which `skills update` sends for old locks, still resolves.
    3. In both READMEs, say that `xy skills lint --fix` repairs a stub install and `npx skills update` does not.
    4. After one migration release, rewrite the xl1-* links to absolute ariestools-skills URLs. Every anchor they use exists in canonical workflow.md:63,112,124. Then delete the stubs and remove them from REDIRECT_STUBS in xyo-skills/scripts/validate-skills.mjs:70-73.
    - *Resolved:* the 10.1.1 gap finding refines the round-1 cause. Install-by-name with the last install winning is the mechanism. `--all` only removes the prompt.
  - **Evidence:** XYOracleNetwork/xyo-skills/README.md:145-174, skills/xy-development/SKILL.md:1-12; skills 1.7.1 cli.mjs:5106-5110 (`--all` sets skill and agent to `*` and yes), 5112-5118 (agent mode forces yes), 2228-2236 and 2310-2327 (clean, then copy), 1166-1170 and 5659-5676 (lock keyed by name), 7144-7157 and 7630-7646 (update re-adds from the lock source), 1275 and 5164 (`internal` filter); ariestools/toolchain/packages/toolchain/src/actions/skills/lock.ts:64-93, lint.ts:366-390, installed.ts:6, defaults.ts:67-74.
  - <sub>ids: arch-distribution#0, gap-gap-skills-cli-install#0</sub>

- 🔴 **Retired `xy claude` output is tracked in 10 repos and competes with `xy-toolchain`**
  - **Now:** ariestools/sdk-react tracks .agents/skills/xylabs-{xy-cli,e2e-setup,xy-deplint-fix}/SKILL.md. xylabs-xy-cli/SKILL.md:4 calls itself a "Comprehensive reference for the `xy` CLI provided by `@xylabs/ts-scripts-yarn3`", its description claims every build, lint and test question, and :105-112 list `xy upyarn`, `xy upplug` and `xy yarn3only`. The same output is tracked across nine XYOracleNetwork repos. No file in this pack mentions any of it.
  - **Actual:** Tracked files per repo (skill directories / rules / slash commands):
    - sdk-react 3/0/0, plugins 6/4/22, sdk-os-js 0/5/21, sdk-protocol-js 4/4/25, sdk-xyo-client-js 4/5/22;
    - sdk-xyo-react-js 4/0/0, sdk-xyoworld-js 4/5/21, wallet-xl1-chrome 3/4/25, xl1-protocol 3/4/22, xl1-server-render 0/4/0.
    - XYOracleNetwork/clients and sdk-react's .claude/ hold gitignored local copies.

    Each xylabs-xy-cli copy lists 14-17 retired commands, among them compile-only, lintlint, gitlint, deploy-*, gen-docs and `xy Codex init`. Bulk renames (sdk-xyo-client-js 37c6380cdd) made two copies say `@ariestools/toolchain` while still listing those commands. The rules files carry the header "Auto-managed by `pnpm xy claude-rules`. Do not edit manually." and say "compiles to ESM via tsup". They have no `paths:` front matter, so Claude loads them in every session. The slash commands run retired `xy gitlint`, `xy gen-docs`, `xy knip` and `xy dupdeps`, and the deprecated `xy relint`. 10 of the 11 repos also have the canonical skills, so agents get two conflicting CLI references. sdk-xyo-client-js ignores .agents (.gitignore:29) but tracks .claude/skills/{xy-development,xy-toolchain,ariestools-sdk,xyo-knowledge} as symlinks into it. In a fresh clone those links dangle and only the xylabs-* skills load. `xy claude` was removed in 57a587696 (first in v8.2.8, 2026-06-18) with no cleanup for consumers, and `xy check` never flags these files.
  - **Fix:** In each repo, `git rm -r` .agents/skills/xylabs-*, .claude/skills/xylabs-*, .claude/rules/xylabs-*.md and .claude/commands/xy-*.md. For the skill directories, `pnpm xy skills remove xylabs-e2e-setup xylabs-refactor-cohesion xylabs-xy-cli xylabs-xy-deplint-fix -y` also works. Fix sdk-xyo-client-js so the canonical skills resolve in a fresh clone: un-ignore .agents or track real directories. Before deleting xylabs-e2e-setup, re-point the xyo-skills route to it (see the e2e item under coverage gaps), and decide whether xylabs-refactor-cohesion is ported or dropped. Detection belongs in the toolchain (see the legacy-file rule item).
  - **Evidence:** `git ls-files -s -- .agents/skills .claude/skills .claude/rules .claude/commands` per repo; XYOracleNetwork/plugins/.agents/skills/xylabs-xy-cli/SKILL.md:4,23,62,80,96,112,146; XYOracleNetwork/sdk-xyo-client-js/.claude/rules/xylabs-architecture.md:3-6, .gitignore:29; `node packages/toolchain/dist/bin/xy.mjs yarn3only` → "Command not found"; ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:202-205; `git tag --contains 57a587696` → v8.2.8.
  - <sub>ids: arch-distribution#1, gap-gap-legacy-xylabs-artifacts#0</sub>

- 🔴 **`xy skills pick` (new in 10.1.1, stable) overwrites an existing `xy.config.ts`**
  - **Now:** ariestools/toolchain/packages/toolchain/src/actions/skills/pick.ts:76-87: when xy.config.ts exists, `const replaced = spliceObject(current, 'skills:', skillsBlock)`, then `fs.writeFileSync(filePath, replaced ?? body)`. docs/xy-config.md:97-99 points users to `pick`. No skill mentions `pick` yet (skills/xy-toolchain/commands.md:171).
  - **Actual:** `spliceObject` (:90-102) runs a case-sensitive `indexOf('skills:')`.
    - **No `skills:` key:** the function returns undefined, and the whole file is replaced with the 13-line skills-only `body`. Compile, deplint and every other setting is lost. `skillsLint:` and `additionalSkills:` do not match the search text. No xy.config.ts in toolchain (30 lines), sdk-js (22), sdk-react (21), actor-kit (8), browser-kit (17) or cli-kit (8) contains `skills:`.
    - **Existing `skills:` key:** the block is replaced with only this run's picks, all set to `required`, so earlier `allowed`/`off` entries are dropped.
    - **`skills:` in a comment:** the splice lands in the comment and produces invalid TypeScript.

    The only spec uses an empty directory (spec/skills/skillsPick.spec.ts:30-48). `skills` is stable, and the stability rubric requires "No known data-loss --fix" (stability.ts:184, docs/STABILITY.md:115). Verifiers reproduced all three cases by running the copied functions.
  - **Fix:** Never write `body` over an existing file. Merge structurally under `commands.skillsLint` (an AST or magicast-style edit), or refuse and print the snippet to paste. Merge new presence entries into existing ones, and allow `--presence allowed|off` per pick. Add specs for a config with no skills block and for one with prior `allowed`/`off` entries. Until this ships, xy-toolchain must not present `pick` as an install path and should tell agents to edit `commands.skillsLint.skills` by hand.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/pick.ts:58-102,110-131; ariestools/toolchain/packages/toolchain/spec/skills/skillsPick.spec.ts:30-48; commit b8653a52d; `grep -c 'skills:'` on each repo's xy.config.ts → 0; `xy.mjs --stability --json` → skills: stable; packages/toolchain/src/xy/stability.ts:184.
  - <sub>ids: gap-tc1011-skills-pick#1, gap-gap-skills-cli-install#5</sub>

- 🟠 **The toolchain's skill catalog does not know `xy-agent`, even though `xy check` now enforces its convention**
  - **Now:** ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:4 "Source of truth for xy-development, xy-toolchain, and ariestools-sdk.", and :13-17 lists `ARIESTOOLS_SKILLS` as those three. SKILL_ORDER (skillRules.ts:36-47) omits xy-agent, repo-init/skillsInstall.ts:34 hard-codes the same three, and so do the `xy skills defaults` help (xy/common/skills/index.ts:17), docs/STABILITY.md:72 and the README "Agent skills" table. In this pack, skills/xy-development/SKILL.md:33 and workflow.md:47 link `../xy-agent/SKILL.md`.
  - **Actual:** `XYO_SKILL_NAMES` is derived from that list (skillRules.ts:32), so several paths reject `xy-agent`:
    - `commands.skillsLint.additionalSkills` throws a TypeError (skillRules.ts:98-102).
    - The new 10.1.1 `commands.skillsLint.skills` presence map throws (skillRules.ts:120-121), so `xy skills lint` and therefore `xy check` exit 1.
    - `xy skills pick --skill xy-agent` exits 1 (pick.ts:113-116).
    - It is never version-checked and never flagged as unnecessary (lint.ts:217-226; skillRules.ts:202-205).

    `xy skills defaults` does install it (`--all` or `--skill '*'` from ariestools-skills, defaults.ts:67-74), but unmanaged. `xy skills lint --fix` installs it only through a package.json `xy.skills` entry with an explicit `source` (packageSkills.ts:134-150), and no package declares one. None of the 53 workspace skills-lock.json files lists it, so in the six @ariestools repos the installed xy-development link to `../xy-agent` dangles. Meanwhile 10.1.1 (8f2768dfd) made `xy agent` stable and runs it in `xy check`. It implements "the repository documentation convention described by the xy-agent skill" (work item XYW-20260901-263436).
  - **Fix:** In ariestools/toolchain actions/skills:
    - Add `'xy-agent'` to ARIESTOOLS_SKILLS and SKILL_ORDER. Update the defaults.ts:3-5 comment, the defaults help (index.ts:17), the lint help source list (:61-63), STABILITY.md:72, the README "Agent skills" table and docs/xy-config.md. Derive repo-init/skillsInstall.ts:34 from ARIESTOOLS_SKILLS.
    - In the same change, give it a requirement level. Catalog membership alone turns every existing `skills defaults` install into a `skills.unnecessary` warning, because `optionalSkillsForTier` is xl1-only (skillRules.ts:171-172). The minimum is optional in every non-`none` tier, as the work item specifies. Requiring it at the xy tier (XY_SKILLS) adds a new error to stable `xy skills lint` and `xy check` in every repo. Treat that as a deliberate rollout tied to the agent-lint gate item, and if it happens, change "recommended, not required" in xy-development/SKILL.md:33 and xy-agent/SKILL.md:18 in lockstep.
    - Replace the `skillSourceForName` fall-through (defaults.ts:84-86) with an explicit map that throws for unknown names.
    - After the release, update skills/xy-toolchain/commands.md (Skills and work tracking): `xy skills defaults` installs all four ariestools skills. Until then, note that xy-agent is installed unmanaged and can be added with `pnpm xy skills add ariestools/ariestools-skills --skill xy-agent -y`.
    - *Contradictions resolved.* Round-1 findings said the catalog "misroutes xy-agent to xyo-skills" and "never installs" it. At 10.1.1, every caller of `skillSourceForName` is gated on catalog names (lint.ts:95, versions.ts:9, pick.ts:44,122, packageSkills.ts:116), so the misroute is latent, and `skills defaults` does install it. The real gate is catalog validation. On tier status, gap-tc1011-skills-pick#2 proposed requiring it, while the others and the toolchain's own work item said optional. Optional is kept as the minimum, and requiring it is left as an explicit rollout decision.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/: defaults.ts:3-17,67-74,84-86; skillRules.ts:32,36-47,65,98-102,120-121,171-172,202-205; lint.ts:95,217-226; pick.ts:34,113-116; packageSkills.ts:115-150; ../repo-init/skillsInstall.ts:34. ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:49-50; ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts (agents.file-present, error). Scratch probes: a presence entry for xy-agent → `skills lint` exit 1; `skills pick --skill xy-agent` → exit 1.
  - <sub>ids: skills/xy-toolchain/commands.md#12, skills/xy-agent/SKILL.md#7, cov-toolchain-history#30, cov-agent-docs#16, arch-layering#3, arch-distribution#3, arch-coverage#3, gap-tc1011-skills-pick#2, gap-gap-skills-cli-install#2</sub>

- 🟠 **The skill freshness check compares against a version line that restarted at 0.1.x, so 1.1.x copies and stubs pass as current**
  - **Now:** `isSkillVersionOutdated` in ariestools/toolchain/packages/toolchain/src/actions/skills/versions.ts:59-69 is `semver.lt(installed, latest)`, with `latest` fetched from ariestools-skills main (0.1.5). The only migration guard reads the lock (lock.ts:75-92). skills/xy-development/SKILL.md:14 uses the example "`xy-development v1.1.19`".
  - **Actual:** `isSkillVersionOutdated('1.1.30','0.1.5')` and `('1.1.38','0.1.5')` both return false, so `checkRequiredSkills` lists those copies as current with a ✔ (lint.ts:145-178,421-428). Only `skills.migrated-source` catches them, and only when a lock entry names xyo-skills. 10 of the 11 legacy 1.x installs in the workspace have such an entry. XYOracleNetwork/xyo-robot-provenance-demo (1.1.21, no lock) gets through. 10.1.1 did not change this code.
  - **Fix:** In `xy skills lint`, treat an installed SKILL.md as unmigrated when its frontmatter has `metadata.status: redirect` or `canonical:`, or when a migrated skill's major version is above the canonical major. Make it an error whose fix reinstalls from ARIESTOOLS_SKILLS_SOURCE, whether or not a lock entry exists. Optionally set release-please `release-as: 2.0.0` here so canonical versions sort above every 1.1.x copy. Change the SKILL.md:14 example to a 0.x version.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/versions.ts:8-10,59-69, lock.ts:75-92, lint.ts:145-178,368-390; XYOracleNetwork/xyo-skills/skills/xy-development/SKILL.md:9 (1.1.38); `git show b67cd91^:skills/xy-development/SKILL.md` (1.1.30); skills/*/SKILL.md:5 (0.1.5).
  - <sub>ids: skills/xy-development/SKILL.md#7, arch-distribution#4</sub>

- 🟠 **Skill freshness ignores which toolchain version the repo runs**
  - **Now:** ariestools/toolchain/packages/toolchain/src/actions/skills/versions.ts:8-10 fetches `raw.githubusercontent.com/<source>/main/skills/<name>/SKILL.md`. lint.ts:93-96 installs with no ref. `skills.required-current` is error-level and fixable (lint.ts:343-364). skills-lock.json entries record only source, skillPath and computedHash. docs/STABILITY.md:72: "Skill content is versioned on that repo's cadence, not npm lockstep."
  - **Actual:** Nothing reads the installed toolchain version or a skill compatibility range. Once xy-toolchain documents 10.1.x surfaces, every 9.x and 10.0.x repo fails `xy check` until it installs that skill, and on 9.2.0 or later `--fix` installs it from main with no pin. On 9.0.x and 9.1.x, `--fix` cannot update skills at all: that fix arrived in d37b662eb (v9.2.0), and the old path `xy skills updo` was removed. Survey: xy-toolchain 0.1.3 is installed in 7 repos on 9.0.x and 3 on 10.0.x. The 10.1.1 presence map lets a repo opt out of a skill. It does not pin a version.
  - **Fix:** Add `metadata.toolchain: ">=X"` (and `metadata.verified-toolchain`) to skill frontmatter. Have versions.ts parse it, and when the installed @ariestools/toolchain is below the minimum, report info or a warning ("the latest xy-toolchain skill documents toolchain ≥X; upgrade the toolchain or rely on its since-notes") instead of only demanding the update. Print the installed toolchain version in `xy skills lint` output. Until this exists, the skill must carry since-notes.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/versions.ts:8-10,59-69, lint.ts:93-96,147-177,343-364; `git show v9.0.4:…/lint.ts` (required-current is an error with no fix); XYOracleNetwork/xyo-cash/skills-lock.json.
  - <sub>ids: gap-gap-toolchain-version-scope#4</sub>

- 🟠 **The toolchain changelog stops at 9.2.0, so nothing upstream backs skill "since" notes**
  - **Now:** ariestools/toolchain/CHANGELOG.md:9 is `## [Unreleased]`, and :34 `## [9.2.0] - 2026-09-01` is the only versioned section. :73 compares v9.2.0...HEAD. The latest GitHub release is v9.2.0.
  - **Actual:** npm has 13 releases after 9.2.0: 9.2.1, 10.0.0-10.0.9, 10.1.0 and 10.1.1 (2026-09-03 to 2026-10-08). The auditor's count of 23 was corrected by the verifier. None of these changes is recorded:
    - the 10.0.0 alias removals (gitlint, lintlint, node-lint, republint; 13350616a `feat(toolchain)!:`, 78f3807d6);
    - the 9.2.0 removal of `xy skills updo`;
    - 10.1.1's agent lint in `xy check`, `xy skills pick` and `commands.skillsLint.skills`.

    docs/STABILITY.md:68 says aliases may be removed "after they appear in the changelog". These never appeared there.
  - **Fix:** Split [Unreleased] into the 13 versions, each with Added, Changed and Removed. Under 9.2.0, record that `xy skills updo` was removed and that `lint --fix` now updates outdated skills. Give 10.0.0 a BREAKING/Removed entry for the aliases and their replacements. Record each new error-level gate under its patch: `dep.*.not-public` (10.0.3), `repo.package-readme(-files)` (10.0.5), `pub.importsMatchExports` (10.0.9), and in 10.1.1 agent lint in check, `xy skills pick`, `commands.skillsLint.skills` and `commands.updo.ignoreDeps`. Publish GitHub releases for 9.2.1 and later.
  - **Evidence:** `grep -n '^## ' ariestools/toolchain/CHANGELOG.md`; `npm view @ariestools/toolchain time`; `gh release list -R ariestools/toolchain`; ariestools/toolchain/docs/STABILITY.md:68.
  - <sub>ids: gap-gap-toolchain-version-scope#5</sub>

- 🟠 **How skills reach a repo is undocumented in xy-toolchain and overstated in the toolchain YELLOW-PAPER**
  - **Now:** skills/xy-toolchain/commands.md:163 has the `xy skills lint` row, and :171 says "Use `xy skills lint --fix` to install missing profile-required skills". Neither mentions tier detection, `additionalSkills`, `commands.skillsLint.skills`, `xy skills pick` or package.json `xy.skills`. ariestools/toolchain/papers/YELLOW-PAPER.md:440 says "`xy skills lint --fix` is the supported install/update path."
  - **Actual:** A skill can reach a repo in four ways:
    1. tier detection (xy, xyo, xl1) plus the hard-coded sdk-js package set (detectProfile.ts:26-40);
    2. `commands.skillsLint.additionalSkills`;
    3. the 10.1.1 per-skill presence setting `commands.skillsLint.skills.<name>.presence` (required, allowed or off), written by `xy skills pick`, which needs `--skill` when there is no TTY;
    4. package.json `xy.skills`, available since 10.0.8 (881eede39). A `source` is needed only for skills outside the catalog, and recommended skills are exempt from `skills.unnecessary` (lint.ts:476-497).

    None of the 401 package.json files in the workspace has an `xy` field. `--fix` works in project scope, one skill at a time, and only for required skills (tier, additionalSkills, presence `required`), package-declared skills and skills still locked to xyo-skills. It updates only skills that are required and outdated (lint.ts:93-97,145-178,295-390). `xy skills defaults` is the only command that installs a whole pack.
  - **Fix:** Add a "How skills reach a repo" subsection under commands.md#skills-and-work-tracking that covers ways 1-4, using the examples in toolchain docs/xy-config.md under "Skills lint". Keep the :171 sentence, which is accurate, and add `xy skills defaults` and `xy skills add <source> --skill <name>`. Document `commands.skillsLint.skills` as a hand edit, and do not present `pick` as an install path until the overwrite item is fixed. Recommend `xy.skills` for producer packages the toolchain cannot detect (sdk-react, actor-kit, cli-kit, browser-kit), with `source: 'ariestools/ariestools-skills'` until their skill joins the catalog. sdk-js needs no declaration. Reword YELLOW-PAPER.md:440 to: "`xy skills defaults` installs the default stacks. `xy skills lint --fix` keeps required (profile, additionalSkills, presence: required) and package-declared skills present and current in project scope. Install other skills with `xy skills add <source> --skill <name>`."
    - *Resolved:* arch-coverage#4 proposed documenting `pick` now. The 10.1.1 gap findings show it destroys configs, so `pick` is deferred.
  - **Evidence:** skills/xy-toolchain/commands.md:163-171; ariestools/toolchain/docs/xy-config.md:97-106; ariestools/toolchain/packages/toolchain/src/actions/skills/packageSkills.ts:295-305, lint.ts:93-97,145-178,295-390,476-497, detectProfile.ts:26-40, defaults.ts:67-74; ariestools/toolchain/papers/YELLOW-PAPER.md:440; `git tag --contains 881eede39` → v10.0.8 onward.
  - <sub>ids: arch-coverage#4, gap-gap-skills-cli-install#3</sub>

- 🟠 **Neither `xy skills lint` nor `xy check` detects retired toolchain-generated agent files**
  - **Now:** `xy skills lint --rules` (10.1.1) lists six rules: duplicate-install, migrated-source, package-recommended, required-current, required-installed and unnecessary. `unnecessary` is not fixable.
  - **Actual:** installed.ts:6,59-74 reads the xylabs-* directories, then skillRules.ts:202-205 and lint.ts:217-226 drop every name outside the catalog. This is by design, so that repo-local skills are not flagged. The fixable rules only install (lint.ts:296-390). Nothing reads .claude/rules or .claude/commands, and the `xy agent` walker skips .claude entirely (agent/walk.ts:6-11). The only remover, `xy claude clean`, was deleted in 57a587696 (v8.2.8) with no consumer migration. docs/migrate-xylabs.md:15-24 lists package steps only.
  - **Fix:** Add a fixable rule, for example `skills.legacy-generated`, warn by default and wired into `xy check`. It should match only the exact historical template names plus the "Auto-managed by `pnpm xy claude-rules`" header:
    - skills: xylabs-{e2e-setup,xy-cli,xy-deplint-fix,refactor-cohesion};
    - rules: xylabs-{architecture,build,dependencies,error-handling,frameworks,git-workflow,linting,naming,style,typescript}.md;
    - commands: the xy-*.md set.

    `--fix` deletes them, reusing Skills.sh `remove` for the skill directories. Exact-name matching keeps repo-local skills unflagged. Note the gap in migrate-xylabs.md.
  - **Evidence:** `node packages/toolchain/dist/bin/xy.mjs skills lint --rules`; ariestools/toolchain/packages/toolchain/src/actions/skills/installed.ts:6,59-74, skillRules.ts:202-205, lint.ts:217-226,296-401; packages/toolchain/src/actions/agent/walk.ts:6-11; `git show 57a587696^:packages/toolchain/src/actions/claude-clean.ts`; `git log --all --diff-filter=A --name-only -- '*templates/claude/*'` (the full generated set).
  - <sub>ids: gap-gap-legacy-xylabs-artifacts#1</sub>

- 🟠 **ariestools/sdk-js still publishes a `xylabs` Claude marketplace that says to use the deprecated `@xylabs/sdk-js`**
  - **Now:** ariestools/sdk-js tracks .claude-plugin/marketplace.json (marketplace `xylabs`, plugin `xylabs-sdk`, repository github.com/xylabs/sdk-js) and .claude-plugin/xylabs-sdk/skills/xylabs-sdk/SKILL.md, whose lines 12-20 say "**Always start with `@xylabs/sdk-js`**" and "Install: `npm install @xylabs/sdk-js`".
  - **Actual:** `npm view @xylabs/sdk-js deprecated` returns "Use @ariestools/sdk instead … compatibility shim only". sdk-js's own skills-lock.json installs ariestools-sdk. The marketplace was last touched in c81668cbe (2026-05-28), and it is the only divergent .claude-plugin among local clones of the three orgs. It loads only when someone adds the marketplace.
  - **Fix:** Delete sdk-js/.claude-plugin/ in an sdk-js PR. If an SDK marketplace entry is still wanted, point it at the ariestools-sdk skill through ariestools-claude-plugin.
  - **Evidence:** `git -C ariestools/sdk-js ls-files .claude-plugin`; `npm view @xylabs/sdk-js deprecated`; ariestools/sdk-js/skills-lock.json.
  - <sub>ids: gap-gap-legacy-xylabs-artifacts#8</sub>

- 🟠 **xyo-skills numbers its own layers from 3 and never links `ariestools-sdk`, though it imports `@ariestools/sdk`**
  - **Now:** README.md:9-13 here defines Layer 3 as ariestools-sdk, and README.md:17 says the xyo-skills skills "depend on this toolchain layer." XYOracleNetwork/xyo-skills/README.md:9-19 and CLAUDE.md:42-50 number xyo-knowledge as Layer 3 and xl1-* as 4-9, with only xy-toolchain (2) and xy-development (1) beneath. xyo-knowledge/SKILL.md:14 says it builds on `[Development Skill](../xy-development/SKILL.md)` and `[XY Toolchain Skill](../xy-toolchain/SKILL.md)`. No xyo-skills file mentions ariestools-sdk.
  - **Actual:** Twelve lines outside the stubs import zod factories, `assertEx` or `BrandedHash` from @ariestools/sdk, for example xyo-knowledge/primitives.md:36,64-65, identity.md:141, xl1-knowledge/development.md:52, xl1-patterns/commit-reveal.md:39 and xl1-testing/local-chain-vitest.md:243. The toolchain requires ariestools-sdk only when it detects sdk-js packages (skillRules.ts:149-163). The relative `../xy-*` links resolve inside xyo-skills only because the redirect stubs exist. There is no ariestools-sdk stub, and there should not be one.
  - **Fix:** Publish one cross-pack waterfall in README.md: L1 xy-development (plus the xy-agent side layer) → L2 xy-toolchain → L3 ariestools-sdk and its sibling @ariestools library skills → domain packs (xyo-knowledge → xl1-*). Change README:17 to "depend on Layers 1–3". In xyo-skills:
    - renumber from 4 or switch to named layers;
    - list ariestools-sdk as a required companion;
    - link it by absolute URL, `[ariestools-sdk](https://github.com/ariestools/ariestools-skills/tree/main/skills/ariestools-sdk)`, in xyo-knowledge/SKILL.md:14 and in the Related skills of xl1-knowledge/SKILL.md:19-20, xl1-patterns/SKILL.md:23-24 and xl1-testing/SKILL.md:35-36;
    - add an ariestools-sdk row to its README companion table and its marketplace metadata description.
    - *Resolved:* arch-distribution#17 first proposed a relative `../ariestools-sdk/SKILL.md`. Both verifiers showed it would dangle in xyo-skills and its plugins, so the absolute URL is kept.
  - **Evidence:** README.md:9-17; XYOracleNetwork/xyo-skills/README.md:9-19, CLAUDE.md:42-50, skills/xyo-knowledge/SKILL.md:14, primitives.md:36,64-65; `grep -rn '@ariestools/sdk' XYOracleNetwork/xyo-skills/skills`; ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:149-163.
  - <sub>ids: arch-layering#4, arch-distribution#17</sub>

- 🟠 **Workspace guidance presents `xylabs-xy-cli` as a valid reference and forbids touching legacy rules**
  - **Now:** The workspace-root CLAUDE.md:36 says "older repos may carry the legacy `xylabs-xy-cli` skill instead". :50 says "Current toolchains (8.7+) have no `xy claude-rules` command … treat them as legacy and do not hand-edit them". The workspace-root AGENTS.md:244 says "The `xy-toolchain` / `xylabs-xy-cli` skills (when loaded inside these repos) are the full reference for the `xy` CLI", and :246 and :258 repeat the read-only wording.
  - **Actual:** Every repo that has xylabs-xy-cli also has xy-toolchain (8 of 8), and xylabs-xy-cli lists about 17 retired commands. `xy claude` was removed in v8.2.8 (2026-06-18), not 8.7. With no command left to regenerate the files, "do not hand-edit" plus no removal path keeps them forever, and bulk renames have edited them anyway. `xy check` does not flag them. The guidance also ignores the other xylabs-* skills and .claude/commands/xy-*.md.
  - **Fix:** Replace both passages with: "xy-toolchain is the only CLI reference. `xylabs-*` skills, `.claude/rules/xylabs-*.md` and `.claude/commands/xy-*.md` are retired output of `xy claude` (removed in 8.2.8). Do not follow them. Delete them with `pnpm xy skills remove … -y` and `git rm` when working in a repo; `xy check` does not detect them." Drop xylabs-xy-cli from AGENTS.md:244, and change "8.7+" to 8.2.8.
    - *Resolved:* arch-coverage#14 wanted :244 kept as a legacy note while the files exist. The replacement still names them, labels them retired and gives the removal path, which satisfies both findings.
  - **Evidence:** workspace-root CLAUDE.md:36,50 and AGENTS.md:244,246,258; `git -C ariestools/toolchain tag --contains 57a587696 | sort -V | head -1` → v8.2.8; the per-repo sweep in the legacy-output item.
  - <sub>ids: gap-gap-legacy-xylabs-artifacts#6</sub>

- 🟠 **The workspace-root `CLAUDE.md` stops Claude Code from loading AGENTS.md in 17 repos**
  - **Now:** The workspace-root CLAUDE.md:17 is a prose pointer: "Most repos under these orgs have their own `CLAUDE.md` / `AGENTS.md` — read it first". These 17 repos have AGENTS.md but no CLAUDE.md or .claude/CLAUDE.md:
    - XYOracleNetwork/{autodrive-datalake-sample, chain-event-service, crypto-cards, dapp-kit, event-kit, immortalizer, sdk-os-js, sdk-xyo-react-js, sdk-xyoworld-js, service-kit, wallet-xl1-chrome, webble, xl1-client-recipes, xl1-protocol};
    - arietrouw/{6502-wasm, homelab-ces-adapter, homelab}.
  - **Actual:** Claude Code counts any CLAUDE.md above the working directory. When one exists, it reads only CLAUDE.md files, and with a prose pointer it sees AGENTS.md only if it decides to open the file (code.claude.com/docs/en/memory). The installed `claude` 2.1.187 also predates native AGENTS.md support. crypto-cards/AGENTS.md (446 lines) is the example the skill itself cites at agents-md.md:140.
  - **Fix:** Commit a one-line `CLAUDE.md` containing `@AGENTS.md` in each of the 17 repos, writing the file directly. Use `xy agent init` only in repos already on toolchain ≥ 10.1.1 (crypto-cards, dapp-kit), and only if its docs/ skeleton and generated docs/README.md are wanted. A secondary option is the user-level `instructionFiles: "claude-md-and-agents-md"` under `pluginConfigs`. It needs Claude Code ≥ 2.1.277, uses the key `agents-md@builtin` before 2.1.285, is ignored in project settings, and applies to this machine only. Add a note to the workspace CLAUDE.md and AGENTS.md that the root CLAUDE.md disables native AGENTS.md loading for every repo beneath it.
  - **Evidence:** survey of `*/*/` for AGENTS.md without CLAUDE.md, .claude/CLAUDE.md or CLAUDE.local.md; code.claude.com/docs/en/memory ("When Claude Code reads AGENTS.md", "Remove an earlier AGENTS.md workaround", "Choose which instruction files load"); ariestools/toolchain/packages/toolchain/src/actions/agent/init.ts:7,34,56-71.
  - <sub>ids: gap-gap-agent-tool-claims#3</sub>

- 🟠 **The workspace-root `.claude/skills` install never loads in sessions started inside a repository**
  - **Now:** The workspace .claude/skills symlinks xl1-build, xl1-knowledge, xl1-patterns, xl1-scaffold, xl1-testing, xy-development, xy-toolchain and xyo-knowledge into .agents/skills, pinned by skills-lock.json. ~/GitHub is not a git repository. The workspace-root AGENTS.md:258 and CLAUDE.md:50 describe only per-repo installs.
  - **Actual:** Claude Code loads project skills from the start directory up to the repository root. In a worktree it stops at the worktree root and, from v2.1.277, falls back to the main checkout. That the search never goes above the repository root is inferred from the documented "up to the repository root". So this install serves only sessions started in ~/GitHub itself. ~/.claude/skills holds only find-skills. 44 of 87 repos have no per-repo xy-development. The workspace install also lacks xy-agent and ariestools-sdk, and 6 of its 8 skills come from xyo-skills.
  - **Fix:** Install at user level from both sources, with explicit selectors so the xyo-skills stubs cannot overwrite the canonical skills, and install ariestools-skills last:
    - `npx skills add XYOracleNetwork/xyo-skills -g --skill xyo-knowledge --skill xl1-knowledge --skill xl1-patterns --skill xl1-testing --skill xl1-dapp-kit --skill xl1-scaffold --skill xl1-build`
    - `npx skills add ariestools/ariestools-skills -g --skill '*' -y`

    Alternatively, install per repo with `pnpm xy skills defaults`. Document that the workspace-root .claude/skills applies only to sessions started there. Remove it only after both user-level installs exist, or the XL1 skills are lost.
    - *Resolved:* the finding proposed `npx skills add XYOracleNetwork/xyo-skills -g` without selectors and `--all -g` for ariestools. Per the xyo-skills install item, a whole-pack xyo install after ariestools replaces the canonical skills with stubs, and per the `--all` item, `--all` targets every agent. Explicit selectors are used, with ariestools installed last.
  - **Evidence:** code.claude.com/docs/en/skills ("Choose where skills load", "Load skills in monorepos and subdirectories"); `ls -la .claude/skills ~/.claude/skills`; workspace skills-lock.json; a count over `*/*/` of .claude/skills/xy-development/SKILL.md (43 of 87).
  - <sub>ids: gap-gap-agent-tool-claims#4</sub>

- ⚪ **`--all` in `xy skills defaults` and both READMEs also targets every agent, and the help text understates what it installs**
  - **Now:** ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:68 is `hasSkillsAgentFlag(args) ? ['--skill', '*'] : ['--all']`. The help at xy/common/skills/index.ts:16-18 reads "ariestools/ariestools-skills  (xy-development, xy-toolchain, ariestools-sdk)". This repo's README.md:37,40 and xyo-skills README:145,147,157,158 use `--all`.
  - **Actual:** In Skills.sh 1.7.1, `--all` means `--skill '*' --agent '*' -y`, which covers 79 agents.
    - In a project install, Eve always gets a real copy with rewritten frontmatter at `<repo>/agent/skills/<name>`. Other agents get symlinks wherever their root directory already exists.
    - OpenClaw's root is `skills/`. In a repo with a top-level skills/ directory, as both skill packs have, `createSymlink` runs rm -r on `skills/<name>` and replaces the source with a symlink.
    - `xy skills lint` scans only .claude/skills and .agents/skills, so the agent/skills copies are never checked. At the workspace root, agent/skills (2026-08-13) holds stale copies, including xy-development 1.1.29, while .agents/skills has 0.1.5.
    - `--all` also installs xy-agent, which the help text omits.
  - **Fix:** At defaults.ts:68, pass `['--skill', '*', '-y']`, which targets the detected agents plus the universal ones. It still falls back to all agents when none are detected, so explicit `-a` targets are the fully safe option. List xy-agent in the help, or exclude it deliberately. In both READMEs, prefer `--skill '*' -y` or explicit names. Consider having `xy skills lint` warn about agent/skills copies.
  - **Evidence:** skills 1.7.1 cli.mjs:5105-5110, 5339-5341, 2194-2198, 2247-2273 (createSymlink rm at 2258), 2287 (Eve canonicalBase agent/skills), 2326-2327, 1517-1520 (OpenClaw skillsDir), 5377-5379 (fallback to all agents); `head agent/skills/xy-development/SKILL.md` at the workspace root; ariestools/toolchain/packages/toolchain/src/actions/skills/installed.ts:6.
  - <sub>ids: gap-gap-skills-cli-install#4</sub>

- ⚪ **The toolchain's own help for the new skills surface is stale or missing**
  - **Now:** In ariestools/toolchain/packages/toolchain/src/xy/common/skills/index.ts, the Config section of the lint help (:66-69) lists only `commands.skillsLint.additionalSkills`, and only `defaults` and `lint` have help branches (:82-89). In actions/skills/lint.ts:399, `skills.unnecessary` says "(extend via commands.skillsLint.additionalSkills)". `xy skills --help` forwards to Skills.sh.
  - **Actual:** `xy skills lint --help` never mentions `commands.skillsLint.skills`, and `allowed` is the precise setting for keeping an extra install. `xy skills pick --help` starts the chooser in a TTY, and without a TTY it fails with "needs a TTY" and exit 1. `xy skills --help` never lists defaults, lint or pick. The chooser is a free-text readline prompt (pick.ts:133-145), not the @inquirer table that work item XYW-20260901-C6723B specified.
  - **Fix:** Add a `printPickHelp` branch that runs before `skillsPick`. List `commands.skillsLint.skills` (required, allowed, off) in the lint help. Change the `skills.unnecessary` description to "mark extras allowed via commands.skillsLint.skills". Append defaults, lint and pick to the forwarded `xy skills --help` output.
  - **Evidence:** `node xy.mjs skills lint --help`; `node xy.mjs skills lint --rules --json`; `node xy.mjs skills pick --help </dev/null` → exit 1; `node xy.mjs skills --help`; ariestools/toolchain/.xy/work/items/XYW-20260901-C6723B.json.
  - <sub>ids: gap-tc1011-skills-pick#3</sub>

- ⚪ **The toolchain repo keeps an unpublished local `xy-work` skill that forks xy-toolchain's `xy work` docs**
  - **Now:** ariestools/toolchain/.agents/skills/xy-work/SKILL.md is 173 lines, at v0.1.0, last changed in 4ab4fbe3a (2026-07-23). It is tracked in git, absent from skills-lock.json and not symlinked into .claude/skills, so only Codex sees it. Its description begins "Use when a user asks Codex to report, capture, triage…".
  - **Actual:** skills/xy-toolchain/commands.md:169-249 already covers `xy work`. The fork never mentions experimental status or xyex, and it says to claim before implementing (:22,146-149), which conflicts with xy-agent. Its unique content is:
    - the `work add` flags --impact, --urgency, --effort, --risk, --confidence, --area, --tag, --file, --line, --inline, --acceptance and --verify (:24-55);
    - the rule ids work.store-not-gitignored, work.github-available and work.github-synced (:112-136);
    - per-type guidance (:164-173).

    The "prefer a work item over TODO markdown" rule already exists at commands.md:175. The toolchain's docs/SKILLS-FOLLOWUP.md:8 says skills are edited only in ariestools-skills.
  - **Fix:** Do not publish a separate xy-work skill. Fold the flags, rule ids and per-type guidance into commands.md#skills-and-work-tracking using `xyex work`, then delete the toolchain copy or reduce it to a redirect stub. Revisit a separate skill only if xy-toolchain's description budget forces a split.
  - **Evidence:** `git -C ariestools/toolchain ls-files .agents/skills/xy-work`; ariestools/toolchain/skills-lock.json; `ls -la ariestools/toolchain/.claude/skills`; `xy work lint --rules`; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:69.
  - <sub>ids: cov-toolchain-history#31, arch-distribution#16, arch-coverage#7</sub>

- ⚪ **The workspace map omits ariestools-skills and lists a nonexistent xl1-skills repo and the retired actor-cli**
  - **Now:** The workspace-root AGENTS.md:153-158 "Agent skills" table lists `XYOracleNetwork/xl1-skills` and `XYOracleNetwork/xyo-skills`. The ariestools section (:59-74) has no skills row. :64 lists the actor-kit outputs as `@ariestools/actor`, `actor-model`, `provider`, `provider-model` and `actor-cli`.
  - **Actual:** ariestools/ariestools-skills is in GitHub.code-workspace:44-45, which the same AGENTS.md declares as its source of truth, and it is the canonical source of the base skills. xl1-skills is neither on disk nor in the workspace file. actor-kit 2.0.0 publishes actor, actor-model, actor-engine, provider, provider-model and actor-system. actor-system is a deprecated alias in the README but is not deprecated on npm. actor-cli is retired and npm-deprecated.
  - **Fix:** Add an ariestools-skills row: outputs xy-development, xy-toolchain, ariestools-sdk and xy-agent; mirrors ariestools-claude-plugin and ariestools-codex-plugin; xyo-skills keeps redirect stubs for xy-development and xy-toolchain only. Remove the xl1-skills row, and mark xyo-skills as owning xyo-knowledge and xl1-*. Rewrite :64 to list `actor-engine` and "`actor-system` (deprecated alias of actor-engine, removed next major)", and drop actor-cli. AGENTS.md:244 is covered by the xylabs-xy-cli guidance item.
  - **Evidence:** `grep -n ariestools-skills AGENTS.md` (no hits); GitHub.code-workspace:44-45; `ls XYOracleNetwork/xl1-skills` (missing); ariestools/actor-kit/README.md:14-21,43-46; `npm view @ariestools/actor-cli deprecated`; `npm view @ariestools/actor-system deprecated` (empty).
  - <sub>ids: arch-distribution#18, arch-coverage#14</sub>

- ⚪ **Toolchain skill detection lists the private `@ariestools/threads-test` as published**
  - **Now:** ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:21-25 is commented "Published packages from the ariestools/sdk-js monorepo", and the set at :26-40 includes `'@ariestools/threads-test'` (:39). skills/ariestools-sdk/packages.md:57 calls it "a companion package for tests".
  - **Actual:** The package is private (ariestools/sdk-js/packages/threads-test/package.json:4), and `npm view @ariestools/threads-test version` returns E404. The set is used only for detection (:87), where this entry is harmless.
  - **Fix:** Remove the entry or correct the comment when packages.md:57 is fixed.
  - **Evidence:** as cited above.
  - <sub>ids: skills/ariestools-sdk/packages.md#15</sub>

## Coverage gaps — skills to add

- 🟠 **No skill covers sdk-react, actor-kit, browser-kit, cli-kit or `@ariestools/cli`, and nothing would install one**
  - **Now:** README.md:11 and CLAUDE.md:30 scope Layer 3 to sdk-js, and so do skills/ariestools-sdk/SKILL.md:3,10. packages.md:3 hedges with "These packages live in the same `sdk-js` monorepo (or closely related Aries Tools packages)", but every package listed there comes from sdk-js. A grep of skills/ finds none of sdk-react, actor-kit, browser-kit, cli-kit or `@ariestools/cli`.
  - **Actual:** These are published: sdk-react 12.0.1, actor-kit 2.0.0, browser-kit 2.0.0, cli-kit 2.1.0 and @ariestools/cli 0.2.0. All of them build on sdk-js. actor and actor-model depend on @ariestools/sdk, the host kits depend on actor-system and actor-model, and sdk-react imports @ariestools/sdk 115 times and peers pixel and eth-address. xyo-skills sends agents to them: xl1-knowledge/gateway-browser.md:37-42,221 cites `bindPageLifecycle` from browser-kit-page and `bindWorkerShutdown` from browser-kit-worker, and xl1-testing/local-chain-datalake.md:41 runs `pnpm add -D @ariestools/cli`. detectProfile.ts:26-40 contains none of these packages, and none declares `xy.skills` (`npm view <pkg> xy` is empty).
  - **Fix:** Keep ariestools-sdk scoped to sdk-js. Delete the packages.md:3 hedge, and add an out-of-scope line near ariestools-sdk/SKILL.md:10. Add Layer-3 *sibling* skills, `ariestools-sdk-react` and `ariestools-actor` (next two items), and do not call them "Layer 4", so that the cross-pack waterfall stays L1 → L2 → L3 libraries → domain packs. Decide where `@ariestools/cli` belongs. Add each new skill to the README and CLAUDE.md layer tables, release-please extra-files and validate-plugins.yml. For delivery, either add them to ARIESTOOLS_SKILLS with matching detectProfile package sets, or have each kit package declare `"xy": { "skills": [{ "name": "<skill>", "source": "ariestools/ariestools-skills" }] }`. Link the new skills from xl1-knowledge/gateway-browser.md.
    - *Resolved:* arch-distribution#9 left open whether to add a "Sibling kits" file to ariestools-sdk or one `ariestools-kits` skill, while arch-coverage#1 and #2 propose two skills. Two skills are kept. React UI and the actor/host-kit stack have different triggers and audiences, and folding either into ariestools-sdk breaks its sdk-js scope.
  - **Evidence:** `npm view` for each package; package.json dependency scan of ariestools/{sdk-react,actor-kit,browser-kit,cli-kit}/packages/*; ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-40; XYOracleNetwork/xyo-skills/skills/xl1-knowledge/gateway-browser.md:37-42,221, xl1-testing/local-chain-datalake.md:41.
  - <sub>ids: arch-layering#5, arch-distribution#9, skills/ariestools-sdk/packages.md#14</sub>

- 🟠 **Add `ariestools-sdk-react` for `@ariestools/sdk-react` 12.x**
  - **Now:** absent. React appears only in toolchain profile, ESLint and tsconfig mentions (xy-toolchain/project-profiles.md:47,51; eslint.md:14,70; typescript.md:9).
  - **Actual:** sdk-react publishes 11 packages at 12.0.1:
    - the umbrella @ariestools/sdk-react, with about 32 subpaths;
    - sdk-react-foundation, -ui, -app, -analytics, -crypto, -identicon, -json-viewer, -motion and -number-status;
    - the npm-deprecated sdk-react-core.

    Peers are react ^19.3 (plus react-dom for foundation), @mui/material ^9.4, react-router ^8.4, ethers ^6.17, @ariestools/pixel ^9.0 and @ariestools/eth-address ^9.0. 16 workspace repos depend on it. sdk-react/AGENTS.md is stale: it describes @xylabs/react-*, yarn and `cd packages/<name> && yarn xy compile`. The ownership map and the "install the smallest owning package" rule are in packages/sdk/README.md. There is also an identity trap. sdk-react-foundation's root bundle creates its own `UserEventsContext`, separate from `/user-events` (dist/browser/index.mjs:991-1040 vs user-events.mjs:3-4), and a runtime identity check returns false. Today every consumer imports `/user-events` or `@ariestools/sdk-react/pixel`, so the trap is latent. The umbrella root and its subpaths forward to the same sub-package subpath bundles.
  - **Fix:** Create skills/ariestools-sdk-react/ at Layer 3, as a sibling of ariestools-sdk that builds on xy-toolchain's React profile and on ariestools-sdk. Files:
    - SKILL.md router;
    - overview.md: umbrella vs focused packages (apps may use the umbrella; libraries install the smallest owning package), the peer matrix, Node and React versions;
    - packages.md: the ownership table and subpath catalog from packages/sdk/README.md;
    - patterns.md: Context.ts + Provider.tsx + useX hook, MUI prop intersection types, useAsyncEffect/usePromise, ErrorBoundary/ErrorReporter, colocated stories;
    - migration.md: @xylabs/react-* → @ariestools/sdk-react-*, and the sdk-react-core deprecation.

    Import rule: "Import from @ariestools/sdk-react (its root or its subpaths). Never import from a sub-package root barrel such as @ariestools/sdk-react-foundation, whose root bundle carries its own UserEventsContext." Until the sdk-react peer item is fixed, state the app install requirement from that item. Upstream, fix sdk-react/AGENTS.md, and consider `moduleLinkage: 'external'` for foundation or removing user-events from its root barrel.
    - *Resolved:* gap-gap-sdk-subpath-identity#6 described the sdk-react rule as "the reverse of @ariestools/sdk". The skill-lens verifier showed that the umbrella root is safe, so Layer 1's umbrella-root rule holds, and only sub-package root barrels are a trap.
  - **Evidence:** a node dump of ariestools/sdk-react/packages/*/package.json; `npm view @ariestools/sdk-react-core deprecated`; ariestools/sdk-react/packages/sdk/README.md; ariestools/sdk-react/AGENTS.md:10,15-26,32; ariestools/sdk-react/packages/sdk-react-foundation/xy.config.ts, src/modules/user-events/Context.ts:77,88; `node --conditions=browser` identity check in sdk-react-foundation.
  - <sub>ids: arch-coverage#1, gap-gap-sdk-subpath-identity#6</sub>

- 🟠 **Add one `ariestools-actor` skill for actor-kit and its cli-kit and browser-kit host kits**
  - **Now:** absent. Only xyo-skills xl1-knowledge/gateway-browser.md:37-42,221 mentions the browser-kit adapters, and only in an XL1 context.
  - **Actual:**
    - actor-kit 2.0.0 publishes actor, actor-model, actor-engine (the single host-agnostic engine), provider, provider-model and actor-system. actor-system is a deprecated alias that maps every ActorSystem* name to ActorEngine*.
    - cli-kit 2.1.0 (cli-kit, -node, -yargs, -daemon) and browser-kit 2.0.0 (browser-kit, -page, -worker, -service-worker, -plugin) are host adapters over that engine. Both still import actor-system (20 imports) and peer on it: `^1.3 || ^2.0` at browser-kit/package.json:73 and `^2.0` at cli-kit/package.json:65.
    - actor-cli is retired and npm-deprecated. ARCHITECTURE.md:279-286 says runActorOnce, runActorsService and buildCatalogActors "move to cli-kit", but none of them exists in cli-kit 2.1.0.
    - Usage: 24 repos use the actor family, 15 use cli-kit and 6 use browser-kit. actor-kit has no AGENTS.md, and none of these packages declares `xy.skills`.
  - **Fix:** Create skills/ariestools-actor/ at Layer 3, depending on ariestools-sdk and xy-toolchain. Use one skill, because both host kits are thin facades over actor-engine and separate skills would repeat the engine concepts. Files:
    - SKILL.md: triggers on actors, providers, CLI process shells, yargs, daemons, and browser page, worker, service-worker and extension realms;
    - overview.md: package map and edges, SDK 8.1/8.3/9.0 peer qualification, Node 26 for the host kits;
    - actors.md and providers.md;
    - engine.md: compileActorEngine, launchCompiledActorEngine, launchActorEngine, launchActors, supervision, boot diagnostics;
    - cli.md: the application shell, the SYS_EXITS ladder, lifehash-indexer as the reference;
    - browser.md: the realm adapters, compileBrowserSystem and launchCompiledBrowserSystem, keeping security-sensitive providers in the background realm;
    - migration.md: actor-system → actor-engine renames, the fact that host kits 2.x still peer on actor-system, and the actor-cli retirement table, noting that its replacements have not shipped.

    Keep XL1 specializations in xyo-skills and link gateway-browser.md here. Split cli.md out into `ariestools-cli` if it grows past about 150 lines.
  - **Evidence:** ariestools/actor-kit/README.md:3-10,21,43-46, ARCHITECTURE.md:267-289, packages/actor-system/src/index.ts:1-9; `grep -rhoE "from '@ariestools/actor[a-z-]*'"` over cli-kit and browser-kit packages (20 actor-system imports); `npm view @ariestools/actor-cli deprecated`.
  - <sub>ids: arch-coverage#2</sub>

- 🟠 **Full-app Playwright e2e has no canonical guidance, and xyo-skills routes it to the legacy, yarn-based `xylabs-e2e-setup`**
  - **Now:** This pack mentions Playwright only as the Vitest browser provider (skills/xy-toolchain/testing.md:27-49), and testing.md:52-66 covers Vitest serialized e2e projects. XYOracleNetwork/xyo-skills/skills/xl1-testing/SKILL.md:62 and browser-mode.md:22,164,179 send full-app UI e2e to "the `xylabs-e2e-setup` skill (separate skill, if installed)".
  - **Actual:** xylabs-e2e-setup exists only as retired toolchain output. It assumes a "React/Vite Yarn-workspaces monorepo", checks package.json `workspaces`, and scaffolds `yarn start` and `yarn workspace … test` (XYOracleNetwork/plugins/.agents/skills/xylabs-e2e-setup/SKILL.md:14,22,66,98,176-179,202,209). The affected repos use pnpm with pnpm-workspace.yaml (wallet-xl1-chrome has packages/e2e). `xy test` runs Vitest only, and no toolchain Playwright preset exists. Deleting the legacy files, as the legacy-output item recommends, would orphan this route.
  - **Fix:** Treat this as a blocker for that cleanup. First change xl1-testing/SKILL.md:62 and browser-mode.md:22,164,179 to point at a pnpm-correct guide or at the repo's packages/e2e. If canonical guidance is wanted, add a short "Full-app Playwright e2e" subsection to xy-toolchain/testing.md covering these points:
    - it is outside the `xy` CLI: `xy test` is Vitest only and there is no preset;
    - it lives in a pnpm workspace package such as packages/e2e, which has its own `playwright test` script;
    - it is invoked as `pnpm --filter <e2e-package> test`;
    - it uses the @ariestools tsconfig and ESLint configs;
    - component tests use vitest-config browser mode.

    Decide separately whether xylabs-refactor-cohesion is ported (probably to xy-development) or dropped.
  - **Evidence:** XYOracleNetwork/xyo-skills/skills/xl1-testing/SKILL.md:62, browser-mode.md:22,164,179; `grep -c '"workspaces"' package.json` → 0 with pnpm-workspace.yaml present in wallet-xl1-chrome, xl1-protocol and clients; `xy test --help` ("Run Vitest Tests").
  - <sub>ids: gap-gap-legacy-xylabs-artifacts#7</sub>

## Link and consistency integrity

- 🔴 **`xy agent lint` rules and fixers misfire on documents written exactly to the xy-agent skill**
  - **Now:** 10.1.1 (8f2768dfd) ships a stable `xy agent lint|init|audit|index|archive`, which `xy check` runs, and its work item says it implements skills/xy-agent. The skill prescribes:
    - a "Which document is authoritative" section and a "What NOT to do" section;
    - CLAUDE.md as `@AGENTS.md` plus a "## Claude Code" additions section (agents-md.md:100-108, templates.md:67-73);
    - copilot-instructions additions (templates.md:83-91);
    - a root-relative `supersededBy` (lifecycle.md:17).
  - **Actual:** Error-level misfires on skill-conformant files:
    - **Required sections.** In REQUIRED_SECTIONS (ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:17-23), `/authority/i` does not match "Which document is authoritative" and `/fail|troubleshoot/i` does not match "What NOT to do". The skill's own templates.md AGENTS.md therefore fails `agents.required-sections`.
    - **Thin adapters.** `isThinAgentsImport` (document.ts:46-50) accepts only a lone `@AGENTS.md` after HTML comments are stripped. The skill's CLAUDE.md template, Claude Code's documented adapter shape, and the output of `xyex plan lint --fix` all fail as pointer-not-import. That fixer prepends the template to existing content (plan/rootDocs.ts:53-56), while plan lint accepts `@AGENTS.md` anywhere (plan/markdown.ts:11-13). The skill's copilot template fails as a divergent adapter, and the regex also rejects `@../AGENTS.md`.

    Further defects:
    1. `docs.superseded-archived` checks whether the successor, not the superseded file, is under archive/, and it resolves `supersededBy` relative to the document (:266-273).
    2. `agents.authority-rows-resolve` looks only for a heading that starts with "Authority" (:198). It keeps backticks and parentheses in column 1 (:202), so the init scaffold's own row yields "Authority row (docs/README.md) does not exist". It also reads column 1, which in the skill's task-first table is the task class.
    3. In `decisions.naming`, the dated scheme is unreachable and `<PREFIX>-D<n>` is unsupported (:347-359).
    4. `docs.front-matter --fix` writes `kind: doc` (:231). Because the context is loaded once (lint.ts:21), the index fixer in the same run uses stale front matter, and a second pass reports `docs.index-current`.
    5. `agentArchive` flattens paths, forces `state: archived`, drops `workItems` and strips quotes, which produces invalid YAML (mutate.ts:26-37; document.ts:11-22). Its banner omits the date and successor.
    6. `docs.orphan` never fires once the generated index exists (:328).
    7. `docs.stale` has no exemption for evidence, decisions or archive (:297-314).
    8. The walker ignores .gitignore (walk.ts:6), so sdk-js's gitignored TypeDoc /docs is linted.

    For Copilot, only Copilot CLI documents `@` expansion, without stating a base directory. VS Code uses Markdown links resolved from the instructions file. Copilot CLI documents that it deduplicates identical instructions.
  - **Fix:** Fix the toolchain alongside the skill:
    - Change the authority pattern to `/authorit/i` and let failures also match "What NOT to do".
    - Make `authority-rows-resolve` find that section and read the Authority (second) column, stripping backticks and parentheses.
    - Let `adapter-thin` accept `@AGENTS.md` (or `@./AGENTS.md`) as the first non-comment line followed by tool-specific content, and keep erroring on copies and on adapters that never import. Share one predicate between agent lint and plan lint (`hasClaudeAgentsImport`, rootDocs.ts).
    - For .github/copilot-instructions.md, accept a Markdown link to ../AGENTS.md or `@../AGENTS.md`, or recommend leaving the file absent.
    - Resolve `supersededBy` from the repo root, and fix defects 1-8.
    - Add specs that lint every templates.md skeleton: AGENTS.md, CLAUDE.md, copilot, decision, evidence, runbook and index.

    Then update xy-agent: auditing.md:7-19 should say that `xy agent` now exists, and auditing.md:32 should state whether additions after the import are allowed.
    - *Resolved:* the skill (agents-md.md:100-108), the toolchain's repo-docs.md:13,29 and Claude's documentation all allow notes below the import. Only agent lint forbids them, so the linter changes and the docs stay.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/agent/: rules.ts:17-23,70-84,198-202,231,266-273,297-314,328,347-359; document.ts:11-22,46-50; lint.ts:21; mutate.ts:26-37; walk.ts:6. ariestools/toolchain/packages/toolchain/src/actions/plan/rootDocs.ts:53-56, markdown.ts:11-13. Scratchpad fixtures (templates.md skeletons; `@AGENTS.md` + "## Claude Code" → pointer-not-import; yaml@2.9.1 "Nested mappings are not allowed in compact mappings"). code.claude.com/docs/en/memory; docs.github.com Copilot CLI custom instructions; code.visualstudio.com custom instructions.
  - <sub>ids: gap-tc1011-xy-agent#21, gap-gap-agent-tool-claims#2</sub>

- 🔴 **The toolchain's own scaffolds and docs contradict its stable agent lint, and a fresh `xy repo init` fails `xy check`**
  - **Now:** ariestools/toolchain/packages/toolchain/templates/repo/cli/root/AGENTS.md.tmpl:1-39 has the headings "# AGENTS.md", Documentation, Overview, Commands, Architecture and CLI structure, and it links ./papers/README.md and ./docs/README.md (:7-8). build-pnpm.yml.tmpl:25-29 runs only build and test. In the toolchain docs:
    - docs/repo-docs.md:3 names only `xy plan lint` and `xy repo lint` as enforcers;
    - repo-docs.md:16 forbids package AGENTS.md files, and :22 calls a symlinked CLAUDE.md unsupported;
    - docs/xy-config.md:58 says "Other `docs/` and `notes/` content is unlinted and freeform";
    - docs/STABILITY.md:72 lists three skills;
    - CHANGELOG.md has no `xy agent` entry.
  - **Actual:** Linting the repo-init output gives error `agents.required-sections` (authority, repository map, failures), error `agents.links-resolve` (repo init never creates papers/ or docs/) and a warning for `agents.h1-not-filename`. The template's own `check` script (package.json.tmpl:34) therefore fails out of the box, which breaks the ROADMAP.md:132 Phase 2 exit criterion of a green `xy check` on a fresh scaffold. repoInit.spec.ts:175-180 never runs agent lint. The plan templates give 2 errors and 5 warnings, and `xy agent init` output gives 2 warnings. Agent lint accepts a symlinked CLAUDE.md (rules.ts `adapterFinding`), lints all of docs/, and has `agents.nested-delta-only` for packages/*/AGENTS.md. 8f2768dfd touched no templates.
  - **Fix:** Make all three scaffolders pass `xy agent lint`: repo init's AGENTS.md.tmpl, the plan templates and their `--fix`, and `agent init`. Add specs for monorepo and `--no-monorepo` output, ideally running the whole `xy check`.
    - AGENTS.md.tmpl: use a product-name H1 and sections for Orient, Authority, Repository map, Commands and Failures/Troubleshooting. Either scaffold papers/README.md and docs/README.md or drop the links.
    - Once the scaffold passes, add `xy check` after build in the scaffold workflows.
    - repo-docs.md:3: add the stable `xy agent lint`, which runs in `xy check`. Keep :13 and :29; the linter changes instead (previous item).
    - Scope xy-config.md:58 to plan lint, list four skills in STABILITY.md:72, and add CHANGELOG entries for `xy agent` and `xy skills pick`.
    - *Resolved:* on a symlinked CLAUDE.md, the xy-agent skill (agents-md.md:110-116) and the stable agent lint both accept a symlink to AGENTS.md. Only the experimental plan lint, which requires regular files, and repo-docs.md:22 reject it. On package AGENTS.md files, the skill allows nested delta files (agents-md.md:130-136) and agent lint checks them, while repo-docs.md:16 forbids them. Record both as explicit policy decisions in the skill and in the linter. Until then, prefer the import, which also works on Windows.
  - **Evidence:** ariestools/toolchain/packages/toolchain/templates/repo/cli/root/AGENTS.md.tmpl:1-39, package.json.tmpl:34, github/workflows/build-pnpm.yml.tmpl:22-29; ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:17-23,60-84,120-154,180-194, document.ts:36-38, init.ts:9-32; ariestools/toolchain/packages/toolchain/src/actions/plan/templates.ts:2,54; ariestools/toolchain/packages/toolchain/spec/actions/repoInit.spec.ts:175-180; ariestools/toolchain/docs/repo-docs.md:3-29, xy-config.md:58, STABILITY.md:72, ROADMAP.md:132; `git diff --stat 7eb43c3c2..812b27a91 -- packages/toolchain/templates packages/toolchain/src/actions/repo-init` (empty).
  - <sub>ids: gap-gap-ci-guidance#4, gap-tc1011-xy-agent#22</sub>

- 🟠 **`xy check` runs agent lint unconditionally at error level, and all 8 surveyed repos fail it**
  - **Now:** ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:49-50 calls `agentLint` with no enablement check. `agents.file-present` (actions/agent/rules.ts:86-92) and `docs.index-current` (:244-260) default to error. skills/xy-agent/SKILL.md:18 says the pattern is "recommended, not required" and that a repo without it "is not defective".
  - **Actual:** Constraint 4 of work item XYW-20260901-263436, "Auto-detect enablement from the presence of AGENTS.md", is also one of its acceptance criteria, and it is not implemented. XyConfig.ts:657-662 says the check "runs whenever AGENTS.md is relevant". Constraint 5 (default to warn) conflicts with the work item's own rule catalog, which lists these rules as errors. Error counts: toolchain 2, sdk-js 3, sdk-react 3, actor-kit 2, browser-kit 1, cli-kit 3, ariestools-skills 3 (this worktree) and xyo-skills 2. actor-kit, browser-kit and cli-kit fail only because they have no AGENTS.md. sdk-js's errors include `docs.index-current` from its gitignored TypeDoc /docs. No CI workflow runs `xy check`, so the breakage hits local and agent runs.
  - **Fix:** Skip agent lint in `xy check` when the repo root has no AGENTS.md (constraint 4), or make `agents.file-present` opt-in. Downgrade rules the workspace currently fails, such as `docs.index-current`, to warn until repos migrate. Then align xy-agent SKILL.md:18 and xy-toolchain commands.md with the settled gate.
  - **Evidence:** `git show 8f2768dfd -- .xy/work/items/XYW-20260901-263436.json`; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:49-50; ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:86-92,244-260; ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:657-662; read-only `agent lint --json` per repo.
  - <sub>ids: gap-tc1011-xy-agent#20</sub>

- 🟠 **`xy check --strict` and `XY_STRICT=1` do not escalate agent-lint and skills-lint warnings**
  - **Now:** ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:50 calls `agentLint({ cwd, fix })`, and :74 calls `skillsLint({ fix })`. actions/agent/lint.ts:24 sets `strict: options.strict === true`, and actions/skills/lint.ts:472 sets `isStrict = options.isStrict === true || options.strict === true`. skills/xy-toolchain/commands.md:165 says "use `--strict` when warnings must block CI".
  - **Actual:** `runRuleChecks` defaults to `strict = isStrictMode()` (ruleRunner.ts:253), but both wrappers pass an explicit false. Warnings such as `agents.h1-not-filename`, `agents.size-budget`, `docs.stale`, `skills.duplicate-install` and `skills.unnecessary` therefore never fail under `--strict`, contrary to `xy check --help`. The standalone `xy agent lint` reads only `argv.strict` (common/agent/index.ts:31-35), and `xy skills lint` reads only a raw `--strict` (common/skills/index.ts:35-41), so both ignore `XY_STRICT=1`. publint, packman and lintlint do use `isStrictMode()`.
  - **Fix:** In agent/lint.ts (lint and audit), set `strict: options.strict === true || isStrictMode()`. In skills/lint.ts, set `isStrict = options.isStrict === true || options.strict === true || isStrictMode()`. Add specs for `--strict` and `XY_STRICT=1` on `xy check`, `xy agent lint` and `xy skills lint`.
    - *Resolved:* the finding first proposed `options.strict ?? isStrictMode()`. The skill-lens verifier showed that this fixes only the `xy check` path, because the standalone handlers pass an explicit `false`. Using `||` also covers the standalone `XY_STRICT=1` case.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/: actions/ruleRunner.ts:180-183,253; actions/agent/lint.ts:24; actions/skills/lint.ts:472,521; xy/common/agent/index.ts:18-35,62; xy/common/skills/index.ts:33-42; xy/xyParseOptions.ts:58; `xy.mjs check --help`.
  - <sub>ids: gap-gap-ci-guidance#5</sub>

- 🟠 **The scaffold pins Volta Node 22.14.0, which only warns in `xy check`, and CI never follows the pin**
  - **Now:** In ariestools/toolchain/packages/toolchain/templates/repo/cli/, root/package.json.tmpl:53-56 sets `engineStrict` and `volta.node` 22.14.0, and :40 sets `@types/node ~26.1.2`. The package template sets engines `>=22`. The workflow templates hard-code `node-version: "22"` (build-pnpm.yml.tmpl:17-20; build-npm and build-yarn :15-18). skills/xy-toolchain/toolchain.md:115 says "Require Node.js 22 or newer".
  - **Actual:** The engines range `>=22` includes the current release (26.8.2) and the LTS (24.21.0), so there is no error. Volta 22.14.0 is older than both, so `repo.engines-lts` warns: warnings map to the warn level even though the rule is error-level (package-lint.ts:286-304). `xy check` exits 0, and `xy check --strict` exits 1 on either nodeTrack. `node.volta-node-latest` (warn, fixable) is not part of `xy check`. Its `--fix` rewrites volta to 26.8.2 while CI stays on 22. `@types/node` 26 lets Node-26-only APIs type-check against a Node 22 floor. Real repos pin volta 26.x: sdk-js 26.8.2, sdk-react 26.8.6, actor-kit 26.8.2, browser-kit 26.9.0 and cli-kit 26.9.0.
  - **Fix:** Write `volta.node` at scaffold time from `latestVersions.nodeCurrent`, or from `nodeLts` on the LTS track. Switch the workflow templates to `node-version-file: package.json` (the browser-kit and cli-kit pattern), optionally adding a floor job at 22. Keep `@types/node` at the engines floor major, or document the choice. Add a repoInit spec that runs repo lint and node lint under strict mode.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:286-304,403-408, actions/package-lint-engines.ts:194-216, actions/node-lint.ts:18,81-107,169-176, lib/latestVersions.ts:6-7, xy/common/checkCommand.ts:49-74; ariestools/toolchain/.github/workflows/verify.yml:36; `jq .volta` across the five repos.
  - <sub>ids: gap-gap-ci-guidance#6</sub>

- 🟠 **The `--no-monorepo` scaffold drops `packageManager` and `volta`, which its workflow relies on**
  - **Now:** `mergePackageJsonRecords` at ariestools/toolchain/packages/toolchain/src/actions/repo-init/scaffold.ts:127-150 returns `{ ...packagePkg, dependencies, devDependencies, private: false, scripts }`.
  - **Actual:** The root template's `packageManager` (:52; pnpm@11.13.1 via templateVars.ts:7-11,117) and `volta` (:54-56) are lost, and the package template has neither field. The workflow uses `pnpm/action-setup@v4` with no `version:` input (build-pnpm.yml.tmpl:15) and relies on `packageManager` instead (576b8592a). The spec asserts `not.toContain('version: 11')` but never checks `pkg.packageManager` (repoInit.spec.ts:224-240). Repo lint is skipped for single packages, so the missing pin is never flagged, and ROADMAP:132 names this exact path. The action-setup failure was not reproduced locally; it follows from the action's documented contract.
  - **Fix:** Carry `packageManager`, `volta` and `engineStrict` over from the root template in `mergePackageJsonRecords`. Assert `pkg.packageManager` and `pkg.volta` in the single-package spec.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/repo-init/scaffold.ts:127-150,210-229, templateVars.ts:7-11,117; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:52-56, templates/repo/cli/package/package.json.tmpl:1-62, github/workflows/build-pnpm.yml.tmpl:15; ariestools/toolchain/packages/toolchain/spec/actions/repoInit.spec.ts:224-240.
  - <sub>ids: gap-gap-ci-guidance#7</sub>

- 🟠 **The scaffold installs vitest ~4.1.10, but its own `@ariestools/vitest-config` 10.1.1 peers vitest ^5.0**
  - **Now:** ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:41 has `"@vitest/coverage-v8": "~4.1.10"`, :45 `"@ariestools/vitest-config": "{{toolchainRange}}"` and :50 `"vitest": "~4.1.10"`.
  - **Actual:** The vitest-config peer has been `{ "vitest": "^5.0" }` since 7a20cbca4 (2026-09-05), and the template was last touched in 967f71e3f (2026-09-01). vitest.config.ts.tmpl imports `defineXyVitestConfig`, so a fresh scaffold has an unmet peer. Every real repo is on ~5.0.x.
  - **Fix:** Bump both packages to ~5.0.x, or derive them at build time from the vitest-config peer, as `toolchainRange` is derived. Add a spec asserting that the template range satisfies the peer.
  - **Evidence:** `npm view @ariestools/vitest-config@10.1.1 peerDependencies`; ariestools/toolchain/packages/vitest-config/package.json, README.md:18; `git log -S'"vitest": "^5' -- packages/vitest-config/package.json`.
  - <sub>ids: gap-gap-ci-guidance#8</sub>

- 🟠 **Unknown `xy` commands print "Command not found" but exit 0**
  - **Now:** The catch-all `.command('*')` at ariestools/toolchain/packages/toolchain/src/xy/xy.ts:119-129 logs the message and a hint, and sets no exit code.
  - **Actual:** On 10.1.1, `xy claude-rules`, `xy gitlint`, `xy lintlint` and `xy compile-only` all exit 0. The legacy files in 10 repos tell agents to run exactly these commands, so any agent, script or CI step that checks the exit status records a pass for a check that never ran.
  - **Fix:** Set `process.exitCode = 1` when an unrecognized command is given. Optionally map retired names to "removed in 8.2.8; use <replacement>": gitlint → `git lint`, lintlint → `lint lint`, compile-only → `compile`, deploy-minor → `deploy minor`, claude-* → `xy skills`.
  - **Evidence:** `node …/dist/bin/xy.mjs claude-rules >/dev/null 2>&1; echo $?` → 0, and the same for gitlint and lintlint; ariestools/toolchain/packages/toolchain/src/xy/xy.ts:119-130.
  - <sub>ids: gap-gap-legacy-xylabs-artifacts#2</sub>

- 🟠 **The workspace-root instructions describe `xy compile` as tsup**
  - **Now:** The workspace-root CLAUDE.md:28 and AGENTS.md:236 say "`pnpm xy compile` — TypeScript compile only (tsup; outputs `dist/neutral`, `dist/browser`, `dist/node`)".
  - **Actual:** ariestools/toolchain/AGENTS.md:59 says "Consumer emit is **esbuild** (`xy compile`)… Do not describe the compiler as tsup." architecture.md:40 says "`xy compile` → esbuild (`library` / `bundle` / `transpile`), or `monolith` / `vendor`", and packages/toolchain/package.json:66 depends on esbuild. skills/xy-toolchain/compilation.md:56-80 never says tsup. The workspace file loads above every skill and declares that it overrides default behavior.
  - **Fix:** Replace both lines with "`pnpm xy compile` — emit via esbuild per `xy.config.ts` compile mode (library/bundle/transpile, or monolith/vendor); outputs `dist/neutral`, `dist/browser`, `dist/node`. Legacy `@xylabs/ts-scripts-yarn3` repos used tsup." and defer details to xy-toolchain/compilation.md. Keep the `npx tsup:*` pre-allow (CLAUDE.md:60, AGENTS.md:283, .claude/settings.local.json:15) while api-archivist-nodejs, sdk-xyo-js, sdk-coin-js and wallet-xl1-chrome still use tsup.
  - **Evidence:** workspace-root CLAUDE.md:28, AGENTS.md:236; ariestools/toolchain/AGENTS.md:59, architecture.md:40, packages/toolchain/package.json:66.
  - <sub>ids: arch-distribution#13</sub>

- 🟠 **xy-toolchain does not link xy-agent, and xy-agent's paper names fail `xyex plan lint`**
  - **Now:** The Related skills list at skills/xy-toolchain/SKILL.md:48-51 names only ariestools-sdk and xyo-skills, although xy-agent/SKILL.md:45 links back to xy-toolchain. skills/xy-agent/structure.md:50 prescribes "`<PRODUCT>_{WHITE,YELLOW,GREEN,LIGHT}_PAPER.md`", and agents-md.md:31 uses `papers/X_YELLOW_PAPER.md`. auditing.md:9 still says "**There is no `xy agent` command yet.**"
  - **Actual:** 10.1.1 ships a stable `xy agent` (stability.ts:47) that implements xy-agent and runs in `xy check`, so an agent working in xy-toolchain scope that hits those findings needs xy-agent. Separately, the experimental `xyex plan lint` (stability.ts:61-63; not part of `xy check`) enforces an exact, case-sensitive allowlist: papers/README.md, WHITE-PAPER.md and YELLOW-PAPER.md, plus an optional GREEN-PAPER.md (plan/lint.ts:27-42). Its `--fix` moves any other paper file into notes/. `xy agent lint` checks paper headers but not names. A repo that follows xy-agent therefore fails plan lint and loses its papers under `--fix`.
  - **Fix:** Add a Related-skills entry to xy-toolchain: "xy-agent — AGENTS.md, docs/ and papers/ conventions; checked by stable `xy agent lint` (run by `xy check`), with `xy agent init|audit|index|archive` as helpers." Document the `xy agent` commands in commands.md, and update auditing.md:7-19. Reconcile the paper naming: either xy-agent adopts the plan-lint names, or the toolchain relaxes the allowlist.
    - *Resolved:* round-1 text named `xy plan lint` / `xy repo lint` as the enforcers of the docs contract (skills/xy-agent/SKILL.md#8, and the original wording of this finding). At 10.1.1 the enforcer is the stable `xy agent lint`. Plan lint is a separate, experimental layout check.
  - **Evidence:** skills/xy-toolchain/SKILL.md:48-51; skills/xy-agent/SKILL.md:45, structure.md:50, agents-md.md:31, auditing.md:7-19; ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:27-42,411-489; ariestools/toolchain/packages/toolchain/src/xy/stability.ts:47,61-63; ariestools/toolchain/CHANGELOG.md:16,30.
  - <sub>ids: skills/xy-toolchain/SKILL.md#3</sub>

- 🟠 **sdk-js publishes about 50 subpaths under bundle linkage and advertises them, although `external` linkage exists**
  - **Now:** ariestools/sdk-js/packages/sdk/xy.config.ts:8-153 sets no `moduleLinkage`, so the default `bundle` applies. packages/sdk/README.md:11-18 says to import "a single slice via a subpath export (tree-shaking-friendly — you only pay for what you import)". packages/sdk/src/modules/base/Base.ts:109-110 calls `Base.defaultLogger` the "process-wide default logger".
  - **Actual:** Under bundle linkage, the root and each subpath carry separate copies of classes and module state, which is why the ariestools-sdk skill recommends root-only imports. `moduleLinkage: 'external'` has existed since 78175963c (first tag v8.6.7) and gives one bundle per module per platform. 10.0.9 adds `pub.importsMatchExports` and layout-sync warnings for the platform/url `platformEntries` that sdk-js uses, but sdk-js pins toolchain ~10.0.7 (package.json:42; the lock resolves 10.0.7). Two classes are hardened against duplicate copies: the FetchError brand (FetchError.ts:196-203) and the AbstractCreatable `Symbol.for` key (:25). Base statics and `MongoClientWrapper.clients` are not. storage-adapters has the same layout.
  - **Fix:** In sdk-js, either set `moduleLinkage: 'external'` with `distImports` for the platform and url conditional imports, verified with `xy publint` and layout sync on toolchain 10.0.9 or later, or stop advertising subpaths for class- and state-bearing modules in README.md:11-18. Decide the same for storage-adapters. Once external linkage ships, ariestools-sdk can relax its root-only guidance behind a version gate.
  - **Evidence:** ariestools/sdk-js/packages/sdk/xy.config.ts:8-153, README.md:11-18, package.json:42, pnpm-lock.yaml:724; ariestools/toolchain/packages/toolchain/src/actions/package/compile/MonolithConfig.ts:153-166, monolithCompileLayout.ts:131; `git log -S moduleLinkage` → 78175963c.
  - <sub>ids: gap-gap-sdk-subpath-identity#5</sub>

- 🟠 **sdk-react imports `@ariestools/sdk` at runtime without declaring it, since 11.1.6**
  - **Now:** ariestools/sdk-react/xy.config.ts:14 sets `'@ariestools/sdk': { placement: 'dev', presence: 'allowed' }`, and every package lists it only in devDependencies.
  - **Actual:** The published sdk-react-foundation 12.0.1 dist imports `delay`, `Enum` and `getApiStage` from "@ariestools/sdk" (index, flexbox, rich-result and shared.mjs). Yet its only dependency is async-mutex, and its peers are react, react-dom and @mui/material. 11.1.5 had the peer `^8.1`. b753abb17 (2026-07-24, "deplint") dropped it in 11.1.6. The sdk root loads zod and, through telemetry, @opentelemetry/api, and `peerForwarding: 'when-used'` (:5-9) leaves those to an upstream declarer that does not exist. Resolution therefore depends on hoisting, and nothing enforces the single shared @ariestools/sdk copy that the root-import identity rule relies on.
  - **Fix:** Restore `@ariestools/sdk` ~9.0 as a peer of every package that imports it, and let deplint enforce it. Until then, the planned sdk-react skill and the ariestools-sdk install guidance must say: "Apps using @ariestools/sdk-react 12.x must add @ariestools/sdk ~9, zod ^4.6 and @opentelemetry/api ^1.9 themselves."
  - **Evidence:** `npm view @ariestools/sdk-react-foundation@<v> peerDependencies dependencies` for 11.1.5, 11.1.6, 12.0.0 and 12.0.1; `git log -L14,14:xy.config.ts` in ariestools/sdk-react; sdk-react-foundation dist/browser/index.mjs:336,615,934.
  - <sub>ids: gap-gap-sdk-subpath-identity#7</sub>

- ⚪ **This repo inverts its own xy-agent convention: CLAUDE.md is canonical and AGENTS.md is a prose pointer**
  - **Now:** AGENTS.md:1 is `# AGENTS.md`. :3 says "Same guidance as `[CLAUDE.md](./CLAUDE.md)`. Prefer that file for the full distribution and release model." :5 owns three skills. CLAUDE.md is a 70-line regular file titled `# CLAUDE.md`, with the headings Purpose, Distribution Model, Skill layers, Development, Merge methods, Releases, CI and Local checks.
  - **Actual:** skills/xy-agent/agents-md.md:98 makes AGENTS.md canonical. :118 says "A prose pointer is not good enough." :140 says the H1 names the product, and structure.md:6-7 says the import is "required, not optional". A read-only `xy agent lint --json` (10.1.1) on this worktree reports:
    - error `agents.adapter-thin`: "CLAUDE.md is a copy or a divergent adapter";
    - error `agents.required-sections`: missing orient, authority, repository map, commands and failures;
    - warning `agents.h1-not-filename`;
    - error `docs.index-current`: docs/evidence/ exists but docs/README.md does not.

    Moving CLAUDE.md's content over unchanged would still fail `required-sections`. The repo has no toolchain dependency, so CI enforces none of this.
  - **Fix:**
    1. Make AGENTS.md canonical under a product H1 (for example `# Aries Tools skills agent guidance`), restructured into these sections:
       - orient: what the repo is, the inventory of skills/ and scripts/marketplace-sync/, the only-editable-source rule, and the fact that xyo-skills keeps redirect stubs only;
       - an authority table: skills/ is the source of truth; README.md, DEVELOPMENT.md and docs/evidence each get a status; the mirrors and stubs are non-authoritative;
       - a repository map with a handling verdict per path: .preview/ is generated and never committed, and the mirrors are written by release automation only;
       - commands: validate:skills, sync:claude, sync:codex and the jq checks;
       - failures and what NOT to do: no force-push, no manual version bumps, no full copies in xyo-skills.

       Use headings that match today's linter (for example "Authority" and "Failures and what NOT to do") until the agent-lint item lands.
    2. List all four skills in both the owned list and the layer listing.
    3. Replace CLAUDE.md with `<!-- Canonical agent instructions live in AGENTS.md. Claude Code imports that file. -->` followed by `@AGENTS.md`, the form used by plan/templates.ts:30-31 and the toolchain's own CLAUDE.md. This repo has no Claude-only content, so the pure import passes both today's `adapter-thin` and a relaxed version of it.
    4. Generate docs/README.md with `xy agent index`. It is a generated file and is never written by hand (xy-agent/lifecycle.md:104-108).
    5. Verify with `npx -p @ariestools/toolchain@10.1.1 xy agent lint`. The package has no `toolchain` bin, so `npx @ariestools/toolchain@10.1.1 …` without `-p` cannot run.
    - *Resolved:* arch-distribution#19 suggested "`@AGENTS.md` plus any Claude-only notes". 10.1.1's `adapter-thin` rejects that form, so the pure import is kept.
  - **Evidence:** AGENTS.md:1-7; CLAUDE.md:1-70; skills/xy-agent/agents-md.md:96-142, structure.md:6-7, lifecycle.md:104-108; ariestools/toolchain/packages/toolchain/src/actions/agent/rules.ts:17-23,70-135, document.ts:46-50, init.ts:34; `INIT_CWD=$PWD node …/dist/bin/xy.mjs agent lint --json`.
  - <sub>ids: skills/xy-agent/agents-md.md#13, cov-agent-docs#24, arch-layering#23, arch-distribution#19</sub>

- ⚪ **Cross-skill links break when only the required skills are installed**
  - **Now:** skills/xy-development/SKILL.md:33 and workflow.md:47 link `../xy-agent/SKILL.md`, and skills/xy-toolchain/SKILL.md:50 links `../ariestools-sdk/SKILL.md`.
  - **Actual:** Tier xy requires only xy-development and xy-toolchain (skillRules.ts:65,73-77). In the toolchain repo, which has xy-development, xy-toolchain and the local xy-work installed, both links dangle. `xy skills pick` cannot install xy-agent because it is not in the catalog.
  - **Fix:** Write every Related-skills entry as "name — purpose (install: `npx skills add ariestools/ariestools-skills --skill <name>`)", so a missing target is actionable. Treat these entries as navigation, never as a dependency of a lower layer, and pair the change with the catalog fix.
    - *Resolved:* cov-agent-docs#16 suggested `pnpm xy skills pick --skill xy-agent`. `pick` rejects xy-agent and can overwrite xy.config.ts, so the universal `npx skills add … --skill` hint is kept.
  - **Evidence:** `ls ariestools/toolchain/.agents/skills`; ariestools/toolchain/skills-lock.json; ariestools/toolchain/.agents/skills/xy-development/SKILL.md:33; ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:65,73-77, pick.ts:34.
  - <sub>ids: arch-layering#17</sub>

- ⚪ **CI checks only skill frontmatter, with no link, anchor or description-length checks**
  - **Now:** scripts/validate-skills.mjs:10-107 checks the directory name, symlinks, that SKILL.md exists, that `name` and `description` are non-empty (`REQUIRED_FIELDS = ['name', 'description']` at :11), and that the name matches the directory. .github/workflows/validate-plugins.yml:47-61 checks the shape of the rendered tree. The description at skills/xy-toolchain/SKILL.md:3 is 958 characters.
  - **Actual:** Nothing is broken today (27 files, 103 relative links, 0 problems), but nothing prevents regressions. xyo-skills deep-links three workflow.md anchors, `#applying-the-definition-of-done`, `#writing-project-specific-acceptance-criteria` and `#definition-of-done` (xl1-build/SKILL.md:123,152,155; xl1-patterns/dapp-checklist.md:5,9; xl1-scaffold/SKILL.md:59,243), and it links xy-toolchain/testing.md (xl1-testing/browser-mode.md:45,178; local-chain-vitest.md:295). In an installed project those links resolve against this repo's headings (workflow.md:63,112,124). Agent Skills limits descriptions to 1024 characters, and the pending xy-toolchain additions (xy vs xyex, `xy agent`, skills presence) will push past that. `xy agent lint` checks links only inside AGENTS.md.
  - **Fix:** Extend validate-skills.mjs to resolve relative links and GitHub-style anchors under skills/, to fail descriptions over 1024 characters (and warn over 900), and to enforce an allowlist of public anchors that must keep existing: the three workflow.md headings and xy-toolchain/testing.md. Note that contract in CLAUDE.md or AGENTS.md. Trim xy-toolchain's description to trigger terms (xy CLI, build/lint/test, configs, deplint, publint, policy, skills, work), and move the feature detail into the router body.
  - **Evidence:** scripts/validate-skills.mjs (full read); an in-memory link and anchor check over skills/**/*.md, README.md and CLAUDE.md; description length measured per SKILL.md (xy-toolchain 958, xy-agent 681, ariestools-sdk 545, xy-development 198); `grep -rn '](../xy-development/' XYOracleNetwork/xyo-skills/skills`.
  - <sub>ids: arch-layering#24, arch-coverage#9</sub>

- ⚪ **Workspace-wide style rules contradict Layer 1 on return types, `any` and history rewriting**
  - **Now:** The workspace-root CLAUDE.md, under "Style (enforced by ESLint)", says "Explicit return types on exported functions" (:43) and "no `any` (use `unknown` + guards)" (:45). Under commit identity it says "Rewrite an unpushed commit that carries the wrong email" (:56). AGENTS.md:251,253,264 repeat all three.
  - **Actual:** skills/xy-development/typescript.md:23-31 says "Do not annotate return types" except at public API boundaries. The toolchain turns `@typescript-eslint/explicit-module-boundary-types` off (eslint-config-flat/src/typescript/index.ts:101), so "enforced by ESLint" is wrong for return types. typescript.md:7-21 allows `any` as a documented last resort. Because `no-explicit-any` is on through flat/recommended, that use needs an eslint-disable in practice, which makes this conflict milder. git.md:46-62 forbids `--amend`, rebase and any other rewrite, with no exception. In practice CLAUDE.md wins, so nothing breaks.
  - **Fix:** Either have the workspace docs defer to xy-development for language and git conventions and drop the duplicated list, or reconcile the three points: explicit return types only at public package boundaries, `any` only with a justification comment, and a narrowly scoped exception in git.md for fixing commit identity on unpushed commits.
  - **Evidence:** workspace-root CLAUDE.md:43,45,56 and AGENTS.md:251,253,264; skills/xy-development/typescript.md:7-31, git.md:46-62; ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:101,186.
  - <sub>ids: arch-layering#25</sub>

- ⚪ **The scaffold workflow lags the current pnpm line and CI hardening**
  - **Now:** ariestools/toolchain/packages/toolchain/templates/repo/cli/root/github/workflows/build-pnpm.yml.tmpl:1-29 uses `actions/checkout@v4`, `pnpm/action-setup@v4` and `actions/setup-node@v4` with node "22", and runs `pnpm xy build` and `pnpm xy test`. It sets no `permissions`, `concurrency` or `timeout-minutes`. templateVars.ts:10 writes `packageManager: pnpm@11.13.1`.
  - **Actual:** The template meets the public bar that ROADMAP 2.1 defines (pull_request, a frozen lockfile, `xy test` and pinned action versions), which the toolchain's own build.yml also meets. The concrete drift is pnpm: every ariestools repo is on 12.4.2-12.10.1. action-setup v4 cannot bootstrap pnpm 12 on runners without Node on PATH (sdk-js cb8e3150d; the self-hosted verify.yml pins v6.1.0), although it works on GitHub-hosted ubuntu-latest.
  - **Fix:** Move `packageManagerField('pnpm')` to the pnpm 12 line. In the same change, move to `pnpm/action-setup` 6.1.0 or later and update the repoInit spec's v4 assertion. Optionally add `permissions: contents: read` and `node-version-file: package.json`; the latter needs the `--no-monorepo` fix first. Add `xy check` once the AGENTS.md template passes. Do not describe the current template as violating ROADMAP 2.1.
  - **Evidence:** ariestools/toolchain/docs/ROADMAP.md:136; ariestools/toolchain/.github/workflows/build.yml:13-20, verify.yml:9-14,22,30-32; `jq .packageManager` across the six ariestools repos; sdk-js commit cb8e3150d.
  - <sub>ids: gap-gap-ci-guidance#9</sub>
