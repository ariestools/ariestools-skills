---
title: "Skills sync audit 2026-10-08 — xy-toolchain"
kind: evidence
state: superseded
date: "2026-10-08"
commit: "7e78933a8"
status: "Partial audit of the xy-toolchain skill at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.0 (main 7eb43c3c2) and @ariestools/sdk 9.0.1 (298fbb5bb); 79 merged items, 58 verified by two lenses, 7 partially verified, 14 unverified because the run was paused"
audience: "ariestools-skills maintainers and agents updating the skill pack"
supersededBy: docs/evidence/2026-10-08-skills-sync-audit-complete-xy-toolchain.md
---

# Skills sync audit — xy-toolchain

> **Archived 2026-10-08.** Superseded by [`docs/evidence/2026-10-08-skills-sync-audit-complete-xy-toolchain.md`](../../evidence/2026-10-08-skills-sync-audit-complete-xy-toolchain.md).
> Original path: `docs/evidence/2026-10-08-skills-sync-audit-xy-toolchain.md`. Retained as a record of the partial audit (verification paused,
> toolchain 10.1.0) that was current until the complete audit replaced it; do not follow it.

This is an evidence record. Each item is a claim about the `skills/xy-toolchain/` text at ariestools-skills 7e78933a8 that an auditor checked against named source: @ariestools/toolchain 10.1.0 (main 7eb43c3c2, deploy 3320116a4) and @ariestools/sdk 9.0.1 (298fbb5bb). Items marked `verified` were also confirmed by two independent verifiers (a code-truth lens and a skill-text lens), and their corrections are folded in. `partially verified` items had only the code lens run. The record does not establish that `unverified` items are correct: the run was paused before anyone independently checked them. Nothing here has been applied to the skills, and it is not a remediation plan or a priority order. Commands written as `xy.mjs …` / `xyex.mjs …` were run against the 10.1.0 build in `ariestools/toolchain/packages/toolchain/dist/bin/`. Member ids refer to the raw findings in [2026-10-08-skills-sync-audit-findings.json](2026-10-08-skills-sync-audit-findings.json). Back to the [Audit index](2026-10-08-skills-sync-audit.md).

## Summary

The skill's structure and routing still fit the toolchain, but its content predates most of the 9.2.0–10.1.0 releases. Seven items are high severity because following the current text causes a failure or silent damage. Unversioned `typescript` installs now pull TypeScript 7. The install line lacks `-w` for a monorepo root. Root `compile.*` is said to cascade into packages, and it does not. Workspace-scoped test runs skip the root preset. `pnpm-workspace.yaml` is treated as optional. Single-package apps are auto-classified `workspace-root`, so `xy fix` demotes their runtime dependencies. And the documented `commands.dependabot` config fails type-checking. The largest single gap is the undocumented `xy` / `xyex` stability channel. Because of it, `xy work` and `xy dead` are mislabeled, and the release, maintenance and experimental commands are not catalogued.

| | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 0 | 0 | 0 | 0 |
| Update | 6 | 22 | 21 | 49 |
| Add | 1 | 15 | 14 | 30 |

Status: 58 `verified` · 7 `partially verified` · 14 `unverified` (79 merged items from 151 raw findings, 1 refuted).

## `skills/xy-toolchain/SKILL.md`

The router edits for the `xy` / `xyex` channel and the experimental labels on `work` / `dead` are part of two commands.md items: "No `xy` vs `xyex` channel…" and "`xy work` and `xy dead` are documented as plain `xy` commands".

### Update

- 🟠 **Router and description omit whole command families: license/secure, release, dependency updates, experimental commands** · `verified`
  - **Now:** SKILL.md:34 routes build, check, fix, clean, deplint, api-exposure, publint, dead, repository-policy, skills and work. SKILL.md:3 mentions only "publishing checks". There is no route for `license` / `secure`, which commands.md:137-150 already documents. There is also none for `deploy`, `publish --tag`, `up` / `updo`, or `plan` / `npm-org` / `enable` / `tsc-validate` / `orphan`.
  - **Actual:** In 10.1.0, `license`, `secure`, `deploy`, `publish`, `up`, `updo`, `install` and `reinstall` are stable. `plan`, `npm-org`, `enable ts-native`, `tsc-validate` and `orphan` are experimental (`xyex`).
  - **Fix:** Add "`license`, `secure` (dependency-age and Dependabot alert audits)" to the SKILL.md:34 route now. Once commands.md gains the release, maintenance and experimental sections (see the commands.md items), extend the route to cover them. Also add "license and security audits, releasing and publishing (deploy, publish --tag), updating dependencies (up/updo), experimental repo-plan and npm-org lint via xyex" to the description's "Use when" clause.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:34-35, :42, :47, :65. `xy.mjs deploy --help` (patch|minor|major|prerelease). `xy.mjs publish --help` (`--tag`). `xyex.mjs plan --help`, `xyex.mjs npm-org --help`, `xyex.mjs enable --help`. ariestools/toolchain/docs/STABILITY.md:26-32. commands.md:137-150.
  - <sub>ids: skills/xy-toolchain/SKILL.md#2, skills/xy-toolchain/SKILL.md#4</sub>

- ⚪ **Description is 958 characters, close to the 1024-character limit** · `verified`
  - **Now:** SKILL.md:3 lists sub-features down to flag level: "(deplint roles, pick, placement/presence)", "(including --full hygiene)", GitHub dual-write/sync and multi-folder scope.
  - **Actual:** The Skills.sh CLI bundled with the toolchain (skills@1.7.0) rejects index entries whose description is over 1024 characters, and the Agent Skills frontmatter limit is also 1024. The channel and release/security triggers recommended in this audit would push the description over the limit.
  - **Fix:** Rewrite the description as triggers only ("Use when …"), about 400-600 characters. Move the flag-level detail into the router and References. Use the freed space for the `xy` / `xyex` channel and the release and security triggers.
  - **Evidence:** `awk` length of SKILL.md:3 is 958; the next longest is xy-agent at 683. ariestools/toolchain/node_modules/.pnpm/skills@1.7.0/node_modules/skills/dist/cli.mjs:3276 (`e.description.length > 1024`). ariestools/toolchain/packages/toolchain/package.json (`"skills": "~1.7.0"`).
  - <sub>ids: skills/xy-toolchain/SKILL.md#5, arch-layering#15</sub>

### Add

- ⚪ **No Skill identity block and no Related link back to xy-agent** · `unverified`
  - **Now:** SKILL.md:8-16 has no Skill identity block. Related skills at SKILL.md:48-51 list only ariestools-sdk and xyo-skills.
  - **Actual:** xy-agent links to xy-toolchain for the `xy` CLI (skills/xy-agent/SKILL.md:42-45), and xy-toolchain owns the `work` and `plan` commands that xy-agent relies on, but nothing links back.
  - **Fix:** Add the standard Skill identity block. Add a Related entry: "xy-agent — documentation conventions enforced by `xyex plan lint`; work-tracking usage."
  - **Evidence:** skills/xy-toolchain/SKILL.md:8-16, :48-51; skills/xy-agent/SKILL.md:42-45.
  - <sub>ids: arch-layering#15</sub>

## `skills/xy-toolchain/commands.md`

### Update

- 🔴 **`commands.dependabot.rules`, as documented, fails type-checking in a typed `XyConfig`** · `unverified`
  - **Now:** commands.md:150 says "raise levels under `commands.dependabot.rules` to gate". Every config example in the skill uses `const config: XyConfig = {…}`.
  - **Actual:** `xy secure dependabot` reads `commands.dependabot` at runtime. However, the published 10.1.0 `CommandsConfig` has no `dependabot` key, no `workLint` key and no index signature, so the object literal fails with TS2353. Editors and full-package validation of xy.config.ts then fail.
  - **Fix:** State the type gap and give a workaround until the type ships. Either spread a hoisted object alongside a typed key (`commands: { deplint: {}, ...{ dependabot: { rules: { … } } } }`) or put `// @ts-expect-error` on the key. File a toolchain fix that adds `dependabot?: { rules?: RuleLevelConfigMap }` and `workLint?: { rules?: … }` to `CommandsConfig`, and drop the caveat once that ships.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:654-678 (same in dist XyConfig.d.ts:598-621). ariestools/toolchain/packages/toolchain/src/lib/ruleCommandRegistry.ts:48-53, :125-130. ariestools/toolchain/packages/toolchain/src/actions/secure/dependabot.ts:111-117. Scratch `tsc --noEmit --strict` under TS 6.0.3 and 7.0.2 both report TS2353.
  - <sub>ids: cov-config#1, cov-cli#4</sub>

- 🟠 **`xy work` and `xy dead` are documented as plain `xy` commands; both are experimental** · `verified`
  - **Now:** commands.md:133-135 has "### `xy dead [package]` … `--fix-remove` removes dead declarations". In commands.md:173-249, every example is `pnpm xy work …`. The generic config example at commands.md:299-317 uses `commands.dead.rules`. toolchain.md:64 lists `xy work …` as an ordinary root command. SKILL.md:3 and :34 advertise "xy work tracking" and dead-code analysis with no channel.
  - **Actual:** `stability.ts` marks both `dead` and `work` experimental. Under `xy`, every leaf prints "Experimental: … Prefer "xyex …"", and `--help` appends "(experimental — prefer xyex)". ROADMAP plans to make this a hard error in the next major. `dead` stays experimental because `--fix-remove` is destructive, and `work` because GitHub sync and multi-root are still evolving. Their settings (`commands.dead`, `commands.workLint`, and likewise `planLint` / `npmOrgLint`) are experimental-command config that may change on a minor. The flags otherwise match the skill. `dead` also takes `--workspace <*.code-workspace>` and `--format`.
  - **Fix:**
    - Retitle the sections `xyex dead [package]` and `xyex work` (experimental), and say that flags and the storage format may change on a minor.
    - Switch every example to `pnpm xyex …`: in commands.md, toolchain.md:64 and SKILL.md:3/:34 (for example "experimental xyex work tracking"). Make the same switch in skills/xy-agent/auditing.md:100-105 and templates.md:23.
    - For `dead`, recommend `--fix` (adds deprecation markers) before `--fix-remove`. After `--fix-remove`, require a clean tree plus a compile and test rerun. Document `--workspace`.
    - Replace the generic config example with stable keys (for example `commands.deplint` plus `commands.publint` rules), or label the `dead` block as experimental config.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:48, :68. ariestools/toolchain/packages/toolchain/src/xy/experimentalCommand.ts:8-13, :39-56. ariestools/toolchain/packages/toolchain/src/xy/common/work/index.ts:22-34. Output of `xy.mjs --help`, `xy.mjs work --help` and `xy.mjs dead --help`. ariestools/toolchain/docs/STABILITY.md:83-95. ariestools/toolchain/docs/xy-config.md:58. ariestools/toolchain/docs/ROADMAP.md:52, :185-189.
  - <sub>ids: skills/xy-toolchain/SKILL.md#0, skills/xy-toolchain/toolchain.md#3, skills/xy-toolchain/commands.md#1, cov-config#8, cov-cli#2, cov-cli#3, cov-toolchain-history#4</sub>

- 🟠 **Deplint problem list omits the error-level `not-public` rules and other current rules** · `verified`
  - **Now:** commands.md:48 says "Detect unlisted, unused, misplaced, redundant, unsatisfied, range-style, and workspace-protocol problems."
  - **Actual:** Since 10.0.3, `dep.dependencies.not-public` and `dep.peerDependencies.not-public` are errors and cannot be auto-fixed. A public package may not list any of these in `dependencies` or peers: a non-public npm package, a private or restricted workspace sibling, or a non-registry spec. `xy build` runs deplint, so these errors fail builds. The catalog has 22 rules. Besides the not-public pair it includes `dep.peerDependencies.version-mismatch`, `dep.peerDependencies.unrequested`, `dep.dependencies.aei-review`, `dep.package.required`, `dep.package.redundant-placement` and `dep.package.deprecated-reftype`.
  - **Fix:** Rewrite line 48 to cover three rules. First, not-public: an error that blocks `xy build`, fixed by publishing the dependency, vendoring it or making the consumer private, not by `--fix`. Second and third, version-mismatch and unrequested. Then point to `pnpm xy deplint --rules` for the full list. Visibility guidance itself belongs in project-profiles.md (see that item).
  - **Evidence:** Output of `xy.mjs deplint --rules`. ariestools/toolchain/packages/toolchain/src/actions/deplint/rulesNotPublic.ts:14-17, :123. ariestools/toolchain/packages/toolchain/src/actions/deplint/ruleConfig.ts:37-38. ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.md:3. Commit 2f9db7e4e (2026-09-07).
  - <sub>ids: skills/xy-toolchain/commands.md#2, cov-toolchain-history#8</sub>

- 🟠 **Publint description omits `pub.importsMatchExports`, the new `--fix` limits and the scoping flags** · `verified`
  - **Now:** commands.md:131 lists upstream checks, export-map parity, platform portability, condition order, files, source leakage, side effects, legacy fields and peer ranges. Of the flags, it documents only `--fix`.
  - **Actual:**
    - `pub.importsMatchExports` (added in 10.0.9; error, not auto-fixable): every exact `#alias` in `imports` must select the same runtime file as its same-named public subpath under every condition. Otherwise consumers load the module twice.
    - The export-map `--fix` now refuses to add a condition that the matching `#alias` does not select, and it inserts platform conditions before `default`.
    - `pub.platform` (error) checks every monolith output.
    - `pub.resolutions` and `pub.compileTargets` also exist, at warn.
    - `--include` and `-e/--exclude <checks>` take any of: compileTargets, defaultExportOrder, files, importsMatchExports, importToDefault, main, module, neutralToDefault, peerDeps, platform, publint, resolutions, rootSource, rootTypes, sideEffects, source, types. peerDeps runs only on all-workspace runs.
    - `--fresh` clears the incremental snapshot, and `--pack` (default true) packs before linting.
  - **Fix:** Add "#imports aliases vs same-named exports (`pub.importsMatchExports`, an error to fix by hand)" and "dependency resolutions" to the description. Note the `--fix` limit. Add one line for `--include` / `--exclude <checks>`, `--fresh` and `--no-pack`, and link to the monolith troubleshooting in compilation.md.
  - **Evidence:** Output of `xy.mjs publint --rules` and `xy.mjs publint --help`. ariestools/toolchain/packages/toolchain/src/actions/package/publintRules.ts:19, :51. ariestools/toolchain/packages/toolchain/src/actions/publint.ts:330-331. ariestools/toolchain/CHANGELOG.md:19-26. Commits af6712ba5 and 26db53993, both in v10.1.0.
  - <sub>ids: skills/xy-toolchain/commands.md#3, cov-cli#16, cov-toolchain-history#7</sub>

- 🟠 **`xy repo lint` row omits the error-level package README rules and other current rules** · `verified`
  - **Now:** commands.md:160 says "Workspace structure, versions, engines, package-manager fields, spec layout, and Dependabot enablement".
  - **Actual:** Repo lint has 19 rules and runs inside `xy check`. Two were added in 10.0.5, both errors with fixers. `repo.package-readme` requires a consumer README.md in every workspace package except the root. `repo.package-readme-files` requires publishable packages to list README.md in `files`. These also default to error: `repo.internal-dependency-ranges`, `repo.internal-peer-ranges`, `repo.root-private`, `repo.volta-only-root`, `repo.no-private-publish-config`, `repo.workspace-glob-coverage`, `repo.packages-folder`, `repo.engines-non-terminal`, `repo.engines-lts`, and the pnpm release-age rules. `repo.pnpm-no-overrides` is a warning.
  - **Fix:** Expand the row to cover:
    - workspace layout (packages/ folder, glob coverage, private root)
    - versions and internal ranges
    - engines and volta
    - package-manager fields, pnpm release age and overrides
    - spec layout
    - **package README.md and its `files` entry**
    - Dependabot

    Then add: "A new workspace package needs a README.md or `xy check` fails; `xy repo lint --fix` scaffolds one." Point to `pnpm xy repo lint --rules` for the full list.
  - **Evidence:** Output of `xy.mjs repo lint --rules`. ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:350-361. ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts. Commit eb11282ab (2026-09-08).
  - <sub>ids: skills/xy-toolchain/commands.md#4, cov-cli#7, cov-toolchain-history#9</sub>

- 🟠 **`xy skills` coverage is thin: `defaults`, tier requirements, `xy.skills`, `additionalSkills`, rule ids** · `verified`
  - **Now:** commands.md:163 says "`xy skills lint` | Required project skills, versions, and duplicate/unnecessary installations". commands.md:171 says "`xy skills` wraps the bundled Skills.sh CLI and adds XY-aware defaults, linting, and updates. Use `xy skills lint --fix` to install missing profile-required skills…".
  - **Actual:**
    - **Subcommands.** Only `defaults` and `lint` are XY-specific. Every other subcommand passes through to Skills.sh: add, update, list/ls, remove, find, use, experimental_install and experimental_sync. `xy skills --help` prints the Skills.sh help.
    - **`defaults`.** `xy skills defaults [-g] [-a <agent>] [--copy]` installs all of ariestools-skills plus the xyo-skills XYO/XL1 stack.
    - **Tier detection.** `xy skills lint` detects a repo tier, which is a different thing from the package profiles in project-profiles.md and from the global `--profile` timing flag. The tiers are none, xy (xy-development + xy-toolchain), xyo (adds xyo-knowledge) and xl1 (adds xl1-knowledge, xl1-patterns and xl1-testing).
    - **Other requirements.** Lint auto-requires ariestools-sdk when sdk-js packages are produced or imported, and xl1-dapp-kit when dapp-kit is used. It requires skills declared in package.json `"xy": { "skills": [{ "name", "source"? }] }` on workspace packages and direct dependencies. It also honors `commands.skillsLint.additionalSkills`; the lists are unioned and unknown names are config errors.
    - **Rules.** `skills.required-installed`, `skills.required-current`, `skills.migrated-source` (xy-development and xy-toolchain must come from ariestools-skills) and `skills.package-recommended` are errors. `skills.duplicate-install` and `skills.unnecessary` are warnings.
    - **`--fix`.** It installs missing skills, migrates relocated ones and updates outdated ones.
  - **Fix:**
    - Replace commands.md:171 with a short Skills subsection covering: `defaults` vs `lint --fix` (all skills vs only the required ones); a tier-to-required-skills table; the `xy.skills` JSON, where skills outside the managed catalog need `source` (see the package.json `xy` key item below); `additionalSkills`; and a rule-id table.
    - Note the passthrough commands, and that `xy skills lint --help` shows the XY-specific help. Also mention `xy repo init --skills-tier`, and that skills lint runs inside `xy check`.
    - Reword "adds XY-aware defaults, linting, and updates" to "adds `defaults` and `lint` (whose `--fix` also updates outdated skills)". Do not drop the clause.
    - Replace "profile-required skills" with "skills required by the detected repo tier".
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/skills/index.ts:7-77. ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:13-27, :66-73. ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:57-120. ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-56, :111-123, :206-248. ariestools/toolchain/packages/toolchain/src/actions/skills/packageSkills.ts:90-170. ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:634-647. ariestools/toolchain/docs/xy-config.md:62-101 (the tier text is at :84-97). Output of `xy.mjs skills lint --rules`. Commits a4cd25cdc, 881eede39 and c88d0ecff.
  - <sub>ids: skills/xy-toolchain/commands.md#6, skills/xy-toolchain/project-profiles.md#7, cov-config#7, cov-cli#6, cov-toolchain-history#12, arch-distribution#8</sub>

