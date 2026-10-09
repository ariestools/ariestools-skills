# Migration

Move the actor family and both host kits to 2.x in one change, because a 1.x host kit next to actor-kit 2.0 pulls in a second engine. actor-kit's ARCHITECTURE.md says three `@ariestools/actor-cli` helpers moved to cli-kit; none shipped there, so use the replacements below.

## Version map

| Release | Engine | Dependencies and peers | `engines.node` |
|---|---|---|---|
| actor-kit 1.3.0 | `@ariestools/actor-system` is the engine | `actor` depends on `@ariestools/sdk` and `@ariestools/telemetry` ~8.1.8; peer SDK ^8.1 | `>=18` |
| actor-kit 2.0.0 | `@ariestools/actor-engine`, first published at 2.0.0; `actor-system` 2.0.0 is an alias that depends on it | `actor` depends on SDK and telemetry ~9.0.0; peer SDK `^8.1 \|\| ^9.0` | `>=18` declared, Node 26 in practice |
| cli-kit 1.2.3 | actor-system 1.3 | Depends on `actor-system` ~1.3.0; peers `actor-system` and `actor-model` ^1.3 | `>=24` |
| cli-kit 2.0.x, 2.1.0 | actor-system 2.0 alias | Depends on `actor-system` ~2.0.0; peers `actor-system` and `actor-model` ^2.0 | `>=26`; `cli-kit-daemon` 2.1.0 `>=26.9.0` |
| browser-kit 1.1.0 | actor-system 1.3 | Depends on `actor` ~1.3.0; peers `actor-system`, `actor-model`, `provider`, `provider-model` ^1.3 and `zod` ^4.4 | `>=18` |
| browser-kit 2.0.0 | actor-system 2.0 alias | Depends on `actor` ~2.0.0; the same peers admit `^1.3 \|\| ^2.0`; `zod` ^4.6 | `>=26` |
| `@ariestools/actor-cli` 1.3.0 (deprecated) | actor-system 1.3 | Depends on `actor` ~1.3.0; peer `@ariestools/cli-kit` ^1.2, so it cannot pair with cli-kit 2 | `>=24` |

