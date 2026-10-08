---
title: "Skills sync audit (complete) 2026-10-08 — xy-development"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Completed audit of the xy-development skill at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.1 (812b27a91) and @ariestools/sdk 9.0.1 (298fbb5bb); 44 merged open items from 92 raw findings, all verified by two lenses; 0 refuted, 0 resolved upstream; supersedes the partial 2026-10-08 audit."
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit (complete) — xy-development

This document establishes that each open item below was found by an auditor and then confirmed by two independent verifiers (a code-truth lens and a skill-text lens) against ariestools-skills 7e78933a8, @ariestools/toolchain 812b27a91 and @ariestools/sdk 298fbb5bb, with every toolchain claim re-checked at 10.1.1. It does not establish more than that: no fix has been applied, the order below is by file and severity rather than a prioritized remediation plan, and no recommended replacement text has been tested by an agent using the skill. See the [Audit index](2026-10-08-skills-sync-audit-complete.md) for the other skills. Member ids refer to the raw data in the [findings JSON](2026-10-08-skills-sync-audit-complete-findings.json).

## Summary

xy-development is sound in principle but has drifted from the toolchain and repositories it sits above. Four instructions fail when followed in current Aries Tools repos: the `any` TODO escape hatch fails lint, `pnpm install --resolution-only` and `pnpm --filter <pkg> build` exit non-zero on pnpm 12, and an unpinned `pnpm add` now pulls TypeScript 7. Most other items are convention contradictions (`.js` import extensions, return types, Gitflow as the default, an absolute history-rewrite ban) or lint and compiler rules that typescript.md never states. All 92 raw findings survived two-lens verification; none was refuted or resolved upstream.

| Action | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 0 | 0 | 0 | 0 |
| Update | 4 | 13 | 15 | 32 |
| Add | 0 | 6 | 6 | 12 |
| **Total** | **4** | **19** | **21** | **44** |

44 open items (92 raw findings) · 0 refuted · 0 resolved upstream

## `skills/xy-development/SKILL.md`

### Update

- 🟠 **The xy-agent link dangles in skill-by-skill installs, and "not defective" now contradicts `xy check`**
  - **Now:** SKILL.md:33 `**[xy-agent](../xy-agent/SKILL.md)** — *recommended, not required.*` … "A repository that does not follow it is not defective". workflow.md:47 has the same relative link, `[xy-agent skill](../xy-agent/SKILL.md)`. Neither says how to install it.
  - **Actual:** The toolchain catalog `ARIESTOOLS_SKILLS` lists only ariestools-sdk, xy-development and xy-toolchain. `xy skills lint --fix` installs one skill at a time, and `xy skills pick`, `commands.skillsLint.skills` and `commands.skillsLint.additionalSkills` all reject `xy-agent`. None of the 53 local skills-lock.json files lists xy-agent. These paths do install it: `npx skills add ariestools/ariestools-skills --all` or `--skill xy-agent`, a package.json `xy.skills` entry with a `source`, both marketplace mirrors, and `xy skills defaults` (which also installs all 7 XYO/XL1 skills). Separately, 10.1.1 added a stable `xy agent` command, and `xy check` now runs `xy agent lint` first with no config needed. In that run `agents.file-present` and `agents.adapter-thin` default to error, so "not defective" is no longer true. Resolved: arch-distribution#5 claimed that no install path works and that the link dangles in every consumer. The gap check and both verifiers narrowed this: the link dangles in skill-by-skill installs, which is how every local consumer is installed today.
  - **Fix:** At SKILL.md:33 and workflow.md:47 add: "If `../xy-agent/` is missing, install it with `npx skills add ariestools/ariestools-skills --skill xy-agent`, or declare `{ "name": "xy-agent", "source": "ariestools/ariestools-skills" }` in package.json `xy.skills`." Do not suggest `xy skills pick`, `skillsLint.skills` or `additionalSkills`. Replace the "not defective" sentence with: "From @ariestools/toolchain 10.1.1, `xy check` runs `xy agent lint`. A missing AGENTS.md (`agents.file-present`) and a CLAUDE.md that copies AGENTS.md instead of importing `@AGENTS.md` or symlinking to it (`agents.adapter-thin`) are errors unless the repo lowers them in `commands.agentLint.rules`. `xy agent init` scaffolds the convention without overwriting existing files." Toolchain follow-up: add xy-agent to `ARIESTOOLS_SKILLS` together with an optional-skills list, so that pick, lint and repo init can install it.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:13-17, :67-73; pick.ts:113-116; skillRules.ts:88-131; lint.ts:93-97; packageSkills.ts:134-150; src/xy/common/checkCommand.ts:49-50; src/actions/agent/rules.ts:87-112; src/xy/stability.ts:47 (`'agent': 'stable'`); `gh api` listings of ariestools-claude-plugin and ariestools-codex-plugin show xy-agent.
  - <sub>ids: skills/xy-development/SKILL.md#0, arch-distribution#5, gap-gap-skills-cli-install#1</sub>

- 🟠 **The git.md router entry hides the history-rewrite rules and the branching model**
  - **Now:** SKILL.md:21-22 "Read when creating commits, branches, or preparing changes for review. Covers conventional commits, atomic commit discipline, and branch naming patterns."
  - **Actual:** git.md:46-62 is a hard prohibition list (amend, rebase, force-push, `reset --hard`, filter-branch), and git.md:64-90 defines branching and the release flow. An agent about to amend, rebase, force-push, undo a commit, merge or release gets no reason to open git.md.
  - **Fix:** "Read when committing, branching, pushing, merging or opening PRs, undoing a change, resolving a rejected push, or cutting a release. Covers conventional commits and PR titles, atomic commits, the history-rewrite policy, branching-model detection, merge methods and releases." Keep the list in step with whichever git.md items below land.
  - **Evidence:** skills/xy-development/git.md:46-62, :64-90.
  - <sub>ids: skills/xy-development/SKILL.md#3, skills/xy-development/git.md#8, arch-layering#16</sub>

- ⚪ **The workflow.md router entry omits dependency rules, credential safety, browser verification and PRD criteria**
  - **Now:** SKILL.md:27-28 "Read before running any build, lint, or test command, and before declaring any task complete. Covers native toolchain discovery … and the definition of done checklist."
  - **Actual:** workflow.md also covers dependency and peer rules (:35, :88-89), Credential Safety (:49-55), browser verification for apps (:91-100), the layered DoD (:112-122) and writing PRD acceptance criteria (:124-152). xyo-skills deep-links `#writing-project-specific-acceptance-criteria`, but the router gives no reason to open the file when writing a PRD or adding a dependency.
  - **Fix:** "Read before running any build, lint, test or dev command; before adding or upgrading dependencies; when writing a PRD.md's acceptance criteria; and before declaring any task complete. Covers toolchain discovery, dependency and peer-dependency rules, credential safety, the layered Definition of Done, browser verification for apps, and writing project-specific acceptance criteria."
  - **Evidence:** skills/xy-development/workflow.md:35, 49-55, 88-100, 112-152; XYOracleNetwork/xyo-skills/skills/xl1-build/SKILL.md:123, xl1-scaffold/SKILL.md:59.
  - <sub>ids: skills/xy-development/SKILL.md#2, arch-layering#16</sub>

- ⚪ **The typescript.md router entry omits readonly, ESM, import style and enums**
  - **Now:** SKILL.md:19 "Covers strictness posture, the `any` escape hatch policy, return type inference, interface vs type usage, and naming conventions."
  - **Actual:** The file also has Readonly (:45-54), ESM Only (:56-62), root-barrel imports and ordering (:64-81), and unions over enums plus null handling (:85, :87).
  - **Fix:** Append "readonly usage, ESM-only modules, import style, and no enums", and add "or organizing imports" to the trigger. Land this after the typescript.md fixes: :62's `.js` rule must be corrected before it is advertised, and "return type inference" should become "return types" once that item lands.
  - **Evidence:** skills/xy-development/typescript.md:45-87.
  - <sub>ids: skills/xy-development/SKILL.md#4</sub>

