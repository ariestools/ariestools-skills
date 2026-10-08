---
title: "Skills sync audit 2026-10-08 — architecture"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Partial audit of skill-pack architecture and cross-repo distribution at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.0 (main 7eb43c3c2) and @ariestools/sdk 9.0.1 (298fbb5bb); 23 merged items, 6 verified by two lenses, 17 unverified because the run was paused."
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit — architecture

An auditor checked every item below against the named source commits. Items marked `verified` were also confirmed by two independent verifiers, one reading the code and one reading the skill text. Items marked `unverified` were checked only by the auditor, because the run was paused before verification. Treat them as leads, not facts. None of these changes has been applied to the skills. This is an evidence record, not a remediation plan. Back to the [Audit index](2026-10-08-skills-sync-audit.md).

## Summary

Inside the pack, the layering is sound. Lower layers do not depend on higher ones, and every link and anchor resolves today. The problems are in distribution. `xy-agent` shipped in 0.1.5, but the toolchain catalog, the marketplace metadata, the workspace map and this repo's own docs still describe three skills. The xyo-skills install instructions can overwrite the canonical base skills with redirect stubs. Four published `@ariestools` package families have no skill and no way to get one installed. Both high-severity items are in other repos (xyo-skills, sdk-react). No finding was refuted.

| | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 1 | 0 | 1 | 2 |
| Update | 1 | 7 | 9 | 17 |
| Add | 0 | 3 | 1 | 4 |
| **Total** | **2** | **10** | **11** | **23** |

Status: **6 verified** · **0 partially verified** · **17 unverified**.

## Assessment

The direction of dependency holds inside the pack: each layer links down to the one below and depends on nothing above it. Three seams leak.

1. **The rest of the system does not know about the fourth skill.** `xy-agent` is missing from the toolchain catalog, the marketplace descriptions, the workspace map and the repo's own layer tables. Consumer repos therefore never receive it, and the links to it from Layer 1 are dead there.
2. **"Layer 2" means three different things.** This pack numbers its skills L1–L3. xyo-skills numbers its own stack 1–9. The Definition of Done (DoD) has its own "Layer 1/2/3".
3. **Delivery cannot reach new packages.** Skills reach a repo only through tier detection and a hard-coded set of sdk-js package names. Skills for sdk-react and the actor kits have neither content nor a route into consumer repos, while the `xy.skills` mechanism built for exactly this goes unused.

Legacy copies also escape detection: the xyo-skills stubs at 1.1.38, the `xylabs-*` skills in sdk-react, and the toolchain's local `xy-work`. `xy skills lint` inspects only catalog names, and semver ordering ranks the old 1.x line above 0.1.5.

**Current**

```
ariestools/ariestools-skills @ 7e78933a8 (v0.1.5) — source of truth
  L3  ariestools-sdk       (sdk-js only; sdk-react / actor / cli / browser kits: no skill)
  L2  xy-toolchain
  L1  xy-development ──links──▶ xy-agent   (4th skill: no layer, absent from docs + metadata)
        │ release-please + scripts/marketplace-sync (copies the whole skills/ tree)
        ├──▶ ariestools-claude-plugin ─┐  descriptions name 3 skills
        ├──▶ ariestools-codex-plugin  ─┘
        └──▶ Skills.sh  (npx skills add ariestools/ariestools-skills)
                 │
                 ▼
@ariestools/toolchain 10.1.0 — `xy skills defaults | add | lint --fix`
  catalog ARIESTOOLS_SKILLS = sdk, development, toolchain      ✗ xy-agent
  required by tier (xy/xyo/xl1) + sdk-js package-name set      ✗ other @ariestools kits
  package.json `xy.skills` supported, declared by no package
  version check semver.lt(installed, 0.1.5)  → 1.1.x copies report as current
  lint inspects catalog names only           → xylabs-*, xy-work go unseen
                 │
                 ▼
consuming repos (.agents/skills + skills-lock.json)
  toolchain, sdk-js, sdk-react, actor-kit, browser-kit, cli-kit: 3 skills, no xy-agent
  → xy-development's ../xy-agent link is dead; sdk-react tracks xylabs-* skills;
    toolchain tracks a local xy-work fork

XYOracleNetwork/xyo-skills (downstream domain pack)
  9 xl1-build … 4 xl1-knowledge, 3 xyo-knowledge   ("Layer 3" collides with ariestools-sdk)
  2 xy-toolchain, 1 xy-development = REDIRECT stubs v1.1.38
  imports @ariestools/sdk but never links the ariestools-sdk skill
  links into workflow.md DoD anchors, reuses "Layer 2 — Domain DoD"
  README `npx skills add XYOracleNetwork/xyo-skills --all` ──overwrites──▶ canonical copies
```

**Proposed**

```
ariestools/ariestools-skills
  L3  ariestools-sdk · ariestools-sdk-react (new) · ariestools-actor (new)
  L2  xy-toolchain  — sole owner of xy work / xy plan / "how skills reach a repo"
  L1  xy-development + xy-agent (optional companion, toolchain-agnostic)
      DoD keeps "Layer 1/2/3"; skill text names skills instead of layer numbers;
      DoD Layer 1 points at the xy-toolchain lifecycle gates
  validate-skills.mjs: links, anchors, public-anchor allowlist, description ≤ 1024
        │
        ├──▶ claude / codex plugins (metadata lists every skill)
        └──▶ Skills.sh
                 │
                 ▼
@ariestools/toolchain `xy skills`
  catalog = every ariestools-skills skill (xy-agent optional in every tier)
  producing packages declare `xy.skills` ─▶ lint --fix installs what consumers import
  lint errors on redirect stubs / 1.x copies without a lock entry, and on xylabs-* dirs
                 │
                 ▼
consuming repos — every Related-skills link resolves or names its install command

XYOracleNetwork/xyo-skills
  L4+ xyo-knowledge → xl1-*   (requires L1–L3, including ariestools-sdk)
  installs with explicit --skill selectors; stubs retired; links point at canonical URLs
```

## Layering inside the pack

