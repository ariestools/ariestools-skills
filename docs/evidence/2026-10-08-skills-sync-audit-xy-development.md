---
title: "Skills sync audit 2026-10-08 — xy-development"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Partial audit of the xy-development skill at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.0 (main 7eb43c3c2) and @ariestools/sdk 9.0.1 (298fbb5bb); 42 merged items, 41 verified by two lenses, 1 unverified because the run was paused."
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit — xy-development

This document records claims about `skills/xy-development/` at ariestools-skills `7e78933a8`. An auditor checked each claim against source at @ariestools/toolchain 10.1.0 (main `7eb43c3c2`), @ariestools/sdk 9.0.1 (`298fbb5bb`) and the workspace repos named in each item. Items marked `verified` were also confirmed by two independent verifiers, one checking the code and one checking the skill text. A merged item takes the strongest status among its member findings. Where a detail comes only from an unverified member, the item says so inline. The document does not show that `unverified` items are correct, because the verification run was paused before it reached them. Nothing here has been applied to the skills yet. This is evidence for a later remediation plan, not the plan itself. Back to the [Audit index](2026-10-08-skills-sync-audit.md).

## Summary

The skill's intent is sound, but some instructions now fail or mislead in current repos. Two fail outright. pnpm 12 rejects `pnpm install --resolution-only`, and the `any` + `// TODO` escape hatch fails a lint rule that is an error at every tier. git.md assumes Gitflow with `release/*` branches and an absolute ban on rewriting history, but most repos and the workspace commit-identity policy contradict both. typescript.md's guidance on `.js` extensions, return types, enums and root barrels conflicts with `@ariestools/tsconfig`, `eslint-config-flat` and the ariestools-sdk skill. The remaining items are enforced conventions the skill never mentions, stale examples (MUI 7, Vite/Rollup, TypeScript 5.x, renamed MCP tools) and XYO-specific content in what should be a generic layer.

| | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 0 | 0 | 0 | 0 |
| Update | 2 | 16 | 14 | 32 |
| Add | 0 | 6 | 4 | 10 |
| **Total** | 2 | 22 | 18 | 42 |

Status: **41 verified** · **0 partially verified** · **1 unverified**. The 90 raw findings merged into these 42 items, and none was refuted.

## `skills/xy-development/SKILL.md`

### Update

- 🟠 **The Related-skills link to xy-agent is broken in consumer installs, and no install path is given** · `verified`
  - **Now:** SKILL.md:33 reads "**`[xy-agent](../xy-agent/SKILL.md)`** — *recommended, not required.*", and workflow.md:47 has the same relative link. Neither says how to install it.
  - **Actual:** The toolchain catalog is `ARIESTOOLS_SKILLS = ['ariestools-sdk','xy-development','xy-toolchain']`. `xy skills lint --fix` and `xy repo init` install required skills one at a time, and xy-agent is never required. `commands.skillsLint.additionalSkills: ['xy-agent']` throws "Unknown skills". In a survey, 30 repos carry xy-development 0.1.5 and none carries xy-agent, so `../xy-agent/` did not resolve in any install observed.
  - **Fix:** At SKILL.md:33 and workflow.md:47, add: "If `../xy-agent/` is not installed, add it with `pnpm xy skills add ariestools/ariestools-skills --skill xy-agent`, or declare it in package.json `xy.skills: [{ "name": "xy-agent", "source": "ariestools/ariestools-skills" }]`." Optionally, also make the link absolute (`https://github.com/ariestools/ariestools-skills/tree/main/skills/xy-agent`). Do not suggest `xy skills defaults`, because it also installs the xyo-skills stack, which `skills.unnecessary` then flags on non-XL1 repos. Toolchain follow-up: register xy-agent as an optional ariestools-skills skill in defaults.ts and skillRules.ts.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:13-17, :67-73, :84-86; ariestools/toolchain/packages/toolchain/src/actions/skills/lint.ts:91-95; ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:80-96, :141-152; ariestools/toolchain/packages/toolchain/src/actions/skills/packageSkills.ts:133-149; ariestools/toolchain/packages/toolchain/src/actions/skills/skillsInstall.ts:24-52; `ls -d */*/.agents/skills/xy-agent` matched nothing; ariestools/toolchain/.xy/work/items/XYW-20260901-263436.json.
  - <sub>ids: skills/xy-development/SKILL.md#0, arch-distribution#5</sub>

- 🟠 **The git.md router entry omits the history-rewrite policy and the branching model** · `verified`
  - **Now:** SKILL.md:21-22: "Read when creating commits, branches, or preparing changes for review. Covers conventional commits, atomic commit discipline, and branch naming patterns."
  - **Actual:** git.md:46-62 is a hard list of prohibitions (amend, rebase, force-push, `reset --hard`, filter-branch), and git.md:64-90 defines the branching and release model. The entry has no trigger for pushing, undoing a commit or resolving a rejected push, which are exactly when those rules apply.
  - **Fix:** "Read when committing, branching, pushing, undoing a change, resolving a rejected push, opening or merging PRs, or cutting a release. Covers conventional commits and PR titles, atomic commits, history-rewrite policy, branching-model detection (Gitflow vs main-only), merge methods, and how releases are triggered." Apply it together with the git.md items below. *Conflict resolved:* SKILL.md#3 proposed advertising "the never-rewrite-history rule … and Gitflow branching". That wording would restate the absolute ban and the Gitflow default that the verified git.md items change, so this item uses the git.md#8 wording.
  - **Evidence:** skills/xy-development/SKILL.md:21-22; skills/xy-development/git.md:46-62, :64-90.
  - <sub>ids: skills/xy-development/SKILL.md#3, skills/xy-development/git.md#8, arch-layering#16</sub>

- ⚪ **The skill-identity example `xy-development v1.1.19` uses the retired xyo-skills version line** · `verified`
  - **Now:** SKILL.md:14 reads "format as `<skill-name> v<version>` (e.g. `xy-development v1.1.19`)". Line 12 ends with a colon, which leads into this paragraph instead of the Table of Contents.
  - **Actual:** The pack is at 0.1.5 (frontmatter and `.release-please-manifest.json`). 1.1.x is xyo-skills numbering: the redirect stub is 1.1.38, and legacy full copies from 1.1.21 to 1.1.30 are still installed in several XYOracleNetwork repos. The example was copied in when the pack was created (74f0248), and release-please never bumps it.
  - **Fix:** Replace it with: "**Skill identity.** Whenever you present a plan, an acknowledgement, or a completion summary, state which skills informed it as `<skill-name> v<version>`, reading the version from this file's frontmatter `metadata.version` — never from an example." Move the paragraph above line 12, or end line 12 with a period. Use the same block in xy-toolchain, xy-agent and ariestools-sdk. Do not add a "1.x or redirect means reinstall" sentence: it would ship only in the 0.x file, so it could never fire.
  - **Evidence:** skills/xy-development/SKILL.md:5, :14; .release-please-manifest.json; `git show 74f0248:skills/xy-development/SKILL.md`; XYOracleNetwork/xyo-skills/skills/xy-development/SKILL.md:8-11; XYOracleNetwork/xyo-skills/skills/xl1-patterns/SKILL.md:12. Both verifiers lowered the severity to low because the example only affects how an agent reports versions.
  - <sub>ids: skills/xy-development/SKILL.md#1, cov-dev-conventions#24, arch-distribution#20, arch-layering#16</sub>

- ⚪ **The workflow.md router entry omits the layered DoD, PRD acceptance criteria, dependency rules and credential safety** · `verified`
  - **Now:** SKILL.md:27-28: "Read before running any build, lint, or test command, and before declaring any task complete. Covers native toolchain discovery … and the definition of done checklist."
  - **Actual:** workflow.md also covers dependency and peer policy (:35, :83-89), Credential Safety (:49-55), browser verification (:91-100), the layered completion gate including the PRD `## Acceptance criteria` section (:112-122), and how to write acceptance criteria (:124-152). xyo-skills deep-links these sections.
  - **Fix:** "Read before running any build, lint, test, or dev command; before adding or upgrading dependencies; when writing a PRD.md's acceptance criteria; and before declaring any task complete. Covers native toolchain discovery, dependency and peer-dependency rules, credential safety (.npmrc/.env), the layered Definition of Done (generic → domain → PRD acceptance criteria), browser verification for apps, and how to write project-specific acceptance criteria."
  - **Evidence:** skills/xy-development/workflow.md:35, :49-55, :88-89, :91-100, :112-122, :124-152; XYOracleNetwork/xyo-skills/skills/xl1-build/SKILL.md:123, :152, :155; XYOracleNetwork/xyo-skills/skills/xl1-scaffold/SKILL.md:59, :243; XYOracleNetwork/xyo-skills/skills/xl1-patterns/dapp-checklist.md:5, :9.
  - <sub>ids: skills/xy-development/SKILL.md#2, arch-layering#16</sub>