- 🟠 **The `dep.workspace.protocol` example fails type-checking and only restates the default** · `unverified`
  - **Now:** commands.md:310 has `'dep.workspace.protocol': ['error', { protocol: 'workspace:~' }],` inside `const config: XyConfig`.
  - **Actual:** The runtime accepts `protocol`. However, the `DeplintRulesConfig` index signature types the options as `DeplintRuleCommonOptions`, which has only `ignore`, so the literal fails with TS2322. The default is already `workspace:~`, so the option changes nothing. The skill's other config snippets type-check cleanly.
  - **Fix:** Change the example to `'dep.workspace.protocol': 'error'`. Add a sentence: "The default protocol is `workspace:~`. `protocol: 'workspace:*' | 'workspace:^' | 'workspace:~'` works at runtime but is not typed in 10.1.0." File a toolchain item for the typing.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:346-352, :386-393. ariestools/toolchain/packages/toolchain/src/actions/deplint/ruleConfig.ts:21. ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.ts:769. Scratch `tsc --noEmit --strict` under TS 6.0.3.
  - <sub>ids: cov-cli#5</sub>

- 🟠 **packman row does not separate stable `packman lint` from experimental convert/clean** · `unverified`
  - **Now:** commands.md:159 says "`xy packman lint` | Package-manager safety configuration, including pnpm release-age policy".
  - **Actual:** `xy packman lint` is stable and part of `xy check`. Its rules are `packman.pnpm.minimumReleaseAge`, `packman.pnpm.minimumReleaseAgeExclude`, `packman.pnpm.verifyDepsBeforeRun` and `packman.yarn.enableScripts`. `packman convert <target>` and `packman clean` are experimental (`xyex`). `clean` removes node_modules and lockfiles, not build output. SKILLS-FOLLOWUP item 5 asks for this split.
  - **Fix:** Say that packman lint is stable and runs in `xy check`, and list its four rules. Mention `pnpm xyex packman convert pnpm` as the experimental yarn/npm → pnpm aid. Say that `packman clean` is not a build cleaner; use `xy clean` for that.
  - **Evidence:** ariestools/toolchain/docs/SKILLS-FOLLOWUP.md:9. ariestools/toolchain/docs/STABILITY.md:80-88. Output of `xy.mjs packman --help` and `xy.mjs packman lint --rules`. ariestools/toolchain/CHANGELOG.md:59.
  - <sub>ids: cov-toolchain-history#11</sub>

- ⚪ **`xy fix` row omits `lint lint --fix`; git lint row omits the `.xy/cache` rule; node lint runs only on its own** · `verified`
  - **Now:** commands.md:40 says "`xy fix [package]` | Git lint, deplint, repo lint, publint, and ESLint fixes". The git lint row at commands.md:158 says "LF settings and case sensitivity". The policy table (commands.md:154-165) lists `xy node lint` next to the families that `xy check` runs.
  - **Actual:** `xy fix` runs git lint, deplint, repo lint, publint, lint and **lint lint**, each with `--fix`. It does not fix packman or skills lint, so it differs from `xy check --fix`. `xy check` runs git, packman, publint, repo, lint lint and skills lint, but not node lint. Git lint also enforces `git.ignore-toolchain-cache` (added in 9.1.1): `.xy/cache` must be ignored in every package. It also checks core.autocrlf and eol. commands.md:39 already lists the `xy check` families correctly, so the node-lint point only needs clarifying.
  - **Fix:** Change the `xy fix` row to "git lint, deplint, repo lint, publint, ESLint and ESLint-config (lint lint) fixes; use `xy check --fix` for packman and skills". Add the `.xy/cache` ignore and the autocrlf/eol checks to the git lint row. Optionally add an "in `xy check`" column, and note that `xy node lint [--fix]` runs on its own.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/fix.ts:17-28. ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:49-70. Output of `xy.mjs check --help` and `xy.mjs git lint --rules`. Commit cada677a2.
  - <sub>ids: skills/xy-toolchain/commands.md#9, cov-cli#18, cov-toolchain-history#17</sub>

- ⚪ **Deplint classifier default, `pick` nuances and the remaining config fields are not stated** · `verified`
  - **Now:** commands.md:50-54 list legacy, aei and aei-next with no default and no CLI flag. commands.md:116-123 describe `pick` with `aei-review` rows and say Enter "removes the entry for `none`".
  - **Actual:** The classifier is resolved as the `--classifier` flag, then `commands.deplint.classifier`, then `legacy`. So `aei-review` rows appear only under aei or aei-next, and otherwise pick lists only packages already configured. In pick, `none` keeps existing peer-with-default and presence-only entries; it does not delete them. Deplint also has these settings:
    - `-e/--exclude`, and `commands.deplint.exclude` (workspace-relative globs for generated trees)
    - the `-d/-D/-P` section filters
    - `plugins`
    - a per-package `peerOptional`
    - range-style `form` ('shorthand' by default, or 'broad') with `bound`

    The old `deplint.*` rule ids are deprecated aliases of `dep.*`. The role facets `hasImportConsumers`, `peerTarget` and `allowMoveToDev` are covered by the project-profiles.md override-example item.
  - **Fix:** State "default: `legacy`; override per run with `--classifier` or per repo with `commands.deplint.classifier`". Note both pick behaviors. Add a compact field list (`exclude`, `plugins`, `peerOptional`, range-style `form`/`bound`) and a note on the `deplint.*` → `dep.*` aliases.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/engine.ts:134-139, :168. ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:319-342, :354-410, :442-526. ariestools/toolchain/packages/toolchain/src/actions/deplint/interactivePick.ts:29, :166-176. ariestools/toolchain/packages/toolchain/src/actions/deplint/loader.ts:32-44. Output of `xy.mjs deplint --help`.
  - <sub>ids: skills/xy-toolchain/commands.md#10, cov-config#11</sub>

- ⚪ **Global flag table has the wrong `--jobs` default and omits `-v`, `-i` and the env-var equivalents** · `unverified`
  - **Now:** commands.md:21 says "`--jobs <n>` | Limit parallel work; default is 16". The table has no `--verbose` or `--incremental` row and no mention of `XY_STRICT` or `XY_NO_DEFER`.
  - **Actual:** `--jobs` defaults to `availableParallelism()`, which is 16 only on a 16-core machine. The global flags also include `-v/--verbose` and `-i/--incremental`. Incremental mode is on by default for compile, build and lint, and `--no-incremental` turns it off. `XY_STRICT=1` is equivalent to `--strict`, and `XY_NO_DEFER=1` to `--no-defer`. For how deferral works, see the toolchain.md root-scripts item.
  - **Fix:** Change the default to "available CPU parallelism". Add `-v/--verbose` and `-i/--incremental` rows and the env-var equivalents. Broaden the incremental note at commands.md:27 to cover lint.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/xyParseOptions.ts:58-61, :88-100. ariestools/toolchain/packages/toolchain/src/lib/tryRunLocalScript.ts:13-37. ariestools/toolchain/packages/toolchain/src/xy/build/buildCommand.ts and compileCommand.ts (`incremental: argv.incremental !== false`).
  - <sub>ids: cov-cli#13</sub>

### Add

- 🟠 **No `xy` vs `xyex` channel, stability catalog or `--stability` anywhere in the pack** · `verified`
  - **Now:** Absent. `grep -rn xyex skills/` finds nothing. The "Global behavior" section (commands.md:13-29) has no `--stability`, and SKILL.md:12-14 and toolchain.md:49-66 describe only `xy`.
  - **Actual:**
    - **The two bins.** Since 9.2.0, @ariestools/toolchain ships `xy`, which is semver-stable, and `xyex`, an experimental superset that may change on a minor release.
    - **The catalog.** `xy --stability [--json]` prints the stability of every command, package and experimental config surface.
    - **Experimental commands.** analyze, dead, eject, enable, npm-org, orphan, packman clean/convert, plan, sitemap, sonar, tsc-validate and work. They still run under `xy` but print a "Prefer xyex" warning, and STABILITY.md says that path "may become a hard error in a future major release". `relint` is deprecated.
    - **Experimental config surfaces.** `compile.validator: 'shared'`, `compile.mode: 'tsc'`, `compile.compiler: 'native'`, ESLint tier 4, `xy lint --mode shared-typecheck`, non-pnpm package managers, `commands.planLint.rules` and `commands.npmOrgLint`.
    - **The follow-up.** The toolchain's SKILLS-FOLLOWUP.md asks for exactly this documentation. ROADMAP Phase 4, which makes `xy` refuse experimental commands, is blocked until the skills mention `xyex`.
    - **Severity.** Both verifiers rated this medium because experimental commands only warn today. Two unverified auditors rated it high because of the roadmap blocker.
  - **Fix:**
    - **commands.md:** add a "CLI channels and stability" subsection at the top of Global behavior. Cover the two bins and their semver contract; prefer `xy` in scripts, CI and examples; run experimental commands as `pnpm xyex <cmd>`; check `pnpm xy --stability --json` instead of trusting copied lists; list the experimental config surfaces; link https://github.com/ariestools/toolchain/blob/main/docs/STABILITY.md. Add `--stability` to the flag table.
    - **SKILL.md:** mirror this in a short "Stable vs experimental" section after SKILL.md:14. Add "xy/xyex CLI" to the description and to the toolchain.md and commands.md routes.
    - **toolchain.md:** add an "xy vs xyex" subsection under "Root CLI versus package hooks". Put `--stability` and `--rules` next to `--help` at toolchain.md:21.
  - **Evidence:** ariestools/toolchain/packages/toolchain/package.json:48-49 (the `xy` and `xyex` bins). ariestools/toolchain/packages/toolchain/src/xy/stability.ts:13-75, :135-177. ariestools/toolchain/packages/toolchain/src/xy/experimentalCommand.ts:8-13. ariestools/toolchain/docs/STABILITY.md:9-14, :55-62, :110-116. ariestools/toolchain/docs/SKILLS-FOLLOWUP.md:5-7. ariestools/toolchain/docs/ROADMAP.md:52, :185, :212. ariestools/toolchain/CHANGELOG.md [9.2.0]. Output of `xy.mjs --stability --json`.
  - <sub>ids: skills/xy-toolchain/SKILL.md#1, skills/xy-toolchain/toolchain.md#2, skills/xy-toolchain/commands.md#0, cov-cli#0, cov-toolchain-history#2, cov-toolchain-history#3, arch-distribution#7</sub>

- 🟠 **Release and maintenance commands are missing from the catalog** · `verified`
  - **Now:** Absent. The catalog covers build, check, fix, clean, deplint, api-exposure, publint, dead, license, secure, policy, skills and work. A grep of skills/ finds no `xy deploy`, `xy publish`, `--tag`, `up`, `updo`, `install`, `reinstall`, `statics`, `gitignore`, `npmignore-gen` or `copy-assets`.
  - **Actual:** All of these are stable in 10.1.0:
    - `xy deploy [patch|minor|major|prerelease]` (default patch): bumps the lockstep version, runs `xy clean` and `xy build`, then applies the version.
    - `xy publish [--tag <dist-tag>] [--chunk-size N]`: STABILITY.md says prereleases publish with `--tag next` so that `latest` stays on stable releases. `--chunk-size` is pnpm-only, with one 2FA prompt per chunk.
    - `xy up`: outdated report.
    - `xy updo [--latest] [--next] [--risk green|yellow|red]`: interactive updater; caps typescript at 6.
    - `xy install`.
    - `xy reinstall`: runs packman clean, which deletes node_modules and lockfiles, then installs.
    - `xy gitignore`: writes a root .gitignore and removes package-level ones.
    - `xy npmignore-gen`, `xy statics`, `xy copy-assets`.
    - `xy cycle`: see eslint.md.
  - **Fix:** Add a compact "Release and maintenance" table with those rows, and mark `reinstall` and `gitignore` as destructive. Note that in repos where release-please or CI owns releases, agents should check that workflow before running `deploy` or `publish`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:15-46. ariestools/toolchain/packages/toolchain/src/actions/deploy.ts:7-18. ariestools/toolchain/packages/toolchain/src/actions/reinstall.ts:1-11. Output of `xy.mjs deploy|publish|updo|cycle --help`. ariestools/toolchain/docs/STABILITY.md:26-32.
  - <sub>ids: skills/xy-toolchain/commands.md#7, cov-cli#8, cov-cli#14, cov-toolchain-history#13, cov-toolchain-history#17</sub>

- 🟠 **No catalog of the other experimental (`xyex`) commands** · `verified`
  - **Now:** Absent. skills/ has no `plan`, `npm-org`, `enable`, `ts-native`, `tsc-validate`, `orphan` or `packman convert`; the "orphan" hits in xy-agent are about orphaned documents. skills/xy-agent/SKILL.md:45 sends `xy` CLI questions to xy-toolchain.
  - **Actual:** These are registered in 10.1.0 as experimental:
    - `plan init [--dry-run --project-id --summary]`: bootstraps .xy/plan.json and refuses to overwrite.
    - `plan lint [--fix]`: 8 `plan.*` rules covering the root/papers/docs/notes layout and the CLAUDE.md `@AGENTS.md` checks. It is not part of `xy check`. Config: `commands.planLint.rules`.
    - `npm-org lint [org] [--min-downloads --max-age-days --include-deprecated]`: rules `npm-org.stale-usage` and `npm-org.stale-development`; config `commands.npmOrgLint`.
    - `orphan list|clean`: leftover dist after package moves; overlaps `xy clean --full`.
    - `enable ts-native [--no-install]`.
    - `tsc-validate [package]`.
    - `packman convert <bun|npm|pnpm|yarn>`.
    - `packman clean`: deletes node_modules and lockfiles.
    - `sonar`: quarantined.

    React-only commands: `start` is stable, while `analyze`, `eject` and `sitemap` are experimental. `start` and `eject` wrap react-scripts.

    A finished npm-org section already exists, but only as a local edit of the toolchain repo's installed skill copy (ariestools/toolchain/.agents/skills/xy-toolchain/commands.md:151-169, commits 5beae1203 and 9fe120837). The next `xy skills update` will erase it.
  - **Fix:**
    - Add a "Labs (`xyex`) and framework commands" table with one line per command: its purpose, the `pnpm xyex …` form, and any hazard (packman clean deletes lockfiles; sonar is quarantined; start and eject are CRA wrappers, not for Vite or Next).
    - Give `plan` a short subsection (init behavior, lint rule ids, not part of `xy check`) and cross-link xy-agent for the layout rules.
    - Port the npm-org section from the toolchain's local copy, then restore that copy with `xy skills update`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/stability.ts:20, :31, :49-60, :71-74. Output of `xyex.mjs plan|npm-org|orphan|enable --help` and `xy.mjs packman --help`. ariestools/toolchain/docs/STABILITY.md:81-102. ariestools/toolchain/docs/plan-manifest.md:50-116. A diff of ariestools/toolchain/.agents/skills/xy-toolchain/commands.md against skills/xy-toolchain/commands.md.
  - <sub>ids: skills/xy-toolchain/commands.md#8, cov-cli#9, cov-agent-docs#17, arch-distribution#6, cov-toolchain-history#17</sub>

- 🟠 **`nodeTrack` for repo and node lint is undocumented, so Node-LTS repos get Current-track results** · `verified`
  - **Now:** Absent. commands.md:160-161 mention engines and "Root Volta pin and package `engines.node` portability" but give no configuration.
  - **Actual:** `commands.repoLint.nodeTrack` and `commands.nodeLint.nodeTrack` ('current', the default, or 'lts'; added in 10.0.7) choose which Node line `repo.engines-lts` and `node.volta-node-latest` compare against. With 'current' (26.8.2), three things happen:
    - An `engines` range that excludes 26.8.2 is an error in `xy check`.
    - A volta pin older than 26.8.2 is a warning, which fails only under `--strict`.
    - `xy node lint --fix` rewrites the root `volta.node` to the latest Current.

    Many workspace repos pin volta to 24.x.
  - **Fix:** Under Repository policy, add: "Repos that track Node LTS set `commands: { repoLint: { nodeTrack: 'lts' }, nodeLint: { nodeTrack: 'lts' } }`. Otherwise `repo.engines-lts` errors on an engines range that excludes the latest Current Node, warns on an older volta pin, and `xy node lint --fix` bumps `volta.node` to Current."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:586-608. ariestools/toolchain/packages/toolchain/src/actions/package-lint-engines.ts:176-220. ariestools/toolchain/packages/toolchain/src/actions/node-lint.ts:81-99, :172-175. ariestools/toolchain/packages/toolchain/src/lib/latestVersions.ts:6. ariestools/toolchain/docs/xy-config.md:46-56. Output of `xy.mjs repo lint --rules`. Commit a2b5c6ea3.
  - <sub>ids: skills/xy-toolchain/commands.md#5, cov-config#6, cov-toolchain-history#9</sub>