- 🟠 **`xy-agent` has no place in the layer model, and the pack's own docs still list three skills** · `unverified`
  - **Now:** README.md:7 says "Three skill layers:", and the table at :9-13 has no xy-agent. README.md:19 says "`xy-development` and `xy-toolchain` are owned only here." CLAUDE.md:27-35 has a three-row layer block and "the **only** editable source for those three skills". DEVELOPMENT.md:51 (ownership) and :57-68 (layout tree) omit it.
  - **Actual:** Four skills ship. xy-agent landed in 2d8f995 (2026-09-01), was released in 0.1.5, is listed in release-please-config.json:19 and is asserted by validate-plugins.yml:57. Layer 1 already links to it as "recommended, not required" (skills/xy-development/SKILL.md:33, skills/xy-development/workflow.md:47). Its content does not depend on the toolchain except for the `xy work` / `xy plan` references.
  - **Fix:** Place xy-agent as an **optional Layer-1 companion** of xy-development.
    - README: rename the heading to "Skill layers" and add the row `1 (companion) | xy-agent | AGENTS.md entry point, per-tool adapters, docs/ and papers/ lifecycle, documentation audits (optional)`. Add one sentence: "Higher layers link down; companions never become prerequisites."
    - README:19: list all four skills as owned here.
    - CLAUDE.md: add `Layer 1b: xy-agent/` to the block and change "three" to "four".
    - DEVELOPMENT.md:51 and :57-68: add xy-agent.
    - Move xy-agent's `xy work` rules into xy-toolchain (item below) so the companion has no toolchain dependency.
    - *Contradiction resolved:* two auditors put xy-agent at Layer 2 or "2b" because its audit flow uses `xy work`. Three put it beside Layer 1. Reading the source settles it. Layer 1 links to it (xy-development/SKILL.md:33, workflow.md:47), xy-agent/SKILL.md:18 builds on xy-development only, and its only toolchain coupling is the Related-skills line at :45 plus the `xy work` flow in auditing.md, which the next fix moves out. Layer-1 companion kept.
  - **Evidence:** `git log -- skills/xy-agent`. release-please-config.json:19. .github/workflows/validate-plugins.yml:57-60. README.md:7-19. CLAUDE.md:27-35. DEVELOPMENT.md:49-68. skills/xy-agent/SKILL.md:18,42-45.
  - <sub>ids: skills/xy-agent/SKILL.md#8, arch-layering#2, arch-distribution#10, arch-distribution#15, arch-coverage#8</sub>

- 🟠 **"Layer N" means two things inside xy-development, and the DoD never reaches the xy-toolchain gates** · `verified`
  - **Now:** skills/xy-development/workflow.md:116-118 reads "Layer 1 — Generic DoD … Layer 2 — Domain DoD … Layer 3 — Project-specific acceptance criteria". skills/xy-development/SKILL.md:25 and skills/xy-development/testing.md:3 say "defined in the XY Toolchain skill (Layer 2)". skills/xy-toolchain/testing.md:197 links "`[Layer 1](../xy-development/testing.md)`". The DoD gates are written as `pnpm build`, `pnpm lint` and `pnpm test` (workflow.md:68,73,81).
  - **Actual:** CLAUDE.md:30-32 numbers the skill stack L1 xy-development, L2 xy-toolchain, L3 ariestools-sdk. Downstream xyo-skills uses the DoD meaning ("Layer 2 — This file (dApp DoD)"). In XY repos the generic gates are `pnpm xy build`, `pnpm xy test` and `xy check`, and `xy lint` exits 0 on warnings unless `--strict` is passed. The DoD does not link to any of this.
  - **Fix:** Keep the DoD "Layer 1/2/3" names and headings. Downstream text depends on them, and so do the anchors `#definition-of-done`, `#applying-the-definition-of-done` and `#writing-project-specific-acceptance-criteria`. Stop using layer numbers for skills in skill text:
    - SKILL.md:25 and testing.md:3: change to "defined in the `[xy-toolchain skill](../xy-toolchain/SKILL.md)`".
    - xy-toolchain/testing.md:197: change the link text to "[xy-development testing principles]".
    - In DoD Layer 1 under "Applying the Definition of Done", add: "In `@ariestools/toolchain` repos, items 1–4 are the `[xy-toolchain lifecycle gates](../xy-toolchain/commands.md#lifecycle-gates)` (`pnpm xy build`, `pnpm xy test`, `pnpm xy check`; pass `--strict` so warnings fail)."
    - *Contradiction resolved:* the verified finding proposed renaming the DoD tiers (Gate A–D). The two unverified ones proposed keeping them. Reading the source settles it. xyo-skills repeats the DoD wording in three skills (dapp-checklist.md:8,11; xl1-scaffold/SKILL.md:48,54,245-248; xl1-build/SKILL.md:125,154-160). The skill-stack meaning appears only at xy-development SKILL.md:25 and testing.md:3, plus xy-toolchain/testing.md:197. Renaming the skill-stack references is the smaller edit, stays in one repo, and keeps every anchor the verified finding protects.
  - **Evidence:** README.md:9-13. CLAUDE.md:28-33. skills/xy-toolchain/commands.md:29 ("Do not infer that a zero exit code means zero warnings unless `--strict` was active") and :31-42 (lifecycle gates). skills/xy-toolchain/project-profiles.md:143-152. XYOracleNetwork/xyo-skills/skills/xl1-patterns/dapp-checklist.md:5-11, xl1-scaffold/SKILL.md:243-246, xl1-build/SKILL.md:152-160.
  - <sub>ids: skills/xy-development/workflow.md#7, cov-dev-conventions#23, arch-coverage#10</sub>

- 🟠 **The two packs' layer stacks collide, and xyo-skills leaves ariestools-sdk out** · `unverified`
  - **Now:** README.md:17 says "Those skills depend on this toolchain layer." XYOracleNetwork/xyo-skills/CLAUDE.md:42-50 numbers xyo-knowledge as "Layer 3", sitting on redirect stubs at Layers 1–2. xyo-knowledge/SKILL.md:14 builds on xy-development and xy-toolchain only.
  - **Actual:** In this pack, Layer 3 is ariestools-sdk. xyo-skills imports `zodIsFactory`, `zodAsFactory`, `zodToFactory`, `assertEx` and `BrandedHash` from `@ariestools/sdk`, but no xyo-skills file names the ariestools-sdk skill. The toolchain already auto-requires ariestools-sdk wherever sdk-js packages are imported.
  - **Fix:**
    - In README.md, publish one waterfall that spans both packs: L1 xy-development (+ the xy-agent companion) → L2 xy-toolchain → L3 the `@ariestools` library skills → domain packs.
    - README:17: change to "depend on Layers 1–3".
    - In xyo-skills, number its layers from 4 or switch to named layers, and list ariestools-sdk as a required companion in README.md:9-19.
    - Add an `[ariestools-sdk](../ariestools-sdk/SKILL.md)` link to xyo-knowledge/SKILL.md:14 and to the Related-skills lists of xl1-knowledge, xl1-patterns and xl1-testing.
  - **Evidence:** XYOracleNetwork/xyo-skills/skills/xyo-knowledge/primitives.md:36,64-65. xl1-knowledge/development.md:52. xl1-patterns/commit-reveal.md:39. xl1-testing/headless-testnet-verification.md:122. `grep -rn '@ariestools/sdk' XYOracleNetwork/xyo-skills/skills` finds 12 hits outside the stubs; `grep ariestools-sdk` finds none. ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:57-69,99-120.
  - <sub>ids: arch-layering#4, arch-distribution#17</sub>

