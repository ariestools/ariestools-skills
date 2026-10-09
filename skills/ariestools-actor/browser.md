# Browser hosts (browser-kit)

`@ariestools/browser-kit` runs one [actor engine](engine.md) system across browser realms. An **owner realm** (a page, a dedicated or shared worker, a service worker or an extension background) compiles the config and provisions providers once. Other realms **attach** through typed provider proxies and never resolve providers again. Source: [`ariestools/browser-kit`](https://github.com/ariestools/browser-kit); each package also ships its `README.md` in `node_modules`. Install and peers are in [overview.md](overview.md#install), Node floors in [runtime floors](overview.md#runtime-floors).

## Packages

| Package | Runtime exports |
|---|---|
| `@ariestools/browser-kit` | `BrowserActorCatalog`, `compileBrowserSystem`, `launchCompiledBrowserSystem`, `launchBrowserSystem`, `startBrowserSystem`, `attachBrowserSystem`, `createBrowserSystemManifest`, `parseBrowserSystemManifest`, `provisionBrowserProxySystem`, `provisionMemoryBrowserSystem`, `BrowserSystemConfigZod` |
| `@ariestools/browser-kit-page` | `bindPageLifecycle` |
| `@ariestools/browser-kit-worker` | `bindWorkerShutdown`, `bindMessagePortBrowserSystemHost`, `attachMessagePortBrowserSystem`, `MessagePortBrowserSystemClient`, `BrowserSystemProxyError`, protocol constants (`'browser-kit:…:v1'`) |
| `@ariestools/browser-kit-service-worker` | `ServiceWorkerSystemHost`, `extendEventLifetime` |
| `@ariestools/browser-kit-plugin` | `bindExtensionRuntimeBrowserSystemHost`, `attachExtensionPortBrowserSystem`, `extensionPortMessageEndpoint` |

All five are 2.0.0. The core package is environment-neutral: it imports no DOM, WebWorker, Node or extension API, so it also runs in Node. Each adapter owns only its realm's lifecycle and transport. Install it with the whole actor-kit 2.x family ([install](overview.md#install)).

**XL1.** `@xyo-network/xl1-browser-system` (5.8.x; peers `@ariestools/actor`, `actor-model` and `browser-kit` ^2.0) is the XL1 integration. Use the launchers documented in [xyo-skills gateway-browser](https://github.com/XYOracleNetwork/xyo-skills/blob/main/skills/xl1-knowledge/gateway-browser.md), not the XL1 names in the browser-kit README.

## Owner realm

| Call | What it does |
|---|---|
| `compileBrowserSystem({ actorCatalog, config, providerDescriptors })` | Parses `config` (a `BrowserSystemConfig`), registers `providerDescriptors` in a fresh registry and resolves the graph. Acquires nothing and constructs no actor |
| `launchCompiledBrowserSystem({ actorCatalog, compiled, host?, identity?, … })` | Provisions and starts that exact plan. Also takes the engine runtime options (`provision`, `supervision`, `readyTimeoutMs`, `diagnostics`, …) |
| `launchBrowserSystem(options)` | Both steps in one call |
| `startBrowserSystem(options, bootOptions?)` | Both steps behind the engine's [boot handle](engine.md#boot-diagnostics) |

The option names differ from the engine's: `actorCatalog` instead of `actorRegistry`, and a `providerDescriptors` array instead of a provider registry. `BrowserActorCatalog` extends the engine catalog, so declarations keep `type`, `dependencies`, `optionalDependencies`, `runMode`, `create` and `parseConfig`; provider descriptors are the engine's ([providers.md](providers.md)). Other differences from the bare engine:

- Selections must use `type`; the strict browser schema rejects the deprecated `name` alias. Duplicate actor ids fail as `Duplicate browser actor id "…"`.
- browser-kit sets no supervision default, so the engine's parallel policy applies; cli-kit defaults to sequential ([cli.md](cli.md)).
- Actors get an empty context (no logger, meter or tracer) unless the provisioner supplies one: `provision: async input => await provisionMemoryBrowserSystem({ ...input, locatorContext: { logger } })`. See [logging and telemetry](engine.md#logging-and-telemetry).

## Realm assignment

A selection may name a `host`, any string such as `'page'`, `'worker'` or `'popup'`. The owner resolves the dependencies of **every** selection, whatever its host. Each realm then constructs only the selections whose `host` equals the `host` passed to its launch or attach call; a call without `host` constructs every selection. A realm that does not run an actor registers only its declaration (`type` and `dependencies`, no `create`). The factory is needed only where the actor runs.

## Compiled system and manifest

A `CompiledBrowserSystem` holds executable actor and provider descriptors. It is an owner-realm object, not a wire format, so never post it to a worker or port. Attached realms receive only the descriptor-free `BrowserSystemManifest` `{ config, identity: { planId, systemInstanceId }, resolution }`. Hosts build it with `createBrowserSystemManifest`, and clients validate it with `parseBrowserSystemManifest`.

- `planId` marks provider and proxy protocol compatibility. Version it, for example `'my-app:v1'`.
- `systemInstanceId` marks the exact owner instance, so use `crypto.randomUUID()` per launch. A request stamped with a stale instance fails with `system-instance-mismatch`, and the client must attach again. Both identifiers are freshness metadata, not authentication.
- Hosting over a port needs an identity. Pass `identity` to the launcher or to the host binding; the binding throws without one.

## Realm adapters

### Pages and workers

- `bindPageLifecycle(session, { onStopError, target? })` calls `session.stop()` on `pagehide` (the default target is `window`) and returns a disposer. A page cannot extend its unload, so keep durable progress in providers.
- In a dedicated or shared worker, `bindWorkerShutdown(self, session, { onStopError })` stops on `{ type: 'browser-kit:shutdown' }` and replies `{ type: 'browser-kit:stopped', ok, error? }`.
- `bindMessagePortBrowserSystemHost(endpoint, session, { handlers, identity?, onError? })` answers connect requests with the manifest and runs only registered operations: `handlers[moniker][operation]({ instance, moniker, payload, signal })`. Any other operation fails with `unsupported-operation`.
- The client realm calls `attachMessagePortBrowserSystem({ actorCatalog, endpoint, proxyDescriptors, expectedIdentity?, host?, readyTimeoutMs?, requestTimeoutMs? })`. Requests time out after 30 s by default. Failures reject with `BrowserSystemProxyError`, whose `code` is a protocol code (`plan-mismatch`, `provider-unavailable`, `operation-failed`, `request-aborted`, …) or `timeout`, `closed` or `not-connected`.
- The attach helpers, including the extension one, also give attached actors an empty context. To pass a logger, compose the steps yourself: `const client = new MessagePortBrowserSystemClient(endpoint)` (for an extension port, wrap it with `extensionPortMessageEndpoint(port)`), `const manifest = await client.connect(expectedIdentity)`, then `attachBrowserSystem({ actorCatalog, host, manifest, provision })` with a `provision` that calls `provisionBrowserProxySystem({ ...input, locatorContext: { logger }, proxyDescriptors, transport: client })`.

### Service worker

`new ServiceWorkerSystemHost(launch)` holds one system per worker incarnation. `dispatch(event, handler)` launches or reuses the session and ties the handler's promise to `event.waitUntil`. `session()` returns the cached launch; a failed launch is not cached, so the next event retries. `stop(event?)` stops once and clears the cache. Route every event's work through `dispatch`, for example `event.respondWith(systemHost.dispatch(event, async () => await fetch(event.request)))`. The browser may terminate the worker between events, and the next event rebuilds the system from config. Timers are not durable triggers: use browser events, alarms or sync APIs, and keep state in providers rather than worker globals.

### Browser extension

The background realm, usually a `ServiceWorkerSystemHost` whose launch passes `host` and `identity`, calls `bindExtensionRuntimeBrowserSystemHost(chrome.runtime, { authorize, channelName, getSession, handlers, identity?, onError? })` with `getSession: async () => await systemHost.session()`. It serves each `onConnect` port named `channelName`, awaits `authorize(port)` before exposing anything, and disconnects the port on `false`; messages that arrive meanwhile are buffered in order. `port.sender` is typed `unknown`, so a minimal policy is `port => (port.sender as { id?: string } | undefined)?.id === chrome.runtime.id`; narrow it per surface (URL, tab). Popup, side-panel and content scripts open `chrome.runtime.connect({ name: channelName })` and pass that port to `attachExtensionPortBrowserSystem({ actorCatalog, port, proxyDescriptors, expectedIdentity?, host? })`. Stopping that session disconnects the port. The runtime and port parameters are structural types, so browser-kit itself needs no Chrome typings.

## Security boundary

- The background or service-worker realm owns security-sensitive providers: wallet, keys, accounts, policy and storage. Popups, side panels and content scripts use proxies and never launch a second provider system, so no surface can select a different wallet, account or policy provider.
- `authorize` is required and is the product's trust boundary; the system identity is not authentication. Handlers are an allow-list, and browser-kit never exposes provider methods reflectively, so validate each `payload` in its handler.
- Sender validation, permissions, storage, custody and operation schemas stay in the product.

## Typed provider proxies

An attached realm installs one `BrowserProviderProxyDescriptor` (`{ id, create, dispose? }`) per owner-selected provider its actors use.

- `id` is the owner's provider descriptor id, not the moniker. A provider your actors need without a matching proxy fails the attach; optional dependencies the owner left unbound stay absent, because attaching never selects a provider.
- `create({ transport, configs, manifest, identity, monikers, descriptor })` returns the proxy, which is registered under each moniker in `monikers`.
- `transport.request(moniker, operation, payload, { signal })` sends one operation. Requests are correlated, cancellable (aborting reaches the owner handler's `signal`) and stamped with `planId` and `systemInstanceId`. Requesting a moniker outside the proxy's `monikers` throws `ActorEngineDependencyAccessError` (`dependency-undeclared`).

## Example: worker-owned system with a page actor

```ts
// BlocksProvider.ts, shared by both realms
export interface BlocksProvider { readonly moniker: 'Blocks', current(): Promise<number> }

// blocks.worker.ts, the owner realm
/// <reference lib="webworker" />
import { BrowserActorCatalog, launchBrowserSystem } from '@ariestools/browser-kit'
import { bindMessagePortBrowserSystemHost, bindWorkerShutdown } from '@ariestools/browser-kit-worker'
import { NoProviderConnection } from '@ariestools/provider'

import type { BlocksProvider } from './BlocksProvider.ts'

const actorCatalog = new BrowserActorCatalog()
actorCatalog.register({ dependencies: ['Blocks'], type: 'block-view' }) // declaration only: it runs in the page

const session = await launchBrowserSystem({
  actorCatalog,
  config: { actors: [{ host: 'page', type: 'block-view' }] },
  host: 'worker',
  identity: { planId: 'blocks:v1', systemInstanceId: crypto.randomUUID() },
  providerDescriptors: [{
    connectionTypes: [NoProviderConnection],
    create: async (): Promise<BlocksProvider> => ({ current: async () => 42, moniker: 'Blocks' }),
    dependencies: [],
    id: 'local-blocks',
    monikers: ['Blocks'],
  }],
})
bindMessagePortBrowserSystemHost(self, session, {
  handlers: { Blocks: { current: async ({ instance }) => await (instance as BlocksProvider).current() } },
})
bindWorkerShutdown(self, session, { onStopError: error => console.error(error) })
```

```ts
// page.ts, an attached realm
import { ProviderActor } from '@ariestools/actor'
import { BrowserActorCatalog } from '@ariestools/browser-kit'
import { bindPageLifecycle } from '@ariestools/browser-kit-page'
import { attachMessagePortBrowserSystem } from '@ariestools/browser-kit-worker'
import { creatable } from '@ariestools/sdk'

import type { BlocksProvider } from './BlocksProvider.ts'

@creatable()
class BlockViewActor extends ProviderActor {
  protected override async run(): Promise<void> {
    const blocks = await this.getProvider<BlocksProvider>('Blocks')
    document.title = `Block ${await blocks.current()}`
  }
}

const actorCatalog = new BrowserActorCatalog()
actorCatalog.register({
  create: async ({ providerContext }) => await BlockViewActor.create({ providerContext }),
  dependencies: ['Blocks'],
  runMode: 'one-shot',
  type: 'block-view',
})

const worker = new Worker(new URL('blocks.worker.ts', import.meta.url), { type: 'module' })
const session = await attachMessagePortBrowserSystem({
  actorCatalog,
  endpoint: worker,
  expectedIdentity: { planId: 'blocks:v1' },
  host: 'page',
  proxyDescriptors: [{
    create: async ({ transport }): Promise<BlocksProvider> => ({
      current: async () => await transport.request<number>('Blocks', 'current', undefined),
      moniker: 'Blocks',
    }),
    id: 'local-blocks', // the owner's provider id, not the moniker
  }],
})
bindPageLifecycle(session, { onStopError: error => console.error(error) }) // stops the proxies; post 'browser-kit:shutdown' to stop the worker
```

## Testing

Run neutral specs in both Node and Chromium. Worker proxy specs must cross a real `Worker`, because a same-realm `MessageChannel` does not prove the boundary. Service-worker behavior needs a real install, activate, terminate and reconstruct cycle, not a structural unit test. Put realm-only specs under `spec/browser/` ([spec routing](../xy-toolchain/testing.md#spec-directory-environment-routing)); Chromium setup is in [xy-toolchain testing](../xy-toolchain/testing.md).
