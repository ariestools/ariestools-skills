# Discovery and Repository Setup

Before a repository exists, the product is a conversation. Its job is to settle enough of the idea that the White Paper can be written without inventing anything. The owner owns the idea. The agent sharpens it: restates it, finds its weakest point, asks about that, offers alternatives with their trade-offs, and keeps track of what is settled.

## Running the conversation

- **One cluster of questions at a time.** Work through the table below in roughly its order, two or three related questions per turn. A wall of thirty questions gets thirty shallow answers.
- **Lead with the strongest objection.** State, fairly and in its strongest form, the reason a skeptic would give for the product not to exist, and ask the owner to answer it. An idea that cannot survive its strongest objection is cheaper to drop now than after three papers.
- **Separate decisions from proposals.** Only what the owner decided becomes a commitment in the White Paper. What the agent proposed and the owner did not adopt is either dropped or carried as an open question. Never let an agent suggestion harden into a commitment because nobody objected.
- **Keep a running summary.** Every few turns, restate the state of the conversation in three lists: settled, open, dropped. The final summary is the outline the White Paper is written from.
- **Do not design the mechanism yet.** Discovery decides what must be true, not how. Where a mechanism question decides whether the idea is feasible at all, settle feasibility and leave the design to the Yellow Paper.
- **Name the money early, briefly.** One line on who pays for what is enough to check that the White Paper's commitments do not foreclose every business. The Green Paper does the rest.

## What must be settled

| Question | Feeds |
|---|---|
| The product's name and a one-sentence statement of the idea | Title, abstract, `<PRODUCT>` prefix |
| Who has the problem, what they do about it today, and why that fails them | Problem |
| The claim the product makes, and why it is possible or necessary now | Thesis |
| The strongest objection, and the owner's answer to it | The strongest objection |
| What the product builds on, what is new, and what it can and cannot prove or guarantee | Model, substrate and boundary |
| The commitments that hold no matter what: what it will always do and will never claim, including what users keep if the company disappears | Principles and commitments |
| What is in the first version, what is deferred, and what is never in scope | Scope and non-goals |
| How anyone would know it works: observable criteria | Success criteria |
| Hard constraints later papers inherit: platform, privacy, sovereignty, regulatory, budget | Constraints sections of every later paper |
| Adjacent products, prior art, and sibling products it must fit with | Related work |
| Who pays, for what, in one line | A check only; detail goes in the Green Paper |

An unanswered question is allowed. It goes into the White Paper's open questions rather than being guessed.

**Exit gate:** the owner reads the final summary and agrees it states the product. Then create the repository.

## Recording rejected alternatives

Discovery produces decisions the White Paper will not show: the alternatives considered and why they lost. Those are what stop a later agent from proposing them again. Once the repository exists, record each significant one as a decision record under `docs/decisions/` (context, decision, consequences, revisit triggers), following the [xy-agent decision records](../xy-agent/lifecycle.md#decision-records). Do not commit chat transcripts; the White Paper and the decision records are the durable form of the conversation.

## Creating the repository

- **Names.** The repository name is the product name in kebab case (`acme-ledger`). The paper prefix is the same name in upper snake case (`ACME_LEDGER`). Settle both before scaffolding; renaming either later breaks links across the series.
- **Scaffold** the house monorepo pattern. In an `@ariestools/toolchain` workspace, [Plan tooling](../xy-toolchain/plan.md) gives the command, its flags and what it creates. Commit the scaffold on its own, before any paper.
- **Fill in `AGENTS.md`.** Title it with the product name. Give it an authority table that routes each question to its document: what and why to the White Paper, how to the Yellow Paper, the business to the Green Paper, non-technical risk to the Red Paper, and what is next to `docs/ROADMAP.md` and the active PRD. Add each row when its document lands. A link to a file that does not exist yet fails agent lint, and an empty placeholder misstates how far the plan has got.
- **Product code waits for the active PRD.** A throwaway spike that answers a discovery question is research: keep it out of `packages/`, and record what it showed under `docs/`.

The White Paper is the first content commit. [White Paper](white-paper.md) covers it.