- 🟠 **`xy work` usage rules have three owners that disagree on claiming** · `unverified`
  - **Now:** skills/xy-toolchain/commands.md:185-186 shows `pnpm xy work next --claim` and `pnpm xy work claim <id>` with no caveat. skills/xy-agent/auditing.md:109 says ".xy/work/ is a durable backlog, not a live coordination plane … do not claim work there". auditing.md:102-103 tells agents to pass a stable id and to suppress the GitHub dual-write for each item. ariestools/toolchain/.agents/skills/xy-work/SKILL.md:22,146-149 says to claim the next item before implementing.
  - **Actual:** `claimItem` overwrites the item JSON without a lock, lease or compare-and-swap, so xy-agent's warning holds for concurrent worktrees. `xy work add` has no `--id` flag and no per-item GitHub opt-out. Only the programmatic API accepts `id`, and dual-write is controlled only by `stores.github.enabled`. `xy work` is experimental ("prefer xyex").
  - **Fix:** Make commands.md#skills-and-work-tracking the single owner of these rules. Mark the command as `xyex work` (experimental). Add: "claim is non-atomic — use it only in single-agent, single-worktree flows; across worktrees, queue instead of claiming." Move xy-agent's rules for machine-generated items there, rewritten to match the real CLI: for stable ids, set `stores.github.enabled: false` in config or use the programmatic API, because there is no `--id` flag. Then replace skills/xy-agent/auditing.md:100-109 with a link plus the batching advice that is specific to documentation.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/helpers.ts:56-69 and work/index.ts:104,171. `node xy.mjs work add --help` lists no `--id` or `--no-github`. `node xy.mjs work --help` prints "(experimental — prefer xyex)". `xy.mjs --stability --json` reports `work` as experimental.
  - <sub>ids: arch-coverage#6</sub>