- browser-kit 2.0.0's peers still admit the 1.3 family; install the whole 2.x family anyway ([install](overview.md#install)).
- actor 2.0 accepts an SDK 8 peer, yet always installs `@ariestools/telemetry` 9.0.x, which needs Node 26, so an SDK 8 app carries two telemetry versions. Move the app to `@ariestools/sdk` 9 in the same change ([runtime floors](overview.md#runtime-floors)).
- No exported name was removed from cli-kit or browser-kit between 1.x and 2.x. cli-kit 2.0 changes its actor-system peer and Node floor. 2.1.0 adds the optional third argument of `runCliSystemUntilInterrupt` (`{ shutdownTimeoutMs }`), so examples that pass it need 2.1.0. browser-kit 2.0.0 adds `startBrowserSystem`, carries declared optional dependencies across realms and needs `zod` ^4.6.

## actor-system to actor-engine

1. Rename symbols. `ActorSystem*` becomes `ActorEngine*`, `actorSystem*` becomes `actorEngine*`, and infix forms follow (`compileActorSystem` → `compileActorEngine`, `CompileActorSystemOptions` → `CompileActorEngineOptions`, `provisionMemoryActorSystem` → `provisionMemoryActorEngine`, `isFailableActorSystemActor` → `isFailableActorEngineActor`).
2. Swap the specifier to `@ariestools/actor-engine` and the dependency in each domain package:

```sh
pnpm remove @ariestools/actor-system
pnpm add @ariestools/actor-engine
```

While the alias is installed, both spellings resolve from it, so the rename and the swap can land as separate commits.

| Before | After |
|---|---|
| `launchActorSystem` | `launchActorEngine` |
| `startActorSystem` | `startActorEngine` |
| `createActorSystemDependencyScope` | `createActorEngineDependencyScope` |
| `describeActorSystemPlan` | `describeActorEnginePlan` |
| `renderActorSystemBoot` | `renderActorEngineBoot` |
| `compileActorSystem` | `compileActorEngine` |
| `launchCompiledActorSystem` | `launchCompiledActorEngine` |
| `ActorSystemActor` | `ActorEngineActor` |
| `ActorSystemCatalog` | `ActorEngineCatalog` |
| `ActorSystemSession` | `ActorEngineSession` |
| `parallelActorSystemSupervision` | `parallelActorEngineSupervision` |
| `sequentialActorSystemSupervision` | `sequentialActorEngineSupervision` |

- The alias re-exports the whole engine and adds about 90 `ActorSystem*` spellings, so every 1.3 name still resolves. It also spells names that 1.3 never had, such as `startActorSystem` and `ActorSystemDependencyAccessError`. Its `dist/neutral/index.d.ts` in `node_modules` is the complete list.
- Wire codes keep their pre-rename values: `ActorEngineTerminalFailureCode` is `'actor-system.terminal-failure'` and `ActorEngineBootInterruptedError` has code `'actor-system.boot-interrupted'`. Leave string matches on them alone.
- The alias has no launcher, resolver or supervisor of its own, and it will be removed in the next major. Its README and package description call it deprecated, but npm does not flag it, so installs print no warning.

## Host kits still on actor-system

cli-kit 2.1.0 and browser-kit 2.0.0 import `@ariestools/actor-system`, peer on it, and use its names in their types and READMEs: `CliSystemSession` is `ActorSystemSession`, `CliSystemActor` is `ActorSystemActor`, and `BrowserActorCatalog` extends `ActorSystemCatalog`.

- Keep `@ariestools/actor-system` 2.0 declared in any package that installs a host kit. cli-kit also depends on it; browser-kit only peers on it.
- Write new code with engine names and pass the results to the kits. The alias exports the same runtime objects (`ActorSystemCatalog === ActorEngineCatalog`), so engine-named values typecheck where a kit asks for an actor-system name.
- Keep one engine: `pnpm why @ariestools/actor-engine` should show a single 2.0.x version.
- Expect host-kit releases when the alias is removed.

## Behavior changes in 2.0

- **Declared access is enforced.** Provider factories and actors get a locator scoped to their declared `dependencies` and `optionalDependencies`. Any other moniker throws `ActorEngineDependencyAccessError` with code `'dependency-undeclared'`, from `tryGetInstance` as well as `getInstance` ([providers](providers.md)).
- **Optional dependencies compile.** `optionalDependencies` on provider and actor descriptors become part of the plan.
- **Scopes close.** When a resident actor's `whenStopped()` settles, its scope is revoked and later lookups fail with `'dependency-scope-closed'`; a one-shot actor's scope closes after `runToCompletion()`. The `requireResidentTerminationSignals` launch option rejects resident actors that lack `whenStopped()`.
- **Boot diagnostics.** `startActorEngine` returns a boot handle before compiling and records resource acquisition and rollback. `describeActorEnginePlan` describes the dependency graph, and `renderActorEngineBoot` renders a boot snapshot as `'text'`, `'tree'` or `'json'` ([engine](engine.md)).
- **Caller-built actors.** `launchActors` supervises actors the host constructed, and `createParallelActorEngineSupervision({ orchestrator })` supervises on an orchestrator the caller owns.
- **SDK 9 by default.** actor depends on SDK and telemetry 9.0, which need Node 26.

Unchanged: the engine still accepts `name` as a deprecated alias for `type` on selections and descriptors, but browser-kit's strict selection schema requires `type`. The default provisioner still gives actors an empty context, with no logger, meter or tracer ([logging and telemetry](engine.md#logging-and-telemetry)).

## Retiring `@ariestools/actor-cli`

`@ariestools/actor-cli` 1.3.0 is npm-deprecated with a generic notice that names no replacement. Its exports map as follows; cli-kit 2.1.0 contains none of them.

| 1.3.0 export | Use in 2.x |
|---|---|
| `startActorsOnOrchestrator` | `launchActors(actors)`, which supervises in parallel by default. Pass `supervision: createParallelActorEngineSupervision({ orchestrator })` when the caller owns the orchestrator |
| `runActorsService` | Caller-built actors: `launchActors(actors, { readyTimeoutMs, supervision: sequentialActorEngineSupervision })`, then `runCliSystemUntilInterrupt(host, session)`. Config-driven: `launchCliSystem`, then `runCliSystemUntilInterrupt`. Its old `supervisor: 'parallel'` is `parallelActorEngineSupervision`. Run former `onReady` work after the launch resolves |
| `runActorOnce` | Inside a command run by `runProcessApplication` or `runCatalogApplication` with `mapFailureToExitCode: createSysExitFailureMapper()`, call `await actor.runOnce()` (`PeriodicActor`) or `await actor.runToCompletion()` (`ProviderActor`). A normal return exits 0, and a throw maps to `software` (70). For config-driven one-shots, set `runMode: 'one-shot'` on the descriptor, and the launch runs `runToCompletion()` before resolving |
| `buildCatalogActors`, `cleanupConstructedActors`, `throwWithActorCleanupFailures` | Prefer an `ActorEngineCatalog` with `launchCliSystem`, where the engine builds actors and rolls back failures. For hand-built actors, `bootActors([{ create }])` from `@ariestools/actor` creates and starts them in order with reverse-order rollback, and `stopOrShutdown` stops one with shutdown fallback. cli-kit's `createActorBuilderCatalog` builds one name at a time and does no cleanup |
| `isFailableServiceActor` | `isFailableActorEngineActor` |
| Types such as `ServiceActor` and `BootableOrchestrator` | `ActorEngineActor`, `LaunchActorsOptions` and `ActorEngineOrchestrator` from `@ariestools/actor-engine` |

```ts
import type { ActorEngineActor } from '@ariestools/actor-engine'
import { launchActors, sequentialActorEngineSupervision } from '@ariestools/actor-engine'
import { runCliSystemUntilInterrupt } from '@ariestools/cli-kit'
import { nodeProcessHost } from '@ariestools/cli-kit-node'

declare const actors: readonly ActorEngineActor[]
const fleet = await launchActors(actors, { readyTimeoutMs: 30_000, supervision: sequentialActorEngineSupervision })
// former onReady work goes here
await runCliSystemUntilInterrupt(nodeProcessHost, fleet)
```

`PeriodicActor`'s doc comment still mentions `runActorOnce`, which no 2.x package exports. See [CLI hosts](cli.md) for process hosts and exit codes.

## `@xyo-network/actor-cli-kit*` shims

`@xyo-network/actor-cli-kit`, `-node` and `-yargs` 4.5.2 are npm-deprecated re-export shims that pin `@ariestools/cli-kit*` ~1.0.0; there is no daemon shim. The kits have published under `@ariestools` since 1.0.0.

| Deprecated | Use |
|---|---|
| `@xyo-network/actor-cli-kit` | `@ariestools/cli-kit` |
| `@xyo-network/actor-cli-kit-node` | `@ariestools/cli-kit-node` |
| `@xyo-network/actor-cli-kit-yargs` | `@ariestools/cli-kit-yargs` |

Swap the package and the import specifier. No exported name was removed between 1.0 and 2.1, so the rename is mechanical; then upgrade to 2.x as above.

## Checklist

1. Bump the actor family and the host kits together to 2.x (actor-kit 2.0.0, cli-kit 2.1.0, browser-kit 2.0.0), with `@ariestools/sdk` 9.
2. Run on Node 26, or 26.9.0 with `cli-kit-daemon` ([runtime floors](overview.md#runtime-floors)).
3. Swap `actor-system` for `actor-engine` in domain packages, keep `actor-system` beside the host kits, and confirm one engine copy.
4. Declare every moniker an actor or provider looks up in `dependencies`, and move monikers that may be absent to `optionalDependencies`.
5. Replace `@ariestools/actor-cli` helpers and `@xyo-network/actor-cli-kit*` imports using the tables above.
6. Run `pnpm xy build` and `pnpm xy test` ([lifecycle gates](../xy-toolchain/commands.md#lifecycle-gates)); [deplint](../xy-toolchain/commands.md#xy-deplint-package) checks that the declarations match the new imports.
