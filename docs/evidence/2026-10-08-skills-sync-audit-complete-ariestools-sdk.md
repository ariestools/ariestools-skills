---
title: "Skills sync audit (complete) 2026-10-08 — ariestools-sdk"
kind: evidence
state: active
date: "2026-10-08"
commit: "7e78933a8"
status: "Completed audit of the ariestools-sdk skill at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.1 (812b27a91) and @ariestools/sdk 9.0.1 (298fbb5bb); 39 merged open items from 102 raw findings, all verified by two lenses; 2 refuted, 0 resolved upstream; supersedes the partial 2026-10-08 audit."
audience: "ariestools-skills maintainers and agents updating the skill pack"
---

# Skills sync audit (complete) — ariestools-sdk

This document records the completed audit of `skills/ariestools-sdk/` at ariestools-skills 7e78933a8. An auditor found each open item: a per-file auditor, a source-side coverage sweep, an architecture reviewer or a targeted gap check. Two independent verifiers then confirmed it, one checking code truth and one checking the skill text. They checked against `@ariestools/toolchain` 10.1.1 (ariestools/toolchain main 812b27a91), ariestools/sdk-js at `@ariestools/sdk` 9.0.1 (298fbb5bb) and npm registry metadata. Their adjustments to severity, action and recommendation are folded in, and duplicate findings from overlapping auditors are merged into one item. This document does not establish that any fix has been applied. It is not a priority-ordered remediation plan, and no agent using the skill has tested the recommended replacement text. Back to the [Audit index](2026-10-08-skills-sync-audit-complete.md). Member ids refer to the raw [findings JSON](2026-10-08-skills-sync-audit-complete-findings.json). This document supersedes the [partial audit](../archive/evidence/2026-10-08-skills-sync-audit-ariestools-sdk.md), which ran against toolchain 10.1.0.

## Summary

The skill's routing structure is sound, but every content line dates from 8a7d4f0 (2026-07-31), which predates sdk-js 8.1.8 through 9.0.1. Six defaults break consumers who follow them:

- `zod` is called optional, yet the root barrel loads it.
- The advice to prefer subpaths splits classes and logger state away from the root barrel, which every downstream library imports.
- The auth fetcher example drops every SDK header.
- `fetchJson` is shown returning the DTO.
- The eth-address section names an export that the package does not have.
- The storage-adapters root barrel needs both backends.

Beyond those, the skill lacks 9.x context (Node >= 26, bounded reads, a correct `@xylabs/*` migration map), and much of its catalog text is thin or stale. No item depends on a toolchain 10.1.1 change.

| | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 0 | 1 | 0 | 1 |
| Update | 6 | 5 | 14 | 25 |
| Add | 0 | 6 | 7 | 13 |
| **Total** | **6** | **12** | **21** | **39** |

39 open items (102 raw findings) · 2 refuted · 0 resolved upstream

## `skills/ariestools-sdk/SKILL.md`

### Update

- ⚪ **Router and overview omit `@ariestools/sdk-meta`, which makes the toolchain require this skill**
  - **Now:** SKILL.md:3 lists "(express, storage-adapters, threads, testing, telemetry, crypto-auth, eth-address, pixel, json-rpc-engine)". SKILL.md:28 lists the same set, and the overview.md:62-72 specialist list also leaves out sdk-meta. packages.md:19 and :109-111 do cover sdk-meta.
  - **Actual:** sdk-js publishes 11 public packages at 9.0.1. One is `@ariestools/sdk-meta`, which builds HTML head, OpenGraph and Twitter meta on cheerio. Another is the npm-deprecated `@ariestools/crypto`. Toolchain 10.1.1 lists both in `ARIESTOOLS_SDK_JS_PACKAGES`, so either one makes the toolchain require this skill. Crypto is already routed through SKILL.md:36 ("crypto polyfills") and conventions.md:24. The real gap is sdk-meta, which is missing from the trigger and router lines.
  - **Fix:** Add `sdk-meta` to the SKILL.md:3 specialist list. Add "sdk-meta (server-side HTML head / OpenGraph / Twitter meta)" to SKILL.md:28. In overview.md:64-72, add "HTML `<head>`/meta tag merging and building → `@ariestools/sdk-meta`". Do not add the deprecated crypto package to the "Use when" triggers. Ship this together with the packages.md sdk-meta rewrite, so the new trigger leads to useful content.
  - **Evidence:** ariestools/sdk-js/packages/meta/package.json:2, src/index.ts:1-4; ariestools/sdk-js/packages/crypto/package.json:5; `npm view @ariestools/crypto version deprecated` → 9.0.1, "Use platform native crypto functionality instead"; ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-40, skillRules.ts:149-163, lint.ts:113.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#0, cov-sdk-umbrella#12, skills/ariestools-sdk/overview.md#6</sub>

- ⚪ **Router sends "platform-conditional modules" to conventions.md, which has no such section**
  - **Now:** SKILL.md:36 routes "import style, tree-shaking, platform-conditional modules, deprecations …" to conventions.md.
  - **Actual:** conventions.md has these sections: Import style, ESM only, Tree-shaking, Deprecations, Relationship to the toolchain, Monolith layout, Testing consumers and Checklist. None of them covers platform-conditional modules; the guidance is at modules.md:98-100. The root `.` export also has `node`/`browser`/default conditions. However, dist/node, dist/browser and dist/neutral `index.mjs` are byte-identical (124,675 B, and all three embed the neutral platform/url code), so at runtime only `/platform` and `/url` differ by platform. Within `/platform`, `subtle` is exported only under the `node` condition (from `node:crypto`) and the neutral default. The browser entry exports only `isNode`, `isBrowser` and `isWebworker`.
  - **Fix:** Move "platform-conditional modules (platform, url)" from SKILL.md:36 to the modules line at SKILL.md:24. Optionally add to modules.md:98-100: "`subtle` is exported only under the `node` and default conditions; browser builds get `isNode`/`isBrowser`/`isWebworker` only — use `globalThis.crypto.subtle` there." Do not describe the root barrel as a per-platform build. *Resolved:* conventions.md#3 claimed the root is platform-conditional through its platform and url re-exports. That claim has no runtime effect, because `cmp` shows the three root bundles are identical.
  - **Evidence:** skills/ariestools-sdk/conventions.md:3-54 (headings); skills/ariestools-sdk/modules.md:98-100; ariestools/sdk-js/packages/sdk/package.json exports `.`, `./platform`, `./url`; src/modules/platform/browser/index.ts (no `subtle`), platform/node/index.ts:4, platform/index-neutral.ts:20; dist/browser/platform.mjs export list; `cmp dist/node/index.mjs dist/browser/index.mjs` and `… dist/neutral/index.mjs` → identical.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#4, skills/ariestools-sdk/conventions.md#3</sub>

- ⚪ **Trigger "@ariestools/* utilities" claims more than this sdk-js-only skill covers**
  - **Now:** SKILL.md:3: "Use when importing or choosing @ariestools/* utilities". The skill has no out-of-scope note, and packages.md:3 adds "(or closely related Aries Tools packages)".
  - **Actual:** The `@ariestools` scope also contains sdk-react (`@ariestools/sdk-react` 12.0.1 plus ten `sdk-react-*` packages), actor-kit (`@ariestools/actor*` and `provider*`, 2.0.0), browser-kit (2.0.0) and cli-kit (2.1.0). No skill covers them, and toolchain detection counts only sdk-js packages. actor-kit and sdk-react depend on `@ariestools/sdk`, so their repos get this skill installed. The skill should keep its name: it is wired into the toolchain (the lint.ts:113 reason, detectProfile.ts:26, `SKILL_ORDER` at skillRules.ts:36-47) and pinned in the skills-lock.json of sdk-js, sdk-react, actor-kit and browser-kit.
  - **Fix:** Keep the name `ariestools-sdk`. Narrow the trigger to "@ariestools/* packages published from sdk-js". After SKILL.md:12, add: "Not covered: `@ariestools/sdk-react*`, actor-kit (`@ariestools/actor*`, `provider*`), browser-kit, cli-kit — read those repos' READMEs." Delete "(or closely related Aries Tools packages)" from packages.md:3. Add pointers to sibling skills only once those skills exist.
  - **Evidence:** ariestools/sdk-react/packages/sdk/package.json; ariestools/actor-kit/packages/actor/package.json; ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-40, lint.ts:113, skillRules.ts:36-47; ariestools/sdk-react/skills-lock.json.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#5, arch-coverage#11</sub>

- ⚪ **No Authority line, unlike the other three skills**
  - **Now:** SKILL.md:10-14 holds the scope line, the "builds on" line (:12) and Skill identity (:14). There is no Authority line and no `## Related skills` section.
  - **Actual:** xy-development (:10, :30), xy-toolchain (:10, :48) and xy-agent (:10, :42) each have both. Toolchain defaults.ts:3-6 names ariestools-skills as the source of truth for ariestools-sdk. xyo-skills has no ariestools-sdk stub, because `MIGRATED_SKILLS` lists only xy-development and xy-toolchain.
  - **Fix:** Add "**Authority.** This skill is maintained only in ariestools/ariestools-skills; edit there, not in installed copies." Leave out the xyo-skills stub clause that the other skills carry. A `## Related skills` section is optional. If you add one, turn the :12 "builds on" line into it rather than duplicating it.
  - **Evidence:** `grep -n "Authority\|Skill identity\|Related skills" skills/*/SKILL.md`; ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:3-17.
  - <sub>ids: arch-layering#14</sub>

## `skills/ariestools-sdk/conventions.md`

### Update

