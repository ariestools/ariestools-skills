---
title: "Skills sync audit 2026-10-08 — ariestools-sdk"
kind: evidence
state: superseded
date: "2026-10-08"
commit: "7e78933a8"
status: "Partial audit of the ariestools-sdk skill at ariestools-skills 7e78933a8 against @ariestools/toolchain 10.1.0 (main 7eb43c3c2) and @ariestools/sdk 9.0.1 (298fbb5bb); 39 merged items, 27 verified by two lenses, 12 unverified because the run was paused."
audience: "ariestools-skills maintainers and agents updating the skill pack"
supersededBy: docs/evidence/2026-10-08-skills-sync-audit-complete-ariestools-sdk.md
---

# Skills sync audit — ariestools-sdk

> **Archived 2026-10-08.** Superseded by [`docs/evidence/2026-10-08-skills-sync-audit-complete-ariestools-sdk.md`](../../evidence/2026-10-08-skills-sync-audit-complete-ariestools-sdk.md).
> Original path: `docs/evidence/2026-10-08-skills-sync-audit-ariestools-sdk.md`. Retained as a record of the partial audit (verification paused,
> toolchain 10.1.0) that was current until the complete audit replaced it; do not follow it.

This document records claims about `skills/ariestools-sdk/` that auditors checked against named sources: ariestools-skills 7e78933a8, `@ariestools/toolchain` 10.1.0 (main 7eb43c3c2), ariestools/sdk-js at `@ariestools/sdk` 9.0.1 (298fbb5bb), and npm registry metadata. Items marked `verified` were also confirmed by two independent verifiers, one checking the code and one checking the skill text, and their adjustments are folded in. Items marked `unverified` were checked against source by an auditor only; no independent verifier has confirmed them. Nothing here has been applied to the skills, and this is not a remediation plan. Duplicate findings from the per-file, coverage and architecture auditors are merged, and each merged item takes the strongest status among its members. Back to the [Audit index](2026-10-08-skills-sync-audit.md).

## Summary

The skill's routing structure is sound, but its content predates sdk-js 8.1.8 through 9.0.1: every content line dates from 8a7d4f0 (2026-07-31). Following some of its defaults breaks a consumer. The auth-wrapping fetcher example drops every SDK header. `zod` is called optional, yet the root barrel loads it. The storage-adapters install line installs neither backend. The skill also lacks the 9.x Node >= 26 floor, the bounded-read fetch controls, and a correct `@xylabs/*` migration map, and its import-style advice (prefer subpaths) contradicts the ecosystem's root-barrel norm. Most other items are thin or stale catalog text.

| | 🔴 High | 🟠 Medium | ⚪ Low | Total |
|---|---|---|---|---|
| Remove | 0 | 1 | 0 | 1 |
| Update | 4 | 7 | 15 | 26 |
| Add | 0 | 4 | 8 | 12 |
| **Total** | **4** | **12** | **23** | **39** |

Status: 27 verified · 0 partially verified · 12 unverified. These merge 99 raw findings, none of which was refuted.

## `skills/ariestools-sdk/SKILL.md`

### Update

- ⚪ **Router lists omit `@ariestools/sdk-meta` and the deprecated `@ariestools/crypto`** · `verified`
  - **Now:** SKILL.md:3 lists "(express, storage-adapters, threads, testing, telemetry, crypto-auth, eth-address, pixel, json-rpc-engine)", and SKILL.md:28 lists the same set. overview.md:62-72 omits sdk-meta, and overview.md:56 says "Deprecated browser crypto polyfill packages" without naming the package. packages.md:19-20 and :109-111 do cover both.
  - **Actual:** sdk-js publishes 11 public packages at 9.0.1. They include `@ariestools/sdk-meta` (cheerio-based HTML head, OpenGraph and Twitter helpers) and `@ariestools/crypto`, which is npm-deprecated with "Use platform native crypto functionality instead". The toolchain's `ARIESTOOLS_SDK_JS_PACKAGES` lists both, so either one makes the toolchain require this skill. A task that names the package still matches the `@ariestools/*` trigger. Only tasks that don't name a package (such as "add OpenGraph tags") miss it.
  - **Fix:** Add `sdk-meta` (HTML/OpenGraph/Twitter meta) and "deprecated: crypto" to SKILL.md:3 and :28, and optionally add "HTML meta / OpenGraph tags" as a trigger. In overview.md:64-72, add "HTML `<head>`/meta tag merging and building → `@ariestools/sdk-meta`". Change overview.md:56 to "`@ariestools/crypto` (npm-deprecated; use Web Crypto / `node:crypto`)".
  - **Evidence:** ariestools/sdk-js/packages/meta/package.json:2, src/index.ts:1-4; ariestools/sdk-js/packages/crypto/package.json:2-5; `npm view @ariestools/crypto version deprecated`; ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-40, skillRules.ts:105-120.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#0, cov-sdk-umbrella#12, skills/ariestools-sdk/overview.md#6</sub>

- ⚪ **Router sends "platform-conditional modules" to conventions.md, which has no such section, and the root barrel is conditional too** · `verified`
  - **Now:** SKILL.md:36 routes "platform-conditional modules" to conventions.md. The only coverage is modules.md:98-100, which names only `platform` and `url`.
  - **Actual:** conventions.md has these sections: Import style, ESM only, Tree-shaking, Deprecations, Relationship to the toolchain, Monolith layout, Testing consumers, Checklist. None covers platform-conditional modules. The umbrella has three conditional exports: `.`, `./platform` and `./url`. For the root `.`, `node` resolves to dist/node, `browser` to dist/browser, and the unconditioned `default` to the **browser** build. `/platform` exports `isNode`, `isBrowser`, `isWebworker` and `subtle`, which comes from `node:crypto` on Node. Other packages also build outside dist/neutral: express (node only), pixel (browser only), threads and crypto (separate node and browser builds).
  - **Fix:** Move "platform-conditional modules (platform, url)" from the conventions line at SKILL.md:36 to the modules line at SKILL.md:24. Extend modules.md:98-100 to say that the root barrel, `platform` and `url` use conditional exports (`node` / `browser` / default), with the root's default resolving to the browser build. It should also say to let resolution pick the build, to use `/platform` (`isNode`, `isBrowser`, `subtle`) instead of sniffing globals, and never to import `dist/*` by hand. overview.md:12 ("typically compiled to `dist/neutral/`") can stay.
  - **Evidence:** skills/ariestools-sdk/conventions.md:3-61 (headings); skills/ariestools-sdk/modules.md:98-100; ariestools/sdk-js/packages/sdk/package.json:128-142 (`.`), :271-284 (`./platform`), :349-362 (`./url`); src/modules/platform/index-neutral.ts, src/modules/platform/node/index.ts.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#4, skills/ariestools-sdk/conventions.md#3, skills/ariestools-sdk/overview.md#7 · severity: conventions.md#3 proposed medium, but the verifiers rated both the misroute and the root-conditional gap low</sub>

- ⚪ **Trigger "@ariestools/* utilities" claims more than this sdk-js-only skill covers** · `verified`
  - **Now:** SKILL.md:3: "Use when importing or choosing @ariestools/* utilities". There is no out-of-scope note, and packages.md:3 adds "(or closely related Aries Tools packages)".
  - **Actual:** The `@ariestools` scope also includes sdk-react (`@ariestools/sdk-react` plus 10 `sdk-react-*` packages, 12.0.1), actor-kit (`actor*`, `provider*`, 2.0.0), browser-kit (2.0.0) and cli-kit (2.1.0). No skill covers them, and toolchain detection counts only sdk-js packages. The name `ariestools-sdk` is wired into toolchain detection and pinned in the skills-lock.json files of sdk-js, sdk-react, actor-kit and browser-kit, so the skill should keep its name.
  - **Fix:** Keep the name. Narrow the trigger to "@ariestools/* packages published from sdk-js". After SKILL.md:12, add: "Not covered: `@ariestools/sdk-react*`, actor-kit (`@ariestools/actor*`, `provider*`), browser-kit, cli-kit; read those repos' READMEs." Remove "(or closely related Aries Tools packages)" from packages.md:3. Link sibling Layer-3 skills only once they exist.
  - **Evidence:** ariestools/sdk-react/packages/sdk/package.json; ariestools/actor-kit/packages/actor/package.json; ariestools/toolchain/packages/toolchain/src/actions/skills/detectProfile.ts:26-40, lint.ts:108-110; ariestools/sdk-react/skills-lock.json.
  - <sub>ids: skills/ariestools-sdk/SKILL.md#5, arch-coverage#11</sub>

- ⚪ **No Authority line and no "Related skills" section, unlike the other three skills** · `unverified`
  - **Now:** SKILL.md:10-14 has only the scope line, the "builds on" line and the Skill identity line.
  - **Actual:** xy-development, xy-toolchain and xy-agent each have an Authority line at SKILL.md:10 and a `## Related skills` section. ariestools-sdk is owned only in this repo.
  - **Fix:** Add "**Authority.** Maintained only in ariestools/ariestools-skills" without the xyo-stub clause. Add a `## Related skills` section that links xy-development (L1) and xy-toolchain (L2), plus the React and actor-kit skills once they exist. arch-coverage#11 recommends the same addition.
  - **Evidence:** `grep -n "Authority\|Skill identity\|Related skills" skills/*/SKILL.md`; ariestools/toolchain/packages/toolchain/src/actions/skills/defaults.ts:4-17.
  - <sub>ids: arch-layering#14</sub>

## `skills/ariestools-sdk/conventions.md`

### Update