- ⚪ **sdk-js maintainer workflow sits in the consumer-facing Layer-3 skill, and sdk-js's own agent docs are stale** · `unverified`
  - **Now:** skills/ariestools-sdk/conventions.md:33-46 contains a "When working **inside** `sdk-js` itself" command block and a "Monolith layout (maintainers)" section.
  - **Actual:** Monolith mode is already documented generically at skills/xy-toolchain/compilation.md:95-110 (`#monolith-mode`). An agent working inside sdk-js also reads sdk-js's own docs, and they contradict the skill. CLAUDE.md and AGENTS.md there still name `@ariestools/mongo`, `indexed-db`, `vitest-extended` and `vitest-matchers`, "~53 TypeScript packages (`@xylabs/*`)", and a single dist/neutral exports map. The sdk README states a Node 18.17.1+ baseline and documents `sdkModules`, and crypto-auth's README states Node >= 18, while the engines field requires >= 26.
  - **Fix:**
    - Cut the maintainer block to one line: "Working inside sdk-js: follow that repo's AGENTS.md; monolith mechanics are in `[xy-toolchain compilation](../xy-toolchain/compilation.md#monolith-mode)`."
    - Open an sdk-js docs follow-up. Refresh CLAUDE.md and AGENTS.md to the 11 published packages, state Node >= 26, fix the sdk README's Node baseline and monolithic-layout sections, and point those files at the ariestools-sdk skill.
  - **Evidence:** ariestools/sdk-js/CLAUDE.md:7,57,61,67,70. ariestools/sdk-js/AGENTS.md:3,26,65,68. ariestools/sdk-js/packages/sdk/README.md:198,222-224. ariestools/sdk-js/packages/crypto-auth/README.md:14. `engines` in ariestools/sdk-js/packages/*/package.json.
  - <sub>ids: skills/ariestools-sdk/conventions.md#14, cov-sdk-specialist#19</sub>

- ⚪ **ariestools-sdk's wording suggests it covers `@ariestools` packages it does not document** · `verified`
  - **Now:** skills/ariestools-sdk/packages.md:3 reads "These packages live in the same `sdk-js` monorepo (or closely related Aries Tools packages)…". The description at skills/ariestools-sdk/SKILL.md:3 reads "Use when importing or choosing @ariestools/* utilities".
  - **Actual:** Every package in packages.md comes from sdk-js. sdk-react 12.0.1, actor-kit 2.0.0, browser-kit 2.0.0 and cli-kit 2.1.0 are all published, and nothing in this repo mentions them. The verifier noted that the SKILL.md description is what draws agents into this skill, so the out-of-scope note belongs there.
  - **Fix:**
    - packages.md:3: drop the parenthetical.
    - SKILL.md:3: narrow "@ariestools/* utilities" to the sdk-js packages.
    - SKILL.md body: add one line, "Not covered: @ariestools/sdk-react-*, actor-kit (actor/provider), browser-kit and cli-kit." Remove it once the skills proposed below exist.
  - **Evidence:** ls ariestools/sdk-js/packages. ls ariestools/{sdk-react,actor-kit,browser-kit,cli-kit}/packages. A grep of skills/, README.md and scripts/ for those family names returns nothing.
  - <sub>ids: skills/ariestools-sdk/packages.md#14</sub>

## Cross-repo distribution

- 🔴 **xyo-skills install docs use `--all`, which overwrites canonical xy-development and xy-toolchain with redirect stubs** · `unverified`
  - **Now:** XYOracleNetwork/xyo-skills/README.md:145-147 runs `npx skills add ariestools/ariestools-skills --all` and then `npx skills add XYOracleNetwork/xyo-skills --all`. The same pattern appears at :158 (`-g`) and :166 (`--copy`). :23 calls ariestools-skills the "Required companion".
  - **Actual:**
    - xyo-skills still ships xy-development and xy-toolchain as redirect stubs (`metadata.status: redirect`, v1.1.38).
    - Skills.sh cleans each skill's install directory before writing it, so the second command replaces the canonical copies with the stubs.
    - skills-lock.json then records XYOracleNetwork/xyo-skills as the source, and `xy skills lint` (part of `xy check`) fails `skills.migrated-source`.
    - The xyo-skills marketplace renderers copy its whole skills/ tree, so anyone with both plugins installed gets two skills named xy-development and two named xy-toolchain.
    - The toolchain's own `xy skills defaults` avoids all of this by passing explicit `--skill` selectors.
  - **Fix:**
    - In xyo-skills/README.md, replace each `XYOracleNetwork/xyo-skills --all` with explicit selectors (`--skill xyo-knowledge --skill xl1-knowledge --skill xl1-patterns --skill xl1-testing --skill xl1-dapp-kit --skill xl1-scaffold --skill xl1-build`), or with `pnpm xy skills defaults`. Add the ordering rule: install ariestools-skills last.
    - Then retire the stubs. Every anchor that links into them also exists in canonical workflow.md (:63, :112, :124). Rewrite the xl1-* links as absolute ariestools-skills URLs, delete the stubs, and remove them from the stub allowlist at xyo-skills/scripts/validate-skills.mjs:70-73.
  - **Evidence:** XYOracleNetwork/xyo-skills/README.md:147,158,166. XYOracleNetwork/xyo-skills/skills/xy-development/SKILL.md:1-12. ariestools/toolchain/packages/toolchain/node_modules/skills/dist/cli.mjs:2274-2324 (`installSkillForAgent` → `cleanAndCreateDirectory(canonicalDir)`). `xy skills --help` documents "--all  Shorthand for --skill '*' --agent '*' -y". ariestools/toolchain/packages/toolchain/src/actions/skills/lock.ts:75-92, lint.ts:364-388 and defaults.ts:67-74. XYOracleNetwork/xyo-skills/scripts/marketplace-sync/build-claude.mjs:7-8.
  - <sub>ids: arch-distribution#0</sub>

- 🔴 **sdk-react tracks legacy `xylabs-*` skills that describe the retired yarn toolchain** · `unverified`
  - **Now:** ariestools/sdk-react/.agents/skills/xylabs-xy-cli/SKILL.md:4 reads "Comprehensive reference for the `xy` CLI provided by `@xylabs/ts-scripts-yarn3`". Its description claims every build, lint and test question, and :105-112 list `xy upyarn`, `xy upplug` and `xy yarn3only`. `xylabs-e2e-setup` and `xylabs-xy-deplint-fix` are also tracked. Gitignored `.claude/skills/xylabs-*` copies and `.claude/rules/xylabs-*.md` files exist alongside them.
  - **Actual:** sdk-react uses pnpm and @ariestools/toolchain 10.x. `xy yarn3only` and `xy upyarn` both print "Command not found". The xylabs-* skills are not in sdk-react/skills-lock.json. `xy skills lint` inspects only catalog names, so `xy check` never flags them, and their broad description competes with xy-toolchain.
  - **Fix:**
    - Delete sdk-react/.agents/skills/xylabs-{xy-cli,e2e-setup,xy-deplint-fix} and the local `.claude/skills/xylabs-*` and `.claude/rules/xylabs-*.md` files.
    - In the toolchain, add a `skills.legacy-installed` rule to `xy skills lint` (error, fixable by removal) that flags `xylabs-*` skill directories and generated `.claude/rules/xylabs-*.md`.
    - If the e2e-setup content is still wanted, port a pnpm / `@ariestools` version into skills/xy-toolchain/testing.md.
  - **Evidence:** `git -C ariestools/sdk-react ls-files .agents/skills/xylabs-*` lists 3 files. ariestools/sdk-react/skills-lock.json. `node packages/toolchain/dist/bin/xy.mjs yarn3only` and `… upyarn` both print "Command not found". ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:141-152.
  - <sub>ids: arch-distribution#1</sub>

- 🟠 **The toolchain's skill catalog does not know `xy-agent`** · `verified`
  - **Now:** ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:13-17 sets `ARIESTOOLS_SKILLS = ['ariestools-sdk', 'xy-development', 'xy-toolchain']`, and the comment at :4 names the same three. So do the `xy skills defaults --help` text, repo-init/skillsInstall.ts:34, docs/STABILITY.md:72 and the toolchain README.md:88-92. On the skill side, skills/xy-toolchain/commands.md:171 says "Use `xy skills lint --fix` to install missing profile-required skills".
  - **Actual:** Confirmed at v10.1.0. The commits on main after the tag do not touch `src/actions/skills`. Because the catalog omits xy-agent:
    1. `commands.skillsLint.additionalSkills: ['xy-agent']` throws "Unknown skills…".
    2. `skillSourceForName('xy-agent')` returns XYOracleNetwork/xyo-skills, which has no xy-agent.
    3. A package.json `xy.skills` entry for it needs an explicit `source`.
    4. Its version is never checked.

    Only `xy skills defaults`, which installs from ariestools-skills with `--all`, ever installs it. None of the six `@ariestools` repos (toolchain, sdk-js, sdk-react, actor-kit, browser-kit, cli-kit) lists it in skills-lock.json.
  - **Fix:** In the toolchain:
    - Add `'xy-agent'` to `ARIESTOOLS_SKILLS`, and to `SKILL_ORDER` after xy-development. That list only sets sort order, and this position matches the Layer-1 companion placement. Auditors also proposed placing it after xy-toolchain or after ariestools-sdk.
    - Return it as optional for every tier except `'none'`, so `additionalSkills` accepts it and it is never reported as unnecessary. Keep it out of the required set, since it is "recommended, not required".
    - Derive repo-init's skill names from `ARIESTOOLS_SKILLS` instead of the literal list.
    - Update the defaults.ts:4 comment, the defaults help text, STABILITY.md:72 and the README "Agent skills" section.
    - Give any new Layer-3 skill the same treatment.

    Once the change is released, note in commands.md that xy-agent comes from ariestools/ariestools-skills. *Severity:* the verifiers rated this low, because no skill tells an agent to run a command that fails. Six auditors rated it medium because of the effect on every consumer repo (see the dead-link item). Medium kept here.
  - **Evidence:** In ariestools/toolchain/packages/toolchain/src/actions/skills/: defaults.ts:3-17,68-73,84-86; skillRules.ts:24,80-97; packageSkills.ts:115-141; lint.ts:214-223; versions.ts:8-10. Also ariestools/toolchain/packages/toolchain/src/xy/common/skills/index.ts:13-18. `ls XYOracleNetwork/xyo-skills/skills` shows no xy-agent. ariestools/toolchain/.xy/work/items/XYW-20260901-263436.json already notes that "The skill also needs registering in src/actions/skills/defaults.ts".
  - <sub>ids: skills/xy-toolchain/commands.md#12, skills/xy-agent/SKILL.md#7, cov-agent-docs#16, cov-toolchain-history#30, arch-layering#3, arch-distribution#3, arch-coverage#3</sub>

- 🟠 **Nothing installs Layer-3 skills where they are needed: `xy.skills` is unused and undocumented** · `unverified`
  - **Now:** skills/xy-toolchain/commands.md:163 (the `xy skills lint` row) and :171 ("Use `xy skills lint --fix` to install missing profile-required skills") do not mention tier detection, `commands.skillsLint.additionalSkills`, or the package.json `xy.skills` field.
  - **Actual:** Since toolchain 10.0.8 (881eede39), a package can recommend skills to its consumers through `xy.skills`. The `skills.package-recommended` rule reads it from workspace packages and direct dependencies, and `--fix` installs whatever is missing. A skill outside the catalog needs a `source`. Recommended skills are exempt from the "unnecessary" warning. No producing package declares `xy.skills`. Without it, a skill reaches a repo only through tier detection and the sdk-js package-name set.
  - **Fix:** Add a "How skills reach a repo" subsection under commands.md#skills-and-work-tracking. Cover tier detection, the sdk-js and dapp-kit triggers, `additionalSkills`, and `xy.skills` with its source rule, reusing the JSON example from the toolchain's xy-config.md. Then use `xy.skills` to deliver Layer 3:
    - `@ariestools/sdk*` packages declare `ariestools-sdk`.
    - `@ariestools/sdk-react*` packages declare `ariestools-sdk-react`.
    - actor-kit, cli-kit and browser-kit packages declare `ariestools-actor` with `source: 'ariestools/ariestools-skills'` until the catalog knows it.
  - **Evidence:** ariestools/toolchain/docs/xy-config.md (Skills lint section). ariestools/toolchain/packages/toolchain/src/actions/skills/packageSkills.ts:295-305, lint.ts:476-495 and detectProfile.ts:26-40. `git tag --contains 881eede39` lists v10.0.8, v10.0.9 and v10.1.0. Every packages/*/package.json in sdk-js, sdk-react, actor-kit, browser-kit, cli-kit and toolchain shows `xy: undefined`.
  - <sub>ids: arch-coverage#4</sub>