- 🔴 **Import guidance prefers subpaths, but each subpath is a separate bundle, so its classes and static state are not the root's, which actor-kit, sdk-react and XYO libraries use**
  - **Now:** conventions.md:5 "Prefer **named exports** from `@ariestools/sdk/<module>` or the root barrel."; :6 "Prefer **subpath imports** for clarity and smaller mental graphs"; :17 "Prefer subpaths in libraries that care about minimal dependency graphs."; :56 "Prefer `@ariestools/sdk` + subpath for neutral helpers." The same advice appears at overview.md:22 ("subpaths are clearer and tree-shaking-friendly"), which shows a mixed root/subpath example at :24-28, and at modules.md:3 ("Prefer subpaths when the import set is small"). fetch.md:20, :37 and :56 import the class `FetchClient` from `@ariestools/sdk/fetch`.
  - **Actual:** sdk-js builds `@ariestools/sdk` as a monolith with the default `moduleLinkage: 'bundle'`, so every entry is a self-contained copy. The root resolves to dist/node or dist/browser `index.mjs`, and each subpath resolves to its own `dist/neutral/<m>.mjs`.
    - *Runtime:* `root.AbstractCreatable !== /creatable`, and a `/promise` `PromiseEx` is not `instanceof` the root's `PromiseEx`. The `Base` classes behind `/creatable`, `/events` and `/base` are three different classes (`var Base = class` appears in 6 entries and TimerScheduler in 9).
    - *Static state:* calling `initDefaultLogger` from `/base` sets `/base`'s `Base.defaultLogger` but not the root's. actor-kit Actors extend the root `AbstractCreatable`, so they get no default logger.
    - *Types (9.0.1, NodeNext):* root types come from dist/node and subpath types from dist/neutral. 12 declaration files carry private or protected members, among them AbstractCreatable, PromiseEx, Base, BaseEmitter, Events, IdLogger and ApiClient. For those classes, root and subpath types fail with TS2322.
    - *Toolchain:* toolchain 10.0.9 and later (6e056462a) dedupes declarations on the next sdk-js build; sdk-js is on 10.0.7. That removes the type errors but not the runtime copies, and 10.1.1 does not change linkage.
    - *Ecosystem (root/subpath import counts):* actor-kit 18/0 (commit 5299634 switched to root for exactly this reason), sdk-react 115/0, browser-kit 1/0, xyo-chain 3529/0.
    - *Size:* subpaths save neither size nor peers once anything in the graph imports the root. The 11 common subpaths total 131,660 B, against 124,675 B for the root.
    - The SDK already brands `FetchError` for this case: `isFetchError` holds across copies, while `instanceof` does not.
  - **Fix:** Replace conventions.md:5-6 and :56 with:
    > Import from the root `@ariestools/sdk` by default; libraries built on it (actor-kit, sdk-react, XYO/XL1) import the root. In 9.x every entry is a separate bundle, so a class or module state reached through a subpath is a different object from the root's. Use subpaths only for `import type` and stateless functions (assertEx, exists, delay, typeof guards, toSafeJsonObject, fetchJson*). Never import classes or stateful setup through a subpath (AbstractCreatable, Base/initDefaultLogger, BaseEmitter/Events, PromiseEx, TimerScheduler, ApiClient, logger classes), never combine two class-bearing subpaths, and use one import style per package across the dependency graph. Across packages, use the `is*` brand guards (`isFetchError`), not `instanceof`.

    Rewrite Tree-shaking (:15-17) to say the root is `sideEffects: false` and tree-shakes in bundlers, while subpath bundles duplicate shared code. Add a version note: once sdk-js builds with toolchain 10.0.9 or later, declarations are shared and tsc stops reporting root/subpath mismatches, but the runtime copies remain until sdk-js adopts `moduleLinkage: 'external'`. In overview.md:22-28, write "Import from the root barrel; use subpaths only for `import type` and stateless helpers (see conventions.md)", and drop the "clearer and tree-shaking-friendly" claim and the mixed example. Change modules.md:3 to present subpaths as a catalog of types and stateless functions, not as a preference. Switch fetch.md:20, :37 and :56 to root imports, or name `FetchClient` as an explicit stateless exception. Checklist item 3 (:58) is covered by the `zod` item under overview.md. storage-adapters is the opposite case; see packages.md.
  - **Evidence:** ariestools/sdk-js/packages/sdk/xy.config.ts:8-153 (monolith, no `moduleLinkage`); ariestools/toolchain/packages/toolchain/src/actions/package/compile/MonolithConfig.ts:153-166 ("shared code is duplicated across entries so object identity does not hold between subpaths"); ariestools/sdk-js/packages/sdk/package.json:27 (`sideEffects: false`), :128-142 (`.`), :179-181 (`./creatable`); src/modules/base/Base.ts:43,109-112; base/initDefaultLogger.ts:44-55; src/modules/fetch/FetchError.ts:196-203; ariestools/actor-kit commit 5299634, packages/actor/src/Actor.ts:53; `node --input-type=module -e` identity and logger checks in packages/sdk and actor-kit/packages/actor; a tsc 6.0.3 NodeNext TS2322 repro; ariestools/toolchain/packages/tsconfig/tsconfig.json (NodeNext); toolchain 6e056462a (first in v10.0.9).
  - <sub>ids: arch-coverage#0, gap-gap-sdk-subpath-identity#0, gap-gap-sdk-subpath-identity#1, skills/ariestools-sdk/conventions.md#4</sub>

- 🟠 **`@ariestools/crypto` is npm-deprecated as a whole package, not just for "polyfill-oriented use"**
  - **Now:** conventions.md:24 "| `@ariestools/crypto` polyfill-oriented use | Prefer platform native Web Crypto / Node crypto |"; packages.md:20 "Avoid for new work — prefer platform native crypto; `@ariestools/crypto` is legacy-oriented".
  - **Actual:** Both package.json and npm carry `deprecated: "Use platform native crypto functionality instead"` (since 75e3ed8dd, 2026-07-09). The package exports only `Crypto`, an alias of `globalThis.crypto` or `node:crypto`, and a no-op `cryptoPolyfill()`, both marked `@deprecated`. It has no use beyond the polyfill, so installing it only prints a deprecation warning.
  - **Fix:** Change conventions.md:24 to "| `@ariestools/crypto` (whole package, npm-deprecated) | Do not add it. Use `globalThis.crypto` / `node:crypto`; remove `cryptoPolyfill()` calls (no-ops) |". Change packages.md:20 to "Deprecated on npm — do not install; use Web Crypto (`globalThis.crypto`) or `node:crypto`". *Resolved:* one finding suggested `subtle` from `@ariestools/sdk/platform` as the replacement. The browser entry of `/platform` does not export `subtle`, so do not recommend it for browser code.
  - **Evidence:** ariestools/sdk-js/packages/crypto/package.json:5; packages/crypto/src/{browser,node}/Crypto.ts, cryptoPolyfill.ts; packages/crypto/README.md; `npm view @ariestools/crypto deprecated`; ariestools/sdk-js/packages/sdk/src/modules/platform/browser/index.ts.
  - <sub>ids: skills/ariestools-sdk/conventions.md#5, skills/ariestools-sdk/packages.md#10, cov-sdk-specialist#12</sub>

- ⚪ **Maintainer notes use the removed `sdkModules` term, point to a stale README section and cover only `@ariestools/sdk`**
  - **Now:** conventions.md:39 "pnpm sync-sdk-layout   # after editing sdkModules / monolith layout"; :42 "Do not hand-edit generated monolith shims under `packages/sdk/src/*.ts`…"; :46 "`@ariestools/sdk` uses toolchain **monolith** compile mode. … See the package README "Monolithic layout" section."
  - **Actual:**
    - `sdkModules` and scripts/sync-sdk-layout.mjs were removed on 2026-07-06 (0cfffd89f). Modules are now declared under `compile.monolith.modules`, with `model`/`barrel`/`export`/`internal` flags, in each package's xy.config.ts.
    - The root `pnpm sync-sdk-layout` filters to `@ariestools/sdk` and runs the toolchain bin `package-sync-layout`. `sync-sdk-layout:check` exists only in packages/sdk. `xy compile` re-syncs automatically, and this is unchanged in 10.1.1.
    - The sync writes package.json `imports`, tsconfig paths, src/index.ts, src/model.ts and the per-module shims. It does not write `exports`; `xy publint --fix` checks and fixes those.
    - `@ariestools/storage-adapters` and `@ariestools/testing` are monolith packages too, with generated "do not edit by hand" `src/*.ts` files, and neither defines the sync-sdk-layout scripts.
    - The README section the skill points to still describes `sdkModules` and the deleted script.
  - **Fix:** Change the :39 comment to "# after editing compile.monolith.modules in packages/sdk/xy.config.ts" and add `pnpm --filter @ariestools/sdk sync-sdk-layout:check`. Rewrite :42/:46 to cover all three packages: "`@ariestools/sdk`, `@ariestools/storage-adapters` and `@ariestools/testing` use monolith mode. Do not hand-edit their generated `src/*.ts` shims. `pnpm xy compile`/`build` re-syncs the layout; for storage-adapters and testing you can also run `package-sync-layout [--check]` in that package. The sync regenerates `imports`, tsconfig paths and shims, and `xy publint --fix` checks and fixes new subpath `exports`." Replace the README pointer with `[xy-toolchain compilation](../xy-toolchain/compilation.md#monolith-mode)`.
  - **Evidence:** ariestools/sdk-js/packages/sdk/xy.config.ts:8-153; ariestools/sdk-js/packages/{storage-adapters,testing}/xy.config.ts and src/index.ts:1 headers; ariestools/sdk-js/package.json:34 and packages/sdk/package.json:381-382 (scripts); `git log --diff-filter=D` → 0cfffd89f; ariestools/toolchain/packages/toolchain/package.json:46 (bin), src/actions/package/compile/packageCompileMonolith.ts:156-157, monolithCompileLayout.ts:308-350; ariestools/sdk-js/packages/sdk/README.md:221-224; [skills/xy-toolchain/compilation.md](../../skills/xy-toolchain/compilation.md) :95-110.
  - <sub>ids: skills/ariestools-sdk/conventions.md#10, cov-sdk-umbrella#11, cov-sdk-specialist#17, skills/ariestools-sdk/conventions.md#11</sub>

- ⚪ **Checklist item 5 forbids Undici in shared libraries, but the SDK allows a module-local Undici fetcher there**
  - **Now:** conventions.md:60 "5. For Node HTTP caching, own Undici in the app — not in shared libraries."
  - **Actual:** The SDK README says only a terminal application should replace the global dispatcher. Imported libraries may inject a module-local fetcher that owns its own dispatcher and cache, which fetch.md:45 and :51-81 already show. Undici is never a dependency of `@ariestools/sdk`.
  - **Fix:** Change item 5 to "5. Only terminal apps (services, CLIs, worker entrypoints) install a global Undici dispatcher. Libraries that need caching inject a module-local `fetcher` and own its lifecycle; never make Undici a dependency of a shared library just to change global fetch."
  - **Evidence:** ariestools/sdk-js/packages/sdk/README.md:31-35, :38-73, :106-109.
  - <sub>ids: skills/ariestools-sdk/conventions.md#13</sub>

### Add

- ⚪ **The deprecation table leaves out the API-level deprecations still exported by the specialists and the umbrella**
  - **Now:** conventions.md:19-25 has only three rows (telemetry re-exports, crypto, `@xylabs/*`).
  - **Actual:** These deprecated APIs are still exported:
    - crypto-auth `encryptSeedPhrase`/`decryptSeedPhrase` → `SeedPhraseVault#encryptPhrase`/`#decryptPhrase` (or `VaultCrypto`)
    - express `Logger`/`LogFunction` types → `@ariestools/sdk/logger`
    - eth-address `ellipsize` → `@ariestools/sdk/ellipsize`
    - sdk/hex `EthAddressToStringSchema`/`EthAddressFromStringSchema` → the `…Zod` schemas
    - sdk/object `PartialRecord` → `Partial<Record<>>`

    All were deprecated before the skill was written. `XyConsoleSpanExporter` is covered under modules.md.
  - **Fix:** Add a compact "API-level deprecations" sub-table with these mappings. Alternatively, add one line pointing to `@typescript-eslint/no-deprecated`, plus the seed-phrase functions and `XyConsoleSpanExporter`.
  - **Evidence:** ariestools/sdk-js/packages/crypto-auth/src/seedPhrase.ts:10-21, SeedPhraseVault.ts:119,134; packages/express/src/Logger/index.ts:9-13; packages/eth-address/src/ellipsize.ts:2; packages/sdk/src/modules/hex/ethAddress.ts:19,28; packages/sdk/src/modules/object/PartialRecord.ts:3.
  - <sub>ids: skills/ariestools-sdk/conventions.md#9</sub>