- ⚪ **The skill-identity example carries an xyo-skills version (`v1.1.19`)**
  - **Now:** SKILL.md:14 "format as `<skill-name> v<version>` (e.g. `xy-development v1.1.19`)". The colon that ends line 12 leads into this paragraph, not the table of contents.
  - **Actual:** This pack is at 0.1.5. 1.1.x is the retired xyo-skills line: the stub is 1.1.38, and legacy 1.1.2x copies are still installed in several workspace repos. release-please rewrites only the annotated frontmatter line. xyo-skills evals showed agents copying prose example versions verbatim, and xyo-skills removed them (42cf31d).
  - **Fix:** Use no concrete number, not even 0.1.5: "**Skill identity.** When you present a plan, an acknowledgement or a completion summary, state which skills informed it as `xy-development v<version>`. Read the version from this file's `metadata.version`, never from an example." Move the paragraph above line 12, or end line 12 with a period. Do not add a "1.x means legacy" sentence, because legacy copies would never contain it.
  - **Evidence:** skills/xy-development/SKILL.md:5; release-please-config.json (extra-files, generic updater); XYOracleNetwork/xyo-skills/evals/README.md:178-181; skills/ariestools-sdk/SKILL.md:14 (placeholder form).
  - <sub>ids: skills/xy-development/SKILL.md#1, cov-dev-conventions#24, arch-layering#16, arch-distribution#20</sub>

- ⚪ **The frontmatter description triggers on too few tasks**
  - **Now:** SKILL.md:3 "Activates when writing code, running builds, performing git operations, or completing features."
  - **Actual:** Writing tests, adding dependencies, credential hygiene and PRD acceptance criteria are not triggers. Sibling skills use an explicit "Use when …" list.
  - **Fix:** For example: "Core development standards: TypeScript conventions, Git workflow, testing principles, and the Definition of Done. Use when writing or reviewing TypeScript, writing tests, adding dependencies, committing, branching or merging, writing PRD acceptance criteria, or before declaring any task complete."
  - **Evidence:** skills/xy-toolchain/SKILL.md:3; skills/xy-agent/SKILL.md:3; skills/ariestools-sdk/SKILL.md:3.
  - <sub>ids: skills/xy-development/SKILL.md#5</sub>

### Add

- ⚪ **Related skills omits ariestools-sdk, and the Layer 2 testing pointer has no link**
  - **Now:** SKILL.md:30-33 lists only xy-toolchain and xy-agent. SKILL.md:25 says "specific test frameworks and tooling are defined in the XY Toolchain skill (Layer 2)" with no link.
  - **Actual:** ariestools-sdk is the pack's third layered skill. The toolchain requires it only when a repo uses sdk-js packages, so a link to it can dangle elsewhere. skills/xy-toolchain/testing.md exists and links back to xy-development/testing.md.
  - **Fix:** Add `**[ariestools-sdk](../ariestools-sdk/SKILL.md)**` with the text "which `@ariestools/*` utilities to use and how to import them; read it when the repo depends on sdk-js packages (installed only in those repos)". Do not summarize its import style here; see the root-barrel item under typescript.md. Link SKILL.md:25 to `[xy-toolchain testing](../xy-toolchain/testing.md)`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:157-164; skills/xy-toolchain/testing.md:197.
  - <sub>ids: skills/xy-development/SKILL.md#6</sub>

## `skills/xy-development/git.md`

### Update

- 🟠 **Gitflow is presented as the default, but most repos work off main**
  - **Now:** git.md:66 "We follow [Gitflow] … where possible"; :83 "New work starts as a `feature/` branch off `develop`". :89-90 allows main-only only as a "Pragmatism" exception.
  - **Actual:** 9 of 80 local clones have `origin/develop`: the three skill packs plus a few app and infrastructure repos. None of the @ariestools library repos has one (toolchain, sdk-js, sdk-react, actor-kit, browser-kit, cli-kit). `xy repo init` runs `git init -b main` and scaffolds CI that triggers on push to main. The library repos merge `claude/*`, `codex/*`, `feat/*` and `fix/*` branches straight into main.
  - **Fix:** Make detection the first rule. Read the repo's CLAUDE.md, AGENTS.md or CONTRIBUTING.md and check `git ls-remote --heads origin develop`. If `develop` exists, use Gitflow (`feature/*` off develop). Otherwise, use short-lived branches off `main` merged back into main. Match the repo's existing branch prefixes (`feature/` or `feat/`). Drop "where possible" and fold the Pragmatism paragraph into this rule.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/repo-init/scaffold.ts:100-103; templates/repo/cli/root/github/workflows/build-pnpm.yml.tmpl:3-7; ariestools/toolchain/.github/workflows/build.yml:3-7; toolchain merges 5acf512db and b6e839f2b; sdk-js "Merge branch 'codex/bounded-response-reads'".
  - <sub>ids: skills/xy-development/git.md#0, cov-dev-conventions#6</sub>

