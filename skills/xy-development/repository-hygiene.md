# Branch, worktree and stash hygiene

Use this procedure for a repository audit or an authorized cleanup. Preserve useful unmerged work and provide a concrete recommendation for anything left behind. This supplements [Git workflow](git.md); it does not change the repository's branch or release policy.

## When to suggest it

At a natural stopping point after merges/releases, or when normal orientation reveals accumulated topic branches, extra worktrees or old stashes, consider suggesting a read-only audit. Use a roughly monthly cadence unless repository/user instructions specify another interval. Tie the suggestion to observed evidence: "There are several merged topic branches and two stashes; a repository hygiene audit would be useful."

Suggest at most once per repository in a session. Honor a recent decline or an audit receipt from the last 30 days unless new evidence changes the situation. When no previous date is known, say that; do not invent a last-run date or repeatedly perform a full scan to decide whether to suggest one. This is conversational follow-through, not a completion gate, a scheduled job, or standing deletion authority. Continue the user's active work.

An audit request authorizes inspection. An explicit audit-and-cleanup request authorizes confirmed redundant-item removal within its stated scope; do not ask again for that same permission. Preserve ambiguous work and finish the safe subset. Do not infer cleanup, remote deletion, a merge, a publish, or deployment authorization from a suggestion, a read-only audit, or a branch's age.

## Inventory and freshness

Read repository instructions, hosting configuration and branch/release policy first. Inspect the checkout you were given; do not create another worktree to perform this maintenance. Identify the common Git directory so worktrees share one inventory and recovery location. Check attached/managed worktrees through the host's tools where available.

An optional dependency-free helper requires Node >=24 and Git with `--no-lazy-fetch` support. Resolve `xy_development_skill` to this installed skill directory and `repository_path` to the checkout being audited:

```sh
node "$xy_development_skill/scripts/repository-hygiene.mjs" audit --repo "$repository_path" --base origin/main --base origin/beta-vercel
```

Choose bases from the actual repository; the names above are examples. `audit` prints JSON to stdout and performs no fetch or writes. It lists refs/upstreams in the current checkout plus separately scoped refs from every worktree's Git metadata, explicit-base ancestry, every registered worktree (including detached, locked, missing/prunable and dirty ones), ignored path names, and every stash's full SHA and parents. It does not print file contents. It reports incomplete history and leaves ancestry unclassified there. Git's [lazy-fetch control](https://git-scm.com/docs/git#Documentation/git.txt---no-lazy-fetch) prevents partial-clone inspection from fetching missing objects; unsupported Git fails closed. Object inspection uses literal history with replacement objects disabled. File inspection is skipped with an uncertainty marker when clean/process filters could execute code or submodules need separate inspection. Ancestry evidence is never a deletion list.

For an authoritative cleanup, also:

- Fetch the relevant remotes with pruning, then read live remote heads and open PRs/MRs. Record remote names, exact tips, authoritative merge targets and hosting rules. A disappeared upstream or closed PR alone is not evidence that work was merged. If offline/authentication prevents verification, label the result local-only and preserve items whose disposition depends on unavailable evidence.
- Inventory local and remote topics separately, plus tags/notes/other refs that need preservation. Identify long-lived integration, release, maintenance/version, deployment, bot-release and rollback branches from policy and live usage. Keep them by default, even when old or ahead/behind `main`. Never assume all repositories deploy from `main` or that all branches marked "protected" have identical rules.
- Inspect each worktree's staged/unstaged changes, untracked files, ignored files and in-progress Git operations. Check active tasks, sessions and processes before calling it unused. A clean status does not cover ignored `.env` files, wallet state, local data or other private configuration. Inspect file names first; keep secrets out of logs, commits and shared artifacts.
- Inspect every stash, including base-to-index, index-to-worktree and any third parent containing untracked/ignored files. A patch export alone misses third-parent content. Review meaningful code/configuration against current targets, not just stash messages or age. Do not apply or pop a stash into a user's checkout to inspect it.

Treat shallow/partial history, missing objects, unreadable worktrees, missing PR data and ambiguous branch roles as uncertainty. Preserve affected items rather than forcing a conclusion.

## Classify with evidence

Record a disposition, full SHA, evidence and recommendation for every topic, extra worktree and stash:

| Disposition | Evidence and action |
| --- | --- |
| Merged/redundant | Exact tip is an ancestor of an explicitly retained target, including an environment-specific release branch. Check for commits added after the PR merged. Eligible for authorized cleanup after recovery verification. |
| Squash/rebase equivalent | No ancestry proof. Use merge-base diffs, patch comparison such as `git cherry`, the merged PR and current files. `git cherry` omits merge commits: inspect unique merges and their resolutions too. A clean remerge diff plus retained parents can establish an obsolete integration merge. Require positive evidence for the whole topic. |
| Superseded | Current code implements the useful behavior through another change, or the owner explicitly abandoned it. Explain the replacement and inspect meaningful differences. Formatting-only or retired dependency work can qualify; age alone cannot. |
| Useful unmerged | Keep the branch/stash/worktree. Recommend a narrow PR/cherry-pick, extracting specific files, or rebasing via a separately authorized history change. State conflicts, obsolete dependencies or missing tests. Do not merge old whole trees just to eliminate unmatched commit counts. |
| Uncertain/active | Keep it. Name the missing evidence or active use and what would resolve it. |

