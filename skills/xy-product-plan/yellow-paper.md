# Yellow Paper: How

The Yellow Paper specifies the mechanism that makes each White Paper commitment true: the system and trust model, the data model, the protocol or state machine, the interfaces, and the security analysis. It is normative. Code conforms to it, and the PRDs cite it.

It is the paper amended most often, because this is where the design meets reality. Every amendment stays inside the White Paper: a change that needs a White commitment to move is a White change first ([The change cascade](papers.md#the-change-cascade)).

**Derived from:** White.

## Outline

Sections marked *core* appear in nearly every good Yellow Paper. Add as many mechanism sections as the product needs; a mechanism-heavy Yellow Paper is usually the longest document in the series.

1. **Abstract** (core).
2. **Scope, status and requirement language** (core). What the paper specifies, what it leaves to other documents, and the requirement keywords. Use RFC 2119 / RFC 8174 language (MUST, SHOULD, MAY) for normative statements, and mark informative passages as informative.
3. **Reviewed baseline.** The inputs the paper was written against, pinned by version or content hash: the White Paper, external specifications, and the libraries or platforms the mechanism depends on.
4. **System and trust model** (core). The actors, what each one is trusted with, and where proof ends and trust begins.
5. **Data model.** Namespaces, schemas, identifiers and their versioning rules.
6. **The mechanism** (core). One section per subsystem: protocol, state machine, algorithms, storage, synchronization, whatever the product is made of.
7. **Interfaces and deployment profiles.** Packages, public APIs, and the environments the system runs in.
8. **Human factors.** The requirements the design must meet for real users, handed forward to the product design.
9. **Scaling and cost model.** Technical cost drivers. The Green Paper inherits these for unit economics.
10. **Security and privacy analysis** (core). Concrete technical threats and the mitigation the code implements for each. Technical threats live here, not in the Red Paper ([the boundary](red-paper.md#the-boundary-with-the-yellow-paper)).
11. **Conformance checklist** (core). Numbered, testable requirements, each with a stable id (`C-01`, `C-02`, …) that is never reused. PRDs and tests cite these ids.
12. **Implementation sequence.** The order in which the mechanism can be built: dependencies, not dates. The roadmap derives its milestones from it.
13. **Open decisions.** Design questions still open, each with its options and who decides. Note decisions closed in each revision.
14. **Glossary delta.** Terms added to the White Paper's glossary.
15. **Amendments** ([format](papers.md#versions-and-amendments)).

## Coverage rule

Every commitment in the White Paper maps to a Yellow mechanism, or to an explicit deferral that names where and when it will be specified. Keep the mapping checkable: cite the White section from the Yellow section that satisfies it, and list deferrals in one place.

## What it never contains

- Business rationale, pricing or market claims. Those belong in the Green Paper. Where a mechanism exists for a business reason, cite the Green Paper rather than arguing the case here.
- Legal, regulatory, funding or operational risk. Those belong in the Red Paper.
- Implementation status. The conformance checklist says what must hold, and evidence records under `docs/` say what has been shown to hold.

## Gate to the Green Paper

The owner accepts the Yellow Paper as the basis for the business case. Every White commitment is covered or explicitly deferred, the conformance checklist exists, and the open decisions that the business case depends on are closed.