- 🟠 **The release flow (`release/<version>`, manual tagging, "every commit on main is a release") matches no repo**
  - **Now:** git.md:69 "Every commit on main is a release."; :75 `release/<version>` branches; :85-86 "create a `release/` branch … Merge the release branch into `main` (tag it) and back into `develop`".
  - **Actual:** None of the 80 clones has ever merged a release/* branch. The three skill-pack repos release through release-please: a develop → main PR, then the release PR, then an automated main → develop sync, with versions never bumped by hand. The main-only toolchain repos release with `xy deploy <level>`, and main carries non-release commits ("workitem", "updo") between "Deploy" commits. Resolved: the original claim that no Gitflow repo uses hotfix/* is wrong. XYOracleNetwork/infrastructure and xyo-chain merged hotfix/* branches. The other Gitflow repos have no release-please.
  - **Fix:** Remove the `release/<version>` branch type and workflow steps 3-4. Reword :69 as "`main` holds released or releasable code; releases are tagged." Replace the release steps with "Releases follow the repo's documented process (CLAUDE.md, AGENTS.md, DEVELOPMENT.md or CONTRIBUTING.md); never hand-edit version fields." Then name the observed patterns. Skill packs use release-please. Gitflow repos without release-please merge as the repo instructs, and some reserve merging for curators. Toolchain repos follow CONTRIBUTING.md: `pnpm xy deploy <level>`, then commit the bumps and create the annotated `vX.Y.Z` tag, then `pnpm xy publish`, then push commits and tags. Keep `hotfix/*`: branch from main, merge into main, then return the change to develop through the automated sync or a back-merge PR. `xy deploy` and `xy publish` are undocumented in xy-toolchain; add a section there and note that 10.1.1 runs the toolchain preflight unless `--defer` is passed.
  - **Evidence:** ariestools/toolchain/CONTRIBUTING.md:36-47; ariestools-skills DEVELOPMENT.md:70-78 and release-please-config.json; toolchain 3320116a4 and 812b27a91 ("Deploy"); infrastructure hotfix merges 3738410 and 2a7b9d2, back-merge d1e9775.
  - <sub>ids: skills/xy-development/git.md#1, cov-dev-conventions#6</sub>

- 🟠 **The absolute "Never Rewrite History" ban contradicts the workspace commit-identity policy**
  - **Now:** git.md:48 "Git history is append-only. We always add to it, never rewrite it." :51-54 forbid `--amend`, any rebase, `--force`/`--force-with-lease` and `reset --hard` with no exceptions. :61 "Bad commit message? Let it stand".
  - **Actual:** The workspace CLAUDE.md and AGENTS.md require rewriting an unpushed commit that carries the wrong author email (keeping its tree, parents, message and dates), and allow force-pushing an already-pushed one after asking. ariestools-skills CLAUDE.md:41 limits the ban to shared branches. xyo-skills CLAUDE.md keeps the absolute form, so the repos disagree. Platform squash merges are not an agent rewriting history and do not conflict with the rule.
  - **Fix:** Keep the append-only principle and scope it. Never rewrite pushed or shared history, and never force-push main or develop. Correct a local, unpushed commit only when repository or workspace instructions require it, for example to fix commit identity while preserving tree, parents, message and dates. Force-pushing an already-pushed branch needs explicit user approval. Add "Repository and workspace CLAUDE.md/AGENTS.md take precedence over this section." Do not grant a general permission to amend or rebase. Reconcile the xyo-skills CLAUDE.md wording in the same change.
  - **Evidence:** workspace CLAUDE.md:52-56; workspace AGENTS.md:260-264; ariestools-skills CLAUDE.md:41; XYOracleNetwork/xyo-skills/CLAUDE.md:62-64.
  - <sub>ids: skills/xy-development/git.md#5, cov-dev-conventions#5</sub>

- ⚪ **The commit-type list lacks perf, style and revert, and has no breaking-change notation**
  - **Now:** git.md:11-19 lists feat, fix, refactor, chore, docs, test, build and ci. :21-25 has no rule for breaking changes.
  - **Actual:** The PR-title lint in the skill-pack repos also accepts style, perf and revert for PRs into develop, and only feat or fix into main. `!` is in use (toolchain 13350616a `feat(toolchain)!:`, actor-kit `refactor!:`, xyo-skills `feat!:`). Release tooling does not derive bumps from types: the skill packs use release-please `always-bump-patch`, and the library repos pick the level with `xy deploy`.
  - **Fix:** Add `perf`, `style` and `revert` to Types. Add a rule: "Mark breaking changes with `!` after the type/scope (e.g. `feat(toolchain)!: remove gitlint aliases`) and/or a `BREAKING CHANGE:` footer." Do not claim that release tooling depends on the marker.
  - **Evidence:** ariestools-skills .github/workflows/lint-pr-title.yml:25-27, :43-54; ariestools-skills release-please-config.json; ariestools/toolchain/docs/STABILITY.md:11, :24.
  - <sub>ids: skills/xy-development/git.md#3, cov-dev-conventions#8</sub>

- ⚪ **Examples and rationale are stale or carried over from XYO**
  - **Now:** git.md:29-32 `feat(rps): …`, `fix(wallet): …`, `chore: update typescript to 5.x`; :79 `feature/rps-game-ui`, `hotfix/wallet-connection-timeout`; :57 "In a protocol built on cryptographic proof of origin, immutable history isn't just a preference".
  - **Actual:** The repos pin typescript ~6.0.3, and npm latest is 7.0.2. This pack is the generic Aries Tools base layer, and product scaffolds live in other packs. The file is unchanged since the initial import (74f0248).
  - **Fix:** Use real subjects, for example `feat(publint): check every monolith compile output against exports`, `fix(toolchain): merge per-step env in runStepAsync`, `feat(toolchain)!: remove gitlint aliases` and `chore: update typescript to 6.0`. Use neutral branch names such as `feature/lint-worker-budget`. Give :57 a project-neutral rationale: audit trail, collaborator safety, reproducible releases.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/package.json:66; `npm view typescript version`; ariestools-skills CLAUDE.md (Purpose); toolchain commits 26db53993, c56264111, 13350616a.
  - <sub>ids: skills/xy-development/git.md#7, cov-dev-conventions#22, arch-layering#18</sub>

- ⚪ **No pointer to the repository git hygiene that `xy git lint` enforces**
  - **Now:** Absent. git.md covers commits and branches only.
  - **Actual:** `xy git lint` is stable and runs inside `xy check` and `xy fix`. It has four warn-level, fixable rules: git.autocrlf, git.eol (lf), git.ignorecase (false) and git.ignore-toolchain-cache (`**/.xy/cache/` ignored, `.xy/work` tracked). The `xy gitlint` alias is gone in 10.x. xy-toolchain/commands.md:158 lists `xy git lint` but omits git.ignore-toolchain-cache.
  - **Fix:** Add at most one generic line to git.md: "Use LF line endings and case-sensitive filenames; never commit tool caches or generated output. See `[xy-toolchain › Repository policy](../xy-toolchain/commands.md#repository-policy)` for the enforcing command." Put the rule names, including git.ignore-toolchain-cache, in xy-toolchain/commands.md:158.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/gitlint.ts:14-77; gitlintIgnore.ts:7-9; fix.ts:20; `node packages/toolchain/dist/bin/xy.mjs git lint --rules`.
  - <sub>ids: skills/xy-development/git.md#6</sub>

### Add

- ⚪ **No pull-request guidance: merge-method invariant and conventional PR titles**
  - **Now:** Absent. git.md:52 only says to merge instead of rebasing.
  - **Actual:** The only universal invariant is never squashing between long-lived branches (develop ↔ main), because that fills `git log main..develop` with phantom commits. Squashing feature PRs is a per-repo choice: the release-please skill packs squash feature → develop, while infrastructure and the trunk library repos use merge commits. In squash-merge repos the PR title becomes the commit subject that release-please reads. In the three skill-pack repos, lint-pr-title.yml allows only `feat:`/`fix:` into main (release-please heads are exempt) and any conventional type into develop.
  - **Fix:** Add a short "Pull requests" subsection. Follow the repo's documented merge method, and do not merge where the repo reserves merging for maintainers. Never squash between long-lived branches. When a PR will be squash-merged, write its title as a valid conventional-commit subject. Where the repo lints PR titles, follow its allowed types; in the skill packs, PRs into `main` take `feat:` or `fix:` (use `fix:` for an integration PR with no features). Do not prescribe squash for all topic branches.
  - **Evidence:** ariestools-skills CLAUDE.md:43-50, DEVELOPMENT.md:89-96, .github/workflows/lint-pr-title.yml:12-58; XYOracleNetwork/xyo-skills/CLAUDE.md:65-80; toolchain 5acf512db (merge commit on main).
  - <sub>ids: skills/xy-development/git.md#2, skills/xy-development/git.md#4, cov-dev-conventions#7</sub>

- ⚪ **No generic rule against overriding the configured commit identity**
  - **Now:** Absent.
  - **Actual:** The workspace instructions require author and committer to be the configured identity, forbid `--author`, `-c user.email=…` and `GIT_AUTHOR_EMAIL`/`GIT_COMMITTER_EMAIL`, and require a `git log --format='%h %ae %ce'` check before pushing. Skill consumers outside this workspace never see that file.
  - **Fix:** Add a person-neutral bullet: "Commit with the repository's configured user.name and user.email; never override identity with `--author`, `-c user.email` or `GIT_AUTHOR_EMAIL`/`GIT_COMMITTER_EMAIL`. Check author and committer (`git log --format='%h %ae %ce' @{u}..HEAD`) before pushing." Leave specific addresses to workspace instructions.
  - **Evidence:** workspace CLAUDE.md:52-56; workspace AGENTS.md:260-264.
  - <sub>ids: cov-dev-conventions#9</sub>

## `skills/xy-development/testing.md`

### Update

- ⚪ **Test-naming examples use a "should …" prefix that Layer 2 and most specs do not use**
  - **Now:** testing.md:10-11 "`should reject moves after game is finalized`", "`should return the winner when both players have submitted`".
  - **Actual:** The Layer 2 example uses `it('accepts supported moves')` and `it('rejects unsupported moves')`. Titles starting with "should": toolchain 0 of 1584, actor-kit 0 of 156, sdk-js about 250 of 2072, cli-kit about 220 of 574. No lint rule enforces either style.
  - **Fix:** Use `rejects moves after the game is finalized` and `returns the winner when both players have submitted`, and add: "Match the repository's existing title style; what matters is that the title states the expected behavior."
  - **Evidence:** skills/xy-toolchain/testing.md:204-211; ariestools/toolchain/packages/eslint-config-flat/package.json:47-58 (no vitest or jest plugin).
  - <sub>ids: skills/xy-development/testing.md#0</sub>

- ⚪ **The Layer 2 pointer is plain text, not a link**
  - **Now:** testing.md:3 "Specific frameworks, runners, and tooling configuration are defined in the XY Toolchain skill (Layer 2)."
  - **Actual:** xy-development and xy-toolchain are always installed as a pair (`XY_SKILLS`), and xy-toolchain/testing.md:197 links back with a relative link, so a sibling-relative link resolves.
  - **Fix:** "Specific frameworks, runners, spec layout, and tooling configuration are defined in `[xy-toolchain → Testing with Vitest](../xy-toolchain/testing.md)` (Layer 2)." Make the same change at SKILL.md:25.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:13-17; skillRules.ts:65.
  - <sub>ids: skills/xy-development/testing.md#3, skills/xy-development/SKILL.md#6</sub>

### Add

- ⚪ **No principle that tests must be independent, order-free and deterministic**
  - **Now:** Absent. Determinism appears only as a reason to mock the clock or randomness (testing.md:51).
  - **Actual:** The org Vitest preset leaves Vitest's default file parallelism on, so spec files run concurrently. Plain `spec/` files run in both the Node and browser projects when browser is enabled. Only `defineXySerializedProject` turns parallelism off, for e2e suites that share external state. Vitest isolates files, so the real hazards are run-order dependence and shared external resources. (`xy test --jobs` is not forwarded to Vitest.)
  - **Fix:** Add "Independent and Deterministic Tests". Each test arranges and cleans up its own state and passes in any order. Other test files may run at the same time, so never assume exclusive access to ports, temp paths, databases, environment variables or a shared chain. Control the clock, randomness and network. Keep slow, stateful end-to-end suites separate. Point to xy-toolchain/testing.md for realm routing and serialized suites.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defineXyVitestProjects.ts:14-50; defineXySerializedProject.ts:5-18; packages/toolchain/src/actions/test.ts:8-15.
  - <sub>ids: skills/xy-development/testing.md#1</sub>

- ⚪ **Mocking guidance never requires a test of the real wiring across a mocked boundary**
  - **Now:** testing.md:49-52 approves mocking external services and system boundaries. Nothing requires an un-mocked path through them.
  - **Actual:** The toolchain's 2026-10-06 code review found the serious defects in orchestration that the specs mocked away (a mocked package manager, mocked `gh` and spawn). The `--emit-only` bug shipped in v10.0.9 and was fixed in v10.1.0.
  - **Fix:** Under "When mocks are appropriate" add: "Mocking a boundary in unit tests is fine, but keep at least one integration or end-to-end test that exercises the real wiring across it. Orchestration that is mocked in every test is untested."
  - **Evidence:** ariestools/toolchain/docs/code-review-2026-10-06.md:5, :16, :202, :204; `git show v10.0.9:packages/toolchain/src/bin/run-or-exec.ts` (line 33).
  - <sub>ids: skills/xy-development/testing.md#2</sub>

## `skills/xy-development/typescript.md`

### Update

- 🔴 **The `any` escape hatch (a TODO comment) fails lint at every tier**
  - **Now:** typescript.md:17 "5. **Only then: `any`** — with a `// TODO: [reason alternatives don't work]` comment explaining the constraint."
  - **Actual:** `@typescript-eslint/no-explicit-any` is an error at every tier. It comes from typescript-eslint flat/recommended and nothing overrides it. With type checking (the default), `any` that spreads also triggers the `no-unsafe-assignment` and `no-unsafe-member-access` errors. `ban-ts-comment` is an error (no `@ts-ignore`; `@ts-expect-error` needs a description), and `unicorn/no-abusive-eslint-disable` (tier 2 and up) rejects bare disables. A scratch lint of the TODO pattern gives `error @typescript-eslint/no-explicit-any`, while a `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- reason` line passes. Workspace rule: "no `any` (use `unknown` + guards)". One verifier argued for medium because workflow.md:75 already requires an inline justification for disabled rules. High is kept because step 5, read literally, fails `xy lint`.
  - **Fix:** Rewrite step 5: "Only then: `any`, scoped to one line with `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <why the alternatives fail>`. `no-explicit-any` is a lint error at every tier. No file-wide or blanket disables and no `@ts-ignore`; use `@ts-expect-error <description>` only to suppress a compiler error." Under "contained, never contagious", add that the type-aware `no-unsafe-*` errors fire when `any` flows onward, so narrow to `unknown` or a concrete type at the boundary.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:182-197; src/tiers/recommendedConfig.ts:12-15; @typescript-eslint/eslint-plugin dist/rules/ban-ts-comment.js:74-81; ariestools/toolchain/packages/toolchain/src/lib/withError.ts:2 and ariestools/sdk-js/packages/meta/src/lib/getMetaAsDict.ts:4 (existing next-line disables); workspace CLAUDE.md:45.
  - <sub>ids: skills/xy-development/typescript.md#1, cov-configpkgs#0, cov-dev-conventions#0</sub>

- 🟠 **Relative imports are told to use `.js`, but the house convention is `.ts`**
  - **Now:** typescript.md:62 "Use `.js` extensions in relative import paths (TypeScript resolves `.ts` → `.js`)".
  - **Actual:** @ariestools/tsconfig sets `allowImportingTsExtensions` with `noEmit`, because the toolchain emits. Relative specifiers: toolchain about 1853 `.ts` and 0 `.js`; sdk-react 1265 and 0; actor-kit, cli-kit and browser-kit 0 `.js`; sdk-js 1052 `.ts` and 29 `.js` (legacy files). The lint barrel ban is spelled `./index.ts`, so a `./index.js` specifier slips past it. `.js` still compiles under NodeNext and no lint rule enforces extensions, so this contradicts convention rather than breaking builds. xy-toolchain/testing.md:202 also uses `.js`.
  - **Fix:** "Always include an explicit extension in relative imports, matching the repo. Repos on `@ariestools/tsconfig` use the source `.ts`/`.tsx` extension (`allowImportingTsExtensions`); `.js` is only for repos whose `tsc` emits directly. In XY repos do not use `.js` for TypeScript sources: it bypasses the lint ban on `./index.ts` barrel imports." Fix `'../validateMove.js'` at xy-toolchain/testing.md:202 in the same change, and optionally state the house rule in xy-toolchain/typescript.md.
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:4, :17; packages/eslint-config-flat/src/rules/correctness.ts:5-14 and src/rules/index.ts:8-17; packages/toolchain/templates/repo/cli/package/src/index.ts.tmpl.
  - <sub>ids: skills/xy-development/typescript.md#0, cov-configpkgs#8, cov-toolchain-history#23, cov-dev-conventions#12, arch-layering#8</sub>

- 🟠 **Return-type guidance contradicts "explicit return types on exported functions"**
  - **Now:** typescript.md:23-31 "## Return Types: Prefer Inference … **Do not annotate return types** unless …" (public API boundary, unexpectedly wide type, type guard, recursion).
  - **Actual:** The workspace CLAUDE.md:43, AGENTS.md:251 and sdk-js/AGENTS.md require explicit return types on exported functions. Functions that await must return `Promise<T>`, never `Promise<Promisable<T>>`. Neither lint nor the compiler enforces this (`explicit-module-boundary-types` is off, `explicit-function-return-type` is unset, and there is no `isolatedDeclarations`), so only the skill can carry it. About 98% of single-line exported functions in the toolchain are annotated.
  - **Fix:** "Annotate the return type of every exported function and method (the module contract). Rely on inference for local helpers, callbacks and inline arrows. When a function uses `await`, declare `Promise<T>`, never `Promise<Promisable<T>>`. Always annotate type guards (`x is T`) and recursive functions. This is a convention; lint does not enforce it." Keep the inference rationale for non-exported code.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:101; src/tiers/rule-catalog/managed-rules.ts:54; ariestools/sdk-js/packages/sdk/src/modules/promise/types.ts:6; workspace CLAUDE.md:43, :46.
  - <sub>ids: skills/xy-development/typescript.md#2, cov-configpkgs#10, cov-dev-conventions#10</sub>

- 🟠 **The root-barrel section relies on XYO skills and lacks a "do not mix root and subpath imports" rule**
  - **Now:** typescript.md:64-78 "Import from the root barrel package of each monorepo … reach for a named sub-package only when the symbol genuinely is not on the barrel", with an `@xyo-network/sdk` example, `@xyo-network/payload-model`, `payload-builder` and `account` under "Avoid", and "See the XYO and XL1 knowledge skills for the specific root barrel packages."
  - **Actual:** The rule itself is right. It steers away from separately published sub-packages, not from subpath exports. For @ariestools/sdk 9.x the root barrel is the safe default: the package is a `monolith` with the default `moduleLinkage: 'bundle'`, so each subpath is a separate bundle. Classes and static state reached through a subpath (for example `AbstractCreatable`, or `Base` with `initDefaultLogger`) are different objects from the root's. Downstream libraries import the root almost exclusively (actor-kit 18/0, sdk-react 115/0). Three things are wrong. The xyo-knowledge and xl1-knowledge skills ship only in XYOracleNetwork/xyo-skills, so the Layer 1 pointer leads outside this pack. `Payload` is a type, so `consistent-type-imports` and `simple-import-sort` would rewrite the example. Nothing warns against mixing a package's root and subpath imports, and for storage-adapters the consistent style is the `/mongo` subpath. `xy lint init` barrel restrictions cover only @xylabs and @xyo-network barrels. Resolved: four round-1 findings read this section as contradicting ariestools-sdk's "prefer subpaths" advice and proposed allowing subpaths generically. The 10.1.1 gap check and the source show the root default is correct; the ariestools-sdk text is what needs to change (see the ariestools-sdk audit).
  - **Fix:** Keep the root-barrel rule and the contrast between sub-packages and the umbrella. In the example, split the type (`import type { Payload } from '@xyo-network/sdk'`) and sort the specifiers, or use a generic `@scope/sdk` vs `@scope/payload-model` pair. Add: "Some packages publish subpaths as separate bundles. Do not mix a package's root and subpath imports in one dependency graph; follow the style the package's other consumers use, and check the package's own skill for exceptions." Replace the XYO/XL1 pointer with "the package's own skill: ariestools-sdk for `@ariestools/*`; domain packs such as XYOracleNetwork/xyo-skills for their barrels."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/package/compile/MonolithConfig.ts:155-166; ariestools/sdk-js/packages/sdk/xy.config.ts:4-11 (monolith, no `moduleLinkage`); ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:56-68; skills/ariestools-sdk/conventions.md:5-6, :17, :23; XYOracleNetwork/xyo-skills/skills/xyo-knowledge/best-practices.md:3-34.
  - <sub>ids: skills/xy-development/typescript.md#3, cov-configpkgs#18, cov-dev-conventions#13, arch-layering#7, gap-gap-sdk-subpath-identity#4</sub>

- 🟠 **Enums, parameter properties and runtime namespaces are compile errors, not "prefer unions"**
  - **Now:** typescript.md:85 "**Prefer union types** over enums: `type Status = 'active' | 'inactive'` rather than `enum Status { Active, Inactive }`". The Readonly section (:51) says nothing about parameter properties.
  - **Actual:** @ariestools/tsconfig sets `erasableSyntaxOnly` and `noImplicitOverride`. tsc 6.0.3 gives TS1294 for `enum`, `const enum`, `constructor(private readonly x: T)` and `namespace NS { export const y = 1 }`, and TS4114 for an override without `override`. Lint also warns on `TSEnumDeclaration`. sdk-js ships `Enum()` at `@ariestools/sdk/enum`. One exception: sdk-js/packages/threads sets `erasableSyntaxOnly` to false.
  - **Fix:** "No `enum` (a compile error under `erasableSyntaxOnly`). Use a string-literal union, or an `as const` object (optionally `Enum({...})` from `@ariestools/sdk/enum`) with a derived union when you need runtime values. Do not use constructor parameter properties; declare fields explicitly. No runtime `namespace` or `import x = require()`. Mark overriding members with `override` (`noImplicitOverride`)."
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:8, :19; packages/eslint-config-flat/src/typescript/index.ts:161-167; ariestools/sdk-js/packages/sdk/src/modules/enum/Enum.ts:48; workspace CLAUDE.md:45.
  - <sub>ids: skills/xy-development/typescript.md#5, cov-configpkgs#9, cov-dev-conventions#11</sub>

- ⚪ **"Strictness Posture" says the file covers what linters can't catch, but much of it is enforced**
  - **Now:** typescript.md:5 "Most opinions are enforced via ESLint. The conventions below cover what linters can't catch — judgment calls that require understanding intent."
  - **Actual:** At the default tier 3 with type checking, `consistent-type-definitions`, `prefer-optional-chain`, `prefer-nullish-coalescing`, `no-explicit-any` and `no-require-imports` are errors, and enum `no-restricted-syntax`, `simple-import-sort` and `consistent-type-imports` are warnings. The tsconfig enforces strict, noImplicitAny, noImplicitOverride and erasableSyntaxOnly. Warnings fail `xy lint` only with `--strict` or `XY_STRICT=1`.
  - **Fix:** "We are strict. The compiler (`@ariestools/tsconfig`) and ESLint (`@ariestools/eslint-config-flat`, tier 3 type-checked by default) enforce much of what follows. Items marked *(lint error)* or *(compile error)* fail `xy lint` or `tsc`; *(lint warning)* items fail only under `--strict`; `pnpm xy fix` autofixes import order and type-import style. The rest are judgment calls." Link to xy-toolchain eslint.md and typescript.md.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/tiers/recommendedConfig.ts:12-15; packages/toolchain/src/actions/lint-init.ts (generateEslintConfig); packages/toolchain/src/actions/lint.ts:232; packages/tsconfig/tsconfig.json:8, :18-19, :25.
  - <sub>ids: skills/xy-development/typescript.md#6</sub>

- ⚪ **The import-ordering bullet is approximate; simple-import-sort owns the order**
  - **Now:** typescript.md:80-81 "External packages first, then internal modules, separated by a blank line".
  - **Actual:** `simple-import-sort/imports` (v14) is effectively a warning at every tier, because its options override the catalog's tier-3 "error". It autofixes. Its default groups are side-effect imports, `node:` built-ins, packages, absolute paths, then relative paths.
  - **Fix:** "Import order is checked (as a warning) and autofixed by simple-import-sort: side-effect imports, `node:` built-ins, packages, absolute paths, then relative paths, with a blank line between groups. Run `pnpm xy fix` (or `pnpm xy lint --fix`) rather than ordering by hand. Warnings fail under `--strict` and count against the zero-warnings Definition of Done."
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/import/index.ts:26-28; src/tiers/rule-catalog/managed-rules.ts:131-132; src/tiers/rule-catalog/index.ts:61; eslint-plugin-simple-import-sort 14.0.0 imports.js:5-18.
  - <sub>ids: skills/xy-development/typescript.md#10, cov-dev-conventions#17</sub>

### Add

- 🟠 **The enforced in-package import restrictions are missing**
  - **Now:** Absent. typescript.md:64-81 covers only root barrels and ordering, which an agent could read as permission to import its own `index.ts`.
  - **Actual:** `no-restricted-imports` is an error from tier 0. It bans relative imports of `./index.ts` through `../../../../../../../index.ts`, and `src/` paths into another package. From tier 3, `workspaces/no-relative-imports` and `workspaces/require-dependency` are errors; they are off at tier 2, which sdk-react uses. Workspace rule: "no importing from barrel `index.ts` files". workflow.md:86 already covers declaring dependencies, and ariestools-sdk/conventions.md:9 covers another package's `src/`.
  - **Fix:** Add one line under Imports: "Inside a package, import the defining file directly (`./thing.ts`), never a local `index.ts` barrel. Reach other workspace packages by their package name, never by relative path or `src/`. These are lint errors in XY repos." Put the full list in xy-toolchain/eslint.md ("Import rules the shared config enforces") and link to it.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/rules/correctness.ts:5-28; src/rules/index.ts:44-56; src/tiers/rule-catalog/managed-rules.ts:46, :129-130; workspace CLAUDE.md:45.
  - <sub>ids: skills/xy-development/typescript.md#4, cov-dev-conventions#14</sub>

- 🟠 **strict-boolean-expressions and the other type-aware rules that change how code is written are missing**
  - **Now:** typescript.md:87 "**Null handling**: prefer optional chaining (`?.`) and nullish coalescing (`??`) over manual null checks". Nothing about truthiness.
  - **Actual:** The default tier 3 type-checked config makes `strict-boolean-expressions` an error: `if (name)` on `string | undefined` and `if (count)` on `number | undefined` both fail. `unicorn/no-typeof-undefined`, `no-floating-promises`, `no-misused-promises`, `no-deprecated`, `prefer-nullish-coalescing` and `prefer-optional-chain` are errors too. `unicorn/no-null` is off. Repos on tier 2 or without type checking (sdk-react) do not get these rules.
  - **Fix:** Expand null handling. Use `?.` and `??`. In conditions on nullable strings, numbers and booleans, write explicit comparisons (`name !== undefined`, `name.length > 0`, `count !== undefined && count > 0`). Compare with `=== undefined`, not `typeof x === 'undefined'`. Prefer `undefined` for absent values; `null` is not banned. Await or explicitly `void` every promise. Say that XY repos on the type-checked config (tier 3 and up) enforce these, and link the full list in xy-toolchain/eslint.md.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:57-58, :154; src/tiers/recommendedConfig.ts:12-15; src/typescript/index.ts:196, :206.
  - <sub>ids: skills/xy-development/typescript.md#7, cov-dev-conventions#15</sub>

- 🟠 **The enforced import-style rules are missing (`node:`, default import for `node:path`, `import type`, no namespace imports)**
  - **Now:** Absent. The ESM and Imports sections (typescript.md:56-81) do not cover built-in or type-import style.
  - **Actual:** `unicorn/prefer-node-protocol` and `unicorn/import-style` are errors. `import { join } from 'node:path'` gives "Use default import for module `node:path`", which is not autofixable. `consistent-type-imports` is a warning that requires type-only imports to be marked as types. Its fixer emits separate `import type` statements, and inline `type` qualifiers also pass. `import * as X` is banned only by workspace convention (`import-x/no-namespace` is not configured).
  - **Fix:** Add bullets: "Node built-ins use the `node:` prefix *(lint error)*; `node:path` takes a default import (`import PATH from 'node:path'`) *(lint error)*. Mark type-only imports as types, preferably as a separate `import type { … }`; `pnpm xy fix` rewrites them *(lint warning)*. No `import * as X`; import named symbols *(convention)*."
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:129; effective tier 2/3 config (`unicorn/prefer-node-protocol` [2], `unicorn/import-style` [2], `consistent-type-imports` [1], `import-x/no-namespace` unset); workspace CLAUDE.md:44-45.
  - <sub>ids: skills/xy-development/typescript.md#8</sub>

- 🟠 **House conventions that no linter enforces are missing (named exports, function style, boolean prefixes, file naming, `_` for unused)**
  - **Now:** typescript.md:86 "**Naming**: PascalCase for types and interfaces, camelCase for variables and functions" is the only naming or structure guidance.
  - **Actual:** The workspace CLAUDE.md:42-47, AGENTS.md:250-255 and sdk-js/AGENTS.md require named exports over default, top-level `function` declarations with arrows only for callbacks, `is`/`has`/`should`/`can` boolean prefixes, camelCase module files and PascalCase component or class files. Only file casing is lint-backed: `unicorn/filename-case` is an error at tier 3 and accepts camel, kebab and pascal. `import-x/no-default-export`, `func-style` and `naming-convention` are unset, and `unicorn/consistent-boolean-name` is disabled globally. Unused bindings follow the `^_` ignore pattern. Tool configs must default-export: eslint.config.ts, vitest.config.ts, xy.config.ts and Storybook `*.stories.tsx`. The pack also ships outside this workspace, where that CLAUDE.md does not exist.
  - **Fix:** Extend "Other Conventions". Named exports, except where a tool requires a default export (eslint.config.ts, vitest.config.ts, xy.config.ts, `*.stories.tsx`). Top-level `function` declarations, arrows only for callbacks. Booleans and boolean-returning predicates named `is…`, `has…`, `should…` or `can…`. Module files in camelCase, class and component files in PascalCase *(lint error at tier 3)*. Prefix intentionally unused bindings with `_`. Mark which items are lint-backed. Handle return types through the return-type item above rather than copying CLAUDE.md's line separately.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/unicorn/index.ts:96-103, :365; src/tiers/rule-catalog/managed-rules.ts:149; src/tiers/opinionated.ts:20-30; src/typescript/index.ts:94-99; src/tiers/recommendedConfig.ts:7-9 (`isTypeChecked`).
  - <sub>ids: skills/xy-development/typescript.md#9, cov-configpkgs#17, cov-dev-conventions#16</sub>

- ⚪ **The code-shape limits that are lint errors are not mentioned**
  - **Now:** Absent.
  - **Actual:** From tier 1 these are errors: `complexity` 18, `max-statements` 32, `max-lines` 512 (blank lines and comments skipped), `max-depth` 6 and `max-nested-callbacks` 6. `member-ordering` (by kind, then alphabetical) is an error at tier 3, and `explicit-member-accessibility` warns on `public`.
  - **Fix:** Add one sentence under Strictness Posture: "Keep functions small (lint errors above complexity 18, 32 statements or depth 6) and files under 512 code lines; omit `public`; order class members by kind, then alphabetically." Put the full numbers in xy-toolchain/eslint.md and link to it.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/rules/consistency.ts:8-21; src/typescript/index.ts:14-87, :126.
  - <sub>ids: skills/xy-development/typescript.md#11</sub>

## `skills/xy-development/workflow.md`

### Update

- 🔴 **`pnpm install --resolution-only` fails on pnpm 12, which every Aries Tools library repo pins**
  - **Now:** workflow.md:88 "After adding or changing dependencies, run `pnpm install --resolution-only` to force a fresh resolution check that surfaces all peer dependency warnings."
  - **Actual:** pnpm 12.4.2, 12.9.1 and 12.10.1 all exit with "error: unexpected argument '--resolution-only' found". The pins are toolchain pnpm@12.10.1; sdk-js, actor-kit, browser-kit and cli-kit 12.4.2; sdk-react 12.9.1. pnpm 11 and later has `pnpm peers`: a bare `pnpm peers` runs `pnpm peers check`, which supports `--json` and `--lockfile-only`. pnpm 10 and 11 still accept `--resolution-only`, and pnpm 10 has no `peers`.
  - **Fix:** "Check the pinned pnpm major (`packageManager`). On pnpm 11+ run `pnpm peers check` (add `--json` for automation, or `--lockfile-only` to check without node_modules); on pnpm 10 run `pnpm install --resolution-only`." Keep the claim that a no-op install hides peer warnings only if it is re-verified on pnpm 12.
  - **Evidence:** `pnpm install --resolution-only --help` on 12.x; `pnpm peers --help`; `corepack pnpm@11.25.0 install --help` (line 162); ariestools/cli-kit/package.json:39; ariestools/sdk-react/package.json:74; ariestools/toolchain/package.json (`packageManager`).
  - <sub>ids: skills/xy-development/workflow.md#0, cov-dev-conventions#1</sub>

- 🔴 **`pnpm --filter <package> build` fails in XY monorepos**
  - **Now:** workflow.md:27 "Use workspace-aware commands: `pnpm --filter <package> build`, not `cd packages/foo && pnpm build`".
  - **Actual:** No workspace package in sdk-js, toolchain, sdk-react, cli-kit, browser-kit or actor-kit defines `build`, and the repo-init package template gives packages only `package-compile`. In sdk-js, `pnpm --filter @ariestools/crypto build` exits 1 with ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT. The convention is `pnpm xy <cmd> <package>` from the repo root. `--filter … run <script>` still works for scripts a package defines, such as the toolchain's `bootstrap-toolchain`. Some verifiers rated this medium because the error is immediate; high is kept because the prescribed command fails.
  - **Fix:** "From the repo root, use its workspace-aware entry point: its CLI with a package argument (XY repos: `pnpm xy build <package>`; see xy-toolchain), or `pnpm --filter <pkg> run <script>` only for scripts the package actually defines. Never `cd` into a package to build it." State the XY form explicitly in xy-toolchain/toolchain.md as well.
  - **Evidence:** `node packages/toolchain/dist/bin/xy.mjs build --help` ("pnpm xy build [package]"); ariestools/toolchain/packages/toolchain/templates/repo/cli/package/package.json.tmpl; workspace CLAUDE.md:26, :32; skills/xy-toolchain/toolchain.md:51; skills/xy-toolchain/project-profiles.md:117-127.
  - <sub>ids: skills/xy-development/workflow.md#2, cov-cli#10, cov-toolchain-history#22, cov-dev-conventions#2, arch-layering#9</sub>

- 🔴 **"Always `pnpm add` the latest version" now installs TypeScript 7 and breaks XY repos**
  - **Now:** workflow.md:35 "always use `pnpm add <package>` … to resolve the latest published version … If a specific version is required for peer dependency compatibility, pin to that version explicitly".
  - **Actual:** The latest `typescript` is 7.0.2, the native compiler with no compiler API. @ariestools/toolchain 10.1.1 peers `typescript: ^5.9 || ^6.0`, and `xy updo` caps it at 6 because ESLint, deplint, dead and api-exposure load the compiler API. xy-toolchain/toolchain.md:44 makes this worse with an unpinned `pnpm add -D @ariestools/toolchain @ariestools/tsconfig typescript`, which installs TypeScript 7 today. On its own workflow.md:35 would be medium; together with that command it breaks `xy build` and `xy lint`.
  - **Fix:** In workflow.md:35 add: "'Latest' can fall outside a toolchain's peer range (e.g. TypeScript 7 vs @ariestools/toolchain, which needs 5.9 or 6); check the toolchain's peers before adding. In XY repos, upgrade with `pnpm xy updo`." The primary fix is in xy-toolchain/toolchain.md:44: `pnpm add -D @ariestools/toolchain @ariestools/tsconfig typescript@6`, noting that TypeScript 7 is installed side by side through `xyex enable ts-native`.
  - **Evidence:** `npm view typescript dist-tags` (latest 7.0.2); ariestools/toolchain/packages/toolchain/package.json:108; src/lib/updo/majorCeiling.ts:16-28; skills/xy-toolchain/toolchain.md:40-44.
  - <sub>ids: cov-toolchain-history#21</sub>

- 🟠 **The DoD gates give no XY mapping and no way to prove "zero warnings"**
  - **Now:** workflow.md:68 "(`pnpm build` or equivalent)"; :73 "(`pnpm lint` or equivalent) passes with zero errors and zero warnings"; :81 "(`pnpm test` or equivalent)"; :89 "A clean `pnpm compile` does not guarantee the app will run".
  - **Actual:** In XY repos the gates are `pnpm xy build` (compile, publint, deplint and lint; no tests), `pnpm xy test`, and `pnpm xy check`, which in 10.1.1 runs agent, git, packman, publint, repo, lint-config and skills lint. `xy lint` and `xy build` exit 0 when only warnings remain, unless `--strict` or `XY_STRICT=1` is set. A root `compile` script exists only in the toolchain repo.
  - **Fix:** Keep Layer 1 generic, but add one line under Definition of Done: "In repos using `@ariestools/toolchain`, the build/lint/dependency gate is `pnpm xy build --strict`, tests are `pnpm xy test` (`xy build` runs no tests), and repository policy is `pnpm xy check`; see `[xy-toolchain › Lifecycle gates](../xy-toolchain/commands.md#lifecycle-gates)`." Under §2 add: "A zero exit code proves zero warnings only in strict / max-warnings-0 mode." Change :89 to "a clean compile or type-check does not guarantee the app will run".
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/lintNext.ts:226; src/actions/lint.ts:232; src/lib/reporting/xyReporter.ts:46-48; `xy --help` ("--strict  Treat warnings as errors"); skills/xy-toolchain/commands.md:29-42.
  - <sub>ids: skills/xy-development/workflow.md#3, cov-dev-conventions#21, arch-layering#9</sub>

- 🟠 **The DoD tiers reuse "Layer 1/2/3" with a different meaning and never point at the toolchain gates**
  - **Now:** workflow.md:114-118 "Layer 1 — Generic DoD … Layer 2 — Domain DoD … Layer 3 — Project-specific acceptance criteria".
  - **Actual:** Elsewhere the pack uses Layer 2 for xy-toolchain (SKILL.md:25, testing.md:3, xy-toolchain/testing.md:197) and Layer 3 for ariestools-sdk (README.md). The DoD never refers to xy-toolchain's gate list ("Verify the selected profile"). xyo-skills deep-links `#definition-of-done`, `#applying-the-definition-of-done` and `#writing-project-specific-acceptance-criteria`.
  - **Fix:** Rename the tiers to "Gate 1/2/3" (Generic / Domain / Project) so that "Layer" means only skill layers. Under Gate 1 add: "in @ariestools/toolchain repos, satisfy this with xy-toolchain's gates (`project-profiles.md#verify-the-selected-profile`)". Keep the three headings unchanged, and coordinate the wording with xyo-skills (xl1-build/SKILL.md:152-160).
  - **Evidence:** skills/xy-toolchain/project-profiles.md:143-152; XYOracleNetwork/xyo-skills/skills/xl1-patterns/dapp-checklist.md:5-11; xl1-scaffold/SKILL.md:243-246.
  - <sub>ids: arch-layering#6</sub>

- 🟠 **The browser-verification step names MCP tools that do not exist**
  - **Now:** workflow.md:96 "**Claude in Chrome MCP** (`mcp__Claude_in_Chrome__*`) …"; :97 "**Claude Preview MCP** (`mcp__Claude_Preview__*`) — use `preview_start` with the dev URL, then `preview_console_logs` and `preview_network`".
  - **Actual:** Current Claude Code exposes `mcp__claude-in-chrome__*` (navigate, read_console_messages, read_network_requests) and `mcp__Claude_Browser__*` (preview_start, preview_logs, read_console_messages, read_network_requests). There is no `Claude_Preview` namespace, `preview_console_logs` or `preview_network`. The same text ships to Codex, where none of these names apply. Because :100 tells the agent to report "no browser MCP server" when it cannot find one, a stale name can lead an agent to skip runtime verification wrongly.
  - **Fix:** Lead with the capability: "Use whatever browser automation the session provides to open the dev URL, read console messages and network requests, and exercise the feature." Give current tool names only as examples that may change. Keep the rule about saying so explicitly when no browser tool is available.
  - **Evidence:** the audit sessions' tool registries; scripts/marketplace-sync/build-codex.mjs:9-10; skills/xy-agent/agents-md.md:76-80 (no volatile tool-specific workarounds in instruction files).
  - <sub>ids: skills/xy-development/workflow.md#4, cov-toolchain-history#25, cov-dev-conventions#18, arch-layering#19</sub>

- 🟠 **The peer-pin example `@mui/material@~7.3.9` is two majors behind the house React SDK**
  - **Now:** workflow.md:35 "(e.g., `pnpm add @mui/material@~7.3.9`)".
  - **Actual:** The latest @mui/material is 9.4.0; 7.x survives only as the `latest-v7` tag (7.3.11). The @ariestools/sdk-react-* 12.0.1 packages peer `@mui/material: ^9.4`. Copying the example creates exactly the peer conflict the sentence warns about.
  - **Fix:** Use a version-neutral example: "pin to the range the dependency's `peerDependencies` declare (`pnpm view <dep> peerDependencies`, then `pnpm add <peer>@<range>`)."
  - **Evidence:** `npm view @mui/material dist-tags`; ariestools/sdk-react/packages/sdk-react-app/package.json:182; sdk-react-ui/package.json:173; sdk-react-analytics/package.json:123.
  - <sub>ids: skills/xy-development/workflow.md#5, arch-coverage#13</sub>

- ⚪ **Package-manager, runtime and config discovery is lockfile-only and lists the dead `.eslintrc.*`**
  - **Now:** workflow.md:11-15 detects the package manager from lockfiles only (pnpm, yarn, npm); :31 lists `.eslintrc.*` / `eslint.config.*`. No step covers Node or package-manager versions.
  - **Actual:** The root `packageManager` field wins first, then pnpm lock or workspace files, bun.lock/bun.lockb, yarn, then npm; xy-toolchain/toolchain.md:29-37 gives the same order. Repos pin pnpm 12.x in `packageManager` and Node 26 in `volta`. Engines are `>=26` in sdk-js packages and `>=22` in toolchain packages, and pnpm flags differ between majors. ESLint 10 dropped eslintrc, and the repos ship `eslint.config.ts`. `xy.config.ts` and pnpm-workspace.yaml are also authoritative config.
  - **Fix:** Step 1: "Check the root `packageManager` field first (it pins the exact version), then the lockfile (`pnpm-lock.yaml`, `bun.lock`, `yarn.lock`, `package-lock.json`). Use the Node version pinned by `volta`, `.nvmrc` or `engines`. CLI flags differ between package-manager majors, so check `<pm> <cmd> --help` for the pinned version." Step 4: mark `.eslintrc.*` as legacy (unsupported from ESLint 10), and add `xy.config.ts` and `pnpm-workspace.yaml`. Keep concrete versions and the pnpm-only support policy in xy-toolchain.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/pm/detectPackageManager.ts:9-19; ariestools/toolchain/docs/STABILITY.md:62; `xy node lint --rules`; installed eslint 10.12.0 (no eslintrc dependency).
  - <sub>ids: skills/xy-development/workflow.md#9, cov-toolchain-history#24, cov-dev-conventions#4, arch-layering#20</sub>

- ⚪ **Credential Safety says to always gitignore `.npmrc` and every `.env.*`**
  - **Now:** workflow.md:52 "`.npmrc` — may contain npm auth tokens after `npm login`. Always add it to `.gitignore`."; :53 "`.env`, `.env.*` — … Always gitignored."; :55.
  - **Actual:** `xy packman convert` creates an empty project `.npmrc`, and the toolchain and sdk-react repos track an empty one. The toolchain gitignore template ignores `.env` and `.env.*` but re-includes `!.env.example`, and has no `.npmrc` entry. In 10.1.1, `xy updo` sends project-`.npmrc` tokens only to public registries and user-level tokens only to their own origin.
  - **Fix:** "Never commit auth tokens. Keep registry credentials in the user-level `~/.npmrc` or as `${NPM_TOKEN}` references. A tracked project `.npmrc` may hold only non-secret settings, so do not delete or untrack it. Gitignore `.env` and `.env.*`, but keep the `!.env.example` exception."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/packman/convertToPnpm.ts:120-127, :163; templates/gitignore/template.gitignore:24-27; src/lib/updo/fetchRegistryInfo.ts:16-18, :77-89.
  - <sub>ids: skills/xy-development/workflow.md#10, cov-dev-conventions#20</sub>

- ⚪ **The Vite example ("Rollup for build, esbuild for dev") is outdated for Vite 8**
  - **Now:** workflow.md:93 "(e.g., Vite uses Rollup for `build` but esbuild for `dev`)".
  - **Actual:** The repos pin vite ~8.3.x, which depends on Rolldown, with esbuild only an optional peer. The point still holds: dev and build differ.
  - **Fix:** "(e.g., Vite serves unbundled ESM in `dev` but produces a Rolldown bundle in `build`)", or drop the tool specifics.
  - **Evidence:** vite@8.3.2 package.json in ariestools/sdk-react node_modules (dependency `rolldown ~1.2.11`, no rollup); `npm view vite version`.
  - <sub>ids: skills/xy-development/workflow.md#8</sub>

- ⚪ **The generic DoD uses XL1/XYO product examples**
  - **Now:** workflow.md:103 "If the UI says \"Recorded on XL1 Blockchain\", the code must actually submit a transaction"; :104 "`Account.random()` instead of a real wallet connection"; :133 names `dapp-checklist.md` and the JSON-RPC envelope example.
  - **Actual:** README.md:17 places XL1/XYO product guidance in XYOracleNetwork/xyo-skills, and `dapp-checklist.md` exists only there. :117 and :133 are already framed as examples from a downstream domain pack.
  - **Fix:** Replace :103-104 with neutral examples, such as "If the UI says 'Saved', the code must actually persist it" and "a throwaway random key instead of a real wallet or auth connection". Optionally say "a domain pack's checklist" at :133 instead of naming `dapp-checklist.md`. Keep :117 and every DoD heading name, because xyo-skills deep-links them. The git.md:57 rationale is covered under git.md.
  - **Evidence:** README.md:3, :17; XYOracleNetwork/xyo-skills/skills/xl1-patterns/dapp-checklist.md:25.
  - <sub>ids: skills/xy-development/workflow.md#11, cov-dev-conventions#22, arch-layering#18</sub>

### Add

- 🟠 **The discovery checklist never routes to AGENTS.md/CLAUDE.md, the `xy` CLI or CI**
  - **Now:** workflow.md:9-35 goes from lockfile to scripts (`pnpm build`, `pnpm lint`, `pnpm test`, `pnpm dev`), then workspaces, config and dependencies. AGENTS.md appears only for documents (:47).
  - **Actual:** sdk-js, sdk-react, actor-kit, browser-kit and cli-kit have no root build, lint or test scripts, so `pnpm build` gives 'Command "build" not found'. The gate is the `xy` bin from the `@ariestools/toolchain` devDependency, and CI runs exactly that (`pnpm xy build --jobs 1`, `pnpm xy test`). Only the toolchain repo has root `build` and `compile` wrappers. SKILL.md:32 and xy-toolchain/toolchain.md:13-23 ("Start from repository truth") partly cover this.
  - **Fix:** Add step 0: "Read the repo's AGENTS.md / CLAUDE.md first; they override this checklist." Add to step 2: "If the script you need is absent, look for a repo CLI among devDependencies (XY repos: `pnpm xy <command>` from the root; see `[xy-toolchain](../xy-toolchain/toolchain.md#start-from-repository-truth)`)." Add: "Check `.github/workflows/*` for the commands CI treats as the gate." Reword :22 so a missing script never implies that raw tsc, eslint or vitest is acceptable. Do not put `pnpm xy …` into the Layer 1 DoD.
  - **Evidence:** ariestools/sdk-js/.github/workflows/verify.yml:46, :52; ariestools/cli-kit/.github/workflows/verify.yml:44, :47; ariestools/sdk-js/AGENTS.md:10-15; workspace CLAUDE.md:17, :26-33.
  - <sub>ids: skills/xy-development/workflow.md#1, cov-dev-conventions#3</sub>

- 🟠 **Dependency-add guidance misses workspace targeting, `minimumReleaseAge`, `allowBuilds` and range form**
  - **Now:** workflow.md:35 "always use `pnpm add <package>` … to resolve the latest published version"; :87 "Version ranges follow the repo's existing conventions".
  - **Actual:** In a multi-package workspace, `pnpm add` at the root is refused without `-w`, and package dependencies go in with `pnpm --filter <pkg> add`. Every Aries Tools repo sets `minimumReleaseAge: 1440` (excluding `@ariestools/*`) and an `allowBuilds` allowlist, so `pnpm add` resolves the newest eligible version, not the newest published one. `xy packman lint` checks the release-age settings but not `allowBuilds`. `pnpm add` saves `^`, but the deplint `range-style` rules want `~X.Y.Z` for dependencies and devDependencies and `^X.Y` for peers, and `xy deplint --fix` rewrites them.
  - **Fix:** Extend step 5: "In a workspace, add to the owning package (`pnpm --filter <pkg> add <dep>`, `-D` for dev); use `-w` only for root tooling. Respect the repo's package-manager policy (pnpm `minimumReleaseAge`, `allowBuilds`): the resolved version may trail npm `latest` by design, so do not override it, and a dependency that needs install scripts needs an `allowBuilds` entry. After adding, match the repo's range form (`pnpm add` saves `^`)." Put the deplint and packman specifics in xy-toolchain/commands.md:159.
  - **Evidence:** `pnpm add --help` on 12.x (`-w`, `--ignore-workspace-root-check`, `-F`); ariestools/cli-kit/pnpm-workspace.yaml:3-8; ariestools/toolchain/packages/toolchain/src/actions/package-lint-pnpm.ts:148-157; src/actions/releaseAgeExcludeScopes.ts:6; src/actions/deplint/rules.ts:412-470.
  - <sub>ids: skills/xy-development/workflow.md#6, cov-dev-conventions#19</sub>