## `skills/ariestools-sdk/fetch.md`

### Update

- 🔴 **Auth-wrapping fetcher example object-spreads a `Headers` instance and silently drops every SDK header, including `Content-Encoding: gzip`**
  - **Now:** fetch.md:39-40 `globalThis.fetch(input, { ...init, headers: { ...init?.headers, authorization: token } })`
  - **Actual:** `fetchJson` and `FetchClient` always hand the fetcher a `Headers` instance: `buildHeaders()` returns `new Headers()`, and `fetchCompress` builds `new Headers(init.headers)` and sets `Content-Encoding: gzip` on bodies over 1024 characters. A `Headers` object has no own enumerable properties, so the spread keeps only `authorization`. Accept and Content-Type are lost, and gzip bodies arrive without `Content-Encoding`, so the server cannot decode them.
  - **Fix:** Replace the example with:
    ```ts
    const fetcher: FetchFunction = (input, init) => {
      const headers = new Headers(init?.headers)
      headers.set('authorization', token)
      return globalThis.fetch(input, { ...init, headers })
    }
    ```
    Add: "`init.headers` reaching a fetcher is a `Headers` instance — never object-spread it. Keep `...init` so `signal` is forwarded. For auth that needs no transport control, prefer client-level `headers` config."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/fetchJson.ts:9-20,38-41; FetchClient.ts:60-71,171-182; fetchCompress.ts:49,55-68; on Node 26.9.0, `node -e "const h=new Headers({'content-type':'application/json',accept:'x'}); console.log(JSON.stringify({...h, authorization:'t'}))"` → `{"authorization":"t"}`.
  - <sub>ids: skills/ariestools-sdk/fetch.md#0, cov-sdk-specialist#2</sub>

- 🔴 **`fetchJson` is shown returning the DTO, but it returns a `{ data, status, … }` envelope and never throws on non-2xx, while `FetchClient` throws `FetchClientError`**
  - **Now:** fetch.md:22 `const data = await fetchJson<MyDto>('https://api.example.com/item')`; :25 `await client.get('/item')`; :30 lists only `FetchError`, `isFetchError`, `toFetchError`, `classifyFetchError`; :117 warns only about retries and caching. No return type or throw behavior is documented anywhere.
  - **Actual:**
    - `fetchJson<T>` and `fetchJsonGet`/`Post`/`Put`/`Patch`/`Delete` resolve to `FetchJsonResponse<T>` = `{ data: T | null, headers, response, status, statusText }`. `data` is `null` for empty bodies and for malformed non-2xx bodies.
    - They resolve on 4xx and 5xx responses, and throw `FetchError` only for transport, parse-on-success and policy failures.
    - `FetchClient`, `FetchJsonClient` and the `fetchJsonClient` instance return the same envelope, but they throw `FetchClientError` when `validateStatus` rejects the status. `FetchClientError` is a `FetchError` subclass with type `'http-status'`, `.response` and `.config`. By default 200-299 passes, a custom function overrides that, and `validateStatus: null` never throws.
    - The `FetchErrorType` values are `timeout`, `aborted`, `http-status`, `parse`, `response-too-large` and `network`.
  - **Fix:** Change the examples to `const { data, status } = await fetchJson<MyDto>(url) // data: MyDto | null` and `const { data: item } = await client.get<MyDto>('/item')`. Add a short "Result and errors" subsection:
    - Use the `fetchJson*` helpers when you want to branch on `status`/`response.ok` yourself.
    - Use `FetchClient`/`fetchJsonClient` for Axios-style throw-on-non-2xx, and catch `FetchClientError` (or `isFetchError(e) && e.type === 'http-status'`).
    - Document `validateStatus` (a function, or `null`).

    Add `FetchClientError` to the :30 list, and extend :117 with "do not assume `fetchJson` throws on non-2xx".
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/types.ts:10-21; fetchJson.ts:31,43-53; parseJson.ts:44,60-82; methods.ts:7-42; FetchClient.ts:16-21,34-58,197-211; FetchError.ts:19-31; fetchJson.spec.ts:81-86,146-148; FetchClient.spec.ts:264-307.
  - <sub>ids: skills/ariestools-sdk/fetch.md#1, cov-sdk-umbrella#3, skills/ariestools-sdk/fetch.md#2, cov-sdk-specialist#3</sub>

- ⚪ **Export inventory leaves out the `FetchJsonClient` class, the type exports, the `fetch/model` subpath and the Axios/`@xylabs/fetch` migration**
  - **Now:** fetch.md:7 "Helpers such as `fetchJson`, `fetchCompress`, `FetchClient`, and `fetchJsonClient`". There is no type-only subpath and no migration note.
  - **Actual:** `@ariestools/sdk/fetch` also exports the `FetchJsonClient` class (with `static create`), `FetchClientError` and `readResponseText`. Its types are exported from there and from `@ariestools/sdk/fetch/model`: FetchClientConfig, FetchClientRequestConfig, FetchCompressOptions, FetchFunction, FetchErrorContext, FetchErrorJson, FetchErrorType, FetchJsonOptions, FetchJsonResponse and ReadResponseTextOptions. `FetchError` has `toJSON()` for logging. `FetchJsonClient`/`fetchJsonClient` replace `axiosJson`/`AxiosJson` from `@xylabs/axios`, and `@xylabs/fetch` (8.0.2) is deprecated in favor of `@ariestools/sdk/fetch`.
  - **Fix:** Expand :7 into a short export list that includes `FetchJsonClient`, `FetchClientError` and `readResponseText`. Name `@ariestools/sdk/fetch/model` for type-only imports. Add: "`@xylabs/axios` `axiosJson`/`AxiosJson` → `fetchJsonClient`/`FetchJsonClient`; `@xylabs/fetch` → `@ariestools/sdk/fetch`."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/index.ts:1-27, model.ts:1-12, FetchJsonClient.ts:4-31, FetchError.ts:182-193; packages/sdk/package.json:227-234; `npm view @xylabs/fetch deprecated version`.
  - <sub>ids: skills/ariestools-sdk/fetch.md#6</sub>

- ⚪ **Undici guidance drops the README's "compatible Undici release" qualifier**
  - **Now:** fetch.md:49 "If you need caching in Node, the **consumer** installs Undici and supplies a fetcher or global dispatcher."
  - **Actual:** The README says to install "a compatible Undici release". On the global-dispatcher path, Node's built-in fetch reads the dispatcher from `Symbol.for('undici.globalDispatcher.2')`. An Undici whose `setGlobalDispatcher` writes only the `.1` symbol does not affect `globalThis.fetch`: caching is silently skipped and nothing errors. Node 26.9.0 bundles undici 8.10.2. Undici 7.29.1 and 8.x both write both symbols, and both worked when tested on Node 26. The snippet APIs are valid in both versions, and module-local fetchers that use undici's own `fetch` are unaffected. *Resolved:* the original finding said the installed major must match Node's bundled undici. That is too strict, because both verifiers saw 7.29.1 work on Node 26.
  - **Fix:** Change :49 to: "the **consumer** installs a current Undici release compatible with the running Node's built-in fetch (undici 7.29+ or 8.x on Node 26; check `process.versions.undici`) and supplies a fetcher or global dispatcher. An outdated undici can make `setGlobalDispatcher` silently miss `globalThis.fetch`; a module-local fetcher using undici's own `fetch` is unaffected." Optionally add: install the global dispatcher once, before normal requests start.
  - **Evidence:** ariestools/sdk-js/packages/sdk/README.md:33-36, :111-113; `node -p process.versions.undici` → 8.10.2 on Node 26.9.0; undici 7.29.1 lib/global.js:5-6,19-31; undici 7.29.1 and 8.10.2 types/cache-interceptor.d.ts, interceptors.d.ts:80; a dispatcher test against built-in fetch on Node 26.9.0.
  - <sub>ids: skills/ariestools-sdk/fetch.md#7</sub>

### Add

- 🟠 **Bounded, cancellable response reads (`maxResponseBytes`, `timeout`, `signal`, `readResponseText`) are missing from fetch.md and the router**
  - **Now:** absent. A grep of skills/ariestools-sdk/ for maxResponseBytes, readResponseText, timeout and signal finds nothing. SKILL.md:32 routes only "calling `fetchJson` / `FetchClient`, injecting a custom fetcher, or configuring Node HTTP caching with Undici".
  - **Actual:** Since b86f3a024 (2026-08-27, first released in v8.2.0):
    - `fetchJson`, `FetchClient` and `FetchJsonClient` accept `maxResponseBytes`. It must be a positive safe integer, is validated before any I/O (otherwise `RangeError`), counts decoded stream bytes, and also applies to non-2xx bodies.
    - The `FetchClient` `timeout` (in ms; 0 disables it) composes with the caller's `signal`, and the first abort wins. The signal stays active while the body is consumed.
    - Failures are `FetchError` with type `'response-too-large'`, `'aborted'` or `'timeout'`.
    - When a cap or signal is set, read errors on non-2xx bodies propagate instead of becoming `data: null`, even with `validateStatus: null`.
    - `readResponseText(response, { maxResponseBytes, signal })` is exported, and `ReadResponseTextOptions` comes from `@ariestools/sdk/fetch/model`.
    - The README notes that the SDK applies no SSRF, redirect or credentials policy.

    Since 158476cd7 (2026-09-18, released in v9.0.1), when a cap or signal is set and the body is not a WHATWG stream (node-fetch or cross-fetch Readables, whatwg-fetch or React Native polyfills, Response-like test doubles), the read falls back to `response.text()`. The whole body is buffered before the cap is checked against its UTF-8 byte length, and abort rejects promptly but cannot cancel the body. Earlier versions threw ("body.getReader is not a function" or "Cannot read properties of undefined"). Without a cap or signal, `text()` was always used. `FetchJsonClient`, `FetchClientError`, `timeout` and `validateStatus` predate the skill (d851346dd, 2026-07-06); only the bounded-read surface is newer.
  - **Fix:** Change SKILL.md:32 to "Read when calling `fetchJson` / `FetchClient`, bounding or cancelling response reads (`maxResponseBytes`, `signal`, client `timeout`, `readResponseText`), injecting a custom fetcher, or configuring Node HTTP caching with Undici (consumer-owned)." Add a fetch.md section "Bounded reads, timeouts and cancellation", condensed from README.md:133-212. It should contain:
    - an example that passes `{ maxResponseBytes, timeout }` to a client plus a per-request `signal`;
    - the rules above and the three error types;
    - the note that non-2xx read errors propagate under a cap or signal;
    - a `readResponseText` example that imports its options type from `/fetch/model`;
    - a caveat that injected fetchers must forward `init.signal` (spreading `...init` does), and that non-native fetchers combined with a cap or signal buffer the body before the cap is checked (needs 9.0.1 or later);
    - one line telling callers to set `redirect: 'error'` and `credentials: 'omit'` themselves when needed.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/types.ts:4-7; FetchClient.ts:14-15,158-187; requestSignal.ts:12-32; readResponseText.ts:5-23,40-44,129-146,156-181; parseJson.ts:60-76; FetchError.ts:15,30; index.ts:25-27; model.ts:11; packages/sdk/README.md:133-212; `git tag --contains b86f3a024` → v8.2.0 first; 158476cd7 is an ancestor of v9.0.1 but not of v8.3.0.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#3, skills/ariestools-sdk/fetch.md#3, cov-sdk-umbrella#4, cov-sdk-specialist#4, skills/ariestools-sdk/fetch.md#4</sub>

