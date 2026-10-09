# Overview and install

## What sdk-react publishes

The private `ariestools/sdk-react` repository publishes 11 packages that share one version (12.0.1). All of them are ESM only, `sideEffects: false` and `LGPL-3.0-only`; the default `xy license` allowlist accepts that license.

Several npm manifests still name `xylabs/sdk-react` as their repository, and the repo's own AGENTS.md, CLAUDE.md and root README still describe yarn and `@xylabs/*` names. Trust the published `exports`, peers and type declarations in `node_modules/@ariestools/sdk-react*/`.

| Package | Role |
|---|---|
| `@ariestools/sdk-react` | **Umbrella.** Depends on all nine focused packages at `~12.0.1`, declares **no peers**, and exports a root plus 31 module subpaths |
| `@ariestools/sdk-react-foundation` | Async effects, flexbox, hooks, portals, promises, render checks, rich results, shared utilities, user-event contracts |
| `@ariestools/sdk-react-ui` | Accordion, buttons, common components, cookie consent, dialogs, error rendering, quick tips, selects, themes |
| `@ariestools/sdk-react-app` | App settings, app bars, base pages, error reporting, routing hooks and links, scroll-to-top, web-app shell |
| `@ariestools/sdk-react-analytics` | Pixel integrations, experiments, pixel debugger |
| `@ariestools/sdk-react-crypto` | Wallet, token and chain integrations |
| `@ariestools/sdk-react-identicon` | Identicons without the wallet stack |
| `@ariestools/sdk-react-json-viewer`, `-motion`, `-number-status` | Focused optional features |
| `@ariestools/sdk-react-core` | npm-deprecated forwarding facade; see [migration](migration.md) |

The module-by-module map is in [packages.md](packages.md).

The umbrella has no code of its own. Its root is 33 `export * from '@ariestools/sdk-react-<pkg>/<module>'` lines, and each subpath forwards one focused subpath, except `/error` (ui and app) and `/hooks` (foundation and app), which forward two. `@ariestools/sdk-react/flexbox` and `@ariestools/sdk-react-foundation/flexbox` therefore load the same module instance.

## Umbrella or focused packages

- **Apps** that use much of the SDK install the umbrella and import its subpaths:

  ```ts
  import { FlexRow } from '@ariestools/sdk-react/flexbox'
  ```

- **Libraries** and dependency-sensitive apps install the smallest owning package and import its subpath:

  ```ts
  import { ButtonEx } from '@ariestools/sdk-react-ui/button'
  import { Identicon } from '@ariestools/sdk-react-identicon/identicon'
  ```

- **Prefer subpaths in apps too.** The umbrella root evaluates every forwarded module, including crypto (ethers, viem), motion (`@react-spring/web`) and json-viewer (`zustand`), wherever code runs unbundled: Node, Vitest, SSR and the dev server. Production bundlers tree-shake it because every package is `sideEffects: false`.
- **Never import a focused package's root** such as `@ariestools/sdk-react-foundation`. The foundation, ui, app and crypto roots are separate bundles with their own copies of those packages' contexts, so a provider imported from a root does not reach a hook imported from a subpath, or the other way round. See [imports.md](imports.md).

## Peer matrix

Peers and notable dependencies at 12.0.1, from the published manifests:

| Package | Peers | Notable dependencies |
|---|---|---|
| foundation | `react ^19.3`; `react-dom ^19.3` and `@mui/material ^9.4`, both marked optional | `async-mutex ~0.5.0` |
| ui | `react ^19.3`, `react-router ^8.4`, `@mui/material ^9.4` | foundation, `@mui/icons-material ~9.4.0` |
| app | `react`, `react-router ^8.4`, `@mui/material` | ui, foundation, `@mui/icons-material` |
| analytics | `react`, `@mui/material`, `@ariestools/pixel ^9.0` | ui, foundation, `query-string ~9.5.1` |
| crypto | `react`, `ethers ^6.17`, `@mui/material`, `@ariestools/eth-address ^9.0` | ui, identicon, foundation, `viem ~2.57.3`, `lru-cache`, `@mui/icons-material`, `react-router ~8.4.0` (a **dependency**, not a peer) |
| identicon | `react` | `md5`, `@mui/material ~9.4.0` (a **dependency**) |
| json-viewer | `react` | `clsx`, `zustand ~5.0.15`, `@mui/material ~9.4.0` (a **dependency**) |
| motion | `react`, `@mui/material` | foundation, `@react-spring/web ~10.1.2` |
| number-status | `react`, `@mui/material` | ui, foundation, `numeral` |
| umbrella | none | all nine focused packages |
| core (deprecated) | none | every focused package except crypto and identicon |