For stashes, separate genuinely useful behavior from formatting, generated files and outdated pins. Preserve useful hunks without quietly restoring retired code. If an existing maintained branch contains the work, identify the exact ref/SHA. Do not count a backup bundle as evidence that unmerged work is obsolete.

## Create and verify recovery before removal

Keep the reviewed inventory and proposed removals in a private receipt, with original ref names, SHAs, upstream configuration, worktree paths/host identities and stash parents. Store evidence under the common Git directory's `cleanup-backups/` or an equivalent approved private location, outside tracked content. Do not create archive branches/tags that simply move the clutter.

```sh
node "$xy_development_skill/scripts/repository-hygiene.mjs" backup --repo "$repository_path" --base origin/main
```

The helper writes a private `audit.json` and standalone `recovery.bundle`. It preserves current shared refs, each worktree's private refs and HEAD (including missing checkouts whose metadata remains), and every stash reflog entry. `refScopes` and `recoveryRefs` distinguish worktree-private namespaces so identical names cannot overwrite one another. It creates recovery refs only in disposable bare repositories with the source's SHA-1/SHA-256 object format, verifies the bundle with no prerequisites in a separate repository, fetches every saved ref, checks exact SHAs and runs `git fsck`. It aborts if refs, stash order or worktree metadata change during capture. A failed/unverified receipt is not a cleanup gate passed. Complete history is required for its standalone backup.

**This bundle contains committed objects only.** It does not save unstashed index contents, working files, untracked/ignored files, Git configuration files, active operation metadata, or arbitrary old reflog-only commits. Protect any of those that matter separately, preserve their paths/permissions and verify their restoration before removing a worktree. Keep a worktree if that cannot be done safely. A sensitive stash may make the bundle sensitive; directory/file permissions are restricted on supporting platforms, and it must not be uploaded or committed casually.

Review the receipt against the classified inventory. Record any extra preservation and the exact proposed actions there. Recheck it after interruptions or concurrent work; do not assume a previously started action completed.

## Apply only the authorized safe subset

- Keep the current checkout and active worktrees. If an obsolete checked-out topic must be removed, first verify a clean tree and no active Git operation, switch to an appropriate retained branch and fast-forward only if justified. Preserve detached work before switching. Never reset, clean or overwrite dirty work to make cleanup possible.
- For host-managed worktrees, use the host archive/remove lifecycle and retain its recovery identity. For ordinary worktrees, use `git worktree remove` only after branch/HEAD and file preservation checks and activity checks pass. Do not force a dirty, locked, active or ambiguous worktree away. Inspect prune's dry run before pruning missing registrations; never use broad directory deletion as a shortcut.
- Re-read each local ref immediately before deletion and compare its full SHA with the reviewed receipt. Use `git branch -d` for ancestry-merged topics. A targeted `-D` is appropriate only for a backed-up topic positively proven patch-equivalent, superseded, or contained in another retained release branch. If a concurrent change is possible, use an expected-old-SHA ref transaction and remove only that branch's associated configuration. Never bulk-delete by name pattern, age or a bare `--merged` listing.
- Re-read live remote tips and PR state before remote deletion. Use explicit refspecs and expected-tip leases for the reviewed topic deletions, atomically where supported. An expected-tip lease on an authorized delete refspec is a concurrency guard; it never permits force-updating retained history. On a lease mismatch, reject and re-audit. On hosting-rule/approval rejection, preserve the ref and report it; do not weaken protections or fall back to an unguarded deletion.
- For each obsolete stash, resolve its current selector from the saved full SHA immediately before `git stash drop`. Stash indexes move as entries are dropped. Skip ambiguous duplicate-SHA entries until disambiguated. Drop selected entries individually; never `stash clear`.
- Do not run `git gc`, expire reflogs, force-prune objects or delete the recovery backup as part of routine hygiene. Backup retention/deletion is a separate user or repository policy decision.

## Verify and report

Check live remote heads, local refs/upstreams, worktree registrations, stashes and working-tree status again. Compare exact before/after tips: retained refs and working files must remain unchanged except a specifically documented checkout/fast-forward. Check all authorized removals and all preserved useful/uncertain items. Record completed, failed and skipped actions plus the completion time in the private receipt. A partial cleanup must be reported as partial.

Report removal counts, current checkout, the useful/uncertain items and recommended next actions, and recovery/receipt paths. Ref-only maintenance needs these Git/filesystem checks, not an application rebuild. If code was extracted/restored/changed, apply the normal scoped build/test requirements. Confirm separately whether any source commit, push, merge, publication or deployment was performed; deleting a topic branch does not establish release health.

## Recovery

Read `recoveryRefs` in the verified receipt. Restore into fresh names or a disposable repository, preserving current work. A new restore repository must use the receipt's `objectFormat` (`git init --object-format=sha1` or `sha256` as appropriate). For example:

```sh
git bundle list-heads "$bundle_path"
git fetch "$bundle_path" refs/recovery/source/heads/feature/example:refs/heads/codex/recovered-example
git fetch "$bundle_path" refs/recovery/worktrees/1:refs/heads/codex/recovered-detached
git fetch "$bundle_path" refs/recovery/stashes/0
git stash store -m "Recovered hygiene stash" FETCH_HEAD
```

Choose refs from that receipt; examples may not exist in every bundle. Storing a stash restores the stash entry, not the user's working files. Worktree files and configuration saved separately use their own verified recovery procedure. Branch tracking configuration may need restoring from the receipt as well.
