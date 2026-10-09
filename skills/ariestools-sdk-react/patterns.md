# Component and hook patterns

How sdk-react code is written, and how to consume its context, async, error and user-event APIs. Examples import either a focused-package subpath or the matching umbrella subpath (`@ariestools/sdk-react/<module>`); both load the same module copy. Never import a focused package's root ([imports.md](imports.md)).

## Module anatomy

- Each focused package is a monolith ([xy-toolchain monolith mode](../xy-toolchain/compilation.md#monolith-mode)). A module lives in `src/modules/<name>/` with an `index.ts` barrel. Larger modules split into `components/`, `hooks/` and `contexts/` (app `error/` has `components/ErrorBoundary/` and `contexts/ErrorReporter/`); small ones keep the files flat (foundation `user-events/`).
- Use one concern per file. Stories (`X.stories.tsx`) sit next to `X.tsx`, and specs go in a `spec/` folder beside the code they test.
- Components are mostly `React.FC<Props>` consts. Generic components and the boundary wrapper use `function` declarations (`ErrorRender<T>`, `ThrownErrorBoundary<T>`).
- Layout and button components set `displayName` for devtools, e.g. `FlexRow.displayName = 'FlexRowXYLabs'`.
- Write React 19 code: `use(Context)`, `<Context value={…}>` as the provider, and `ref` as an ordinary prop. Do not use `useContext`, `.Provider` or `forwardRef`.

## Context, provider and hook

The canonical triple, as in foundation `user-events/` and app `error/contexts/ErrorReporter/`:

```tsx
// Context.ts
export interface SessionState { token?: string }
export const SessionContext = createContext<SessionState>({})

// Provider.tsx
export interface SessionProviderProps { token?: string }
export const SessionProvider: React.FC<PropsWithChildren<SessionProviderProps>> = ({ children, token }) => {
  const value = useMemo(() => ({ token }), [token])
  return <SessionContext value={value}>{children}</SessionContext>
}

// useSession.ts
export const useSession = (): SessionState => use(SessionContext)
```

- Give the context a usable default (`{}`) so a missing provider degrades instead of crashing. Always memoize the provider value.
- **Required overloads.** `useUserEvents()` defaults to `'warn'` and logs on every call without a provider. `useUserEvents(true)` throws, and `useUserEvents(false)` stays quiet. Copy that shape when absence is a bug.
- **Provided flag.** foundation `/shared` exports `createContextEx<T>()`, whose default is `{ provided: false }`. `useContextEx(ctx, name, required = true)` throws when the provider is missing and `required` is set, and `useProvided(ctx)` reports presence. Example: `useCollapsible = () => useContextEx(CollapsibleContext, 'Collapsible', false)`.
- Export the provider, the hook and the state type. Exporting the context object is optional: `UserEventsContext` is exported, `ErrorReporterContext` is not.
- Each exported context must live in exactly one module. A provider and its hooks work only when every consumer reaches that module through the same copy ([imports.md](imports.md)).

The React ESLint layer starts at tier 2 ([rule tiers](../xy-toolchain/eslint.md#rule-tiers)). Its React X presets (eslint-plugin-react-x 5.24.8) set:

- `react-x/no-use-context`, `no-context-provider`, `no-forward-ref` and `no-unstable-context-value`: warn;
- `react-x/no-class-component`: error, except for classes with `componentDidCatch` or `getDerivedStateFromError` (error boundaries).

sdk-react lints at tier 2. Only json-viewer still uses `useContext` and `.Provider`, and the repo's ESLint config ignores it.

## MUI prop types

- **Intersections** extend MUI props: `type BusyBoxProps = BoxProps & BusyProps & { background?: boolean; paper?: boolean }`, and `FlexBoxProps = BusyBoxProps`.
- **Interfaces with `Omit`** replace a conflicting prop: `interface ButtonBaseExProps extends Omit<ButtonProps, 'href'>, BoxlikeComponentProps, BusyProps { disableUserEvents?; funnel?; intent?; placement?; target? }`.
- **Mutually exclusive props** use a union whose variants set the other fields to `never`: `ButtonExProps = ButtonBaseExProps & (ButtonOnlyHrefProps | ButtonOnlyToProps | ButtonNoToOrHrefProps)`. The runtime guard `asButtonHrefOrToProps` throws when `href` and `to` are both set.
- **Shared prop bags** come from foundation `/shared`: `BusyProps` (`busy`, `busyVariant`, `busyMinimum`, …), `BoxlikeComponentProps` and `MaterialUIThemeColor`.
- **Merging `sx`.** Put your defaults first and spread the caller's `sx` as an array after them. FlexRow's `toSxArray` is not exported, so write your own:

```tsx
import type { BoxProps, SxProps, Theme } from '@mui/material'
import { Box } from '@mui/material'
import React from 'react'

type SxItem = Extract<NonNullable<SxProps<Theme>>, readonly unknown[]>[number]
const isSxArray = (sx: SxProps<Theme> | undefined): sx is readonly SxItem[] => Array.isArray(sx)
const toSxArray = (sx: SxProps<Theme> | undefined): readonly SxItem[] => {
  if (sx === undefined) return []
  return isSxArray(sx) ? sx : [sx]
}

export type PanelProps = BoxProps & { dense?: boolean }
export const Panel: React.FC<PanelProps> = ({ dense, ref, sx, ...props }) => (
  <Box ref={ref} {...props} sx={[{ padding: dense === true ? 1 : 2 }, ...toSxArray(sx)]} />
)
```

- **`ref` is a prop.** Destructure it and pass it on. If a wrapper forgets to, the ref is dropped silently: in 12.0.1, `ButtonEx` forwards `ref` only when `to` is set.

## Async hooks

**`useAsyncEffect(effect, deps = [])`** (foundation `/async-effect`):

```tsx
import { useAsyncEffect } from '@ariestools/sdk-react-foundation/async-effect'

useAsyncEffect(async (mounted) => {
  const next = await loadProfile(id)
  if (mounted()) setProfile(next)
}, [id])
```

- The effect receives `isMounted()`. It turns `false` only on unmount, not when `deps` change, so a superseded run that resolves late still sees `true` and can overwrite newer state.
- **A returned cleanup is ignored**, although the type allows one. Put teardown in a separate `useEffect`.
- **The effect starts during render.** It runs through `usePromise`, which calls the factory inside `useMemo`. Treat the code before the first `await` as render code: no DOM work and no state updates. Under development StrictMode it can run twice.
- An async mutex serializes only the awaiting of results. Effect bodies for successive `deps` can overlap.
- Errors are logged with `console.error` and sent to `globalThis.rollbar?.error`, then swallowed. They never reach an error boundary, so catch and set error state yourself.

**`usePromise(factory, deps, { defaultValue?, debug? })`** (foundation `/promise`) returns `[result, error, state]`:

```tsx
import { usePromise } from '@ariestools/sdk-react-foundation/promise'

const [profile, error, state] = usePromise(() => loadProfile(id), [id])
```

- **Check `error`, not `state`.** An async rejection yields `[undefined, error, 'resolved']`. `'rejected'` appears only when the factory throws synchronously or the mutex fails.
- Results from superseded runs are discarded. While a new run is `'pending'`, `result` keeps the previous value.
- It also logs errors to the console and `globalThis.rollbar`. The `PromiseSettingsProvider` that would turn this off is not exported.
- To load a value, prefer `usePromise` over `useAsyncEffect` plus state: it handles stale runs and returns the error.

**`useAtomicPromise(name, factory, deps, config?)`** wraps the factory in a module-global `Mutex` keyed by `name`, so every call that shares `name` runs exclusively, app-wide.

## Error boundaries and reporting

| API | Owner | Behavior |
|---|---|---|
| `ErrorBoundary` | ui `/error` | Class with `children`, `fallback`, `fallbackWithError(error)` and `scope`. Only calls `console.error`; reports nothing |
| `ThrownErrorBoundary<T>` | app `/error` | Reports to the `rollbar` prop, else `useErrorReporter().rollbar`, else `globalThis.rollbar`. Renders `errorComponent(error, boundaryName)` or, by default, `ErrorRender`. Also takes `rethrow`, `scope` and `title`. Use 12.0.1 or later ([versions](overview.md#versions)) |
| `ErrorReporter` | ui `/error` | Interface `{ error(error: unknown): unknown }`. A Rollbar instance satisfies it structurally, and so does any adapter |
| `ErrorReporterProvider`, `useErrorReporter` | app `/error` | The `rollbar` prop is required by type. At runtime it falls back to `globalThis.rollbar` and throws if neither exists. The hook returns `{ rollbar? }` |
| `ErrorRender` | ui `/error` | Displays an error, and also sends it to `globalThis.rollbar` in an effect |

All of these are also exported from `@ariestools/sdk-react/error`. sdk-react 12.x has no runtime or peer dependency on `rollbar`.

```tsx
import type { ErrorReporter } from '@ariestools/sdk-react/error'
import { ErrorReporterProvider, ThrownErrorBoundary } from '@ariestools/sdk-react/error'

const reporter: ErrorReporter = myRollbar // or any adapter: { error: e => myService.capture(e) }

<ErrorReporterProvider rollbar={reporter}>
  <ThrownErrorBoundary boundaryName="App">
    <App />
  </ThrownErrorBoundary>
</ErrorReporterProvider>
```

- Assigning `globalThis.rollbar = reporter` also captures `usePromise`, `useAsyncEffect` and `ErrorRender` errors. sdk-react declares that global only in its own source, and the declaration is not shipped, so add `declare global { var rollbar: ErrorReporter | undefined }` to your app before you assign it.
- With a global reporter and the default `ErrorRender` fallback, each caught error is reported twice, once by the boundary and once by `ErrorRender`. Pass `errorComponent` if that matters.

## User events

```tsx
import type { UserEventHandler } from '@ariestools/sdk-react-foundation/user-events'
import { UserEventsProvider } from '@ariestools/sdk-react-foundation/user-events'

const userEvents: UserEventHandler = {
  funnelStarted: fields => console.info('funnelStarted', fields),
  testStarted: fields => console.info('testStarted', fields),
  userClick: fields => console.info('userClick', fields),
  viewContent: fields => console.info('viewContent', fields),
}

<UserEventsProvider userEvents={userEvents}><App /></UserEventsProvider>
```

- Implement `UserEventHandler` from foundation `/user-events`. It has four methods, `funnelStarted`, `testStarted`, `userClick` and `viewContent`, and each returns `Promisable<void>`.
- Mount `<UserEventsProvider userEvents={handler}>` once near the root. Keep `handler` stable (a module constant or `useMemo`), because the provider memoizes its value on it.
- Mount a provider even with a no-op handler. Without one, `ButtonEx`, `LinkEx`, `WebAppPage` and `Experiments` warn on every render, and `useExperiments` (analytics `/experiments`) throws.
- **Emitters.** `disableUserEvents` opts out, except as noted:
  - `LinkEx` (app `/link`) emits `userClick` on every click. An `href` link waits for the handler to settle before it runs `onClick` and navigates. A `to` link does not receive `disableUserEvents`, `funnel`, `intent` or `placement`, because `LinkEx` does not forward them to `LinkToEx`.
  - `ButtonEx` (ui `/button`) emits `userClick` only when it has an `href`. With a provider mounted, such a button's `onClick` runs twice, once immediately and once after `userClick` settles. `to` buttons and plain buttons emit nothing.
  - `WebAppPage` (app `/webapp`) emits `viewContent` on mount and whenever the path or title changes.
- Import the provider and hook only from `@ariestools/sdk-react-foundation/user-events`; the umbrella has no `/user-events` subpath ([where user events live](imports.md#where-user-events-live)). The bundled analytics handlers have their own caveats ([packages.md](packages.md#caveats-for-specific-packages)).

## Stories and specs

```tsx
import type { Meta, StoryFn } from '@storybook/react-vite'

const StorybookEntry: Meta<typeof Panel> = { component: Panel, title: 'panel/Panel' }
export default StorybookEntry
const Template: StoryFn<typeof Panel> = args => <Panel {...args}>Content</Panel>
export const Default: StoryFn<typeof Panel> = Template.bind({})
```

- `Meta` and `StoryFn` come from `@storybook/react-vite`. The title is a slash path such as `'button/ButtonEx'`.
- Wrap the providers a story needs inside the template, e.g. `UserEventsProvider` with a stub handler whose methods return `Promise.resolve()`.
- Stories are not compiled into `dist` and are not published.
- The sdk-react root `.storybook/main.ts` globs `../**/src/**/*.stories.@(ts|tsx|js|jsx)` with `@storybook/react-vite` 10.6, and `preview.tsx` switches between the shipped themes. In a consuming repo, `xy lint init` adds `configReactStorybook` ([eslint](../xy-toolchain/eslint.md#use-the-active-flat-config)).
- **Specs.** The root `vitest.config.ts` is `defineXyVitestConfig({ include: ['packages/*/src/**/spec/**/*.spec.{ts,tsx}'] })` and runs a Node project only. There is no DOM test environment: specs stub browser globals with `vi.stubGlobal` and test logic (app `ThrownErrorBoundary.spec.ts` calls the static `getDerivedStateFromError` unbound, as React does), and Storybook covers rendering. For realm routing see [spec-directory environment routing](../xy-toolchain/testing.md#spec-directory-environment-routing).

## Working inside sdk-react (maintainers)

The private `ariestools/sdk-react` repository pins pnpm 12.9.1 and `@ariestools/toolchain` ~10.0.8. Its AGENTS.md, CLAUDE.md and root README still describe yarn and `@xylabs/react-*`, so trust the package.json files and `packages/sdk/README.md`. Run everything from the repo root:

```sh
pnpm xy build          # compile, publint, deplint, lint
pnpm xy test           # every package's specs
pnpm storybook         # port 6006; pnpm start is the same with a larger heap
pnpm build-storybook
pnpm typedoc
```

To add a module:

1. Add `{ name, barrel: true, export: true }` to the owning package's `compile.monolith.modules`.
2. Add a `{ name, barrel: true, export: true, reexport: '@ariestools/sdk-react-<pkg>/<name>' }` entry to `packages/sdk/xy.config.ts` so the umbrella exposes it. Do not extend sdk-react-core.
3. Compile, which re-syncs `imports`, barrels and shims, or run `pnpm --filter <pkg> sync-sdk-layout` (`sync-sdk-layout:check` checks for drift). Layout sync does not write `exports`; `pnpm xy publint --fix` adds the new subpath.

Import rules inside the repo:

- Import sibling modules in the same package through `#<module>` aliases, and other sdk-react packages only by subpath, never by root. Declare a package you import in `dependencies` as `workspace:~`, as app does for foundation and ui.
- Never import a context-bearing module from a sibling at runtime. Under the default bundle linkage, the sibling's subpath would get its own copy of the context; `import type` is fine. The only duplicated context in 12.0.1 is the internal `PromiseSettingsContext`: `/async-effect`, `/flexbox` and `/shared` each bundle a copy through `useAsyncEffect`. It is harmless because no provider for it is exported.
