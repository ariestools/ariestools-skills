# Packages and subpaths

The private `ariestools/sdk-react` repository publishes 11 packages that share one version. Nine focused packages own all the code. The umbrella `@ariestools/sdk-react` owns none: each of its subpaths is a pure `export *` forward to the focused subpath of the same name, so `@ariestools/sdk-react/flexbox` and `@ariestools/sdk-react-foundation/flexbox` return the same objects. `@ariestools/sdk-react-core` is deprecated on npm (see [migration](migration.md)).

Import from an umbrella subpath or a focused-package subpath. The umbrella root also works, because it only forwards, but it loads every module wherever code runs unbundled. Never import a focused package's root (`.`): it bundles a second copy of every module in that package, contexts included (see [imports](imports.md)).

Tables below use short names: `foundation` means `@ariestools/sdk-react-foundation`, and so on.

## Ownership

| Package | Subpaths | Owns |
|---|---|---|
| foundation | `async-effect`, `flexbox`, `hooks`, `portal`, `promise`, `render-spin-check`, `rich-result`, `shared`, `user-events` | Foundational hooks, contexts, layout primitives and the user-event contract |
| ui | `accordion`, `button`, `common`, `cookie-consent`, `dialogs`, `error`, `quick-tip-button`, `select`, `theme` | General-purpose MUI components, error rendering and the shipped themes |
| app | `app-settings`, `appbar`, `base-page`, `error`, `hooks`, `link`, `scroll-to-top`, `webapp` | Application shell, error reporting and router-bound components |
| analytics | `experiments`, `pixel`, `pixel-debugger` | Pixel tracking and experiment wrappers |
| crypto | `crypto`, `identicon` | Web3 wallets, tokens and chains; `/identicon` is a pure forward of `@ariestools/sdk-react-identicon/identicon` |
| identicon | `identicon` | `Identicon` without the wallet stack |
| json-viewer | `json-viewer` | JSON viewer |
| motion | `animation` | React Spring animations |
| number-status | `number-status` | `NumberStatus` |
| `@ariestools/sdk-react` | 31 forwards ([catalog](#umbrella-subpath-catalog)) | Nothing of its own; depends on all nine focused packages |
| `@ariestools/sdk-react-core` | 22 forwards | Deprecated compatibility facade; do not add it |

### Quick chooser

Apps may install the umbrella and import its subpaths. Libraries, and apps that care about install size, depend on the smallest owning package; the umbrella brings every package's peers. Peers per package are in the [peer matrix](overview.md#peer-matrix), install lines in [apps on focused packages](overview.md#apps-on-focused-packages), and library peer placement in xy-toolchain's [package roles](../xy-toolchain/project-profiles.md#package-roles-and-dependency-policy).

| Need | Package |
|---|---|
| Layout (`FlexRow`, `BusyBox`), hooks, portals, the user-event contract | foundation |
| Buttons, dialogs, selects, cookie consent, themes | ui |
| App shell, app bar, links, settings, error reporting | app |
| Pixels, experiments, the pixel debugger | analytics |
| Wallets, tokens, chains | crypto |
| An identicon only | identicon |
| A JSON tree | json-viewer |
| Animations | motion |
| `NumberStatus` | number-status |

```ts
// app on the umbrella
import { FlexRow } from '@ariestools/sdk-react/flexbox'

// library on the owning packages: same objects, fewer installs
import { FlexRow } from '@ariestools/sdk-react-foundation/flexbox'
import { ButtonEx } from '@ariestools/sdk-react-ui/button'
```

## Umbrella subpath catalog

Every umbrella subpath forwards to the focused subpath of the same name. Two subpaths merge two packages: `/error` (app + ui) and `/hooks` (app + foundation).

| `@ariestools/sdk-react/…` | Owner | Key exports |
|---|---|---|
| `/accordion` | ui | `AccordionGroup`, `SimpleAccordion` |
| `/animation` | motion | `AnimatedList`, `RotationAnimation`, `Trail` |
| `/app-settings` | app | `AppSettingsContext`, `AppSettingsProvider`, `useAppSettings`, `AppSettingsStorage`, `AppSettingSlug`, `Developer` |
| `/appbar` | app | `AppBarEx`, `ApplicationAppBar`, `SiteMenu`, `ContextToolbar`, `SystemToolbar`, `MenuSection`, … |
| `/async-effect` | foundation | `useAsyncEffect` |
| `/base-page` | app | `BasePage`, `LoadStatusContext`, `LoadStatusProvider`, `DynamicSharePage`, `LiveSharePage`, `PermaSharePage` |
| `/button` | ui | `ButtonEx`, `asButtonHrefOrToProps` |
| `/common` | ui | `BreadcrumbsEx`, `CopyIconButton`, `CoverProgress`, `MenuEx`, `Background`, `RedirectWithQuery`, `onCopy` |
| `/cookie-consent` | ui | `CookieConsent`, `CookieConsentBody`, `CookieConsentContext`, `CookieConsentLoader`, `useCookieConsent` |
| `/crypto` | crypto | `EthersContext`, `NetworkSettingsContext`, `useEthersContext`, `MetaMaskEthersLoader`, `InfuraEthersLoader`, `EthAccount`, `EthAccountButton`, `TokenAmount`, `useEthWallet`, `useWalletDiscovery`, `useNavigateToEthAddress`, … |
| `/dialogs` | ui | `ErrorDialog`, `MessageDialog` |
| `/error` | ui + app | ui: `ErrorBoundary`, `ErrorRender`, `ErrorAlert`, `ErrorViewer`, `ErrorsViewer`, `PopoverErrorRender`, `ErrorRenderWithSupport`; app: `ThrownErrorBoundary`, `ThrownErrorBoundaryInner`, `ErrorReporterProvider`, `useErrorReporter`, `ErrorQuickTipButton` |
| `/experiments` | analytics | `Experiments`, `Experiment`, `useExperiments`, `ExperimentsDebugger`, `selectVariantForExperiment`, … |
| `/flexbox` | foundation | `FlexRow`, `FlexCol`, `FlexGrowRow`, `FlexGrowCol`, `BusyBox`, `BusyCard`, `HoverScale`, `useBusyTiming` |
| `/hooks` | foundation + app | foundation: `useResetState`; app: `useCheckUniversalRedirect`, `useSetUniversalRedirect` |
| `/identicon` | identicon | `Identicon` |
| `/json-viewer` | json-viewer | `JsonViewer`, `defineDataType`, `defineEasyType`, the built-in `*Type` definitions, `lightColorspace`, `darkColorspace`, … |
| `/link` | app | `LinkEx`, `LinkToEx`, `asLinkHrefOrToProps` |
| `/number-status` | number-status | `NumberStatus` |
| `/pixel` | analytics | Platform clients (`Fbq`, `Gtag`, `Gtm`, `Rdt`, `SnapTr`, `Ttq`, …), the `*UserEventHandler` classes, event classes, `Referrer`, and deprecated user-event aliases |
| `/pixel-debugger` | analytics | `PixelDebugger`, `PixelDebuggerProvider`, `PixelDebuggerToggle`, `usePixelAltSendHandler` |
| `/portal` | foundation | `Portal` |
| `/promise` | foundation | `usePromise`, `useAtomicPromise` |
| `/quick-tip-button` | ui | `QuickTipButton` |
| `/render-spin-check` | foundation | `RenderSpinCheck`, `useRenderSpinCheck` |
| `/rich-result` | foundation | `RichResult` and the schema.org enums (`ActionStatusType`, `ItemAvailability`, …) |
| `/scroll-to-top` | app | `ScrollToTop`, `ScrollToTopButton` |
| `/select` | ui | `SelectEx` |
| `/shared` | foundation | `CollapsibleProvider`, `useCollapsible`, `createContextEx`, `useContextEx`, `useProvided`, `useLocalStorage`, `useBreakpoint`, `useInterval`, `useTimeout`, `useMounted`, `useWindowSize`, `getApiStage`, `isLocalhost`, … |
| `/theme` | ui | `XyoTheme`, `XyLabsTheme`, `DataismTheme`, `Xl1Theme`, `XyosTheme` and their `*ThemeOptions`, `ColorSchemeButton`, `useIsDark`, `useIsSmall`, `alphaCss`, `darkenCss`, `lightenCss` |
| `/webapp` | app | `WebAppPage`, `WebAppChrome`, `WebAppBody`, `FlexPage`, `ErrorPage`, `NotFoundPage`, … |

- **No `/user-events` on the umbrella.** The canonical path is `@ariestools/sdk-react-foundation/user-events` (`UserEventsProvider`, `useUserEvents`, `UserEventsContext`, `DebugUserEventsContext`, `type UserEventHandler`). The same names on umbrella `/pixel` and the umbrella root are `@deprecated` aliases of it; they share its identity, but new code should not use them. See [where user events live](imports.md#where-user-events-live).
- **Two `UserEventHandler`s.** The foundation one is a structural interface, the type `UserEventsProvider` accepts. `@ariestools/pixel` exports an abstract class of the same name.
- **No name collisions.** No export name appears in two forwarded subpaths, which matters because `export *` silently drops a colliding name. The umbrella root is the union of the 31 subpaths, 296 runtime names.
- **`@ariestools/sdk-react-core`** keeps 22 of these subpaths, but its `/error` is ui only and its `/hooks` is foundation only. Replace it as [migration](migration.md) describes.

## Contexts and providers by subpath

A provider and every component that reads its context must load the same module. Both the umbrella subpath and the focused subpath resolve to the module below; a focused-package root resolves to a different copy.

| Canonical subpath | Context | Provide with | Read by |
|---|---|---|---|
| foundation `/user-events` | `UserEventsContext` | `UserEventsProvider` | `useUserEvents`, ui `ButtonEx`, app `LinkEx`, `LinkToEx` and `WebAppPage`, analytics `Experiments` |
| foundation `/user-events` | `DebugUserEventsContext` | analytics `PixelDebuggerProvider` | `PixelDebugger`, `PixelDebuggerToggle` |
| foundation `/shared` | Collapsible (context not exported) | `CollapsibleProvider` | `useCollapsible`, app `SiteMenu` |
| ui `/cookie-consent` | `CookieConsentContext` | `CookieConsentLoader` | `useCookieConsent`, `CookieConsent`, `CookieConsentBody` |
| app `/app-settings` | `AppSettingsContext` | `AppSettingsProvider` | `useAppSettings`, `Developer` |
| app `/base-page` | `LoadStatusContext` | `LoadStatusProvider` | `BasePage` |
| app `/error` | ErrorReporter (context not exported) | `ErrorReporterProvider` | `useErrorReporter`, `ThrownErrorBoundary` |
| crypto `/crypto` | `EthersContext` | `EthersLoader`, which picks a wallet-specific `*EthersLoader` (`MetaMaskEthersLoader`, `InfuraEthersLoader`, …) | `useEthersContext`, the wallet components and hooks |
| crypto `/crypto` | `NetworkSettingsContext` | `NetworkSettingsLoader` | Your own `use(NetworkSettingsContext)`; no shipped component reads it |

`createContextEx` in foundation `/shared` builds contexts in your own code; those live in your modules, so the rule above does not affect them.

## Finding the owner of an export

- Search the catalog above, or open the umbrella's `dist/browser/<subpath>.mjs` in `node_modules`: it is one `export * from '<owner>/<subpath>'` line per owner.
- The owner's `dist/browser/<subpath>.mjs` ends in an `export { … }` list of its runtime names; its types are under `dist/browser/modules/<subpath>/`.
- Import the name from that subpath, not from a `dist` path. Every `exports` map lists only `.`, the module subpaths and `./package.json`, so deep imports fail to resolve.

## Caveats for specific packages

- **Two `XyUserEventHandler` classes.** `@ariestools/pixel` and `@ariestools/sdk-react/pixel` (analytics) both export a class named `XyUserEventHandler`, and they are different classes. The analytics one implements pixel's `UserEventHandler` and sends through the same `XyPixel` client. For the pixel client itself see [`@ariestools/pixel`](../ariestools-sdk/packages.md#ariestoolspixel).
- **Analytics `XyUserEventHandler.purchase()` sends a `'TestStarted'` event.** Send purchases with pixel's `XyUserEventHandler`, whose `purchase()` sends `'Purchase'`.
- **`XyoUserEventHandler.get()` broadcasts to no handlers** in 12.0.1. Its private constructor defaults `handlers` to `[]`, so the Facebook and Google fallback never runs. Compose your own `UserEventHandler` and pass it to `UserEventsProvider` (see [patterns](patterns.md)).
- **Use 12.0.1 or later** for a working `Gtag` (analytics `/pixel`) and `ThrownErrorBoundary` (app `/error`); see [versions](overview.md#versions).
- **identicon, json-viewer and crypto pin `@mui/material` or `react-router`** as dependencies ([pinned framework dependencies](overview.md#peer-matrix)); `pnpm why @mui/material react-router` shows any second copy.
- **Installing crypto brings `ethers`, `@ariestools/eth-address` and `viem`** even if you only render `Identicon`; install identicon instead. For `EthAddressWrapper` see [`@ariestools/eth-address`](../ariestools-sdk/packages.md#ariestoolseth-address).
- **Theme showcase is not shipped.** The ui `/theme` barrel leaves out `showcase/**` so it stays SSR-safe, and the package's `files` list excludes the showcase build, so there is nothing to deep-import.
