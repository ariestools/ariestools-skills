# Actor engine

`@ariestools/actor-engine` is the host-agnostic launcher behind cli-kit and browser-kit. It knows nothing about the surface that drives it; host kits add lifecycle adapters and, where they need one, a different supervision policy. Install and peers are in [overview.md](overview.md); the Node floor is in [overview.md](overview.md#runtime-floors). The engine does not re-export the actor classes: import `Actor`, `PeriodicActor` and `ProviderActor` from `@ariestools/actor` ([actors.md](actors.md)), and `NoProviderConnection` from `@ariestools/provider` ([providers.md](providers.md)).

cli-kit 2.x and browser-kit 2.x still use the `ActorSystem*` aliases of these names; new code uses the `ActorEngine*` names below ([host kits still on actor-system](migration.md#host-kits-still-on-actor-system)).

## Pipeline

The engine **compiles** (parses the system config, selects one installed declaration per configured actor and resolves one provider graph for all of them), **provisions** the selected providers in dependency order into one owner locator, **constructs** each actor with its own parsed actor config and a restricted view of the shared provider system, **supervises** resident actors, **runs** one-shot actors to completion, and returns one **session** whose `stop()` is idempotent.

## Registries

- **`ActorEngineCatalog`** (actors): `register` and `registerMany` (a duplicate type throws), `types`, `get`, `require` (throws `Actor engine type "x" is not installed`), and `requireDescriptor` (throws `… has no factory installed in this host`).
- **Declaration**: `{ type, dependencies, optionalDependencies?, runMode?: 'resident' | 'one-shot' }`. `name` is a deprecated alias of `type`; when both are set they must match. Compilation needs only declarations, so a realm can plan actors it never constructs.
- **Descriptor** = declaration + `create({ id, providerContext, selection })` + optional `parseConfig(input)`. `parseConfig` runs at construction (launch), not at compile; its result becomes `providerContext.actorConfig`.
- **Providers** register in `createActorEngineProviderRegistry()` ([providers.md](providers.md)). Portable installed-actor metadata adapts with `actorEngineDeclarationFromInstalled` and `actorEngineDescriptorFromInstalled`.

## Config

`ActorEngineConfig` is `{ actors?: [{ type, id?, host?, config? }], connections?, providerBindings? }`. Validate it with `ActorEngineConfigZod` or `parseActorEngineConfig`. `type` names the installed implementation and `id` the instance; `id` defaults to `type`, and duplicate ids throw `Duplicate actor engine id "x"; configure an explicit unique id`. Connections and bindings are covered in [providers.md](providers.md).

## Compile and launch

- `compileActorEngine({ actorRegistry, providerRegistry, config, parseConfig?, resolveConfig? })` returns a `CompiledActorEngine` `{ authoredConfig, providerSystem, resolvedConfig, selectedActors }`. It provisions nothing and constructs nothing. It holds descriptors and factories, so it is a runtime artifact, not a structured-clone wire format.
- `launchCompiledActorEngine({ actorRegistry, compiled, ...runtime })` provisions and starts exactly that plan without resolving it again. `launchActorEngine` does both steps in one call.

| Runtime option | Effect |
|---|---|
| `supervision` | Resident policy; default `parallelActorEngineSupervision` |
| `readyTimeoutMs` | Readiness bound handed to the policy; unset waits indefinitely |
| `host` | Construct only selections whose `host` matches exactly. Compilation and the default provisioner still cover the whole plan |
| `provision` | Provisioner; default `provisionMemoryActorEngine` (see [Logging and telemetry](#logging-and-telemetry)) |
| `identity` | Opaque value exposed as `session.identity` |
| `diagnostics` | `ActorEngineResourceReporter` sink for acquire, create, run, start, ready, stop and dispose spans |
| `checkActive` | Throw from it to abort boot; called between acquisitions and before construction |
| `failureSources` | Extra host or transport signals raced by `whenTerminal()` |
| `requireResidentFailureSignals` / `requireResidentTerminationSignals` | Reject launch when a resident lacks `whenFailed()` / `whenStopped()` |

**Run modes.** Resident actors (the default) go to the supervision policy. One-shot actors run `runToCompletion()` during launch, once the residents are started and ready. A one-shot without `runToCompletion()` fails the launch, and its dependency scope is revoked once its run ends. Any launch failure stops what started and releases providers before rethrowing.

## Supervision

These policies manage a launch's local actor lifecycles. When designing how several hosts discover and perform application work, consult [ariestools-architecture](../ariestools-architecture/SKILL.md) when available and evaluate business authority and recovery separately. Local supervision does not itself specify distributed work admission, deduplication, or replacement progress.

| Policy | Start | Readiness | Failure or stop |
|---|---|---|---|
| `parallelActorEngineSupervision` (engine default; browser-kit sets no policy, so it gets this) | One owned `Orchestrator` per launch; actors start in parallel and kick off warm passes | `whenReady(readyTimeoutMs)` | Stop, with a shutdown fallback |
| `sequentialActorEngineSupervision` (cli-kit default) | Registration order | Warm passes start together, then readiness is joined in order under one total `readyTimeoutMs` | `requestCancellation()` on all, then stop in reverse order |

- `createParallelActorEngineSupervision({ orchestrator })` supervises on an orchestrator the caller owns and stops only the actors it registered.
- A custom policy is `(actors, { readyTimeoutMs?, lifecycleObserver? }) => Promise<{ stop }>`. It must clean up every actor before rejecting. Actors without a readiness surface count as ready under both built-ins.

## Caller-built actors

When the host constructs actors itself, `launchActors(actors, { supervision?, readyTimeoutMs?, failureSources? })` supervises them with the same policies and returns `{ actors, stop, whenTerminal, whenFailed }`. It needs at least one actor, defaults to parallel supervision, and does no provider resolution or release. Host kits must not grow their own supervisor.

## Session

- `ActorEngineSession` exposes `actors`, `system` (the owner locator, resolved config and resolution plan) and `identity`.
- `stop()` is idempotent: supervision stops, every actor scope is revoked, then the provisioner releases providers (the default disposes them in reverse order). Failures surface as one `AggregateError`.
- `whenTerminal()` rejects with the first `ActorEngineTerminalFailureError` (`code: 'actor-system.terminal-failure'`, `resourceKind: 'actor' | 'provider' | 'host' | 'transport'`, `resourceId`, `cause`). `whenFailed()` rejects with the raw cause. With no failure sources neither ever settles.
- Sources are residents that expose `whenFailed()` (every `PeriodicActor` and `ProviderActor` does), providers whose instance exposes `whenFailed()` (default provisioner), and `failureSources`. Actor sources are keyed by actor `name`, and duplicate keys throw. Two residents left unnamed both default to `UnknownActor`, so their launch fails with `Duplicate actor engine failure source "actor:UnknownActor"`. Give each a unique name, for example `name: id as CreatableName` in `create`.

## Dependency access

- Each provider factory and each actor gets a frozen locator facade limited to its declared `dependencies` and `optionalDependencies`. An undeclared lookup throws `ActorEngineDependencyAccessError` with code `dependency-undeclared`, and `tryGetInstance` does not bypass it. A lookup after revocation throws `dependency-scope-closed`. Another moniker served by the same provider instance is still undeclared.
- Actor access survives stop hooks. It is revoked before provider release, when a one-shot finishes, or when that resident's `whenStopped()` settles. Provider objects already returned stay usable.
- Only the session holds the owner locator. Supply host-specific locator extensions as declared providers, not through the actor context.
- The launcher applies actor scopes even with a custom provisioner. Custom provisioners should scope providers with `createActorEngineDependencyScope`, call `checkActive` between acquisitions, and wrap owned work in `traceActorEngineResource`.

## Logging and telemetry

The default provisioner builds its owner locator from `input.locatorContext ?? {}`, and neither launcher passes a `locatorContext`. cli-kit forwards your `provision` and adds no context of its own. Every scoped locator copies `logger`, `meterProvider`, `traceProvider` and `statusReporter` from that owner context, so **engine-launched actors have no logger, meter or tracer by default**. `AccountProviderActor` asserts a logger and throws without one.

| Fix | Supplies |
|---|---|
| Wrap the provisioner and pass `locatorContext` | Logger, meter and tracer for every actor, plus each provider factory's locator |
| Pass `logger` in the descriptor's `create` params | That actor's logger only |
| Call `initDefaultLogger()` from the root `@ariestools/sdk` | The process-wide fallback logger only |

```ts
import type { ActorEngineProvisioner } from '@ariestools/actor-engine'
import { provisionMemoryActorEngine } from '@ariestools/actor-engine'
import { initDefaultLogger } from '@ariestools/sdk'
import { metrics, trace } from '@opentelemetry/api'

const logger = initDefaultLogger()
const provision: ActorEngineProvisioner = async input => await provisionMemoryActorEngine({
  ...input,
  locatorContext: { logger, meterProvider: metrics.getMeterProvider(), traceProvider: trace.getTracerProvider() },
})
```

## Boot diagnostics

- `startActorEngine(options, { maxEvents?, maxPlanEntries? })` returns a handle before compilation: `subscribe(observer)` (returns an unsubscribe), `snapshot()` `{ events, droppedEvents, plan? }`, `whenReady()` (the session) and `stop()`. `maxEvents` defaults to 256 and is clamped to 1..4096.
- `stop()` during acquisition waits for the in-flight acquisition, then rolls back at the next checkpoint; `whenReady()` then rejects with `ActorEngineBootInterruptedError` (`code: 'actor-system.boot-interrupted'`). After launch it stops the session.
- Events carry `sequence`, `elapsedMs`, a fixed `stage` (`boot`, `compile`, `launch`, `acquire`, `create`, `dispose`, `run`, `start`, `ready`, `stop`) and `outcome` (`started`, `completed`, `failed`, `interrupted`), plus an optional `{ kind, id }` resource. They never hold config or error text; ids that are unsafe or longer than 128 characters are redacted. Observer failures never change results.
- `describeActorEnginePlan(compiled, maxEntries = 256)` projects nodes, required and optional edges, bindings and absent optional capabilities without acquiring anything. `renderActorEngineBoot(snapshot, 'text' | 'tree' | 'json')` (default `'text'`) prints a snapshot. A compile failure shows `no resolved graph`.

## Examples

A resident periodic actor on a provider, launched with sequential supervision and a logger:

```ts
import type { PeriodicPassContext, ProviderActorParams } from '@ariestools/actor'
import { ProviderActor } from '@ariestools/actor'
import type { RawInstanceLocator } from '@ariestools/actor-model'
import type { ResolvedActorEngineConfig, ResolvedActorEngineProviderPlan } from '@ariestools/actor-engine'
import {
  ActorEngineCatalog, compileActorEngine, createActorEngineProviderRegistry,
  launchCompiledActorEngine, provisionMemoryActorEngine, sequentialActorEngineSupervision,
} from '@ariestools/actor-engine'
import { NoProviderConnection } from '@ariestools/provider'
import type { Provider } from '@ariestools/provider-model'
import type { CreatableName } from '@ariestools/sdk'
import { ConsoleLogger, creatable, LogLevel } from '@ariestools/sdk'
import { z } from 'zod'

interface ClockProvider extends Provider<'Clock'> {
  now(): number
}
interface TickParams extends ProviderActorParams<
  RawInstanceLocator, ResolvedActorEngineConfig, { readonly label: string }, ResolvedActorEngineProviderPlan
> {}

@creatable()
class TickActor extends ProviderActor<TickParams> {
  protected override async run({ signal }: PeriodicPassContext): Promise<void> {
    if (signal.aborted) return
    const clock = await this.getProvider<ClockProvider>('Clock')
    this.logger?.info(`${this.actorConfig.label} ${clock.now()}`)
  }
}

const actorRegistry = new ActorEngineCatalog()
actorRegistry.register({
  create: async ({ id, providerContext }) => await TickActor.create({
    intervalMs: 1000,
    isSchedulingEnabled: true,
    name: id as CreatableName,
    providerContext: providerContext as TickParams['providerContext'],
  }),
  dependencies: ['Clock'],
  parseConfig: input => z.strictObject({ label: z.string() }).parse(input),
  type: 'tick',
})

const providerRegistry = createActorEngineProviderRegistry()
providerRegistry.register({
  connectionTypes: [NoProviderConnection],
  create: async (): Promise<ClockProvider> => ({ moniker: 'Clock', now: () => Date.now() }),
  dependencies: [],
  id: 'system-clock',
  monikers: ['Clock'],
})

const logger = new ConsoleLogger(LogLevel.info)
const config = { actors: [{ config: { label: 'tick' }, id: 'tick-1', type: 'tick' }] }
const compiled = compileActorEngine({ actorRegistry, config, providerRegistry })
const session = await launchCompiledActorEngine({
  actorRegistry,
  compiled,
  provision: async input => await provisionMemoryActorEngine({ ...input, locatorContext: { logger } }),
  readyTimeoutMs: 10_000,
  supervision: sequentialActorEngineSupervision,
})
// whenTerminal() only rejects; a CLI host races it with the interrupt instead (cli.md)
await session.whenTerminal().catch((error: unknown) => logger.error('terminal failure', error))
await session.stop()
```

Boot with diagnostics, printing the retained record on failure (same registries and config):

```ts
import { renderActorEngineBoot, startActorEngine } from '@ariestools/actor-engine'

const boot = startActorEngine({ actorRegistry, config, providerRegistry }, { maxEvents: 512 })
const unsubscribe = boot.subscribe(event => logger.info(`${event.sequence} ${event.stage} ${event.outcome}`))
try {
  const booted = await boot.whenReady()
  await booted.stop()
} catch {
  logger.error(renderActorEngineBoot(boot.snapshot(), 'tree'))
} finally {
  unsubscribe()
}
```

A one-shot actor; `runToCompletion()` starts it, runs one pass and stops it:

```ts
@creatable()
class MigrateActor extends ProviderActor {
  protected override async run(): Promise<void> { /* one pass of work */ }
}
actorRegistry.register({
  create: async ({ id, providerContext }) => await MigrateActor.create({ name: id as CreatableName, providerContext }),
  dependencies: [],
  runMode: 'one-shot',
  type: 'migrate',
})
```
