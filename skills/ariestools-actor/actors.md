# Actors

Actor classes and helpers come from `@ariestools/actor`. The structural contracts (`ActorContext`, `ActorParams`, `OrchestratedActor`, readiness and the installed-actor catalog) live in `@ariestools/actor-model`. `@ariestools/actor-engine` does not re-export the classes, so import `Actor`, `PeriodicActor` and `ProviderActor` from `@ariestools/actor` in engine hosts too.

## Pick a base class

| Class (all abstract) | Extends | You implement | Use for |
|---|---|---|---|
| `Actor` | root `AbstractCreatable` | `startHandler` / `stopHandler` | Custom lifecycles only |
| `PeriodicActor` | `Actor` | `runPass({ signal })` | Standalone loops, one-shot jobs, event-driven passes |
| `ProviderActor` | `PeriodicActor` | `run({ signal })` (default no-op) | Every actor the engine launches |
| `AccountProviderActor` | `ProviderActor` | `run`, plus `params.account` | Account-bearing domain actors |

Engine-launched actors extend `ProviderActor`. A standalone loop extends `PeriodicActor`. XL1's `ChainActor` extends `AccountProviderActor` on the domain side; that wiring lives in [xyo-skills](https://github.com/XYOracleNetwork/xyo-skills).

## Create, never construct

