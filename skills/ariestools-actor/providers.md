# Providers and resolution

`@ariestools/provider-model` holds the contracts and zod schemas (it declares a `zod` ^4.4 peer). `@ariestools/provider` holds descriptors, the registry and the resolver. Neither depends on actors, a host or a domain, so both may later move to a provider-kit repository under the same package names. `@ariestools/actor-engine` adds the executable factory.

## Responsibilities

- **Actors** own scheduling, subscriptions and coordination. **Providers** do bounded work when called and own the acquisition and disposal of their resources. Acquisition must not hide a recurring domain loop: a poller or a self-driven subscription belongs in an actor ([actors.md](actors.md)).
- An actor declares provider monikers. It never selects an implementation or overrides a binding. A different binding means a new system instance.
- Each selected implementation is constructed once per system. Its monikers share that instance, which is disposed once. Independent systems never share instances implicitly.

## Model (provider-model)

| Export | Shape |
|---|---|
| `Provider<'Moniker'>` | `{ readonly moniker }`. Extend it with the provider's methods |
| `ProviderMoniker` | `string`. `ProviderMonikerZod` and `asProviderMoniker` reject the empty string |
| `ProviderDependencyDeclaration` | `{ dependencies, optionalDependencies? }`, used by both actors and providers |
| `ConnectionsConfig` (`connections`) | `Record<name, { type, ...fields }>`. `ConnectionConfigZod` is a loose object that checks only `type` |
| `ProviderBindingsConfig` (`providerBindings`) | `Record<moniker, { connection?, provider?, options? }>`. `ProviderBindingConfigZod` is strict |
| `ResolvedProviderSystem` | Frozen `{ config, locator, resolution }` shared by every actor in one system |

`materializeProviderConfig(config, moniker)` projects the system config onto one moniker as `{ moniker, connection?: { name, config }, options, provider? }`. It throws when the binding names an undeclared connection. Connection bodies are open on purpose, so the application validates its own connection kinds, for example in the `parseConfig` it passes to `compileActorEngine`.

## Descriptors and registries

`ProviderDescriptor` (`@ariestools/provider`) is plan-time metadata: `{ id, monikers, dependencies, optionalDependencies?, connectionTypes }`.

- `id` names the implementation, and `providerBindings.<moniker>.provider` pins it.
- `monikers` lists every moniker the implementation can satisfy.
- `connectionTypes` lists the connection `type`s it consumes, or `[NoProviderConnection]` (`'none'`) when it needs none. Resolution throws on an empty list or on `'none'` mixed with other types.
- `createProviderRegistry()` provides `register`, `registerMany`, `byId`, `byMoniker` and `all`, and throws on a duplicate `id`.

## Engine provider descriptors

`ActorEngineProviderDescriptor` (`@ariestools/actor-engine`) adds `create(ctx): Promise<unknown>` and an optional `dispose(instance)`. Register it with `createActorEngineProviderRegistry()`. Host kits take the same descriptors: cli-kit's `launchCliSystem` takes the `providerRegistry`, and browser-kit's `compileBrowserSystem` takes a `providerDescriptors` array ([cli.md](cli.md), [browser.md](browser.md)).

| `ctx` field | Contents |
|---|---|
| `configs` | `materializeProviderConfig` output for each moniker this provider was selected for |
| `descriptor` | The descriptor itself |
| `locator` | Restricted facade: `getInstance`, `tryGetInstance` and `context` only |
| `monikers` | The monikers this instance was selected for |

- `create` resolves only the descriptor's own direct `dependencies` and `optionalDependencies`. Any other lookup, including a transitive one, throws `ActorEngineDependencyAccessError` with `code: 'dependency-undeclared'`. After disposal, lookups throw `'dependency-scope-closed'`.
- `create` owns cleanup of anything it acquired before it threw. The provisioner then disposes the providers it has already created, in reverse order.
- The default `provisionMemoryActorEngine` creates providers in dependency order and registers each instance under every moniker it was selected for. Its idempotent `release()` disposes in reverse order and collects failures into an `AggregateError`.
- A provider instance that exposes `whenFailed()` is joined to the session's terminal-failure signal.
- `ctx.locator.context` carries only the owner's logger, meter provider, trace provider and status reporter. These are empty unless the host passes a `locatorContext`; see [Logging and telemetry](engine.md#logging-and-telemetry).

```ts
import type { ActorEngineProviderDescriptor } from '@ariestools/actor-engine'
import { createActorEngineProviderRegistry } from '@ariestools/actor-engine'
import { NoProviderConnection } from '@ariestools/provider'
import type { Provider } from '@ariestools/provider-model'

interface ClockProvider extends Provider<'Clock'> {
  now(): number
}

const clockDescriptor: ActorEngineProviderDescriptor = {
  connectionTypes: [NoProviderConnection],
  create: async (): Promise<ClockProvider> => ({ moniker: 'Clock', now: () => Date.now() }),
  dependencies: [],
  id: 'system-clock',
  monikers: ['Clock'],
}

const providerRegistry = createActorEngineProviderRegistry()
providerRegistry.register(clockDescriptor)
```

