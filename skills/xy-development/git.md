# Git Workflow

## Conventional Commits

All commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description
```

### Types
- `feat` — a new feature
- `fix` — a bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `perf` — code change that improves performance
- `style` — formatting or lint-only change with no behavior change
- `chore` — maintenance tasks, dependency updates, config changes
- `docs` — documentation only changes
- `test` — adding or updating tests
- `build` — changes to the build system or dependencies
- `ci` — changes to CI configuration
- `revert` — reverts a previous commit

### Rules
- **Scope** is optional but encouraged (e.g., `feat(updo): ignore selected dependencies`)
- **Description** is lowercase, imperative mood, no trailing period
- Keep the first line under 72 characters
- Use the body for additional context when the description alone isn't enough
- Mark breaking changes with `!` after the type/scope (e.g., `feat(toolchain)!: remove gitlint aliases`) and/or a `BREAKING CHANGE:` footer

### Examples
```
feat(publint): check every monolith compile output against exports
fix(toolchain): merge per-step env in runStepAsync
refactor(api): extract payload validation into shared utility
feat(toolchain)!: remove gitlint aliases
chore: update typescript to 6.0
```

## Atomic Commits

Each commit is exactly **one logical change**.

- Every commit should compile and pass tests independently
- If a change requires multiple steps, each step is its own commit
- Don't mix refactoring with feature work in one commit
- Don't mix formatting changes with logic changes

If you find yourself writing "and" in a commit message, consider splitting it into two commits.

## Commit Identity

- Commit with the repository's configured `user.name` and `user.email`. Never override identity with `--author`, `-c user.email=…`, or `GIT_AUTHOR_EMAIL` / `GIT_COMMITTER_EMAIL`.
- Before pushing, check author and committer: `git log --format='%h %ae %ce' @{u}..HEAD` (on a branch with no upstream yet, compare against its base, e.g. `origin/main..HEAD`).

## Repository Hygiene

Use LF line endings and case-sensitive filenames; never commit tool caches or generated output. See [xy-toolchain › Repository policy](../xy-toolchain/commands.md#repository-policy) for the enforcing command.

## Never Rewrite History

Git history is append-only. We add to it; we don't rewrite it. Repository and workspace instructions (CLAUDE.md, AGENTS.md) take precedence over this section.

**Never do any of the following:**
- `git commit --amend` — make a new commit instead
- `git rebase` (interactive or otherwise) — merge instead
- `git push --force` or `git push --force-with-lease` — if the push is rejected, resolve it with a merge
- `git reset --hard` to a previous commit — use `git revert` to undo changes
- `git filter-branch` or `git rebase --onto` — history stays as-is

**Exceptions:** When repository or workspace instructions require it (for example, to fix commit identity), correct a local, unpushed commit, keeping its tree, parents, message, and dates. If such a commit was already pushed to your own topic branch, force-push it with `--force-with-lease` only with the user's explicit approval. Never rewrite `main`, `develop`, or any branch others have built on. This is not a general license to amend or rebase.

**Why:** Rewriting history destroys the audit trail, breaks collaborators' branches, and makes releases irreproducible — what you see should be what actually happened and what was actually shipped.

**If you made a mistake in a commit:**
- Wrong code? Make a new commit that fixes it.
- Bad commit message? Let it stand — the next commit's message can provide context.
- Committed to the wrong branch? Cherry-pick to the right branch, revert on the wrong one.

## Branching Model

Detect the repo's model before you branch. Read its CLAUDE.md, AGENTS.md, CONTRIBUTING.md, or DEVELOPMENT.md, and check for a `develop` branch with `git ls-remote --heads origin develop`.

- **`develop` exists → [Gitflow](https://nvie.com/posts/a-successful-branching-model/).** Branch off `develop` and merge back into `develop`.
- **No `develop` → trunk.** Use short-lived branches off `main`, merged back into `main`. The Aries Tools library repos work this way.

### Long-lived Branches
- **`main`** — released or releasable code. Releases are tagged.
- **`develop`** (Gitflow only) — integration branch for the next release. Feature branches merge here.

### Short-lived Branches
- **`feature/<description>`** — new functionality, branched from the integration branch (`develop`, or `main` in trunk repos) and merged back to it
- **`fix/<description>`** — bug fixes during development, same base as features
- **`hotfix/<description>`** (Gitflow) — urgent production fixes, branched from `main` and merged into `main`, then returned to `develop` through the repo's automated `main` → `develop` sync or a back-merge PR

### Branch Naming
- Match the prefixes the repo already uses (`feature/` or `feat/`; check `git branch -r`)
- Use kebab-case for the description: `feature/lint-worker-budget`, `fix/bounded-response-reads`
- Keep it short but descriptive enough to understand the purpose at a glance

## Pull Requests

- Follow the repo's documented merge method. Don't merge at all where the repo reserves merging for maintainers or curators.
- Never squash between long-lived branches (`develop` ↔ `main`); use a merge commit. Squashing there leaves the originals on the source branch without ancestry, so `git log main..develop` fills with phantom commits.
- Squashing a topic branch is a per-repo choice, not a rule. A squash merge done by the hosting platform is a merge method, not a history rewrite.
- When a PR will be squash-merged, its title becomes the commit subject — write it as a valid conventional-commit subject.
- Where the repo lints PR titles, use its allowed types. In the Aries Tools skill packs, PRs into `main` take `feat:` or `fix:` (use `fix:` for an integration PR with no features); PRs into `develop` take any conventional type.

## Releases

Releases follow the repo's documented process (CLAUDE.md, AGENTS.md, DEVELOPMENT.md, or CONTRIBUTING.md). Never hand-edit version fields. Common patterns:

- **release-please (skill packs):** merge `develop` → `main` with a merge commit. Release-please opens a release PR that bumps versions and tags the release when merged, and an automated `main` → `develop` sync follows.
- **`xy deploy` (trunk library repos, as in the toolchain's CONTRIBUTING.md):** Only when the repository owner directs a release: `pnpm xy deploy <level>` bumps and builds; commit the bumps if it left them uncommitted and create an annotated `vX.Y.Z` tag; `pnpm xy publish`; then push commits and tags. `xy deploy` alone neither tags nor publishes. See [xy-toolchain › Releasing](../xy-toolchain/commands.md#releasing-owner-directed).
- **Other Gitflow repos:** merge as the repo instructs. There is no `release/*` branch step.