- ⚪ **The typescript.md router entry omits most of the file's sections** · `verified`
  - **Now:** SKILL.md:19 reads "Covers strictness posture, the `any` escape hatch policy, return type inference, interface vs type usage, and naming conventions."
  - **Actual:** typescript.md also covers Readonly (:45-54), ESM Only (:56-62), root-barrel imports and ordering (:64-81), and unions over enums plus null handling (:85, :87).
  - **Fix:** Append "readonly usage, ESM-only module rules, import style (entry points, ordering), and unions over enums", and add "or organizing imports" to the read trigger. Once the typescript.md return-type item lands, change "return type inference" to "return-type rules" so the router no longer advertises the old default.
  - **Evidence:** skills/xy-development/typescript.md:45-87.
  - <sub>ids: skills/xy-development/SKILL.md#4</sub>

- ⚪ **The frontmatter description triggers on too few tasks** · `verified`
  - **Now:** SKILL.md:3 reads "Activates when writing code, running builds, performing git operations, or completing features."
  - **Actual:** The sub-files also cover writing and reviewing tests, adding dependencies, credential hygiene and PRD acceptance criteria. The sibling routers use an explicit "Use when …" list.
  - **Fix:** For example: "Core development standards: TypeScript conventions, Git workflow (conventional commits, history and branching policy), testing principles, and the Definition of Done. Use when writing or reviewing TypeScript, writing tests, adding dependencies, committing, branching or merging, writing PRD acceptance criteria, or before declaring any task complete." The finding's draft said "no history rewrites, Gitflow"; this version is reworded to match the git.md items.
  - **Evidence:** skills/xy-development/SKILL.md:3; skills/xy-toolchain/SKILL.md:3; skills/xy-agent/SKILL.md:3.
  - <sub>ids: skills/xy-development/SKILL.md#5, arch-layering#16</sub>

- ⚪ **The Layer 2 pointers at SKILL.md:25 and testing.md:3 are plain text, not links** · `verified`
  - **Now:** SKILL.md:25 reads "specific test frameworks and tooling are defined in the XY Toolchain skill (Layer 2)", and testing.md:3 says the same without a link.
  - **Actual:** xy-toolchain is installed beside xy-development at every xy tier, so a relative link resolves. xy-toolchain/testing.md:197 already links back to `../xy-development/testing.md`, and SKILL.md:32 uses the same relative style.
  - **Fix:** At SKILL.md:25, write "…are defined in `[xy-toolchain/testing.md](../xy-toolchain/testing.md)` (Layer 2)." At testing.md:3, write "Specific frameworks, runners, spec layout, and tooling configuration are defined in `[xy-toolchain → Testing with Vitest](../xy-toolchain/testing.md)` (Layer 2)." Do not add ariestools-sdk to Related skills. It is required only when a repo uses the SDK, so the link would be broken in many repos, just as the xy-agent link is. xy-toolchain/SKILL.md:48-50 already routes to it. The barrel pointer belongs in typescript.md (see the root-barrel item).
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:13-17, :67-73; ariestools/toolchain/packages/toolchain/src/actions/skills/skillRules.ts:99-120; skills/xy-toolchain/testing.md:197.
  - <sub>ids: skills/xy-development/SKILL.md#6, skills/xy-development/testing.md#3</sub>

## `skills/xy-development/git.md`

### Update

- 🟠 **Gitflow is presented as the default, but most repos work off `main`** · `verified`
  - **Now:** git.md:66 reads "We follow Gitflow … where possible", and :83 reads "New work starts as a `feature/` branch off `develop`". :89-90 allow main-only only as a "Pragmatism" exception for "smaller projects or early-stage work".
  - **Actual:** Only 9 of 80 local clones have `origin/develop`: the skill packs plus infrastructure, api-xyo-nodejs, app-portal, sdk-xyo-typechain, web-coin-react and web-coinapp.co-react. None of toolchain, sdk-js, sdk-react, actor-kit, browser-kit or cli-kit has one, and they all ship releases, so the Pragmatism exception does not cover them. `xy repo init` runs `git init -b main` and scaffolds CI that runs on pushes to main. Branch prefixes are mixed: toolchain has both `feat/` and `feature/`, and `claude/*` and `codex/*` worktree branches are merged straight into main.
  - **Fix:** Make detecting the repo's model the first rule. Read the repo's CLAUDE.md, AGENTS.md or DEVELOPMENT.md and run `git ls-remote --heads origin develop`. If `develop` exists, use Gitflow: `feature/*` off develop, release-please into main. Otherwise, use short-lived topic branches off `main` and merge them back into `main`. Match the prefixes the repo already uses. Drop "where possible" and fold the Pragmatism paragraph into this rule.
  - **Evidence:** a branch scan over ariestools/\*, xylabs/\* and XYOracleNetwork/\* found "9 of 80"; ariestools/toolchain/packages/toolchain/src/actions/repo-init/scaffold.ts:100-103; ariestools/toolchain/packages/toolchain/templates/repo/cli/root/github/workflows/build-pnpm.yml.tmpl:3-7; ariestools/toolchain/.github/workflows/build.yml:3-7; toolchain 5acf512db "Merge branch 'claude/eloquent-wright-73114e'"; sdk-js "Merge branch 'codex/bounded-response-reads'"; CLAUDE.md:40 (this repo); XYOracleNetwork/xyo-skills/CLAUDE.md:63.
  - <sub>ids: skills/xy-development/git.md#0, cov-dev-conventions#6</sub>

- 🟠 **The release flow (`release/<version>` branches, manual tagging, "every commit on main is a release") matches no repo** · `verified`
  - **Now:** git.md:69 reads "Every commit on main is a release." :75 defines `release/<version>` branches, :85-86 say to "create a `release/` branch … Merge the release branch into `main` (tag it)", and :76 and :87 define hotfix branches.
  - **Actual:** No repo has `release/*` or `hotfix/*` branches. Gitflow repos release through release-please. A develop → main PR with a `feat:`/`fix:` title is merged as a merge commit. release-please then opens a PR that bumps versions and tags, and an automated main → develop sync follows. Versions are never bumped by hand. The main-only toolchain follows the release checklist in its CONTRIBUTING.md: `xy deploy`, commit the bumps and tag `vX.Y.Z`, `xy publish`, then push. Both models put non-release commits on main ("workitem" and "updo" sit between "Deploy" commits). xy-toolchain documents neither `xy deploy` nor `xy publish`.
  - **Fix:** Remove the `release/<version>` branch type and workflow steps 3-4. Reword :69 to say that main holds released or releasable code and that the release process tags releases. Add a Releases note. Agents do not cut, publish or tag a release unless the owner asks, and they never bump versions by hand. Describe both models: (a) release-please repos and (b) main-only repos that follow their own release checklist. Link xy-toolchain for the commands. Keep hotfix only as "branch from main, fix, merge back; the sync carries it to develop". Do not require an annotated tag, because `v10.1.0` is lightweight.
  - **Evidence:** `git branch -r | grep -E 'release/|hotfix/|release-please'` across the Gitflow repos found only `release-please--branches--main--components--ariestools-skills`; DEVELOPMENT.md:70-87, release-please-config.json and CLAUDE.md:54 (this repo); XYOracleNetwork/xyo-skills/CLAUDE.md:76-83; ariestools/toolchain/CONTRIBUTING.md:36-47; ariestools/toolchain/packages/toolchain/src/actions/deploy.ts:10-15; toolchain 7eb43c3c2 "workitem", 3320116a4 "Deploy", 00e1d4d82 "updo"; skills/xy-agent/templates.md:62 and skills/xy-agent/agents-md.md:70 (publishing and deploying are left to the owner).
  - <sub>ids: skills/xy-development/git.md#1, cov-dev-conventions#6</sub>

- 🟠 **The absolute "Never Rewrite History" ban contradicts the workspace commit-identity policy and this repo's shared-branch rule** · `verified`
  - **Now:** git.md:48 reads "Git history is append-only…". :51-54 forbid `--amend`, any `rebase`, `--force`/`--force-with-lease` and `reset --hard` with no exceptions, and :61 reads "Bad commit message? Let it stand".
  - **Actual:** The workspace CLAUDE.md and AGENTS.md require rewriting an unpushed commit that has the wrong author email, keeping its tree, parents, message and dates. They allow force-pushing an already-pushed commit after asking the user. This repo's CLAUDE.md:41 limits the ban to shared branches, while xyo-skills keeps the absolute form. Gitflow repos squash-merge feature PRs as standard policy. An agent following git.md literally would refuse the identity fix.
  - **Fix:** Scope the rule:
    - Never rewrite pushed or shared history (main, develop, or any branch someone else may have fetched), and never force-push main or develop.
    - Local unpushed commits may be corrected when repo or workspace instructions require it, for example to fix commit identity while preserving tree, parents, message and dates.
    - Force-pushing an already-pushed feature branch needs explicit user approval.
    - Platform squash merges done under the repo's merge policy are not a history rewrite.

    Add: "Repository and workspace CLAUDE.md/AGENTS.md take precedence over this section." Add generic identity guidance: commit with the configured `user.name`/`user.email`; never override them with `--author`, `-c user.email` or `GIT_AUTHOR_EMAIL`/`GIT_COMMITTER_EMAIL`; check `git log --format='%h %ae %ce' <upstream>..HEAD` before pushing. Do not use `@{u}..HEAD`, which fails on a branch with no upstream. Keep the revert, fix-forward and cherry-pick guidance for mistakes that are already pushed.
  - **Evidence:** workspace CLAUDE.md:52-56 and workspace AGENTS.md:260-264; CLAUDE.md:41, :47-49 (this repo); XYOracleNetwork/xyo-skills/CLAUDE.md:63, :65-74.
  - <sub>ids: skills/xy-development/git.md#5, cov-dev-conventions#5, cov-dev-conventions#9</sub>