- 🔴 **Import guidance prefers subpaths, but the ecosystem imports the root barrel, and mixing the two splits class identity** · `unverified`
  - **Now:** conventions.md:6 says "Prefer **subpath imports** for clarity…", :17 says "Prefer subpaths in libraries…", and :56 says "Prefer `@ariestools/sdk` + subpath for neutral helpers". The same advice appears at overview.md:22 ("subpaths are clearer and tree-shaking-friendly") and modules.md:3 ("Prefer subpaths when the import set is small").
  - **Actual:** In 9.0.1 the root `.` resolves per platform: `node` gives dist/node/index.mjs and dist/node/index.d.ts. Every other subpath resolves to dist/neutral. Under the house NodeNext tsconfig, mixing root and subpath imports therefore loads two declaration trees, and classes with private members become nominally incompatible (for example, `AbstractCreatable` has `private _status`). actor-kit switched to root imports for this reason in 5299634. At runtime, the monolith default `moduleLinkage: 'bundle'` copies shared classes into every entry. `Base` is defined separately in dist/neutral/base.mjs, creatable.mjs, events.mjs and the root, and `FetchError` in api.mjs, fetch.mjs and the root, so `instanceof` fails across entries, even between two subpaths. Downstream code imports only from the root (root/subpath import counts: actor-kit 18/0, sdk-react 115/0, browser-kit 1/0). The root has a cost: it statically loads `zod/mini`, `zod/v4/core`, `@ariestools/telemetry` (and through it `@opentelemetry/api`) and `async-mutex`, and Node without a bundler does no tree-shaking.
  - **Fix:** Make the root barrel `@ariestools/sdk` the default, and say never to mix root and subpath imports in one program. The root is required whenever SDK values or types (AbstractCreatable, BaseEmitter, Creatable params, loggers) cross into actor-kit, cli-kit, browser-kit or sdk-react. Allow subpaths only in isolated leaf bundles that share no SDK class, and explain why: subpaths are neutral-only, while the root is per-platform. State the root's peer cost: install `zod` ^4.6 and `@opentelemetry/api`. Add: "Do not use `instanceof` with SDK classes across entry points; use the guards such as `isFetchError`." Reword :17 so it no longer suggests tree-shaking makes root imports cheap at Node runtime. Apply the same change to overview.md:22 and modules.md:3, and add a short "Class identity" note next to `creatable` in modules.md.
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json exports (`.` has node/browser/types/default conditions; `./creatable` and `./fetch` have only types/default pointing at dist/neutral); dist/neutral/{base,creatable,events}.mjs (`var Base = class _Base`); dist/neutral/{api,fetch}.mjs and dist/node/index.mjs:84 (`var FetchError`); dist/node/modules/creatable/AbstractCreatable.d.ts vs dist/neutral/modules/creatable/AbstractCreatable.d.ts; src/modules/fetch/FetchError.ts:35,149,202 (the `isFetchError` marker); ariestools/toolchain/packages/toolchain/src/actions/package/compile/MonolithConfig.ts:155-166; ariestools/toolchain/packages/tsconfig/tsconfig.json (NodeNext); ariestools/actor-kit commit 5299634; `grep` of each downstream repo's packages/ directory for import counts.
  - <sub>ids: arch-coverage#0, skills/ariestools-sdk/conventions.md#2, skills/ariestools-sdk/conventions.md#4 · contradictory fixes: conventions.md#2 proposed "in libraries, import from subpaths". A source check at 298fbb5bb (the exports map, classes duplicated per entry in dist/neutral, actor-kit 5299634, downstream import counts) supports arch-coverage#0, so that direction is kept. conventions.md#2's peer-loading facts are kept as the root's cost.</sub>

