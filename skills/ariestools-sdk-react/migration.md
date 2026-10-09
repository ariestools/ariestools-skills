# Migrating to @ariestools/sdk-react

Each retired `@xylabs/react-<module>` package maps to the `@ariestools/sdk-react` 12.x subpath of the same name, and no declared export has been removed since 10.0.5 outside the Mixpanel and invertible-theme packages, which have no successor. Most migrations are therefore an import-path rewrite plus peer changes. Target 12.0.1 or later ([versions](overview.md#versions)).

## Retired names

Unlike some sdk-js shims, these npm deprecation messages point at current targets:

| Retired | Last version, npm status | Use |
|---|---|---|
| `@xylabs/sdk-react` | 11.0.1, deprecated: "Replace @xylabs/sdk-react with @ariestools/sdk-react and @xylabs/sdk-react/<subpath> with @ariestools/sdk-react/<subpath>" | `@ariestools/sdk-react`. All 25 of its subpaths exist in the umbrella under the same names |
| `@xylabs/react-<module>`, one package per umbrella subpath (`accordion` … `webapp`, 31 in all) | 11.0.1, each deprecated: "Use @ariestools/sdk-react/<module> instead" | Apps: `@ariestools/sdk-react/<module>`. Libraries: the owning `@ariestools/sdk-react-<pkg>/<module>` ([ownership](packages.md#ownership)) |
| `@xylabs/react-mixpanel` | 11.0.1, deprecated: "Own Mixpanel initialization in the application instead." | No successor; see [Mixpanel](#mixpanel) |
| `@xylabs/react-invertible-theme` | 10.0.5, **not** flagged deprecated | Remove it. Since 6.2.1 it has exported only an empty default object; `InvertibleThemeProvider` and its helpers are gone |
| `@ariestools/sdk-react-core` | 12.0.1, deprecated from 11.1.0 on: "Use @ariestools/sdk-react-foundation, @ariestools/sdk-react-ui, or a focused feature package. This package is a compatibility shim only." | Apps: the umbrella subpath of the same name. Libraries: the owner subpath ([below](#sdk-react-core-subpaths)) |

The related sdk-js renames, `@xylabs/pixel` → `@ariestools/pixel` and `@xylabs/eth-address` → `@ariestools/eth-address`, are in ariestools-sdk's [retired-names map](../ariestools-sdk/overview.md#migrating-from-retired-names).

**Remove every shim; do not leave one next to 12.x.** From 10.0.2 on, `@xylabs/sdk-react` and every `@xylabs/react-*` package except invertible-theme depend on `@ariestools/sdk-react` at their own version (11.0.1 on `~11.0.1`), and the 11.0.1 releases peer the old line (`@ariestools/sdk ^8.0.3`, `@opentelemetry/sdk-trace-base ^2.9.0`, …). A leftover shim installs a second, older sdk-react with its own contexts. A provider imported through it does not reach hooks imported from 12.x; the usual symptom is a `No UserEvents instance found in context` warning while a `UserEventsProvider` is mounted ([keep one copy](imports.md#keep-one-copy-of-each-package)).

### sdk-react-core subpaths

Core 12.0.1 has a root and 22 subpaths, each a pure forward to one focused subpath of the same name:

| Owner | Core subpaths |
|---|---|
| `@ariestools/sdk-react-foundation` | `async-effect`, `flexbox`, `hooks`, `portal`, `promise`, `render-spin-check`, `rich-result`, `shared` |
| `@ariestools/sdk-react-ui` | `accordion`, `button`, `common`, `cookie-consent`, `dialogs`, `error`, `quick-tip-button`, `select`, `theme` |
| `@ariestools/sdk-react-app` | `link` |
| `@ariestools/sdk-react-analytics` | `pixel` |
| `@ariestools/sdk-react-motion` | `animation` |
| `@ariestools/sdk-react-json-viewer` | `json-viewer` |
| `@ariestools/sdk-react-number-status` | `number-status` |

- Core's `/error` forwards only ui's, and its `/hooks` only foundation's. The umbrella's `/error` adds app's `ThrownErrorBoundary`, `ErrorReporterProvider`, `useErrorReporter` and `ErrorQuickTipButton`, and its `/hooks` adds `useSetUniversalRedirect` and `useCheckUniversalRedirect`. Moving core imports to the umbrella therefore exposes more names, never fewer.
- Core has no `app-settings`, `appbar`, `base-page`, `crypto`, `experiments`, `identicon`, `pixel-debugger`, `scroll-to-top` or `webapp` subpath.
- Core's root also only forwards, so code that still imports core 12.0.1 shares contexts with focused subpaths at the same version during a staged migration. Core 11.0.1–11.0.3 are different: they predate the split, carry their own module copies and no deprecation flag. Replace them first.

## Moved and changed APIs

- **User events.** `UserEventsContext`, `UserEventsProvider`, `useUserEvents`, `DebugUserEventsContext`, the `UserEventHandler` interface and the field types (`FunnelStartedFields`, `TestStartedFields`, `UserClickFields`, `ViewContentFields`) live in `@ariestools/sdk-react-foundation/user-events` since 11.1.0. The `/pixel` exports of the same names are `@deprecated` aliases of those objects, so they still work, but new code imports the foundation subpath. The umbrella has no `/user-events` subpath, so an app adds `@ariestools/sdk-react-foundation` (at the umbrella's version) to its own dependencies to import it. In 10.x the handler type came from `@xylabs/pixel`; foundation's `UserEventHandler` is a structural interface that `@ariestools/pixel` handlers satisfy. See [where user events live](imports.md#where-user-events-live).
- **Error reporting.** `ErrorReporterProvider` and `ThrownErrorBoundary` keep their `rollbar` prop, but it is typed as the structural `ErrorReporter` (`{ error(error: unknown): unknown }`) instead of the `rollbar` package's class. A Rollbar instance still fits, and `rollbar` is no longer a peer.
- **Export names.** Comparing the declared exports (`export const|function|class|interface|type`) in sdk-react's sources at 10.0.5 and 12.0.1, without the Mixpanel and invertible-theme packages, finds no removed names and eight added ones: `ErrorReporter`, `UserEventHandler`, `FunnelStartedFields`, `TestStartedFields`, `UserClickFields`, `ViewContentFields`, `ThrownErrorBoundaryInner` and `ErrorLocation`. The comparison does not cover `export { … }` lists or signature changes, so type-check after rewriting imports.

### Mixpanel

`MixpanelContext`, `MixpanelProvider` and `useMixpanel` have no successor. The old provider called `mixpanel.init(id, { persistence: 'localStorage', debug: isLocalhost(), ...config })` and put the instance in context. Do that in the app with `mixpanel-browser`, and reach the instance from a module of your own instead of `useMixpanel()`. `/pixel` still exports `MixpanelUserEventHandler` (plus `MixpanelCustomEvent`, `MixpanelPageViewEvent` and the `MixpanelLike` type) to feed user events into it:

```tsx
import { MixpanelUserEventHandler } from '@ariestools/sdk-react/pixel'
import { isLocalhost } from '@ariestools/sdk-react/shared'
import { UserEventsProvider } from '@ariestools/sdk-react-foundation/user-events'
import mixpanel from 'mixpanel-browser'
import type { PropsWithChildren } from 'react'

mixpanel.init('<project-token>', { debug: isLocalhost(), persistence: 'localStorage' })
const userEvents = new MixpanelUserEventHandler(mixpanel)

export function AnalyticsProvider({ children }: PropsWithChildren) {
  return <UserEventsProvider userEvents={userEvents}>{children}</UserEventsProvider>
}
```

## Peer changes from 10.x

`@xylabs/react-*` 10.0.5 and `@ariestools/sdk-react` 10.0.5 peered one long list. At 12.0.1 the umbrella declares no peers, and the focused packages peer only frameworks and sdk-js packages ([peer matrix](overview.md#peer-matrix)):

| 10.0.5 peer | 12.0.1 |
|---|---|
| `react`, `react-dom` ^19.2.7 | `react ^19.3`; `react-dom ^19.3` (optional peer of foundation, needed by `/portal` and any DOM app) |
| `@mui/material` ^9.2.0 | `^9.4`, plus `@emotion/react` and `@emotion/styled` for MUI's styled engine |
| `react-router-dom` ^7.18.1 | `react-router ^8.4` ([below](#react-router-dom-7-to-react-router-8)) |
| `@xylabs/pixel`, `@xylabs/eth-address` ^7.0.8 | `@ariestools/pixel ^9.0` (analytics), `@ariestools/eth-address ^9.0` (crypto) |
| `@ariestools/sdk` ^7.0.8 | Imported at runtime but **undeclared**: the app installs `@ariestools/sdk` ~9.0, `zod` ^4.6 and `@opentelemetry/api` ^1.9 ([install](overview.md#install)) |
| `zod` ^4.4.3, `@opentelemetry/api` ^1.9.1 | Still needed through `@ariestools/sdk` 9.0.1, now at `zod ^4.6` and `@opentelemetry/api ^1.9`; raise an app pinned to zod 4.4.x |
| `rollbar` ^3.1.0 | Gone; see [error reporting](#moved-and-changed-apis) |
| `@opentelemetry/sdk-trace-base` ^2.9.0 | Gone; neither sdk-react 12.0.1 nor `@ariestools/sdk` 9.0.1 needs it |
| `ethers` ^6.17.0 | `^6.17` (crypto) |
| `md5`, `clsx`, `numeral`, `zustand`, `lru-cache`, `async-mutex`, `query-string`, `viem`, `@react-spring/web`, `@mui/icons-material` | Regular dependencies of the focused packages. Drop them unless the app imports them itself |

The sdk-js 9.x packages (`@ariestools/sdk`, `@ariestools/pixel` and `@ariestools/eth-address` 9.0.1) declare `engines.node >=26`, so the migrated app builds and tests on Node 26 ([runtime and toolchain versions](overview.md#runtime-and-toolchain-versions)).

### react-router-dom 7 to react-router 8

sdk-react moved from `react-router-dom` to `react-router` in 11.1.1. There is no `react-router-dom` 8 (npm `latest` is 7.18.4), so the app moves too:

- Replace the `react-router-dom` dependency with `react-router ^8.4`, and rewrite `from 'react-router-dom'` to `from 'react-router'`. `RouterProvider` and `HydratedRouter` come from `react-router/dom`.
- Do not keep `react-router-dom` 7 for the app's own router. Each 7.x release depends on the matching `react-router` 7 version exactly (7.18.4 on 7.18.4), so the app's `<BrowserRouter>` and sdk-react's links and hooks would use different router contexts. sdk-react components such as `ButtonEx` or `LinkEx` with `to`, and `ScrollToTop`, then throw errors like `useNavigate() may be used only in the context of a <Router> component`.
- Stay on `react-router` 8.4.x: crypto pins it as a dependency ([pinned framework dependencies](overview.md#peer-matrix)).
- For router behavior changes between 7 and 8, follow React Router's own upgrade notes.

## Version history

- **10.0.2:** first `@ariestools/sdk-react`. From this version, `@xylabs/sdk-react` and the `@xylabs/react-<module>` packages are deprecated shims over it.
- **11.0.0:** the sdk-js 8 line (`@ariestools/sdk`, `@ariestools/pixel` and `@ariestools/eth-address` ^8.0 replace `@ariestools/sdk` ^7 and the `@xylabs/pixel` and `@xylabs/eth-address` peers).
- **11.0.1:** `-core`, `-app`, `-analytics` and `-crypto` first published. This is also the last `@xylabs/*` shim release; 11.0.2 deleted the shims from the repo.
- **11.1.0:** core split into foundation, ui, identicon, json-viewer, motion and number-status, with user events moved to foundation. Core becomes an npm-deprecated forwarding facade.
- **11.1.1:** `react-router` replaces `react-router-dom`.
- **11.1.6:** the `@ariestools/sdk ^8.1` peer dropped from the umbrella and core, and from foundation, ui, app, analytics, crypto, motion and number-status. It has stayed undeclared since.
- **12.0.0:** peers raised to `react ^19.3`, `@mui/material ^9.4` and `react-router ^8.4`. Still the sdk-js 8 line (`@ariestools/pixel` and `@ariestools/eth-address` ^8.3).
- **12.0.1:** the sdk-js 9 line (`@ariestools/pixel` and `@ariestools/eth-address` ^9.0, so Node 26), plus the `ThrownErrorBoundary` and `Gtag` fixes listed under [versions](overview.md#versions). The minimum to use.

Upgrading from 11.1.x: raise React, MUI and `react-router` to the 12.x peers, move `@ariestools/sdk`, `@ariestools/pixel` and `@ariestools/eth-address` to 9.x on Node 26, and replace any `@ariestools/sdk-react-core` imports. From 11.0.x, also move off `react-router-dom` and import user events from foundation.

## Steps

1. **Replace dependencies.**
   - Remove every `@xylabs/react-*`, `@xylabs/sdk-react` and `@ariestools/sdk-react-core`, plus `react-router-dom`.
   - Apps add `@ariestools/sdk-react` (and `@ariestools/sdk-react-foundation` at the same version when they import user events). Libraries add the owning focused packages, placed as the [library guidance](overview.md#libraries) says.
   - Add the peers and the undeclared `@ariestools/sdk`, `zod` and `@opentelemetry/api` from the [install line](overview.md#install).
2. **Rewrite imports.** The module names are unchanged, so this is mechanical:
   - `@xylabs/react-<module>` → `@ariestools/sdk-react/<module>` (apps) or the owner subpath (libraries);
   - `@xylabs/sdk-react` and `@xylabs/sdk-react/<subpath>` → `@ariestools/sdk-react` and `@ariestools/sdk-react/<subpath>`;
   - `@ariestools/sdk-react-core/<module>` → the owner subpath from the [table](#sdk-react-core-subpaths), or the umbrella subpath of the same name;
   - user events → `@ariestools/sdk-react-foundation/user-events`;
   - `react-router-dom` → `react-router`.

   **Never land on a focused package's root** such as `@ariestools/sdk-react-foundation`: its contexts are separate copies ([imports](imports.md)).
3. **Drop removed APIs.** Replace `MixpanelProvider` and `useMixpanel` with the app's own Mixpanel instance, and delete `@xylabs/react-invertible-theme` imports.
4. **Find leftovers and duplicates.** `pnpm why -r '@xylabs/*react*' '@ariestools/sdk-react*' react-router-dom react-router` should show no `@xylabs` package, no `react-router-dom` and one version of each sdk-react package and of `react-router`. A shim pulled in by another dependency needs that dependency upgraded too.
5. **Check and build.** Run `pnpm xy deplint` and `pnpm xy build` from the repo root ([`xy deplint`](../xy-toolchain/commands.md#xy-deplint-package)). If deplint reports `@ariestools/sdk` or `zod` as unused because the app never imports them itself, keep them with `placement: 'dep'` and `presence: 'required'` ([placement and presence](../xy-toolchain/commands.md#package-placement-and-presence)).
6. **Decline `@xylabs/sdk-react` in `xy lint init`.** Its prompt still offers to steer imports to that deprecated barrel and installs it when accepted, which brings back an 11.0.1 shim. Answer no; see xy-toolchain's [flat config setup](../xy-toolchain/eslint.md#use-the-active-flat-config).