- ⚪ **The commit-type list lacks perf, style and revert, and has no breaking-change notation** · `verified`
  - **Now:** git.md:11-19 lists feat, fix, refactor, chore, docs, test, build and ci. The rules at :21-25 say nothing about breaking changes.
  - **Actual:** The PR-title lint for develop also accepts style, perf and revert. `!` is used in practice: toolchain 13350616a "feat(toolchain)!: remove lintlint, republint, node-lint, gitlint aliases", xyo-skills b67cd91 "feat!: …", and `refactor!:` commits plus BREAKING CHANGE footers in actor-kit. No commitlint or husky exists in the library repos, so the PR-title lint is the only enforcement. The release-please repos use `versioning: always-bump-patch` and the toolchain bumps versions with `xy deploy`, so `!` shapes the changelog, not the version number.
  - **Fix:** Add `perf`, `style` (formatting or lint-only changes) and `revert`. Add a rule: "Breaking changes: per the Conventional Commits spec, mark with `!` after the type/scope (e.g. `feat(toolchain)!: remove gitlint aliases`) and/or a `BREAKING CHANGE:` footer." Justify it by the spec, not as existing repo policy. Do not claim that release tooling derives the version bump from the type.
  - **Evidence:** .github/workflows/lint-pr-title.yml:43-54 (this repo); toolchain 13350616a, 78f3807d6, 6fb65ed66; XYOracleNetwork/xyo-skills b67cd91 and CLAUDE.md:77; release-please-config.json (this repo). cov-dev-conventions#8 rated this medium; both verifiers rated it low, because nothing fails when an agent uses only the listed types.
  - <sub>ids: skills/xy-development/git.md#3, cov-dev-conventions#8</sub>

- ⚪ **The examples and rationale are stale or XYO-specific** · `verified`
  - **Now:** git.md:32 has "chore: update typescript to 5.x", :29-30 use `feat(rps)` and `fix(wallet)`, :79 uses `feature/rps-game-ui` and `hotfix/wallet-connection-timeout`, and :57 reads "In a protocol built on cryptographic proof of origin, immutable history isn't just a preference".
  - **Actual:** The repos pin TypeScript ~6.0.3, and npm latest is 7.0.2. The file has not changed since 74f0248 (2026-07-31) and was inherited from the XYO dApp scaffold, but this pack is now the general Aries Tools Layer 1.
  - **Fix:** Use neutral or real examples, such as `feat(publint): check every monolith compile output against exports`, `fix(toolchain): merge per-step env in runStepAsync`, `chore: update typescript to 6.x` and, once the commit-type item lands, `feat(toolchain)!: remove gitlint aliases`. For branches, use something like `feature/lint-worker-budget`. Replace :57 with a project-neutral rationale: audit trail, collaborator safety, reproducible releases.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/package.json:66; ariestools/toolchain/packages/tsconfig-dom/package.json:46; `npm view typescript version` returned 7.0.2; `git log -- skills/xy-development/git.md`; the "Purpose" section of CLAUDE.md (this repo).
  - <sub>ids: skills/xy-development/git.md#7, arch-layering#18, cov-dev-conventions#22, cov-dev-conventions#8</sub>

### Add

- 🟠 **There are no rules for how to merge pull requests** · `verified`
  - **Now:** Absent. git.md:52 says "`git rebase` … — merge instead" but never says how PRs are merged.
  - **Actual:** Gitflow repos set the merge method by PR type: feature/\* → develop is squashed, develop → main is a merge commit, release-please → main is squashed, and main → develop is an automated merge commit. Squashing between long-lived branches leaves phantom commits in `git log main..develop`. The main-only toolchain merges `claude/*` branches with merge commits. Only ariestools-skills and xyo-skills write this down; the other Gitflow repos do not.
  - **Fix:** Add a "Merging pull requests" subsection. Use the merge method the repo declares in CLAUDE.md, AGENTS.md or DEVELOPMENT.md. One rule holds everywhere: between long-lived branches (develop ↔ main), always use a merge commit and never squash. Gitflow/release-please repos squash feature and fix PRs into develop and release-please PRs into main. Main-only repos may merge short-lived branches with a merge commit; follow the repo. A squash at PR-merge time is not a history rewrite. Where a repo squashes, the PR is the unit that lands, so its title matters (next item).
  - **Evidence:** CLAUDE.md:43-50 and DEVELOPMENT.md:89-96 (this repo); XYOracleNetwork/xyo-skills/CLAUDE.md:65-74, :80; toolchain 5acf512db, 48d96e78b, 40f3f012d.
  - <sub>ids: skills/xy-development/git.md#2, cov-dev-conventions#7</sub>

- ⚪ **Nothing says PR titles must be conventional commits, or that PRs into main accept only `feat:`/`fix:`** · `verified`
  - **Now:** Absent. git.md covers commit messages only.
  - **Actual:** `lint-pr-title.yml` in ariestools-skills, xyo-skills and xyo-skills-internal fails a PR into main unless its title starts with `feat:` or `fix:`; release-please branches are exempt. PRs into develop may use any listed type. A squash merge uses the PR title as the commit subject that release-please reads, so a develop → main PR titled `chore: …` fails CI.
  - **Fix:** Add to the merging subsection: "A PR title must itself be a valid conventional-commit subject, because a squash merge uses it as the commit subject changelog tooling reads. Where the repo runs lint-pr-title, PRs into `main` accept only `feat:` or `fix:` (use `fix:` for an integration PR with no features), and PRs into `develop` accept any listed type."
  - **Evidence:** .github/workflows/lint-pr-title.yml:12-28, :34-54 (this repo); XYOracleNetwork/xyo-skills/CLAUDE.md:78.
  - <sub>ids: skills/xy-development/git.md#4, cov-dev-conventions#7, cov-dev-conventions#8</sub>

## `skills/xy-development/testing.md`

### Update

- ⚪ **The "Good" test-name examples use a `should …` prefix that Layer 2 and most specs do not use** · `verified`
  - **Now:** testing.md:10-11 give "`should reject moves after game is finalized`" and "`should return the winner when both players have submitted`".
  - **Actual:** Layer 2 uses `it('accepts supported moves')`. Titles starting with "should", out of all titles: toolchain 0/1536, actor-kit 0/154, browser-kit 0/35, sdk-react 0/7, sdk-js 248/2010, cli-kit 212/494. No lint rule enforces either style.
  - **Fix:** Rewrite the examples as `rejects moves after the game is finalized` and `returns the winner when both players have submitted`. Add: "Match the repository's existing title style; a `should` prefix is optional — what matters is that the title states the expected behavior."
  - **Evidence:** skills/xy-toolchain/testing.md:204-211; ariestools/toolchain/packages/eslint-config-flat/package.json:51-57 (no vitest or jest plugin); counts of it()/test() titles in \*.spec.ts(x).
  - <sub>ids: skills/xy-development/testing.md#0</sub>

### Add

- ⚪ **No principle says tests must be independent, order-free and deterministic** · `verified`
  - **Now:** Absent. Determinism appears only as a reason to mock the clock or randomness (testing.md:51).
  - **Actual:** Under the org Vitest preset, spec files run in parallel by default, and specs under `spec/` run in both the Node project and the browser project. Only `defineXySerializedProject` turns file parallelism off, and it is meant for e2e suites that share external state.
  - **Fix:** Add an "Independent and Deterministic Tests" section:
    - Each test sets up and tears down its own state.
    - Tests pass in any order, including when test files run concurrently.
    - Tests never depend on wall-clock time, the network or shared external state (files, ports, chains, stores) unless the test controls it.
    - Slow or stateful e2e suites stay separate from fast unit tests.

    Add one sentence pointing to xy-toolchain → Testing with Vitest for runner details. Cite Vitest's `fileParallelism` default there, not xy's `--jobs`.
  - **Evidence:** ariestools/toolchain/packages/vitest-config/src/defineXyVitestProjects.ts:47-50; ariestools/toolchain/packages/vitest-config/src/defineXySerializedProject.ts:5-9, :18; ariestools/toolchain/packages/toolchain/src/actions/test.ts:8-15.
  - <sub>ids: skills/xy-development/testing.md#1</sub>

- ⚪ **The mocking guidance never requires an un-mocked test of the real wiring** · `verified`
  - **Now:** testing.md:49-52 list the boundaries it is appropriate to mock. Nothing requires at least one test that crosses the real boundary.
  - **Actual:** The toolchain's 2026-10-06 code review found the serious defects in orchestration that the specs mocked away: a mocked package manager, and mocked `gh` and spawn calls. A shipped bug survived because of this.
  - **Fix:** Under "When mocks are appropriate", add: "Mocking a boundary in unit tests is fine, but keep at least one integration or end-to-end test that exercises the real wiring across it. Orchestration that is mocked in every test is untested."
  - **Evidence:** ariestools/toolchain/docs/code-review-2026-10-06.md:5, :16, :202, :204.
  - <sub>ids: skills/xy-development/testing.md#2</sub>

## `skills/xy-development/typescript.md`

### Update

