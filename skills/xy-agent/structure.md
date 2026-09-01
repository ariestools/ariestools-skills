# Repository Structure

## The canonical tree

```text
AGENTS.md              one entry point · hand-written · ≤200 lines
CLAUDE.md              @AGENTS.md import — required, not optional
README.md              humans: what it is, install, commands. NOT policy.

papers/                durable concept / protocol / business baseline
specs/                 optional: normative, implementation-binding specs + ledgers

docs/
  README.md            GENERATED index — never hand-edited
  decisions/           <PREFIX>-D0001-kebab-title.md
  runbooks/            live operational procedure
  plans/               forward-looking, expected to be superseded
  evidence/            YYYY-MM-DD-slug.md — dated, immutable
  archive/             retired documents, moved not deleted

references/            immutable historical inputs — never edited
prototypes/            immutable source snapshots — never edited

packages/<pkg>/AGENTS.md   delta only, where a package genuinely differs
.claude/rules/*.md         path-scoped instructions (paths: frontmatter)
.xy/work/items/            tracked work items (xy work)
```

Not every repository needs every tier. A single-package library may have `AGENTS.md`, `README.md`, and `docs/decisions/` and nothing else. Add a tier when it has real content, never as a placeholder — an empty `papers/` directory is a lie about the repository's maturity.

## Which tier a document belongs to

Ask two questions in order: **is this normative, and is it time-bound?**

| The document… | Goes in | Changes by |
|---|---|---|
| States what must be true, conceptually | `papers/` | Versioned amendment |
| Binds an implementation to exact requirements | `specs/` | Versioned amendment |
| Records a choice made once, with its rationale | `docs/decisions/` | A new decision that supersedes it |
| Describes how to perform an operation | `docs/runbooks/` | Edit in place; bump `reviewed` |
| Describes work not yet done | `docs/plans/` | Edit, then supersede |
| Records what passed, once, under a named commit | `docs/evidence/` | Never — write a new one |
| Hands an effort to the next session | `docs/` root | Edit while the effort is live; archive after |
| Is an input this project did not author | `references/`, `prototypes/` | Never |

If a document does not fit any row, it is usually two documents.

## papers/ versus specs/ versus docs/

**`papers/`** answers *what is this and why*. Long-lived, changes slowly, survives implementation churn. The house convention is `<PRODUCT>_{WHITE,YELLOW,GREEN,LIGHT}_PAPER.md`:

- **White** — the concept, the problem, why the thing should exist.
- **Yellow** — mechanism: protocol, state machine, arithmetic, evidence model, conformance gates.
- **Green** — business model, sustainability, commercial boundary.
- **Light** — optional; the short public form. Ship a PDF of this one only.

A paper changes by **amendment**, not by silent edit: bump the version, state what changed, and keep cross-references to companion papers current. When a change is still under discussion, draft it as a separate document in `docs/` and adopt it into the paper only when settled.

**`specs/`** answers *exactly what must this build do*. Normative, implementation-binding, and often paired with a machine-readable ledger (a JSON file classifying every requirement against every released surface). Use this tier only when a repository genuinely has requirements too concrete for a paper and too binding for a plan.

**`docs/`** answers *what has been proven, what is planned, and how to operate it*. Everything here is time-bound. That is why it subdivides by lifecycle.

## Why lifecycle folders, not topic folders

A topic folder (`docs/auth/`, `docs/deployment/`) never tells you when something can be deleted. A lifecycle folder does:

- `evidence/` is append-only. Nothing in it is ever edited, so nothing in it can go stale — it was true at a named commit and still is.
- `plans/` is expected to be superseded. Finding a stale plan there is normal, not a defect.
- `runbooks/` must be current or it is dangerous. It carries a `reviewed` date for exactly that reason.
- `decisions/` is immutable once accepted; a decision is revisited by writing a new one.
- `archive/` is where things go instead of being deleted.

The folder is the first thing an agent reads about a document. Make it carry information.

## Immutable inputs

`references/` and `prototypes/` hold material this project did not author: original concept artifacts, executable prototypes, incoming PDFs, vendor specifications. They are historical evidence of what was received, and their value depends entirely on being unmodified.

- Never edit a file in these directories, including to fix a typo, repair metadata, or update a stale claim.
- Never treat a prototype as a conforming implementation or a neutral research stimulus. If it is being used as a source, write an audit document in `docs/` that says what it is and is not.
- Record content addresses (SHA-256) where provenance matters, and classify by path and hash rather than by what the document's own cover page claims about itself.

## Generated paths

Anything emitted by a generator is off-limits to hand editing — change the source and regenerate. Common cases: a generated deployment config, an emitted binding, a TypeDoc dump, and — under this convention — `docs/README.md`.

State the generator command next to the rule. "Never hand-edit" without "run this instead" is an instruction an agent cannot follow.

## Where docs/ is not called docs/

Repositories in this workspace use `docs/`, `documents/`, and `tech-doc/`, and some use `docs/` for a gitignored TypeDoc dump while hand-written prose lives in `documents/`. When adopting this pattern, detect the existing directory rather than creating a second one, and if the generated-API dump owns `docs/`, keep prose in the other directory and apply every convention here to it unchanged. Two documentation roots in one repository is the failure mode to avoid.