- 🟠 **Stable command configs are undocumented: `commands.publint`, `apiExposure`, `license`, `packman`** · `unverified`
  - **Now:** commands.md:125-139 and :159 describe these commands but not their configuration. The "Configuration and automation" example (commands.md:293-317) shows only dead and deplint.
  - **Actual:**
    - `commands.publint` takes `{ include | exclude: <checks>, pack (default true), rules }`. The boolean form type-checks but is ignored.
    - `commands.apiExposure` takes `packages[name].classification`, `peerForwarding` ('when-exposed' by default, 'always' or 'when-used'), `peerWithDefault`, `rules`, `thresholds` (39/79/119/179) and `treeShaking` (default true). It also feeds deplint under the aei and aei-next classifiers.
    - `commands.license` takes `allow`, `allowOnly`, `deny` and `ignorePackages`.
    - `commands.packman` takes `minimumReleaseAge` (default 1440) and `minimumReleaseAgeExclude`. The excludes are checked against the scopes the repo imports; the default in the type's JSDoc is not what the lint enforces.
  - **Fix:** Add a "Command settings reference" table with fields, defaults and a one-line example for each of the four. Warn that `commands.publint: false` does nothing; use `rules` or `exclude` instead. Point to `pnpm xy <cmd> --rules` for rule ids.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/PublintConfig.ts:6-23, :79-105. ariestools/toolchain/packages/toolchain/src/actions/publint.ts:96-98, :124. ariestools/toolchain/packages/toolchain/src/actions/package/compile/ApiExposureConfig.ts:13-121. ariestools/toolchain/packages/toolchain/src/lib/licenseCheck/checkLicenses.ts:57-85. ariestools/toolchain/packages/toolchain/src/actions/packman/lint.ts:41-46, :216-234. Usage: ariestools/sdk-js/xy.config.ts:5 and XYOracleNetwork/plugins/packages/payloadset/xy.config.ts:13-27.
  - <sub>ids: cov-config#5</sub>

- 🟠 **A package.json `xy` key silently replaces that directory's xy.config.ts** · `unverified`
  - **Now:** Absent. The skill never mentions package.json `xy` config.
  - **Actual:** The loader calls `cosmiconfig('xy')` with the default search places. Those check `package.json` first and read its `xy` property. If a package declares `"xy": { "skills": [...] }`, which is the documented way to recommend skills, that object becomes the directory's entire xy config, and a sibling xy.config.ts (compile, commands) is ignored. A scratch probe with both files present resolved to package.json. No current repo has a top-level `xy` key, so the hazard is latent.
  - **Fix:** When documenting `xy.skills` (see the `xy skills` item), warn that it should go only in packages without an xy.config.ts until the toolchain fixes the clash. Raise a toolchain issue to drop package.json from `searchPlaces` or use a non-colliding `packageProp`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/lib/loadConfig.ts:52-57. cosmiconfig@10.0.1 dist/defaults.js:5-28 and Explorer.js:115-121 (in ariestools/toolchain/node_modules). ariestools/toolchain/docs/xy-config.md:62-101.
  - <sub>ids: cov-config#7</sub>

- ⚪ **Work section omits that `.xy/work` is tracked, plus the triage flags, lint rules and the sync identity check** · `verified`
  - **Now:** commands.md:201 says "`work lint` | Store health (gitignore, GitHub availability, sync drift)". commands.md:179 shows `pnpm xy work add bug "Describe the problem"` with no flags. commands.md:231 says "keep priority, acceptance, and verification on the work item".
  - **Actual:**
    - **Tracked store.** `work.store-not-gitignored` (error) requires `.xy/work` to be committed. This is the opposite of `.xy/cache`, which `git.ignore-toolchain-cache` wants ignored.
    - **Capture flags.** `work add` and `work update` take `--description`, `--area`, `--tag`, `--file` / `--line` / `--inline`, `--acceptance` and `--verify` (both repeatable), and `--impact` / `--urgency` / `--effort` / `--risk` / `--confidence` (each 1-5). They also take `--workspace`, `--workspace-file` and `--repo`. Items missing the triage fields count as untriaged.
    - **Query flags.** `work list` takes `--status`, `--type` and `--sort created|priority`. `work queue` takes `--name`, `--limit` and `--status`. `work done` requires `--evidence`.
    - **Lint and sync.** The other lint rules are `work.github-available` and `work.github-synced` (both warn). Since 10.1.0, sync edits or closes a GitHub issue only when the issue's body marker and the stored URL match the local id.
    - **Cross-skill gap.** skills/xy-agent/auditing.md:104 tells agents to supply these fields, but only the toolchain's unpublished local xy-work skill documents them.
  - **Fix:**
    - Add one line: "`.xy/work/` is tracked in git; ignore `**/.xy/cache/`, never `.xy/work`."
    - Add a capture example: `pnpm xyex work add bug "…" --area <a> --file <path> --line <n> --acceptance "…" --verify "pnpm xy build" --impact 4 --urgency 2 --effort 1 --risk 2 --confidence 3`.
    - Add the list and queue filters, the work lint rule table and the sync identity guarantee.
    - Port this from ariestools/toolchain/.agents/skills/xy-work/SKILL.md, or create skills/xy-toolchain/work.md, then retire that local skill.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/work/lint.ts:151-172. ariestools/toolchain/packages/toolchain/src/actions/gitlintIgnore.ts:7-9. Output of `xyex.mjs work add|list|queue|update|done --help` and `xyex.mjs work lint --rules`. ariestools/toolchain/docs/code-review-2026-10-06.md:76-83. ariestools/toolchain/.agents/skills/xy-work/SKILL.md:24-56, :112-150. skills/xy-agent/auditing.md:100-105.
  - <sub>ids: skills/xy-toolchain/commands.md#11, cov-cli#20, cov-toolchain-history#14, arch-layering#22</sub>

## `skills/xy-toolchain/compilation.md`

### Update

- 🔴 **Root `compile.*` does not cascade into a package that has its own xy.config.ts** · `verified`
  - **Now:** compilation.md:29 says "Root configuration cascades to packages under that root. Package-level configuration overrides or deep-merges the applicable root settings."
  - **Actual:**
    - **Only `commands.*` merges** root and workspace configs.
    - **`package-compile` uses the nearest config.** It runs in the package directory and searches with cosmiconfig from the cwd, stopping at the git root. A package's own xy.config.ts therefore replaces the root `compile` block entirely: `compiler`, `node`, `validate`, `mode`, `bundlePackages` and so on. Packages with no config of their own get the root file unchanged.
    - **Exceptions.** `compile.validator` is read from the root config only, and the shared validator falls back to the root `compile.validate`.
    - **Publint disagrees.** Publint's expected-output check does deep-merge root and package, so it can disagree with what compile actually emits.
    - **In practice.** This is why sdk-js and toolchain repeat `compiler: 'native'` in every package config.
  - **Fix:** Split the sentence. "`commands.*` cascades: the root provides defaults, workspace configs deep-merge, rule tuples are replaced per id, and arrays are unioned. `compile.*` does not: each package compiles with its nearest xy.config.ts, so repeat any root compile settings you need (e.g. `compiler`, `validate`) in every package config that exists. `compile.validator` is root-only."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/lib/loadConfig.ts:52-92, :195-245. ariestools/toolchain/packages/toolchain/src/actions/package/compile/compile.ts:16-19. ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:180-188. ariestools/toolchain/packages/toolchain/src/actions/compile.ts:348-355. ariestools/toolchain/packages/toolchain/src/actions/package/expectedCompileOutputs.ts:83-88. ariestools/toolchain/packages/toolchain/src/actions/tsc-validate/tscValidate.ts:30. ariestools/sdk-js/xy.config.ts:4 vs ariestools/sdk-js/packages/{crypto,sdk,…}/xy.config.ts. ariestools/toolchain/docs/xy-config.md:15 makes the same wrong claim.
  - <sub>ids: skills/xy-toolchain/compilation.md#0, cov-config#0</sub>

- 🟠 **Validate-then-emit ordering is wrong for workspace `xy compile` and `xy build`** · `verified`
  - **Now:** compilation.md:82 says "By default, `xy compile` performs a no-emit TypeScript validation pass over the full package … then emits package output through the selected compiler mode."
  - **Actual:**
    - **Single package.** Validate-then-emit holds only for `package-compile` with no flags, which is what `xy compile <pkg>` runs. Monolith runs layout sync, then validation, then emit.
    - **Workspace.** Workspace `xy compile` and `xy build` first emit every package, in topological order over dependencies and devDependencies, with `package-compile --emit-only`. That skips the full-package validation of specs, stories and configs, though the tsc declaration pass still fails on source type errors. Validation runs afterwards: `--validate-only` per package, or the shared host. So a workspace compile can leave fresh dist output even when validation fails, and an emit failure stops dependents.
    - **Recompile.** `xy recompile` validates then emits per package by default, and is two-phase only with `--validator shared`.
    - **`compile.validate: false`.** Workspace compiles then skip no-emit validation entirely, while `xy compile <pkg>` still runs the per-source-folder checks.
  - **Fix:** Reword the paragraph to separate the single-package, monolith, workspace and recompile orderings as above.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/compile.ts:417-445, :556-570. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:314-318, :354-378, :401-414, :471-478. ariestools/toolchain/packages/toolchain/src/actions/package/compile/createTypescriptConfig.ts:110-120. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:135-171. ariestools/toolchain/packages/toolchain/src/actions/recompile.ts:59-72.
  - <sub>ids: skills/xy-toolchain/compilation.md#2</sub>

- 🟠 **entryMode `auto` is misdescribed, and the `custom`, monolith and `transpile` entry rules are missing** · `verified`
  - **Now:** compilation.md:58-64 says "`custom` accepts explicit `{ in, out }` entries. `auto` lets the compiler derive the applicable shape."
  - **Actual:** buildEntries has no `auto` branch, so `auto` returns `['index.ts']`, the same as `single`. The other modes:
    - `platform` uses `index-node.ts` and `index-browser.ts`.
    - `all` takes every source file except specs, stories and `.d.ts`. It is the default for `transpile`.
    - `custom` starts empty and takes entries only from `compile.<platform>.<srcDir>.entry`. Entries can be strings (the output name keeps the relative path, minus a leading platform segment) or `{ in, out }`.

    A `{ in, out }` entry throws in any other mode, where string entries are appended to the mode's defaults instead. Monolith throws if `compile.entryMode` or a per-platform `entry` is set.
  - **Fix:** Replace the `auto` bullet with "`auto` currently behaves like `single`; do not rely on it." Expand `custom` with an example: `{ entryMode: 'custom', node: { src: { entry: ['index-node.ts', { in: 'worker/w.ts', out: 'worker' }] } } }`. Note that `{ in, out }` requires `custom`, that `transpile` implies `all`, and that monolith rejects `entryMode` and `entry`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/buildEntries.ts:17-48. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:128-158. ariestools/toolchain/packages/toolchain/src/actions/package/compile/entryOutputName.ts:9-19. ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompileBundleOptions.ts:90-93. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:19-32. Usage: ariestools/sdk-js/packages/crypto/xy.config.ts and ariestools/sdk-js/packages/threads/xy.config.ts.
  - <sub>ids: skills/xy-toolchain/compilation.md#3, cov-config#3</sub>

- 🟠 **A target object is a source-directory map, not an "options object"** · `verified`
  - **Now:** compilation.md:36 says "Enable a target with `true` or a non-empty options object." compilation.md:35 says "If no target is enabled, build `neutral`."
  - **Actual:**
    - **Shape.** A target object is keyed by source directory: `{ src: {} }` or `{ src: { entry: [...], ...esbuildOptions } }`.
    - **Misuse fails silently.** `node: { minify: true }` enables node (which turns neutral off), finds no `minify/` directory and emits nothing. The legacy `esbuildOptions` key is stripped before classification, so `node: { esbuildOptions: {...} }` on its own counts as disabled.
    - **Neutral default.** Neutral builds by default only when `neutral` is unset. `neutral: false` with no other target builds nothing.
    - **Overrides.** Shared esbuild overrides go in `compile.esbuild.options`. `compile.tsup.options` is deprecated but still honored.
  - **Fix:** "Enable a target with `true` or a source-directory map such as `{ src: {} }` / `{ src: { entry: [...] } }`. The keys are source directories, not esbuild options; put shared overrides in `compile.esbuild.options`. `neutral: false` with no other target builds nothing."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompilePlatforms.ts:14-22, :35-57, :79-83. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:237-243, :292-297, :427-443. ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:243-272.
  - <sub>ids: skills/xy-toolchain/compilation.md#4, cov-config#3</sub>

- ⚪ **`bundle` mode bundles everything by default; `library` mode supports selective bundling** · `verified`
  - **Now:** compilation.md:71 says "`bundle` | Intentionally inlining selected npm or workspace packages into the output". compilation.md:76 lists the `compile.bundlePackages` controls without defaults.
  - **Actual:** `mode: 'bundle'` with no `all`, `workspace` or `scopes` rule defaults to `{ all: true }` and inlines every npm package. `external` on its own does not narrow that; it only exempts the listed packages. `library` mode honors `bundlePackages` (scopes, workspace or all, minus `external`) and inlines only the matches. `transpile` ignores `bundlePackages`.
  - **Fix:** State those three rules, and say to use `scopes` or `workspace` to bundle selectively.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompileBundleOptions.ts:42-48, :72-78, :95-115. ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:75-78, :136-140.
  - <sub>ids: skills/xy-toolchain/compilation.md#6, cov-config#12</sub>

- ⚪ **Shared-validator notes miss the native fallback, `xyex tsc-validate` and `recompile --validator`** · `verified`
  - **Now:** compilation.md:90-91 says "`compile.validator: 'shared'` uses the experimental shared-host validator for an all-workspace compile. `xy compile --validator shared` overrides the root setting for that run." No skill mentions `tsc-validate`.
  - **Actual:**
    - **Native fallback.** With `compile.compiler: 'native'`, the shared validator falls back to per-package validation with a warning.
    - **Standalone command.** The same engine runs on its own as the experimental `xyex tsc-validate [package]`. It type-checks every workspace in one process with a shared source-file cache, respects `compile.validate: false`, and skips packages without a tsconfig. Running it as `xy tsc-validate` prints "prefer xyex".
    - **Recompile.** `xy recompile` also accepts `--validator`.
    - **Scope.** `compile.validator` is read from the repo-root config only.
  - **Fix:** Add one bullet for each point: the native fallback, `xy recompile --validator`, `pnpm xyex tsc-validate [package]` (experimental, type-check only, no emit), and the root-only setting. Optionally add a one-line pointer from typescript.md:117.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/compile.ts:337-356. ariestools/toolchain/packages/toolchain/src/xy/build/recompileCommand.ts:12-26. ariestools/toolchain/packages/toolchain/src/actions/tsc-validate/tscValidate.ts:14-60. ariestools/toolchain/packages/toolchain/src/xy/stability.ts:20, :136-140. Output of `xyex.mjs tsc-validate --help`. ariestools/toolchain/docs/STABILITY.md:98.
  - <sub>ids: skills/xy-toolchain/compilation.md#7, skills/xy-toolchain/typescript.md#5, cov-cli#17, cov-toolchain-history#15</sub>

- ⚪ **Vendor section omits most fields and the devDependency ordering requirement** · `verified`
  - **Now:** compilation.md:116-130 shows only `vendorPackages.scopes` and `selfScope`, plus "Compile workspace dependencies first".
  - **Actual:**
    - **Fields.** Vendor mode also supports `vendorPackages.exclude`, `vendorPackages.conditionalSubpaths`, `compile.vendorBarrel.{runtime,model}` (defaults src/index.ts and src/model.ts), `compile.vendorDir` (default `_pkg`) and `compile.vendorSyncExports` (default true; rewrites package.json exports).
    - **Self-check.** A self-check fails compilation on any leftover private-scope import.
    - **Ordering.** Vendored private packages must be `workspace:~` devDependencies of the umbrella so that the topological emit builds them first.
    - **Current use.** No current @ariestools repo uses vendor mode. The @ariestools/sdk umbrella is `mode: 'monolith'`, so the sdk-js example in docs/vendor-mode.md is stale.
  - **Fix:** Add the field list with defaults. State the devDependency requirement and that a full workspace `xy compile` is the safe way to refresh. Link docs/vendor-mode.md, and note that the current SDK umbrellas use monolith.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:98-133, :201-216. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileVendor.ts:14-15, :55-62. ariestools/toolchain/packages/toolchain/src/actions/compile.ts:417-424. ariestools/toolchain/docs/vendor-mode.md:132-166, :301-316. ariestools/sdk-js/packages/sdk/xy.config.ts:11.
  - <sub>ids: skills/xy-toolchain/compilation.md#9, cov-config#12</sub>

### Add