- 🟠 **Request-side behavior is undocumented: gzip of bodies over 1024 characters by default, `body` vs `data`, WHATWG `baseURL` resolution and shallow-merged client defaults**
  - **Now:** fetch.md:7 names `fetchCompress` without explaining it, :24 shows only `baseURL`, and :28 lists the method helpers without saying how they treat request bodies.
  - **Actual:**
    1. Compression is on by default in every helper. A request body whose string form exceeds `compressMinLength` (default 1024) is gzipped and sent with `Content-Encoding: gzip`, so the server must accept gzip request bodies. Raise `compressMinLength` to opt out.
    2. `fetchJson`'s `body` is a native `BodyInit` sent as-is, so pass a JSON string. `fetchJsonPost`/`Put`/`Patch(url, data, options)` and `client.post`/`put`/`patch(url, data)` run `JSON.stringify` on `data`.
    3. `FetchClient` resolves paths with `new URL(path, baseURL)`. `/item` against `https://api.example.com/v1` gives `https://api.example.com/item`, which differs from Axios-style joining.
    4. Instance defaults are shallow-merged beneath per-request config, so a per-request `headers` or `params` replaces the client's instead of merging with it.
  - **Fix:** Add a compact "Request options" table:
    - `baseURL`: WHATWG resolution; keep a base path by using a trailing slash and a relative path.
    - `params`, `headers`, `timeout`, `validateStatus`, `fetcher`, `maxResponseBytes`.
    - `compressMinLength`: default 1024, with gzip on by default.

    Note that per-request config shallow-replaces client defaults, including `headers` and `params`. Add one line saying `fetchJson` takes a string `body`, while the method helpers and client methods take `data`.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/fetchCompress.ts:15-26,47-68; FetchJsonClient.ts:8-13; methods.ts:13-37; FetchClient.ts:9-32,73-83,97,152,178-180; FetchClient.spec.ts:193-199; `node -p "new URL('/item','https://api.example.com/v1').href"`.
  - <sub>ids: skills/ariestools-sdk/fetch.md#5</sub>

## `skills/ariestools-sdk/modules.md`

### Update

- 🟠 **The forget row points to a nonexistent `forget/node` subpath; `/forget` already is the Node variant**
  - **Now:** modules.md:38 "Fire-and-forget promises (node variants under forget/node)"
  - **Actual:** The exports map has only `./forget` and `./forget/model`, so importing `@ariestools/sdk/forget/node` fails with ERR_PACKAGE_PATH_NOT_EXPORTED. The published `/forget` is a single neutral build that re-exports the Node variant on every platform: `forgetNode as forget` and `ForgetPromiseNode as ForgetPromise`. Its `ForgetNodeConfig` adds `terminateOnException` and `terminateOnTimeout`, which default to false and call `process.exit(1)` or `process.exit(2)` when enabled. The neutral variant is not exported on any subpath.
  - **Fix:** Rewrite the row as: "`forget(promise, config?)`, `ForgetPromise`. The published entry is the Node-capable variant on all platforms; `terminateOnException`/`terminateOnTimeout` (default false) call `process.exit`, so leave them off in browser or library code. There is no `/forget/node` subpath."
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:235-242; src/modules/forget/index.ts:1; forget/node/index.ts:1-3; forget/ForgetNodeConfig.ts:7-19; dist/neutral/forget.mjs:222,239,248-252.
  - <sub>ids: skills/ariestools-sdk/modules.md#1, cov-sdk-umbrella#5</sub>

- 🟠 **The retry example hides that `retry` never retries thrown errors and defaults to zero retries**
  - **Now:** modules.md:79 `await retry(async () => doWork(), { /* options per package API */ })`; :47 "Retry helpers".
  - **Actual:** `retry(func, config?)` has no try/catch, so a thrown error propagates on the first attempt. It re-runs only while `complete(result)` is false, and by default that means the result is `undefined`. The defaults are `retries = 0`, `interval = 100` ms and `backoff = 2`, and once retries run out it resolves `undefined`. Because a void `doWork()` is never "complete", `retries: N` runs it N+1 times even when every attempt succeeds.
  - **Fix:** Replace the placeholder with `const value = await retry(() => fetchMaybe(), { retries: 3, interval: 100, backoff: 2, complete: v => v !== undefined })`. Add a note: "retry re-runs on an incomplete/`undefined` result, not on exceptions — catch inside and return `undefined` to trigger a retry. The default is 0 retries, and exhaustion returns `undefined`."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/retry/retry.ts:5-18, :26-41 (no catch at :30; defaults at :28); src/spec/retry/retry.spec.ts (no throw case).
  - <sub>ids: skills/ariestools-sdk/modules.md#2, cov-sdk-umbrella#6</sub>

- ⚪ **Catalog cells for `base`, `logger`, `typeof` and `platform` are stale, and one names a nonexistent export**
  - **Now:** modules.md:28 "Base types / shared foundations"; :42 "`ConsoleLogger`, level/silent loggers"; :54 "Runtime type checks, branding, `is` / `ifTypeOf`"; :44 "Platform detection (node/browser conditional)".
  - **Actual:**
    - `base` exports the `Base` class, which carries a logger, OTel meter and tracer providers, and the process-wide `Base.defaultLogger`. It also exports `globallyUnique` and `initDefaultLogger({ logLevel, defaultLogLevel, moniker, silent })`. That function builds a ConsoleLogger or SilentLogger (an IdLogger when given a moniker) and installs it as `Base.defaultLogger`.
    - `logger` exports `ConsoleLogger`, `LevelLogger`, `SilentLogger`, `IdLogger`, `LogLevel`, `parseLogLevel`, `NoOpLogFunction` and `getFunctionName`.
    - `initDefaultLogger` and `parseLogLevel` shipped in 8.1.8 (8b2d88456, 2026-08-07), after the skill was written.
    - `typeof` has no `is` export. It has the `is*` guards (`isDefined`, `isString`, `isObject`, …), `typeOf`, `ifTypeOf`, `ifDefined`, `isType`, `validateType` and `Brand`.
    - `platform` exports `isNode`/`isBrowser`/`isWebworker` everywhere, and `subtle` only under the node and neutral conditions.
  - **Fix:** Change the cells as follows:
    - base: "`Base` class (logger + OTel providers, `Base.defaultLogger`), `globallyUnique`, `initDefaultLogger`"
    - logger: "`ConsoleLogger`, `LevelLogger`, `SilentLogger`, `IdLogger`, `parseLogLevel`"
    - typeof: "`is*` guards (`isDefined`, `isString`, `isObject`, …), `typeOf`, `ifTypeOf`, `ifDefined`, `Brand`"
    - platform: "`isNode` / `isBrowser` / `isWebworker` (node/browser conditional); `subtle` only from the node and neutral entries"

    Leave the fetch cell short, since it links fetch.md. Optionally add a CLI/service bootstrap line, `initDefaultLogger({ logLevel, silent, moniker })`, noting that it installs `Base.defaultLogger` without the moniker. Import it from the root, not `/base` (see the conventions.md import-style item).
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/base/index.ts:1-3, base/initDefaultLogger.ts:17-56, base/Base.ts:25-49; logger/index.ts:1-7, logger/parseLogLevel.ts:17; typeof/index.ts:1-11, typeof/is.ts; platform/index-neutral.ts:4-21, platform/node/index.ts:4, platform/browser/index.ts; `git tag --contains 8b2d88456` → v8.1.8 first.
  - <sub>ids: skills/ariestools-sdk/modules.md#3, cov-sdk-specialist#18, cov-sdk-umbrella#10, skills/ariestools-sdk/modules.md#7</sub>

- ⚪ **`/telemetry-exporter` and the `XyConsoleSpanExporter` class are deprecated, but the skill does not say so**
  - **Now:** modules.md:52 "Exporter helpers (prefer dedicated telemetry package for new code)"; conventions.md:23 names only `@ariestools/sdk` / `@ariestools/sdk/telemetry`.
  - **Actual:** `@ariestools/sdk/telemetry-exporter` is an `@deprecated` re-export of `@ariestools/telemetry` (`createXyConsoleSpanExporter`, `spanDurationInMillis`, `XyConsoleSpanExporter`, `XySpanExporter`). Like `/telemetry` and `/telemetry/model`, which the root `/model` re-exports, it is slated for removal from the main barrel in a future major. Inside `@ariestools/telemetry`, the `XyConsoleSpanExporter` class is deprecated in favor of `createXyConsoleSpanExporter()`. Typed lint already flags these through `@typescript-eslint/no-deprecated`.
  - **Fix:** Change modules.md:52 to "**Deprecated re-export path** — use `@ariestools/telemetry` (`createXyConsoleSpanExporter`, `spanDurationInMillis`)". Widen conventions.md:23 to name `@ariestools/sdk`, `/telemetry`, `/telemetry/model` and `/telemetry-exporter` (all deprecated, removal planned). Add the mapping `new XyConsoleSpanExporter(...)` → `createXyConsoleSpanExporter(logLevel, logger)`.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/telemetry-exporter/index.ts:1-13; telemetry/index.ts:1-17; telemetry/model.ts:1-3; src/model.ts; ariestools/sdk-js/packages/telemetry/src/XyConsoleSpanExporter.ts:149-155; ariestools/toolchain eslint-config-flat managed-rules.ts:58.
  - <sub>ids: skills/ariestools-sdk/modules.md#5, cov-sdk-umbrella#9, skills/ariestools-sdk/conventions.md#6</sub>

- ⚪ **The storage note implies the Mongo adapter implements `KeyValueStore`**
  - **Now:** modules.md:96 "`@ariestools/sdk/storage` defines store contracts (e.g. key-value). **Implementations** for IndexedDB and Mongo live in `@ariestools/storage-adapters`."
  - **Actual:** Only `IndexedDbKeyValueStore` (`/indexed-db`, peer `idb` ^8) implements `KeyValueStore`. `/mongo` (peer `mongodb` ^7.6) provides `BaseMongoSdk` and `MongoClientWrapper`, a Mongo SDK wrapper that does not implement the store contract. sdk/storage exports `ReadonlyKeyValueStore` and `KeyValueStore`.
  - **Fix:** "`KeyValueStore`/`ReadonlyKeyValueStore` contracts live here; `IndexedDbKeyValueStore` (`@ariestools/storage-adapters/indexed-db`) implements them. `@ariestools/storage-adapters/mongo` provides `BaseMongoSdk`/`MongoClientWrapper` for Mongo access."
  - **Evidence:** ariestools/sdk-js/packages/storage-adapters/src/modules/indexed-db/IndexedDbKeyValueStore.ts:1,12; src/modules/mongo/Base.ts:23, Wrapper.ts:14; packages/sdk/src/modules/storage/KeyValueStore.ts:6,21.
  - <sub>ids: skills/ariestools-sdk/modules.md#9</sub>

### Add

