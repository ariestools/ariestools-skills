# PRDs

A PRD covers one major version of the product. In one document it holds the product requirements (the Yellow Paper features this version delivers), the implementation plan (how this version will build them), the deployment target, and the acceptance criteria that prove it shipped. The MVP is version 1.

| File | Covers |
|---|---|
| `docs/plans/MVP_PRD.md` | Version 1, the MVP |
| `docs/plans/V2_PRD.md` | Version 2 |
| `docs/plans/V3_PRD.md` | Version 3, and so on |

PRDs carry no product prefix: they are working plans inside the repository, not documents that travel. A minor version gets no PRD of its own. It is a milestone in its major version's PRD, or an item on the roadmap.

## When to write one

- **MVP PRD:** immediately after the roadmap. Its approval is part of M0 ([M0](roadmap.md#m0-is-always-ratification)).
- **Each later PRD:** when the current version is near its gate, not before. Start from the roadmap's outline for that version, then revise it with what the previous version taught.

Only one PRD is active at a time. The roadmap's header and the authority table in `AGENTS.md` both link to it.

## Front matter and header

```markdown
---
kind: plan
state: active
version: "0.2.0"
date: "YYYY-MM-DD"
status: "MVP PRD, active; target hosted beta; derived from White 0.4.1, Yellow 0.6.0, Green 0.2.0, Red 0.1.0"
---

# Acme Ledger MVP PRD

- **Version:** 0.2.0
- **Product version:** v1 (MVP)
- **Deployment target:** Hosted beta, invite-only
- **Derived from:** [White](../../papers/ACME_LEDGER_WHITE_PAPER.md) 0.4.1, [Yellow](../../papers/ACME_LEDGER_YELLOW_PAPER.md) 0.6.0, [Green](../../papers/ACME_LEDGER_GREEN_PAPER.md) 0.2.0, [Red](../../papers/ACME_LEDGER_RED_PAPER.md) 0.1.0
- **Roadmap milestones:** M0 to M4
```

`state` is `draft` until the owner approves the PRD, then `active`. Give the PRD a version and bump it on each amendment, as for a paper ([Versions and amendments](papers.md#versions-and-amendments)): its scope is a commitment that implementation is measured against.

## Sections

1. **Outcome.** One sentence that is true when this version ships.
2. **Deployment target.** The environment the version must reach (local, a test network or staging, hosted beta, production), who has access to it, and its rung on the roadmap's [evidence ladder](roadmap.md#the-evidence-ladder). Milestones may reach lower rungs first; the PRD closes only at its target, and the acceptance criteria are judged there.
3. **Scope.** The cut line, in three lists:
   - *Required*: each requirement cites its source, a Yellow section or conformance id (`C-12`), and where relevant a Green wedge or a Red risk id.
   - *Explicitly not blocking*: work that may land in this version but does not hold up the gate.
   - *Deferred*: what waits for a later version, and which.
4. **Constraints.** The White commitments and Yellow requirements (MUST) that bind this version's implementation. Paper constraints are build constraints.
5. **Architecture and layout.** The repository and package layout, the runtime architecture and the key interfaces for this version: the detail the Yellow Paper leaves to implementation.
6. **Milestones.** Each one maps to a roadmap milestone id and has a goal, scope, exit evidence and gate.
7. **Testing and verification.** The test strategy, the CI gates, the commands that verify the version, and the evidence records it will produce under `docs/evidence/`.
8. **Risks.** The Yellow threats and Red risks (by id) this version mitigates, and those it knowingly accepts.
9. **Decisions and open questions.** Decisions with their records, and open questions with who decides.
10. **`## Acceptance criteria`.** See below.
11. **Stop conditions.** When to stop building and go back to the owner (below).
12. **Next action.** For the next contributor arriving cold: the single next step. Keep it current while the PRD is active.
13. **Amendments.**

## Acceptance criteria

Use exactly the heading `## Acceptance criteria`. It is what the Definition of Done reads: in the xy-development skill, [Layer 3](../xy-development/workflow.md#applying-the-definition-of-done) gates on the active PRD's acceptance criteria, and [Writing project-specific acceptance criteria](../xy-development/workflow.md#writing-project-specific-acceptance-criteria) gives their shape: positive and negative assertions, each observable from outside the implementation, grouped under `Positive:` and `Negative:`.

State every criterion at the PRD's deployment target. "Two invited users on the hosted beta see the same balance within five seconds" is a criterion. "Sync works" is not. An MVP often needs more than the usual five to ten items. Group them by milestone rather than dropping any.

## Stop conditions

Stop and go back to the owner when:

- A requirement turns out to contradict a paper. Run [the change cascade](papers.md#the-change-cascade) before building further.
- An acceptance criterion cannot be made observable at the deployment target.
- The deployment target is not available, or its environment differs from what the PRD assumes.
- Meeting the gate needs a scope change: anything moving between Required, Explicitly not blocking and Deferred.

## Closing a PRD

When every acceptance criterion passes at the deployment target:

1. Write the evidence record that proves it, naming the commit and the commands run.
2. Mark the version's roadmap milestones `done`, each linking its evidence.
3. Set the PRD's `state` to `retired`, and archive it under `docs/archive/plans/` with a banner that names the release and links the evidence ([Archiving](../xy-agent/lifecycle.md#archiving)). The roadmap's section for that version keeps a link to the archived PRD.
4. Write the next PRD when the product is ready for it. Do not draft it before then.

A shipped PRD is never edited again. A later fix to that version's behavior is new work under the active PRD.

## PRD.md at the repository root

Some planning skills write a single `PRD.md` at the repository root for a quick build, and the Definition of Done reads it there too. A product planned with this skill uses the versioned PRDs under `docs/plans/` and has no root `PRD.md`. When a repository that started with a root `PRD.md` adopts this process, its next major version becomes a versioned PRD. Migrate the root file with the owner's agreement, never mid-task, and never keep both active.