- 🟠 **Experimental `compile.compiler: 'native'` (TypeScript 7) is undocumented** · `verified`
  - **Now:** Absent. No skill mentions `compile.compiler`, `compile.nativePackage`, `xyex enable ts-native` or `typescript-native`.
  - **Actual:**
    - **The field.** `compile.compiler?: 'typescript' | 'native'` (default `typescript`) selects the tsc that runs type-checking and declaration emit.
    - **Native.** `native` runs TypeScript 7 (Go) from the alias `"typescript-native": "npm:typescript@~7.0.2"`; `compile.nativePackage` overrides the alias name.
    - **Setup.** `xyex enable ts-native [--no-install]` adds the alias, sets the field and clears an incompatible shared validator.
    - **Status.** The surface is experimental. Its catalog entry `compile.compiler.native` says "This repo may dogfood it; public examples must not require it". It does not work with `compile.validator: 'shared'`.
    - **Adoption.** It shipped 2026-08-10 (c2b9db449). sdk-js and toolchain set it in every xy.config.ts, and 21 configs in the workspace use `compiler:`.
  - **Fix:** Add an "Experimental: native compiler" subsection under Type validation. Cover:
    - the two fields;
    - enabling it with `pnpm xyex enable ts-native` rather than by hand;
    - that the alias sits next to the JS `typescript` install and does not replace it, because ESLint, deplint, dead and api-exposure still load `typescript`;
    - that it cannot be combined with the shared validator;
    - that it must never appear in templates or public examples;
    - that agents should keep it when they find it, and repeat it in every package config (see the cascade item).
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:142-157, :171-177. ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveTscBin.ts:15-35. ariestools/toolchain/packages/toolchain/src/actions/enable/tsNative.ts:36-80. ariestools/toolchain/packages/toolchain/src/xy/stability.ts:146-151. ariestools/toolchain/docs/xy-config.md:33-39. ariestools/toolchain/docs/STABILITY.md:57-59, :99. ariestools/sdk-js/package.json:54. Output of `xyex.mjs enable ts-native --help`.
  - <sub>ids: skills/xy-toolchain/compilation.md#1, cov-config#2, cov-cli#17, cov-toolchain-history#15</sub>

- 🟠 **Monolith section omits most of `MonolithConfig` and the layout-sync behavior** · `verified`
  - **Now:** compilation.md:97-110 names `compile.monolith.modules`, `platforms`, `moduleLinkage`, the module options `export`, `model`, `subpaths`, `internal` and `reexport`, `copyEntries`, and `package-sync-layout [--check]`.
  - **Actual:**
    - **Module options.** Also `name`, `barrel` (used by every real monolith config), `barrelFrom` and `shimFrom`.
    - **Package options.** Also `modulesPlatform` (default 'neutral'; set to 'browser' in all 11 sdk-react monolith packages), `conditionalImports{package,tsconfig,distImports}`, `platformEntries`, `aliasImports`, `barrelImports`, `barrelPlatforms` and `index.custom` / `index.entries`. Defaults: `platforms` is ['neutral','node','browser'] and `moduleLinkage` is 'bundle'. Of these, `barrelFrom`, `shimFrom`, `aliasImports`, `conditionalImports` and `platformEntries` are used only in sdk-js/packages/sdk.
    - **External linkage.** With `moduleLinkage: 'external'`, every conditional import needs `distImports` or layout sync throws. Every `#module` specifier left in dist must resolve, or compile fails.
    - **Sync.** Emit-mode `package-compile` (and therefore `xy compile`) re-syncs the layout: package.json `imports`, tsconfig `paths`, src/index.ts, src/model.ts and the shims. `--validate-only` never writes, so the generated files must be committed.
    - **`package-sync-layout`.** It reads the xy.config of the current directory, so run it inside the package.
  - **Fix:** Add a compact option table with module options, package options and defaults. State the sync behavior and that generated files are committed. Give `pnpm --filter <pkg> exec package-sync-layout --check` as the drift check. Note the `distImports` and `#module` constraints. Reference ariestools/sdk-js/packages/sdk/xy.config.ts as the full-featured config and an sdk-react package for the browser `modulesPlatform` case.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/MonolithConfig.ts:30-188. ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithCompileLayout.ts:128-133, :275-320. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:105-171. ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithCompileDeclarations.ts:140-169. ariestools/toolchain/packages/toolchain/src/bin/package/sync-layout.ts:11-23. ariestools/sdk-react/packages/sdk-react-core/xy.config.ts:76. XYOracleNetwork/plugins/packages/payloadset/xy.config.ts:3-9.
  - <sub>ids: skills/xy-toolchain/compilation.md#5, cov-config#4</sub>

- 🟠 **The monolith identity invariant, platform variants and declaration sharing (10.0.9) are missing** · `unverified`
  - **Now:** compilation.md:95-110 states no identity rule.
  - **Actual:**
    - **The invariant.** Under external linkage, `#<module>` and `./<module>` must load the same file in every environment.
    - **Platform variants.** A real platform variant is declared on both sides: `conditionalImports.<module>` and `platformEntries.<platform>.<module>`.
    - **Sync warnings.** Layout sync warns about three cases: platformEntries shims that re-export the modules-platform source (a byte-identical second build), shims that `#module` does not select, and `#module` imports that disagree with exports.
    - **Declaration sharing.** Since 10.0.9, platform trees drop declarations identical to the modules-platform copy and import the shared one.
  - **Fix:** Add an "Identity invariant" paragraph to Monolith mode. Declare platform variants via conditionalImports plus platformEntries, never as a forwarding shim. Treat layout-sync warnings and `pub.importsMatchExports` errors as identity splits. Do not hand-copy .d.ts files.
  - **Evidence:** ariestools/toolchain/CHANGELOG.md:21, :27 (commits 92cf6bce9, 6e056462a, d0f17a92d). ariestools/toolchain/papers/YELLOW-PAPER.md §6.3. ariestools/toolchain/packages/toolchain/src/actions/package/compile/MonolithConfig.ts:124-187.
  - <sub>ids: cov-toolchain-history#6</sub>

- ⚪ **The emit engine and the esbuild override surface are not named** · `verified`
  - **Now:** Absent. compilation.md:56 only says not to describe the output as dist/esm + dist/cjs.
  - **Actual:** `xy compile` emits JavaScript with esbuild: bundled ESM `.mjs` with sourcemaps, `target: 'esnext'`, and `packages: 'external'` in library mode. It emits `.d.ts` with tsc (or the native compiler). Overrides merge from `compile.esbuild.options`, the deprecated `compile.tsup.options`, and per-srcDir options. Legacy tsup keys such as `dts`, `clean` and a top-level `entry` are ignored. Since 10.1.0, source dirs, entries, outdir/outfile and inject paths must resolve inside the package, or compile throws.
  - **Fix:** Add an "Emit engine" paragraph: esbuild for `.mjs` plus tsc for `.d.ts`; overrides go in `compile.esbuild.options`, not `tsup.options`; every configured path must stay inside the package directory.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:38-46, :119-126, :214-230, :252-271, :354-378, :436-443. Commit e7ea93749 (code-review item 3), in deploy 3320116a4.
  - <sub>ids: skills/xy-toolchain/compilation.md#8</sub>

- ⚪ **Troubleshooting omits the publint rules that catch monolith export and `#alias` drift** · `verified`
  - **Now:** compilation.md:134 says "inspect packed files, export maps, and remaining bare internal imports."
  - **Actual:** `pub.platform` (error, fixable) requires export maps to match every compiled output, including monolith barrels, model and value subpaths, platformEntries shims and copyEntries. `pub.importsMatchExports` (error, not fixable) requires every runtime `#alias` to select the same file as its same-named public subpath. Monolith compile itself fails on `#` specifiers left in dist that do not resolve.
  - **Fix:** Add to troubleshooting: run `pnpm xy publint` and read the `pub.platform` and `pub.importsMatchExports` findings before hand-editing exports. `--fix` can add missing monolith subpaths, but it will not add conditions that the `#alias` does not select.
  - **Evidence:** Output of `xy.mjs publint --rules`. ariestools/toolchain/CHANGELOG.md:19, :26. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:130-132.
  - <sub>ids: skills/xy-toolchain/compilation.md#11</sub>

- ⚪ **Typed but inert `XyConfig` fields are not flagged** · `unverified`
  - **Now:** Absent.
  - **Actual:** `dev.*` (`dev.build.*`, `dev.compile`), `liveShare`, `dynamicShare`, `compile.bundleTypes` and `compile.outDirAsBuildDir` all type-check, but no toolchain code reads them. XYOracleNetwork/xyo-chain/packages/cli/xy.config.ts:22-35 puts its compile entry and its esbuild `define` under `dev.compile`, so neither applies. `liveShare` appears in 4 workspace configs.
  - **Fix:** Add a note: "These fields type-check but do nothing in the current toolchain: `dev`, `liveShare`, `dynamicShare`, `compile.bundleTypes`, `compile.outDirAsBuildDir`. Put compile settings under `compile`."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:141, :181, :692-693, :712-727. A grep of ariestools/toolchain/packages/toolchain/src found no reader outside XyConfig.ts.
  - <sub>ids: cov-config#13</sub>

## `skills/xy-toolchain/eslint.md`

### Update

- 🟠 **A local `no-restricted-imports` block, including the one `xy lint init` writes, replaces the shared barrel and `src/` import bans** · `verified`
  - **Now:** eslint.md:22 says lint init "derives root-barrel import restrictions from installed SDK barrels". eslint.md:130 says "Place justified local overrides after the recommended config. Run `xy lint lint` to distinguish intentional additions…".
  - **Actual:**
    - **The shared rule.** The shared config sets `no-restricted-imports` to error. It bans the `./index.ts` … `../../../../../../../index.ts` barrel paths, and for files under src it adds the `**/src/**` patterns.
    - **What lint init adds.** When a barrel prompt is accepted, `xy lint init` appends an unscoped `{ rules: { 'no-restricted-imports': ['warn', { paths: [...barrels] }] } }` block after the recommended config.
    - **The effect.** Flat config replaces rule options per matching file, so the barrel and src/ bans disappear and the rule drops to warn. Scoping the block with `files` only limits which files lose the bans.
    - **Nothing reports it.** `xy lint lint` deliberately exempts this block from `lintlint.rule-override`.
    - **Reproduction.** With calculateConfigForFile, `[2,{paths:['./index.ts',…],patterns:[…'**/src/**'…]}]` becomes `[1,{paths:[{name:'@xylabs/hex',…}]}]`.
    - **Scope.** Two repos are affected: XYOracleNetwork/xl1-faucet-twitter/eslint.config.ts:145-150 and XYOracleNetwork/webble/eslint.config.ts:67-70. Only repos that accept an @xylabs or @xyo-network barrel prompt are hit.
  - **Fix:**
    - Add a caution at eslint.md:22 and in "Overrides and troubleshooting": a local `no-restricted-imports` entry with options replaces the shared options. Re-include the shared options and keep the level at `error`.
    - Spread `correctnessRulesConfig.rules['no-restricted-imports']` (the index.ts paths) and the `srcImportsConfig` patterns back in. Alternatively, put the barrel paths on `@typescript-eslint/no-restricted-imports`, which the shared tier-3 config does not set.
    - Say that `xy lint lint` does not report this block.
    - File a toolchain issue so that lint-init.ts:132-138 merges the shared restrictions and emits `error`.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/rules/correctness.ts:5-28. ariestools/toolchain/packages/eslint-config-flat/src/rules/index.ts:19-56. ariestools/toolchain/packages/eslint-config-flat/src/index.ts (export list). ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:46. ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:132-138. ariestools/toolchain/packages/toolchain/src/actions/lintlint.ts:183-197.
  - **Resolved contradiction:** One verifier said the shared lists are not exported. At 7eb43c3c2, ariestools/toolchain/packages/eslint-config-flat/src/index.ts does export `correctnessRulesConfig` and `srcImportsConfig`; only the arrays inside them are module-private. So the finding's spread-back fix works, and the verifier's alternative is kept as a second option.
  - <sub>ids: skills/xy-toolchain/eslint.md#0</sub>