- 🔴 **The `any` escape hatch ends with a TODO comment, which fails the `no-explicit-any` lint error at every tier** · `verified`
  - **Now:** typescript.md:17 reads "5. **Only then: `any`** — with a `// TODO: [reason alternatives don't work]` comment explaining the constraint."
  - **Actual:** `@typescript-eslint/no-explicit-any` is an error at tiers 0-4. With type checking on (the default), the `no-unsafe-*` rules and `ban-ts-comment` are errors too, and from tier 2 `unicorn/no-abusive-eslint-disable` bans blanket disables. Linting the TODO pattern gives `error @typescript-eslint/no-explicit-any`, so following step 5 fails `xy lint`, which the DoD (workflow.md:73-75) requires to pass. The repos use `// eslint-disable-next-line @typescript-eslint/no-explicit-any`. It appears in 3 toolchain files and 6 sdk-js files, and sdk-js also has 23 file-scoped disables, mostly in packages/threads. None of them carries a `-- reason` yet.
  - **Fix:** Rewrite step 5 as: "Only then: `any`, scoped as narrowly as possible with `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <why the alternatives don't work>`. `no-explicit-any` is an error at every lint tier. Never use a blanket `eslint-disable` or `@ts-ignore`; if you must suppress a compiler error, use `@ts-expect-error <description>`." At :19 ("contained, never contagious"), add that `any` flowing into other values triggers the type-checked `no-unsafe-*` errors.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:185-203; ariestools/toolchain/packages/eslint-config-flat/src/tiers/recommendedConfig.ts:12-15; `ESLint.calculateConfigForFile` at tiers 0-4; @typescript-eslint/eslint-plugin `dist/rules/ban-ts-comment.js:75-82`; ariestools/toolchain/packages/toolchain/src/lib/withError.ts:2; `eslint --print-config` in ariestools/cli-kit; workspace CLAUDE.md:45.
  - <sub>ids: skills/xy-development/typescript.md#1, cov-configpkgs#0, cov-dev-conventions#0</sub>

- 🟠 **The skill says to use `.js` in relative imports, but the house convention is `.ts`/`.tsx`** · `verified`
  - **Now:** typescript.md:62 reads "Use `.js` extensions in relative import paths (TypeScript resolves `.ts` → `.js`)".
  - **Actual:** `@ariestools/tsconfig` sets `allowImportingTsExtensions` together with `noEmit`. Counts of relative specifiers in packages/\*/src, as `.ts` (plus `.tsx`) against `.js`:
    - toolchain: 1809 / 0
    - sdk-react: 891 `.ts` + 374 `.tsx` / 0
    - actor-kit: 268 / 0
    - cli-kit: 288 / 0
    - browser-kit: 130 / 0
    - sdk-js: 1052 / 29 (leftovers)

    The lint ban on `index.ts` barrels is written with `.ts` paths, so `./index.js` slips past it. `.js` still resolves under NodeNext and esbuild, so the result is inconsistent code and a lint blind spot, not a failing build. The pack also contradicts itself: xy-toolchain/typescript.md:34 lists `allowImportingTsExtensions`, while xy-toolchain/testing.md:202 imports `'../validateMove.js'`.
  - **Fix:** Replace :62 with: "Use explicit `.ts` / `.tsx` extensions in relative import paths (`import { x } from './x.ts'`). The base `@ariestools/tsconfig` enables `allowImportingTsExtensions` and the toolchain compile handles them. Do not write `.js` specifiers for TypeScript sources; they break house convention and slip past the lint rule that bans importing `index.ts` barrels. Repos not on the shared tsconfig follow their own convention." Also fix xy-toolchain/testing.md:202. Do not say the compile "rewrites" or "emits the runtime extensions": esbuild bundles relative imports away, and the emitted `.d.ts` files keep `.ts` specifiers. arch-layering#8 offers an alternative: keep Layer 1 at "explicit extensions, matching the repo" and move the `.ts` house rule into xy-toolchain/typescript.md.
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:4, :17; ariestools/toolchain/packages/eslint-config-flat/src/rules/correctness.ts:5-14; ariestools/toolchain/packages/eslint-config-flat/src/rules/index.ts:8-17; a scratch lint at tier 3, where `./index.ts` gives a no-restricted-imports error and `./index.js` gives none; ariestools/toolchain/packages/toolchain/dist/index.d.ts (`from './xy/index.ts'`); toolchain commit e5e23bd41. Both verifiers lowered the severity from high to medium.
  - <sub>ids: skills/xy-development/typescript.md#0, cov-configpkgs#8, cov-toolchain-history#23, arch-layering#8, cov-dev-conventions#12</sub>

- 🟠 **"Do not annotate return types" contradicts the workspace rule for exported functions** · `verified`
  - **Now:** typescript.md:23-31: "## Return Types: Prefer Inference … **Do not annotate return types** unless …".
  - **Actual:** The workspace CLAUDE.md and sdk-js/AGENTS.md require explicit return types on exported functions, and `Promise<T>` (never `Promise<Promisable<T>>`) for functions that await. Lint does not enforce this: `explicit-module-boundary-types` is off and `explicit-function-return-type` is not configured. Outside this workspace, the skill is the only place an agent would learn the rule. In practice, 712 of 742 exported functions in the toolchain packages are annotated, and 102 of 124 in sdk-js.
  - **Fix:** "Annotate return types on exported functions and methods (the module contract). Let inference handle local helpers, callbacks and inline arrows. When a function uses `await`, declare `Promise<T>`, never `Promise<Promisable<T>>`. Always annotate type guards (`x is T`) and recursive functions." Keep the covariance rationale for non-exported code only, and update the SKILL.md router wording to match.
  - **Evidence:** workspace CLAUDE.md:43, :46; workspace AGENTS.md:251, :254; ariestools/sdk-js/AGENTS.md:58; ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:101; ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:54; ariestools/sdk-js/packages/sdk/src/modules/promise/types.ts:6.
  - <sub>ids: skills/xy-development/typescript.md#2, cov-configpkgs#10, cov-dev-conventions#10</sub>

- 🟠 **The root-barrel section is XYO-specific, steers away from packages that are now deprecated anyway, and conflicts with ariestools-sdk's subpath guidance** · `verified`
  - **Now:** typescript.md:64-78 reads "Import from the root barrel package of each monorepo … reach for a named sub-package only when the symbol genuinely is not on the barrel". It gives an `@xyo-network/sdk` example and an "Avoid" list (`@xyo-network/payload-model`, `payload-builder`, `account`), and ends with "See the XYO and XL1 knowledge skills…".
  - **Actual:**
    - @ariestools/sdk 9.0.1 publishes 54 export keys (`.`, `./fetch`, `./fetch/model`, …). Its README and the Layer 3 skill both prefer subpath imports.
    - The packages on the "Avoid" list are deprecated compatibility shims.
    - The `@ariestools/sdk/telemetry` re-exports are deprecated, and `no-deprecated` is an error at tier 3, so the root barrel is not always the right import.
    - The XYO/XL1 knowledge skills ship only in xyo-skills, where xyo-knowledge/best-practices.md already covers this guidance. No xyo-skills file links to these anchors.
    - The example imports the type `Payload` in a value import, which `consistent-type-imports` would split out.
  - **Fix:** Make the section generic: "Import a package by its published entry point: the umbrella/root package or one of its subpath exports (`pkg/<module>`, or `pkg/<module>/model` for types). Prefer the umbrella and its subpaths over separately published per-module packages, many of which are now deprecated compatibility shims. Never use deep `dist/` paths or another package's `src/`." Use `@ariestools/sdk` and `@ariestools/sdk/fetch` as the example, with types on a separate `import type` line. Leave the subpath-vs-root choice and the specialist packages (such as `@ariestools/telemetry`) to `../ariestools-sdk/conventions.md` ("see the ariestools-sdk skill when installed"). For XYO/XL1, point to "domain skill packs" generically. Do not mention the `xy lint init` barrel restrictions: `BARREL_DESCRIPTORS` covers only legacy barrels, two of them deprecated, and has no entry for @ariestools/sdk.
  - **Evidence:** `npm view` deprecation notices for @xyo-network/payload-model@7.0.15, payload-builder@7.0.15, account@7.0.15, @xyo-network/sdk-js@7.0.10 and @xylabs/sdk-js@8.0.2; ariestools/sdk-js/packages/sdk/package.json exports; ariestools/sdk-js/packages/sdk/README.md:5-18, :235-237; skills/ariestools-sdk/conventions.md:5-7, :17; skills/ariestools-sdk/overview.md:22-29; XYOracleNetwork/xyo-skills/skills/xyo-knowledge/best-practices.md:3-34; ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:56-68; XYOracleNetwork/sdk-protocol-js/packages/sdk-protocol-core/src/modules/payload-model/Payload.ts:52.
  - <sub>ids: skills/xy-development/typescript.md#3, arch-layering#7, cov-dev-conventions#13, cov-configpkgs#18, skills/xy-development/SKILL.md#6</sub>

