# Light Paper: the Public Summary

The Light Paper is the short, plain-language form of the series, for people who will never read the full papers: prospective users, partners, investors. It is optional, and written after the Green Paper (and after the Red Paper, when there is one). It is the only paper that ships as a PDF.

**Derived from:** every paper it summarizes.

## Rules

- **No new claims.** Every statement traces to a paper. If the Light Paper needs to say something no paper says, amend the paper first ([The change cascade](papers.md#the-change-cascade)).
- **The full papers govern.** Say so in the paper itself: on any detail, the full papers win.
- **Short.** About 800 to 1,100 words, two pages as a PDF.
- **Plain language.** No requirement keywords, no schemas. Second person is fine.
- **No risk register.** It may say what the product will never do; it does not summarize the Red Paper.
- **No status that dates quickly.** "Where it stands" stays at the level of the roadmap stage, and is re-checked every time the paper is regenerated.

## Outline

1. The idea in one sentence, as the subtitle.
2. Why it is needed.
3. How it works, without mechanism detail.
4. What it will always do and never claim, from the White Paper's commitments.
5. The business in a paragraph, from the Green Paper.
6. Where the project stands.
7. Links to the full papers, and the statement that they govern.

## The PDF

`papers/<PRODUCT>_LIGHT_PAPER.pdf` is generated from the Markdown, never edited on its own.

- Regenerate it whenever the Light Paper's version changes, in the same commit. A PDF older than its Markdown is the commonest way this paper misleads.
- Record the command that generates it, in `papers/README.md` or the repository's `AGENTS.md`, so the next author produces the same output.
- Do not generate PDFs of the other papers into `papers/`. Export them on demand, outside the repository.
