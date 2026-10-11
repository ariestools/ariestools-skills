# Architecture Review

## Review the decision in scope

Read the accepted protocol, trust model, and architecture decisions for the affected operation. Use the [principles](principles.md) to assess the proposed responsibility boundary. Preserve settled behavior during routine changes; record a necessary architectural amendment through the repository's existing process.

Start with this question:

> If the participant that appears to be in charge disappears, what durable evidence lets another eligible participant determine and perform the next valid action?

Trace the answer through discovery, authorization, acceptance, external effects, and recovery. State any concentrated dependency it requires. Compare authority and availability separately: many worker instances do not establish distributed authority, and a replicated coordination service still has a defined authority boundary.

## Review criteria

| Criterion | What the design must explain |
| --- | --- |
| Work and authority | What is the logical operation, who may attempt it, what evidence authorizes it, and who or what decides acceptance? |
| Independent discovery | How does an eligible worker enumerate unmet obligations and recognize accepted or expired work without a controller's private memory? |
| Replacement | What survives participant loss, and can a new authorized participant continue from it? Identify custody, identity, or history constraints |
| Concurrent attempts | What happens when two participants act on stale observations? Where are duplicate or conflicting effects prevented, merged, rejected, or explicitly allowed? |
| Notifications | Which messages are hints, and how does the system rediscover work after their loss or corruption? |
| Safety and progress | Which invariants always hold, what faults can interrupt progress, and which communication, capacity, and fairness assumptions allow recovery? |
| Repair | Can maintenance participants disappear or race safely, or does one repair manager own unrecoverable obligations? |
| Cost and overload | What bounds work, retries, communication, and speculative effects when many participants act together? |
| Concentrated dependencies | Who controls discovery, evidence, credentials, signers, effect admission, and upgrades; what are their failure and recovery boundaries? |
| Local lifecycle | Does a supervisor own only its host's resources, or is business progress dependent on its assignments or private state? |

For a narrow decision, cover only affected criteria and name inherited contracts. For a new protocol, cover the complete responsibility and failure model. Mark unknowns as open decisions or unverified assumptions; distinguish proposed mechanisms from demonstrated behavior.

## Coordination decision

Before choosing a scheduler, controller, leader, authoritative queue, or exclusive claim, answer:

1. **Constraint.** Name the correctness invariant or resource bound that requires coordination. Examine whether independent actions, merging, partitioned authority, or another existing mechanism can satisfy it.
2. **Scope.** Identify exactly which decisions and operations the mechanism controls. Separate correctness authority from an optimization that reduces redundant work.
3. **Enforcement.** Explain admission and rejection at the actual state or effect boundary, including stale participants and ambiguous completion.
4. **Failure and recovery.** State what pauses or fails when the mechanism disappears, partitions, or restarts; where obligations survive; and how a replacement resumes.
5. **Evidence.** Name the contracts, reasoning, and observable checks that establish sufficiency under the supported fault model.

Coordination can itself be replicated or protocol-governed. Prefer the smallest sufficient authority boundary. An explanation does not create a new permission request: follow the user's authorization and the repository's existing decision process.

## Observable acceptance criteria

Select failure scenarios that exercise the claimed guarantees. Name the operation, supported fault, observable invariant, recovery condition, and expected outcome. Define any claimed time or resource bound from product requirements and the actual environment; do not invent a universal threshold.

- **Participant loss:** terminate the active participant at a relevant boundary. A replacement discovers the surviving obligation and completes it, or produces the protocol-defined expired or failed outcome.
- **Concurrent attempts:** let multiple eligible participants discover the same obligation before acceptance. Observe the specified single, merged, or rejected outcome at the effect boundary, including a stale attempt after authority changes.
- **Ambiguous external effect:** interrupt between an effect and its success record. Recovery uses the stated admission or idempotency contract; evidence identifies any unresolved outcome instead of assuming success or safe retry.
- **Lost hints:** suppress notifications while retaining authoritative evidence. Workers rediscover eligible work through the documented reconciliation path.
- **Partition and rejoin:** isolate a participant, let supported independent work continue, then reconnect it. Observe the specified conflict resolution, safety, and catch-up behavior.
- **Repair-worker loss:** interrupt a repair participant. Another eligible repair participant safely rediscovers and addresses the same condition.
- **Observer loss:** remove a dashboard or optional monitoring process. Workers retain the authoritative evidence and ability to progress under the remaining assumptions.
- **Overload or missing capacity:** exercise the documented worker and resource bounds. Verify bounded activity and truthful outstanding or unavailable state; resume progress when the specified capacity returns.

Exercise only faults and environments within the task's authorized scope. In an implementation task, use the repository's native verification and record its limits. In a design task, write the criteria as requirements and identify missing evidence; do not present them as passing tests.

## Record the outcome

For a substantive decision, use the repository's existing Yellow Paper, architecture document, or decision record. Include the operation and invariants; authoritative evidence and trust assumptions; discovery and replacement behavior; concurrency and external-effect rules; any scoped coordination with its justification; recovery and resource bounds; and acceptance evidence or open questions.

A concise review verdict names the adopted design, the required coordination and why, and any material unknown or failed criterion. Avoid declaring a system decentralized, self-stabilizing, or fault tolerant beyond the authority and failures actually examined.