- 🟠 **Enums, parameter properties and runtime namespaces are compile errors, not a "prefer unions" preference** · `verified`
  - **Now:** typescript.md:85 reads "**Prefer union types** over enums…". The Readonly section suggests "Class properties set in the constructor" (:51) and never mentions parameter properties.
  - **Actual:** `@ariestools/tsconfig` sets `erasableSyntaxOnly: true` and `noImplicitOverride: true`. tsc 6.0.3 reports TS1294 on `enum`, on `constructor(private readonly x: number)` and on `namespace NS { export const y = 1 }`. Lint also warns on enum declarations ("Enums are disallowed…") and on `no-namespace`. The SDK ships `Enum()` (`@ariestools/sdk/enum`) for the const-object pattern.
  - **Fix:** "No `enum`. It is a compile error under the base tsconfig (`erasableSyntaxOnly`). Use a string-literal union, or an `as const` object (optionally `Enum({...} as const)` from `@ariestools/sdk/enum`) when you need runtime values." In Readonly, add: "Declare `readonly` fields explicitly. Constructor parameter properties are not allowed (`erasableSyntaxOnly`). Mark overriding members with `override` (`noImplicitOverride`)." Also rule out runtime `namespace` and `import x = require()`.
  - **Evidence:** ariestools/toolchain/packages/tsconfig/tsconfig.json:8, :19 (`erasableSyntaxOnly` since 7d4b6b5ec, 2025-08-06); TS1294 from a scratch tsc 6.0.3 run; ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:161-167; ariestools/sdk-js/packages/sdk/src/modules/enum/Enum.ts and model.ts; workspace CLAUDE.md:45.
  - <sub>ids: skills/xy-development/typescript.md#5, cov-configpkgs#9, cov-dev-conventions#11</sub>

- 🟠 **"Strictness Posture" says the file covers what linters can't catch, but the compiler or lint enforces most of it** · `verified`
  - **Now:** typescript.md:5 reads "Most opinions are enforced via ESLint. The conventions below cover what linters can't catch — judgment calls…".
  - **Actual:** In the default tier-3 type-checked config, consistent-type-definitions, prefer-optional-chain, prefer-nullish-coalescing, no-explicit-any and no-require-imports are errors, and the enum restriction and simple-import-sort are warnings. The tsconfig enforces strict, noImplicitAny, noImplicitOverride and erasableSyntaxOnly. The file never mentions the tsconfig side.
  - **Fix:** "We are strict. The compiler (`@ariestools/tsconfig`: strict, noImplicitAny, noImplicitOverride, erasableSyntaxOnly) and ESLint (`@ariestools/eslint-config-flat`, tier 3 type-checked by default) enforce most of what follows. Items marked *(enforced)* are tsc errors or lint errors/warnings; warnings fail `xy lint` only in strict mode. `pnpm xy fix` autofixes formatting, import order and type-import style. The rest are judgment calls." Tag each enforced bullet, and link `../xy-toolchain/eslint.md` and `../xy-toolchain/typescript.md`.
  - **Evidence:** `ESLint.calculateConfigForFile` with `recommendedConfig({tier:3,isTypeChecked:true})`; ariestools/toolchain/packages/eslint-config-flat/src/tiers/recommendedConfig.ts:12-15; ariestools/toolchain/packages/toolchain/src/actions/lint-init.ts:102; ariestools/toolchain/packages/toolchain/src/actions/lint.ts:232; ariestools/toolchain/packages/tsconfig/tsconfig.json:8, :18, :19, :25.
  - <sub>ids: skills/xy-development/typescript.md#6</sub>

- ⚪ **The import-ordering bullet should defer to simple-import-sort and its autofix** · `verified`
  - **Now:** typescript.md:80-81: "External packages first, then internal modules, separated by a blank line".
  - **Actual:** simple-import-sort v14 enforces the order as an autofixable warning at tier 3. Its groups are side-effect imports, `node:` built-ins, packages, absolute imports, then relative imports, each separated by a blank line.
  - **Fix:** "Import order is enforced and autofixed by simple-import-sort: side-effect imports, then `node:` built-ins, then packages, then relative imports, with a blank line between groups. Run `pnpm xy fix` (or `pnpm xy lint --fix`) rather than ordering by hand."
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/import/index.ts:26-28; ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:131; eslint-plugin-simple-import-sort 14.0.0 `imports.js:5-19`. cov-dev-conventions#17 says the rule is an error at tier 3, but both verifiers observed an effective warning (`[1]`).
  - <sub>ids: skills/xy-development/typescript.md#10, cov-dev-conventions#17</sub>

### Add

- 🟠 **The enforced import boundaries inside a package are missing (no own `index.ts` barrels, no `src/` paths, no cross-package relative imports)** · `verified`
  - **Now:** Absent. :64-81 only say to import from root barrels, which an agent could read as permission to import its own package's `index.ts`.
  - **Actual:** `no-restricted-imports`, an error from tier 0, bans `./index.ts` through `../../../../../../../index.ts` and any `**/src/**` path. At tier 3, `workspaces/no-relative-imports` and `workspaces/require-dependency` are also errors. The workspace CLAUDE.md says "no importing from barrel `index.ts` files".
  - **Fix:** Add an "Imports inside a package/monorepo" subsection. Import sibling modules directly (`./thing.ts`), never through `./index.ts` or `../index.ts`. Reach other workspace packages by their published name and declare them as dependencies; never use a relative path or `src/`. Note that these are lint errors at the default tier.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/rules/correctness.ts:5-28; ariestools/toolchain/packages/eslint-config-flat/src/rules/index.ts:19-56; ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:46, :129-130; a scratch lint of `import { helper } from './index.ts'` gave an error; `eslint --print-config` in ariestools/cli-kit; workspace CLAUDE.md:45.
  - <sub>ids: skills/xy-development/typescript.md#4, cov-dev-conventions#14</sub>

- 🟠 **Null handling does not cover `strict-boolean-expressions` (no implicit truthiness on nullable strings or numbers)** · `verified`
  - **Now:** typescript.md:87 says to "prefer optional chaining (`?.`) and nullish coalescing (`??`) over manual null checks". Truthiness checks are not mentioned.
  - **Actual:** In the tier-3 type-checked config, `strict-boolean-expressions` is an error. `if (name)` on `string | undefined` fails with "Unexpected nullable string value in conditional", and `if (count)` on `number | undefined` fails the same way. `unicorn/no-typeof-undefined` is an error, and `unicorn/no-null` is off. cov-dev-conventions#15, which is unverified, adds that no-floating-promises, no-misused-promises and no-deprecated are also errors at tier 3.
  - **Fix:** Expand the bullet into a short subsection:
    - Use `?.` and `??` *(enforced)*.
    - In conditions, compare nullable strings, numbers and booleans explicitly: `name !== undefined`, `name.length > 0`, `count !== undefined && count > 0`.
    - Compare with `=== undefined` or `=== null`, not `typeof x === 'undefined'`.
    - Prefer `undefined` for absent values in new code, but `null` is not banned.

    Optionally, from the unverified member: await or explicitly `void` every promise, avoid calling `@deprecated` APIs, and link xy-toolchain/eslint.md for the full rule catalog.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:57-58, :154; a scratch lint at tier 3; `eslint --print-config` in ariestools/cli-kit.
  - <sub>ids: skills/xy-development/typescript.md#7, cov-dev-conventions#15</sub>

- 🟠 **The enforced import-style rules are missing: the `node:` prefix, a default import for `node:path`, and separate `import type`** · `verified`
  - **Now:** Absent from the ESM and Imports sections (:56-81).
  - **Actual:** `unicorn/prefer-node-protocol` is an error. `unicorn/import-style` is an error that requires a default import of `node:path`, which matches CLAUDE.md's `import PATH from 'node:path'`. `consistent-type-imports` is a warning, set to `separate-type-imports` and autofixed. CLAUDE.md also forbids `import * as X`, but no lint rule enforces that (`import-x/no-namespace` is not configured).
  - **Fix:** Add: "Node built-ins use the `node:` prefix *(enforced)*; `node:path` takes a default import (`import path from 'node:path'`) *(enforced)*. Type-only imports go in their own `import type { … }` statement (autofixed). Prefer named imports over `import * as X` — not lint-enforced; namespace-style libraries such as `import * as z from 'zod/mini'` are the accepted exception."
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:129; a scratch lint where `import { join } from 'node:path'` gave a unicorn/import-style error and `import fs from 'fs'` gave a prefer-node-protocol error; workspace CLAUDE.md:44-45.
  - <sub>ids: skills/xy-development/typescript.md#8, cov-dev-conventions#14, cov-dev-conventions#16, cov-configpkgs#17</sub>