Unversioned peers use the same ranges as the first rows (`react ^19.3`, `@mui/material ^9.4`).

**Undeclared runtime import.** foundation, ui, app, analytics, crypto and motion import the `@ariestools/sdk` root barrel at runtime, but none of them declares it as a dependency or a peer; the repo keeps it in devDependencies only. number-status reaches it through ui and foundation. In 11.1.5 these six, number-status, the umbrella and core all peered `@ariestools/sdk ^8.1`; 11.1.6 dropped that peer. Apps must install it themselves ([Install](#install)).

- **foundation's "optional" peers are optional per subpath.** `/flexbox` and `/shared` import `@mui/material`, `/portal` imports `react-dom`, and `/flexbox`, `/shared` and `/rich-result` import `@ariestools/sdk`. Only `/async-effect`, `/hooks`, `/promise`, `/render-spin-check` and `/user-events` run on `react` alone (plus the bundled `async-mutex`).
- **Pinned framework dependencies.** identicon and json-viewer depend on `@mui/material ~9.4.0`, and crypto depends on `react-router ~8.4.0`. Keep the app on `@mui/material` 9.4.x and `react-router` 8.4.x. On another minor, the package manager installs a second copy for those packages, and the app's MUI theme or router context may not reach their components.

## Install

### Apps

```sh
pnpm add @ariestools/sdk-react @ariestools/sdk-react-foundation @ariestools/sdk zod @opentelemetry/api react react-dom @mui/material @emotion/react @emotion/styled react-router ethers @ariestools/pixel @ariestools/eth-address
pnpm add -D @types/react @types/react-dom
```

Where each item comes from:

- `@ariestools/sdk-react-foundation` (same version as the umbrella) supplies `/user-events`, which the umbrella does not re-export as a subpath; see [where user events live](imports.md#where-user-events-live).
- `react`, `react-dom`, `@mui/material`, `react-router`, `ethers`, `@ariestools/pixel` and `@ariestools/eth-address` are the focused packages' peers. The umbrella forwards to all nine packages, so all of them apply.
- `@emotion/react` and `@emotion/styled` are needed by MUI's default styled engine. `@mui/styled-engine` 9.4 imports both at runtime, even though it lists them as optional peers.
- `@ariestools/sdk`, `zod` and `@opentelemetry/api` cover the undeclared runtime import. **Apps using @ariestools/sdk-react 12.x must add @ariestools/sdk ~9.0, zod ^4.6 and @opentelemetry/api ^1.9 themselves.** The sdk root barrel loads `zod` and `@opentelemetry/api` when it is imported; see [ariestools-sdk peers](../ariestools-sdk/overview.md#peers-and-side-dependencies).

Because the sdk-react packages do not declare it, pnpm never links `@ariestools/sdk` into their own dependency folders. Node finds it only by walking up to the app's `node_modules` or a hoisted copy, so the app's declaration is what supplies it and what keeps the single shared copy that the ariestools-sdk [root-import rule](../ariestools-sdk/conventions.md#import-style) relies on. `@ariestools/pixel` and `@ariestools/eth-address` 9.0.1 depend on `@ariestools/sdk ~9.0.1`, so an app on sdk 9.0.x shares one copy with them; that is why the range is `~9.0`, not `^9`.

For the `@ariestools/pixel` and `@ariestools/eth-address` APIs, see ariestools-sdk's [pixel](../ariestools-sdk/packages.md#ariestoolspixel) and [eth-address](../ariestools-sdk/packages.md#ariestoolseth-address) sections.

### Apps on focused packages

An app that installs focused packages instead of the umbrella starts from `react react-dom @mui/material @emotion/react @emotion/styled` and adds what its packages reach at runtime, directly or through foundation and ui:

| Focused package | Also add |
|---|---|
| foundation, motion | `@ariestools/sdk zod @opentelemetry/api` |
| ui, app, number-status | `@ariestools/sdk zod @opentelemetry/api react-router` |
| analytics | `@ariestools/sdk zod @opentelemetry/api react-router @ariestools/pixel` |
| crypto | `@ariestools/sdk zod @opentelemetry/api react-router ethers @ariestools/eth-address` |
| identicon, json-viewer | Nothing; they bring their own `@mui/material ~9.4.0` |

number-status and analytics declare no `react-router` peer of their own, but `/number-status` and `/pixel-debugger` import `@ariestools/sdk-react-ui/button`, which imports `react-router` and `@ariestools/sdk`. crypto's `react-router ~8.4.0` dependency shares the app's copy only while the app stays on 8.4.x.

### Libraries

- Install only the owning focused packages and import their subpaths.
- Peer the context-owning packages that your components render or consume, together with `react`, `@mui/material`, `react-router` and `@ariestools/sdk`, so the app supplies one copy of each. Those are foundation for user events, and ui, app or crypto when you render their providers. Keep matching devDependencies for builds, tests and stories.
- For example, `@xyo-network/react-sdk` 11.1.0 peers `@ariestools/sdk-react-foundation ^12.0`, `@ariestools/sdk ^9.0`, `@mui/material ^9.4`, `react ^19.3` and `react-router ^8.4`.
- For the dependency-or-peer decision, see xy-toolchain's [package roles and dependency policy](../xy-toolchain/project-profiles.md#package-roles-and-dependency-policy) and [`xy api-exposure`](../xy-toolchain/commands.md#xy-api-exposure-package).

## Runtime and toolchain versions

- **React 19.** Every package peers `react ^19.3`, and the source relies on React 19 APIs: `use(Context)`, `<Context value>` as a provider, and `ref` as a plain prop (there is no `forwardRef`). React 18 is not supported.
- **MUI 9.** `@mui/material ^9.4`, with `@emotion/react` and `@emotion/styled`.
- **Router.** Use `react-router ^8.4`, not `react-router-dom`; there is no `react-router-dom` 8, and its npm `latest` is a 7.x release. react-router 8.4.0 peers `react` and `react-dom` `>=19.2.7` and declares `engines.node >=22.22.0`. Moving off `react-router-dom` is covered in [migration.md](migration.md).
- **Node 26.** Every sdk-react package still declares a stale `engines.node >=18.17.1`. The sdk-js 9.x packages it needs (`@ariestools/sdk`, `@ariestools/pixel` and `@ariestools/eth-address` 9.0.1) declare `>=26`, and the repo pins Node 26 through Volta. Use Node 26 for builds, tests, Storybook and SSR; see the ariestools-sdk [runtime baseline](../ariestools-sdk/overview.md#runtime-baseline). Engines are advisory unless the consumer enables engine-strict.
- **TypeScript.** The repo builds with `typescript ~6.0.3` and `@types/react ~19.3`. Consumers extend `@ariestools/tsconfig-react`; see xy-toolchain's [Select the environment config](../xy-toolchain/typescript.md#select-the-environment-config).
- **SSR.** Focused-package subpaths export only `browser` and `default` conditions, both pointing at `dist/browser`; only the package roots add a `node` condition. Node SSR therefore runs the browser bundles. The ui `/theme` barrel deliberately leaves out its showcase components, which pull in a large image asset, so that it stays SSR-safe.

## Versions

| Release | Pairs with | Notes |
|---|---|---|
| 11.1.x | sdk-js 8.x | Peers React 19.2 and `@mui/material` 9.2. 11.1.0–11.1.5 also peer `@ariestools/sdk` 8.x (`^8.1` in 11.1.5); 11.1.6 drops it |
| 12.0.0 | sdk-js 8.x | Raises peers to `react ^19.3`, `@mui/material ^9.4` and `react-router ^8.4`; `@ariestools/pixel` and `@ariestools/eth-address` only to `^8.3`. Do not use: see 12.0.1 |
| 12.0.1 | sdk-js 9.x | Raises `@ariestools/pixel` and `@ariestools/eth-address` to `^9.0` (Node 26). **Minimum to use** |

12.0.1 fixes:

- **`ThrownErrorBoundary`** (umbrella `/error`). In 12.0.0, `getDerivedStateFromError` called `this.normalizeError`, but React calls it unbound, so the boundary threw while handling an error instead of rendering its fallback. Releases before 11.1.2 had the same bug.
- **`Gtag`** (umbrella `/pixel`). The 11.x releases and 12.0.0 pushed `init` and `domains`, which are not gtag.js commands, so no GA4 or Ads destination was configured and nothing was sent. 12.0.1 also stops overriding `page_location` with the landing URL, so GA4 attributes each event to the page where it happened.

Upgrade steps from 11.x and from retired names are in [migration.md](migration.md).
