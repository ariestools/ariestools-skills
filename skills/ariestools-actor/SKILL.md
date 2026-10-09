---
name: ariestools-actor
description: "Aries Tools actor-kit and its host kits: @ariestools/actor, actor-model, actor-engine, provider and provider-model (plus the deprecated actor-system alias), @ariestools/cli-kit (-node, -yargs, -daemon) and @ariestools/browser-kit (-page, -worker, -service-worker, -plugin). Covers Actor, PeriodicActor and ProviderActor lifecycles, provider descriptors, monikers and bindings, compiling, launching and supervising an actor engine, cli-kit process shells and SYS_EXITS exit codes, and browser-kit realms. Use when writing actors or actor-engine providers, hosting them with cli-kit or browser-kit, or migrating from actor-system, @ariestools/actor-cli or the @xyo-network/actor-cli-kit shims."
metadata:
  version: 0.1.6 # x-release-please-version
---

# Aries Tools Actors

**Authority.** This skill is maintained only in [`ariestools/ariestools-skills`](https://github.com/ariestools/ariestools-skills); edit there, not in installed copies.

**Versions.** Verified against actor-kit 2.0.0 (`@ariestools/actor`, `actor-model`, `actor-engine`, `actor-system`, `provider`, `provider-model`), `@ariestools/cli-kit` 2.1.0 and `@ariestools/browser-kit` 2.0.0, with `@ariestools/sdk` 9.0.1. The sources are the private [`ariestools/actor-kit`](https://github.com/ariestools/actor-kit), [`ariestools/cli-kit`](https://github.com/ariestools/cli-kit) and [`ariestools/browser-kit`](https://github.com/ariestools/browser-kit) repositories; their READMEs lag the code ([stale upstream docs](overview.md#what-this-skill-does-not-cover)).

**Skill identity.** When you present a plan, an acknowledgement, or a completion summary, state which skills informed it as `ariestools-actor v<version>`, and list each other active skill from this pack the same way. Read the version from this file's `metadata.version`, never from an example.

**Scope.** The six actor-kit packages, the four `@ariestools/cli-kit*` packages and the five `@ariestools/browser-kit*` packages, plus migration from `@ariestools/actor-system`, host-kit 1.x, the retired `@ariestools/actor-cli` and the npm-deprecated `@xyo-network/actor-cli-kit*` shims. Not covered: `@ariestools/sdk` utilities and their peers ([ariestools-sdk](../ariestools-sdk/SKILL.md)); build, lint, deplint, Vitest and Chromium setup ([xy-toolchain](../xy-toolchain/SKILL.md)); React UI on `@ariestools/sdk-react*` ([ariestools-sdk-react](../ariestools-sdk-react/SKILL.md)); and XL1 specializations such as chain locator wiring, `ChainActor`, wallet resolution and `@xyo-network/xl1-browser-system` ([xyo-skills](https://github.com/XYOracleNetwork/xyo-skills/blob/main/skills/xl1-knowledge/gateway-browser.md)).

`@ariestools/cli`, the `aries` operator CLI, is a product built with cli-kit, not a kit, and is out of scope: see [what this skill does not cover](overview.md#what-this-skill-does-not-cover) and `aries --help`.

**Model.** One host-agnostic engine, `@ariestools/actor-engine`, compiles config, resolves one provider graph, constructs actors and supervises them. Domain code depends on `@ariestools/actor` and `@ariestools/actor-engine`, never on a host kit. cli-kit adds the Node process boundary and makes supervision sequential; browser-kit adds realm boundaries and keeps the engine's parallel default. Both 2.x host kits still need the deprecated `@ariestools/actor-system` alias beside them ([host kits still on actor-system](migration.md#host-kits-still-on-actor-system)).

**Traps.**

- Create actors with `await X.create(params)` under `@creatable()`; `new` throws. `name` is the branded `CreatableName`, so cast it (`'heartbeat' as CreatableName`).
- Engine-launched actors get no logger, meter or tracer by default, and `AccountProviderActor` throws without a logger. Supply a `locatorContext` through the provisioner ([logging and telemetry](engine.md#logging-and-telemetry)).
- `@ariestools/actor-engine` does not re-export the actor classes: import `Actor`, `PeriodicActor` and `ProviderActor` from `@ariestools/actor`, and `NoProviderConnection` from `@ariestools/provider`.
- A lookup of a moniker the actor or provider did not declare throws `ActorEngineDependencyAccessError`, and `tryGetInstance` does not bypass the check.
- A compiled engine or browser system holds factories and never crosses a realm; only a `BrowserSystemManifest` does.

**Runtime.** Treat Node 26 as the floor for the whole family (26.9 for `@ariestools/cli-kit-daemon`); actor-kit's declared `>=18` understates it ([runtime floors](overview.md#runtime-floors)).

This skill builds on [xy-development](../xy-development/SKILL.md), [xy-toolchain](../xy-toolchain/SKILL.md) and [ariestools-sdk](../ariestools-sdk/SKILL.md). Load only the reference needed for the task:

## References

### [Overview, packages and install](overview.md)

Read first when choosing which actor-kit, cli-kit or browser-kit packages a package needs or which package exports a name; installing the 2.x family with its peers (`@ariestools/sdk`, `zod`, `@opentelemetry/api`, and `yargs` for cli-kit-yargs) while keeping one copy of the SDK and of the engine; checking the [runtime floors](overview.md#runtime-floors); judging whether an upstream README is stale; or deciding whether a topic belongs to another skill.

### [Actors](actors.md)

Read when writing an `Actor`, `PeriodicActor`, `ProviderActor` or `AccountProviderActor`: creating one with `await X.create()` under `@creatable()`, overriding `startHandler` / `stopHandler`, registering timers, implementing `runPass` or `run` and readiness, choosing a trigger (`runOnce`, `runToCompletion`, `wake` or scheduling), handling fatal errors and `maxConsecutiveFailures`, recording metrics and spans, or booting and stopping actors without an engine (`createMemoryLocator`, `bootActors`, `stopOrShutdown`, the installed-actor catalog).

### [Providers and resolution](providers.md)

Read when defining a `Provider` and its moniker; writing a provider descriptor (`monikers`, `connectionTypes` such as `NoProviderConnection`, `dependencies`) and its engine `create` / `dispose` factory; binding monikers to connections or pinned providers in config; declaring optional dependencies; or diagnosing a resolution error (`UnboundProviderError`, `AmbiguousProviderError`, …) or an `ActorEngineDependencyAccessError` from an undeclared lookup.

### [Actor engine](engine.md)

Read when registering actors in an `ActorEngineCatalog`; compiling config with `compileActorEngine` and describing the plan with `describeActorEnginePlan`; launching with `launchActorEngine`, `launchCompiledActorEngine` or, for actors the host built, `launchActors`; running one-shot actors (`runMode: 'one-shot'`); choosing parallel or sequential supervision; handling `whenTerminal()` failures and session stop; tracing boot with `startActorEngine` and `renderActorEngineBoot`; writing a custom provisioner; or giving engine-launched actors the logger, meter and tracer they lack by default ([logging and telemetry](engine.md#logging-and-telemetry)).

### [CLI hosts (cli-kit)](cli.md)

Read when running an engine in a Node command-line or service process: `launchCliSystem` and `runCliSystemUntilInterrupt`, process hosts from `@ariestools/cli-kit-node`, `runProcessApplication` and `SYS_EXITS` exit codes from `createSysExitFailureMapper` and `CliConfigError`, yargs command catalogs with `@ariestools/cli-kit-yargs`, long-running service helpers, local daemons with `createDaemonKit` from `@ariestools/cli-kit-daemon`, or shaping a bin package and its launcher.

### [Browser hosts (browser-kit)](browser.md)

Read when hosting actors in a browser: `BrowserActorCatalog`, `BrowserSystemConfig`, `compileBrowserSystem` and `launchCompiledBrowserSystem` in the owner realm, assigning actors to realms with `host`, page lifecycle, dedicated or shared workers over a `MessagePort`, service workers, extension background and port realms with an `authorize` callback, typed provider proxies, the realm security boundary, testing realm code, or why only a `BrowserSystemManifest`, never a compiled system, crosses a realm.

### [Migration](migration.md)

Read when moving actor-kit 1.3 to 2.0 (enforced dependency access, closing scopes, SDK 9), renaming `@ariestools/actor-system` imports to `@ariestools/actor-engine`, upgrading cli-kit or browser-kit from 1.x to 2.x, replacing the retired `@ariestools/actor-cli` 1.3.0 helpers (`runActorsService`, `runActorOnce`, …) or the npm-deprecated `@xyo-network/actor-cli-kit*` shims, or keeping one engine copy while the host kits pull in `actor-system`.

## Related skills

These are navigation links, not dependencies; each skill installs separately.

- **[xy-development](../xy-development/SKILL.md)** — TypeScript, Git, testing principles and the Definition of Done; this skill builds on it. Install: `npx skills add ariestools/ariestools-skills --skill xy-development`.
- **[xy-toolchain](../xy-toolchain/SKILL.md)** — the `xy` CLI, Vitest (including Chromium for browser specs), deplint package roles for bin and library packages, and the `tslib` that decorators such as `@creatable()` need; this skill builds on it. Install: `npx skills add ariestools/ariestools-skills --skill xy-toolchain`.
- **[ariestools-sdk](../ariestools-sdk/SKILL.md)** — the `@ariestools/sdk` utilities actors use (`creatable`, `CreatableName`, loggers), its `zod` and OpenTelemetry peers, and the root-barrel import rule; this skill builds on it. Install: `npx skills add ariestools/ariestools-skills --skill ariestools-sdk`.
- **[ariestools-sdk-react](../ariestools-sdk-react/SKILL.md)** — React UI on `@ariestools/sdk-react*`, for apps whose pages also host browser-kit realms. Install: `npx skills add ariestools/ariestools-skills --skill ariestools-sdk-react`.
- XL1 browser and CLI specializations live in the separate [xyo-skills](https://github.com/XYOracleNetwork/xyo-skills) pack.

Install this skill with `npx skills add ariestools/ariestools-skills --skill ariestools-actor`, or in an xy repository with `pnpm xy skills add ariestools/ariestools-skills --skill ariestools-actor -y`. It is outside the toolchain's skills catalog (10.1.3): `xy skills defaults` installs it with the rest of ariestools-skills, `xy skills pick` and the `commands.skillsLint` keys reject it, and `xy skills lint` never version-checks it. Lint requires it only when a package.json `xy.skills` entry names it with `source: 'ariestools/ariestools-skills'` (mind the config caveat in [skills and work tracking](../xy-toolchain/commands.md#skills-and-work-tracking)).