- 🟠 **The remaining house conventions are missing: named exports, top-level function declarations, boolean prefixes, file naming, `_` for unused bindings** · `verified`
  - **Now:** typescript.md:86, "PascalCase for types and interfaces, camelCase for variables and functions", is the only guidance on naming or structure.
  - **Actual:** Some of these are conventions only, with no lint rule, so outside this workspace the skill is their only source:
    - named exports over default exports (`import-x/no-default-export` is not configured)
    - top-level `function` declarations, with arrows only for callbacks (`func-style` is not configured)
    - booleans prefixed `is`/`has`/`should`/`can` (`unicorn/consistent-boolean-name` is deliberately disabled)

    Two are lint-enforced:
    - `unicorn/filename-case` is an error at tier 3 and accepts camelCase, kebab-case or PascalCase.
    - Unused bindings need a `_` prefix (`no-unused-vars` warns, with `^_` ignored).

    Some files must default-export: Storybook `*.stories.tsx` (all 68 `export default` statements in sdk-react) and config files.
  - **Fix:** Extend "Other Conventions":
    - Use named exports. No default exports except where a tool requires one: Storybook stories, `eslint.config.*`, `vitest.config.*`.
    - Use `function` declarations at the top level, and arrows only for callbacks.
    - Name booleans and predicates `is…`/`has…`/`should…`/`can…` (a convention, not lint-enforced).
    - Name module files in camelCase and class or component files in PascalCase (*enforced* at tier 3; kebab-case is also accepted).
    - Prefix intentionally unused bindings with `_` (lint warns otherwise).
  - **Evidence:** workspace CLAUDE.md:42-47; ariestools/sdk-js/AGENTS.md:51-57; ariestools/toolchain/packages/eslint-config-flat/src/unicorn/index.ts:96-103, :364-365; ariestools/toolchain/packages/eslint-config-flat/src/tiers/rule-catalog/managed-rules.ts:149; ariestools/toolchain/packages/eslint-config-flat/src/tiers/opinionated.ts:20-30; ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:94-99; ariestools/toolchain/packages/eslint-config-flat/src/tiers/recommendedConfig.ts:7-9, :65-70 (the toolchain renamed its own `typeChecked` option to `isTypeChecked`).
  - <sub>ids: skills/xy-development/typescript.md#9, cov-configpkgs#17, cov-dev-conventions#16</sub>

- ⚪ **The file never mentions the code-size limits that lint enforces as errors, or the class-member conventions** · `verified`
  - **Now:** Absent.
  - **Actual:** From tier 1, these are errors: complexity above 18, more than 32 statements, more than 512 lines per file (blank lines and comments not counted), depth above 6, and more than 6 nested callbacks. `explicit-member-accessibility: no-public` is a warning, and `member-ordering` is an error at tier 3 (members grouped by kind, then sorted alphabetically).
  - **Fix:** Add one sentence under Strictness Posture: "Keep functions small (lint errors above complexity 18 / 32 statements / depth 6) and files under 512 code lines; omit `public`; class members are ordered by kind and then alphabetically." Put the full numbers in `../xy-toolchain/eslint.md` and link to it.
  - **Evidence:** ariestools/toolchain/packages/eslint-config-flat/src/rules/consistency.ts:8-21; ariestools/toolchain/packages/eslint-config-flat/src/typescript/index.ts:14-87, :126.
  - <sub>ids: skills/xy-development/typescript.md#11</sub>

## `skills/xy-development/workflow.md`

### Update

- 🔴 **`pnpm install --resolution-only` fails on pnpm 12, which every @ariestools library repo pins** · `verified`
  - **Now:** workflow.md:88 reads "Note: `pnpm install` suppresses warnings when the lockfile is already up to date. After adding or changing dependencies, run `pnpm install --resolution-only` to force a fresh resolution check that surfaces all peer dependency warnings."
  - **Actual:** pnpm 12.4.2 and 12.9.1 exit with "unexpected argument '--resolution-only' found". pnpm 12 checks peers with `pnpm peers`, which is the same as `pnpm peers check` and supports `--json` and `--lockfile-only`. toolchain, sdk-js, actor-kit, browser-kit and cli-kit pin pnpm@12.4.2, and sdk-react pins pnpm@12.9.1. Older majors behave differently. This repo pins pnpm@10.33.2, which accepts `--resolution-only` but has no `peers` command. pnpm 11 has both.
  - **Fix:** Make the instruction version-aware: "Check the pinned pnpm major (`packageManager`). On pnpm 11+ run `pnpm peers` (same as `pnpm peers check`; `--json` for automation, `--lockfile-only` to skip node_modules) to list unmet or missing peer dependencies. On pnpm 10, `pnpm install --resolution-only` re-runs resolution and prints peer issues." Drop the claim that `pnpm install` suppresses warnings when the lockfile is up to date; neither verifier confirmed it. *Conflict resolved:* workflow.md#0 said to recommend only `pnpm peers` and to name no version range, while cov-dev-conventions#1 recommended version-aware wording. I checked locally, and the version-aware wording is correct. A pnpm-12-only instruction would break pnpm-10 repos, including this one.
  - **Evidence:** In the toolchain repo, `pnpm install --resolution-only --help` on 12.4.2 errored; `pnpm --help` lists "peers: Checks for unmet or missing peer dependency issues". The `packageManager` fields are in toolchain/package.json, sdk-js, actor-kit, browser-kit, cli-kit and sdk-react. Checked for this document: in this repo (pnpm 10.33.2), `pnpm install --help` lists `--resolution-only` ("Re-runs resolution: useful for printing out peer dependency issues"), and `pnpm peers` fails with "Command \"peers\" not found". With corepack in an empty directory, pnpm 11.0.8 and 11.25.0 both provide `pnpm peers`, and 11.25.0 still lists `--resolution-only`.
  - <sub>ids: skills/xy-development/workflow.md#0, cov-dev-conventions#1</sub>

- 🟠 **`pnpm --filter <package> build` fails in XY repos and contradicts the root-scoped `xy` convention** · `verified`
  - **Now:** workflow.md:27: "Use workspace-aware commands: `pnpm --filter <package> build`, not `cd packages/foo && pnpm build`".
  - **Actual:** No workspace package in toolchain, sdk-js, sdk-react, actor-kit, browser-kit or cli-kit has a `build` script, so the command exits 1 (`ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT` on pnpm 12.4.2). The convention is to run `pnpm xy build <package>` from the root (`xy build [package]`). `--filter` still works for scripts a package does define, for example the toolchain's `pnpm --filter @ariestools/toolchain run package-compile`.
  - **Fix:** "Run commands at the scope the repo's tooling expects. If a root CLI orchestrates the workspace, pass it the package name from the root (XY repos: `pnpm xy build <package-name>`; see xy-toolchain). Otherwise use `pnpm --filter <package> run <script>` for scripts the package actually defines. Never `cd` into a package to build."
  - **Evidence:** `scripts` in packages/\*/package.json across the six repos; ariestools/toolchain/packages/toolchain/templates/repo/cli/package/package.json.tmpl, whose only script is package-compile; `xy.mjs build --help`; workspace CLAUDE.md:26, :32; skills/xy-toolchain/toolchain.md:51. cov-dev-conventions#2 rated this high, but both verifiers rated it medium: the "no script" error is non-destructive, and the line sits under a conditional step.
  - <sub>ids: skills/xy-development/workflow.md#2, cov-cli#10, cov-toolchain-history#22, arch-layering#9, cov-dev-conventions#2</sub>

- 🟠 **The DoD gates name `pnpm build`/`lint`/`test`/`compile` and require "zero warnings", with no XY equivalents and no way to prove zero warnings** · `verified`
  - **Now:** workflow.md:68 "(`pnpm build` or equivalent)"; :73 "(`pnpm lint` or equivalent) passes with zero errors and zero warnings"; :81 "(`pnpm test` or equivalent)"; :89 "A clean `pnpm compile` does not guarantee…".
  - **Actual:** In XY repos:
    - `pnpm xy build` runs compile, publint, deplint and ESLint, but not tests.
    - Tests run with `pnpm xy test`.
    - Repository policy runs with `pnpm xy check`.
    - A root `compile` script exists only in the toolchain repo.
    - `xy lint` and `xy build` exit 0 when only warnings remain, unless `--strict` or `XY_STRICT=1` is set, so exit 0 does not prove zero warnings.
  - **Fix:** Add under Definition of Done: "In repos using `@ariestools/toolchain`, the build/lint/dependency gates are `pnpm xy build --strict` (or `pnpm xy lint --strict` + `pnpm xy deplint --strict`), tests are `pnpm xy test` (`xy build` does not run tests), and repository policy is `pnpm xy check`. See `[xy-toolchain › Lifecycle gates](../xy-toolchain/commands.md#lifecycle-gates)` and `[Verify the selected profile](../xy-toolchain/project-profiles.md#verify-the-selected-profile)`." Change :89 to "a clean compile (`pnpm xy compile` or the repo's equivalent)". Under §2, add: "A zero exit code proves zero warnings only if the lint command runs in strict / max-warnings-0 mode." Under §4 (phantom dependencies), point to `xy deplint`.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/lintNext.ts:226; ariestools/toolchain/packages/toolchain/src/actions/lint.ts:232; ariestools/toolchain/packages/toolchain/src/lib/reporting/xyReporter.ts:46-48; `xy.mjs --help`; toolchain commit a499070cc; skills/xy-toolchain/commands.md:29, :31-41; skills/xy-toolchain/project-profiles.md:143-152; ariestools/sdk-js/.github/workflows/verify.yml:46, :52; `scripts.compile` in ariestools/toolchain/package.json.
  - <sub>ids: skills/xy-development/workflow.md#3, cov-dev-conventions#3, cov-dev-conventions#21, arch-layering#9</sub>