- ⚪ **The `assertEx` pattern lacks the falsy-value and function-argument caveats**
  - **Now:** modules.md:27 "`assertEx`, `assertDefinedEx` — throw on invalid state"; :68 `assertEx(maybe, () => 'missing value')`.
  - **Actual:** `assertEx` throws on any falsy value (`undefined`, `null`, `false`, `0`, `''`, `0n`), while `assertDefinedEx` throws only on `undefined`. The second argument must be a function that returns a message or an Error. A non-function throws "Invalid assertEx usage: second argument must be a function or undefined", but only on the failure path. The TypeScript overloads already reject a string at compile time.
  - **Fix:** After the Assert example, add: "Use `assertDefinedEx` when `0`, `''` or `false` are valid values. Always pass a function (`() => 'msg'` or `() => new MyError()`), never a string."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/assert/assertEx.ts:41,50,55-57; assertDefinedEx.ts:51,56-58.
  - <sub>ids: skills/ariestools-sdk/modules.md#4</sub>

- ⚪ **The aggregate `@ariestools/sdk/model` subpath and the list of modules that have `/model` are missing**
  - **Now:** modules.md:18 "Many modules also publish a `./<name>/model` subpath for types-only imports." The catalog has no root model entry.
  - **Actual:** `@ariestools/sdk/model` is a types-only aggregate (`export type *` from the 18 module models). `/model` subpaths exist for exactly these modules: api, assert, base, creatable, enum, error, events, fetch, forget, hex, object, profile, promise, retry, storage, telemetry, typeof and zod. The other modules have none; `@ariestools/sdk/logger/model`, for example, fails with ERR_PACKAGE_PATH_NOT_EXPORTED. Otherwise the 33 catalog rows match the 9.0.1 exports map (54 keys).
  - **Fix:** Extend :18 with: "…and `@ariestools/sdk/model` aggregates all model types (`import type { ApiConfig, Hex, Promisable } from '@ariestools/sdk/model'`). `/model` subpaths exist for: api, assert, base, creatable, enum, error, events, fetch, forget, hex, object, profile, promise, retry, storage, telemetry, typeof, zod."
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:143-146; src/model.ts:1-19; xy.config.ts:13-120 (`model: true`); `npm view @ariestools/sdk@9.0.1 exports` (54 keys).
  - <sub>ids: skills/ariestools-sdk/modules.md#6, cov-sdk-umbrella#8</sub>

- ⚪ **The Forget section has no API, no callback semantics and no timeout behavior**
  - **Now:** modules.md:82-84 is prose only, with no import or config.
  - **Actual:**
    - The call is `forget(promise, { name, timeout, onCancel, onComplete, onException })`.
    - The default `timeout` is 30 000 ms. When it expires, only `onCancel` and the timeout handler run; the work keeps going.
    - A rejection is logged and delivered to `onComplete([undefined, error])`. `onException` fires only for errors in synchronous setup.
    - `ForgetPromise.activeForgets` and `ForgetPromise.awaitInactive(interval, timeout)` drain pending forgets.
    - Global defaults can be set through `globalThis.xy.forget.config`.
  - **Fix:** Add an example: `import { forget, ForgetPromise } from '@ariestools/sdk'` (the root import, because `ForgetPromise` holds static state; see the conventions.md import-style item), then `forget(sendMetrics(), { name: 'metrics', onComplete: ([, error]) => { if (error) logger.warn(error) } })`. Add notes that:
    - rejections reach `onComplete`, and `onException` covers only synchronous setup;
    - the 30 s default timeout only notifies and does not cancel the work;
    - `await ForgetPromise.awaitInactive()` belongs before process exit and in test teardown;
    - global defaults go in `globalThis.xy.forget.config`.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/forget/ForgetConfig.ts:5-22; forget/forget.ts:6-10; forget/ForgetPromise.ts:26,33,45,84-97,104-111,121-125; ForgetPromiseNode.ts:28-30.
  - <sub>ids: skills/ariestools-sdk/modules.md#10</sub>

## `skills/ariestools-sdk/overview.md`

### Update

- 🔴 **`zod` is called an optional peer, but the root barrel and `/hex`, `/object` and `/zod` import it at load, and the checklist also calls the required OTel peer optional**
  - **Now:**
    - overview.md:40: "`zod` | **Optional peer** — install only if you use zod helpers (`@ariestools/sdk/zod`, hex zod helpers, etc.)". overview.md:44-45: "# Only if you use zod helpers from the SDK / pnpm add zod". Meanwhile :19 and :25 make `pnpm add @ariestools/sdk` plus a root-barrel import the default.
    - modules.md:41: "hex … optional zod". modules.md:43 (object) has no zod note. modules.md:56: "requires optional peer `zod`".
    - conventions.md:58: "3. Install optional peers (`zod`, OTel) only when used." This contradicts overview.md:41, which calls `@opentelemetry/api` a required peer.
  - **Actual:**
    - package.json declares `zod ^4.6` an optional peer and `@opentelemetry/api ^1.9` a required peer.
    - The published 9.0.1 root barrel (node, browser and neutral builds), `/hex`, `/object` and `/zod` all statically import `zod/mini` or `zod/v4/core`. Without zod, each of them fails with ERR_MODULE_NOT_FOUND, even if you only use `assertEx` or `fetchJson` from the root. The zod-free subpaths (`/assert`, `/delay`, `/exists`, `/fetch`, …) load fine.
    - pnpm does not auto-install optional peers, so the skill's default install followed by a root import breaks.
    - The imports use Zod 4 entry points, so the floor is ^4.6.
    - The root, `/telemetry` and `/telemetry-exporter` load `@ariestools/telemetry`, which value-imports `@opentelemetry/api`.
    - Under plain Node there is no tree-shaking, so every import in the root barrel must resolve.
    - Downstream, `@ariestools/pixel` imports `@ariestools/sdk/object` at runtime without declaring zod, and `@ariestools/express` declares zod ^4.6 as a required peer.
    - `/object` and the root publish only `index-un-deprecated`; the deprecated `isType` lives in `/typeof`.
    - The upstream README.md:234 makes the same "optional" claim.
  - **Fix:**
    - Rewrite overview.md:40 as "`zod` (^4.6, Zod 4) — declared optional, but **required at runtime** for the root barrel `@ariestools/sdk` and `/hex`, `/object`, `/zod` (and, transitively, `@ariestools/pixel`; `@ariestools/express` lists it as a required peer). Skip it only if every import in the dependency graph is a zod-free subpath."
    - Make `pnpm add @ariestools/sdk zod` the default install, and note under the root example (:22-29) that a root import needs `zod` and `@opentelemetry/api`.
    - In modules.md, make the hex row "Hex/hash/address/EthAddress helpers and Zod schemas — requires `zod` ^4.6 (imported at load)". Make the object row "Object helpers (`asAnyObject`, `AsObjectFactory`, `deepMerge`, `omitBy`/`pickBy`, JsonObject helpers, `toSafeJson`, `AnyObject`/`EmptyObject` types) — requires `zod`; deprecated `isType` is in `/typeof`". Make the zod row "Zod factories (`zodIsFactory`, `zodAsFactory`, `zodToFactory`, `zodAllFactory`, async variants) — requires `zod` ^4.6". Under "Install and import", say that `zod` is required for `/hex`, `/object`, `/zod` or the root.
    - Replace conventions.md:58 with "3. `@opentelemetry/api` is a required peer of `@ariestools/sdk` and `@ariestools/telemetry` — always install it. Install `zod` ^4.6 whenever anything in the graph imports the root barrel or `/hex`, `/object`, `/zod`; in practice that is almost always, because actor-kit, sdk-react and XYO libraries import the root."
    - *Resolved:* conventions.md#2 proposed presenting subpaths as the way to keep peers optional. The 10.1.1 gap check shows that subpaths avoid peers only when nothing in the graph imports the root. Keep the peer facts, but drop the "prefer subpaths" conclusion (see the conventions.md import-style item).
    - Optionally, report the README.md:234 claim and pixel's undeclared zod upstream to sdk-js.
  - **Evidence:**
    - Peers and re-exports: ariestools/sdk-js/packages/sdk/package.json:403-411 (peers and `peerDependenciesMeta`); src/index.ts:21,23,36.
    - Source imports: src/modules/hex/hex/hex.ts:1, hex/address/address.ts:1, hex/hash/hash.ts:1, hex/ethAddress.ts:1, hex/zod.ts:1, object/JsonObject.ts:1, zod/zodAsFactory.ts:1.
    - Built output: dist/{neutral,node,browser}/index.mjs:988 (`zod/mini`) and :3266 (`zod/v4/core`); dist/neutral/index.mjs:3746 (`@ariestools/telemetry`); dist/neutral/hex.mjs:2, object.mjs:186,189, zod.mjs:2.
    - Runtime checks: a Node 26.9.0 resolve hook that makes zod unresolvable fails the root, hex, object and zod entries, while assert, fetch, delay and exists load; a scratch install without zod fails with ERR_MODULE_NOT_FOUND from dist/node/index.mjs.
    - Downstream: packages/telemetry/src/span.ts:6-8; packages/pixel/src/XyUserEventHandler.ts:1; packages/express/package.json:77-79; packages/sdk/README.md:234.
  - <sub>ids: skills/ariestools-sdk/overview.md#0, cov-sdk-umbrella#0, skills/ariestools-sdk/modules.md#0, cov-sdk-umbrella#1, skills/ariestools-sdk/conventions.md#0, cov-sdk-umbrella#2, skills/ariestools-sdk/conventions.md#2</sub>

- ⚪ **The umbrella's telemetry re-exports are deprecated runtime helpers, not "interfaces"**
  - **Now:** overview.md:74 "The umbrella still re-exports some telemetry and storage **interfaces**".
  - **Actual:** The storage re-exports are interface-only (`KeyValueStore`, `ReadonlyKeyValueStore`). The telemetry re-exports are runtime code: `span`, `spanAsync`, `spanRoot`, `spanRootAsync`, `timeBudget`, `cloneContextWithoutSpan`, `createXyConsoleSpanExporter`, `spanDurationInMillis` and the deprecated `XyConsoleSpanExporter`. They come through the root, `/telemetry` and `/telemetry-exporter`, all marked `@deprecated` with removal planned. Only those entries load `@opentelemetry/api`.
  - **Fix:** Change :74 to "The umbrella re-exports storage **interfaces** (`@ariestools/sdk/storage`) and **deprecated** telemetry runtime helpers (`span*`, `timeBudget`, `XyConsoleSpanExporter`, … via the root barrel, `/telemetry` and `/telemetry-exporter`), scheduled for removal in a future major." Append to :41: "the umbrella's telemetry re-exports are deprecated; `@opentelemetry/api` is loaded only via the root barrel and the telemetry subpaths."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/telemetry/index.ts:1-17; telemetry-exporter/index.ts:1-12; storage/KeyValueStore.ts; packages/sdk/README.md:235-238; a simulation that blocks `@opentelemetry/api` fails only index.mjs, telemetry.mjs and telemetry-exporter.mjs.
  - <sub>ids: skills/ariestools-sdk/overview.md#4</sub>

