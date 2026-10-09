---
name: xy-product-plan
description: Product planning from idea to buildable plan — refining a product idea in discussion, then writing the paper series in order — White Paper (why and what), Yellow Paper (how), Green Paper (business case and monetization), optional Red Paper (legal, regulatory, competitive, funding, infrastructure, operational and existential risk) and optional Light Paper (short public summary) — then docs/ROADMAP.md with a clear MVP line and one PRD per major version (MVP_PRD.md, V2_PRD.md) holding scope, implementation plan, deployment target and acceptance criteria. Covers what each document contains, cross-document version pins, amendments and how a change cascades downstream. Use when starting a new product or product repository, writing, reviewing or amending any of these papers, drawing or moving the MVP line, or writing a PRD.
metadata:
  version: 0.1.8 # x-release-please-version
---

# Product Planning

**Authority.** This skill is maintained only in [`ariestools/ariestools-skills`](https://github.com/ariestools/ariestools-skills); edit there, not in installed copies.

**Skill identity.** When you present a plan, an acknowledgement, or a completion summary, state which skills informed it as `xy-product-plan v<version>`, and list each other active skill from this pack the same way. Read the version from this file's `metadata.version`, never from an example.

This skill describes how a product goes from an idea to a plan that can be built, as a series of documents where each is derived from the ones before it. Together they are the product's plan of record. An agent from any AI system, or a person, arriving with no chat history reads them to learn what the product is and why, how it works, how it pays for itself, what could stop it, what ships first, and where the next contribution goes.

**Read the repository's own `AGENTS.md` first.** It is authoritative for that repository. In a repository that already has papers under other names or in other places, follow what it does and do not reorganize it mid-task.

**The rule this exists to enforce:** every document names the versions of the documents it was derived from, and a change flows downstream only after it has been made upstream. A downstream document never contradicts its source, not even temporarily.

## The sequence

| Stage | Produces | Gate before the next stage |
|---|---|---|
| 1. Discovery | Settled answers in the conversation; no repository yet | The owner agrees the summary states the product |
| 2. Repository | The scaffolded monorepo with `AGENTS.md`, `papers/` and `docs/` | Scaffold builds and lints clean |
| 3. White Paper | `papers/<PRODUCT>_WHITE_PAPER.md`: why and what | Owner accepts thesis, scope, non-goals and success criteria |
| 4. Yellow Paper | `papers/<PRODUCT>_YELLOW_PAPER.md`: how | Every White commitment has a mechanism or an explicit deferral |
| 5. Green Paper | `papers/<PRODUCT>_GREEN_PAPER.md`: business case and monetization | The business inherits every White and Yellow constraint without contradiction |
| 6. Red Paper (optional) | `papers/<PRODUCT>_RED_PAPER.md`: non-technical risk | Every high risk has an owner and a mitigation, or is accepted by the owner |
| 7. Light Paper (optional) | `papers/<PRODUCT>_LIGHT_PAPER.md` and its PDF | Every statement traces to a paper |
| 8. Roadmap | `docs/ROADMAP.md` with the MVP line | Owner agrees what is above the line |
| 9. PRD | `docs/plans/MVP_PRD.md` | Scope, deployment target and observable acceptance criteria are settled |

Product code starts from the active PRD. Each later major version gets its own PRD (`V2_PRD.md`, `V3_PRD.md`), written when the previous version nears its gate rather than up front.

**Discussion happens at every stage, not only the first.** Writing a later document routinely exposes a flaw in an earlier one: the Yellow Paper finds a White commitment that cannot be built, or the Green Paper finds a business that a Yellow mechanism forecloses. Stop, raise it with the owner, amend upstream first, then carry the change down. [The change cascade](papers.md#the-change-cascade) gives the procedure.

## The cost of a change

The papers are not equally easy to change. The higher a document sits in the series, the higher the bar for amending it and the more downstream work an amendment creates.

| Document | Bar for a change |
|---|---|
| White | Highest. The owner decides, explicitly, after discussion. Every downstream document must be re-checked. Rare |
| Yellow | High, but the paper amended most often: the mechanism meets reality. Must stay within the White Paper; a change that needs the White Paper to move is a White change first |
| Green | Moderate. Market learning moves it, within the White and Yellow constraints |
| Red | Lowest of the papers. Risks are added, re-rated and retired as they change |
| Light | None of its own. Regenerate it when a source changes the public story |
| Roadmap | Living. Edited in place as milestones close and the plan moves |
| PRD | Edited while active, with the owner's agreement for any scope change. Frozen once its version ships |

## Where each document lives

```text
papers/
  README.md                    optional index of the series
  <PRODUCT>_WHITE_PAPER.md     why and what
  <PRODUCT>_YELLOW_PAPER.md    how
  <PRODUCT>_GREEN_PAPER.md     business case and monetization
  <PRODUCT>_RED_PAPER.md       optional: legal, regulatory, competitive, funding, infrastructure, operational, existential risk
  <PRODUCT>_LIGHT_PAPER.md     optional: short public summary
  <PRODUCT>_LIGHT_PAPER.pdf    the only PDF under papers/, generated from the Markdown
docs/
  ROADMAP.md                   living roadmap with the MVP line
  plans/MVP_PRD.md             the active PRD; later V2_PRD.md, V3_PRD.md
  decisions/ evidence/ …       everything else, by lifecycle
```

`<PRODUCT>` is the product name in upper snake case (`ACME_LEDGER`), the same for every paper in the repository. Everything that is not part of the plan of record (decision records, evidence, runbooks, notes for the next contributor) goes under `docs/` by lifecycle. The [xy-agent skill](../xy-agent/structure.md) defines those tiers and the front matter they carry.

## Keeping the effort readable

Contributors arrive from different AI systems and from people, with no shared history. The documents must say where the effort stands and what comes next, without anyone having to ask.

- **Reading order for a cold start:** `AGENTS.md`, then `docs/ROADMAP.md` (which milestone is active and what is done, with evidence), then the active PRD (scope, acceptance criteria and its next action), then the papers as the task needs them.
- **One place says what is next:** the active PRD's next action. Keep it current. The roadmap says which milestone is active; neither restates the other.
- **Leave state behind when you stop mid-effort.** Update the PRD's next action and the milestone states. Record anything in flight as a handoff under `docs/`, so the next contributor does not reconstruct it from commits.
- **Nothing lives only in chat.** A decision made in conversation becomes a paper amendment or a decision record before the session ends.

## References

### [Discovery and repository setup](discovery.md)

Read when an owner brings a product idea, before any repository exists, and when creating the repository. Covers how to run the refinement conversation, the questions that must be settled before a White Paper can be written, recording rejected alternatives, and what the new repository needs before the first paper lands.

### [Paper conventions](papers.md)

Read before writing or amending any paper. Covers file names, front matter and the visible header block, version pins (`Derived from:`), version bumps and the Amendments section, the change cascade, and the writing rules every paper shares.

### [White Paper](white-paper.md)

Read when writing or amending the White Paper. Covers its purpose, the section outline (the strongest objection, problem, thesis, model, commitments, scope and non-goals, success criteria, the hand-off list), what it must never contain, and its ratification gate.

### [Yellow Paper](yellow-paper.md)

Read when writing or amending the Yellow Paper. Covers requirement language, the reviewed baseline, the mechanism sections, the security analysis that owns concrete technical threats, the conformance checklist with stable ids, and the implementation sequence the roadmap derives from.

### [Green Paper](green-paper.md)

Read when writing or amending the Green Paper. Covers evidence labels for every figure, inherited constraints, segments and wedge, the free/paid/prohibited boundary, revenue, unit economics, go-to-market, metrics, stage gates and kill criteria.

### [Red Paper](red-paper.md)

Read when deciding whether a product needs a Red Paper, when writing or amending one, or when sorting a risk between the Yellow and Red papers. Covers the boundary test, the risk register with stable ids, the risk categories, counsel review, the wind-down plan, and what must not go in a public repository.

### [Light Paper](light-paper.md)

Read when writing or regenerating the Light Paper or its PDF. Covers audience, length, outline, the no-new-claims rule, and keeping the PDF in step with the Markdown.

### [Roadmap](roadmap.md)

Read when writing or updating `docs/ROADMAP.md`, drawing or moving the MVP line, or closing a milestone. Covers the north star, the evidence ladder, milestone format with exit evidence, the paper-ratification milestone, the MVP line and later versions, and parked items.

### [PRDs](prd.md)

Read when writing, amending or closing a PRD (`MVP_PRD.md`, `V2_PRD.md`, …). Covers what a PRD combines, when to write the next one, scope cited to Yellow conformance ids, the cut line, the deployment target, implementation sections, the `## Acceptance criteria` gate, verification and stop conditions, and closing a PRD when its version ships.

## Related skills

These are navigation links, not dependencies; each skill installs separately.

- **[xy-agent](../xy-agent/SKILL.md)**: where documents live and how they age. Front matter, the state vocabulary, `docs/` lifecycle tiers, decision and evidence records, archiving, and `xy agent lint`. Install: `npx skills add ariestools/ariestools-skills --skill xy-agent`.
- **[xy-toolchain](../xy-toolchain/SKILL.md)**: the tools that support this process in an `@ariestools/toolchain` repository. [Plan tooling](../xy-toolchain/plan.md) covers `xy repo init`, the experimental `xyex plan`, `xy agent` and `xyex work` as they apply here. Install: `npx skills add ariestools/ariestools-skills --skill xy-toolchain`.
- **[xy-development](../xy-development/SKILL.md)**: the Definition of Done. A PRD's `## Acceptance criteria` is its [Layer 3](../xy-development/workflow.md#applying-the-definition-of-done). Install: `npx skills add ariestools/ariestools-skills --skill xy-development`.