- 🟠 **The DoD tiers reuse "Layer 1/2/3" with a different meaning from the skill layers, and leave out the toolchain gate** · `unverified`
  - **Now:** workflow.md:116-118: "Layer 1 — Generic DoD … Layer 2 — Domain DoD … Layer 3 — Project-specific acceptance criteria". The same skill calls xy-toolchain "Layer 2" (SKILL.md:25, testing.md:3).
  - **Actual:** README.md:9-13 and CLAUDE.md define Layer 1 = xy-development, Layer 2 = xy-toolchain and Layer 3 = ariestools-sdk. xy-toolchain's own completion gates (project-profiles.md:143-152; toolchain.md:66, "xy build does not run tests…") have no place in this completion gate. xyo-skills reuses the DoD tier names and deep-links the headings.
  - **Fix:** Rename the tiers so that "Layer" only ever means a skill layer, for example "Gate 1/2/3" (Generic / Domain / Project). Under the generic gate, add: "in @ariestools/toolchain repos, satisfy this with xy-toolchain's gates (project-profiles.md#verify-the-selected-profile: build, test, check)". Keep the headings `## Definition of Done`, `### Applying the Definition of Done` and `## Writing Project-Specific Acceptance Criteria` unchanged, because downstream anchors depend on them. Coordinate the wording change with xyo-skills.
  - **Evidence:** skills/xy-development/workflow.md:112-122; README.md:9-13; skills/xy-toolchain/project-profiles.md:143-152; XYOracleNetwork/xyo-skills/skills/xl1-patterns/dapp-checklist.md:5-11; XYOracleNetwork/xyo-skills/skills/xl1-scaffold/SKILL.md:244-246; XYOracleNetwork/xyo-skills/skills/xl1-build/SKILL.md:154-160. Both lenses verified the same defect as `skills/xy-development/workflow.md#7`, which the run filed under the architecture group.
  - <sub>ids: arch-layering#6</sub>

- 🟠 **The browser-verification MCP tool names are outdated** · `verified`
  - **Now:** workflow.md:96 names "**Claude in Chrome MCP** (`mcp__Claude_in_Chrome__*`)", and :97 names "**Claude Preview MCP** (`mcp__Claude_Preview__*`) — use `preview_start` …, then `preview_console_logs` and `preview_network`".
  - **Actual:** The current Claude Code namespaces are:
    - `mcp__claude-in-chrome__*`: navigate, read_console_messages, read_network_requests
    - `mcp__Claude_Browser__*`, the built-in preview: preview_start, preview_logs, read_console_messages, read_network_requests. Cloud sessions use `mcp__remote-devices__Claude_Browser__*`.

    No `mcp__Claude_Preview__*`, `preview_console_logs` or `preview_network` exists. An agent searching for the documented names may wrongly fall through to the "no browser available" branch (:100). The skills tree is also copied into the Codex plugin, where none of these names apply.
  - **Fix:** Lead with the tool-agnostic requirement: open the dev URL, read console messages and failed network requests, and exercise the feature. Then give current names only as examples: "for example Claude in Chrome `mcp__claude-in-chrome__*`, or the built-in preview `mcp__Claude_Browser__*`: `preview_start`/`navigate`, then `read_console_messages` and `read_network_requests`; `preview_logs` for dev-server output". Keep the rule to say so explicitly when no browser tool is available.
  - **Evidence:** the audit session's tool registry; scripts/marketplace-sync/build-codex.mjs:10; skills/xy-agent/agents-md.md:76-80, which bans volatile tool-specific workarounds in instruction files.
  - <sub>ids: skills/xy-development/workflow.md#4, cov-toolchain-history#25, arch-layering#19, cov-dev-conventions#18</sub>