- 🟠 **`xy lint init` is described as automatic; it is interactive, offers a fixed and partly deprecated barrel list, and can install packages at `latest`** · `verified`
  - **Now:** eslint.md:16-22 says "Prefer the generator… It detects React, installs the applicable config package and ESLint, generates `eslint.config.ts`, includes repository `.gitignore` behavior when the file exists, and derives root-barrel import restrictions from installed SDK barrels. Review the generated diff before accepting an overwrite."
  - **Actual:**
    - **Interactive only.** `xy lint init` has no flags and no non-interactive mode; it prompts through readline on stdin.
    - **No diff to review.** The "Replace it with eslint.config.ts? (y/N)" prompt comes before anything is generated.
    - **Fixed barrel list.** One y/N prompt follows per hard-coded barrel:
      - @xylabs/sdk-js (deprecated; use @ariestools/sdk)
      - @xylabs/sdk-react (deprecated; use @ariestools/sdk-react)
      - @xyo-network/sdk-js (deprecated; use @xyo-network/sdk)
      - @xyo-network/xl1-sdk
      - @xyo-network/chain-sdk
      - React repos only: @xyo-network/react-chain (npm E404) and @xyo-network/react-sdk

      @ariestools/sdk is not offered.
    - **Installs at `latest`.** Accepting a barrel that is not installed adds it at `latest` and runs install.
    - **Other changes.** Init deletes a legacy eslint.config.mjs. It adds `@ariestools/eslint-config(-react)-flat@^<toolchain>` and `eslint@^10.0.0`, which is below the ^10.3 peer.
  - **Fix:** Rewrite eslint.md:22 to say:
    - the command is interactive: an overwrite confirmation, then per-barrel prompts;
    - decline the deprecated @xylabs/* and @xyo-network/sdk-js barrels, because accepting installs them at `latest`, which conflicts with SKILL.md:12;
    - @ariestools/sdk restrictions are not generated;
    - the legacy .mjs config is removed;
    - review the result with `git diff` afterwards;
    - in a non-interactive agent shell, ask the user to run it, or hand-write the config from the template.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:21-29, :56-82, :201-215, :243-268, :280. ariestools/toolchain/packages/toolchain/src/xy/lint/lint/initCommand.ts:6-13. `npm view @xylabs/sdk-js deprecated`, `npm view @xylabs/sdk-react deprecated` and `npm view @xyo-network/sdk-js deprecated` all return deprecation notices. `npm view @xyo-network/react-chain` returns E404.
  - <sub>ids: skills/xy-toolchain/eslint.md#1, cov-configpkgs#1</sub>

- 🟠 **Tier severity description is stale after the unicorn v77 staging in 10.1.0** · `unverified`
  - **Now:** eslint.md:96 says "Tier 3 and 4 additions commonly begin as warnings. Use `pnpm xy lint --strict` … Use tier 4 for evaluation". The table row at eslint.md:94 says "4 | Experimental/canary rules for migration testing".
  - **Actual:** Moving from tier 2 to tier 3 turns 38 rules into errors (29 off→error, 9 warn→error) and adds 22 warnings. The new errors include the opinionated unicorn preset, `@typescript-eslint/strict-boolean-expressions`, `unicorn/filename-case`, and `workspaces/no-relative-imports` and `require-dependency`. Moving from tier 3 to tier 4 adds 68 warnings and promotes 22 unicorn v77 rules from warn to error; the v77 rules are off at tier 2, warn at tier 3 and error at tier 4. So moving to tier 4 can fail lint even without `--strict`.
  - **Fix:** Replace line 96 with that summary, and point to `xy lint --analyze` to preview the impact before changing tier.
  - **Evidence:** calculateConfigForFile against the eslint-config-flat 10.1.0 dist. ariestools/toolchain/packages/eslint-config-flat/src/tiers/tier-builder.ts:87-110. ariestools/toolchain/packages/eslint-config-flat/src/tiers/opinionated.ts:72-77, :134-148. ariestools/toolchain/packages/eslint-config-flat/src/unicorn/index.ts:243-277, :332-338. Commit a499070cc.
  - <sub>ids: cov-configpkgs#2</sub>

- ⚪ **JSON linting is not part of `recommendedConfig`** · `verified`
  - **Now:** eslint.md:109 says "The non-React config composes TypeScript ESLint, core JavaScript/JSON/Markdown rules, Import X, …".
  - **Actual:** Tier 0 includes `markdownConfig` only. `jsonConfig`, `jsoncConfig` and `json5Config` (duplicate-key checks) and `docsConfig` (Markdown plus the JSON layers) are exported for opt-in use, and nothing generated uses them.
  - **Fix:** Change the text to "core JavaScript and Markdown rules". Add that JSON, JSONC and JSON5 linting is opt-in via `jsonConfig` / `jsoncConfig` / `json5Config` or `docsConfig`.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/tiers/tier-builder.ts:37-43, :117-126. ariestools/toolchain/packages/eslint-config-flat/src/index.ts:9-14. ariestools/toolchain/packages/eslint-config-flat/src/json/index.ts:6-28. `recommendedConfig()` from dist registers no json plugin.
  - <sub>ids: skills/xy-toolchain/eslint.md#5, cov-configpkgs#11</sub>

- ⚪ **The hand-written template differs from the generator output it calls canonical** · `verified`
  - **Now:** eslint.md:28-36 says "Use the generator's output as canonical", then shows `{ ignores: ['build', '**/build/**', 'dist', '**/dist/**', 'node_modules/**'] }`. eslint.md:70 says "Add `configReactStorybook` explicitly only when Storybook files need that layer".
  - **Actual:** The generator emits ignores `['.yarn/**', 'build', '**/build/**', '**/dist/**', 'dist', 'node_modules/**', '**/node_modules/**', '**/*.md', '.claude/worktrees/*']`. Because of `**/*.md`, generated configs (and sdk-js and cli-kit) never run the tier-0 Markdown rules. For React repos, the generator always spreads `...configReactStorybook`.
  - **Fix:** Copy the generator's ignores into the template, or keep the minimal one and say that generated configs ignore `**/*.md`. Say that `lint init` always adds `configReactStorybook` for React repos, and that it can be removed when there are no stories.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:107-114, :129-130. ariestools/sdk-js/eslint.config.ts:14. ariestools/cli-kit/eslint.config.ts:14.
  - <sub>ids: skills/xy-toolchain/eslint.md#6, cov-configpkgs#1, cov-configpkgs#11</sub>

### Add

- 🟠 **Lint execution modes and performance controls are missing, though SKILL.md routes "lint performance" here** · `verified`
  - **Now:** Absent. SKILL.md:38 routes "diagnosing lint performance" to eslint.md, but the commands table (eslint.md:113-124) has no `--mode`.
  - **Actual:**
    - **Modes.** `xy lint --mode` takes one of three values:
      - `package-workers`: the default; a persistent worker pool.
      - `shared-typecheck`: experimental surface `lint.mode.shared-typecheck`. Shares TypeScript ingestion and runs the semantic phase without the ESLint cache.
      - `workspace-eslint`: the direct ESLint CLI; a package target delegates to that package's lint script.
    - **Deprecated flags.** The hidden `--next` / `--prev` flags are deprecated aliases for `--mode`.
    - **Worker memory.** Since 10.0.8, workers are recycled once they pass an RSS budget, set by `XY_LINT_WORKER_MAX_RSS_MB` (default 2048).
    - **Already covered.** `--jobs` and `--profile` are documented as global controls at commands.md:21 and :25.
  - **Fix:** Add a "Performance" subsection covering the three modes (marking shared-typecheck as experimental per `xy --stability`), `XY_LINT_WORKER_MAX_RSS_MB` for memory-bound runners, and `--mode` instead of `--next` / `--prev`. Link to the global `--jobs` and `--profile` in commands.md rather than repeating them.
  - **Evidence:** Output of `xy.mjs lint --help`. ariestools/toolchain/packages/toolchain/src/actions/lintMode.ts:1-9. ariestools/toolchain/packages/toolchain/src/xy/lint/lint/runCommand.ts:43-60. ariestools/toolchain/packages/toolchain/src/actions/lintNextWorker.ts:381-382. ariestools/toolchain/packages/toolchain/src/xy/stability.ts:157-161. ariestools/toolchain/docs/STABILITY.md:61. ariestools/toolchain/packages/toolchain/README.md:240-266. Commit bc8e52802.
  - <sub>ids: skills/xy-toolchain/eslint.md#3, cov-config#14, cov-cli#15, cov-configpkgs#13, cov-toolchain-history#16</sub>

- 🟠 **`xy lint lint` coverage is thin, and its `--fix` can delete deliberate tier-3 overrides** · `verified`
  - **Now:** eslint.md:122-123 says "`xy lint lint` | Check the local config against toolchain conventions" and "`xy lint lint --fix` | Normalize supported config-package, rule, and `.gitignore` issues". eslint.md:64-68 and :130 tell agents to rely on it.
  - **Actual:**
    - **Rules.** There are four warn-level rules: `lintlint.config-package` (fixable), `lintlint.gitignore` (fixable), `lintlint.redundant-rule` (fixable) and `lintlint.rule-override` (report only). `xy lint lint --rules` lists them, `commands.lintLint.rules` sets their levels, and `xy check` (with or without `--fix`) runs them.
    - **Migration.** `config-package` detects `@xylabs/eslint-config(-react)-flat`. `--fix` rewrites the import and the devDependency to `@ariestools/*`, then runs install.
    - **Baseline.** The redundant and override analysis compares against the deprecated `config` export, which is tier 2 type-checked (plus Storybook for React), not against the repo's chosen tier. 62 rules differ between tier 2 and tier 3.
    - **Risk.** A deliberate tier-3 override that equals the tier-2 value, such as `'@typescript-eslint/strict-boolean-expressions': 'off'`, is classed as redundant. `--fix` then deletes it and the error comes back. A setting equal to the tier-3 value is reported as an override.
  - **Fix:** List the four rule ids, `--rules`, `commands.lintLint.rules`, and that `xy check` runs it. Describe `--fix` as the migration path off `@xylabs/eslint-config(-react)-flat`. Add the tier-2 baseline caveat, and tell agents to review `lintlint.redundant-rule` findings before accepting `--fix`.
  - **Evidence:** Output of `xy.mjs lint lint --rules`. ariestools/toolchain/packages/toolchain/src/actions/lintlint.ts:85-87, :127-130, :263-301, :328-405. ariestools/toolchain/packages/toolchain/src/actions/barrel/restrictionHelpers.ts:28-33. ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:67. ariestools/toolchain/docs/xy-config.md:45. ariestools/toolchain/packages/eslint-config-flat/src/tiers/index.ts:85.
  - <sub>ids: skills/xy-toolchain/eslint.md#7</sub>

- 🟠 **No list of the high-impact rules agents hit at tier 3** · `unverified`
  - **Now:** Absent. eslint.md:84-111 describes tiers and plugin families only, and skills/xy-development/typescript.md:5 defers lint-enforced opinions to ESLint.
  - **Actual:** At the default tier 3 with type checking, these are errors:
    - `strict-boolean-expressions`, which is why toolchain code writes `isVerbose === true`
    - `no-explicit-any`
    - `consistent-type-definitions` (interface)
    - `unicorn/import-style` and `prefer-node-protocol` (`import PATH from 'node:path'`)
    - `unicorn/prefer-export-from`
    - `no-restricted-imports` for index.ts barrels and other packages' `src/`
    - `complexity` 18, `max-depth` 6, `max-lines` 512, `max-statements` 32
    - `member-ordering` (alphabetical)
    - `unicorn/filename-case`
    - `workspaces/no-relative-imports` and `require-dependency`
    - `no-floating-promises` and `no-misused-promises`

    These stay warnings: the enum ban via `no-restricted-syntax`, `consistent-type-imports`, `simple-import-sort`, `@stylistic/max-len` 200, and `explicit-member-accessibility` (no-public).
  - **Fix:** Add a "Rules you will hit at tier 3" section with a one-line fix for each rule. Examples: write `if (value !== undefined)` instead of relying on truthiness; put `import type` on its own line; split files over 512 lines. Add a cross-reference sentence in skills/xy-development/typescript.md.
  - **Evidence:** The computed tier-3 config (calculateConfigForFile, eslint-config-flat 10.1.0 dist). ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:46-152. ariestools/toolchain/packages/eslint-config-flat/src/rules/index.ts:8-56. ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:117-170.
  - <sub>ids: cov-configpkgs#3</sub>

- ⚪ **All-workspace `xy lint` is incremental and can lint nothing; `--meta`, `--no-cache`, `--skip-empty` and the deprecated `relint` are missing** · `verified`
  - **Now:** eslint.md:132 says "If no files are linted, verify workspace discovery, source globs, meta-package handling, and `--skip-empty`." The table (eslint.md:115-124) lacks these flags. commands.md:27 and toolchain.md:108 describe `--no-incremental` for compile and build only.
  - **Actual:**
    - **Incremental by default.** With no package and neither `--fix` nor `--analyze`, `xy lint` lints only the workspaces changed since the last clean run. If none changed, it prints "No changed packages to lint." and exits 0.
    - **Full runs.** Changes to the root eslint, tsconfig or xy config, or to the lockfile, force a full run. So do `--no-incremental` and `--fresh`.
    - **Other flags.** `--meta full|skip` (default full), `--no-skip-empty` and `-c/--no-cache`.
    - **Deprecated.** `xy relint` is deprecated in favor of `xy lint --fresh`.
  - **Fix:** Add the incremental note to troubleshooting. Add rows for `--meta skip`, `--no-cache` and `--no-skip-empty`, and a deprecation note for `xy relint`. Broaden commands.md:27 and toolchain.md:108 to cover lint.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/lint/lint/runCommand.ts:17-32, :77-105, :124. ariestools/toolchain/packages/toolchain/src/actions/lint.ts:94-98, :154-181. ariestools/toolchain/packages/toolchain/src/actions/incremental.ts:170-178, :445-446. ariestools/toolchain/packages/toolchain/src/actions/relint.ts:53-57. Output of `xy relint --help`.
  - <sub>ids: skills/xy-toolchain/eslint.md#4, cov-cli#15, cov-configpkgs#13</sub>

- ⚪ **`--fresh` silently drops `--fix`, `--type-checked`, `--analyze`, `--skip-empty` and `--meta`** · `verified`
  - **Now:** eslint.md:119 says "`xy lint --fresh` | Clear lint caches and run from a fresh snapshot". eslint.md:126 says "Use `--fresh` when config changes …".
  - **Actual:** With `--fresh`, runCommand calls `relint({ gitignore, jobs, mode, pkg, verbose })` and passes nothing else. relint then runs lint with `cache: false` and no fix, so `xy lint --fresh --fix` fixes nothing. This is a toolchain defect.
  - **Fix:** Note that `--fresh` should run on its own, followed by a separate `xy lint --fix` or `--type-checked` run if needed. Optionally file a toolchain issue.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/lint/lint/runCommand.ts:108-116. ariestools/toolchain/packages/toolchain/src/actions/relint.ts:45-57.
  - <sub>ids: skills/xy-toolchain/eslint.md#8</sub>

- ⚪ **The stable `xy cycle` import-cycle command is not documented** · `verified`
  - **Now:** Absent from every skill file.
  - **Actual:** `xy cycle [package]` is stable. It runs the lint pipeline with `import-x/no-cycle` at `--depth` (default 25), and accepts `--rules` and `--no-cache`. The shared config only warns on cycles, at maxDepth 5.
  - **Fix:** Add a Commands row: "`xy cycle [package] [--depth N]` — a deeper import-cycle check than the shared `import-x/no-cycle` (maxDepth 5)." The release and maintenance table in commands.md can link here.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/lint/cycleCommand.ts:9-53. ariestools/toolchain/packages/toolchain/src/actions/lint.ts:219-225. ariestools/toolchain/packages/eslint-config-flat/src/import/index.ts:35-38. Output of `xy.mjs --stability --json`.
  - <sub>ids: skills/xy-toolchain/eslint.md#9, cov-cli#15, cov-toolchain-history#16</sub>

- ⚪ **Troubleshooting omits the exported type-check gate layer** · `unverified`
  - **Now:** eslint.md:132 says "If type-aware lint is slow or fails on config files, verify the applicable tsconfig before disabling type checking."
  - **Actual:** eslint-config-flat exports `buildTypeCheckGateLayer()`, along with `collectTypeCheckedRuleNames` and `findEnabledTypeCheckedRules`. It switches off only the type-aware rules for a file glob. The toolchain's own eslint.config.ts uses it, with projectService disabled, for scaffold files that sit outside any tsconfig. eslint-config-react-flat does not re-export it.
  - **Fix:** Add an example: `{ files: [...], languageOptions: { parserOptions: { projectService: false, project: false } }, rules: buildTypeCheckGateLayer().rules }`, imported from @ariestools/eslint-config-flat. React repos then also need eslint-config-flat as a direct devDependency.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/index.ts. ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/index.ts:77-82. ariestools/toolchain/eslint.config.ts:17-28. ariestools/toolchain/packages/eslint-config-react-flat/src/index.ts:1-2.
  - <sub>ids: cov-configpkgs#14</sub>

## `skills/xy-toolchain/project-profiles.md`

### Update

- ⚪ **`library/cli` is auto-detected only from `main`/`module` or a non-root export subpath** · `verified`
  - **Now:** project-profiles.md:25 says "A package with both `bin` and an importable public API is **library/CLI**". :49 says "role `cli` unless it also exposes an importable API (`library/cli`)". :63 says "Deplint auto-detects a **role**".
  - **Actual:** For a `bin` package, deplint counts a library surface only from `main`, `module`, or an exports key other than `.`, `./package.json` and `./README.md`. So a bin with only a `.` export, a string `exports`, or only `types` is auto-detected as `cli` (peerTarget 'dep', no peer promotion). The heuristic is deliberate, and it only changes peer-vs-dep policy for an uncommon package shape, so the verifier rated it polish.
  - **Fix:** After :25, or in the role table at :68, add: "Deplint auto-detects `library/cli` only when a `bin` package also has `main`, `module`, or an export subpath other than `.`, `./package.json` or `./README.md`. If a `bin` package's `.` export is a real runtime API, set `commands.deplint.role: 'library/cli'`."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/isTerminalPackage.ts:76, :157-176, :287-293. ariestools/toolchain/packages/toolchain/spec/deplint/isTerminalPackage.spec.ts:111-145. A read-only classifier run returns `cli` for ariestools/toolchain/packages/toolchain and `library/cli` for ariestools/sdk-meta-server-nodejs.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#1</sub>

- ⚪ **The `prodInstallMatters` and graph-trust description is inaccurate** · `verified`
  - **Now:** project-profiles.md:75 says "for roles where `prodInstallMatters` is true (`service`, many CLIs), demotion (`move-to-dev`) is allowed only when the analyzer has real entry roots (manifest, `bin`, start scripts, or framework entries → reachable files)". :71 says of `app`: "test-only tooling may move to dev".
  - **Actual:** `prodInstallMatters` defaults to true for `app`, `cli`, `library/cli` and `service`. `runtimeEntry: 'framework'` currently means manifest plus start scripts; no framework entries are discovered. Trust comes from declared root strings (or runtimeEntry 'none'), not from reachable files. A typical Vite or Next app has no main/exports and no `node <file>` start script, so its graph is untrusted and `move-to-dev` stays suppressed until `runtimeRoots` is set.
  - **Fix:** Rewrite :75 as: "prodInstallMatters defaults to true for `service`, `cli`, `library/cli` and `app`. `move-to-dev` is then allowed only when declared runtime roots exist (manifest, bin or start-script entries, or `runtimeRoots`); framework entries are not auto-discovered." At :71, add "set `runtimeRoots` (e.g. `src/main.tsx`) for demotion to apply."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/isTerminalPackage.ts:99-149, :388-395. ariestools/toolchain/packages/toolchain/src/actions/deplint/findFiles.ts:330, :352-353, :386-389. ariestools/toolchain/packages/toolchain/src/actions/deplint/snapshot.ts:260-261.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#5</sub>

- ⚪ **The role override example pairs `compile.node: true` with a `dist/neutral` runtime root and lists only some facets** · `verified`
  - **Now:** project-profiles.md:86-96 shows `role: 'service'` with the comment `// runtimeRoots: ['dist/neutral/index.mjs']`, plus `prodInstallMatters` and `runtimeEntry`, next to `compile: { node: true }`.
  - **Actual:** Enabling any compile target turns every unlisted target off, so `{ node: true }` emits dist/node only and dist/neutral never exists. A missing root still counts as declared, and deplint falls back to source imports. DeplintConfig also accepts the facets `hasImportConsumers`, `allowMoveToDev` and `peerTarget` ('peer' | 'dep' | 'none'). commands.md:67 defers to this file for the full facet reference, so the facets must be documented here.
  - **Fix:** Change the commented root to `runtimeRoots: ['dist/node/index.mjs']`, or to a source entry such as `src/index.ts` that matches the start script. Add commented `hasImportConsumers`, `allowMoveToDev` and `peerTarget` lines, or a one-line facet list.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/XyConfig.ts:237-250, :441-525. ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.md:135-145.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#6</sub>

### Add

- 🔴 **Single-package repos with no exports or bin are auto-classified `workspace-root`, and `xy fix` then demotes their runtime dependencies** · `verified`
  - **Now:** project-profiles.md:63 says "Deplint auto-detects a **role**". :72 describes `workspace-root` as "Monorepo root / meta package". The single-package section (:108-115) never mentions roles. :129 says "A private monorepo root is commonly `workspace-root`".
  - **Actual:**
    - **Detection.** detectRole checks for a workspace root first. Any package directory with a `workspaces` field or a `pnpm-workspace.yaml`, and no library surface or bin, becomes `workspace-root`. That role's defaults are runtimeEntry 'none', prodInstallMatters false and peerTarget 'none'.
    - **Consequence.** runtimeEntry 'none' turns off the source fallback and counts as a trusted graph, so `move-to-dev` is allowed.
    - **Why single-package repos match.** Every pnpm repo must keep pnpm-workspace.yaml, because packman lint errors without it. So a single-package private service or app is classified `workspace-root`, and `xy fix` (which runs `deplint --fix`) moves its runtime dependencies to devDependencies.
    - **Observed.** Read-only classifier runs return `workspace-root` for xylabs/api-coin-xl1, xylabs/web-xylabs.com-react and XYOracleNetwork/app-portal.xyo.network-react. XYOracleNetwork/api-automation-witness-nodejs/xy.config.ts:6 already works around this.
  - **Fix:**
    - Add a step to "Single-package repository": "If the root package has no `main`/`module`/`exports` and no `bin`, set `commands.deplint.role` explicitly in the root xy.config.ts, e.g. `{ role: 'service', runtimeRoots: ['src/index.ts'] }`. Deplint classifies any package with `pnpm-workspace.yaml` (which packman lint requires) or a `workspaces` field, and no library or bin surface, as `workspace-root`, and that role demotes runtime dependencies."
    - Reword :72 and :129: detection depends on a workspace marker plus no library or bin surface, not on the repo being a monorepo.
    - Consider a toolchain issue: a root whose pnpm-workspace.yaml lists no packages should not be classified `workspace-root`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/isTerminalPackage.ts:142-148, :234-242, :282-285. ariestools/toolchain/packages/toolchain/src/actions/deplint/snapshot.ts:260-271. ariestools/toolchain/packages/toolchain/src/actions/deplint/getExternalImportsFromFiles.ts:126-128. ariestools/toolchain/packages/toolchain/src/actions/packman/lint.ts:147-152, :170-172. ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:55-63. ariestools/toolchain/packages/toolchain/src/actions/fix.ts:21.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#0</sub>

- 🟠 **The visibility axis is missing, and following :125 fails the error-level `dep.*.not-public` rules** · `verified`
  - **Now:** project-profiles.md:36 says "Identify whether the package is independently publishable, deployable, or only a private workspace orchestrator." :125 says "Keep workspace-internal runtime packages in `dependencies`; do not convert them mechanically to peers." The file never mentions `publishConfig.access` or the not-public rules.
  - **Actual:** Since 10.0.3, deplint distinguishes public packages. A package is public when it is not `private` and is either unscoped or has `publishConfig.access: 'public'`; a scoped package without `access` counts as restricted. A public package may not list any of these in `dependencies` or `peerDependencies`:
    - a private or restricted workspace sibling
    - a `file:`, `link:`, `portal:`, `catalog:`, `patch:` or git spec
    - a name that is not on npmjs

    Both rules are errors and cannot be auto-fixed. So keeping a private sibling in a published package's dependencies, as :125 advises, fails `xy deplint` and `xy build`.
  - **Fix:** Add a Visibility axis (private / restricted / public, derived from `private` and `publishConfig.access`) to the table at :17-23. Extend monorepo item 5: "…but a public package may depend only on public siblings. Give each sibling `publishConfig.access: 'public'`, or bundle private implementations with vendor mode (private packages in devDependencies). `dep.dependencies.not-public` / `dep.peerDependencies.not-public` are errors and are not auto-fixable."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/lib/classifyPackageVisibility.ts:13-23. ariestools/toolchain/packages/toolchain/src/actions/deplint/rulesNotPublic.ts:39-70, :123-145. ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.md:3, :17, :211, :231. Output of `xy.mjs deplint --rules`. `git tag --contains 2f9db7e4e` → v10.0.3.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#2</sub>

- ⚪ **The role auto-detection order and its limits are undocumented** · `verified`
  - **Now:** project-profiles.md:63 lists the roles as auto-detected, including `tooling`. :79 says "Set an explicit role when metadata cannot express the product shape".
  - **Actual:** detectRole has no `tooling` branch. `app` requires `private: true`, no node/tsx start-script entry, and a dependency on vite, vite-node, next, nuxt, @sveltejs/kit, @remix-run/dev or react-scripts. A private package with no surface falls back to `service`, and a non-private package without exports, main or bin falls back to `library`. The `tooling` defaults (runtimeEntry 'none', prodInstallMatters false) mean `bin` scripts are not runtime roots unless overridden. The toolchain's deplint rules.md:84 and :113 still describe tooling auto-detection.
  - **Fix:** After :63, add the detection order: workspace-root → library or library/cli → cli → private with a start entry = service → private with a framework dependency = app → private fallback = service → otherwise library. State that `tooling` must be set explicitly, and that a tooling package with a shipped bin also needs `prodInstallMatters: true, runtimeEntry: 'manifest'`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/deplint/isTerminalPackage.ts:78-94, :135-141, :282-304. ariestools/toolchain/packages/toolchain/src/actions/deplint/rules.md:84, :113.
  - <sub>ids: skills/xy-toolchain/project-profiles.md#4</sub>

## `skills/xy-toolchain/testing.md`

### Update

- 🔴 **Workspace-scoped test runs skip the root `@ariestools/vitest-config` preset** · `verified`
  - **Now:** testing.md:171-177 says "Use the toolchain for all tests, one workspace, or one file/folder path: … pnpm xy test @scope/package". :182-183 show `pnpm xy retest @scope/package`. :186 says to "invoke the installed Vitest through the package manager in the correct package". The same file recommends a single root preset config (:25, :98).
  - **Actual:**
    - **Where Vitest starts.** For a workspace target, `xy test` and `xy retest` run `pnpm --filter <name> exec run-or-exec vitest .` (retest clears the cache first), so Vitest starts in the package directory.
    - **What it misses.** Vitest 5.0.3 looks for a config only in the cwd or `--root` and never searches upward, so the root preset is never loaded. That means: no `browser` project; no spec/node vs spec/browser routing, so spec/browser specs run in plain Node; no `watch: false`; no `**/.claude/**` exclude; and no root setup such as sdk-js's dotenv load. Vitest's default include applies instead.
    - **Same route.** A path target that exactly matches a workspace location (e.g. `packages/foo`) takes the same route, and so does `pnpm exec vitest` run inside a package.
    - **Affected repos.** sdk-js, sdk-react, actor-kit, browser-kit and cli-kit have no package-level vitest config. sdk-js, actor-kit and browser-kit have spec/browser directories.
  - **Fix:**
    - In "Running tests", say that with a root preset, scoped runs must start from the repo root. Use a path that is not exactly a workspace location (`pnpm xy test packages/example/src`), or run `pnpm exec vitest run packages/example/` from the root, adding `--project node|browser` as needed.
    - Change "in the correct package" to "from the directory containing vitest.config.ts (the repo root under the preset)".
    - Keep `xy test|retest @scope/package` only with the caveat that they use a package-level config.
    - Optionally raise a toolchain issue to pass `--root` / `--config` in workspace mode.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/test.ts:10-11. ariestools/toolchain/packages/toolchain/src/actions/retest.ts:10-14. ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:112, :180-188. ariestools/toolchain/packages/toolchain/src/lib/runOrExecPlan.ts:12-17. ariestools/toolchain/packages/toolchain/src/pm/resolveWorkspace.ts:10-14. vitest 5.0.3 dist/chunks/index.DpLw24bj.js:14267-14275, :14823-14836. A `find` for vitest.config.* under ariestools/{sdk-js,sdk-react,actor-kit,browser-kit,cli-kit}/packages returns 0 in each repo.
  - <sub>ids: skills/xy-toolchain/testing.md#0</sub>

- 🟠 **The preset's default `include` is stale: two globs, ts/tsx/mts/cts, and package-root `spec/`** · `verified`
  - **Now:** testing.md:73 says "Default include: `packages/*/src/**/spec/**/*.spec.ts`." The table row at :77 repeats it.
  - **Actual:**
    - **New default.** Since @ariestools/vitest-config 10.1.0, `XY_VITEST_DEFAULT_INCLUDE` is `['packages/*/src/**/spec/**/*.spec.{ts,tsx,mts,cts}', 'packages/*/spec/**/*.spec.{ts,tsx,mts,cts}']`. Package-root `spec/` folders (the skill's own example layout at :148) and .tsx/.mts/.cts specs are found without an override. An agent who copies the old glob as an explicit `include` drops them.
    - **Older versions.** 10.0.x used only the single src glob, and several org repos are still there: sdk-js, actor-kit and browser-kit at 10.0.7, sdk-react at 10.0.8.
    - **Excludes.** The `**/node_modules/**` and `**/.claude/**` realm excludes predate 10.1.0.
  - **Fix:** Replace :73 and :77 with the two-glob default, labeled "since 10.1.0; 10.0.x used `packages/*/src/**/spec/**/*.spec.ts` and needs an include override for package-root spec/ or .tsx specs". Mention the exported constant so overrides can extend it: `include: [...XY_VITEST_DEFAULT_INCLUDE, 'extra/**']`. Note the built-in node_modules and .claude excludes.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defaults.ts:1-4, :12. `git show v10.1.0:packages/vitest-config/src/defaults.ts`. ariestools/toolchain/packages/vitest-config/README.md:22, :64. ariestools/toolchain/docs/profiles.md:56. Commit e7ea93749 (item 13). The installed 10.1.0 dist/node/index.mjs:2-5 in ariestools/cli-kit/node_modules/@ariestools/vitest-config. ariestools/toolchain/packages/vitest-config/src/options.ts:64 still carries the old docstring.
  - <sub>ids: skills/xy-development/testing.md#4, skills/xy-toolchain/testing.md#1, cov-config#9, cov-configpkgs#6, cov-toolchain-history#5</sub>

- 🟠 **Single-package repos are told to hand-roll Vitest, but the preset with `include` is the documented and scaffolded path** · `verified`
  - **Now:**
    - testing.md:98 says to "keep a hand-rolled config when the package is a single-package repo or deliberately diverges". :104 says "For single-package repos or intentional one-offs, a minimal Node config is …". :25 limits the preset to monorepos.
    - project-profiles.md:57 says "Prefer `@ariestools/vitest-config` in monorepos", and :127 says the same.
    - toolchain.md:47, :60 and :117 repeat the monorepo-only framing.
  - **Actual:**
    - **Toolchain docs.** The vitest-config README says a single-package repo must pass `include`, e.g. `['src/**/spec/**/*.spec.{ts,tsx,mts,cts}']`. STABILITY.md lists the package as "stable (monorepo default include; pass `include` for a single package)".
    - **Scaffold.** Since 9.2.0, `xy repo init` scaffolds `defineXyVitestConfig({ include: ['{{testInclude}}'] })` for both layouts. Without `include`, the default `packages/*` globs match nothing in a single-package repo.
    - **Practice.** All five ariestools repos use the preset.
    - **Globals.** The preset sets `watch: false` but not `globals: true`, which the hand-rolled examples set.
  - **Fix:** Recommend the preset for both layouts at testing.md:25 and :98, using `defineXyVitestConfig({ include: ['src/**/spec/**/*.spec.{ts,tsx,mts,cts}'] })` for single-package repos. Keep hand-rolled configs for deliberate divergence only, such as the toolchain repo itself. Note that the preset does not enable `globals`: import from 'vitest' or pass `test: { globals: true }`. Mirror this in one line at project-profiles.md:57, :112 and :127, and at toolchain.md:47, :60 and :117.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/README.md:24. ariestools/toolchain/docs/STABILITY.md:44. ariestools/toolchain/docs/profiles.md:54-58. ariestools/toolchain/packages/toolchain/templates/repo/cli/root/vitest.config.ts.tmpl:1-5. ariestools/toolchain/packages/toolchain/src/actions/repo-init/templateVars.ts:84-87. ariestools/toolchain/packages/vitest-config/src/defineXyVitestConfig.ts:14-22. ariestools/toolchain/CHANGELOG.md:58 [9.2.0]. ariestools/toolchain/docs/ROADMAP.md:57 (D8).
  - <sub>ids: skills/xy-toolchain/testing.md#2, skills/xy-toolchain/project-profiles.md#3, cov-configpkgs#7, cov-toolchain-history#5</sub>

