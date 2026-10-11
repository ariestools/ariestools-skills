---
name: ariestools-sdk-react
description: Aries Tools React UI libraries — the @ariestools/sdk-react umbrella and its subpaths, the focused foundation, ui, app, analytics, crypto and feature packages, their peers (React 19, MUI 9, react-router 8, ethers, @ariestools/pixel, @ariestools/eth-address) and undeclared @ariestools/sdk import, the one-copy-per-context import rule, and house patterns (providers, useAsyncEffect, usePromise, error boundaries, user events, stories). Use when installing or importing @ariestools/sdk-react*, choosing the package that owns a component or hook, writing components in a repo on sdk-react, debugging an ignored sdk-react provider, or migrating from @xylabs/sdk-react, @xylabs/react-* or sdk-react-core.
metadata:
  version: 0.1.9 # x-release-please-version
---

# Aries Tools React SDK

**Authority.** This skill is maintained only in [`ariestools/ariestools-skills`](https://github.com/ariestools/ariestools-skills); edit there, not in installed copies.

**Versions.** Verified against `@ariestools/sdk-react` 12.0.1 (with `@ariestools/sdk` 9.0.1, React 19.3, `@mui/material` 9.4, `react-router` 8.4). Use 12.0.1 or later: in 12.0.0, `ThrownErrorBoundary` throws while handling an error and `Gtag` sends nothing ([versions](overview.md#versions)).

**Skill identity.** When you present a plan, an acknowledgement, or a completion summary, state which skills informed it as `ariestools-sdk-react v<version>`, and list each other active skill from this pack the same way. Read the version from this file's `metadata.version`, never from an example.

**Scope.** The 11 `@ariestools/sdk-react*` packages at 12.0.1, published from the private [`ariestools/sdk-react`](https://github.com/ariestools/sdk-react) repository. Not covered: `@ariestools/sdk` utilities and peers ([ariestools-sdk](../ariestools-sdk/SKILL.md)); build, lint, test and deplint tooling ([xy-toolchain](../xy-toolchain/SKILL.md)); actor and host kits ([ariestools-actor](../ariestools-actor/SKILL.md)); XYO and XL1 packages (the [xyo-skills](https://github.com/XYOracleNetwork/xyo-skills) pack); and general React app design, MUI theming and Storybook setup.

**Traps.**

- **Never import a focused package's root**, such as `@ariestools/sdk-react-foundation`. Import `@ariestools/sdk-react/<module>` or the owning `@ariestools/sdk-react-<pkg>/<module>`. The foundation, ui, app and crypto roots are separate bundles with their own copies of those packages' contexts, so a provider taken from a root never reaches hooks or components loaded through subpaths, and TypeScript does not notice ([imports](imports.md)). The umbrella root only forwards, so it is safe, but it loads every module wherever code runs unbundled.
- **User events live at `@ariestools/sdk-react-foundation/user-events`.** The umbrella has no `/user-events` subpath, and the same names on its root and `/pixel` are `@deprecated` aliases. An app on the umbrella also declares `@ariestools/sdk-react-foundation` at the same version.
- **Apps using @ariestools/sdk-react 12.x must add @ariestools/sdk ~9.0, zod ^4.6 and @opentelemetry/api ^1.9 themselves.** Six packages import `@ariestools/sdk` at runtime without declaring it. MUI also needs `@emotion/react` and `@emotion/styled` ([install](overview.md#install)).
- **Use `react-router` ^8.4, not `react-router-dom`**, which has no 8.x. Keep the app on `@mui/material` 9.4.x and `react-router` 8.4.x, because identicon, json-viewer and crypto pin them as dependencies and another minor installs a second copy ([peer matrix](overview.md#peer-matrix)).
- **Remove every `@xylabs/sdk-react` and `@xylabs/react-*` shim, and do not add `@ariestools/sdk-react-core`.** A leftover shim installs a second, older sdk-react with its own contexts ([migration](migration.md)).

**Runtime.** Use Node 26. sdk-react's own `engines.node >=18.17.1` is stale: the `@ariestools/sdk`, `@ariestools/pixel` and `@ariestools/eth-address` 9.0.1 packages it needs declare `>=26` ([runtime and toolchain versions](overview.md#runtime-and-toolchain-versions)). React 18 is not supported.

This skill builds on [xy-development](../xy-development/SKILL.md), [xy-toolchain](../xy-toolchain/SKILL.md) (its [React profile](../xy-toolchain/project-profiles.md#apply-common-profiles)) and [ariestools-sdk](../ariestools-sdk/SKILL.md); it sits beside ariestools-sdk, not above it. Load only the reference needed for the task:

## References

### [Overview and install](overview.md)

Read first when choosing between the umbrella and the focused packages; installing in an app (the full line, with `@ariestools/sdk-react-foundation` for user events, the undeclared `@ariestools/sdk`, `zod` and `@opentelemetry/api` and MUI's Emotion packages), in an app on focused packages, or in a library; checking the peer matrix, foundation's optional peers or the packages that pin MUI and `react-router` as dependencies; confirming the React 19, MUI 9, `react-router` 8, Node 26 and TypeScript baselines or SSR behavior; or checking why 12.0.1 is the minimum.

### [Imports and context identity](imports.md)

Read when writing any sdk-react import; when a provider seems ignored (a `No UserEvents instance found in context` warning while a `UserEventsProvider` is mounted, `useExperiments` throwing, or a `CollapsibleProvider` with no effect); listing which root barrels duplicate which contexts, or where user events live; adding the `@typescript-eslint/no-restricted-imports` guard; or finding a second installed copy of a package with `pnpm why`, and why `xy statics` misses it.

### [Packages and subpaths](packages.md)

Read when finding which package and subpath owns a component, hook or context; choosing the smallest package for a need; looking up an umbrella subpath's key exports or the provider a context needs; locating an export in `node_modules`; or checking package caveats: the two `XyUserEventHandler` classes, analytics `purchase()` sending `'TestStarted'`, `XyoUserEventHandler.get()` reaching no handlers, and crypto pulling in the wallet stack.

### [Component and hook patterns](patterns.md)

Read when writing components or hooks in sdk-react style (module layout, the context, provider and hook triple in React 19 form, MUI prop types, `sx` merging and `ref` as a prop); using `useAsyncEffect`, `usePromise` or `useAtomicPromise` (a returned cleanup is ignored, and an async rejection comes back as state `'resolved'` with an error); wiring `ThrownErrorBoundary`, `ErrorReporterProvider` and a global reporter; implementing a `UserEventHandler` and knowing which components emit events; writing stories and specs; or adding a module inside the sdk-react repo.

### [Migrating to @ariestools/sdk-react](migration.md)

Read when replacing `@xylabs/sdk-react`, the `@xylabs/react-*` packages or `@ariestools/sdk-react-core`; mapping core subpaths to their owners; replacing the Mixpanel provider or dropping invertible-theme; moving from `react-router-dom` 7 to `react-router` 8; mapping 10.x peers to 12.x; upgrading from 11.x; or running the migration steps with their `pnpm why` and deplint checks.

## Related skills

These are navigation links, not dependencies; each skill installs separately.

- **[xy-development](../xy-development/SKILL.md)** — TypeScript, Git, testing principles and the Definition of Done; this skill builds on it. Install: `npx skills add ariestools/ariestools-skills --skill xy-development`.
- **[xy-toolchain](../xy-toolchain/SKILL.md)** — the `xy` CLI, `@ariestools/tsconfig-react`, the React ESLint flat config and its tiers, Vitest, deplint package roles and peer placement, `xy statics` and monolith compilation, which sdk-react and its consumers build with; this skill builds on it. Install: `npx skills add ariestools/ariestools-skills --skill xy-toolchain`.
- **[ariestools-sdk](../ariestools-sdk/SKILL.md)** — the `@ariestools/sdk` root barrel that sdk-react imports, its `zod` and OpenTelemetry peers, and the `@ariestools/pixel` and `@ariestools/eth-address` APIs behind analytics and crypto; this skill builds on it. Install: `npx skills add ariestools/ariestools-skills --skill ariestools-sdk`.
- **[ariestools-actor](../ariestools-actor/SKILL.md)** — actor, provider and host kits, including the browser-kit page and worker realms a React app may host. Install: `npx skills add ariestools/ariestools-skills --skill ariestools-actor`.
- XYO and XL1 React packages live in the separate [xyo-skills](https://github.com/XYOracleNetwork/xyo-skills) pack.

Install this skill with `npx skills add ariestools/ariestools-skills --skill ariestools-sdk-react`, or in an xy repository with `pnpm xy skills pick --skill ariestools-sdk-react`, which also records it as required. Since toolchain 10.1.4 it is in the toolchain's skills catalog: `xy skills lint` requires it, together with ariestools-sdk, wherever a workspace package produces or depends on `@ariestools/sdk-react` or an `@ariestools/sdk-react-*` package, and version-checks it. Through 10.1.3 it is outside the catalog, so `xy skills pick` and the `commands.skillsLint` keys reject it; install it there with `pnpm xy skills add ariestools/ariestools-skills --skill ariestools-sdk-react -y`. See [skills and work tracking](../xy-toolchain/commands.md#skills-and-work-tracking) for the other routes and their caveats.
