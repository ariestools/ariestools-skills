# Overview, packages and install

Three private repositories publish this family under `@ariestools/*`. Each package ships its README at `node_modules/@ariestools/<pkg>/README.md`.

| Repository | Version | Publishes |
|---|---|---|
| [`ariestools/actor-kit`](https://github.com/ariestools/actor-kit) | 2.0.0 | The host-neutral engine: `provider-model`, `provider`, `actor-model`, `actor`, `actor-engine`, and the deprecated `actor-system` alias |
| [`ariestools/cli-kit`](https://github.com/ariestools/cli-kit) | 2.1.0 | The Node process host: `cli-kit`, `cli-kit-node`, `cli-kit-yargs`, `cli-kit-daemon` |
| [`ariestools/browser-kit`](https://github.com/ariestools/browser-kit) | 2.0.0 | The browser host: `browser-kit` and its `-page`, `-worker`, `-service-worker` and `-plugin` realm adapters |

Every package is ESM only and declares `sideEffects: false`. actor-kit builds neutral output, cli-kit builds Node output, and browser-kit builds a neutral core with browser-only adapters.

## The stack in one picture

An arrow reads "depends on" (published `dependencies`; peers in parentheses):

```text
provider      → provider-model
actor-model   → provider-model
actor         → actor-model, provider-model, @ariestools/sdk, @ariestools/telemetry
actor-engine  → actor, actor-model, provider, provider-model
actor-system  → actor-engine                       (deprecated alias)

cli-kit       → actor-system                       (peers: actor-system, actor-model)
cli-kit-node, cli-kit-yargs, cli-kit-daemon → cli-kit
browser-kit   → actor     (peers: actor-system, actor-model, provider, provider-model)
browser-kit-page, -worker, -service-worker → browser-kit
browser-kit-plugin → browser-kit, browser-kit-worker
```

- No actor-kit package depends on a host kit. Host kits depend on the engine, never the reverse.
- A host kit injects policy (its supervision default, its lifecycle boundary, its transport) and never re-implements the engine. The engine owns compile, provider resolution, provisioning, actor construction, supervision and the terminal-failure session.
- Domain code depends on `@ariestools/actor` and `@ariestools/actor-engine`, never on a host kit. A domain package that imports cli-kit or browser-kit has bound itself to one surface.
- Supervision defaults differ: the bare engine and browser-kit start actors in parallel, cli-kit sequentially in registration order. See [engine.md](engine.md).

| Code | Lives in | Read |
|---|---|---|
| Actor classes, periodic passes, timers, readiness | A domain package on `@ariestools/actor` | [actors.md](actors.md) |
| Provider descriptors, monikers, connections, bindings | A domain package on `@ariestools/provider` / `provider-model` | [providers.md](providers.md) |
| Catalogs, config, compile, launch, supervision, diagnostics | A domain package on `@ariestools/actor-engine` | [engine.md](engine.md) |
| Process entry: argv, env, signals, exit codes, daemons | The bin package, on cli-kit | [cli.md](cli.md) |
| Page, worker, service-worker and extension realms | The app, on browser-kit | [browser.md](browser.md) |

## Package map

| Package | Version | Role | Key exports |
|---|---|---|---|
| `@ariestools/provider-model` | 2.0.0 | Provider contracts and config schemas | `Provider`, `ProviderMoniker`, `ProviderDependencyDeclaration` (+`Zod`), `ConnectionConfigZod`, `ProviderBindingConfigZod`, `ProviderConfigFieldsZod`, `materializeProviderConfig`, `createResolvedProviderSystem` |
| `@ariestools/provider` | 2.0.0 | Provider catalog, dependency compiler, deterministic resolver | `ProviderDescriptor`, `NoProviderConnection` (`'none'`), `createProviderRegistry`, `compileProviderSystem`, `resolveProviders`, resolution errors (`UnknownProviderError`, `AmbiguousProviderError`, …) |
| `@ariestools/actor-model` | 2.0.0 | Actor contracts and the installed-actor registry | `ActorParams`, `ActorContext`, `ActorLocator` / `InstanceLocator` / `RawInstanceLocator`, `ActorInstance`, `OrchestratedActor`, `ReadyState`, `InstalledActorDescriptor`, `requireInstalledActor`; type-only `./readiness` subpath |
| `@ariestools/actor` | 2.0.0 | Base classes and in-process orchestration | `Actor`, `PeriodicActor`, `ProviderActor`, `AccountProviderActor`, `Orchestrator`, `bootActors`, `stopOrShutdown`, `createMemoryLocator`, `createProviderActorContext`, `buildFromInstalledCatalog` |
| `@ariestools/actor-engine` | 2.0.0 | The engine | `ActorEngineCatalog`, `createActorEngineProviderRegistry`, `compileActorEngine`, `launchCompiledActorEngine`, `launchActorEngine`, `startActorEngine`, `launchActors`, `parallelActorEngineSupervision`, `sequentialActorEngineSupervision`, `createParallelActorEngineSupervision`, `describeActorEnginePlan`, `renderActorEngineBoot` |
| `@ariestools/actor-system` | 2.0.0 | Deprecated alias: re-exports the engine and adds the `ActorSystem*` names | Same objects as actor-engine. Its README says deprecated; npm carries no deprecation flag |
| `@ariestools/cli-kit` | 2.1.0 | Process lifecycle, exit codes, command catalog | `launchCliSystem`, `launchCompiledCliSystem`, `runCliSystemUntilInterrupt`, `runServiceUntilInterrupt`, `runProcessApplication`, `SYS_EXITS`, `createCommandCatalog`, `CliConfigError` / `CliUsageError` / `CliDataError` |
| `@ariestools/cli-kit-node` | 2.1.0 | Node process host | `nodeProcessHost`, `createNodeProcessHost`, `createNodeProcessHostWithDotEnv`, `readPackageVersion` |
| `@ariestools/cli-kit-yargs` | 2.1.0 | yargs command surface | `runYargsApplication`, `runCatalogApplication`, `configureCliSurface`, `createHelpCommandDefinition` |
| `@ariestools/cli-kit-daemon` | 2.1.0 | Background daemon management | `createDaemonKit`, `allocateFreePort`, `isProcessAlive`, `DAEMON_STATUS_EXIT_CODES`; `./preload` asset |
| `@ariestools/browser-kit` | 2.0.0 | Browser system compile, launch, manifest, realm attach | `BrowserActorCatalog`, `compileBrowserSystem`, `launchCompiledBrowserSystem`, `createBrowserSystemManifest`, `parseBrowserSystemManifest`, `attachBrowserSystem` |
| `@ariestools/browser-kit-page` | 2.0.0 | Page lifecycle | `bindPageLifecycle` |
| `@ariestools/browser-kit-worker` | 2.0.0 | Dedicated and shared workers over `MessagePort` | `bindMessagePortBrowserSystemHost`, `attachMessagePortBrowserSystem`, `bindWorkerShutdown` |
| `@ariestools/browser-kit-service-worker` | 2.0.0 | Service-worker host | `ServiceWorkerSystemHost`, `extendEventLifetime` |
| `@ariestools/browser-kit-plugin` | 2.0.0 | Extension runtime ports | `bindExtensionRuntimeBrowserSystemHost`, `attachExtensionPortBrowserSystem` |

`@ariestools/actor-engine` does not re-export `Actor` or `ProviderActor`; import base classes from `@ariestools/actor` and `NoProviderConnection` from `@ariestools/provider`. Retired names (`@ariestools/actor-cli` 1.3.0 and the `@xyo-network/actor-cli-kit`, `-node` and `-yargs` 4.5.2 shims, all npm-deprecated) are mapped in [migration.md](migration.md).

## Peers and the SDK

| Package | `dependencies` | `peerDependencies` |
|---|---|---|
| `provider-model` | — | `zod ^4.4` |
| `actor-model` | `provider-model` | `@ariestools/sdk ^8.1 \|\| ^9.0`, `@opentelemetry/api ^1.9`, both optional |
| `actor` | `@ariestools/sdk ~9.0.0`, `@ariestools/telemetry ~9.0.0`, `tslib ~2.8.1`, `actor-model`, `provider-model` | `@ariestools/sdk ^8.1 \|\| ^9.0`, `@opentelemetry/api ^1.9`, both required |
| `actor-engine` | `actor`, `actor-model`, `provider`, `provider-model` | `zod ^4.4` |
| `cli-kit` | `actor-system ~2.0.0` | `actor-system ^2.0`, `actor-model ^2.0` |
| `cli-kit-yargs` | `cli-kit ~2.1.0`, `@types/yargs ~17.0.35` | `yargs ^18.2` |
| `browser-kit` | `actor ~2.0.0` | `actor-system`, `actor-model`, `provider`, `provider-model` at `^1.3 \|\| ^2.0`; `zod ^4.6` |

`actor` lists `@ariestools/sdk`, and `cli-kit` lists `@ariestools/actor-system`, in both `dependencies` and `peerDependencies`. That is deplint's `peer-with-default` placement (see [xy-toolchain commands](../xy-toolchain/commands.md#xy-deplint-package)): the dependency is the default install, and pnpm satisfies the peer from your tree when it can. In cli-kit's own lockfile, `actor` 2.0.0 resolves against SDK 8.1.8 and no SDK 9 is installed.

The qualified SDK lines are 8.1 (8.1.8), 8.3 (8.3.0) and 9.0 (9.0.0). The peer range also admits 8.2, which is not qualified. `actor` always installs `@ariestools/telemetry` ~9.0.x, so an SDK 8 app carries two telemetry copies (8.x through the SDK, 9.0.x through `actor`).

- Declare `@ariestools/sdk` yourself (`~9.0` for new work) and keep exactly one copy: `pnpm why @ariestools/sdk`.
- Install `zod` (^4.6 satisfies every peer here) and `@opentelemetry/api` as [ariestools-sdk](../ariestools-sdk/overview.md#peers-and-side-dependencies) describes.

## Runtime floors

| Packages | Declared `engines.node` | What applies |
|---|---|---|
| `provider-model`, `provider`, `actor-model`, `actor`, `actor-engine`, `actor-system` | `>=18` | Misleading. The published code calls `Iterator#toArray`, `Set#union`, `Promise.withResolvers` and `toSorted` / `toReversed` (Node 22+). `actor` installs `@ariestools/telemetry` 9.0.x (`>=26`), and the default SDK 9 declares `>=26` |
| `cli-kit`, `cli-kit-node`, `cli-kit-yargs`, `browser-kit` and its four adapters | `>=26` | As declared |
| `cli-kit-daemon` | `>=26.9.0` | Uses `node:ffi`, on by default from 26.9. macOS and Linux on arm64/x64 only; Windows daemon management is refused |

Treat Node 26 as the family floor (26.9 for daemons). The repositories pin Volta 26.8.2 (actor-kit) and 26.9.0 (cli-kit, browser-kit). Engines are advisory unless the consuming repo enforces them; see the [ariestools-sdk runtime baseline](../ariestools-sdk/overview.md#runtime-baseline).

## Install

**Engine or domain package** (actors, providers, catalogs):

```sh
pnpm add @ariestools/actor @ariestools/actor-engine @ariestools/sdk zod @opentelemetry/api
pnpm add -D tslib  # decorators such as @creatable() with importHelpers
```

Add `@ariestools/provider-model`, `@ariestools/provider` and `@ariestools/actor-model` when you import them; deplint flags undeclared imports.

**CLI host:** the above, plus the cli-kit packages and their peers. Add `@ariestools/cli-kit-daemon` only for daemons.

```sh
pnpm add @ariestools/cli-kit @ariestools/cli-kit-node @ariestools/cli-kit-yargs yargs @ariestools/actor-system @ariestools/actor-model
pnpm add -D @types/yargs  # yargs 18 ships no types
```

**Browser host:** the engine install (its `zod` must be ^4.6), plus browser-kit, the realm adapters you use, and its peers.

```sh
pnpm add @ariestools/browser-kit @ariestools/browser-kit-page @ariestools/browser-kit-worker @ariestools/actor-system @ariestools/actor-model @ariestools/provider @ariestools/provider-model
```

Install the whole 2.x family. browser-kit's peer range admits `actor-system` 1.3, but browser-kit depends on `actor` ~2.0.0, so mixing would load two actor families.

## Imports

- Import SDK symbols (`creatable`, `CreatableName`, `initDefaultLogger`) from the root `@ariestools/sdk`. `Actor` extends the root's `AbstractCreatable`, and a subpath copy is a different class; see [ariestools-sdk import style](../ariestools-sdk/conventions.md#import-style).
- Write new code against actor-engine names, even beside host kits that still import the `@ariestools/actor-system` alias ([host kits still on actor-system](migration.md#host-kits-still-on-actor-system)). Keep one `actor-engine` 2.0.x copy in the lockfile.
- `@creatable()` and other decorators need `tslib` resolvable; see [xy-toolchain TypeScript](../xy-toolchain/typescript.md#understand-the-base-config).
- Engine-launched actors get no logger, meter or tracer unless you supply one; see [engine.md](engine.md#logging-and-telemetry).

## What this skill does not cover

- **SDK utilities, build and React.** `@ariestools/sdk` belongs to [ariestools-sdk](../ariestools-sdk/SKILL.md). Build, lint, deplint, Vitest and Chromium belong to [xy-toolchain](../xy-toolchain/SKILL.md), including bin and library roles ([project-profiles.md](../xy-toolchain/project-profiles.md#package-roles-and-dependency-policy)) and test setup ([testing.md](../xy-toolchain/testing.md)). `@ariestools/sdk-react*` belongs to [ariestools-sdk-react](../ariestools-sdk-react/SKILL.md).
- **XL1 and chain specializations** (chain locator wiring, `ChainActor`, wallet resolution, `@xyo-network/xl1-browser-system`, dapp-kit) stay domain-side in the [xyo-skills](https://github.com/XYOracleNetwork/xyo-skills/blob/main/skills/xl1-knowledge/gateway-browser.md) pack. `@xyo-network/chain-actor-model`, which actor-kit's docs name as their home, is not on npm.
- **`@ariestools/cli`** is the `aries` operator CLI, not a kit. It is UNLICENSED, exposes only a `./datalake` client as a library, and bundles cli-kit and actor rather than depending on them. You meet it when XL1 local chain and datalake tests run `pnpm add -D @ariestools/cli`; see [xyo-skills local chain and datalake](https://github.com/XYOracleNetwork/xyo-skills/blob/main/skills/xl1-testing/local-chain-datalake.md) and `aries --help`.
- **Stale upstream docs.** Several upstream READMEs and actor-kit's `ARCHITECTURE.md` lag the code: the host-kit READMEs use `ActorSystem*` names, actor-kit's README names a Node version below its pin, and `ARCHITECTURE.md` promises `runActorsService`, `runActorOnce` and `buildCatalogActors` in cli-kit, which has none of them. When a README disagrees with this skill, trust this skill and the shipped `.d.ts` files.