A connection-consuming provider reads its connection from `ctx.configs.<moniker>.connection.config` and its declared dependencies from `await ctx.locator.getInstance<T>(moniker)`. Actors read providers with `getProvider` and `tryGetProvider` ([actors.md](actors.md)).

## Resolution: one per system

A system instance resolves its configuration once:

1. Parse the authored config and select the installed actor declarations.
2. Collect the `dependencies` of every selected actor.
3. Resolve one provider implementation for every moniker.
4. Add the `dependencies` of each selected provider, recursively.
5. Reject missing, ambiguous or cyclic graphs.
6. Materialize the selected provider ids into the resolved provider config.
7. Provision exactly one locator from that resolution.
8. Create one `ResolvedProviderSystem` holding the locator, resolved config and resolution.
9. Parse each actor's config and construct the actor with its own `ProviderActorContext`, through a restricted per-actor view of the shared system.

`compileProviderSystem(actorDeclarations, candidates, config)` performs steps 2 to 6 without creating anything. `compileActorEngine` calls it ([engine.md](engine.md)). It returns `{ config, declaration, resolution }` with providers in dependency order. For each moniker, in sorted order:

- **No `connection` bound:** the one candidate with `connectionTypes: ['none']` wins. If candidates exist but all need a connection, it throws `UnboundProviderError`.
- **`connection` bound:** the connection must be declared. Candidates whose `connectionTypes` include its `type` are eligible, and exactly one must remain.
- **`provider` pinned:** the candidates narrow to that id first.

The resolved `providerBindings` keeps only the selected monikers, each with its winning `provider` id filled in. The plan (`ProviderResolutionPlan`) holds `absentOptionalDependencies`, `bindings` (moniker to provider id), `connections`, `dependencies` (the full closure), `rejected` (with reasons) and `selected`. With the default provisioner, actors see `ResolvedActorEngineProviderPlan`: the same plan without `rejected` or factories. A launch's `host` filter picks which actors to construct. It does not change the provider graph, which is compiled from every selected actor.

## Optional dependencies

`optionalDependencies` take part in compilation and are fixed at boot:

- A uniquely eligible implementation is selected. A missing moniker, or one whose providers all need an unbound connection, is recorded in `absentOptionalDependencies`.
- Ambiguity, cycles, an explicit binding that fails, and missing required dependencies of a selected optional provider are still errors.
- A required edge from any consumer wins over optional declarations.
- `tryGetInstance` returns `undefined` only for a declared absent capability. It never makes an undeclared lookup legal. `getInstance` on an absent capability throws.

## Errors

The resolver's errors are exported from `@ariestools/provider`. Each sets `name` to its class name.

| Error | Thrown when | Fields |
|---|---|---|
| `MissingProviderDependencyError` | No installed provider satisfies the moniker, or none matches the bound connection's `type` | `moniker`, `reasons` |
| `AmbiguousProviderError` | More than one candidate remains | `moniker`, `candidates` (ids) |
| `UnboundProviderError` | Every candidate consumes a connection, but `providerBindings.<moniker>.connection` is unset | `moniker` |
| `UnknownProviderConnectionError` | A binding names an undeclared connection | `moniker`, `connectionName` |
| `UnknownProviderError` | A pinned `provider` id is not installed for that moniker | `moniker`, `providerId` |
| `ProviderDependencyCycleError` | The selected graph has a cycle (optional edges count) | `providerIds` |
| `ActorEngineDependencyAccessError` (actor-engine) | An actor or provider looks up an undeclared moniker, or looks up after its scope closed | `code`, `moniker`, `resourceId`, `resourceKind` |

## Config example

Config is data only. It selects actor and provider implementations the application has already installed, and it never names a module or code to import.

```ts
import type { ActorEngineConfig } from '@ariestools/actor-engine'

const config = {
  actors: [{ config: { intervalMs: 5_000 }, id: 'primary-sync', type: 'sync' }],
  connections: { api: { endpoint: 'https://example.test', type: 'rest' } },
  providerBindings: { Blocks: { connection: 'api', provider: 'rest-blocks' } },
} satisfies ActorEngineConfig
```

Here the `sync` actor declares `dependencies: ['Blocks']` and the `rest-blocks` descriptor declares `connectionTypes: ['rest']`. An optional per-actor `host` (for example `'worker'`) places actors in realms when one plan spans several runtimes, as in [browser.md](browser.md). Upstream reference: the [actor-kit](https://github.com/ariestools/actor-kit) `ARCHITECTURE.md`, and each package's README in `node_modules/@ariestools/<package>/README.md`.
