# Imports and context identity

## The rule

- Apps import umbrella subpaths (`@ariestools/sdk-react/flexbox`). The umbrella root is identity-safe but loads every module wherever code runs unbundled ([overview](overview.md#umbrella-or-focused-packages)).
- Libraries import the owning focused package's subpath (`@ariestools/sdk-react-<pkg>/<module>`), so they depend only on what they use. [packages.md](packages.md) maps each module to its owner, and [xy-toolchain project profiles](../xy-toolchain/project-profiles.md#package-roles-and-dependency-policy) covers peer placement.
- Never import a focused package's root barrel (`@ariestools/sdk-react-foundation`, `-ui`, `-app`, `-crypto`, …). Each of those root bundles carries its own copy of every module and context in the package.
- Do not add `@ariestools/sdk-react-core`. It is npm-deprecated; see [migration.md](migration.md).

```ts
import { FlexRow } from '@ariestools/sdk-react/flexbox'
import { ButtonEx } from '@ariestools/sdk-react-ui/button'
import type { UserEventHandler } from '@ariestools/sdk-react-foundation/user-events'
import { UserEventsProvider } from '@ariestools/sdk-react-foundation/user-events'

// Wrong: this root creates a second UserEventsContext, which ButtonEx never reads
// import { UserEventsProvider } from '@ariestools/sdk-react-foundation'
```

This is not the reverse of the [ariestools-sdk import style](../ariestools-sdk/conventions.md#import-style). Both rules say the same thing: import through the entry the rest of the graph uses. sdk-react reaches `@ariestools/sdk` only through its root, with no `@ariestools/sdk/<module>` imports, and its own packages reach each other only through focused subpaths.

## Why: bundled roots

- Each focused package is a toolchain monolith with the default bundle linkage (`mode: 'monolith'`, no `moduleLinkage`). Its root `index.mjs` inlines every module and does not import the package's own subpath files. Each subpath file is a separate bundle.
- In the published 12.0.1 build, 50 of the 51 function and object exports of the foundation root are different objects from their subpath counterparts.
- sdk-react's packages import each other only by subpath (`@ariestools/sdk-react-foundation/flexbox`, `/user-events`, `/shared`, `@ariestools/sdk-react-ui/button`, …), never by root. A provider taken from a root barrel therefore never reaches sdk-react's own components.
- The umbrella's root and every umbrella subpath are pure `export *` forwards to focused subpaths. `UserEventsContext` from `@ariestools/sdk-react`, `@ariestools/sdk-react/pixel` and `@ariestools/sdk-react-foundation/user-events` is one object, and `FlexRow` from `@ariestools/sdk-react/flexbox` is foundation's `/flexbox` `FlexRow`.

Exported contexts and providers that a root barrel duplicates, with the subpath that owns the real one:

| Root barrel | Separate copies in the root |
|---|---|
| `@ariestools/sdk-react-foundation` | `UserEventsContext`, `DebugUserEventsContext`, `UserEventsProvider`, `useUserEvents` (`/user-events`); `CollapsibleProvider`, `useCollapsible` (`/shared`) |
| `@ariestools/sdk-react-ui` | `CookieConsentContext`, `CookieConsentLoader`, `useCookieConsent` (`/cookie-consent`) |
| `@ariestools/sdk-react-app` | `AppSettingsContext`, `AppSettingsProvider` (`/app-settings`); `LoadStatusContext`, `LoadStatusProvider` (`/base-page`); `ErrorReporterProvider` (`/error`) |
| `@ariestools/sdk-react-crypto` | `EthersContext`, `EthersLoader` and the `*EthersLoader` providers, `useEthersContext`, `NetworkSettingsContext`, `NetworkSettingsLoader` (`/crypto`) |

- The other roots (analytics, identicon, json-viewer, motion, number-status) create no exported context, but they still duplicate every component. Avoid them for the same reason.
- `@ariestools/sdk-react-core`'s root is a pure forward like the umbrella's, so it is identity-safe. It is still deprecated.
- TypeScript does not catch the split. A root's `index.d.ts` re-exports the same `modules/*` declarations as the subpath `.d.ts` files, so both imports type-check as one type. [xy-toolchain compilation](../xy-toolchain/compilation.md#monolith-mode) explains why bundle linkage hides runtime duplication from tsc.
- Internal duplicates are harmless. Foundation's `PromiseSettingsContext` appears in five of its bundles, but no provider for it is exported, so every copy holds the default. json-viewer's store contexts stay inside `JsonViewer`.

## Symptoms

- **`No UserEvents instance found in context` warnings while a `UserEventsProvider` is mounted.** `ButtonEx` (`-ui/button`), `LinkEx` and `LinkToEx` (`-app/link`), `WebAppPage` (`-app/webapp`) and analytics `Experiments` call `useUserEvents()`. Its default `'warn'` logs this message when no provider is reachable through `/user-events`, which means the provider came from a root barrel.
- **`useExperiments` throws the same message.** It calls `useUserEvents(true)`.
- **Reverse split.** Your own `useUserEvents()` taken from the foundation root returns `undefined` and warns, even under a provider from `/user-events` or the umbrella.
- **Silent no-op.** `SiteMenu` (`-app/appbar`) reads `useCollapsible()` from foundation `/shared`, which tolerates a missing provider. A `CollapsibleProvider` from the foundation root is therefore ignored without any message.
- **Imports are correct but the symptoms remain.** Two copies of the package are installed; see [Keep one copy of each package](#keep-one-copy-of-each-package).

## Where user events live

- `@ariestools/sdk-react-foundation/user-events` owns:
  - `UserEventsContext`, `DebugUserEventsContext`, `UserEventsProvider` (prop `userEvents`) and `useUserEvents`;
  - the types `UserEventHandler`, `UserEventsProps`, `UserEventsProviderProps`, `DebugUserEventsProps` and the `*Fields` payloads.
- The umbrella has **no** `/user-events` subpath. Its root and `/pixel` re-export these names from analytics `/pixel` as aliases marked `@deprecated use @ariestools/sdk-react-foundation/user-events instead`. They are the same runtime objects, so existing imports keep working, but new code should not use them.
- An app on the umbrella therefore also declares `@ariestools/sdk-react-foundation`, with the same range as `@ariestools/sdk-react` (the umbrella depends on it at `~12.0.1`), and imports `/user-events` from it.

## Enforce it

Add a guard after the shared React config. Use `@typescript-eslint/no-restricted-imports` with exact `paths`, and set `allowTypeImports: true`, because type-only imports are erased and cannot split anything:

```ts
const sdkReactRoots = ['foundation', 'ui', 'app', 'analytics', 'crypto', 'identicon', 'json-viewer', 'motion', 'number-status', 'core']

// in the config array, after the shared React config
{
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    '@typescript-eslint/no-restricted-imports': ['error', {
      paths: sdkReactRoots.map(pkg => ({
        name: `@ariestools/sdk-react-${pkg}`,
        allowTypeImports: true,
        message: 'Import a subpath or @ariestools/sdk-react; this root bundles its own contexts.',
      })),
    }],
  },
},
```

- `paths` matches only the exact specifier, so `@ariestools/sdk-react-foundation/user-events` stays allowed.
- Never put this under the core `no-restricted-imports` rule. A later entry replaces the shared config's `paths` instead of merging with them, which drops the `index.ts` barrel and `src/` bans ([xy-toolchain ESLint](../xy-toolchain/eslint.md#overrides-and-troubleshooting)).
- The shared configs do not set the `@typescript-eslint` variant. If your config already has one, add these paths to that entry, because a later entry replaces an earlier one. `xy lint init`'s barrel steering uses the core rule, so it does not conflict with this guard.
- The toolchain does not add this guard. `xy lint init` knows only the retired `@xylabs/sdk-react` barrel.

## Keep one copy of each package

- A second installed copy of a context-owning package (foundation, ui, app or crypto) splits contexts the same way a root barrel does.
- Copies come from two sources:
  - mixed versions, such as an app on 12.0.1 next to a library pinned to 11.x;
  - one version resolved against different peer sets. pnpm installs one instance per peer combination, for example when two `@mui/material` versions are in the graph.
- identicon, json-viewer and crypto pin `@mui/material` or `react-router` as dependencies, so keep the app on `@mui/material` 9.4.x and `react-router` 8.4.x ([pinned framework dependencies](overview.md#peer-matrix)).
- Align every `@ariestools/sdk-react*` dependency on one version and range, and keep React, MUI and react-router aligned across the workspace. Libraries peer the focused packages so that the app supplies the single copy.
- Check with `pnpm why @ariestools/sdk-react-foundation`, and the same for `-ui`, `-app` and `-crypto`. More than one version or instance means more than one copy, because pnpm lists each `peer#…` variation as its own instance. Fix the lockfile by aligning versions and peers and then running `pnpm dedupe`. A bundler `resolve.dedupe` entry for `@ariestools/sdk-react` alone does not cover the focused packages that own the contexts.
- Do not rely on `pnpm xy statics` to find these copies; by default it does not check the sdk-react packages ([xy-toolchain commands](../xy-toolchain/commands.md#dependency-maintenance-and-utilities)). Use `pnpm why` as above.