- ⚪ **Realm routing is broader than the table says** · `verified`
  - **Now:** testing.md:90-94 route `…/spec/node/…` and `…/spec/browser/…`. :96 says "or exclude `**/spec/node/**` from the browser project if using a hand-rolled config".
  - **Actual:** The node project excludes `**/spec/**/browser/**` and the browser project excludes `**/spec/**/node/**`. A `node/` or `browser/` directory at any depth under `spec/` therefore routes the spec; for example, `spec/feature/node/x.spec.ts` is Node-only.
  - **Fix:** Describe the segments as `…/spec/**/node/…` and `…/spec/**/browser/…`. Change :96 to exclude `**/spec/**/node/**` from the browser project and `**/spec/**/browser/**` from the node project.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defaults.ts:14-22.
  - <sub>ids: skills/xy-toolchain/testing.md#7, cov-configpkgs#16</sub>

- ⚪ **The spec-layout rule and its scope are not named** · `verified`
  - **Now:** testing.md:161 says "the current repository-layout rule and compiler exclusions are built around `.spec.ts` and `spec/` conventions". :143 says every .spec.ts file lives in spec/ "within its package", without qualification.
  - **Actual:**
    - **The rule.** It is `repo.spec-layout` (error), run by `xy repo lint`, which `xy check` includes. commands.md:39 and :160 already name the commands.
    - **Scope.** It scans only `*.spec.ts` files in non-root workspace packages, skipping node_modules, dist, build, .git, .claude and nested checkouts. Root-only single-package repos are therefore not checked.
    - **Emit filter.** Compile's emit filter drops `.spec.`, `/spec/`, `.stories.` and `.example.` files, but not `.test.` files.
  - **Fix:** Name `repo.spec-layout` (error) at :161 and cross-link commands.md "Repository policy". Add that it checks workspace packages only. Optionally note that .spec.tsx/.mts/.cts files should follow the same placement even though the rule does not check them.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:345-349. ariestools/toolchain/packages/toolchain/src/actions/package-lint-specs.ts:13, :29, :49-52. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileTsc.ts:90. Output of `xy.mjs repo lint --rules`.
  - <sub>ids: skills/xy-toolchain/testing.md#9</sub>