- 🟠 **Workspace-root instruction files contradict the skills on tsup, return types, `any` and history rewriting** · `unverified`
  - **Now:** The workspace-root CLAUDE.md:28 and AGENTS.md:236 say "`pnpm xy compile` — TypeScript compile only (tsup; …)". CLAUDE.md:43 says "Explicit return types on exported functions", :45 says "no `any`", and :56 says "Rewrite an unpushed commit that carries the wrong email". The same rules appear at AGENTS.md:251,253,264.
  - **Actual:**
    - Consumer emit uses esbuild. ariestools/toolchain/AGENTS.md says "Do not describe the compiler as tsup", and architecture.md:40 agrees.
    - skills/xy-development/typescript.md:23-31 says not to annotate return types except at public API boundaries, and the toolchain's ESLint turns `explicit-module-boundary-types` off.
    - typescript.md:7-21 allows `any` as a documented last resort.
    - git.md:50-55 forbids amend, rebase and any rewrite.

    The workspace file is loaded above every skill and declares that it overrides default behavior, so every session gets both sets of instructions.
  - **Fix:** Have the workspace files defer to xy-development and xy-toolchain for language, git and compile details, and drop the duplicated lists. Otherwise, reconcile each point:
    - Compile: "esbuild via `xy.config.ts` compile modes; outputs dist/neutral|browser|node".
    - Return types: explicit only at public package boundaries.
    - `any`: only with a justification comment.
    - History: a narrow exception, written into git.md, for fixing commit identity on unpushed commits.

    Also consider dropping `npx tsup:*` from the pre-allowed command examples.
  - **Evidence:** Workspace-root CLAUDE.md:28,43,45,56 and AGENTS.md:236,251,253,264. ariestools/toolchain/AGENTS.md (Architecture section). ariestools/toolchain/architecture.md:40. skills/xy-development/typescript.md:7-31. skills/xy-development/git.md:46-62. ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:101.
  - <sub>ids: arch-distribution#13, arch-layering#25</sub>

- 🟠 **Marketplace metadata omits `xy-agent`** · `unverified`
  - **Now:** scripts/marketplace-sync/metadata.json:5 (description), :7 (longDescription, which names only xy-development, xy-toolchain and ariestools-sdk), :8-16 (keywords) and :36-41 (defaultPrompts) never mention documentation conventions.
  - **Actual:** build-claude.mjs:7-8 and build-codex.mjs:10 copy the whole skills/ tree, so xy-agent ships in both plugins. But the Claude plugin.json and marketplace.json descriptions, and the Codex `interface.longDescription` and `defaultPrompt` (build-codex.mjs:39-48), never mention it, so marketplace users cannot find it.
  - **Fix:**
    - description and shortDescription: append "and repository documentation conventions for agents (AGENTS.md, docs/papers lifecycle)".
    - longDescription: add "(xy-agent)".
    - keywords: add `agents-md` and `documentation`.
    - defaultPrompts: add "Audit this repo's AGENTS.md and docs/ for stale guidance".
  - **Evidence:** scripts/marketplace-sync/metadata.json:5-16,36-41. scripts/marketplace-sync/build-claude.mjs:13-43. scripts/marketplace-sync/build-codex.mjs:29-51.
  - <sub>ids: arch-distribution#11</sub>