- ⚪ **The dependency table omits `@ariestools/telemetry`, a direct dependency of the umbrella**
  - **Now:** overview.md:37-41 lists `async-mutex` as the only direct dependency.
  - **Actual:** `@ariestools/sdk` 9.0.1 has two direct dependencies, `async-mutex ~0.5.0` and `@ariestools/telemetry ~9.0.1`. Code that imports `@ariestools/telemetry` directly must still declare it, or deplint flags it.
  - **Fix:** Add the row "`@ariestools/telemetry` | Direct dependency of `@ariestools/sdk` (backs the deprecated telemetry re-exports); declare it yourself if you import it directly." Leave :12 ("typically compiled to `dist/neutral/`") as it is (see Refuted below).
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:385-388; `npm view @ariestools/sdk@9.0.1 dependencies`.
  - <sub>ids: skills/ariestools-sdk/overview.md#5, cov-sdk-specialist#16</sub>

### Add

- 🟠 **The skill never says that sdk-js 9.x requires Node >= 26; Layer 2's stated baseline is Node 22**
  - **Now:** absent from every skills/ariestools-sdk file. conventions.md:11-13 ("ESM only") is the only runtime note. xy-toolchain/toolchain.md:41 and :115 state Node 22 "unless the consuming product imposes a newer version".
  - **Actual:**
    - 9.0.0 (2026-09-16, commit 70c8e1942 "Node 26") raised `engines.node` to >=26 in every published sdk-js package. Before that it was >=18.17.1 for the sdk and >=18 for the others. 9.0.1 is current.
    - `@ariestools/sdk` also sets `engineStrict: true`, but npm and pnpm ignore a published package's `engineStrict`. Consumers on older Node get an unsupported-engine warning, not a failure, unless they enable engine-strict themselves.
    - The toolchain packages declare >=22.
    - `@ariestools/testing` has depended directly on `vitest ~5.0` since 8.3.0.
    - crypto-auth uses native `Uint8Array` base64, so it needs Node >= 26 or a current browser.
    - Platforms per package: express is Node-only; pixel is browser-only; threads has only `node`/`browser` conditions; in storage-adapters, `/indexed-db` needs IndexedDB and `/mongo` needs Node.
    - The umbrella README still says "18.17.1+".
  - **Fix:**
    - Add a "Runtime baseline" subsection to overview.md, near :12 or in Versioning (:76-78): "sdk-js 9.x packages (the umbrella and every specialist) declare `engines.node >=26`; 8.x declared >=18.17.1. Engines are advisory unless the consuming repo enables engine-strict, so check its Volta/engines pin; repos on Node < 26 stay on 8.x or upgrade the runtime. `@ariestools/testing` 9.x needs Vitest 5 (Vitest 4 consumers need testing 8.2.x or older). The toolchain itself needs only Node 22. Ignore the umbrella README's stale '18.17.1+'."
    - Add one line after SKILL.md:12 and one sentence to conventions.md:11-13.
    - Add a Runtime column to the packages.md quick chooser: express = Node; pixel = Browser; threads = Node or Browser condition; storage-adapters `/indexed-db` = Browser or an IndexedDB polyfill, `/mongo` = Node; everything else = Both.
    - Outside this skill, add a cross-reference at [toolchain.md](../../skills/xy-toolchain/toolchain.md):115: "adding `@ariestools/sdk` raises the Node floor to 26".
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:412-415; `engines` in every published packages/*/package.json (the private threads-test has none); `npm view @ariestools/sdk@8.3.0 engines` → >=18.17.1, `@9.0.0` → >=26; `npm view @ariestools/sdk time` (9.0.0 at 2026-09-16T20:47Z); `git show 70c8e1942 -- packages/sdk/package.json`; packages/testing/package.json:76-77; packages/crypto-auth/src/base64.ts:1-14; ariestools/toolchain/packages/*/package.json (engines >=22); packages/sdk/README.md:197-198.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#2, skills/ariestools-sdk/overview.md#1, cov-sdk-umbrella#7, cov-sdk-specialist#5, arch-layering#10, skills/ariestools-sdk/conventions.md#8, skills/ariestools-sdk/packages.md#6</sub>

- 🟠 **No `@xylabs/*` migration map, and npm deprecation notices send agents to frozen `@ariestools` 8.0.3 packages or deprecated paths**
  - **Now:** SKILL.md:3 promises "migration from retired @xylabs/* names", and SKILL.md:20 routes migration questions to overview.md. But overview.md:53-58 only says "`@xylabs/*` utility shims that mirror these packages" and "Compatibility shims (if still published) are migration aids only". conventions.md:25 says "Migrate to `@ariestools/*`". Nothing warns about the retired `@ariestools` names.
  - **Actual:**
    - Every `@xylabs` shim is published, npm-deprecated and frozen at 8.0.2.
    - Utility shims moved to umbrella subpaths (`@xylabs/assert` → `@ariestools/sdk/assert`). `@ariestools/assert`, `/fetch`, `/hex`, `/promise` and the like return E404.
    - Only the specialists keep 1:1 names: express, threads, pixel, eth-address and sdk-meta.
    - The npm messages mislead in four cases:
      - `@xylabs/telemetry` and `telemetry-exporter` point to the deprecated `@ariestools/sdk/telemetry[-exporter]`.
      - `@xylabs/vitest-extended`, `vitest-matchers` and `jest-helpers` point to `@ariestools/vitest-*`.
      - `@xylabs/mongo` and `indexed-db` point to `@ariestools/mongo` and `@ariestools/indexed-db`.
      - `@xylabs/crypto` points to the npm-deprecated `@ariestools/crypto`.
    - On 2026-07-09 (75e3ed8dd), `@ariestools/{mongo,indexed-db}` were folded into storage-adapters and `@ariestools/{vitest-extended,vitest-matchers}` into testing. All four remain on npm at 8.0.3 with no deprecation flag and pin `@ariestools/sdk ~8.0.3` or `vitest ~4.1.10`, so installing one next to sdk 9 pulls in a second, stale umbrella.
    - sdk-js/CLAUDE.md:57,61 still lists those four as active.
    - `@xylabs/crypto-auth` never existed (E404).
  - **Fix:** Replace overview.md:53-58 with a migration map that overrides the npm messages:
    - `@xylabs/sdk-js`, `@xylabs/sdk` → `@ariestools/sdk` (`@xylabs/sdk-js/model` → `@ariestools/sdk/model`)
    - `@xylabs/<umbrella module>` (assert, api, delay, fetch, hex, logger, object, promise, storage, …) → `@ariestools/sdk/<module>`; no `@ariestools/<module>` package exists
    - `@xylabs/{express,threads,pixel,eth-address,sdk-meta}` → `@ariestools/<same>`
    - `@xylabs/telemetry`, `@xylabs/telemetry-exporter` → `@ariestools/telemetry`, not the deprecated `@ariestools/sdk/telemetry*` path npm suggests
    - `@xylabs/{indexed-db,mongo}` and the frozen `@ariestools/{indexed-db,mongo}` 8.0.3 → `@ariestools/storage-adapters/{indexed-db,mongo}`
    - `@xylabs/{vitest-extended,vitest-matchers,jest-helpers}` and the frozen `@ariestools/{vitest-extended,vitest-matchers}` 8.0.3 → `@ariestools/testing` (`/extended`, `/matchers`)
    - `@xylabs/crypto` → `globalThis.crypto` / `node:crypto`, since its npm target `@ariestools/crypto` is itself deprecated

    State that every `@xylabs` shim is deprecated and frozen at 8.0.2, and drop "(if still published)". Extend SKILL.md:10 with "…nor the frozen `@ariestools/{indexed-db,mongo,vitest-matchers,vitest-extended}` 8.0.3 packages that npm deprecation notices point to." Point conventions.md:25 at the map and add rows there for the four retired 8.x `@ariestools` names. Optionally ask sdk-js to npm-deprecate those four packages and fix sdk-js/CLAUDE.md:57,61.
  - **Evidence:** `npm view @xylabs/<name> deprecated` for sdk-js, sdk, assert, telemetry, telemetry-exporter, vitest-extended, vitest-matchers, jest-helpers, mongo, indexed-db, express, threads, pixel, eth-address, sdk-meta and crypto; `npm view @ariestools/{assert,fetch,hex,promise}` → E404; `npm view @xylabs/crypto-auth` → E404; `npm view @ariestools/{mongo,indexed-db,vitest-extended,vitest-matchers} version deprecated dependencies` → 8.0.3, not deprecated; ariestools/sdk-js commit 75e3ed8dd; packages/storage-adapters/package.json exports `./indexed-db`, `./mongo`; packages/testing/package.json exports `./matchers`, `./extended`; packages/sdk/src/modules/telemetry/index.ts:1-5; ariestools/sdk-js/CLAUDE.md:57,61.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#1, skills/ariestools-sdk/overview.md#2, skills/ariestools-sdk/overview.md#3, skills/ariestools-sdk/conventions.md#1, skills/ariestools-sdk/conventions.md#7, cov-sdk-specialist#11</sub>

## `skills/ariestools-sdk/packages.md`

### Remove

- 🟠 **`@ariestools/threads-test` is private and unpublished, not a companion test package**
  - **Now:** packages.md:57 "`@ariestools/threads-test` is a companion package for tests, not a production dependency of apps."
  - **Actual:** The package is `private: true`, its src is `export {}`, and `npm view` returns E404. Its test suite was deleted in d4dadd220 (2026-09-05, first released in 8.3.0), and the threads tests now live in packages/threads/src/spec/node. `pnpm add -D @ariestools/threads-test` would 404.
  - **Fix:** Delete the sentence. Optionally replace it with: "There is no published test companion; test worker code with your own Vitest specs in the `spec/node` realm."
  - **Evidence:** ariestools/sdk-js/packages/threads-test/package.json:4, src/index.ts; `npm view @ariestools/threads-test version` → E404; `git show d4dadd220 --stat`; packages/threads/src/spec/node/pool.spec.ts.
  - <sub>ids: skills/ariestools-sdk/packages.md#3, cov-sdk-umbrella#13, cov-sdk-specialist#10</sub>

### Update

