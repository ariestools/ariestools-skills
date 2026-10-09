# Paper Conventions

These rules apply to every paper in the series. The per-paper files cover what each one contains.

## File names

Name each paper `papers/<PRODUCT>_<COLOR>_PAPER.md`: `ACME_LEDGER_WHITE_PAPER.md`, `ACME_LEDGER_YELLOW_PAPER.md`, and so on. Use one prefix, the product name in upper snake case, for every paper in the repository. The prefix exists because papers travel: they are exported as PDFs, attached to messages, and cited from sibling products' papers, where a bare `WHITE_PAPER.md` names nothing.

The only other files under `papers/` are an optional `README.md` that indexes the series and the Light Paper's PDF. Drafts, notes and superseded material belong under `docs/`.

In an existing repository that already names its papers differently, keep its names. Renaming papers breaks every link to them, in this repository and in others.

## Front matter and header

Every paper opens with front matter, then repeats the essentials in a visible header block so a reader without tooling sees them:

```markdown
---
kind: paper
state: draft
version: "0.3.0"
date: "YYYY-MM-DD"
status: "Working draft; derived from White 0.4.1"
---

# Acme Ledger Yellow Paper

## <Subtitle: the mechanism in a phrase>

- **Version:** 0.3.0
- **Date:** YYYY-MM-DD
- **Status:** Working draft
- **Derived from:** [White Paper](ACME_LEDGER_WHITE_PAPER.md) 0.4.1
- **Companions:** [Green Paper](ACME_LEDGER_GREEN_PAPER.md) (business), [Red Paper](ACME_LEDGER_RED_PAPER.md) (risk)
```

- `state` is `draft` until the owner ratifies the paper, then `normative`. The roadmap's first milestone is where ratification normally happens ([Roadmap](roadmap.md#m0-is-always-ratification)).
- `version`, `date` and `status` are required on papers. The [xy-agent front-matter schema](../xy-agent/lifecycle.md#front-matter-schema) defines every field and keeps each on one line.
- Keep the front matter and the header block consistent. When they disagree, neither can be trusted.

## Version pins

Every derived document carries a **Derived from** line naming the exact version of each upstream document it was written or last re-checked against:

| Document | Pins |
|---|---|
| White Paper | Nothing; it is the root |
| Yellow Paper | White |
| Green Paper | White, Yellow |
| Red Paper | White, Yellow, Green |
| Light Paper | Every paper it summarizes |
| `docs/ROADMAP.md` | Every paper |
| Each PRD | Every paper, and the roadmap milestones it covers |

Write the pin in the header block as linked names with versions, as above, and repeat it in `status` as plain text (`derived from White 0.4.1, Yellow 0.6.0`). For the roadmap and PRDs, which live under `docs/`, the `status` string appears in the generated `docs/README.md`, so the pins are visible in the index.

A pin is **stale** when the upstream document has a newer version. A stale pin is not an error in itself. It means "not yet re-checked", and it is the signal that drives [the change cascade](#the-change-cascade). Check pins by hand whenever you amend or review a paper: tooling does not compare them ([Plan tooling](../xy-toolchain/plan.md) says what it does check). In a review, list every stale pin as a finding.

## Versions and amendments

A paper changes by amendment, never by silent edit. Every change to what a paper says bumps its version:

| Bump | When |
|---|---|
| Patch (`0.4.1` → `0.4.2`) | A clarification or correction that changes no commitment, or re-pinning to a newer upstream with no other change |
| Minor (`0.4.2` → `0.5.0`) | A commitment, requirement, figure or section is added, changed or removed |
| Major (`0.5.0` → `1.0.0`) | The thesis, scope or a principle changes, or a change breaks what downstream documents relied on |

Pure formatting and typo fixes need no bump.

Each paper ends with an `## Amendments` section, newest first. One entry per version: the version, the date, what changed and in which sections, and why, linking the decision record when there is one:

```markdown
## Amendments

- **0.5.0 (YYYY-MM-DD).** §6 replaces the single-writer log with per-device logs and §11 adds conformance items C-31 to C-34, after [ACME-D0007](../docs/decisions/ACME-D0007-per-device-logs.md). Re-pinned to White 0.4.1.
- **0.4.2 (YYYY-MM-DD).** §3 clarifies "account"; no commitment changed.
```

The Amendments section is what makes a stale pin cheap to resolve: a downstream author reads the entries between the pinned version and the current one, rather than diffing the paper.

When a change is large or still under discussion, draft it as its own document under `docs/plans/` and adopt it into the paper only once the owner settles it. Record the decision behind any minor or major amendment as a decision record.

## The change cascade

The series is ordered: White → Yellow → Green → Red → Light, then the roadmap, then the active PRD. A change moves down that order and never skips a step.

When work on any document shows that an upstream document has to change:

1. **Stop.** Name the upstream change, the reason, and which documents it touches. Do not work around it in the downstream document.
2. **Discuss it with the owner.** The higher the paper, the higher the bar ([The cost of a change](SKILL.md#the-cost-of-a-change)). A White change needs the owner's explicit decision.
3. **Amend upstream first.** Bump the version and write the Amendments entry.
4. **Walk downstream in order.** For each document that pins the old version: read the new Amendments entries, amend it if it is affected, then re-pin it, with a patch bump if nothing else changed.
5. **Resume the original work.**

A downstream document never contradicts its upstream, not even "until the paper catches up". If the cascade cannot be finished now, leave the upstream amendment unmade and record the question as open in both documents.

## Writing rules for every paper

- **Write for a cold reader.** Assume no access to the conversation that produced the paper. Define terms where they first appear; the White Paper owns the glossary, and later papers add only a glossary delta.
- **Each topic has one owner.** Link to the paper that owns a topic instead of restating it. Each paper closes with what it defers to the others.
- **Papers state what must be true, not what is done.** Implementation status, dates and progress belong in the roadmap, the PRD and evidence records under `docs/`. A paper that says "implemented" goes stale on the next commit.
- **Label evidence.** Distinguish what is specified, what has been demonstrated (and where), and what has been measured. Mark planning numbers as hypotheses. Being binding and being proven are different axes; never let one stand for the other.
- **Number sections**, so that amendments, pins, PRDs and decision records can cite `§6.2`.
- **Use stable ids for anything a later document cites**: conformance items in the Yellow Paper (`C-07`), risks in the Red Paper (`R-12`). Never reuse an id; mark a withdrawn item as withdrawn instead of deleting it.
