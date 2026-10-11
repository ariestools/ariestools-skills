# Architecture Principles

## Design objective

Build loose communities of participants that coalesce into useful work through explicit local behavior and shared protocol rules. Nature supplies the inspiration: individuals can contribute to a larger functioning system without a manager assigning every action. Treat the analogy as motivation, not as a proof of correctness or a biological claim.

Translate "increased order" into stated legitimate states, invariants, and recovery goals. Local actions can race, temporarily diverge, or consume resources; explain why their composition preserves the required safety properties and converges under the stated assumptions. Identify the availability, communication, fairness, and fault conditions under which progress is expected. A claim of self-stabilization requires evidence for the specified fault model; distributing workers alone establishes no such guarantee.

## Protocol-defined authority

Put work eligibility, authorization, valid transitions, result acceptance, conflict resolution, and expiry behavior in explicit rules. Separate the identity of a logical operation from the worker or process attempting it. Make accepted outcomes checkable by another conforming participant against the authoritative evidence and stated trust assumptions.

The evidence may be a durable database, an append-only log, signed records, or another specified substrate. Name its actual guarantees and failure dependencies. Durable storage alone does not establish independent verification, consensus, or decentralization. If one service controls acceptance or access to evidence, expose that concentration and its recovery requirements.

## Independent work discovery

Eligible workers discover outstanding obligations from evidence and protocol rules. Specify how they enumerate due work, recognize completed operations, and decide what they may attempt. Preserve obligations across the loss of a process and its in-memory scheduler state.

One possible worker pass is: reconcile authoritative evidence; derive eligible unmet operations; attempt a bounded action; reconcile its accepted outcome; retain the recovery state the effect requires; then wait or yield. Choose the ordering and persistence points for the actual effect contract. Notifications and scheduling can accelerate these passes without owning the only record of progress.

## Replaceable participants

A new eligible worker should reconstruct sufficient state to continue without consulting its predecessor. State which cursors, intents, prepared effects, receipts, or other records must survive a crash. Persist the information required to recover an ambiguous effect before the irreversible boundary, when the effect contract needs it.

Expose limits to replacement: private secrets, signer continuity, authorization grants, unavailable history, and exclusive physical resources. Resolve each through an explicit custody or recovery mechanism, or specify the missed, expired, cancelled, or failed outcome. Restarting after a deadline cannot make the original deadline satisfied.

## Safe concurrent attempts

Design correctness for several workers attempting the same logical operation, including retries and stale participants. Distinguish duplicate computation, duplicate proposals, and duplicate consequential effects. Stable operation identity and conflict rules should let participants recognize already accepted work.

Choose protection at the actual effect boundary: provider-supported idempotency, atomic admission, unique constraints, conditional writes, fencing, escrow, or a scoped consensus mechanism where appropriate. Explain what happens if a worker crashes after an external effect but before recording success. Deduplication in a later reducer cannot undo an already duplicated external payment or message.

Claims, partitioning, and leases can reduce redundant effort. Where they protect correctness, describe how their authority is enforced at the effect boundary and how expired or stale holders are rejected. Expiration alone does not stop a disconnected worker. Do not promise exactly-once execution or effects beyond the guarantees actually provided.

## Whispers and reconciliation

Gossip, peer announcements, events, and wake hints accelerate discovery. Identify which records are authoritative and which messages are hints. When hints can be lost, delayed, duplicated, reordered, or forged, specify validation and a recovery path such as periodic enumeration, replay, polling, or anti-entropy.

Do not make delivery of a single wake the only path to discovering a durable obligation. Select the communication mechanism according to topology, privacy, cost, and existing contracts; this preference does not require gossip everywhere.

## Recovery as ordinary work

Define joining, leaving, restarting, catching up, and reconciling divergent observations as normal participant behavior. Preserve safety when progress pauses, and state the conditions that allow it to resume. Bound the affected scope when history or dependencies are unavailable; report unresolved work truthfully.

Repair, verification, and maintenance roles can themselves form swarms. Apply the same eligibility, evidence, concurrency, and replacement rules to them. Check whether an indispensable recovery manager has become the only participant able to discover or repair unmet obligations.

## Bounded activity

Budget work per pass, concurrent effects, communication, retries, and verification. Use appropriate backoff, jitter, admission limits, and checkpoints so many participants discovering the same obligation do not create an unbounded storm. Define behavior under overload and resource exhaustion.

Name the resource assumptions behind liveness: at least one eligible participant, usable authority and credentials, accessible evidence, and the effect resources the operation requires. Autonomous work still requires capacity and authorization. Configuration, deployment, and protocol upgrades remain explicit operational responsibilities.

## Supervision and concentrated dependencies

Local startup, shutdown, cancellation, and resource cleanup are compatible with autonomous application work. Judge a supervisor by its responsibility and failure consequences, rather than its class name. A service called a worker can still own all work decisions; a local orchestrator can simply host independent participants.

Dashboards and observers should help explain and diagnose progress without holding the only recoverable business state. Assess concentrated dependencies across discovery, identity, authority, storage, signers, admission, and infrastructure. Replicating a component may improve availability while leaving its authority centralized; describe both dimensions.

Justify necessary coordination using the [coordination decision](review.md#coordination-decision). Seek the smallest sufficient scope, such as one account, resource, or operation family. A coordination decision for one invariant does not automatically justify a manager for the whole application.

## Examples

| Situation | Preferred shape and required boundary |
| --- | --- |
| Several workers notice an unpublished derived artifact | Each derives the same logical operation identity; a conditional publication rule selects or merges valid results. Optional claims reduce wasted computation |
| A notification receiver disappears | Another eligible participant discovers the outstanding obligation through reconciliation against durable evidence |
| A worker calls a payment provider | Use the provider's actual idempotency or admission contract and durable recovery for ambiguous outcomes; otherwise identify the unresolved duplication risk |
| Several processes share a signer with ordered history | Define a serialized, recoverable signing boundary or independent authorized signer identities. Name the invariant that prevents unconstrained concurrent signing |
| A host starts and stops its actors | Keep local lifecycle supervision; workers reconstruct application progress from the specified evidence after host replacement |
| A repair worker fails halfway through | Another eligible repair worker rediscovers the unmet condition and safely retries using the same evidence and effect rules |

## Foundations

The preference is a house design choice. Use formal results within their stated models when assessing a particular design:

- [Dijkstra: Self-stabilizing systems in spite of distributed control](https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD426.html) — local rules, legitimate states, and convergence under specified assumptions.
- [Bailis and colleagues: Coordination Avoidance in Database Systems](https://www.vldb.org/pvldb/vol8/p185-bailis.pdf) — application invariants and conditions for safe coordination-free execution in the paper's database model.

These references provide reasoning tools; they do not certify a particular swarm or eliminate the need to specify its effect and fault contracts.