- 🔴 **The eth-address section names an `EthAddress` export the package does not have, and calls the ethers-dependent package the "focused" choice**
  - **Now:** packages.md:95: "Focused Ethereum address helpers (`EthAddress`, padding, ellipsize). … use this package when you want the dedicated address API without pulling unrelated hex helpers by habit." The :16 chooser row reads "ETH address helpers | `@ariestools/eth-address`". modules.md:89 has a placeholder, `import { /* hex helpers */ } from '@ariestools/sdk/hex'`, and modules.md:92 says "For a focused ETH address package, `@ariestools/eth-address` remains available". overview.md:70 says "ETH address helpers as a focused package".
  - **Actual:** `@ariestools/eth-address` 9.0.1 exports only `EthAddressWrapper`, `isEthAddressWrapper`, `padHex` and a deprecated `ellipsize` re-export. `EthAddressWrapper` is a bigint-backed class whose `toString(true)` checksums through ethers `getAddress`. The package depends on `ethers ~6.17.0` plus `@ariestools/sdk`, so it is the heavier choice. `import { EthAddress } from '@ariestools/eth-address'` fails to compile. The branded `EthAddress` type and its helpers (`toEthAddress`, `isEthAddress`, `asEthAddress`, `ETH_ZERO_ADDRESS`, `EthAddressZod`, `EthAddressRegEx`) live in `@ariestools/sdk/hex`. So do `toHex`/`isHex`/`asHex`, `hexToBigInt`, `Hash`/`isHash`/`asHash`/`HashZod` and `Address`/`toAddress`/`isAddress`/`asAddress`. `/hex` imports zod at load.
  - **Fix:** Rewrite packages.md:93-95:
    - The branded `EthAddress` type, its validation and its zod schemas come from `@ariestools/sdk/hex`, which requires `zod`.
    - Use `@ariestools/eth-address` (`pnpm add @ariestools/eth-address`) only for `EthAddressWrapper` (bigint parse and compare, EIP-55 checksum via `ethers`) or `padHex`, and say that it pulls in `ethers`.
    - Import `ellipsize` from `@ariestools/sdk/ellipsize`.

    Split the :16 chooser row: branded address type → `@ariestools/sdk/hex`; ethers-checksum wrapper → `@ariestools/eth-address`. Replace the modules.md:89 placeholder with real imports, for example `import { toHex, isHex, hexToBigInt, isHash, toAddress, toEthAddress, isEthAddress } from '@ariestools/sdk/hex'`. Reword modules.md:92 and overview.md:70 so neither calls eth-address the focused option.
  - **Evidence:** ariestools/sdk-js/packages/eth-address/src/index.ts:1-3, src/EthAddress.ts:3,8,11, src/ellipsize.ts:1-4, package.json:46-48; dist/neutral/index.mjs:86-91; `npm view @ariestools/eth-address@9.0.1 dependencies` → `{ ethers: '~6.17.0', '@ariestools/sdk': '~9.0.1' }`; packages/sdk/src/modules/hex/ethAddress.ts:14,33,36,44,57,64,74-78; hex/index.ts:1-7; dist/neutral/hex.mjs:2.
  - <sub>ids: skills/ariestools-sdk/packages.md#0, cov-sdk-specialist#0, skills/ariestools-sdk/modules.md#8</sub>

- 🔴 **storage-adapters: the root barrel needs both optional backends and has its own Mongo pool cache, and the install line installs neither backend**
  - **Now:** packages.md:36-41 lists "`@ariestools/storage-adapters` | Root barrel" first, then `/indexed-db`, `/mongo` and "`*/model` | Types-only subpaths". :44 says `pnpm add @ariestools/storage-adapters`.
  - **Actual:**
    - `idb ^8.0` and `mongodb ^7.6` are optional peers, which pnpm does not install. Without the matching backend, an import fails with module-not-found.
    - The root `dist/neutral/index.mjs` statically imports both: `openDB` from idb at :5 and `MongoClient` from mongodb at :271. Importing the root therefore needs both backends and pulls mongodb into browser graphs. `/indexed-db` and `/mongo` each import only their own backend.
    - The Mongo code is Node-only.
    - The package is a bundle-linkage monolith, so `MongoClientWrapper` is defined in 4 entries and its static `clients` pool cache exists once per entry. Importing it from the root and from `/mongo` gives two wrappers and two connection pools for the same URI. Every workspace consumer (about 33 imports) uses `/mongo`.
    - The exact subpaths are `.`, `./indexed-db`, `./indexed-db/model`, `./mongo` and `./mongo/model`; there is no root `./model`.
    - Main exports: `IndexedDbKeyValueStore` (implements sdk/storage `KeyValueStore`), `withDb`, `withStore`, `withReadOnlyStore`, `withReadWriteStore`; `BaseMongoSdk`, `MongoClientWrapper`, `BaseMongoSdkConfig`.
  - **Fix:** Replace the root-barrel row with this rule: "Import the backend subpath (`/indexed-db` or `/mongo`) and use it everywhere in the process. Never import the root barrel: it needs both optional peers and has its own `MongoClientWrapper` pool cache, which doubles connections when mixed with `/mongo`." List the exact subpaths instead of `*/model`. Change the install line to `pnpm add @ariestools/storage-adapters idb` (browser/IndexedDB) or `pnpm add @ariestools/storage-adapters mongodb` (Node/Mongo). Name the main classes, and mark `/mongo` as Node-only. Note that this is the opposite of the `@ariestools/sdk` root-barrel rule in conventions.md.
  - **Evidence:** ariestools/sdk-js/packages/storage-adapters/package.json:89-99; dist/neutral/index.mjs:5,271; dist/neutral/indexed-db.mjs:5; dist/neutral/mongo.mjs:5; src/modules/mongo/Base.ts:1,23, Wrapper.ts:14-16,51-58, Config.ts:26; src/modules/indexed-db/IndexedDbKeyValueStore.ts:12, withDb.ts:20; `grep -ln 'var MongoClientWrapper = class' dist/*/*.mjs` → 4 files; a runtime check printed "same class: false | same clients cache: false"; `npm view @ariestools/storage-adapters@9.0.1 exports peerDependenciesMeta`.
  - <sub>ids: skills/ariestools-sdk/packages.md#1, cov-sdk-specialist#1, gap-gap-sdk-subpath-identity#2</sub>

- 🟠 **express: the install guidance gets peers and dependencies backwards, and it omits the required `zod` peer, the Node-only export, the main API and 5xx masking**
  - **Now:** packages.md:24 "Base helpers for Express APIs (handlers, middleware, HTTP utilities, logging integration)."; :27 `pnpm add @ariestools/express`; :30 "Depends on the shared SDK surface for common utilities; install `@ariestools/sdk` as required by the package's peers/deps."
  - **Actual:**
    - `@ariestools/sdk` is a regular dependency, not a peer.
    - The peers are `zod ^4.6` and `winston-transport ^4.9`, and both are required (there is no `peerDependenciesMeta`). winston-transport is also a dependency, so zod is the peer consumers actually supply. `requestHandlerValidator` imports `zod/mini`.
    - The export map has only a `node` condition, so the package does not resolve for browser or neutral builds.
    - `express` is neither a dependency nor a peer: the app brings its own Express 5, and the types come from `express-serve-static-core`.
    - Main exports: `asyncHandler`, `errorToJsonHandler`, `requestHandlerValidator` (`ValidateRequestDefaults`, `EmptyParamsZod`/`EmptyQueryParamsZod`), `addRouteDefinitions`/`RouteDefinition`, `jsonBodyParser`/`getJsonBodyParser`, `standardResponses`/`standardErrors`, `customPoweredByHeader`, `enableCaseSensitiveRouting`/`disableCaseSensitiveRouting`, `responseProfiler`/`useRequestCounters`, and `getLogger`/`getDefaultLogger` (winston, which adds a Rollbar transport automatically when `ROLLBAR_ACCESS_TOKEN` is set).
    - `StatusCodes`, `ReasonPhrases`, `RollbarTransport` and `getDefaultRollbarTransport` are internal and not exported.
    - Since 8.3.0 (d4dadd220), `errorToJsonHandler` returns `{ error: 'Internal Server Error' }` for every status >= 500 and keeps the real message only in logs.
  - **Fix:** Change the install line to `pnpm add @ariestools/express zod`, alongside the app's own `express@5` and `@types/express-serve-static-core`. Replace :30 with: "`@ariestools/sdk` comes in as a regular dependency (declare it only if your code imports it directly). Required peers: `zod` ^4.6, `winston-transport` ^4.9 (also a dependency). Node-only (`node` export condition). Bring your own Express 5." Add the main-export list above, without the internal names. Add one line: "`errorToJsonHandler` masks every 5xx body to `{ error: 'Internal Server Error' }` and logs the real message, so tests and clients must not expect internal messages in 5xx bodies."
  - **Evidence:** ariestools/sdk-js/packages/express/package.json:32-38, :52-58, :77-79; src/Validation/requestHandlerValidator.ts:6; src/Handler/errorToJsonHandler.ts:19-23; src/HttpStatus.ts (not re-exported); src/Logger/index.ts (no Transports re-export), getLogger.ts:19-22; dist/node/index.mjs:413 (`zod/mini`), :486-522 (export list); commit d4dadd220; `npm view @ariestools/express@9.0.1 peerDependencies dependencies`.
  - <sub>ids: skills/ariestools-sdk/packages.md#2, cov-sdk-specialist#7, skills/ariestools-sdk/packages.md#8</sub>

- 🟠 **testing: `/extended` is described as utilities but is a side-effect matcher registration, and the Vitest 5 coupling and type subpaths are missing**
  - **Now:** The packages.md:63-67 table has "`@ariestools/testing` | Root", "`/matchers` | Custom matchers" and "`/extended` | Extended utilities". :73 says "Wire matchers in Vitest setup files per the consuming repo." conventions.md:51 says "Add `@ariestools/testing` when you need shared matchers or extended helpers."
  - **Actual:**
    - `/extended` runs `expect.extend(matchers)` on import and augments Vitest 5's `Assertion<R, T>` and `AsymmetricMatchersContaining` with `CustomMatchers` (toBeArray, toBeArrayOfSize, toBeTrue, toContainKey, toInclude, toBeValidDate, …). It is listed in `sideEffects` and is used as `import '@ariestools/testing/extended'`.
    - The root re-exports `#extended`, so importing the root also registers the matchers.
    - `/matchers` exports the raw `matchers` object without registering it.
    - `/model` and `/matchers/model` export only `ExpectationResult`; `CustomMatchers` is exported from `/extended` and the root.
    - `vitest ~5.0.1` is a direct dependency: 0f638cae2 moved it to peers and 4448bc03b moved it back. A consumer outside Vitest 5.0.x gets a second Vitest copy, and `expect.extend` then targets the wrong `expect`.
  - **Fix:** Rewrite the table:
    - `/extended`: a side-effect import that registers the custom matchers and their Vitest types; add it to `setupFiles` or import it at the top of a spec.
    - `/matchers`: the raw `matchers` object, for a manual `expect.extend`.
    - `/model`, `/matchers/model`: the `ExpectationResult` type only.

    Note that importing the root also registers the matchers. Add: "9.x depends directly on `vitest ~5.0` (not a peer); keep the consuming repo on Vitest 5.0.x (matching `@ariestools/vitest-config`'s `vitest ^5.0` peer) so there is one Vitest instance. Keep the package in devDependencies." Leave conventions.md:51 as a pointer to this section.
  - **Evidence:** ariestools/sdk-js/packages/testing/src/modules/extended/index.ts:1-19; src/index.ts; package.json:30-34 (`sideEffects`), :41-64 (exports), :76-77; dist/neutral/index.mjs:372; src/modules/matchers/model.ts; packages/express/src/spec/node/getLogger.spec.ts:1; `npm view @ariestools/testing@9.0.1 dependencies peerDependencies`.
  - <sub>ids: skills/ariestools-sdk/packages.md#4, cov-sdk-specialist#6, skills/ariestools-sdk/conventions.md#12</sub>