- ⚪ **The spec example imports with `.js`, against the `.ts` house convention** · `unverified`
  - **Now:** testing.md:202 has `import { validateMove } from '../validateMove.js'`. typescript.md:34 lists `allowImportingTsExtensions` but gives no usage rule.
  - **Actual:** The base tsconfig enables `allowImportingTsExtensions`. Toolchain source and the `xy repo init` templates use `.ts` in relative imports, and the toolchain has no `.js` relative imports. sdk-react (891 `.ts`, 0 `.js`) and actor-kit (268, 0) are the same, and sdk-js uses `.ts` in nearly all cases (670 vs 22).
  - **Fix:** Change the import to `'../validateMove.ts'`. Under typescript.md "Understand the base config", add: "Use `.ts` extensions in relative imports; the toolchain rewrites them on emit."
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:4. ariestools/toolchain/packages/toolchain/templates/repo/cli/package/src/index.ts.tmpl. Grep counts over packages/*/src in ariestools/toolchain, ariestools/sdk-js, ariestools/sdk-react and ariestools/actor-kit.
  - <sub>ids: cov-configpkgs#19, cov-toolchain-history#19, arch-layering#21</sub>

### Add

- 🟠 **The hand-rolled config examples lack the `**/.claude/**` exclude** · `verified`
  - **Now:** testing.md:106-115 and :119-128 show `defineConfig({ test: { environment, globals } })` with no exclude.
  - **Actual:** Claude Code background sessions create full git worktrees under `.claude/worktrees/**`. Vitest 5.0.3's default exclude covers only node_modules and .git, so a config copied from the skill collects specs from those checkouts. The preset excludes `**/node_modules/**` and `**/.claude/**`, and the toolchain's own root config uses `exclude: [...configDefaults.exclude, '**/.claude/**']`.
  - **Fix:** Add `exclude: [...configDefaults.exclude, '**/.claude/**']` to both examples, importing `configDefaults` from 'vitest/config', with a one-line reason. Note that the preset already excludes both.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defaults.ts:6-22. ariestools/toolchain/vitest.config.ts:1-14. Commit be4726332 (2026-08-27).
  - <sub>ids: skills/xy-toolchain/testing.md#3</sub>

- ⚪ **Preset options and exports beyond the table are undocumented** · `verified`
  - **Now:** testing.md:75-84 list include, exclude, browser, node, projects and test, and mention `defineXyVitestProjects` and `defineXySerializedProject` (hookTimeout/testTimeout) only.
  - **Actual:**
    - **Exports.** `XY_VITEST_DEFAULT_INCLUDE`, `XY_VITEST_NODE_EXCLUDE` (`**/spec/**/browser/**`), `XY_VITEST_BROWSER_EXCLUDE` (`**/spec/**/node/**`) and the option types.
    - **Realm options.** `browser` takes `headless` (default true), `instances` (default `[{ browser: 'chromium' }]`) and `test`. `node` takes `test`. The project names are `node` and `browser`.
    - **Serialized projects.** `defineXySerializedProject` also takes `setupFiles` and `test`, and runs with `fileParallelism: false` in `environment: 'node'`.
    - **Caveat.** Per-project `test` is spread last. So `node.test.exclude`, `browser.test.exclude` or `.include` replaces the built-in realm and .claude excludes instead of extending them.
  - **Fix:** Add the sub-options and exported constants to the table, and add `setupFiles` / `test` to the serialized-project sentence. Warn about the per-project replacement and show how to extend instead: use the top-level `exclude`, or `exclude: [...XY_VITEST_NODE_EXCLUDE, 'extra/**']`.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/index.ts:1-18. ariestools/toolchain/packages/vitest-config/src/options.ts:25-50, :85-110. ariestools/toolchain/packages/vitest-config/src/defineXyVitestProjects.ts:14-41. ariestools/toolchain/packages/vitest-config/src/defineXySerializedProject.ts:10-25. ariestools/toolchain/packages/vitest-config/src/defaults.ts:12-22.
  - <sub>ids: skills/xy-toolchain/testing.md#5, cov-config#9, cov-configpkgs#16</sub>

- ⚪ **No `--project node|browser` filter for preset repos** · `verified`
  - **Now:** testing.md:186-191 shows only `pnpm exec vitest run <path>` and `-t`.
  - **Actual:** The preset names its projects `node` and `browser`. Vitest 5 supports `--project <name>`, which is repeatable and accepts wildcards and `!` negation, to run a single realm.
  - **Fix:** Add `pnpm exec vitest run --project node` and `pnpm exec vitest run --project browser <path>`, both run from the repo root.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defineXyVitestProjects.ts:17, :29. Output of `vitest --help` (5.0.3).
  - <sub>ids: skills/xy-toolchain/testing.md#8</sub>

## `skills/xy-toolchain/toolchain.md`

### Update

- 🔴 **The install command fails at a pnpm monorepo root because it has no `-w`** · `partially verified`
  - **Now:** toolchain.md:43-45 gives `pnpm add -D @ariestools/toolchain @ariestools/tsconfig typescript`. :51 says `xy` runs at repository/workspace scope.
  - **Actual:** The toolchain belongs in the root devDependencies, since `xy` runs from the root and the scaffold puts it there. In a multi-package pnpm workspace, `pnpm add` refuses to add to the root without `-w` / `--workspace-root` (or `--ignore-workspace-root-check`). The command as written therefore fails in the default monorepo layout.
  - **Fix:** Show two forms: `pnpm add -D -w @ariestools/toolchain @ariestools/tsconfig typescript@^6 eslint` for a monorepo root, and the same command without `-w` for a single-package repo. Add a sentence that the toolchain, config, eslint, typescript and vitest devDependencies go on the root package. Pin `typescript` as described in the typescript.md TypeScript 7 item.
  - **Evidence:** Output of `pnpm add --help` (pnpm 12.4.2) lists `-w, --workspace-root` and `--ignore-workspace-root-check`. ariestools/toolchain/packages/toolchain/README.md:54. ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:39-50.
  - <sub>ids: skills/xy-toolchain/toolchain.md#0</sub>

- 🔴 **`pnpm-workspace.yaml` with release-age and verify settings is required in every pnpm repo, not "when needed"** · `partially verified`
  - **Now:** toolchain.md:37 says "For pnpm workspaces, keep `pnpm-workspace.yaml` at the repository root." :114 says "Pin pnpm in `packageManager` and create the correct workspace file when needed."
  - **Actual:** `xy check` runs `xy packman lint`, which is stable. For any pnpm repo, single-package or monorepo, it raises errors unless pnpm-workspace.yaml contains three settings: `minimumReleaseAge` of at least 1440, a `minimumReleaseAgeExclude` covering the scopes actually used (@ariestools/*, @xylabs/*, @xyo-network/*), and `verifyDepsBeforeRun`. If the file is missing, the check reports "No pnpm-workspace.yaml found", and `--fix` cannot create it. Separately, `repo.workspaces-field-placement` (error) rejects package.json `workspaces` in a pnpm monorepo.
  - **Fix:** Say that every pnpm repo has a root pnpm-workspace.yaml, with a `packages:` list only for monorepos. Show a minimal block: `minimumReleaseAge: 1440`, `minimumReleaseAgeExclude: ['@ariestools/*']`, `verifyDepsBeforeRun: warn`. Say that workspace globs go there and never in package.json `workspaces`. Mention that `pnpm xy packman lint --fix` (or `xy check --fix`) fills in the settings once the file exists.
  - **Evidence:** Output of `xy.mjs packman lint --rules`. ariestools/toolchain/packages/toolchain/src/actions/packman/lint.ts:39, :147-174, :321-353. ariestools/toolchain/packages/toolchain/src/lib/pnpmConfig/readMinReleaseAge.ts:12. ariestools/toolchain/packages/toolchain/src/actions/releaseAgeExcludeScopes.ts:6. ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:13, :55-56. ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:176-197. ariestools/toolchain/docs/STABILITY.md:84. A working example: ariestools/toolchain/pnpm-workspace.yaml:7-10.
  - <sub>ids: skills/xy-toolchain/toolchain.md#1, cov-toolchain-history#10</sub>

- 🟠 **The root `"test": "vitest run"` script and undocumented script deferral break `xy test <workspace>`** · `verified`
  - **Now:**
    - toolchain.md:96-106 lists root scripts including `"test": "vitest run"`. That contradicts toolchain.md:23: "Do not substitute a raw … Vitest invocation for a repository wrapper".
    - testing.md:15-19 treats the package script and `xy test` as separate surfaces, and testing.md:130-139 suggests `{ "test": "vitest run", "test:watch": "vitest" }`.
    - Deferral appears only as the `--no-defer` row at commands.md:26.
  - **Actual:**
    - **How deferral works.** A global middleware runs a same-named root package.json script instead of the built-in command (`<pm> run <cmd>`). It prints "Delegating …" and forwards everything after the command name. `XY_LOCAL_SCRIPT=1` prevents recursion, and `--no-defer` or `XY_NO_DEFER=1` turns it off.
    - **Why a target does not stop it.** Yargs removes a declared positional such as `[target]` from `argv._` before the middleware runs, so the `argv._.length > 1` guard does not apply.
    - **The failure.** `pnpm xy test @scope/package` becomes `vitest run @scope/package`. Vitest treats that as a filename filter, matches no files, and exits 1.
    - **What the scaffold does.** The scaffold and the README use `"test": "xy test"` plus `fix` and `check` scripts. Current ariestools repos define no root `test` script.
  - **Fix:**
    - Change the example to `"test": "xy test"`, and add `"fix": "xy fix"` and `"check": "xy check"`; `lint:fix` may stay.
    - Add a deferral paragraph: a same-named root script runs instead of the command, with flags and targets forwarded; `"build": "xy build"` is safe because of the recursion guard; `--no-defer` or `XY_NO_DEFER=1` forces the built-in command.
    - In testing.md "Use the repository test surface", note that `xy test` / `xy retest` defer to a root `test` / `retest` script and forward any target, and cross-link commands.md:26.
    - In the hand-rolled section, either warn that `vitest run` breaks `xy test <workspace>`, or switch to `xy test` and add `watch: false` to the hand-rolled configs. xy runs `vitest .`, which watches in an interactive terminal.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/xyParseOptions.ts:60-67. ariestools/toolchain/packages/toolchain/src/lib/tryRunLocalScript.ts:13-52. ariestools/toolchain/packages/toolchain/src/actions/test.ts:13-14. ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:28-35. ariestools/toolchain/packages/toolchain/README.md:22-32. `xy test --help` lists `--no-defer`.
  - **Resolved contradiction:** toolchain.md#4 said a positional target is never deferred; testing.md#4 said it is. This document keeps testing.md#4. A yargs 18.2.0 probe (the version in ariestools/toolchain/packages/toolchain/node_modules) was re-run for this write-up. For `test @scope/pkg`, the middleware sees `_: ["test"]` and `target: "@scope/pkg"`. Only an extra, undeclared positional skips deferral: `test packages/foo extra` gives `_: ["test","extra"]`.
  - <sub>ids: skills/xy-toolchain/testing.md#4, skills/xy-toolchain/toolchain.md#4, cov-cli#13, cov-toolchain-history#10</sub>

- 🟠 **Peer ranges for TypeScript, the ESLint configs and vitest-config are not stated** · `verified`
  - **Now:** toolchain.md:41 says "The published toolchain requires Node.js 22 or newer and TypeScript 5.9 or 6", and the install line at :44 omits eslint. eslint.md:14 says "The current packages target ESLint 10 and use flat config." testing.md:27 says "Install as a dev dependency (peer: `vitest`)."
  - **Actual:**
    - **@ariestools/toolchain 10.1.0.** Peers `eslint ^10.3` and `typescript ^5.9 || ^6.0`; engines `node >=22`. TypeScript 7 is available only as the experimental native alias.
    - **@ariestools/eslint-config-flat and -react-flat.** Peers `eslint ^10.3` and `eslint-import-resolver-typescript ^4.4`. The import config sets `import-x/resolver: { typescript }`, so the resolver must be installed. `xy lint init` does not add the resolver, and it writes `eslint@^10.0.0`.
    - **@ariestools/vitest-config.** Peer `vitest ^5.0` since 2026-09-05; `@vitest/browser-playwright` must match the Vitest major.
  - **Fix:**
    - toolchain.md:41: replace with a peer matrix: Node >=22; typescript ^5.9 || ^6.0; eslint ^10.3 plus eslint-import-resolver-typescript ^4.4 with the ESLint configs; vitest ^5 with vitest-config. Add `eslint` to the install line.
    - eslint.md:14: state both peers and add a manual install line, `pnpm add -D @ariestools/eslint-config-flat eslint eslint-import-resolver-typescript` (React: `@ariestools/eslint-config-react-flat`). After `xy lint init`, add the resolver and raise eslint to at least 10.3.
    - testing.md:27: "peer: `vitest` ^5.0; upgrade `@vitest/browser-playwright` together with it".
  - **Evidence:** `npm view @ariestools/toolchain@latest peerDependencies engines`. `npm view @ariestools/eslint-config-flat@latest peerDependencies`. `npm view @ariestools/vitest-config@10.1.0 peerDependencies`. ariestools/toolchain/packages/toolchain/package.json:106-112. ariestools/toolchain/packages/eslint-config-flat/package.json:71-74. ariestools/toolchain/packages/eslint-config-react-flat/package.json:71-72. ariestools/toolchain/packages/eslint-config-flat/src/import/index.ts:24. ariestools/toolchain/packages/vitest-config/package.json:51-63. ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:76-82. Commit 7a20cbca4.
  - <sub>ids: skills/xy-toolchain/toolchain.md#5, skills/xy-toolchain/eslint.md#2, skills/xy-toolchain/testing.md#6, cov-configpkgs#12, cov-configpkgs#16, cov-toolchain-history#5</sub>

- 🟠 **"Require Node.js 22" does not match the enforced engines and volta placement** · `partially verified`
  - **Now:** toolchain.md:115 says "Require Node.js 22 or newer unless the consuming product imposes a newer version."
  - **Actual:**
    - **Monorepos (repo lint runs only there).**
      - A root `engines` field is an error ("use volta instead"; fixable), and only the root declares `volta` (`repo.volta-only-root`).
      - Non-private workspace packages must declare `engines`, and private ones must not (`repo.engines-non-terminal`).
      - `repo.engines-lts` errors when an engines range excludes the latest Current Node (26.8.2), so a capped `^22` fails. It only warns on a lagging volta pin.
    - **Node lint.** Its rules (`node.engines-node-range` within `>=22`, `node.volta-node-latest`, `node.engines-node-portable`) are warn-level and not part of `xy check`.
    - **Single-package repos.** The root is the published package and declares `engines.node`.
    - **Practice.** The toolchain root uses volta node "26" and no engines. Every toolchain package, including the neutral lib-neutral, declares `engines.node: ">=22"`, and sdk-js packages declare `">=26"`.
  - **Fix:** Replace the step with placement rules, then point to `pnpm xy repo lint --fix` and mention `xy node lint` as an advisory warn-level check that runs separately.
    - **Monorepo:** pin Node at the root through `volta.node`, with no root `engines`. Every non-private package declares an open `engines.node` (by convention `">=22"`) that includes the latest Node. Private packages declare none.
    - **Single package:** the root declares `engines.node`.
  - **Evidence:** Output of `xy.mjs repo lint --rules` and `xy.mjs node lint --rules`. ariestools/toolchain/packages/toolchain/src/actions/package-lint-engines.ts:65-94, :176-223. ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:534-537. ariestools/toolchain/packages/toolchain/src/actions/node-lint.ts:18, :110-209. ariestools/toolchain/packages/toolchain/src/lib/latestVersions.ts:6. ariestools/toolchain/package.json:50-52.
  - **Dropped claim:** toolchain.md#6 also said "browser/neutral-only packages must not declare `engines.node`". That is only the warn-level `node.engines-node-portable`. It conflicts with the error-level `repo.engines-non-terminal` (checked at 7eb43c3c2: package-lint-engines.ts:85-86 and node-lint.ts:142-161) and with current practice, so it belongs in a toolchain issue rather than skill guidance.
  - <sub>ids: skills/xy-toolchain/toolchain.md#6, cov-toolchain-history#10</sub>

- 🟠 **The migration section omits `@xylabs/ts-scripts-*`, the manual boundary and the convert/skills paths** · `partially verified`
  - **Now:** toolchain.md:126-132 says "Replace retired `@xylabs/toolchain`, ESLint-config, and tsconfig package names with their `@ariestools/*` equivalents. The compatibility stubs are no longer built in the active monorepo."
  - **Actual:**
    - **Retired names.** docs/migrate-xylabs.md also retires `@xylabs/ts-scripts-*` (common, pnpm, yarn3, react-pnpm, react-yarn3).
    - **Manual migration.** `xy` and `xyex` never call `deprecationMigrate` and never rewrite package.json. The steps are: swap devDependencies, repoint ESLint and tsconfig, move scripts to `xy build/compile/lint/test` run from the root, and adopt pnpm (`packageManager` plus lockfile).
    - **Helper.** The experimental `xyex packman convert pnpm` swaps the managed @xylabs packages for @ariestools/toolchain.
    - **Skill source.** `skills.migrated-source` (error, fixable) requires xy-development and xy-toolchain to come from ariestools-skills rather than xyo-skills.
  - **Fix:** List the legacy names, including `@xylabs/ts-scripts-*`. State that no `xy` command migrates automatically. Copy the four-step checklist and link docs/migrate-xylabs.md. Mention `xyex packman convert pnpm` as an experimental helper, and add `pnpm xy skills lint --fix` to fix the skill source.
  - **Evidence:** ariestools/toolchain/docs/migrate-xylabs.md:3-24. ariestools/toolchain/architecture.md:56. ariestools/toolchain/packages/toolchain/src/actions/packman/swapTsScriptsDependency.ts:12-20. ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:14-19. Output of `xyex packman convert --help` and `xy.mjs skills lint --rules`.
  - <sub>ids: skills/xy-toolchain/toolchain.md#8, cov-toolchain-history#18</sub>

- ⚪ **`package-*` hooks are presented as a stable surface, and the list is incomplete** · `partially verified`
  - **Now:** toolchain.md:68-90 says "Use `package-*` binaries as per-package hooks" and lists package-compile, -recompile, -build, -lint/-fix, -publint, -clean and -sync-layout, plus the `-only` variants. compilation.md:103-108 has agents run `package-sync-layout` by hand.
  - **Actual:**
    - **Not stable.** STABILITY.md calls the `package-*` bins an implementation detail of `xy` and asks docs and automation to prefer the `xy` CLI.
    - **More bins.** The package also ships package-relint, package-lint-verbose, package-copy-assets-cjs, package-copy-assets-esm and run-or-exec.
    - **Overrides.** Root orchestration calls each hook through `pnpm exec run-or-exec <hook>`, so a same-named package script overrides it. `package-compile --validate-only` bypasses the override, and `--emit-only` is dropped for overrides. Since 10.1.0, identity scripts such as `"package-compile": "package-compile"` bypass `pnpm run`, so `--emit-only` survives.
    - **Monolith layout.** `xy compile` already re-syncs it, so a manual `package-sync-layout` run is needed only for `--check`.
  - **Fix:** Add: "`package-*` bins are internal hooks for package-script extension, not semver-stable API. Prefer `xy` in docs and CI, except where no `xy` equivalent exists (e.g. `package-sync-layout --check`)." Mention `run-or-exec` and package script overrides, keep the `-only` recursion guidance, and optionally list the missing bins.
  - **Evidence:** ariestools/toolchain/docs/STABILITY.md:53. ariestools/toolchain/packages/toolchain/package.json:31-50, matching `npm view @ariestools/toolchain@latest bin`. ariestools/toolchain/packages/toolchain/src/pm/pnpmPackageManager.ts:62, :67, :187. ariestools/toolchain/packages/toolchain/src/lib/runOrExecPlan.ts:7-32. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileMonolith.ts:157. ariestools/toolchain/packages/toolchain/src/bin/package/sync-layout.ts:11. ariestools/toolchain/docs/code-review-2026-10-06.md:11-18.
  - <sub>ids: skills/xy-toolchain/toolchain.md#9, cov-cli#19, cov-toolchain-history#20</sub>

- ⚪ **The `xy repo init` guidance predates the wizard, its defaults and flags** · `partially verified`
  - **Now:** toolchain.md:124 says "Use `xy repo init cli` only after inspecting its generated output and passing an explicit scope. Do not assume generator defaults match the target organization."
  - **Actual:**
    - **Wizard.** `xy repo init [template] [name]` runs an interactive wizard when the template is omitted. `cli` is the only template.
    - **Defaults.** Scope @ariestools (`none` for unscoped), license MIT, author Aries Tools, pm pnpm (the others are experimental), monorepo true, skills tier xy.
    - **Flags.** `--pm`, `--monorepo/--no-monorepo`, `--react`, `--skills-tier none|xy|xyo|xl1`, `--skills-optional`, `--license`, `--author*`, `--github-org`, `-y`, `--skip-install` and `--skip-git`.
    - **Root scripts.** build, compile, lint, fix, test and check, all through xy.
    - **Stale pins.** The template still pins vitest ~4.1.10, below vitest-config's ^5.0 peer, and volta node 22.14.0, which `node.volta-node-latest` flags.
  - **Fix:** Mention the wizard (`pnpm xy repo init`, or `npx --package=@ariestools/toolchain xy repo init` in a fresh repo) and the explicit form (`xy repo init cli <name> --scope <scope> --license <spdx> --skills-tier <tier> --yes`). Keep the instruction to inspect the output, specifically checking the vitest and volta pins against current peers, then run `xy check`.
  - **Evidence:** Output of `xy.mjs repo init --help`. ariestools/toolchain/packages/toolchain/README.md:102-128. ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:28-55. ariestools/toolchain/packages/vitest-config/package.json:61-62. ariestools/toolchain/CHANGELOG.md:58.
  - <sub>ids: skills/xy-toolchain/toolchain.md#10, cov-toolchain-history#10</sub>

### Add

- 🟠 **The new-project baseline omits the gates `xy check` enforces** · `partially verified`
  - **Now:** toolchain.md:110-124 ends with "Run the actual compile, lint, test, and publish-policy gates before handing off." It does not mention `xy check`, `xy skills lint --fix`, package READMEs, `packages/` placement, `spec/` layout, a private root, or ignoring `.xy/cache`.
  - **Actual:** `xy check` (and `xy check --fix`) runs git lint, packman lint, publint, repo lint, lint lint and skills lint. Error-level defaults include:
    - `skills.required-installed` and `skills.required-current`, fixed by `xy skills lint --fix`;
    - packman's pnpm release-age settings;
    - in monorepos: `repo.root-private`, `repo.packages-folder`, `repo.spec-layout`, `repo.package-readme` (a consumer README.md per workspace package) and `repo.package-readme-files` (README.md listed in `files`).

    `git.ignore-toolchain-cache` (`.xy/cache` ignored in every package) is a warning. The toolchain's own profiles doc ends verification with `pnpm xy check`.
  - **Fix:** Add baseline steps: run `pnpm xy skills lint --fix`. In monorepos, keep the root `private: true`, put packages under `packages/`, give each one a consumer README.md that is listed in `files`, and keep specs under `spec/`. Ignore `**/.xy/cache/`. Finish with `pnpm xy check --fix`, then `pnpm xy check`, build and test.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:13-70. Output of `xy.mjs skills lint --rules`, `xy.mjs repo lint --rules` and `xy.mjs git lint --rules`. ariestools/toolchain/packages/toolchain/src/actions/package-lint.ts:332-361. ariestools/toolchain/docs/profiles.md:60-66. ariestools/toolchain/packages/toolchain/README.md:65-67.
  - <sub>ids: skills/xy-toolchain/toolchain.md#7, cov-cli#7, cov-toolchain-history#10</sub>

## `skills/xy-toolchain/typescript.md`

### Update

- 🔴 **Unversioned `typescript` installs now resolve TypeScript 7, which breaks the toolchain, and the skill has no TypeScript 7 guidance** · `verified`
  - **Now:** typescript.md:14-23 has three `pnpm add -D … typescript` commands, and toolchain.md:44 has `pnpm add -D @ariestools/toolchain @ariestools/tsconfig typescript`; none pins a version. typescript.md:25 says "Use TypeScript 5.9 or 6 with the current toolchain." No skill mentions TS 7, `typescript-native` or `compile.compiler`.
  - **Actual:**
    - **npm `latest` is 7.** The latest typescript on npm is 7.0.2, the Go compiler. Its package exports no compiler API (`.` → `./lib/version.cjs`).
    - **The toolchain needs 5.9 or 6.** It peers `typescript ^5.9 || ^6.0`, and ESLint, deplint, dead and api-exposure load the compiler API from `typescript`. `xy updo` caps it at major 6 even with `--latest`, and the scaffold pins `~6.0.3`.
    - **TS 7 only side by side.** TypeScript 7 is supported only next to 6, as `"typescript-native": "npm:typescript@~7.0.2"` with the experimental `compile.compiler: 'native'` (`xyex enable ts-native`). Public examples must not require it.
  - **Fix:** Pin the major in every install command (typescript.md:16, :19, :22 and toolchain.md:44), as `typescript@~6.0.3` or `typescript@^6`. Extend typescript.md:25: "Never upgrade the `typescript` dependency to 7: it has no compiler API, the toolchain peer is ^5.9 || ^6.0, and `xy updo` caps it at 6. TypeScript 7 is an optional, experimental side-by-side install via `pnpm xyex enable ts-native`; see compilation.md."
  - **Evidence:** `npm view typescript dist-tags` → latest 7.0.2. ariestools/toolchain/packages/toolchain/package.json:99-100, :106-108. ariestools/toolchain/packages/toolchain/src/lib/updo/majorCeiling.ts:16-28. ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:48. ariestools/toolchain/packages/tsconfig/package.json:45. ariestools/toolchain/packages/toolchain/src/actions/enable/tsNative.ts:144-147. ariestools/toolchain/node_modules/typescript-native/package.json. `xy.mjs --stability --json` (`compile.compiler.native`).
  - <sub>ids: skills/xy-toolchain/typescript.md#2, cov-toolchain-history#0, cov-toolchain-history#1</sub>

- 🟠 **Line 82 understates the Node-types consequences: a missing `compile.node` fails declaration emit, and Node types in non-node packages fail publint** · `verified`
  - **Now:** typescript.md:82 says "Keep browser and neutral packages free of Node types unless the source genuinely requires them. The compiler resolves platform-specific types when producing browser, neutral, and node targets." The Node types section (:64-80) never connects `types: ["node"]` to `compile.node`.
  - **Actual:**
    - **Per-target configs.** For each target, `xy compile` writes `build/tsconfig.package-{check|dts}-<platform>-<src>.json`, extending the package tsconfig.
    - **Type stripping.** The neutral and browser passes drop `node` from `types`, and an unset `types` becomes `[]`. Only the node pass keeps Node types.
    - **Browser pass.** It forces `moduleResolution: 'Bundler'` and `customConditions: ['browser']`, and defaults `module` to ESNext only when the package omits it.
    - **Failure 1: missing `compile.node`.** Neutral is built only when no other target is enabled. So a package with `types: ["node"]` and no `compile.node: true` fails with "Compile:Declaration emit had N errors" even though raw tsc passes.
    - **Failure 2: NodeNext module.** An explicit `module: NodeNext` or `Node16` combined with a browser target hits TS5095. ESNext with bundler resolution is fine, as the sdk-js and sdk-react monolith packages show.
    - **Failure 3: publint.** `xy publint`'s `platform` rule is an error, so `xy build` fails too. In a package without a node export target, it rejects `"node"` in tsconfig `types`, `node:*` builtins in portable exports, and Node types leaking into declarations. "Unless the source genuinely requires them" therefore leads to a failing build.
    - **Existing coverage.** project-profiles.md:45 already pairs a Node library with `compile.node: true`.
  - **Fix:** Replace :82 with a "Per-target type passes" subsection that covers, then link compilation.md#target-selection and project-profiles.md:
    - the generated per-target configs and the type stripping;
    - a package that uses Node globals must enable `compile.node: true` (or a node export), not just add types;
    - a package without a node target must not list `node` in `types`, import `node:*` from portable exports, or leak Node types, because publint `platform` errors on all three;
    - a package that emits a browser target must not set `module` to NodeNext or Node16;
    - when declaration emit fails but raw tsc passes, inspect `build/tsconfig.package-dts-<platform>-*.json`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolvePlatformTypes.ts:32-41. ariestools/toolchain/packages/toolchain/src/actions/package/compile/createTypescriptConfig.ts:45-61, :75-97, :135-151. ariestools/toolchain/packages/toolchain/src/actions/package/compile/packageCompileEsbuild.ts:304-318, :360-370, :405-409. ariestools/toolchain/packages/toolchain/src/actions/package/compile/resolveCompilePlatforms.ts:63-96. ariestools/toolchain/packages/toolchain/src/actions/package/platformPublint.ts:387-397, :434-436, :459-463. ariestools/toolchain/packages/toolchain/src/actions/package/publintRules.ts:51. typescript 6.0.3 lib/typescript.js:129880-129882.
  - <sub>ids: skills/xy-toolchain/typescript.md#0, cov-configpkgs#5</sub>

- 🟠 **The `include: ["src"]` examples shrink `xy compile` validation and contradict the templates** · `verified`
  - **Now:** typescript.md:46-51, :55-60, :72-79 and :94-101 all show `"include": ["src"]`. Meanwhile :117 says "keep `tsconfig.json` broad for validation", and :123 says "full-package validation includes non-emitted TypeScript files by design".
  - **Actual:**
    - **Validation follows the tsconfig.** Full-package validation takes the file list of the package tsconfig.json (minus nested `packages/`), forces noEmit, and writes `build/tsconfig.package-validate.json`.
    - **What `include: ["src"]` loses.** The package-root xy.config.ts, vitest.config.ts, eslint.config.ts and `.storybook/` are then never validated.
    - **Templates.** The templates and consumer repos use exclude-only configs.
    - **Emission.** Emission inputs are derived separately: `src/**/*` minus spec, stories and example files.
    - **No tsconfig.** A package without a tsconfig.json skips validation with only a warning.
  - **Fix:** Change the examples to the template shape: `{ "extends": "@ariestools/tsconfig", "exclude": ["dist"] }` for a package, and `"exclude": ["dist", "docs", "**/dist", "**/docs", "coverage", "**/coverage"]` for the root. Add: narrowing `include` removes configs and Storybook from validation; emission inputs come from `src` automatically; every package needs its own tsconfig.json.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/validateFullPackage.ts:30-76. ariestools/toolchain/packages/toolchain/src/actions/package/compile/createTypescriptConfig.ts:123-131. ariestools/toolchain/packages/toolchain/templates/repo/cli/package/tsconfig.json.tmpl and ariestools/toolchain/packages/toolchain/templates/repo/cli/root/tsconfig.json.tmpl. ariestools/sdk-js/tsconfig.json and ariestools/sdk-js/packages/crypto/tsconfig.json. ariestools/toolchain/papers/YELLOW-PAPER.md:263.
  - <sub>ids: skills/xy-toolchain/typescript.md#1</sub>

- ⚪ **The `types` explanation assumes TypeScript 5.9 auto-inclusion** · `verified`
  - **Now:** typescript.md:104 says "Setting `compilerOptions.types` disables automatic `@types/*` inclusion."
  - **Actual:** On TypeScript 6, which is both the toolchain's dev compiler and the scaffold's, automatic type directives are `options.types ?? []`. `@types/*` packages are discovered only when `types` contains `"*"`. So on 6 nothing is auto-included, and the sentence holds only on 5.9. Line 66 and the troubleshooting at :123 are still correct.
  - **Fix:** Reword :104 only: "On TypeScript 5.9, setting `types` turns off automatic `@types/*` inclusion. On TypeScript 6, nothing is auto-included unless `types` lists it (or uses `"*"`). Either way, list Node, test-global or lib-neutral types explicitly." Optionally flag the same wording upstream in the lib-neutral README.md and globals.d.ts:8-10.
  - **Evidence:** typescript 6.0.3 lib/typescript.js:44672-44675 and :21973-21975 (in ariestools/toolchain/node_modules). ariestools/toolchain/packages/toolchain/package.json:99. ariestools/toolchain/packages/toolchain/templates/repo/cli/root/package.json.tmpl:48.
  - <sub>ids: skills/xy-toolchain/typescript.md#3</sub>

- ⚪ **lib-neutral's `stable-narrow` status is missing** · `verified`
  - **Now:** typescript.md:10 lists `@ariestools/lib-neutral` as "*(types only)*". :106 says "Currently declared surface (grow only with WinterTC common APIs as packages need them)".
  - **Actual:** The stability catalog and STABILITY.md:45 classify lib-neutral as `stable-narrow`: supported, but an intentionally incomplete WinterTC subset. The other tsconfig packages are `stable`. The declared surface (timers and AbortController/AbortSignal) matches the skill.
  - **Fix:** Mark it `stable-narrow` in the :10 row and at the top of the lib-neutral section. Do not add an unsourced "never declare locally" rule; ariestools/sdk-js/packages/crypto-auth types its WinterCG globals through lib DOM.
  - **Evidence:** `xy.mjs --stability --json` (packages section). ariestools/toolchain/docs/STABILITY.md:45. ariestools/toolchain/packages/lib-neutral/globals.d.ts:21-37. ariestools/sdk-js/packages/crypto-auth/tsconfig.json.
  - <sub>ids: skills/xy-toolchain/typescript.md#6</sub>

- ⚪ **The install section does not say that the tsconfig chain is peer-pinned to one lockstep minor** · `verified`
  - **Now:** typescript.md:12 says "The DOM and React packages declare their parent configs as peers. Install the complete chain explicitly". The commands at :14-23 are unversioned.
  - **Actual:** tsconfig-dom peers `@ariestools/tsconfig ~10.1.0`, and tsconfig-react peers `~10.1.0` for both tsconfig and tsconfig-dom. Bumping only one leaves the peers unsatisfied; pnpm warns by default. The hard constraint covers only tsconfig, -dom and -react. The toolchain and lib-neutral are not peer-bound to the chain, though lockstep releases make matching versions the convention.
  - **Fix:** After :12-23, add: "`@ariestools/tsconfig-dom` and `-react` peer their parents at `~<minor>` of the same release, so upgrade the chain together. The other @ariestools toolchain packages ship in lockstep, so keeping them on the same version is recommended, but they are not peer-bound to the chain."
  - **Evidence:** `npm view @ariestools/tsconfig-react@10.1.0 peerDependencies` and `npm view @ariestools/tsconfig-dom@10.1.0 peerDependencies`. ariestools/toolchain/packages/tsconfig-dom/package.json and ariestools/toolchain/packages/tsconfig-react/package.json. ariestools/toolchain/docs/STABILITY.md:17-18.
  - <sub>ids: skills/xy-toolchain/typescript.md#7</sub>

- ⚪ **Troubleshooting does not say that monolith tsconfig `paths` are generated** · `verified`
  - **Now:** typescript.md:123 tells agents to inspect "path aliases". compilation.md:103-110 says not to hand-edit generated "aliases", without naming tsconfig `paths` or package.json `imports`.
  - **Actual:** In `compile.monolith` packages, `package-sync-layout` regenerates the tsconfig `compilerOptions.paths`, package.json `imports` and the barrels. `--check` fails when `paths` has been hand-edited. The tool reads tsconfig.json with JSON.parse, so a monolith package's tsconfig.json must contain no comments. sdk-js/packages/sdk carries dozens of generated `#module` paths.
  - **Fix:** At compilation.md:110, name the generated files (package.json `imports`, tsconfig `compilerOptions.paths`, barrels, shims) and the plain-JSON requirement. Append to typescript.md:123: "In monolith packages, tsconfig `paths` are generated. Fix `compile.monolith` and run `package-sync-layout` instead of editing them."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithCompileLayout.ts:143-164, :276-316. ariestools/toolchain/packages/toolchain/src/bin/package/sync-layout.ts:17-34. ariestools/sdk-js/packages/sdk/tsconfig.json.
  - <sub>ids: skills/xy-toolchain/typescript.md#8</sub>

### Add

- ⚪ **The base-config list omits legacy decorators, `importHelpers` and what `erasableSyntaxOnly` rejects** · `verified`
  - **Now:** typescript.md:29-38 lists, under "including:", target/lib, module/moduleResolution, the strict flags, allowImportingTsExtensions/allowJs/resolveJsonModule, isolatedModules/erasableSyntaxOnly, declarations/maps, outDir and noEmit.
  - **Actual:**
    - **Decorators.** The base sets `experimentalDecorators: true`. Legacy decorators were restored on 2026-05-20 (417ebf827), and the SDK's `staticImplements` uses them.
    - **Other settings.** It also sets `importHelpers: true`, `esModuleInterop`, `allowSyntheticDefaultImports`, `skipLibCheck`, `removeComments: false` and `incremental: false`.
    - **Excludes.** It has an exclude list (.github, .vscode, .yarn, dist, node_modules, storybook-static, build), which a package-level `exclude` replaces.
    - **tslib.** With `importHelpers` and decorators, TypeScript itself requires `tslib` and reports TS2354 during validation and declaration emit. Deplint does not enforce tslib; it only keeps a declared tslib from being flagged as unused.
    - **`erasableSyntaxOnly`.** It makes enums, constructor parameter properties, runtime namespaces and `import x = require()` into TS1294 errors. sdk-js `threads` overrides it to false.
  - **Fix:** Add bullets for:
    - `experimentalDecorators`: legacy semantics, not TC39;
    - `importHelpers`: add `tslib` as a dependency when using decorators;
    - `esModuleInterop` and `skipLibCheck`;
    - `erasableSyntaxOnly`: rejects enums, parameter properties, runtime namespaces and `import =`, so use const objects or unions and explicit field assignment, and give a package-level reason for any override;
    - a package `exclude` replaces the base list.
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:3-28. `git show 417ebf827`. ariestools/toolchain/packages/toolchain/src/actions/deplint/implicitDevDependencies.ts:32-44, :104-110. typescript.js:87387-87388 and :93542-93554 (checkExternalEmitHelpers). A scratch tsc 6.0.3 run reporting TS1294. ariestools/sdk-js/packages/threads/tsconfig.json. ariestools/sdk-js/packages/sdk/src/modules/static-implements/staticImplements.ts.
  - <sub>ids: skills/xy-toolchain/typescript.md#4, cov-configpkgs#4</sub>

- ⚪ **The lib-neutral section does not list notable undeclared globals** · `unverified`
  - **Now:** typescript.md:106-111 lists the declared surface: timers and AbortController/AbortSignal.
  - **Actual:** That list is accurate. But `console`, `URL`, `TextEncoder` / `TextDecoder`, `queueMicrotask` and the static `AbortSignal.timeout()` / `AbortSignal.any()` are not declared, so using them in a neutral package is a compile error. `unicorn/prefer-abort-signal-any` warns from tier 2 and `prefer-abort-signal-timeout` warns at tier 4, so lint suggests APIs that lib-neutral does not type.
  - **Fix:** Add a "Not declared" line naming those globals, and tell agents to ignore the abort-signal unicorn suggestions in neutral packages. Keep the existing ban on `@types/node` in neutral packages (typescript.md:111). Do not forbid lib DOM outright: the verifier of the stable-narrow item found sdk-js crypto-auth relying on it. The auditor's suggested alternative is to inject these globals, or to extend lib-neutral upstream (WinterTC only).
  - **Evidence:** ariestools/toolchain/packages/lib-neutral/globals.d.ts:21-37. A scratch tsconfig using lib-neutral under tsc 6.0.3 reports TS2339, TS2584 and TS2304. Computed tier-3 and tier-4 configs. ariestools/toolchain/packages/toolchain/src/xy/stability.ts:111.
  - <sub>ids: cov-configpkgs#15</sub>

## Outside this skill

No finding targets a file outside `skills/xy-toolchain/`. The items above name these follow-ups in other places, collected here so they are not lost:

- ariestools/toolchain/docs/xy-config.md:15 repeats the claim that `compile.*` deep-merges (compile cascade item).
- ariestools/toolchain lint-init.ts:132-138 should merge the shared `no-restricted-imports` options at `error`. It also offers deprecated or E404 barrels and writes `eslint@^10.0.0` (eslint.md items).
- `CommandsConfig` lacks `dependabot` and `workLint`, and `DeplintRulesConfig` does not type rule options such as `protocol` (commands.md type-gap items).
- cosmiconfig's default `searchPlaces` lets a package.json `xy` key shadow xy.config.ts.
- detectRole classifies a single-package root as `workspace-root`, and deplint rules.md:84 and :113 still describe tooling auto-detection.
- `xy lint --fresh` drops `--fix` and other flags. Workspace-mode `xy test` / `xy retest` could pass `--root` / `--config`.
- The warn-level `node.engines-node-portable` conflicts with the error-level `repo.engines-non-terminal`. The repo-init template pins vitest ~4.1.10 and volta node 22.14.0.
- ariestools/toolchain/.agents/skills/xy-toolchain/commands.md:151-169 holds the local npm-org edit. Move it into this repo, restore the installed copy with `xy skills update`, and add "never edit installed skill files" to ariestools/toolchain/AGENTS.md:63. Retire ariestools/toolchain/.agents/skills/xy-work once it is ported.
- skills/xy-agent/auditing.md:100-105 and templates.md:23 use `pnpm xy work`; switch them to `pnpm xyex work` and link the new work and plan docs. Once the channel docs land, ask the toolchain to delete docs/SKILLS-FOLLOWUP.md.
- Stale toolchain text: the sdk-js example in docs/vendor-mode.md; the docstring at packages/vitest-config/src/options.ts:64; the TS 5.9 wording in the lib-neutral README and globals.d.ts:8-10. XYOracleNetwork/xyo-chain/packages/cli/xy.config.ts relies on the inert `dev.compile`.

## Refuted during verification

- **`compile.mode 'tsc'` now fails the compile; say so instead of "not wired"** (compilation.md:78). The code lens confirmed that since 9.2.0, `compile.mode: 'tsc'` prints an error and exits 1. The skill lens refuted the edit. compilation.md:78 already says the mode is reserved, not wired into packageCompile, and must not be recommended. That matches the stability-catalog text and the runtime error itself ("not wired into xy compile"), so adding "exits 1" would be cosmetic. The same suggestion inside cov-toolchain-history#15 was therefore left out of the merged compiler and validator items. <sub>ids: skills/xy-toolchain/compilation.md#10</sub>
