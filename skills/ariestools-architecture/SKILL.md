---
name: ariestools-architecture
description: "Design and review distributed systems using protocol-governed autonomous, replaceable workers. Covers independent work discovery, durable evidence, safe concurrent attempts, reconciliation, bounded activity, and narrowly justified coordination. Use when defining worker or service responsibilities, recovery and effect semantics, or introducing a scheduler, controller, leader, authoritative queue, or repair service. Applies across frameworks and hosting platforms; routine changes within an accepted architecture do not reopen its design."
metadata:
  version: 0.1.8 # x-release-please-version
---

# Aries Tools Architecture

**Authority.** This skill is maintained only in [`ariestools/ariestools-skills`](https://github.com/ariestools/ariestools-skills); edit there, not in installed copies. It records the shared architectural preference for adopting Aries Tools and XYO projects. The user's instructions and the repository's accepted protocol and decisions govern a particular task. Preserve existing contracts and scope; propose an architectural amendment when needed rather than silently redesigning a system.

**Skill identity.** When reporting which skills informed the work, use `ariestools-architecture v<version>` from this file's `metadata.version`.

**Default.** Prefer autonomous, replaceable participants whose protocol-defined behavior produces useful work through independently verifiable state transitions and reconciliation. Participants discover eligible work, tolerate concurrent attempts and worker disappearance, and recover from durable evidence. Introduce coordination where a named correctness invariant or resource constraint requires it, and confine its authority to that requirement.

**Scope.** This is a tool-independent design policy, with no required SDK, blockchain, gossip transport, or deployment topology. Here, a protocol is the explicit set of rules governing eligibility, authorization, valid outcomes, conflicts, and recovery. A local process supervisor can manage startup, shutdown, and resources while application work remains autonomous. Distinguish that lifecycle responsibility from authority over which business operation happens next.

## Applying the preference

Before selecting a controller or worker topology, identify the operation, its authoritative evidence, its acceptance rules, and the conditions needed for progress. Describe how an eligible worker independently discovers outstanding work and how another participant resumes after it disappears. Read [principles.md](principles.md) for the design defaults.

Use [review.md](review.md) when comparing architectures, introducing concentrated authority, reviewing a design, or writing architecture acceptance criteria. Explain any coordination through its invariant or resource constraint, authority scope, failure behavior, recovery path, and verification. This explanation is an engineering requirement; it does not create an additional approval gate.

Scale the review to the decision. A new distributed protocol needs its trust and failure assumptions stated; a small change to one established worker may need only the affected concurrency or recovery criterion. Do not apply swarm machinery to ordinary local computations or rewrite an accepted architecture during unrelated maintenance.

## References

- **[Principles](principles.md)** — read when assigning responsibilities, selecting evidence and notifications, designing independent worker passes, or defining concurrency, recovery, and resource bounds. Includes examples and the boundary between local supervision and application authority.
- **[Review and acceptance criteria](review.md)** — read when assessing a design, choosing coordination, or writing observable failure and recovery criteria. Includes a compact decision record and failure scenarios.

## Related skills

These are task-specific navigation links; this skill remains usable without the other skills installed.

- **[xy-product-plan](../xy-product-plan/SKILL.md)** — record product-specific protocol rules and architecture decisions in the Yellow Paper and carry their acceptance criteria into the active PRD.
- **[ariestools-actor](../ariestools-actor/SKILL.md)** — implement local actors and host lifecycles using the actual kit contracts; this preference does not change those APIs.
- **[xy-development](../xy-development/SKILL.md)** — apply the repository's implementation, testing, and completion standards.
- **[xy-agent](../xy-agent/SKILL.md)** — place shared-policy pointers, accepted decisions, and verification evidence in the repository's existing documentation structure.

For adoption, install this skill from a source revision that contains it, or read the canonical source available in the workspace. A link alone does not install or load a skill. Check the installed toolchain's skill catalog before using catalog-only installation or required-skill configuration; this skill's presence in the pack does not establish catalog support.