- ⚪ **sdk-meta is described as document meta management, but it rewrites HTML strings with cheerio for SSR and edge rendering**
  - **Now:** packages.md:109-111 "HTML meta helpers for sites that inject or manage document meta tags." There is no install line.
  - **Actual:** The package works on HTML strings through `cheerio ~1.2.0` (a direct dependency), not on the live DOM. It exports `metaBuilder(html, meta, handler?)`, `addMetaToHead($, name, value)`, `mergeDocumentHead(destination, source)` and `getMetaAsDict`, and the types `Meta`, `OpenGraphMeta`, `OpenGraphStructured`, `TwitterMeta`, `TwitterApp` and `TwitterPlayer`. It has a single `.` export. The source directory is packages/meta, and the published name is `@ariestools/sdk-meta`.
  - **Fix:** "Server/edge helpers that inject OpenGraph/Twitter meta into an HTML string via cheerio: `metaBuilder`, `mergeDocumentHead`, `addMetaToHead`, `getMetaAsDict`, `Meta` types." Add `pnpm add @ariestools/sdk-meta`.
  - **Evidence:** ariestools/sdk-js/packages/meta/package.json:41; src/meta/builder.ts:1-3,16,45-65; src/html/mergeDocumentHead.ts:14; src/models/Meta.ts; src/index.ts:1-4.
  - <sub>ids: skills/ariestools-sdk/packages.md#7, cov-sdk-specialist#14</sub>

### Add

- 🟠 **threads: no subpaths, export conditions or API names are documented**
  - **Now:** packages.md:49-57 says only "Run work in worker threads or web workers with a function-call style API." plus `pnpm add @ariestools/threads`.
  - **Actual:**
    - Subpaths:
      - `.`, `./master`, `./implementation`, `./pool` and `./worker` resolve only under `browser` or `node`; there is no neutral default.
      - `./register` is Node-only, a side-effect import that installs `globalThis.Worker`.
      - `./spawn`, `./thread`, `./observable` and `./observable-promise` are neutral.
      - `./messenger` is types-only.
    - Main-thread API: `spawn`, `Pool`, `Worker`, `BlobWorker`, `Thread`, `Transfer`, `registerSerializer` and `DefaultSerializer`, plus the Node-only `installWorkerSignalHandlers`, `uninstallWorkerSignalHandlers` and `isWorkerRuntime`.
    - Worker side: `expose`, plus `Transfer` and `registerSerializer`, from `@ariestools/threads/worker`.
    - `observable-fns` is both a dependency (~0.6.1) and a peer (^0.6), so the plain install covers it.
    - The package README notes that nothing in the monorepo consumes it.
  - **Fix:** Add a short subpath table with the conditions above, and a two-line example: in the worker, `import { expose } from '@ariestools/threads/worker'`; on the main thread, `import { spawn, Thread, Pool, Worker } from '@ariestools/threads'`, with `await Thread.terminate(worker)` and `Transfer()` for ArrayBuffers. Keep the install line as it is, and add `observable-fns` only when app code imports it directly.
  - **Evidence:** ariestools/sdk-js/packages/threads/package.json:29-105, :112-114, :129-131; src/index-node.ts, src/master/index-node.ts; src/worker/worker.node.ts:53-73; src/master/register.ts:7-11; README.md:10-12.
  - <sub>ids: skills/ariestools-sdk/packages.md#5, cov-sdk-specialist#9</sub>

- 🟠 **crypto-auth: the vault API, PBKDF2 versioning and the native-base64 runtime requirement are undocumented**
  - **Now:** packages.md:85 "Self-contained password and seed-phrase encryption/decryption (vault-style crypto)." This is the only description in the skill, and the package README is nearly empty.
  - **Actual:**
    - The vault is `new SeedPhraseVault(store: SeedPhraseStore, walletKind?, crypto: VaultCrypto = defaultVaultCrypto)`. Storage and crypto are injected, and the default crypto is `Pbkdf2AesGcmVaultCrypto`.
    - Instance methods include `addSelfDescribingPhrase` (returns `{ key, record }`), `openSeedPhrase`, `verifyPasswordForRecord`, `upgradeRecordKdf(record, password, target?, legacy?)` and `deriveKeyForRecord`. Static methods include `recordNeedsRehash` and `resolveRecordKdf`. A wrong password raises `SeedPhraseDecryptError`.
    - Helpers: `PasswordKey`, `deriveKeyFromPassword`, `deriveKeyFromValues`, `deriveKeyAndValues`, `verifyPassword`, `needsRehash` and `bytesToBase64`/`base64ToBytes`. `encryptSeedPhrase`/`decryptSeedPhrase` are deprecated.
    - Records are self-describing (salt + keyMetadata), and keys are non-extractable.
    - New keys use 600,000 PBKDF2 iterations. Legacy records without metadata are read at 100,000.
    - `needsRehash` and `recordNeedsRehash` only detect a legacy record. `upgradeRecordKdf` is what re-encrypts it, crash-safely. Pre-versioning records need a `LegacyKdfFallback` passed to `openSeedPhrase`/`upgradeRecordKdf`.
    - Since 9.0.0, base64 uses the native `Uint8Array.prototype.toBase64`/`Uint8Array.fromBase64`, which needs Node >= 26 or a current browser.
  - **Fix:** Expand packages.md:83-91 by 3-4 lines covering:
    - The app supplies a `SeedPhraseStore` (getPhrases/setPhrase/removePhrase) and, optionally, a custom `VaultCrypto`.
    - Use `addSelfDescribingPhrase` for new records, and `openSeedPhrase`/`verifyPasswordForRecord` to read them.
    - Detect legacy 100k records with `needsRehash`/`SeedPhraseVault.recordNeedsRehash` and upgrade them with `vault.upgradeRecordKdf(...)`, passing a `LegacyKdfFallback` for pre-versioning records.
    - A wrong password throws `SeedPhraseDecryptError`.
    - Never persist or log derived keys.
    - The package needs native `Uint8Array` base64.
  - **Evidence:** ariestools/sdk-js/packages/crypto-auth/src/index.ts:1-7; SeedPhraseVault.ts:17,31-42,52,63,87-106,183,197-230; models/VaultCrypto.ts:13-25; models/SeedPhraseStore.ts:8-15; models/KeyMetadata.ts:12,20,42; password.ts:16,28,38,53,67; Pbkdf2AesGcmVaultCrypto.ts:22,76; base64.ts:1-14; seedPhrase.ts:10-21.
  - <sub>ids: skills/ariestools-sdk/packages.md#12, cov-sdk-specialist#8</sub>

- ⚪ **pixel: no entry point, install line, `./model` subpath or browser-runtime note**
  - **Now:** packages.md:105-107 "Event client for funnel / purchase style analytics fields used with the XY Labs event pipeline."
  - **Actual:**
    - The package is compiled only to dist/browser and exports `.` and `./model`. `./model` holds the field types: `PurchaseFields`, `FunnelStartedFields`, `ViewContentFields`, `UserClickFields`, `UtmFields`, …
    - The client is a singleton: call `XyPixel.init(pixelId)`, then use `XyPixel.instance`, which throws if uninitialized. `XyPixel.selectApi(new PixelApi('beta' | 'local' | url))` overrides the default endpoint, https://pixel.xylabs.com/t/event/queue. The package also exports `XyUserEventHandler`.
    - The constructor reads localStorage and `send()` reads `document.location`. Importing the package in Node or SSR is harmless, because nothing touches browser globals at module level.
    - Its runtime import of `@ariestools/sdk/object` means it needs zod (see the overview.md zod item).
  - **Fix:** Add `pnpm add @ariestools/pixel` and the `XyPixel.init(pixelId)` / `XyPixel.instance.send(...)` entry point. Note that these calls belong on the client only, while importing is safe in SSR. Mention the `selectApi` override, and `@ariestools/pixel/model` for the field types.
  - **Evidence:** ariestools/sdk-js/packages/pixel/package.json:25-33; src/Pixel.ts:31-82,97,119-120,158; src/Api/Api.ts:6-20; src/XyUserEventHandler.ts:1,12; src/model.ts.
  - <sub>ids: skills/ariestools-sdk/packages.md#9, cov-sdk-specialist#13</sub>

- ⚪ **telemetry: the export names and the deprecated exporter class are not listed**
  - **Now:** packages.md:77 "First-class OpenTelemetry helpers (spans, time budgets, console span exporter)…" names no exports.
  - **Actual:** `@ariestools/telemetry` exports `span`, `spanAsync`, `spanRoot`, `spanRootAsync`, `cloneContextWithoutSpan`, `timeBudget`, `createXyConsoleSpanExporter` and `spanDurationInMillis`, plus the types `SpanConfig`, `TelemetryLogger` and `XySpanExporter`. It also exports the `XyConsoleSpanExporter` class, which is deprecated.
  - **Fix:** Add one line listing the main exports, and say to use `createXyConsoleSpanExporter()` instead of the deprecated `new XyConsoleSpanExporter()`. The umbrella-side deprecations are covered in the modules.md telemetry-exporter item.
  - **Evidence:** ariestools/sdk-js/packages/telemetry/dist/neutral/index.mjs:246-256; src/span.ts:20,35-166; src/XyConsoleSpanExporter.ts:21,48,145,149-153; README.md.
  - <sub>ids: skills/ariestools-sdk/packages.md#11</sub>

- ⚪ **json-rpc-engine: the `/v2` drop-in subpath and the deliberately omitted legacy API are not mentioned**
  - **Now:** packages.md:99 "Browser-safe re-export of MetaMask's JSON-RPC engine v2 public surface (tree-shakes legacy middleware paths)."
  - **Actual:** The package also exports `./v2`, identical to `.`, as a drop-in for `@metamask/json-rpc-engine/v2`. `asLegacyMiddleware` and the v1 API (`JsonRpcEngine`, `createAsyncMiddleware`) are deliberately not exported, so Node v1 users keep `@metamask/json-rpc-engine`. 9.0.0 moved the underlying dependency to `@metamask/json-rpc-engine ~11.0.0`.
  - **Fix:** "Drop-in for `@metamask/json-rpc-engine/v2` — replace it with `@ariestools/json-rpc-engine/v2` (or the root). `asLegacyMiddleware` and the v1 `JsonRpcEngine` are not exported."
  - **Evidence:** ariestools/sdk-js/packages/json-rpc-engine/package.json:38; src/index.ts:1-45; README.md "Not exported"; `git diff v8.3.0 v9.0.1 -- packages/json-rpc-engine/package.json`.
  - <sub>ids: skills/ariestools-sdk/packages.md#13, cov-sdk-specialist#15</sub>

## Refuted during verification

- 'Typically compiled to dist/neutral/' understates the umbrella's per-platform builds — skills/ariestools-sdk/overview.md#7. The skill-text verifier refuted it. The hedged line is still correct, because only the root, `/platform` and `/url` are conditional. modules.md:98-100 and conventions.md:8 already cover conditional exports and deep `dist` imports. The three root bundles are byte-identical, so the extra nuance would change nothing.
- No note on where the module manifest lives for agents editing sdk-js — skills/ariestools-sdk/modules.md#11. The code verifier refuted it, because conventions.md:33-46 already covers the maintainer workflow: xy.config.ts, `pnpm sync-sdk-layout`, and no hand-editing of generated shims. The real leftover problem, the stale `sdkModules` term and README pointer, is covered by the conventions.md maintainer-notes item.