- ⚪ **The version check treats xyo-skills 1.1.x copies as newer than canonical 0.1.x** · `verified`
  - **Now:** Absent from the skills. The identity example at skills/xy-development/SKILL.md:14, "`xy-development v1.1.19`", still uses the old numbering.
  - **Actual:** `isSkillVersionOutdated` returns `semver.lt(installed, latest)`, and `latest` comes from ariestools-skills main, at 0.1.5. Pre-migration full copies (1.1.30) and redirect stubs (1.1.38) therefore count as current and print with ✔. Only `skills.migrated-source` catches them, and only when skills-lock.json has an entry for them. The verifiers found ten repos where the lock entry catches the stale copy. They found one concrete miss: XYOracleNetwork/xyo-robot-provenance-demo has xy-development v1.1.21 and no skills-lock.json.
  - **Fix:**
    - In `xy skills lint`, treat a migrated skill as unmigrated (an error, fixed by reinstalling from `ARIESTOOLS_SKILLS_SOURCE`) when its SKILL.md has `metadata.status: redirect` or `canonical:`, or when its major version is above the canonical major. This applies even when there is no lock entry.
    - Alternatively, release ariestools-skills as 2.0.0 (release-please `release-as`) so canonical versions sort above every 1.1.x copy.
    - Change the SKILL.md:14 example to a 0.x version.
    - *Severity:* the verifiers judged low proportionate, since only installs without a lock entry are exposed. One auditor rated it medium.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/versions.ts:8-10,59-69, lint.ts:143-176,421-426 and lock.ts:75-89. Importing versions.ts in node gives `isSkillVersionOutdated('1.1.30','0.1.5')` → false and `('1.1.38','0.1.5')` → false. XYOracleNetwork/xyo-skills/skills/xy-development/SKILL.md:9 has version 1.1.38.
  - <sub>ids: skills/xy-development/SKILL.md#7, arch-distribution#4</sub>

- ⚪ **The toolchain repo carries an unpublished local `xy-work` skill that forks xy-toolchain's `xy work` docs** · `unverified`
  - **Now:** ariestools/toolchain/.agents/skills/xy-work/SKILL.md is 173 lines, at v0.1.0, last edited in 4ab4fbe3a (2026-07-23). It is tracked in git but not in skills-lock.json, and it is not symlinked into .claude/skills, so only Codex sees it. Its description reads "Use when a user asks Codex to report, capture, triage…", and it never mentions experimental status or xyex.
  - **Actual:** skills/xy-toolchain/commands.md:169-249 already covers `xy work`, and the local copy contradicts xy-agent on claiming. Its unique content is the item-type guidance (:165-173), the core capture rules (:12-22) and the work-lint rule ids `work.store-not-gitignored`, `work.github-available` and `work.github-synced`. One auditor also found `work add` flags and priority fields (:24-55, :112-136) that commands.md lacks. Keeping two sources of truth breaks the "edit only in ariestools-skills" rule.
  - **Fix:** Keep `xy work` as a section of xy-toolchain (Layer 2), not a separate skill. Fold the unique parts into commands.md#skills-and-work-tracking, written as `xyex work`. Then delete toolchain/.agents/skills/xy-work, or reduce it to a redirect stub. Revisit a separate skill only if the xy-toolchain description budget forces a split.
  - **Evidence:** `git -C ariestools/toolchain ls-files .agents/skills/xy-work`. ariestools/toolchain/skills-lock.json (lists only xy-development and xy-toolchain). `ls -la ariestools/toolchain/.claude/skills`. `xy work lint --rules`. ariestools/toolchain/packages/toolchain/src/xy/stability.ts:68 (`'work': 'experimental'`). ariestools/toolchain/docs/SKILLS-FOLLOWUP.md:8.
  - <sub>ids: cov-toolchain-history#31, arch-distribution#16, arch-coverage#7</sub>

- ⚪ **The workspace map omits ariestools-skills and lists a nonexistent repo and a retired package** · `unverified`
  - **Now:** The "Agent skills" table at workspace-root AGENTS.md:153-158 lists only `XYOracleNetwork/xl1-skills` and `XYOracleNetwork/xyo-skills`. The ariestools/ section (:59-74) has no skills row. :64 lists `actor-cli` among the actor-kit outputs, and :244 names the legacy `xylabs-xy-cli` skill.
  - **Actual:** ariestools/ariestools-skills is in GitHub.code-workspace:44-45 and is the canonical source of the base skills. XYOracleNetwork/xyo-skills is not, and XYOracleNetwork/xl1-skills does not exist on disk or in the workspace file. `@ariestools/actor-cli` is retired and deprecated on npm. actor-kit 2.0 publishes actor-engine, plus actor-system as a deprecated alias.
  - **Fix:**
    - Add an ariestools-skills row: outputs xy-development, xy-toolchain, xy-agent and ariestools-sdk, mirrored to ariestools-claude-plugin and ariestools-codex-plugin.
    - Remove or fix the xl1-skills row, and mark xyo-skills as owning xyo-knowledge and xl1-* only.
    - Fix the actor-kit row: name actor-engine, mark actor-system as deprecated, and drop actor-cli.
    - Point :244 at xy-toolchain.
  - **Evidence:** `grep -n ariestools-skills AGENTS.md` at the workspace root finds nothing. GitHub.code-workspace:44-45. `ls XYOracleNetwork/xl1-skills` reports no such directory. ariestools/actor-kit/README.md:14-21,43-46. `npm view @ariestools/actor-cli deprecated`.
  - <sub>ids: arch-distribution#18, arch-coverage#14</sub>

## Coverage gaps — skills to add

- 🟠 **Add `ariestools-actor` for actor-kit, cli-kit and browser-kit** · `unverified`
  - **Now:** Absent. Nothing in skills/ mentions `@ariestools/actor*`, `provider*`, cli-kit, browser-kit or `@ariestools/cli`. Meanwhile, XYOracleNetwork/xyo-skills/skills/xl1-knowledge/gateway-browser.md:37-42,221 sends agents to `bindPageLifecycle` (`@ariestools/browser-kit-page`) and `bindWorkerShutdown` (`@ariestools/browser-kit-worker`), and xl1-testing/local-chain-datalake.md:41 says `pnpm add -D @ariestools/cli`.
  - **Actual:**
    - actor-kit 2.0.0 publishes actor, actor-model, actor-engine, provider and provider-model, plus actor-system as a deprecated alias of actor-engine.
    - cli-kit 2.1.0 (cli-kit, -node, -yargs, -daemon) and browser-kit 2.0.0 (browser-kit, -page, -worker, -service-worker, -plugin) adapt that engine to their hosts. Both still import the deprecated actor-system (20 imports) and declare it as a peer.
    - actor-cli is retired. ARCHITECTURE.md says `runActorOnce`, `runActorsService` and `buildCatalogActors` "move to cli-kit", but none of them exists in cli-kit 2.1.0.
    - Across the workspace, 24 repos use the actor family, 15 use cli-kit and 6 use browser-kit.
    - `@ariestools/cli` 0.2.0 is also published.
    - No kit package declares `xy.skills`, and toolchain detection covers sdk-js only.
  - **Fix:** Create one Layer-3 skill, `skills/ariestools-actor/`, that builds on ariestools-sdk and xy-toolchain. Use one skill rather than three, because both host kits are thin facades over actor-engine. Files:
    - `SKILL.md`: a router that triggers on actors, providers, CLI process shells, yargs, daemons, and browser page, worker, service-worker and extension realms.
    - `overview.md`: the package map, SDK peer ranges, Node 26.
    - `actors.md`, `providers.md`, `engine.md`.
    - `cli.md`: also decide whether `@ariestools/cli` belongs here.
    - `browser.md`.
    - `migration.md`: the actor-system → actor-engine renames, the fact that host kits 2.x still peer on actor-system, and an actor-cli retirement table noting that its cli-kit replacements are not shipped.

    Keep XL1 specializations in xyo-skills, and link xl1-knowledge/gateway-browser.md to the new skill. Split out `ariestools-cli` if cli.md grows past about 150 lines. Deliver the skill through `xy.skills` and the toolchain catalog (see the items above). *Placement resolved:* one auditor proposed Layer 4, another proposed a single `ariestools-kits` skill or a reference file inside ariestools-sdk, and a third proposed this Layer-3 skill. Layer 3 is kept so that domain packs start at Layer 4, matching the cross-pack waterfall. It stays separate from sdk-react because the two serve different consumers: process and realm hosts versus React UI.
  - **Evidence:** ariestools/actor-kit/README.md:3-10,21,43-46. ariestools/actor-kit/packages/actor-system/src/index.ts:1-9. ariestools/actor-kit/ARCHITECTURE.md:267-289. ariestools/browser-kit/packages/browser-kit/package.json:73 and ariestools/cli-kit/packages/cli-kit/package.json:65 (peer ranges). `grep -rhoE "from '@ariestools/actor[a-z-]*'" cli-kit/packages browser-kit/packages`. `npm view @ariestools/actor-cli deprecated`. `npm view` versions for actor, browser-kit, cli-kit and cli. ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-40.
  - <sub>ids: arch-coverage#2, arch-layering#5, arch-distribution#9</sub>

