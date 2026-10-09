# CLI hosts (cli-kit)

[`ariestools/cli-kit`](https://github.com/ariestools/cli-kit) is the process boundary for command-line apps and long-running Node services built on actors. Resolution, construction and supervision policies come from the [engine](engine.md); cli-kit picks the sequential default, joins the process interrupt, maps failures to exit codes and drives yargs. Each package ships its README in `node_modules`, but those READMEs use `ActorSystem*` names.

## Packages

| Package | Provides | Notes |
|---|---|---|
| `@ariestools/cli-kit` | Process boundary, CLI launch facade, `SYS_EXITS`, command and actor-builder catalogs, interrupt joins, service helpers | Depends on `@ariestools/actor-system` ~2.0.0; peers `actor-system` ^2.0 and `actor-model` ^2.0 |
| `@ariestools/cli-kit-node` | Node `ProcessHost`, dotenv helpers, `readPackageVersion` | `cli-kit` |
| `@ariestools/cli-kit-yargs` | yargs adapter, command surface, environment-to-config | Peer `yargs` ^18.2 |
| `@ariestools/cli-kit-daemon` | Local daemon lifecycle (`createDaemonKit`) | `engines.node >=26.9.0` (`node:ffi`) |

All four are 2.1.0; the other three declare `engines.node >=26` ([runtime floors](overview.md#runtime-floors)). Install `cli-kit`, `cli-kit-node`, `cli-kit-yargs` and `yargs` together, plus `@types/yargs` as a devDependency (yargs 18 ships no types), and add `cli-kit-daemon` only for a background daemon. cli-kit 2.x is typed against actor-system names (`CliSystemActor` is `ActorSystemActor`), and engine-named values typecheck against them ([host kits still on actor-system](migration.md#host-kits-still-on-actor-system)).

## Config-driven systems

- `launchCliSystem(options)` and `launchCompiledCliSystem({ actorRegistry, compiled })` are `launchActorEngine` and `launchCompiledActorEngine` with `sequentialActorEngineSupervision` as the default: actors start one at a time in registration order, their warm passes then run together and readiness is joined in that order under one `readyTimeoutMs`, and stop runs in reverse. A later actor does not wait for an earlier one to become ready. Pass `supervision` to override it; provider resolution is unchanged.
- `runCliSystemUntilInterrupt(host, session, options?)` races the first process interrupt against the session's resident terminal failure (`session.whenFailed()`) and stops the session exactly once. An actor failure is rethrown after cleanup, so the exit mapper keeps domain codes; a stop that also fails yields an `AggregateError`.
- Engine-launched actors get no logger, meter or tracer by default. `createProcessIoLogger(host.io, { isVerbose })` returns an SDK-`Logger`-compatible logger over the host; wire it in as [logging and telemetry](engine.md#logging-and-telemetry) describes.

```ts
import { ActorEngineCatalog, createActorEngineProviderRegistry } from '@ariestools/actor-engine'
import { launchCliSystem, runCliSystemUntilInterrupt } from '@ariestools/cli-kit'
import { nodeProcessHost } from '@ariestools/cli-kit-node'

const actorRegistry = new ActorEngineCatalog()
const providerRegistry = createActorEngineProviderRegistry()
// register actors and providers, and load `config` (see engine.md)

const session = await launchCliSystem({ actorRegistry, config, providerRegistry })
await runCliSystemUntilInterrupt(nodeProcessHost, session, { shutdownTimeoutMs: 30_000 })
```

## Caller-built actors

When the host constructs the actors itself, call `launchActors(actors, { readyTimeoutMs, supervision: sequentialActorEngineSupervision })` from `@ariestools/actor-engine`, then `runCliSystemUntilInterrupt(host, session)`. The returned `LaunchedActorsSession` satisfies the join's `Pick<…, 'stop' | 'whenFailed'>` parameter. `launchActors` defaults to parallel supervision and rejects an empty list, so pass the sequential policy for CLI boot order. This pairing is the shipped replacement for the retired actor-cli `runActorsService` ([migration](migration.md)). `ActorSupervisor` still coordinates hand-assembled `ManagedActor` objects whose `start`/`stop` may be synchronous; new code uses `launchActors`.

## Process boundary

- `ProcessHost` is `{ argv, environment, io, isDevelopment, exit(code), onInterrupt(listener) }`. `io` has `log`, `warn`, `error`, `question(prompt)`, `isInteractive` and an optional `columns`; `onInterrupt` returns a disposer.
- `runProcessApplication({ application, host, mapFailureToExitCode? })` returns normally on success and absorbs `ProcessExitError`. Any other failure is printed only when `host.isDevelopment`, then `host.exit` receives the mapper's code for origin `'handler'`. A missing mapper, `undefined`, a thrown mapper, or a code outside the integers 0–255 gives 1. In production a failure outside yargs exits silently, so print operator-facing errors yourself.
- `exitProcess(host, code)` calls `host.exit` and then throws `ProcessExitError`, so a recording test host also stops control flow.

## Exit codes

| `SYS_EXITS` key | Code | Meaning |
|---|---|---|
| `ok` | 0 | Success |
| `usage` | 64 | Bad arguments or flags |
| `dataErr` | 65 | Input data was incorrect |
| `noInput` | 66 | Input file missing or unreadable |
| `software` | 70 | Internal failure |
| `ioErr` | 74 | File I/O error |
| `config` | 78 | Misconfiguration |

`createSysExitFailureMapper({ usage?, config?, dataErr?, fallback? })` builds the shared ladder: parse origin → 64; `CliUsageError` → 64; `CliConfigError` → 78; `CliDataError` → 65; anything else → `fallback` (default `software`, 70). The options enroll extra app error classes per bucket. Matching is by `instanceof`, so subclasses need no enrollment, and an error that matches several buckets is checked in the order usage, config, dataErr. `describeError(error)` renders a one-line message plus up to four `cause` links joined by ` ← `.

Interrupt codes need a host with `exit`: inside a join, a second interrupt exits 130 (`INTERRUPT_EXIT_CODE`) and an expired cleanup watchdog exits 1. A host without `exit` rejects with `InterruptJoinEscalationError` instead.

## Yargs surface

- `runCatalogApplication({ catalog, context: { host }, mapFailureToExitCode, onFailure?, surface })`, where `surface` is `{ scriptName, usage, version, environmentConfig?, demandCommandMessage?, customize? }`. Parse failures print the usage block; handler failures print the raw error with its stack.
- `createCommandCatalog<CliApplicationContext, CommandModule>([...])` (from `cli-kit`) takes ordered `{ id, create(context) }` entries. Ids must be unique and non-empty, and they are registration identities, not command syntax.
- `createHelpCommandDefinition(helpText)` registers `help`. `createDefaultHelpCommandDefinition(helpText)` makes a bare `$0` invocation print help at exit 0; do not combine it with `demandCommandMessage`, which makes a bare invocation a usage error (64).
- `configureCliSurface(parser, options)` applies the script name, usage, the repeated-option policy (scalars are last-wins, while `array` options and variadic positionals keep every value), environment config, `customize`, commands, `rejectUnknownCommands`, `strictOptions()`, help (`-h`), version and wrap. Do not set `duplicate-arguments-array` in `customize`.
- `environmentToYargsConfig(env, prefix | prefixes, { allowedKeys })` maps `APP_RPC_URL` to `rpcUrl` (`__` nests) and gives the first prefix precedence per key. `configureCommandEnvironment(parser, { allowedKeys, environment, prefix })` (since 2.1.0) applies it inside one leaf builder, keeping other commands' keys out of strict validation. Use the root `environmentConfig` only for options every command declares.
- `runYargsApplication({ configure, host, mapFailureToExitCode?, onFailure? })` runs a hand-assembled parser. `withRepeatableOptions`, `withDeprecationWarning`, `coerceIndexedArrayOption` and `omitArgvKeys` cover the remaining cases.

## Long-running services

- `runServiceUntilInterrupt(host, stop, options?)` waits for the first interrupt, then awaits one `stop()`; a failed stop rejects into the exit mapper.
- Since 2.1.0, both join helpers take `InterruptJoinOptions { shutdownTimeoutMs, exitHost }`. The watchdog defaults to 15 s, `0` disables it, and values outside 0–2147483647 ms are rejected. 2.0.x joins took no options and had no watchdog.
- `installRuntimeInterruptController({ host, startupTimeoutMs? })` sets the run-wide policy: the first interrupt during startup aborts `signal` and arms a 10 s timer, a second exits 130, and `adoptSession()` hands the first interrupt to a session.
- `handleRuntimeInterrupt(host, logger, session, options?)` stops under a watchdog with an awaited `onBeforeStop` hook and exits 0 (clean) or 1; `resolveShutdownTimeoutMs` reads the override, then an environment variable, then the default.
- `GlobalErrorEscalation` turns a fatal out-of-band signal into stop-then-exit-1; `arm()` it during startup and `activate()` it after.
- `stopUniqueResource(value, stopped)` tears a resource down once, preferring `stop`, then `destroy`, then `shutdown`.
- `redactConfig(config)` replaces secret-named keys with `[REDACTED]`; since 2.1.0 it also strips URL userinfo through `redactUrlCredentials`.
- `formatStartupBanner({ title, version, actors })` renders the startup banner.

## Node host

`nodeProcessHost` is a shared instance bound to SIGINT and SIGTERM, and its `isDevelopment` is `NODE_ENV === 'development'`. `createNodeProcessHost({ signals, environment, environmentDefaults })` changes the signals (`SIGUSR1` is excluded) or the environment layers. `createNodeProcessHostWithDotEnv({ path?, cwd? })` reads `.env` once as defaults under the real environment. `loadDotEnvFile` (a missing file gives `{}`), `parseDotEnv` and `mergeEnvironments` never mutate `process.env`. `readPackageVersion(import.meta.url)` walks up to the owning `package.json`, so `--version` is right from `src/` and from `dist/`.

## Daemons

`createDaemonKit({ bin, dirName, displayName, health, homeDir, host, baseUrl })` returns `up`, `down`, `status`, `logs` and `reset`, plus `readState`, `writeState` and `clearState`. `status()` returns a report whose `exitCode` is 0 (healthy), 2 (alive but unresponsive) or 3 (not running), from `DAEMON_STATUS_EXIT_CODES`; the caller keeps exit authority. Daemon management needs Node >=26.9 with `node:ffi` on macOS or Linux, and Windows is refused. A bundled bin that does not install the package must copy the `@ariestools/cli-kit-daemon/preload` asset and set `bin.preloadPath` to its absolute path.

## Reference application shell

A cli-kit bin package has this shape:

- `bin/<name>.mjs` is a thin launcher: `runProcessApplication`, `createNodeProcessHost({ signals: ['SIGINT', 'SIGTERM'] })`, `readPackageVersion(import.meta.url)`, and the compiled `runCli` and mapper from `dist/`.
- `src/cli/runCli.ts` calls `runCatalogApplication` with a catalog of `createHelpCommandDefinition` plus a `$0` command.
- The mapper is `createSysExitFailureMapper()`, passed to both runners; app errors subclass `CliConfigError` or `CliUsageError`.
- Operator errors print `describeError` and call `exitProcess` with the mapped code instead of a stack trace.

```ts
import type { CliApplicationContext, ProcessHost } from '@ariestools/cli-kit'
import {
  CliConfigError, createCommandCatalog, createSysExitFailureMapper, describeError,
  exitProcess, runProcessApplication, SYS_EXITS,
} from '@ariestools/cli-kit'
import { createNodeProcessHost, readPackageVersion } from '@ariestools/cli-kit-node'
import { createHelpCommandDefinition, runCatalogApplication } from '@ariestools/cli-kit-yargs'
import type { CommandModule } from 'yargs'

export class AppConfigError extends CliConfigError {}
export const mapFailure = createSysExitFailureMapper()

const HELP = 'Usage: my-cli [options]'
const catalog = createCommandCatalog<CliApplicationContext, CommandModule>([
  createHelpCommandDefinition(HELP),
  {
    create: ({ host }) => ({
      command: '$0',
      describe: 'Run once',
      handler: async () => {
        try {
          await runOnce(host) // app code; throws AppConfigError on bad input
        } catch (error) {
          host.io.error(`my-cli: ${describeError(error)}`)
          exitProcess(host, mapFailure(error, 'handler') ?? SYS_EXITS.software)
        }
      },
    }),
    id: '$0',
  },
])

export async function runCli(host: ProcessHost, version: string): Promise<void> {
  await runCatalogApplication({
    catalog, context: { host }, mapFailureToExitCode: mapFailure,
    surface: { scriptName: 'my-cli', usage: HELP, version },
  })
}

// bin/my-cli.mjs, importing runCli and mapFailure from dist/
await runProcessApplication({
  application: async host => await runCli(host, readPackageVersion(import.meta.url)),
  host: createNodeProcessHost({ signals: ['SIGINT', 'SIGTERM'] }),
  mapFailureToExitCode: mapFailure,
})
```

## Packaging

Declare `bin`. The deplint role is `cli`, or `library/cli` when the package also exports an importable API; see [package roles](../xy-toolchain/project-profiles.md#package-roles-and-dependency-policy).

`@ariestools/cli` (the `aries` operator CLI) is a product built with cli-kit, not part of this kit; see [what this skill does not cover](overview.md#what-this-skill-does-not-cover).
