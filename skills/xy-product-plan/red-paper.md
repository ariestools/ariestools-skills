# Red Paper: Risk

The Red Paper covers everything that could stop the product other than a technical threat the code can defend against: legal, regulatory, competitive, funding, infrastructure and dependency, operational, trust and safety, and existential risk. It is optional. Its change bar is the lowest of the papers: risks are added, re-rated and retired as the world moves.

**Derived from:** White, Yellow, Green.

## When to write one

Write a Red Paper when any of these holds, and ask the owner when none clearly does:

- The product touches a regulated domain: money or value transfer, securities or tokens, gaming or sweepstakes, identity, health, minors, or personal data at scale.
- The product depends on one provider, platform, app store, chain or partner that could cut it off.
- The product needs outside funding, or its survival depends on a funding event.
- The Green Paper's risk section has outgrown a page, or keeps mixing in technical threats.

Without a Red Paper, the Green Paper carries the non-technical risk register in the format below.

## The boundary with the Yellow Paper

One test sorts every risk: **can code, or a conformance test, defend against it?**

- **Yes: a concrete technical threat.** An attacker, a fault, a failure mode the mechanism must survive. It belongs in the Yellow Paper's security analysis, with the mitigation the code implements.
- **No: everything else.** A law, a regulator, a competitor, a funder, a provider's decision, a missing person, a lost court case. It belongs here.

Some risks have both faces. A breach of personal data has technical controls (Yellow) and notification duties and liability (Red). Each paper owns its face and links to the other; neither restates the other's analysis.

## Outline

1. **Abstract and risk appetite.** What kinds of risk the owner accepts, and which are unacceptable at any price.
2. **Method.** The rating scales for likelihood and impact, how residual risk is judged, who owns a risk, and how often the register is reviewed.
3. **The risk register.** The table below. It is the heart of the paper; the category sections explain it.
4. **Category sections**, one for each that applies:
   - *Legal*: intellectual property, licensing, terms of service, liability, contracts.
   - *Regulatory*: by jurisdiction. Licensing, money transmission, securities, gaming, consumer protection, privacy and data protection, tax, export.
   - *Competitive*: incumbents, fast followers, platform owners who could copy or block.
   - *Funding*: runway, dependence on a raise, concentration of funders, token or treasury exposure.
   - *Infrastructure and dependency*: hosting, chains, providers, app stores, critical open-source dependencies, single points of failure outside the code.
   - *Operational*: key people, process, support load, incident response, vendor management.
   - *Trust and safety*: abuse of the product, harmful content, reputational exposure.
   - *Existential*: events that would falsify the thesis or end the company.
5. **Wind-down plan.** What happens to users, their data and their assets if the product or company ends, tied to the White Paper's commitments about what users keep.
6. **Counsel queue.** The open legal and regulatory questions ([Counsel review](#counsel-review)).
7. **Amendments** ([format](papers.md#versions-and-amendments)).

## The risk register

```markdown
| Id | Category | Risk | Likelihood | Impact | Owner | Mitigation | Residual | Status | Revisit when |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | Regulatory | Payouts are classed as money transmission in the US | Medium | High | Owner | Payouts only through a licensed partner; no custody | Low | Mitigated; counsel review required | A partner changes terms, or payouts open in a new state |
```

- **Ids are stable.** Never renumber or reuse one. A retired risk keeps its row with status `Retired` and the reason.
- **Every high risk has an owner and a mitigation**, or an explicit acceptance by the owner recorded in the Status column.
- **Revisit when** is an observable trigger, not a date alone. It is what tells a later reader whether a rating is still current.
- PRDs cite risk ids for the risks a version mitigates or accepts, and the roadmap cites them for parked items.

## Counsel review

An agent can find legal and regulatory questions and describe the risk. It cannot answer them, and the Red Paper must not read as if it had. Mark every legal or regulatory item with its review state: `counsel review required`, or `counsel reviewed` with when and by whom. Until it is reviewed, the item's rating is a planning hypothesis.

## Public repositories

A Red Paper in a public repository is public. Before writing one, confirm with the owner whether the repository is public and what may be said there.

- Keep privileged material out of the repository. Committing a lawyer's advice to a public repository can waive privilege.
- Keep exact funding figures, partner terms and live negotiations out unless the owner says otherwise.
- When the detail must stay private, keep the register's ids, categories and statuses in the public paper, and put the sensitive analysis where the owner keeps confidential material, referenced by id.

The Light Paper never summarizes the register.

## Gate to what follows

The owner accepts the register: every high risk is owned and mitigated or accepted, and every legal or regulatory item has a review state. The Red Paper does not block the roadmap. Unreviewed counsel items become parked or gating items on it.