- 🟠 **Discovery reads only the lockfile, ignores runtime versions, and lists a config format ESLint 10 no longer reads** · `verified`
  - **Now:** workflow.md:11-15 detect the package manager from the lockfile only (pnpm, yarn or npm), and :30-32 list `.eslintrc.*`. No step covers Node or package-manager versions.
  - **Actual:**
    - The toolchain checks the root `packageManager` field first, then pnpm-lock/pnpm-workspace, bun.lock(b), yarn.lock/.yarnrc.yml, and package-lock/npm-shrinkwrap. xy-toolchain/toolchain.md:29-37 gives the same order.
    - Repos pin pnpm 12.x in `packageManager` and Node 26.x in `volta`. sdk-js, cli-kit and browser-kit declare `engines.node ">=26"`, and the toolchain packages declare `">=22"`.
    - This repo runs Node 24 and pnpm 10.33.2, so there is no single baseline, and pnpm CLI flags differ between majors (see the `--resolution-only` item).
    - ESLint 10.12.0 has no eslintrc support; repos ship `eslint.config.ts`.
    - `xy.config.ts` and `pnpm-workspace.yaml` are authoritative config in all six repos.
  - **Fix:** Step 1: "Check the root `packageManager` field first (it pins the exact version), then the lockfile (`pnpm-lock.yaml`, `bun.lock`, `yarn.lock`, `package-lock.json`). Use the Node version pinned by `volta` / `.nvmrc` / `engines`, and the pinned package manager via Corepack. Do not assume CLI flags carry across package-manager majors." Step 4: list `eslint.config.*` (flat config; `.eslintrc.*` is legacy and unsupported from ESLint 10) and add `xy.config.ts` and `pnpm-workspace.yaml`. Keep concrete version numbers in xy-toolchain, not in Layer 1.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/pm/detectPackageManager.ts:9-19; ariestools/toolchain/docs/STABILITY.md:62; the `packageManager` and `volta` fields in toolchain, sdk-js, sdk-react, cli-kit, browser-kit and actor-kit; `engines` in ariestools/toolchain/packages/toolchain/package.json; `lib/eslint/` in the installed eslint 10.12.0; `xy.mjs node lint --rules` (node.volta-node-latest, node.engines-node-range); browser-kit 6660849 "require Node 26+"; package.json (this repo: engines >=24, volta 24.15.0, pnpm@10.33.2). The medium severity comes from the runtime and package-manager-version part (cov-dev-conventions#4, unverified); the verified detection and config part was rated low.
  - <sub>ids: skills/xy-development/workflow.md#9, cov-toolchain-history#24, arch-layering#20, cov-dev-conventions#4</sub>

- 🟠 **"Always resolve the latest published version" ignores workspace targeting, release-age policy, peer ceilings and range style** · `verified`
  - **Now:** workflow.md:35 says that when adding new dependencies, "always use `pnpm add <package>` … to resolve the latest published version."
  - **Actual:**
    - In a multi-package pnpm workspace, `pnpm add` at the root is refused without `-w`. Package dependencies are added with `pnpm --filter <pkg> add`.
    - All six repos set `minimumReleaseAge: 1440` (excluding `@ariestools/*`) and an `allowBuilds` allowlist, which `xy packman lint` enforces. `pnpm add` may therefore deliberately resolve a version older than `npm view` shows.
    - Ranges are mostly `~`, while `pnpm add` saves `^`, and deplint enforces the full-patch tilde form.
    - From the unverified member: `typescript` latest is 7.0.2, which is outside the toolchain peer range `^5.9 || ^6.0`.
  - **Fix:** In Layer 1, keep it generic: "In a workspace, add to the package that imports it: `pnpm --filter <pkg> add <dep>` (`-D` for dev-only). Use `-w` only for true root tooling. Respect the repo's package-manager policy (minimum release age, build-script allowlist); the resolved version may deliberately trail npm `latest` — do not hand-pin around it. Match the repo's range prefix after adding, and check the toolchain's peer ranges before taking a new major." In Layer 2, document `minimumReleaseAge`/`minimumReleaseAgeExclude`, `allowBuilds`, `xy updo` and the range normalization done by `xy deplint --fix` in xy-toolchain/toolchain.md, and link it from Layer 1.
  - **Evidence:** `pnpm add --help` on 12.4.2 (`--ignore-workspace-root-check`, `-F`, `-w`); ariestools/cli-kit/pnpm-workspace.yaml:3-8, with the same settings in toolchain, sdk-js and sdk-react; ariestools/toolchain/packages/toolchain/src/actions/package-lint-pnpm.ts:70-78, :148-154; ariestools/toolchain/packages/toolchain/src/actions/releaseAgeExcludeScopes.ts:6; `xy.mjs deplint --rules` (dep.dependencies.range-style); ariestools/toolchain/packages/toolchain/src/lib/updo/majorCeiling.ts:16-28; `npm view typescript dist-tags`. The medium severity rests on the TypeScript 7 member (cov-toolchain-history#21, unverified); the verified part (workflow.md#6) was rated low.
  - <sub>ids: skills/xy-development/workflow.md#6, cov-dev-conventions#19, cov-toolchain-history#21</sub>

- ⚪ **The peer-pin example `@mui/material@~7.3.9` is two majors behind and conflicts with @ariestools/sdk-react's peer range** · `verified`
  - **Now:** workflow.md:35 gives "(e.g., `pnpm add @mui/material@~7.3.9`)".
  - **Actual:** @mui/material latest is 9.4.0; 7.x survives only as the `latest-v7` tag (7.3.11). sdk-react 12.0.1 packages declare the peer `^9.4`, so copying the example causes exactly the peer conflict the sentence warns about.
  - **Fix:** Use a version-neutral instruction: "pin to the range the dependent package declares (check `pnpm view <pkg> peerDependencies`, then `pnpm add <peer>@<required-range>`)".
  - **Evidence:** `npm view @mui/material version dist-tags --json`; ariestools/sdk-react/packages/sdk-react-app/package.json (peer `^9.4`, dev `~9.4.0`); ariestools/sdk-react/packages/sdk-react-analytics/package.json:108, :123; ariestools/sdk-react/packages/sdk-react-crypto/package.json:100.
  - <sub>ids: skills/xy-development/workflow.md#5, arch-coverage#13</sub>

- ⚪ **The Vite example ("Rollup for build but esbuild for dev") is outdated for Vite 8** · `verified`
  - **Now:** workflow.md:93: "(e.g., Vite uses Rollup for `build` but esbuild for `dev`)".
  - **Actual:** The repos pin vite ~8.3.x. Vite 8 depends on Rolldown and lists esbuild only as an optional peer. The underlying point still holds: the dev server serves unbundled ESM while `build` produces a bundle.
  - **Fix:** "(e.g., Vite serves unbundled ESM in `dev` but produces a Rolldown bundle in `build`; older Vite used esbuild for dev and Rollup for build)", or drop the tool names.
  - **Evidence:** the vite@8.3.2 package.json in ariestools/sdk-react's node_modules; `npm view vite version` returned 8.3.4; root devDependencies in toolchain, sdk-js, sdk-react and cli-kit.
  - <sub>ids: skills/xy-development/workflow.md#8</sub>

- ⚪ **Credential Safety says to always gitignore `.npmrc` and every `.env.*`, which conflicts with the toolchain** · `verified`
  - **Now:** workflow.md:52 says of `.npmrc`, "Always add it to `.gitignore`." :53 says `.env` and `.env.*` are "Always gitignored", and :55 says to verify that `.gitignore` includes `.npmrc` and `.env`.
  - **Actual:** `xy packman convert` creates an empty project `.npmrc`, and toolchain and sdk-react track an empty one. The toolchain's gitignore template ignores `.env` and `.env.*` but re-includes `!.env.example`, and has no `.npmrc` entry. Practice is mixed: browser-kit and this repo do ignore `.npmrc`.
  - **Fix:** "Never commit auth tokens. Keep registry credentials in the user-level `~/.npmrc` or as `${NPM_TOKEN}` references. A tracked project `.npmrc` must contain no secrets; some toolchain-converted repos track an empty one, so do not delete or untrack it. Gitignore `.env` and `.env.*` but keep the `!.env.example` exception the toolchain gitignore template ships."
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/packman/convertToPnpm.ts:120-126, :163; `git ls-files .npmrc` in toolchain and sdk-react; ariestools/toolchain/packages/toolchain/templates/gitignore/template.gitignore:24-27; ariestools/browser-kit/.gitignore:25; .gitignore:74 (this repo).
  - <sub>ids: skills/xy-development/workflow.md#10, cov-dev-conventions#20</sub>

- ⚪ **The generic Layer 1 DoD uses XL1/XYO product examples** · `verified`
  - **Now:** workflow.md:103: "If the UI says \"Recorded on XL1 Blockchain\"…"; :104: "`Account.random()` instead of a real wallet connection"; :117: "dApp checklists"; :133: `dapp-checklist.md` and "no hand-rolled JSON-RPC envelopes".
  - **Actual:** README.md:17-19 puts XL1/XYO product guidance in xyo-skills; this pack is meant to be generic. The JSON-RPC example mirrors xyo-skills dapp-checklist.md:25 and will go stale silently if that checklist changes.
  - **Fix:** Use neutral examples: "If the UI says 'Saved to server', the code must actually persist it"; "a random throwaway key instead of a real wallet/auth connection"; "a domain checklist from a domain skill pack". Keep the JSON-RPC example only if it is labelled as coming from a downstream pack. Do not rename `## Definition of Done`, `### Applying the Definition of Done` or `## Writing Project-Specific Acceptance Criteria`, which xyo-skills links to 3, 9 and 9 times respectively.
  - **Evidence:** README.md:17; XYOracleNetwork/xyo-skills/skills/xl1-patterns/dapp-checklist.md:25; a grep of xyo-skills \*.md for workflow.md anchors. arch-layering#18 proposed removing these sentences; the verified finding keeps them with neutral examples instead.
  - <sub>ids: skills/xy-development/workflow.md#11, arch-layering#18, cov-dev-conventions#22</sub>

### Add

- 🟠 **The discovery checklist never points to the repo's AGENTS.md/CLAUDE.md, to a CLI installed as a devDependency such as `xy`, or to the CI workflows** · `verified`
  - **Now:** workflow.md:17-22 say "If `\"build\"` exists, use `pnpm build` …". Nothing in :9-35 mentions AGENTS.md or CLAUDE.md, `@ariestools/toolchain`, or `.github/workflows`.
  - **Actual:** In sdk-js, sdk-react, actor-kit, browser-kit and cli-kit, the root package.json has no build, lint, test or compile script. The toolchain repo's root does have `build` and `compile`, which wrap `pnpm xy`. No workspace package has `build`. CI runs `pnpm xy build --jobs 1` and `pnpm xy test`, and the AGENTS.md files and the workspace CLAUDE.md name `pnpm xy …`. Because each step is conditional, the checklist goes silent rather than giving a wrong command. xy-toolchain covers this, but Layer 1 never links to it.
  - **Fix:**
    - Add a step 0: "Read the repo's AGENTS.md / CLAUDE.md first; it is authoritative for the build, lint and test commands."
    - After :22, add: "If the gate you need has no script, look for a toolchain CLI among the root devDependencies. In XY/Aries Tools repos, `@ariestools/toolchain` provides `pnpm xy <command>`, run from the repo root; see the `[xy-toolchain skill](../xy-toolchain/toolchain.md#start-from-repository-truth)`. A missing script never makes raw `tsc`/`eslint`/`vitest` the deliverable path."
    - Also add: "Check `.github/workflows/*` to see which commands CI treats as the gate."
  - **Evidence:** the root `scripts` of the six repos; ariestools/sdk-js/.github/workflows/verify.yml:46, :52; ariestools/cli-kit/.github/workflows/verify.yml:44, :47; ariestools/sdk-js/AGENTS.md:7-19; workspace CLAUDE.md:17, :26-33; skills/xy-toolchain/SKILL.md:14; skills/xy-toolchain/toolchain.md:15-23; in a scratch pnpm 12.4.2 workspace, `pnpm build` failed with "Command \"build\" not found".
  - <sub>ids: skills/xy-development/workflow.md#1, cov-dev-conventions#3</sub>

## Outside this skill

### Update

- ⚪ **`skills/xy-toolchain/commands.md` documents only part of what `xy git lint` checks (cache ignores are missing)** · `verified`
  - **Now:** git.md never mentions line endings, case sensitivity or tool caches. skills/xy-toolchain/commands.md:158 describes `xy git lint` only as "LF settings and case sensitivity".
  - **Actual:** `xy git lint` is stable and has four warn-level, fixable rules: git.ignorecase, git.autocrlf, git.eol, and git.ignore-toolchain-cache (`**/.xy/cache/` must be ignored in every package). It runs inside `xy check`, and `xy fix` runs `git lint --fix`. The legacy `xy gitlint` alias was removed in 13350616a (v10.0.0). `.xy/work` is meant to be tracked, but no rule enforces that, because a bare `.xy` ignore entry still counts as compliant.
  - **Fix:** This finding was filed against git.md, but the verifiers moved the fix to Layer 2. Expand the commands.md:158 row to name all four rules, and note near the `xy work` section that `.xy/work` is tracked and should not be ignored. git.md gets at most one toolchain-agnostic line: "use LF line endings and case-sensitive filenames; never commit tool caches; the repo's toolchain enforces this — see xy-toolchain". Layer 1 should contain no `.xy` paths or commands.
  - **Evidence:** ariestools/toolchain/packages/toolchain/src/actions/gitlint.ts:14-77; ariestools/toolchain/packages/toolchain/src/actions/gitlintIgnore.ts:7-9, :21-28; ariestools/toolchain/packages/toolchain/src/xy/common/checkCommand.ts:48-53; ariestools/toolchain/packages/toolchain/src/actions/fix.ts:20; `xy.mjs git lint --rules`; toolchain commit cada677a2.
  - <sub>ids: skills/xy-development/git.md#6</sub>

**Edits outside this skill that items above call for.** These are not counted as separate items.

- `skills/xy-toolchain/testing.md:202`: change `'../validateMove.js'` to `.ts` (from the `.js`/`.ts` extensions item).
- `skills/xy-toolchain`: add a deploy/publish section that git.md's Releases note can link to (from the release-flow item).
- `skills/xy-toolchain/toolchain.md`: document `minimumReleaseAge`, `allowBuilds`, `xy updo` and the range style that deplint enforces (from the dependency-add item).
- `skills/xy-toolchain/eslint.md`: list the code-size limits (from the code-size limits item).
- `skills/xy-toolchain`, `skills/xy-agent` and `skills/ariestools-sdk` SKILL.md files: use the same skill-identity block (from the skill-identity item).
- ariestools/toolchain `src/actions/skills/defaults.ts` and `skillRules.ts`: register xy-agent as an optional ariestools-skills skill (from the xy-agent item).
- XYOracleNetwork/xyo-skills: coordinate any renaming of the DoD tiers (from the "Layer 1/2/3" item).

## Refuted during verification

None. No finding for this skill was refuted. The verification run was paused before it reached the 47 raw findings that remain unverified, and 46 of those were merged into items that have at least one verified member.
