# Roadmap

`docs/ROADMAP.md` is the living plan from now to the product's north star, with a clear line around the MVP. It is derived from every paper and edited in place for as long as the product is alive: it is never superseded or archived. Detailed scope, implementation and acceptance criteria for a version live in that version's [PRD](prd.md), not here.

## Front matter and header

```markdown
---
kind: plan
state: active
date: "YYYY-MM-DD"
reviewed: "YYYY-MM-DD"
status: "Living roadmap; MVP in progress; derived from White 0.4.1, Yellow 0.6.0, Green 0.2.0, Red 0.1.0"
---

# Acme Ledger Roadmap

- **Reviewed:** YYYY-MM-DD
- **Derived from:** [White](../papers/ACME_LEDGER_WHITE_PAPER.md) 0.4.1, [Yellow](../papers/ACME_LEDGER_YELLOW_PAPER.md) 0.6.0, [Green](../papers/ACME_LEDGER_GREEN_PAPER.md) 0.2.0, [Red](../papers/ACME_LEDGER_RED_PAPER.md) 0.1.0
- **Active PRD:** [MVP PRD](plans/MVP_PRD.md)
```

Update `reviewed` whenever you re-verify the roadmap against the code and the evidence. `xy agent lint` warns on a living document whose `reviewed` date has aged ([staleness](../xy-agent/lifecycle.md#runbooks)).

## Sections

1. **North star.** One paragraph, from the White Paper's thesis, stated as something observable: "A stranger can … without …".
2. **Evidence ladder.** The levels of evidence a milestone can claim.
3. **MVP (v1).** The milestones that make up the MVP, starting with M0.
4. **V2, V3, ….** One short section per later major version.
5. **Parked.** Work deliberately not scheduled.

## The evidence ladder

A roadmap claims progress only at the level of evidence actually shown. Define the ladder once, near the top, and adjust the rungs to the product:

1. **Authored**: the design or contract exists and passes document checks.
2. **Local unit**: behavior passes isolated tests.
3. **Local composed**: real components run together against disposable local state.
4. **Packaged**: packages work as consumers install them.
5. **Test network or staging**: the system runs in a shared non-production environment.
6. **Hosted beta**: deployed, used by real people under a limited audience, and recovery has been exercised.
7. **Production**: security, operations, data governance, recovery and support all pass their gates.

An item carries only the highest rung it has demonstrated, and the claim links the evidence record that shows it. A PRD's deployment target is a rung on this ladder.

## Milestones

```markdown
### M2: Two-device sync

- **Goal:** two devices converge on the same ledger without a server holding keys.
- **Scope:** Yellow §6.3 to §6.5, conformance items C-12 to C-19. Mitigates R-04.
- **Exit evidence:** Local composed. Two-device convergence run recorded in an evidence record.
- **State:** planned
```

- **Every item traces to a paper**: a Yellow section or conformance id, a Green wedge or stage gate, a Red risk id. An item with no paper source either needs a paper amendment first or does not belong on the roadmap.
- **State** is `planned`, `active`, `blocked` (say on what) or `done`. `done` requires the exit evidence to be linked.
- **Order follows the Yellow Paper's implementation sequence.** Milestones are dependency-ordered. Add dates only where the owner commits to them.
- **No task lists.** Tasks belong in the active PRD and in work items.

### M0 is always ratification

The first milestone of every product is the same: **paper ratification and foundation**. Its exit evidence is:

- The owner has reviewed and ratified the White, Yellow and Green Papers (and the Red Paper, when there is one). Their `state` moves from `draft` to `normative`.
- Every pin in the series is current.
- The repository scaffold builds, and its documentation lint passes.
- The MVP PRD is approved.

No product code merges before M0 closes.

## The MVP line

The `## MVP (v1)` section is the line. Everything inside it is the MVP. Everything after it is not, however small.

- **Open the section with its definition of done:** the MVP is done when every MVP milestone has its exit evidence at the MVP's deployment target and the MVP PRD's acceptance criteria pass.
- **Draw the line small.** The MVP is the smallest version that tests the White Paper's thesis with real users at its deployment target and delivers the Green Paper's initial wedge. List the tempting items that are explicitly not in it, so nobody adds them back by accident.
- **Moving the line is the owner's decision.** Record it in the roadmap and as a scope amendment to the MVP PRD. A move that changes what the papers promise for the first version is a paper change first.

## Later versions

Each later major version gets a short section: its goal, the capabilities it adds, and the paper sections they come from. Do not break it into milestones until its PRD is being written. The plan for V2 will change once the MVP meets real users, and detailed milestones written early only create stale text.

## Parked

List work deliberately left unscheduled, each item with its reason and the trigger that would bring it back. Regulatory work waiting on counsel belongs here, citing its Red Paper risk id.
