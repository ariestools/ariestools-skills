# White Paper: Why and What

The White Paper states the problem, the thesis, the product's model and its commitments, at a level that survives any change of implementation. It is the root of the series. Every other document derives from it, and it is the hardest to change.

It is written from the discovery summary ([Discovery](discovery.md)). Writing it often reopens discovery questions. That is expected: settle them with the owner, and do not paper over them.

## Outline

Sections marked *core* appear in nearly every good White Paper. The rest belong in this one whenever they apply, and leaving one out should be a deliberate choice.

1. **Abstract** (core). The product, the problem and the thesis in one paragraph.
2. **The strongest objection.** The best case against the product, stated fairly, and the narrow, testable claim that answers it. Putting it first sets the standard for the rest of the paper.
3. **Problem** (core). Who has it, what they do today, and why that fails them.
4. **Thesis** (core). The claim the product makes, and why it is possible or necessary now.
5. **Definitions.** The terms the series relies on. Later papers extend this list rather than redefining terms.
6. **The model** (core). The conceptual architecture: the objects, actors and relationships the product is made of, without wire formats or package names.
7. **Substrate and boundary.** What the product builds on, what is new and what is borrowed, and what it can and cannot prove or guarantee.
8. **Principles and commitments** (core). What the product will always do, and what it will never claim. Include what users keep if the company disappears, when that matters to the thesis.
9. **Product experience.** The lifecycle as a user lives it, for user-facing products.
10. **Scope and non-goals** (core). In the first version, deferred, and never in scope. Non-goals stop scope creep and stop later papers quietly expanding the product.
11. **Success and evaluation criteria** (core). Observable tests of whether the thesis holds: what would show the product works, and what would show it does not.
12. **Related work.** Prior art, adjacent products, and sibling products this one must fit with.
13. **The paper series** (core). What the Yellow, Green and (if planned) Red Papers must each specify: the hand-off list later papers are checked against.
14. **Open questions.** Discovery questions still unanswered, each with who decides.
15. **Conclusion.**
16. **Glossary.**
17. **Amendments** ([format](papers.md#versions-and-amendments)).

White Papers typically run about 2,000 to 10,000 words. Length follows the idea, but a White Paper without non-goals or success criteria is not finished, however long it is.

## What it never contains

| Material | Goes in |
|---|---|
| Wire formats, schemas, algorithms, package names, APIs | Yellow Paper |
| Concrete technical threats and their mitigations | Yellow Paper |
| Prices, revenue, costs, market sizes | Green Paper |
| Legal, regulatory, funding, competitive and operational risk analysis | Red Paper, or the Green Paper's risk section when there is no Red Paper |
| Milestones, dates, release plans | `docs/ROADMAP.md`. At most, the White Paper states the order in which capabilities must arrive, and links the roadmap |
| Implementation status | The roadmap, the PRD, and evidence records under `docs/` |

The White Paper's commitments constrain the mechanism; a commitment phrased as a mechanism ("uses a Merkle log") belongs in the Yellow Paper, restated here as the property it provides ("history cannot be rewritten without detection").

## Gate to the Yellow Paper

The owner accepts the abstract, thesis, commitments, scope and non-goals, and success criteria as the basis for the Yellow Paper. Never pin a downstream document to a White version the owner has not read.

Acceptance is not ratification. The paper stays `state: draft` until the roadmap's first milestone ratifies the whole series ([M0](roadmap.md#m0-is-always-ratification)), because writing the later papers usually amends it.