- 🟠 **Add `ariestools-sdk-react` for @ariestools/sdk-react 12.x** · `unverified`
  - **Now:** Absent. No skill mentions `@ariestools/sdk-react`. React, MUI and Storybook appear only in toolchain profile, ESLint and tsconfig docs (skills/xy-toolchain/project-profiles.md:47,51; eslint.md:14,70; typescript.md:9).
  - **Actual:**
    - sdk-react 12.0.1 publishes 11 packages: the umbrella `@ariestools/sdk-react` (about 32 subpaths); `-foundation`, `-ui`, `-app`, `-analytics`, `-crypto`, `-identicon`, `-json-viewer`, `-motion` and `-number-status`; and `-core`, which is deprecated on npm.
    - Peers: react ^19.3, @mui/material ^9.4, react-router ^8.4, ethers ^6.17, @ariestools/pixel ^9.0 and @ariestools/eth-address ^9.0.
    - 16 workspace repos depend on it.
    - The repo's own AGENTS.md is stale (`@xylabs/react-*`, yarn, `cd packages/<name> && yarn xy compile`). The authoritative ownership map is in packages/sdk/README.md.
  - **Fix:** Create `skills/ariestools-sdk-react/` at Layer 3, as a sibling of ariestools-sdk. It builds on xy-toolchain (React profile, eslint-config-react-flat, tsconfig-react) and on ariestools-sdk. Files:
    - `SKILL.md`: router.
    - `overview.md`: umbrella versus focused packages (apps may use the umbrella; libraries install the smallest owning package), and the peer matrix.
    - `packages.md`: the ownership table and the subpath catalog.
    - `patterns.md`: Context.ts + Provider.tsx + useX hook, MUI prop intersection types, `useAsyncEffect` / `usePromise`, `ErrorBoundary` / `ErrorReporter`, and colocated stories.
    - `migration.md`: the `@xylabs/react-*` → `@ariestools/sdk-react-*` mapping and the sdk-react-core deprecation.

    Add the skill to release-please-config.json extra-files, validate-plugins.yml and the README layer table. Upstream, fix sdk-react/AGENTS.md: xy-agent tells agents that a repo's own AGENTS.md wins, so the stale file would override the skill.
  - **Evidence:** A node dump of ariestools/sdk-react/packages/*/package.json (names, versions, peers, export counts). `npm view @ariestools/sdk-react-core deprecated`. ariestools/sdk-react/packages/sdk/README.md. ariestools/sdk-react/AGENTS.md:10,15-26,32. A workspace grep of package.json dependencies finds 16 dependent repos and 68 colocated `*.stories.tsx` files.
  - <sub>ids: arch-coverage#1, arch-layering#5, arch-distribution#9</sub>

## Link and consistency integrity

- ⚪ **ariestools-skills breaks its own xy-agent rule for the AGENTS.md entry point** · `unverified`
  - **Now:** AGENTS.md:1 is `# AGENTS.md`. AGENTS.md:3 says "Same guidance as `[CLAUDE.md](./CLAUDE.md)`. Prefer that file for the full distribution and release model." AGENTS.md:5 says "This repo owns: `xy-development`, `xy-toolchain`, and `ariestools-sdk`". CLAUDE.md holds the full 70 lines under the H1 `# CLAUDE.md`, with no `@AGENTS.md` import.
  - **Actual:** xy-agent requires the opposite. AGENTS.md is canonical, CLAUDE.md is an `@AGENTS.md` import, "A prose pointer is not good enough", and the H1 names the product, not the file (skills/xy-agent/agents-md.md:98-118,138-142). structure.md:6-7 calls the import "required, not optional". The toolchain enforces the same rule as `plan.root.claude-imports-agents`. Codex and Copilot users of this repo see only the 7-line pointer.
  - **Fix:** Move the CLAUDE.md body into AGENTS.md under `# Aries Tools skills agent guidance` and add xy-agent to the list of owned skills. Reduce CLAUDE.md to the template from skills/xy-agent/templates.md:68: an HTML comment plus `@AGENTS.md`, with any Claude-only notes.
  - **Evidence:** AGENTS.md:1-7. CLAUDE.md:1-70. skills/xy-agent/agents-md.md:98-142. skills/xy-agent/structure.md:6-7. ariestools/toolchain/docs/repo-docs.md:20-31. `xy.mjs plan lint --rules`.
  - <sub>ids: skills/xy-agent/agents-md.md#13, cov-agent-docs#24, arch-layering#23, arch-distribution#19</sub>

- ⚪ **Cross-skill links are dead when only the required skills are installed** · `unverified`
  - **Now:** skills/xy-development/SKILL.md:33 and workflow.md:47 link to `../xy-agent/SKILL.md`. skills/xy-toolchain/SKILL.md:50 links to `../ariestools-sdk/SKILL.md`.
  - **Actual:** For tier `xy`, `xy skills lint` requires only xy-development and xy-toolchain. In the toolchain repo, the installed xy-development/SKILL.md:33 therefore points at a missing `../xy-agent/`, and the installed xy-toolchain:50 points at an ariestools-sdk that is not installed. No `@ariestools` repo lists xy-agent in skills-lock.json, so the xy-agent link is dead in all of them.
  - **Fix:** Write each Related-skills entry as "name — purpose (install: `npx skills add ariestools/ariestools-skills --skill <name>`, or `pnpm xy skills add …` in XY repos)", so that a missing target tells the reader what to do. Treat these links as navigation only, never as a dependency of a lower layer. Pair this with the catalog fix above.
  - **Evidence:** `ls ariestools/toolchain/.agents/skills` shows xy-development, xy-toolchain and xy-work. ariestools/toolchain/skills-lock.json. ariestools/toolchain/.agents/skills/xy-development/SKILL.md:33. ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:57,65-69.
  - <sub>ids: arch-layering#17 (the dead-link consequence is also raised in cov-agent-docs#16)</sub>

- ⚪ **xy-toolchain's Related skills omit xy-agent, so the link runs one way only** · `verified`
  - **Now:** skills/xy-toolchain/SKILL.md:48-51 lists only ariestools-sdk and xyo-skills, while skills/xy-agent/SKILL.md:45 links to xy-toolchain.
  - **Actual:** Nothing under skills/xy-toolchain/ mentions xy-agent. A separate conflict sits next to this one. `xyex plan lint` allows only `papers/{README,WHITE-PAPER,YELLOW-PAPER,GREEN-PAPER}.md`, and its fixable rule `plan.papers.unexpected-files` moves any other paper file into notes/. skills/xy-agent/structure.md:50 instead prescribes `<PRODUCT>_{WHITE,YELLOW,GREEN,LIGHT}_PAPER.md`, and agents-md.md:31 uses `papers/X_YELLOW_PAPER.md`. Only the experimental `xyex plan lint` enforces the allowlist; `xy check` does not run it.
  - **Fix:** Add to the Related skills list: "**`[xy-agent](../xy-agent/SKILL.md)`** — repository documentation conventions (AGENTS.md, papers/docs/notes layout); the experimental `xyex plan lint` enforces a papers/ layout." Track the paper-naming conflict as a separate medium xy-agent item: either align structure.md:50 and agents-md.md:31 with the plan-lint names, or document the divergence. The verifier split it out of this one-line router change.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/plan/lint.ts:27-42 (paper allowlists) and :478-489 (`plan.papers.unexpected-files`). ariestools/toolchain/CHANGELOG.md:16,30. skills/xy-agent/structure.md:50. skills/xy-agent/agents-md.md:31.
  - <sub>ids: skills/xy-toolchain/SKILL.md#3</sub>

- ⚪ **CI validates only frontmatter, leaving links, anchors, description length and downstream anchors unchecked** · `unverified`
  - **Now:** scripts/validate-skills.mjs:10-107 checks the directory name, symlinks, the presence of `name` and `description` (`REQUIRED_FIELDS` at :11), and that the name matches the directory. validate-plugins.yml:47-61 checks the shape of the rendered tree.
  - **Actual:** Today all 25 skill files and 4 repo docs resolve (the auditor's link and anchor check found 0 problems), but nothing prevents a regression. xyo-skills deep-links `workflow.md#writing-project-specific-acceptance-criteria`, `#applying-the-definition-of-done`, `#definition-of-done` and `xy-toolchain/testing.md`, so renaming a heading would silently break that pack. The 1024-character description limit is not enforced either.
  - **Fix:** Extend validate-skills.mjs to:
    - resolve relative links and GitHub-style anchors under skills/;
    - fail on descriptions over 1024 characters, and warn above 900;
    - keep an allowlist of public anchors (the three workflow.md headings and the testing.md path) that must keep existing.

    Record that anchor contract in the repo's agent guidance (CLAUDE.md, or AGENTS.md after the move above).
  - **Evidence:** scripts/validate-skills.mjs. .github/workflows/validate-plugins.yml:47-61. XYOracleNetwork/xyo-skills/skills/xl1-build/SKILL.md:123,152,155, xl1-patterns/dapp-checklist.md:5,9 and xl1-scaffold/SKILL.md:59,243.
  - <sub>ids: arch-layering#24</sub>

- ⚪ **xy-toolchain's description uses 958 of its 1024 characters** · `unverified`
  - **Now:** The description at skills/xy-toolchain/SKILL.md:3 lists features in detail, for example "with optional GitHub Issues dual-write/sync and multi-folder workspace scope, and configurable clean (including --full hygiene)".
  - **Actual:** Planned additions will push it past the Agent Skills limit: the xy vs xyex stability split (per ariestools/toolchain/docs/SKILLS-FOLLOWUP.md), `xy plan`, and `xy.skills` distribution. Current description lengths: xy-toolchain 958, xy-agent 681, ariestools-sdk 545, xy-development 198.
  - **Fix:** Trim the description to trigger terms only: xy CLI, build/lint/test, configs, deplint, publint, policy, skills, work. Move the feature detail into the router body. The length check itself belongs in the validator item above.
  - **Evidence:** Node measurement of each SKILL.md `description:` line. scripts/validate-skills.mjs:11.
  - <sub>ids: arch-coverage#9</sub>

- ⚪ **Toolchain detection lists the private `@ariestools/threads-test` as a published sdk-js package** · `verified`
  - **Now:** Not in the skill itself. This is adjacent tooling. The JSDoc at ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:21-25 reads "Published packages from the ariestools/sdk-js monorepo", and the set at :26-40 includes `'@ariestools/threads-test'` (:39). skills/ariestools-sdk/packages.md:57 calls it "a companion package for tests".
  - **Actual:** ariestools/sdk-js/packages/threads-test/package.json:4 sets `"private": true`, and `npm view @ariestools/threads-test version` returns E404. Detection is unaffected, because every repo that contains threads-test also contains other packages in the set.
  - **Fix:** Remove the entry or correct the comment. Do it together with the fix to the packages.md:57 sentence.
  - **Evidence:** detectProfile.ts:21-40, which matches the v10.1.0 tag and the built dist. ariestools/sdk-js/packages/threads-test/package.json:4.
  - <sub>ids: skills/ariestools-sdk/packages.md#15</sub>