- Always `await MyActor.create(params)`. The `AbstractCreatable` constructor asserts a private key, so `new` throws.
- Decorate the class with `@creatable()` from the root `@ariestools/sdk`. It only type-checks the static side and does nothing at runtime. Decorators need `experimentalDecorators` and `tslib` ([xy-toolchain base config](../xy-toolchain/typescript.md#understand-the-base-config)).
- `name` is the branded `CreatableName`. Cast literals (`'heartbeat' as CreatableName`) or omit it; the default `'UnknownActor'` makes logs ambiguous.
- `Actor` requires `params.locator` (any object with a `context`), and `create()` throws without one. `ProviderActor` requires `params.providerContext` and always takes the locator from `providerContext.system.locator`, overwriting any `locator` you pass.
- `shutdownTimeoutMs` bounds how long stop waits for in-flight timer work after aborting the signal. Without it, stop waits for that work to settle.

## Lifecycle

- `start()` and `stop()` resolve `false` (they never reject) when a handler throws, and leave status `'error'`. `stop()` resolves `true` when the actor is already `'stopped'`. From `'created'` or `'error'` it resolves `false` and sets `'error'`, so never stop an actor you have not started: it can never start afterwards. A call made while starting or stopping waits for that transition. An actor in `'error'` cannot start again; create a new one.
- Override `startHandler` / `stopHandler`, never `start` / `stop` (the base asserts this). Call `super.startHandler()` first: it checks for cancellation and replaces an aborted signal. In `stopHandler`, await `super.stopHandler()` before releasing resources, because it aborts the signal, clears timers and drains in-flight passes.
- `this.signal` is a fresh `AbortSignal` per start cycle. Pass it to `fetch` and other cancellable work.
- `requestCancellation()` is idempotent and does not wait for the lifecycle lock, so a supervisor can cancel a start that is in progress. A start that has not yet entered `startHandler` then resolves `false`.
- `shutdown()` is the memoized rollback. It requests cancellation and runs `stopHandler` regardless of status, for a `startHandler` that acquired resources and then failed.
- `whenStopped()` settles on the first complete stop or forced `shutdown()`, and rejects when forced cleanup threw. Cancellation or a failed start alone does not settle it, and the result is kept across restarts.

## Timers

`registerTimer(name, callback, dueTimeMs, periodMs, { firstRun })` works only while the actor is starting, so call it from `startHandler`. From any other status it logs a warning and returns.

- `firstRun: 'immediate'` (default) fires at `dueTimeMs`. `'deferred'` fires at `dueTimeMs + periodMs`. `AccountProviderActor` defaults to `'deferred'`.
- A tick is skipped while the previous run is still in flight. Runs longer than the period, or longer than 5000 ms, log a warning.
- Callback errors are logged, not thrown. Stop clears every timer.

## Readiness

Override `protected async readyHandler()` to prove the actor can do useful work. The default is a no-op; `PeriodicActor` implements it from its `readiness` param.

- Supervisors (`bootActors`, `Orchestrator`, the engine) call `runReadyHandler()` once after start. It is idempotent and rethrows the `readyHandler` error.
- `whenReady(timeoutMs?)` waits for readiness and rejects on failure or timeout. `readyState` is `'pending' | 'ready' | 'failed'`, and `readyError` holds the failure.
- `context.statusReporter?.reportReady(name, state, error?)` receives the outcome.

## PeriodicActor

| Param | Default | Effect |
|---|---|---|
| `intervalMs` | `5000` | Period between passes |
| `firstRunDelayMs` | `2000` when `firstRun` is unset | Delay before the first pass; an explicit value wins over `firstRun` |
| `firstRun` | unset | `'immediate'` runs the first pass at start; `'deferred'` runs it one interval later |
| `isSchedulingEnabled` | `true` (`false` on `ProviderActor`) | `false` runs the lifecycle without the pass timer |
| `readiness` | `'first-pass'` | `'immediate'` reports ready at start; use it when the first pass is a long backfill |
| `maxConsecutiveFailures` | unset | Self-stop after this many consecutive failed passes |

The matching protected getters (`intervalMs`, `firstRunDelayMs`, `isSchedulingEnabled`, `readiness`) can be overridden to remap config.

**Pass model.**

- `runPass({ signal })` is abstract. Treat an aborted `signal` as control flow: an aborted pass counts as neither success nor failure, and it never settles first-pass readiness.
- `runOnce()` is a demand pass. It works without `start()` and rejects to its caller. It skips `onPassError` and the self-stop policy, but a failure still counts toward `consecutiveFailures`.
- `wake()` is a monitored push trigger. It is a no-op unless the actor is started, and while a pass is in flight.
- The timer, `wake()` and `runOnce()` share one in-flight slot. `runOnce()` joins a pass already in flight and reports that pass's outcome. Stop drains it.

**Failure policy.** These hooks apply to monitored passes (timer and `wake`):

- `isFatalError(error)` marks an error terminal regardless of the count. `onPassError(error)` runs after the failure count increments; errors it throws are logged.
- A fatal error or reaching `maxConsecutiveFailures` sets `failureError`, rejects `whenFailed()` with the original error, makes `readyState` report `'failed'` and stops the actor. A readiness that was already reached stays resolved for `whenReady()`.
- `whenFailed()` stays pending during normal operation, so attach a `.catch`. It is a signal for process supervisors, not a retry hook. Under the engine, the session races every resident actor's `whenFailed()` (one-shot actors excluded) for you ([engine.md](engine.md#session)).

## ProviderActor

- `providerContext` is the frozen `{ actorConfig, system: { config, locator, resolution } }`. Every actor in a realm shares the same `system`. The protected getters are `actorConfig`, `providerSystem` and `providerContext`. Outside the engine, build one with `createProviderActorContext(createResolvedProviderSystem({ config, locator, resolution }), actorConfig)`; the inner helper comes from `@ariestools/provider-model`.
- Override `run(context)`, not `runPass`.
- `getProvider<T extends Provider<'Clock'>>('Clock')` and `tryGetProvider` resolve from the shared locator. Under the engine, only monikers in the actor's `dependencies` and `optionalDependencies` resolve. Any other moniker throws `ActorEngineDependencyAccessError` (`'dependency-undeclared'`), and `tryGetProvider` does not bypass the check ([providers.md](providers.md)).
- Scheduling is off by default. Readiness is `'immediate'` unless scheduling is on, in which case it is `'first-pass'`.
- Choose one trigger style:
  - `runToCompletion()` for one-shot work: start, `runOnce()`, then stop. It throws when the actor is not startable or start or stop fails, rethrows the run error, and throws an `AggregateError` when both the run and the stop fail.
  - `wake()` for event-driven work.
  - `isSchedulingEnabled: true` for timer-driven work.

## AccountProviderActor

It requires `params.account` and exposes it as the protected `account`. `name` falls back to `config.name`, then to `providerContext.actorConfig.name`. Its `logger` getter asserts that a logger resolves, so it throws on first log access when neither the context, `params.logger` nor `Base.defaultLogger` supplies one. Timers default to `firstRun: 'deferred'`.

## Context, logging and telemetry

`ActorContext` is `{ logger?, meterProvider?, statusReporter?, traceProvider? }`, read from `locator.context`.

- **Logger:** `context.logger`, then `params.logger`, then the root `Base.defaultLogger` (set by the root `initDefaultLogger`; see [import style](../ariestools-sdk/conventions.md#import-style)). The result is wrapped in an `IdLogger` tagged with the actor name.
- **Meter and tracer:** only `context.meterProvider` / `context.traceProvider` are read, and `params` providers are ignored. Both are named after the actor.
- **Under the engine** the default provisioner leaves the context empty, so an actor has no meter or tracer, and no logger unless the root `Base.defaultLogger` is set. The fixes are in [engine.md](engine.md#logging-and-telemetry).
- `counter`, `gauge`, `histogram` and `upDownCounter` (protected) return no-op instruments when telemetry is unwired. Create instruments in `startHandler`, not in field initializers or per pass.
- `span(name, fn)` and `spanAsync(name, fn, config?)` run work in an `@ariestools/telemetry` root span with the actor's tracer (and logger, for the async form).

## Without the engine

- `createMemoryLocator(context, entries?)` is a Map-backed locator with `register`, `has` and `destroy`. `getInstance` throws for an unknown moniker, and `tryGetInstance` returns `undefined`. Build one per process and share it across actors.
- `bootActors(specs)` runs create, start and the warm pass (`runReady: false` skips it) per spec, in order. On failure it rolls back the started actors in reverse with `stopOrShutdown`, and calls `shutdown()` on an actor whose start failed. With `'first-pass'` readiness, boot waits for the first pass, which runs after `firstRunDelayMs` (2000 ms by default).
- `stopOrShutdown(target)` calls `stop()` and falls back to `shutdown()` when stop resolves `false` or throws. It throws an `AggregateError` when both fail.
- `Orchestrator` is the parallel, dynamic supervisor: it starts actors in parallel, accepts `registerActor` while running, and does not await warm passes. Prefer the engine's supervision policies ([engine.md](engine.md)) or cli-kit's sequential supervisor ([cli.md](cli.md)) to driving it directly.
- **Installed-actor catalog** (`@ariestools/actor-model`, re-exported by `@ariestools/actor`): an `InstalledActorDescriptor` carries `name`, `dependencies`, `optionalDependencies`, `configParser`, an optional `create`, and domain extras (`bootExtras`, `compileExtras`, `defaultAccountPath`, `signerMoniker`). Registries come from `createInstalledActorRegistry()` or the process-wide `getDefaultInstalledActorRegistry()`, and `buildFromInstalledCatalog(name, buildInput)` is the host entry. Domain launchers use the catalog. New config-driven hosts use `ActorEngineCatalog`, and `actorEngineDescriptorFromInstalled` bridges the two ([engine.md](engine.md)).

## Structural contracts

| Contract | From | Requires |
|---|---|---|
| `OrchestratedActor` | actor-model | `name`, `start(): Promise<boolean>`, `stop(): Promise<boolean>`; optional `requestCancellation`, `shutdown`, `whenStopped` |
| `ActorEngineActor` | actor-engine | `OrchestratedActor` plus optional `runToCompletion` |
| `SupervisedActor` | actor-model | `OrchestratedActor` plus `runReadyHandler`, `whenReady`, `readyState` |
| `ManagedActor` | cli-kit | `name`, `readyState`, `whenReady`; `start` / `stop` may be sync and return `boolean \| void`; optional `shutdown` |

Plain objects qualify; the engine's own specs register object literals. `Actor` satisfies all four.

## Example

```ts
import type { PeriodicActorParams, PeriodicPassContext } from '@ariestools/actor'
import {
  bootActors, createMemoryLocator, PeriodicActor, stopOrShutdown,
} from '@ariestools/actor'
import type { CreatableName } from '@ariestools/sdk'
import { creatable, initDefaultLogger } from '@ariestools/sdk'
import type { Counter } from '@opentelemetry/api'

@creatable()
class HeartbeatActor extends PeriodicActor<PeriodicActorParams> {
  private beats?: Counter

  override async startHandler(): Promise<void> {
    await super.startHandler()
    this.beats ??= this.counter('heartbeat.beats', 'Completed heartbeat passes')
  }

  protected override async runPass({ signal }: PeriodicPassContext): Promise<void> {
    if (signal.aborted) return
    this.beats?.add(1)
  }

  protected override isFatalError(error: Error): boolean {
    return error.name === 'AuthError'
  }
}

const logger = initDefaultLogger()
const locator = createMemoryLocator({ logger })

// One-shot: no start() needed; a failure rejects here
const probe = await HeartbeatActor.create({ locator, name: 'heartbeat-probe' as CreatableName })
await probe.runOnce()

// Resident: create, start and warm pass, rolled back on failure
const [heartbeat] = await bootActors([{
  create: async () => await HeartbeatActor.create({
    intervalMs: 10_000, locator, maxConsecutiveFailures: 5, name: 'heartbeat' as CreatableName,
  }),
}])
void heartbeat.whenFailed().catch((error: unknown) => logger.error(`heartbeat failed: ${String(error)}`))
await stopOrShutdown(heartbeat) // on process shutdown
```

Test actors with Vitest per [xy-toolchain testing](../xy-toolchain/testing.md), following the principles in [xy-development testing](../xy-development/testing.md).