- ⚪ **Monolith maintainer notes use the stale `sdkModules` name, point to a stale README, and cover only `@ariestools/sdk`** · `verified`
  - **Now:** conventions.md:39 has "pnpm sync-sdk-layout   # after editing sdkModules / monolith layout". :42 says "Do not hand-edit generated monolith shims under `packages/sdk/src/*.ts`…". :46 says "…so imports, shims, and exports stay consistent. See the package README 'Monolithic layout' section."
  - **Actual:** `sdkModules` and `scripts/sync-sdk-layout.mjs` were removed on 2026-07-06 (0cfffd89f). Modules are now declared under `compile.monolith.modules` in packages/sdk/xy.config.ts, with the flags `model`, `barrel`, `export` and `internal`, alongside `conditionalImports`, `platformEntries` and `aliasImports`. `pnpm sync-sdk-layout` runs the toolchain bin `package-sync-layout`, a `sync-sdk-layout:check` variant exists, and `xy compile` re-syncs automatically. The sync writes package.json `imports`, tsconfig `paths`, src/index.ts, src/model.ts and the per-module shims. It does not write package.json `exports`; `xy publint --fix` checks and fixes those. `@ariestools/storage-adapters` and `@ariestools/testing` are also monolith packages, and their generated files carry the same "do not edit by hand" header. The README section the skill points to still describes `sdkModules`.
  - **Fix:** Change the comment at :39 to "# after editing compile.monolith in packages/sdk/xy.config.ts", and add `pnpm --filter @ariestools/sdk sync-sdk-layout:check`. At :42 and :46, say: "`@ariestools/sdk`, `@ariestools/storage-adapters` and `@ariestools/testing` use `compile.mode: 'monolith'`; do not hand-edit their generated `src/*.ts` shims; `xy compile` re-syncs them. Sync regenerates `imports`, tsconfig paths and shims; new subpath `exports` are checked and fixed by `xy publint --fix`." Link to [xy-toolchain compilation.md#monolith-mode](../../../skills/xy-toolchain/compilation.md#monolith-mode) instead of the README section.
  - **Evidence:** ariestools/sdk-js/packages/sdk/xy.config.ts:8-13, :71-81; packages/sdk/package.json:381-382; packages/sdk/src/index.ts:1 (generated header); packages/{storage-adapters,testing}/xy.config.ts (`mode: 'monolith'`); packages/sdk/README.md:221-228; ariestools/toolchain/packages/toolchain/src/actions/package/compile/monolithCompileLayout.ts:308-311 (only `pkg.imports` is assigned; file unchanged since v10.1.0), compile/packageCompileMonolith.ts:157, actions/package/exportMapPublint.ts:35.
  - <sub>ids: skills/ariestools-sdk/modules.md#11, skills/ariestools-sdk/conventions.md#10, skills/ariestools-sdk/conventions.md#11, cov-sdk-umbrella#11, cov-sdk-specialist#17 · contradictory claim: modules.md#11 said the sync regenerates package.json `exports`, but monolithCompileLayout.ts:308-311 assigns only `imports`, so conventions.md#10's version is kept. modules.md#11 was also retargeted from modules.md to conventions.md by its verifiers.</sub>

- ⚪ **The whole `@ariestools/crypto` package is npm-deprecated, not just "polyfill-oriented use"** · `unverified`
  - **Now:** conventions.md:24 says "`@ariestools/crypto` polyfill-oriented use | Prefer platform native Web Crypto / Node crypto", and packages.md:20 says "…`@ariestools/crypto` is legacy-oriented".
  - **Actual:** Both package.json and npm carry `deprecated: "Use platform native crypto functionality instead"` (since 75e3ed8dd, 2026-07-09). The package exports only `Crypto`, an alias of `globalThis.crypto` or `node:crypto`, and a no-op `cryptoPolyfill()`, and both are marked `@deprecated`. `subtle` from `@ariestools/sdk/platform` is a neutral replacement.
  - **Fix:** Change conventions.md:24 to: "`@ariestools/crypto` (whole package, npm-deprecated) → `globalThis.crypto` / `node:crypto`, or `subtle` from `@ariestools/sdk/platform`; do not add it; remove `cryptoPolyfill()` calls (they are no-ops)." Change packages.md:20 to "Deprecated on npm — do not install."
  - **Evidence:** ariestools/sdk-js/packages/crypto/package.json:5; packages/crypto/src/{browser,node}/{Crypto,cryptoPolyfill}.ts; packages/crypto/README.md; packages/sdk/src/modules/platform/index-neutral.ts; `npm view @ariestools/crypto deprecated`.
  - <sub>ids: skills/ariestools-sdk/conventions.md#5, skills/ariestools-sdk/packages.md#10, cov-sdk-specialist#12 · severity: conventions.md#5 proposed medium, but the verifiers rated the same npm-deprecation gap low under overview.md#6</sub>

- ⚪ **Undici checklist item is stricter than the SDK guidance** · `unverified`
  - **Now:** conventions.md:60: "For Node HTTP caching, own Undici in the app — not in shared libraries."
  - **Actual:** The SDK README reserves only the **global** dispatcher for terminal apps. Libraries may inject a module-local Undici fetcher that owns its own dispatcher and cache, which fetch.md:45 already says.
  - **Fix:** "Only terminal apps (services, CLIs, worker entrypoints) install a global Undici dispatcher. Libraries that need caching inject a module-local `fetcher` and own its lifecycle. Never add Undici to a shared library just to change global fetch."
  - **Evidence:** ariestools/sdk-js/packages/sdk/README.md:31-35, :38-73, :106-109; skills/ariestools-sdk/fetch.md:45.
  - <sub>ids: skills/ariestools-sdk/conventions.md#13</sub>

### Add

- ⚪ **Deprecation table omits API-level deprecations in the specialist packages and the umbrella** · `unverified`
  - **Now:** conventions.md:19-25 has three rows: telemetry re-exports, crypto, and the `@xylabs/*` shims.
  - **Actual:** These APIs are still exported but marked `@deprecated`. crypto-auth `encryptSeedPhrase`/`decryptSeedPhrase` are replaced by `SeedPhraseVault#encryptPhrase`/`#decryptPhrase` (or `VaultCrypto`). express `Logger`/`LogFunction` types are replaced by `@ariestools/sdk/logger`. eth-address `ellipsize` is replaced by `@ariestools/sdk/ellipsize`. sdk/hex `EthAddressToStringSchema`/`EthAddressFromStringSchema` are replaced by the `…Zod` schemas. sdk/object `PartialRecord` is replaced by `Partial<Record<>>`.
  - **Fix:** Add an "API-level deprecations" sub-table with these five mappings. Alternatively, add one line pointing to `@typescript-eslint/no-deprecated` and name the two that matter most: the seed-phrase functions and `XyConsoleSpanExporter`.
  - **Evidence:** ariestools/sdk-js/packages/crypto-auth/src/seedPhrase.ts:10-21, SeedPhraseVault.ts:119,134; packages/express/src/Logger/index.ts:9-13; packages/eth-address/src/ellipsize.ts:2; packages/sdk/src/modules/hex/ethAddress.ts:19,28; packages/sdk/src/modules/object/PartialRecord.ts:3.
  - <sub>ids: skills/ariestools-sdk/conventions.md#9</sub>

## `skills/ariestools-sdk/fetch.md`

### Update

- 🔴 **Auth-wrapping fetcher example spreads a `Headers` instance and drops every SDK header, including `Content-Encoding: gzip`** · `verified`
  - **Now:** fetch.md:39-40 `globalThis.fetch(input, { ...init, headers: { ...init?.headers, authorization: token } })`
  - **Actual:** fetchJson and FetchClient always pass `init.headers` to the fetcher as a `Headers` instance built by `buildHeaders()`. When a body is longer than 1024 chars, fetchCompress rebuilds it as `new Headers(init.headers)` and adds `Content-Encoding: gzip`. Object-spreading a `Headers` instance yields `{}`, so the request keeps only `authorization`. Accept and `Content-Type: application/json` are lost, and gzip bodies arrive with no encoding header. A verifier reproduced this against the built 9.0.1 SDK.
  - **Fix:** `const fetcher: FetchFunction = (input, init) => { const headers = new Headers(init?.headers); headers.set('authorization', token); return globalThis.fetch(input, { ...init, headers }) }`. Add: "`init.headers` is a `Headers` instance, so never object-spread it, and forward `init`, including `signal`. For plain auth, prefer client-level `headers`."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/: fetchJson.ts:9-20,38-41; FetchClient.ts:60-71,171-182; fetchCompress.ts:49,55-68; fetchJson.spec.ts:105. On Node 26.9.0, `node -e` spreading `new Headers({...})` with `authorization:'tok'` printed `{"authorization":"tok"}`.
  - <sub>ids: skills/ariestools-sdk/fetch.md#0, cov-sdk-specialist#2</sub>

- 🟠 **Result and error semantics are missing: `fetchJson` returns an envelope and never throws on non-2xx, while `FetchClient` throws `FetchClientError`** · `verified`
  - **Now:** fetch.md:22 has `const data = await fetchJson<MyDto>(…)` and :25 has `await client.get('/item')`. :30 lists only `FetchError`, `isFetchError`, `toFetchError` and `classifyFetchError`. The file never gives a return shape or says when a call throws.
  - **Actual:** fetchJson, the `fetchJson*` helpers and every FetchClient method resolve to `FetchJsonResponse<T>`, which is `{ data: T | null, headers, response, status, statusText }`. `data` is null for an empty body and for a malformed non-2xx body. fetchJson and its helpers never throw on HTTP status, only on transport failures, parse failures on success, and policy failures. FetchClient, FetchJsonClient and `fetchJsonClient` throw `FetchClientError` when `validateStatus` rejects the status. That error is a FetchError with type `'http-status'`, `.response` and `.config`. By default 200-299 is accepted, and `validateStatus: null` never throws. Separately, an invalid `maxResponseBytes` throws a RangeError, and an invalid URL in FetchClient throws a TypeError.
  - **Fix:** Change the examples to `const { data, status } = await fetchJson<MyDto>(url) // data: MyDto | null` and `const { data: item } = await client.get<MyDto>('/item')`. Add an "Errors and HTTP status" subsection: use fetchJson and its helpers to branch on `status`/`response.ok`, and use FetchClient/fetchJsonClient for Axios-style throw-on-non-2xx, catching `FetchClientError` (or `isFetchError(e) && e.type === 'http-status'`). Document `validateStatus` (a function or `null`). Add `FetchClientError` to the list at :30, and extend :117 with "do not assume fetchJson throws on non-2xx".
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/: types.ts:10-21; fetchJson.ts:31,43-53; parseJson.ts:44,60-82; methods.ts:8-42; FetchClient.ts:16-21,34-58,111-151,189-211; index.ts:2; fetchJson.spec.ts:81-86,146-148; FetchClient.spec.ts:264-307.
  - <sub>ids: skills/ariestools-sdk/fetch.md#1, skills/ariestools-sdk/fetch.md#2, cov-sdk-umbrella#3, cov-sdk-specialist#3 · severity: cov-sdk-specialist#3 proposed high, but both verifiers rated each half medium because TypeScript flags most envelope misuse</sub>

- ⚪ **Export list is incomplete: FetchJsonClient, FetchClientError, readResponseText, `fetch/model` and the Axios mapping are missing** · `verified`
  - **Now:** fetch.md:7: "Helpers such as `fetchJson`, `fetchCompress`, `FetchClient`, and `fetchJsonClient`". :30 lists four error utilities.
  - **Actual:** `@ariestools/sdk/fetch` also exports the `FetchJsonClient` class (with `static create`), `FetchClientError` and `readResponseText`. Its types are exported there and from `@ariestools/sdk/fetch/model`: FetchClientConfig, FetchClientRequestConfig, FetchCompressOptions, FetchFunction, FetchErrorContext, FetchErrorJson, FetchErrorType, FetchJsonOptions, FetchJsonResponse and ReadResponseTextOptions. FetchError has `toJSON()`. FetchJsonClient/fetchJsonClient are documented as the drop-in replacement for `@xylabs/axios` `axiosJson`/`AxiosJson`. `@xylabs/fetch` (8.0.2) is npm-deprecated in favor of `@ariestools/sdk/fetch`. `@xylabs/axios` itself is not deprecated.
  - **Fix:** Expand :7, or add an Exports list, with FetchJsonClient, FetchClientError and readResponseText. Name `@ariestools/sdk/fetch/model` for type-only imports. Add a migration line, worded as a mapping rather than a deprecation: `@xylabs/axios` axiosJson/AxiosJson → `fetchJsonClient`/`FetchJsonClient`; `@xylabs/fetch` → `@ariestools/sdk/fetch`.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/index.ts:1-27, model.ts:1-12, FetchJsonClient.ts:4-6,15-31, FetchError.ts:182-193; packages/sdk/package.json:227-234; `npm view @xylabs/fetch deprecated version`.
  - <sub>ids: skills/ariestools-sdk/fetch.md#6</sub>

- ⚪ **Undici guidance drops the README's "compatible Undici release" qualifier and its install-once rule** · `verified`
  - **Now:** fetch.md:49: "the **consumer** installs Undici and supplies a fetcher or global dispatcher."
  - **Actual:** The README says to install "a compatible Undici release". The installed major does **not** have to match Node's bundled undici. undici 7.29.1 and 8.10.2 both register `Symbol.for('undici.globalDispatcher.2')`, and a cache-intercepted Agent from 7.29.1 drove Node 26.9.0's built-in fetch. The API the snippets use (`Agent().compose`, `interceptors.cache`, `cacheStores.MemoryCacheStore`) is valid in both versions. README.md:111-113 also says to install the global dispatcher once at bootstrap, because it replaces the previous one, and to include any proxy, TLS, retry or tracing behavior in it.
  - **Fix:** At :49, restore "a compatible Undici release", meaning one whose Dispatcher API is compatible with the running Node's `process.versions.undici`; 7.29+ and 8.x both work on Node 26. Do not mandate a major. Under "Process-wide default", add the install-once note from README.md:111-113.
  - **Evidence:** ariestools/sdk-js/packages/sdk/README.md:33-36, :111-113; undici@7.29.1 and undici@8.10.2 lib/global.js:5 and types/cache-interceptor.d.ts; `node -p process.versions.undici` on Node 26.9.0 → 8.10.2.
  - <sub>ids: skills/ariestools-sdk/fetch.md#7</sub>

### Add

- 🟠 **Bounded, cancellable response reads (`maxResponseBytes`, `timeout`, `signal`, `readResponseText`) are absent from fetch.md and from the router** · `verified`
  - **Now:** absent. SKILL.md:32 routes to fetch.md only for "`fetchJson` / `FetchClient`, injecting a custom fetcher, or … Undici". fetch.md has a single commit, 8a7d4f0 (2026-07-31).
  - **Actual:** Since 8.2.0 (b86f3a024, 2026-08-27), fetchJson, FetchClient and FetchJsonClient accept `maxResponseBytes`. It must be a positive safe integer and is validated before any I/O (otherwise a RangeError). It counts decoded stream bytes and applies to non-2xx bodies too. FetchClient's `timeout` (ms; 0 disables it) composes with the caller's `signal`, the first abort wins, and the signal stays active while the body is read. Failures are FetchErrors of type `'response-too-large'`, `'aborted'` or `'timeout'`. When a cap or signal is set, read errors on non-2xx bodies propagate instead of becoming `data: null`, even with `validateStatus: null`. `readResponseText(response, { maxResponseBytes, signal })` is exported, and `ReadResponseTextOptions` is in `@ariestools/sdk/fetch/model`. The SDK applies no SSRF, redirect or credentials policy.
  - **Fix:** Change SKILL.md:32 to "…`FetchClient`, bounding or cancelling response reads (`maxResponseBytes`, `signal`, client `timeout`, `readResponseText`), injecting a custom fetcher, or…". Add a "Bounded reads, timeouts and cancellation" section to fetch.md, condensed from README.md:133-212. Include a FetchJsonClient example (`{ maxResponseBytes, timeout }` plus a per-request `signal`), the three error types, a `readResponseText` example, and one line saying to set `redirect: 'error'` and `credentials: 'omit'` when needed. Do not copy the README's stale "Node baseline (18.17.1+)" line.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/: types.ts:4-7; FetchClient.ts:14-15,158-187; requestSignal.ts:12-32; readResponseText.ts:5-23,34-44,168-181; parseJson.ts:60-76; FetchError.ts:15,30; index.ts:25-27; model.ts:11. packages/sdk/README.md:133-212. `git tag --contains b86f3a024` → v8.2.0, v8.3.0, v9.0.1.
  - <sub>ids: skills/ariestools-sdk/fetch.md#3, skills/ariestools-sdk/SKILL.md#3, cov-sdk-umbrella#4, cov-sdk-specialist#4</sub>

- 🟠 **Request-side behavior is undocumented: gzip by default over 1024 chars, `body` vs `data`, WHATWG `baseURL` resolution, shallow-merged client defaults** · `verified`
  - **Now:** fetch.md:7 names `fetchCompress` without explaining it. :24-25 shows a `baseURL` with no path. :28 lists the method helpers without saying how they handle request bodies.
  - **Actual:**
    1. Compression is on by default for every helper. Any body whose string length exceeds `compressMinLength` (default 1024) is gzipped and sent with `Content-Encoding: gzip`, so the server must accept gzip request bodies. Raise `compressMinLength` to opt out.
    2. fetchJson's `body` is a native BodyInit sent as-is. fetchJsonPost/Put/Patch and client.post/put/patch JSON.stringify `data`.
    3. FetchClient resolves URLs with `new URL(path, baseURL)`, so `/item` against `https://api.example.com/v1` gives `https://api.example.com/item`. This differs from Axios-style joining, which matters because FetchJsonClient is billed as an axiosJson drop-in.
    4. Per-request config shallow-replaces the instance defaults, so request-level `headers` or `params` replace the client's instead of merging.
  - **Fix:** Add a compact "Request options" table: `baseURL` (WHATWG resolution; use a trailing slash and a relative path to keep a base path), `params`, `headers`, `timeout`, `validateStatus`, `compressMinLength` (default 1024; gzip on by default), `fetcher`, `maxResponseBytes`. Note the shallow merge, and that fetchJson takes a string `body` while the helpers and client methods take `data`. Describe what the code does, not the fetchCompress doc comment, which says "when set" and "byte count".
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/: fetchCompress.ts:15-26,41,47-68; FetchJsonClient.ts:6-13; methods.ts:13-37; FetchClient.ts:9-32,73-83,97,152,178-180; FetchClient.spec.ts:193-199. `node -p "new URL('/item','https://api.example.com/v1').href"` → `https://api.example.com/item`.
  - <sub>ids: skills/ariestools-sdk/fetch.md#5</sub>

- ⚪ **Injected-fetcher contract is missing: forward `init`/`signal`, and non-WHATWG bodies fall back to buffered `text()`** · `verified`
  - **Now:** fetch.md:32-45 shows how to pass a `FetchFunction`, but not what it must forward or what its Response must support.
  - **Actual:** An injected fetcher must honor the provided `signal` while it acquires the response (README.md:169-170). Since 9.0.1 (158476cd7), when a cap, a signal or a FetchClient `timeout` is set, a Response whose body lacks `getReader()` is read with `response.text()`. That covers the Node Readable from node-fetch and cross-fetch, the whatwg-fetch and React Native polyfills, and test doubles. In that fallback, abort only stops waiting, and `maxResponseBytes` is checked against the UTF-8 length only after the whole body is buffered, so it no longer bounds memory. In 8.2.0-8.3.x these policy-bound reads threw; plain reads worked on every version.
  - **Fix:** In "Injecting a fetcher", add: a FetchFunction must forward `init`, including `init.signal` so timeouts and aborts cancel the request, and must keep `init.headers` intact (see the headers item). In the bounded-reads section, add two sentences on the non-stream fallback, noting that policy-bound reads with such fetchers need `@ariestools/sdk` >= 9.0.1.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/fetch/readResponseText.ts:129-146,156-161,168-180; FetchClient.ts:169; packages/sdk/README.md:169-170, :201-206; `git merge-base --is-ancestor 158476cd7 v9.0.1`.
  - <sub>ids: skills/ariestools-sdk/fetch.md#4</sub>

## `skills/ariestools-sdk/modules.md`

### Update

- 🟠 **The `forget` row points to a nonexistent `forget/node` subpath; `/forget` already is the Node variant** · `verified`
  - **Now:** modules.md:38: "Fire-and-forget promises (node variants under forget/node)"
  - **Actual:** Only `./forget` and `./forget/model` are exported, so `@ariestools/sdk/forget/node` fails with ERR_PACKAGE_PATH_NOT_EXPORTED. The published `/forget` is a single neutral build, and on every platform it re-exports `forgetNode as forget` and `ForgetPromiseNode as ForgetPromise`. Its `ForgetNodeConfig` options `terminateOnException` and `terminateOnTimeout` default to false and call `process.exit(1)` or `process.exit(2)` when enabled. The neutral-only variant is not published.
  - **Fix:** "`forget(promise, config?)`, `ForgetPromise`. The published entry is the Node-capable variant on all platforms; `terminateOnException`/`terminateOnTimeout` (default false) call `process.exit`, so leave them off in browser or library code. There is no `/forget/node` subpath."
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:235-242; src/modules/forget/index.ts:1, forget/node/index.ts:1-3, forget/ForgetNodeConfig.ts:7-19; dist/neutral/forget.mjs:222,239,248-252.
  - <sub>ids: skills/ariestools-sdk/modules.md#1, cov-sdk-umbrella#5</sub>

- 🟠 **The `retry` example hides that retry ignores thrown errors and defaults to zero retries** · `verified`
  - **Now:** modules.md:79 has `await retry(async () => doWork(), { /* options per package API */ })`, and :47 says only "Retry helpers".
  - **Actual:** `retry(func, config?)` has no try/catch, so a thrown error propagates on the first attempt and is never retried. It retries only while `complete(result)` is false; by default that means while the result is `undefined`. Defaults are `retries = 0`, `interval = 100` ms and `backoff = 2`. When retries run out it returns `undefined` instead of throwing. A void `doWork()` never counts as complete, so with `retries: N` it runs N+1 times even when it succeeds.
  - **Fix:** `const value = await retry(() => fetchMaybe(), { retries: 3, interval: 100, backoff: 2, complete: v => v !== undefined })`. Add a note: "retry re-runs on an incomplete or `undefined` result, not on exceptions, so catch errors and return `undefined` to trigger a retry. The default is 0 retries, and running out of retries returns `undefined`."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/retry/retry.ts:5-18,26-41; src/spec/retry/retry.spec.ts (has no case for thrown errors).
  - <sub>ids: skills/ariestools-sdk/modules.md#2, cov-sdk-umbrella#6</sub>

- ⚪ **Catalog cells are stale or name nonexistent exports (base, logger, typeof `is`, platform)** · `verified`
  - **Now:** modules.md:28 describes base as "Base types / shared foundations", :42 describes logger as "`ConsoleLogger`, level/silent loggers", :54 lists "…`is` / `ifTypeOf`" for typeof, and :44 describes platform as "Platform detection (node/browser conditional)".
  - **Actual:**
    - `base` exports the `Base` class (logger plus OTel meter/tracer providers, `Base.defaultLogger`), `globallyUnique`/`disableGloballyUnique`, and `initDefaultLogger({ logLevel, defaultLogLevel, moniker, silent })`.
    - `logger` exports `ConsoleLogger`, `LevelLogger`, `SilentLogger`, `IdLogger`, `LogLevel`, `parseLogLevel`, `NoOpLogFunction` and `getFunctionName`.
    - `initDefaultLogger` and `parseLogLevel` first shipped in 8.1.8 (8b2d88456, 2026-08-07).
    - `typeof` has no export named `is`. It exports the `is*` guards (`isDefined`, `isString`, `isObject`, …), `typeOf`, `ifTypeOf`, `ifDefined`, `isType`, `validateType` and `Brand`.
    - `platform` exports `isNode`, `isBrowser`, `isWebworker` and `subtle`.
  - **Fix:** Change the cells:
    - base: "`Base` class (logger + OTel providers, `Base.defaultLogger`), `globallyUnique`, `initDefaultLogger`"
    - logger: "`ConsoleLogger`, `LevelLogger`, `SilentLogger`, `IdLogger`, `LogLevel`, `parseLogLevel`"
    - typeof: "`is*` guards (`isDefined`, `isString`, `isObject`, …), `typeOf`, `ifTypeOf`, `ifDefined`, `Brand`"
    - platform: "`isNode` / `isBrowser` / `isWebworker`, `subtle` (node/browser conditional)"

    Optionally add a CLI/service pattern: `const logger = initDefaultLogger({ logLevel: argv.logLevel, silent: argv.silent, moniker: 'my-svc' })`. Leave the fetch row as a pointer; new fetch exports belong in fetch.md.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/: base/index.ts:1-3, base/initDefaultLogger.ts:17-56, base/Base.ts:25-49; logger/index.ts:1-7, logger/parseLogLevel.ts:17; typeof/index.ts:1-11, typeof/is.ts; platform/index-neutral.ts:4-21, platform/node/index.ts:4-17. `git tag --contains 8b2d88456` lists v8.1.8 first.
  - <sub>ids: skills/ariestools-sdk/modules.md#3, skills/ariestools-sdk/modules.md#7, cov-sdk-umbrella#10, cov-sdk-specialist#18</sub>

- ⚪ **Telemetry deprecations are incomplete: the `telemetry-exporter` row, the conventions table and the packages.md telemetry entry** · `verified`
  - **Now:** modules.md:52 says "Exporter helpers (prefer dedicated telemetry package for new code)". conventions.md:23 lists only `@ariestools/sdk` / `@ariestools/sdk/telemetry`. packages.md:77 names no telemetry exports.
  - **Actual:** `@ariestools/sdk/telemetry-exporter` and the `/telemetry/model` types are `@deprecated` pure re-exports of `@ariestools/telemetry`, slated for removal from the main barrel in a future major. The root `/model` re-exports `#telemetry/model`. Within `@ariestools/telemetry`, the `XyConsoleSpanExporter` class is deprecated in favor of `createXyConsoleSpanExporter()`. `@ariestools/telemetry`'s main exports are `span`, `spanAsync`, `spanRoot`, `spanRootAsync`, `cloneContextWithoutSpan`, `timeBudget`, `createXyConsoleSpanExporter` and `spanDurationInMillis`, plus the types `SpanConfig`, `TelemetryLogger` and `XySpanExporter`.
  - **Fix:** Change modules.md:52 to "**Deprecated re-export path** — use `@ariestools/telemetry` (`createXyConsoleSpanExporter`, `spanDurationInMillis`)". Widen conventions.md:23 to cover `@ariestools/sdk`, `/telemetry`, `/telemetry/model` and `/telemetry-exporter` (all deprecated, removal planned) → `@ariestools/telemetry`, and add a row: `new XyConsoleSpanExporter(…)` → `createXyConsoleSpanExporter(logLevel, logger)`. List the main exports at packages.md:77.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/telemetry-exporter/index.ts:1-13, telemetry/index.ts:1-17, telemetry/model.ts:1-3, src/model.ts; packages/telemetry/src/XyConsoleSpanExporter.ts:149-152; packages/sdk/README.md:235-238; packages/sdk/package.json:325-333.
  - <sub>ids: skills/ariestools-sdk/modules.md#5, cov-sdk-umbrella#9, skills/ariestools-sdk/conventions.md#6, skills/ariestools-sdk/packages.md#11 · severity: conventions.md#6 proposed medium, but the verifiers rated the same row gap low</sub>

- ⚪ **The storage note calls the Mongo adapter a `KeyValueStore` implementation** · `verified`
  - **Now:** modules.md:96: "**Implementations** for IndexedDB and Mongo live in `@ariestools/storage-adapters`."
  - **Actual:** Only `IndexedDbKeyValueStore` (`/indexed-db`, peer `idb` ^8) implements `KeyValueStore`. `/mongo` (peer `mongodb` ^7.6) provides `BaseMongoSdk` and `MongoClientWrapper`, which wrap the Mongo SDK and do not implement the sdk/storage contract.
  - **Fix:** "`KeyValueStore`/`ReadonlyKeyValueStore` contracts live here; `IndexedDbKeyValueStore` (`@ariestools/storage-adapters/indexed-db`) implements them. `@ariestools/storage-adapters/mongo` provides `BaseMongoSdk`/`MongoClientWrapper` for Mongo access."
  - **Evidence:** ariestools/sdk-js/packages/storage-adapters/src/modules/indexed-db/IndexedDbKeyValueStore.ts:1,12; src/modules/mongo/Base.ts:23, Wrapper.ts:14; packages/sdk/src/modules/storage/KeyValueStore.ts:6,21.
  - <sub>ids: skills/ariestools-sdk/modules.md#9</sub>

### Add

- ⚪ **The root `@ariestools/sdk/model` aggregate, and which modules have `/model`, are undocumented** · `verified`
  - **Now:** modules.md:18: "Many modules also publish a `./<name>/model` subpath for types-only imports."
  - **Actual:** `./model` is a types-only barrel that re-exports the model types of all 18 modules that have one: api, assert, base, creatable, enum, error, events, fetch, forget, hex, object, profile, promise, retry, storage, telemetry, typeof and zod. The other modules have no `/model` subpath; `logger/model`, for example, fails with ERR_PACKAGE_PATH_NOT_EXPORTED. Apart from this, the catalog's 33 modules match the 54-key 9.0.1 exports map.
  - **Fix:** Extend :18 with: "…and `@ariestools/sdk/model` aggregates all model types (`import type { ApiConfig, Hex, Promisable } from '@ariestools/sdk/model'`)." Optionally add a `/model` column that marks the 18 modules.
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:143-146; src/model.ts:1-19; xy.config.ts (`model: true` flags); `npm view @ariestools/sdk@9.0.1 exports`.
  - <sub>ids: skills/ariestools-sdk/modules.md#6, cov-sdk-umbrella#8</sub>

- ⚪ **The `assertEx` pattern needs the falsy-value and function-argument caveats** · `verified`
  - **Now:** modules.md:27 says "`assertEx`, `assertDefinedEx` — throw on invalid state", and :68 shows `assertEx(maybe, () => 'missing value')`.
  - **Actual:** `assertEx` throws on undefined, null, false, 0, '' and 0n (NaN passes). `assertDefinedEx` throws only on `undefined`. For both, the second argument must be a function that returns a message or an Error. Passing a string throws "Invalid assertEx usage: second argument must be a function or undefined".
  - **Fix:** Add after the Assert example: "Use `assertDefinedEx` when 0, '' or false are valid values. Always pass a function (`() => 'msg'` or `() => new MyError()`), never a string."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/assert/assertEx.ts:50,55-57; assert/assertDefinedEx.ts:51,56-58.
  - <sub>ids: skills/ariestools-sdk/modules.md#4</sub>

- ⚪ **The Forget section lacks the API and its timeout semantics** · `verified`
  - **Now:** modules.md:82-84 is prose only.
  - **Actual:** The call is `forget(promise, { name, timeout, onCancel, onComplete, onException })`. A rejection of the forgotten promise is caught, logged and reported through `onComplete([undefined, error])`. `onException` fires only for errors thrown while the forget is being set up. `timeout` (default 30 000 ms) only calls `onCancel`, and the work keeps running. `ForgetPromise.activeForgets` and `ForgetPromise.awaitInactive(interval, timeout)` let shutdown paths and tests drain pending forgets. Global defaults come from `globalThis.xy.forget.config`.
  - **Fix:** Add `import { forget, ForgetPromise } from '@ariestools/sdk/forget'; forget(sendMetrics(), { name: 'metrics', onComplete: ([, error]) => { if (error) logger.warn(error) } })` with four notes: use `onComplete`, not `onException`, to handle rejections; `timeout` does not cancel the work; run `await ForgetPromise.awaitInactive()` before process exit and in test teardown; defaults can be set globally through `globalThis.xy.forget.config`.
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/forget/: ForgetConfig.ts:5-22; forget.ts:6-10; ForgetPromise.ts:26,45,91-97,104-113,120-124; ForgetPromiseNode.ts:28-30.
  - <sub>ids: skills/ariestools-sdk/modules.md#10</sub>

## `skills/ariestools-sdk/overview.md`

### Update

- 🔴 **`zod` is called optional, but the root barrel and `/hex`, `/object` and `/zod` import it at load time; the checklist also calls OTel optional** · `verified`
  - **Now:** overview.md:40 says "`zod` | **Optional peer** — install only if you use zod helpers", :44-45 says "# Only if you use zod helpers", and :25 shows the root-barrel import with no caveat. modules.md:41 says "optional zod" for hex, :43 has no zod note for object, and :56 says "requires optional peer `zod`". conventions.md:58 says "Install optional peers (`zod`, OTel) only when used."
  - **Actual:** zod is declared an optional peer (`^4.6`), so pnpm does not install it. Yet the root barrel (node, browser and neutral builds) and `/hex`, `/object` and `/zod` import `zod/mini` or `zod/v4/core` at the top level. Without zod, `import … from '@ariestools/sdk'` fails with ERR_MODULE_NOT_FOUND, even if you only want `assertEx`. `/assert`, `/delay`, `/exists`, `/fetch` and `/telemetry` load without it. The code needs Zod 4 (^4.6). `@opentelemetry/api` is a **required** peer, as overview.md:41 already says, and the root barrel and `/telemetry*` fail without it. The deprecated `isType` is not published on `/object`; it lives in `/typeof`. Downstream, `@ariestools/pixel` imports `/object` at runtime without declaring zod, and `@ariestools/express` declares zod as a required peer.
  - **Fix:**
    - overview.md:40: "`zod` (^4.6, v4 only) — declared optional, but **required at runtime** for the root barrel and `/hex`, `/object`, `/zod` (and transitively for `@ariestools/pixel`). Omit it only if every import is a zod-free subpath (`/assert`, `/delay`, `/exists`, `/fetch`, …)."
    - overview.md:18-20 and :43-45: make the default install `pnpm add @ariestools/sdk zod@^4.6`.
    - overview.md:22-29: note that the root loads `zod` and `@opentelemetry/api`.
    - modules.md:41, :43 and :56: "requires peer `zod` ^4.6 (imported at load)". The object row should also say that `isType` lives in `/typeof`.
    - conventions.md:58: "`@opentelemetry/api` is a required peer of `@ariestools/sdk` and `@ariestools/telemetry`. Install `zod` whenever you import the root barrel or `/hex`, `/object`, `/zod`."
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:403-411; src/index.ts:21,23,36; src/modules/hex/hex/hex.ts:1, hex/address/address.ts:1, hex/hash/hash.ts:1, hex/ethAddress.ts:1, hex/zod.ts:1, object/JsonObject.ts:1, zod/zodAsFactory.ts:1; dist/neutral/index.mjs:988,3266 (same in dist/node and dist/browser); dist/neutral/hex.mjs:2; dist/neutral/object.mjs:186,189. A resolve-hook simulation on Node 26.9.0 with zod unresolvable: the root, hex, object and zod entries FAIL, while assert, fetch, delay and exists load. packages/pixel/src/XyUserEventHandler.ts:1; packages/express/package.json:77-79.
  - <sub>ids: skills/ariestools-sdk/overview.md#0, skills/ariestools-sdk/modules.md#0, cov-sdk-umbrella#0, cov-sdk-umbrella#1, cov-sdk-umbrella#2, skills/ariestools-sdk/conventions.md#0</sub>

- 🟠 **No correct `@xylabs/*` migration map, and npm deprecation notices point to frozen 8.x `@ariestools` packages and to deprecated paths** · `verified`
  - **Now:** SKILL.md:3 promises "migration from retired @xylabs/* names", and :20 routes that to overview.md. overview.md:55 and :58 say only "`@xylabs/*` utility shims…" and "Compatibility shims (if still published) are migration aids only". conventions.md:25 says "Migrate to `@ariestools/*`".
  - **Actual:** All `@xylabs` shims are published, npm-deprecated, and frozen at 8.0.2. Module shims map to umbrella subpaths: `@xylabs/assert` becomes `@ariestools/sdk/assert`, and `@ariestools/assert` does not exist (E404). Specialist shims (express, threads, pixel, eth-address, sdk-meta) map to the same-named `@ariestools/*` package. npm's deprecation messages are wrong in three groups of cases:
    - `@xylabs/telemetry` and `@xylabs/telemetry-exporter` point to `@ariestools/sdk/telemetry` and `/telemetry-exporter`, which are themselves deprecated.
    - `@xylabs/indexed-db`, `mongo`, `vitest-matchers`, `vitest-extended` and `jest-helpers` point to `@ariestools/indexed-db`, `mongo`, `vitest-matchers` and `vitest-extended`. Those were folded into storage-adapters and testing in 75e3ed8dd (2026-07-09), but they remain on npm at 8.0.3 without a deprecation flag. indexed-db and mongo pin `@ariestools/sdk ~8.0.3`, and vitest-extended pins `vitest ~4.1.10`.
    - `@xylabs/crypto` points to the npm-deprecated `@ariestools/crypto`.
  - **Fix:** Replace overview.md:51-58 with a migration table that overrides npm's text:

    | From | To |
    |---|---|
    | `@xylabs/sdk-js`, `@xylabs/sdk` | `@ariestools/sdk` (`/model` → `@ariestools/sdk/model`) |
    | `@xylabs/<module>` (assert, storage, delay, hex, fetch, …) | `@ariestools/sdk/<module>` |
    | `@xylabs/{express,threads,pixel,eth-address,sdk-meta}` | same name under `@ariestools` |
    | `@xylabs/telemetry`, `@xylabs/telemetry-exporter` | `@ariestools/telemetry` |
    | `@xylabs/indexed-db`, `@ariestools/indexed-db` | `@ariestools/storage-adapters/indexed-db` |
    | `@xylabs/mongo`, `@ariestools/mongo` | `@ariestools/storage-adapters/mongo` |
    | `@xylabs/vitest-matchers`, `@ariestools/vitest-matchers` | `@ariestools/testing/matchers` |
    | `@xylabs/vitest-extended`, `@ariestools/vitest-extended` | `@ariestools/testing/extended` |
    | `@xylabs/jest-helpers` | `@ariestools/testing` (`/extended`, `/matchers`) |
    | `@xylabs/crypto` | Web Crypto / `node:crypto` |
    | `@xylabs/buffer` | `node:buffer` / `Uint8Array` |

    Say that the shims are frozen at 8.0.2, drop "(if still published)", and state that npm's deprecation text is not authoritative where it disagrees with the table. Extend SKILL.md:10 to also rule out the frozen 8.x `@ariestools/{indexed-db,mongo,vitest-matchers,vitest-extended}` packages. Replace conventions.md:25 with a pointer to the table.
  - **Evidence:** `npm view @xylabs/{sdk-js,assert,telemetry,telemetry-exporter,indexed-db,mongo,vitest-extended,vitest-matchers,jest-helpers,crypto,express} deprecated`; `npm view @ariestools/{indexed-db,mongo,vitest-extended,vitest-matchers} version deprecated dependencies`; `npm view @ariestools/assert` → E404; ariestools/sdk-js commit 75e3ed8dd; packages/storage-adapters/package.json and packages/testing/package.json exports; packages/sdk/src/modules/telemetry/index.ts:1-5.
  - <sub>ids: skills/ariestools-sdk/overview.md#2, skills/ariestools-sdk/SKILL.md#1, skills/ariestools-sdk/overview.md#3, skills/ariestools-sdk/conventions.md#1, skills/ariestools-sdk/conventions.md#7, cov-sdk-specialist#11 · severity: conventions.md#1 proposed high, but the verifiers rated the migration gap medium</sub>

- ⚪ **"Telemetry and storage interfaces": the telemetry re-exports are deprecated runtime APIs, not interfaces** · `verified`
  - **Now:** overview.md:74: "The umbrella still re-exports some telemetry and storage **interfaces**"
  - **Actual:** Storage is interface-only (`KeyValueStore`, `ReadonlyKeyValueStore`). Telemetry is runtime code: `span*`, `timeBudget`, `cloneContextWithoutSpan`, `createXyConsoleSpanExporter`, `spanDurationInMillis` and `XyConsoleSpanExporter`, re-exported through the root barrel, `/telemetry` and `/telemetry-exporter`. All of it is `@deprecated` and slated for removal from the main barrel. It loads `@opentelemetry/api`, which is why that peer is required.
  - **Fix:** Change :74 to: "The umbrella re-exports storage **interfaces** (`@ariestools/sdk/storage`) and **deprecated** telemetry runtime helpers (`span*`, `timeBudget`, `XyConsoleSpanExporter`, … via the root barrel, `/telemetry`, `/telemetry-exporter`), scheduled for removal in a future major." Append to :41: "`@opentelemetry/api` is loaded only via the root barrel and the telemetry subpaths."
  - **Evidence:** ariestools/sdk-js/packages/sdk/src/modules/telemetry/index.ts:1-17, telemetry-exporter/index.ts:1-12, storage/KeyValueStore.ts; packages/sdk/README.md:235-238. A simulation with `@opentelemetry/api` blocked: the root and telemetry subpaths FAIL, and all other subpaths load.
  - <sub>ids: skills/ariestools-sdk/overview.md#4</sub>

- ⚪ **The dependency table omits `@ariestools/telemetry`, a direct dependency of the umbrella** · `verified`
  - **Now:** overview.md:37-41 lists `async-mutex` as the only direct dependency.
  - **Actual:** `@ariestools/sdk` 9.0.1 depends on `async-mutex ~0.5.0` and `@ariestools/telemetry ~9.0.1`, and 8.3.0 already had the telemetry dependency. Its peers are `zod ^4.6` (optional) and `@opentelemetry/api ^1.9` (required).
  - **Fix:** Add a row: "`@ariestools/telemetry` | Direct dependency of `@ariestools/sdk` (backs the deprecated telemetry re-exports); declare it yourself if you import it directly (deplint)." Write the zod peer as "^4.6 (Zod 4)".
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:385-388, :403-411; `npm view @ariestools/sdk@9.0.1 dependencies peerDependencies peerDependenciesMeta`.
  - <sub>ids: skills/ariestools-sdk/overview.md#5, cov-sdk-specialist#16</sub>

### Add

- 🟠 **No runtime baseline: sdk-js 9.x requires Node >= 26, while Layer 2 states Node 22** · `verified`
  - **Now:** absent. No file in the skill names the sdk-js major or an engines floor, and the packages.md:7-20 chooser has no runtime column. xy-toolchain/toolchain.md:41 and :115 say "Node.js 22 or newer".
  - **Actual:** 9.0.0 (70c8e1942 "Node 26", published 2026-09-16) raised `engines.node` from `>=18.17.1` to `>=26` in every published sdk-js package, and 9.0.1 is current. `@ariestools/sdk` also sets `engineStrict`, but consumer package managers generally do not enforce that field for dependencies. The toolchain and config packages declare `>=22`, so adding `@ariestools/sdk` raises a repo's floor. `@ariestools/testing` 9.x depends on `vitest ~5.0.1` (Vitest 5 since 8.3.0). crypto-auth uses native `Uint8Array.prototype.toBase64` / `Uint8Array.fromBase64`. Some packages are platform-limited: express is Node-only, pixel is browser-only, threads resolves only under the `browser`/`node` conditions, and in storage-adapters `/indexed-db` needs IndexedDB while `/mongo` needs Node. The umbrella README still says "(18.17.1+)".
  - **Fix:**
    - After SKILL.md:12: "Describes sdk-js 9.x: all packages declare `engines.node >=26`; `@ariestools/testing` requires Vitest 5. Consumers on Node < 26 stay on 8.x."
    - overview.md (Default choice or Versioning): add a "Runtime baseline" block that repeats this and adds "ESM only; Zod 4.6+ where zod is loaded; ignore the README's 18.17.1+ line". Do not imply that installs hard-fail.
    - conventions.md:11-13 (ESM only): add one line with the same floor.
    - packages.md quick chooser: add a Runtime column (Node / Browser / Both).
    - xy-toolchain/toolchain.md:115: add a cross-reference ("adding `@ariestools/sdk` raises the floor to Node 26").
  - **Evidence:** ariestools/sdk-js/packages/sdk/package.json:412-415; the engines field of every packages/*/package.json except the private threads-test; `npm view @ariestools/sdk@8.3.0 engines` → `>=18.17.1` and `@9.0.0` → `>=26`; `git show 70c8e1942 -- packages/sdk/package.json`; `npm view @ariestools/testing@9.0.1 dependencies`; packages/crypto-auth/src/base64.ts:1-14; packages/pixel/src/Pixel.ts:18,59,97,119-120; packages/sdk/README.md:197-198; ariestools/toolchain/packages/{toolchain,eslint-config-flat,tsconfig,vitest-config,lib-neutral}/package.json engines.
  - <sub>ids: skills/ariestools-sdk/overview.md#1, skills/ariestools-sdk/SKILL.md#2, cov-sdk-umbrella#7, cov-sdk-specialist#5, skills/ariestools-sdk/conventions.md#8, arch-layering#10, skills/ariestools-sdk/packages.md#6</sub>

## `skills/ariestools-sdk/packages.md`

### Remove

- 🟠 **`@ariestools/threads-test` is private and unpublished, not a companion test package** · `unverified`
  - **Now:** packages.md:57: "`@ariestools/threads-test` is a companion package for tests, not a production dependency of apps."
  - **Actual:** The package is `"private": true`, `npm view` returns E404, and its src is just `export {}`. Its test suite was deleted in d4dadd220 (2026-09-05), and the threads tests now live in packages/threads/src/spec. An agent that adds it as a devDependency gets a 404.
  - **Fix:** Delete the sentence. Optionally replace it with: "There is no published test companion; test workers with your own Vitest node specs."
  - **Evidence:** ariestools/sdk-js/packages/threads-test/package.json:4, src/index.ts; `npm view @ariestools/threads-test version` → E404; `git show d4dadd220 --stat`; packages/threads/src/spec/node/pool.spec.ts.
  - <sub>ids: skills/ariestools-sdk/packages.md#3, cov-sdk-umbrella#13, cov-sdk-specialist#10</sub>

### Update

- 🔴 **storage-adapters: the root barrel imports both optional peers (`idb`, `mongodb`), and the install line installs neither** · `unverified`
  - **Now:** packages.md:38 lists "`@ariestools/storage-adapters` | Root barrel" as a normal entry point, :41 lists "`*/model`", and :44 says `pnpm add @ariestools/storage-adapters`.
  - **Actual:** `idb ^8.0` and `mongodb ^7.6` are optional peers, and pnpm does not install optional peers automatically. The root `dist/neutral/index.mjs` statically imports `openDB` from "idb" and `MongoClient` from "mongodb". Importing the root, or importing a backend subpath without its peer, therefore fails with module-not-found, and the root pulls `mongodb` into browser bundles. `/indexed-db` and `/mongo` each import only their own backend, and the Mongo code is Node-only. The exports are exactly `.`, `./indexed-db`, `./indexed-db/model`, `./mongo` and `./mongo/model`; there is no root `./model`. The main APIs are `IndexedDbKeyValueStore`, `withDb`/`withStore`/`withReadOnlyStore`/`withReadWriteStore`, `BaseMongoSdk`, `MongoClientWrapper` and `BaseMongoSdkConfig`.
  - **Fix:** Replace the root row with a warning to import a backend subpath instead. List the four exact subpaths instead of `*/model`. Use backend-specific install lines: `pnpm add @ariestools/storage-adapters idb` for the browser and IndexedDB, or `pnpm add @ariestools/storage-adapters mongodb` for Node and Mongo. Name the main classes, and mark `/mongo` as Node-only.
  - **Evidence:** ariestools/sdk-js/packages/storage-adapters/package.json:89-99; dist/neutral/index.mjs:5,271; dist/neutral/indexed-db.mjs:5; dist/neutral/mongo.mjs:5; src/index.ts; src/modules/mongo/Base.ts:1,23; `npm view @ariestools/storage-adapters@9.0.1 exports peerDependenciesMeta`.
  - <sub>ids: skills/ariestools-sdk/packages.md#1, cov-sdk-specialist#1</sub>

- 🟠 **eth-address: the skill names a nonexistent `EthAddress` export and steers away from the umbrella's EthAddress API, and the modules.md Hex section is a placeholder** · `verified`
  - **Now:** packages.md:95 says "Focused Ethereum address helpers (`EthAddress`, padding, ellipsize)… use this package when you want the dedicated address API", and the :16 chooser row says "ETH address helpers". modules.md:89 has `import { /* hex helpers */ } from '@ariestools/sdk/hex'`, and modules.md:92 says "For a focused ETH address package, `@ariestools/eth-address` remains available".
  - **Actual:** `@ariestools/eth-address` 9.0.1 exports only `EthAddressWrapper` (bigint-backed, with an EIP-55 checksum via ethers `getAddress`), `isEthAddressWrapper`, `padHex` and a deprecated `ellipsize`. It depends on `ethers ~6.17.0`, which makes it the heavier choice, though it needs no zod. The branded `EthAddress` type and `toEthAddress`, `isEthAddress`, `asEthAddress`, `EthAddressZod`, `EthAddressRegEx` and `ETH_ZERO_ADDRESS` live in `@ariestools/sdk/hex`. That module also has `toHex`/`isHex`/`asHex`, `hexToBigInt`, `Hash`/`isHash`/`asHash`/`HashZod` and `Address`/`toAddress`/`isAddress`/`asAddress`, and it requires zod.
  - **Fix:**
    - packages.md:93-95: "For the branded `EthAddress` type, validation and zod schemas use `@ariestools/sdk/hex` (`toEthAddress`, `isEthAddress`, `asEthAddress`, `ETH_ZERO_ADDRESS`, `EthAddressZod`; requires `zod`). Use `@ariestools/eth-address` only for `EthAddressWrapper` (bigint parse/compare, EIP-55 checksum via `ethers`) or `padHex`; it adds `ethers`. Import `ellipsize` from `@ariestools/sdk/ellipsize`."
    - packages.md:16: split the chooser row the same way and add `pnpm add @ariestools/eth-address`.
    - modules.md:89: use `import { toHex, isHex, hexToBigInt, isHash, toAddress, toEthAddress, isEthAddress } from '@ariestools/sdk/hex'` (peer `zod` ^4.6).
    - modules.md:92: reword to prefer the umbrella.
  - **Evidence:** ariestools/sdk-js/packages/eth-address/src/index.ts:1-3, src/EthAddress.ts:3,8,11, src/ellipsize.ts:1-4, package.json:46-48, dist/neutral/index.mjs:86-91; packages/sdk/src/modules/hex/index.ts:1-7, hex/ethAddress.ts:14-78; `npm view @ariestools/eth-address@9.0.1 dependencies`.
  - <sub>ids: skills/ariestools-sdk/modules.md#8, skills/ariestools-sdk/packages.md#0, cov-sdk-specialist#0 · status/severity: the two verifiers covered only the modules.md half and rated it low. The packages.md:95 export-name error has been checked by auditors only. Two auditors rated it high; it is set to medium here because it surfaces as a compile error.</sub>

- 🟠 **express: peers and dependencies are described backwards, and the required `zod` peer, the Node-only export, the main API and 5xx masking are missing** · `unverified`
  - **Now:** packages.md:24 says "Base helpers for Express APIs (handlers, middleware, HTTP utilities, logging integration)", :27 says `pnpm add @ariestools/express`, and :30 says "install `@ariestools/sdk` as required by the package's peers/deps."
  - **Actual:** `@ariestools/sdk` is a regular dependency, not a peer. The required (non-optional) peers are `zod ^4.6`, because `requestHandlerValidator` imports `zod/mini`, and `winston-transport ^4.9`. The exports map has only a `node` condition, so the package does not resolve for browser or neutral targets. `express` is neither a dependency nor a peer: the package types against `express-serve-static-core` 5.x and uses body-parser 2.x, so the app brings Express 5. Main exports include `asyncHandler`, `errorToJsonHandler`, `requestHandlerValidator`, `addRouteDefinitions`/`RouteDefinition`, `jsonBodyParser`, `standardResponses`/`standardErrors`, `customPoweredByHeader`, `disableCaseSensitiveRouting`, `responseProfiler`/`useRequestCounters`, `getLogger`/`getDefaultLogger` (winston, plus Rollbar via `ROLLBAR_ACCESS_TOKEN`) and `StatusCodes`/`ReasonPhrases`. Since d4dadd220 (2026-09-05), `errorToJsonHandler` returns `{ error: 'Internal Server Error' }` for every status >= 500.
  - **Fix:** Change the install line to `pnpm add @ariestools/express zod winston-transport`, plus the app's own `express@5`. Replace :30 with: "`@ariestools/sdk` comes in as a regular dependency (declare it only if you import it directly); peers `zod` ^4.6 and `winston-transport` ^4.9; Node-only (`node` export condition); bring your own Express 5." Add a short export list and one line on the 5xx body masking, so that tests and clients do not expect internal error messages.
  - **Evidence:** ariestools/sdk-js/packages/express/package.json:32-38, :52-58, :77-79; src/Validation/requestHandlerValidator.ts:6; src/Handler/errorToJsonHandler.ts:21-23; src/Logger/Transports/Rollbar/getDefaultRollbarTransport.ts; `npm view @ariestools/express@9.0.1 peerDependencies dependencies`; commit d4dadd220.
  - <sub>ids: skills/ariestools-sdk/packages.md#2, cov-sdk-specialist#7, skills/ariestools-sdk/packages.md#8</sub>

- 🟠 **testing: `/extended` is a side-effect matcher registration, two type subpaths are missing, and Vitest 5 is a hard dependency** · `unverified`
  - **Now:** packages.md:65-67 lists the root, "`/matchers` Custom matchers" and "`/extended` Extended utilities". :73 says "Wire matchers in Vitest setup files per the consuming repo." conventions.md:51 says "Add `@ariestools/testing` when you need shared matchers or extended helpers."
  - **Actual:** `/extended` calls `expect.extend(matchers)` and augments Vitest 5's `Assertion<R, T>` / `AsymmetricMatchersContaining` types with jest-extended-style matchers (`toBeArray`, `toBeArrayOfSize`, `toBeTrue`, `toContainKey`, `toInclude`, `toBeValidDate`, …). It is listed in `sideEffects` and is used as `import '@ariestools/testing/extended'`. The root re-exports it, so importing the root also registers the matchers. `/matchers` exports the raw `matchers` object. `./model` and `./matchers/model` are types-only subpaths that are missing from the table. `vitest ~5.0.1` is a direct dependency (moved to peers in 0f638cae2, then back in 4448bc03b). A consumer on another Vitest major gets a second copy of Vitest, and `expect.extend` then targets the wrong `expect`.
  - **Fix:** Rewrite the table:
    - `/extended`: side-effect import that registers the matchers and their types; add it to `setupFiles` or import it at the top of a spec.
    - `/matchers`: the `matchers` object, for a manual `expect.extend`.
    - `/model` and `/matchers/model`: types only.
    - Note that importing the root also registers the matchers.

    State that 9.x requires Vitest 5, matching `@ariestools/vitest-config`'s `vitest ^5.0` peer, and that the package belongs in devDependencies. Mirror one line in conventions.md:51.
  - **Evidence:** ariestools/sdk-js/packages/testing/src/modules/extended/index.ts:1-15; src/index.ts; package.json:27-34 (`sideEffects`), :41-64 (exports), :76-77 (`vitest ~5.0.1`); dist/neutral/index.mjs:372; packages/express/src/spec/node/getLogger.spec.ts:1; `npm view @ariestools/testing@9.0.1 dependencies`.
  - <sub>ids: skills/ariestools-sdk/packages.md#4, cov-sdk-specialist#6, skills/ariestools-sdk/conventions.md#12</sub>

- ⚪ **sdk-meta is described as document meta management, but it rewrites HTML strings with cheerio** · `unverified`
  - **Now:** packages.md:111: "HTML meta helpers for sites that inject or manage document meta tags." There is no install line.
  - **Actual:** The package works on HTML strings through `cheerio ~1.2.0`, not on the live DOM. It exports `metaBuilder(html, meta, handler?)`, `addMetaToHead($, name, value)`, `mergeDocumentHead(destination, source)` and `getMetaAsDict`, and the types `Meta`, `OpenGraphMeta` and `TwitterMeta` (plus structured, app and player variants). It is meant for SSR or edge injection of OpenGraph and Twitter tags. It has a single `.` export, and its source directory is packages/meta.
  - **Fix:** "Server/edge helpers that inject OpenGraph/Twitter meta into HTML strings via cheerio: `metaBuilder`, `mergeDocumentHead`, `Meta` types." Add `pnpm add @ariestools/sdk-meta`.
  - **Evidence:** ariestools/sdk-js/packages/meta/package.json (name, `cheerio ~1.2.0`, exports); src/meta/builder.ts:1-3,16,45-65; src/html/mergeDocumentHead.ts:14; src/models/Meta.ts; src/index.ts:1-4.
  - <sub>ids: skills/ariestools-sdk/packages.md#7, cov-sdk-specialist#14</sub>

### Add

- 🟠 **threads: no subpaths, export conditions, peer or API names are documented** · `unverified`
  - **Now:** packages.md:51 says "Run work in worker threads or web workers with a function-call style API.", followed by `pnpm add @ariestools/threads`.
  - **Actual:** The package exports these subpaths:
    - `.`, `./master`, `./implementation`, `./pool` and `./worker`: `browser`/`node` conditions only, with no default.
    - `./register`: a Node-only side-effect import that installs `globalThis.Worker`.
    - `./spawn`, `./thread`, `./observable` and `./observable-promise`: neutral.
    - `./messenger`: types only.

    The peer is `observable-fns ^0.6`. On the main thread it provides `spawn`, `Pool`, `Worker`, `BlobWorker`, `Thread`, `Transfer`, `registerSerializer` and `DefaultSerializer`, plus the Node-only `installWorkerSignalHandlers`, `uninstallWorkerSignalHandlers` and `isWorkerRuntime`. Inside a worker, `expose` (plus `Transfer` and `registerSerializer`) comes from `/worker`. The package README says it is public-only, with no consumers inside the monorepo.
  - **Fix:** Add a short subpath table and an example. Worker file: `import { expose } from '@ariestools/threads/worker'`. Main thread: `import { spawn, Thread, Pool, Worker } from '@ariestools/threads'`, with `await Thread.terminate(worker)` and `Transfer()` for ArrayBuffers. Change the install line to `pnpm add @ariestools/threads observable-fns`. Warn that resolution needs a `browser` or `node` condition and that `/register` is Node-only.
  - **Evidence:** ariestools/sdk-js/packages/threads/package.json:29-104, :112-114, :129-131; src/index-node.ts, src/index-browser.ts, src/master/index-node.ts, src/master/register.ts:7-11, src/worker/worker.node.ts:53-73; README.md:10-12.
  - <sub>ids: skills/ariestools-sdk/packages.md#5, cov-sdk-specialist#9</sub>

- ⚪ **crypto-auth: the main API, the create/open key pairing and PBKDF2 versioning are undocumented** · `verified`
  - **Now:** packages.md:85: "Self-contained password and seed-phrase encryption/decryption (vault-style crypto)."
  - **Actual:** The app injects the storage and crypto backend: `SeedPhraseVault(store: SeedPhraseStore, walletKind?, crypto: VaultCrypto = defaultVaultCrypto)`. Its methods include `addSelfDescribingPhrase`, `openSeedPhrase`, `verifyPasswordForRecord`, `upgradeRecordKdf` and the static `recordNeedsRehash`. The package also exports:
    - `SeedPhraseDecryptError`, `PasswordKey` and `Pbkdf2AesGcmVaultCrypto`
    - `deriveKeyFromPassword`, `deriveKeyFromValues`, `deriveKeyAndValues`, `verifyPassword` and `needsRehash`
    - the deprecated `encryptSeedPhrase`/`decryptSeedPhrase`
    - `bytesToBase64`/`base64ToBytes`

    New keys use 600 000 PBKDF2 iterations, and records without stored metadata are read at the legacy 100 000. Base64 uses native `Uint8Array` base64, which needs Node >= 26 or a current browser.
  - **Fix:** Add two or three lines covering:
    - The app injects a `SeedPhraseStore`, and optionally a `VaultCrypto` (default `Pbkdf2AesGcmVaultCrypto`).
    - Create a vault with `deriveKeyAndValues`. Open one with `deriveKeyFromValues`, which reads the salt and iteration count from the stored record. Never open an existing vault with `deriveKeyFromPassword`'s defaults.
    - After a successful unlock, upgrade legacy records with `needsRehash` / `SeedPhraseVault.recordNeedsRehash` and `upgradeRecordKdf`.
    - Never persist or log derived keys.
  - **Evidence:** ariestools/sdk-js/packages/crypto-auth/src/index.ts:1-7; SeedPhraseVault.ts:17,31-42,52,205; password.ts:16,28,38,53,67; models/KeyMetadata.ts:12,20; Pbkdf2AesGcmVaultCrypto.ts:22,76; models/SeedPhraseStore.ts:8; base64.ts:1-14.
  - <sub>ids: skills/ariestools-sdk/packages.md#12, cov-sdk-specialist#8 · severity: cov-sdk-specialist#8 proposed medium, but the verifiers rated it low</sub>

- ⚪ **json-rpc-engine: the `/v2` drop-in subpath and the omitted v1 and legacy API are not mentioned** · `verified`
  - **Now:** packages.md:99: "Browser-safe re-export of MetaMask's JSON-RPC engine v2 public surface (tree-shakes legacy middleware paths)."
  - **Actual:** `.` and `./v2` are identical and act as a drop-in for `@metamask/json-rpc-engine/v2`. `asLegacyMiddleware` and the v1 API (`JsonRpcEngine`, `createAsyncMiddleware`) are intentionally not exported, so v1 users on Node keep MetaMask's package. 9.0.0 moved the dependency to `@metamask/json-rpc-engine ~11.0.0`.
  - **Fix:** Add: "Drop-in for `@metamask/json-rpc-engine/v2` (also available as `@ariestools/json-rpc-engine/v2`). `asLegacyMiddleware` and the v1 engine are not exported."
  - **Evidence:** ariestools/sdk-js/packages/json-rpc-engine/package.json:38-41; src/index.ts:1-10; README.md:52-56; `npm view @ariestools/json-rpc-engine@9.0.1 exports`.
  - <sub>ids: skills/ariestools-sdk/packages.md#13, cov-sdk-specialist#15</sub>

- ⚪ **pixel: no entry point, browser-only warning, `./model` subpath or install line** · `unverified`
  - **Now:** packages.md:107: "Event client for funnel / purchase style analytics fields used with the XY Labs event pipeline."
  - **Actual:** The package is compiled only to dist/browser and touches `localStorage`, `document.cookie` and `document.location`. It is a singleton: call `XyPixel.init(pixelId)`, then use `XyPixel.instance`. `XyPixel.selectApi(new PixelApi('beta' | 'local' | url))` switches the endpoint, which defaults to https://pixel.xylabs.com/t/event/queue. It also exports `XyUserEventHandler`/`UserEventHandler`, and the field types (`PurchaseFields`, `FunnelStartedFields`, `ViewContentFields`, `UserClickFields`, `UtmFields`, …) are in `./model`. It depends on `async-mutex` and `@ariestools/sdk`.
  - **Fix:** Add `pnpm add @ariestools/pixel`, the `XyPixel.init(pixelId)` / `XyPixel.instance` entry point, "browser-only — do not import in Node/SSR paths", and `@ariestools/pixel/model` for the field types.
  - **Evidence:** ariestools/sdk-js/packages/pixel/package.json:26-33; src/Pixel.ts:31-80,97,119-120; src/Api/Api.ts:6-20; src/XyUserEventHandler.ts:12; src/model.ts.
  - <sub>ids: skills/ariestools-sdk/packages.md#9, cov-sdk-specialist#13</sub>

## Outside this skill

No finding targets a file outside `skills/ariestools-sdk/`. The recommendations above also name these upstream follow-ups, which are not counted in the totals:

- ariestools/sdk-js/packages/sdk/README.md:234 repeats the "zod is optional" claim. <sub>skills/ariestools-sdk/overview.md#0, skills/ariestools-sdk/modules.md#0, cov-sdk-umbrella#0</sub>
- ariestools/sdk-js/packages/sdk/README.md:197-198 still prints the "18.17.1+" Node baseline. <sub>skills/ariestools-sdk/overview.md#1, cov-sdk-umbrella#7, skills/ariestools-sdk/fetch.md#3</sub>
- ariestools/sdk-js/packages/sdk/README.md:221-228 still describes `sdkModules` and the deleted `scripts/sync-sdk-layout.mjs`. <sub>skills/ariestools-sdk/modules.md#11, skills/ariestools-sdk/conventions.md#10, cov-sdk-specialist#17</sub>
- `@ariestools/pixel` imports `@ariestools/sdk/object` at runtime but does not declare `zod`. <sub>skills/ariestools-sdk/overview.md#0</sub>
- `@ariestools/{mongo,indexed-db,vitest-extended,vitest-matchers}` 8.0.3 should be npm-deprecated, and ariestools/sdk-js/CLAUDE.md:57,61 still lists them as active. <sub>skills/ariestools-sdk/overview.md#3, cov-sdk-specialist#11</sub>
- skills/xy-toolchain/toolchain.md:115 should note that adding `@ariestools/sdk` raises the floor to Node 26. <sub>arch-layering#10</sub>

## Refuted during verification

None. No finding in this group was refuted. 36 of the 99 raw findings reached both verifier lenses before the run was paused.
