# Epic — Demo-Artifact Anchoring Sweep Across the Docs Site

**Status:** complete (2026-07-22) · **Owner:** TPM · **Repo in scope:** `palonexus-web` (this repo)
**Created:** 2026-07-22 · **Tracking:** markdown-only in `docs/requirements/` — no Linear (free-tier limit)

## 1. Epic summary

Remove demo-artifact anchoring from the docs site's structure and vocabulary,
per the editorial rule (verified against Ory docs): **examples serve the
concept — structure never serves the example.** Three parallel editor batches
(1–3), followed by a single QA gate and TPM close-out. Changes stay
**uncommitted** for user review — no commits, no pushes.

**The two directives (apply both to every file in scope):**

1. **`INC-4821` is an example value, not a structural anchor.** The sample
   incident id must not appear in page titles, headings, sidebar labels, card
   descriptions, or link texts. It is allowed **only inside code blocks,
   payloads, and command output** as a `task_id` value, and the surrounding
   prose introduces it generically ("a sample incident id", "the seeded
   incident") — never as if the reader's incident is INC-4821.
2. **"hero flow" is an internal codename, not prose vocabulary.** Replace it in
   prose with the functional name **"the end-to-end governed flow"**, expandable
   on first use per page as "register → deny → approve → succeed". The public
   SDK symbol `run_hero_flow` stays referenced in code style (backticks / code
   blocks) as an API fact — the codename ban applies to prose, headings, and
   labels, not to the shipped symbol name.

**Verified ground truth (2026-07-22, do not re-verify):**

- 17 files contain `INC-4821`, including the `astro.config.mjs` sidebar label
  `'Temporary elevation (INC-4821)'` and the title of
  `src/content/docs/develop/guides/temporary-elevation-walkthrough.md`.
- 11 docs files use "hero" as prose vocabulary.
- `src/content/docs/sdk/reference.md` is **auto-generated** from platform-repo
  docstrings. It gets flagged, not hand-edited (fixes belong in the platform repo).
- `tests/e2e-root/root.spec.ts` uses "hero" for the **landing hero section** —
  a standard web-design term, unrelated to the codename. Out of scope.
- `src/content/docs/reference/changelog.md` entries are historical record —
  they keep their facts; only anchoring language is reworded.
- Three parallel editor batches are already running (1–3, mapped below).

## 2. Guardrails (apply to every issue)

- **Structure vs. example.** Directive 1 targets structural surfaces: titles,
  headings, sidebar labels (`astro.config.mjs`), card descriptions, link texts,
  and frontmatter titles/descriptions. `INC-4821` survives only as a `task_id`
  value inside code fences, payloads, and captured output, introduced
  generically in the nearest prose.
- **Codename vs. API symbol.** Directive 2 bans "hero flow" (and bare "hero"
  as flow shorthand) from prose, headings, and labels. `run_hero_flow` in
  backticks or code blocks is an API fact and stays — do not paraphrase or
  hide the symbol where the reader must call it.
- **First-use expansion.** The first prose mention of the flow on a page reads
  "the end-to-end governed flow (register → deny → approve → succeed)";
  subsequent mentions may shorten to "the end-to-end governed flow" or "the
  governed flow".
- **No meaning drift.** Rewrites preserve technical accuracy — endpoints, env
  vars, step sequences, and security claims are untouched; only the anchoring
  vocabulary changes.
- **`sdk/reference.md` is read-only in this epic.** Editors flag violations in
  §5 and move on; the fix is a platform-repo docstring backlog item.
- **Link and anchor lockstep.** Retitling the walkthrough page and relabeling
  the sidebar changes inbound link texts and possibly heading anchors — every
  editor updates cross-references to renamed headings/labels within its batch,
  and Batch 1 (which owns the title/label change) publishes the final wording
  the other batches link against.
- **Test lockstep.** Any copy asserted by `tests/e2e/docs.spec.ts` that changes
  in a batch gets its assertion updated in the same batch — the QA gate must
  not discover drift. `tests/e2e-root/root.spec.ts` "hero" references are the
  landing hero section and are not touched.
- **Nothing gets committed.** All edits (docs + config + tests) remain
  uncommitted in the working tree for user review. Pre-existing unrelated WIP
  in the tree is left untouched.
- **Batch boundaries are hard.** Each editor touches only its batch's files
  (plus `tests/e2e/docs.spec.ts` lines tied to its pages) to keep the three
  parallel streams conflict-free.

## 3. Issue breakdown

Dependency order: AA-DEV-1 … AA-DEV-3 (parallel) → AA-QA-1 → AA-TPM-1.

### AA-DEV-1 · Structural core: astro.config.mjs + index.mdx + getting-started/ + develop/guides/ — Dev (Batch 1)

- [x] Status: done (2026-07-22)
- **Callouts:** Canonical wording published: walkthrough title → "Temporary
  elevation walkthrough" (slug untouched); sidebar label → "Temporary
  elevation". Homepage heading → "A concrete scenario"; overview card and
  quickstart Next-steps link texts cleaned; quickstart headings "Run/See the
  hero flow" → "Run/See the end-to-end flow". Four heading renames total, all
  verified zero inbound links to old anchors. Glossary already compliant
  (code-styled example value only).
- **Description:** Apply both directives to the structural core:
  `astro.config.mjs` (sidebar label `'Temporary elevation (INC-4821)'` →
  incident-id-free label), `src/content/docs/index.mdx`, every file in
  `src/content/docs/getting-started/`, and `src/content/docs/develop/guides/`
  — including the walkthrough page whose **title carries INC-4821**. This
  batch owns the canonical retitle of
  `develop/guides/temporary-elevation-walkthrough.md` and the matching sidebar
  label; it publishes the final wording so Batches 2–3 can update their
  inbound link texts consistently. Inside the walkthrough, `INC-4821` remains
  as the `task_id` in commands/payloads, introduced generically in prose.
- **Acceptance criteria:**
  - `astro.config.mjs` sidebar contains no `INC-4821`; no batch-file title,
    heading, card description, or link text contains `INC-4821`.
  - `INC-4821` appears in batch files only inside code fences/payloads/output
    as a `task_id` value, with a generic prose introduction.
  - No "hero flow"/prose "hero" in batch files; functional name substituted
    with first-use expansion; `run_hero_flow` kept in code style where the API
    is referenced.
  - Retitled page/sidebar wording recorded in this issue's callouts for
    Batches 2–3 to link against; batch-internal cross-references updated.
  - Any batch-page copy asserted in `tests/e2e/docs.spec.ts` updated in
    lockstep.
- **Deps:** none (publishes canonical wording consumed by AA-DEV-2/3).

### AA-DEV-2 · Sweep concepts/ + develop/ (top-level, recipes) + operations/ — Dev (Batch 2)

- [x] Status: done (2026-07-22)
- **Callouts:** 11/11 files changed. Heading "The autonomous hero flow" →
  "The end-to-end governed flow" (zero inbound links to old anchor). All prose
  INC-4821 narrative → "a sample incident"; code-block values retained per §2.
- **Description:** Apply both directives to `src/content/docs/concepts/`,
  `src/content/docs/develop/` top-level and `develop/recipes/` (guides/ is
  Batch 1), and `src/content/docs/operations/`. These pages are the main
  carriers of "hero flow" as prose vocabulary and of headings/link texts
  anchored on `INC-4821` — replace with the functional flow name and generic
  incident-id introductions. Update inbound link texts to the walkthrough page
  using the canonical wording published by AA-DEV-1.
- **Acceptance criteria:**
  - No `INC-4821` in batch-file titles, headings, card descriptions, or link
    texts; retained occurrences are code-fence/payload/output `task_id` values
    with generic prose introductions.
  - No "hero flow"/prose "hero" in batch files; functional name with
    first-use expansion per page; `run_hero_flow` untouched in code style.
  - Links to the walkthrough use AA-DEV-1's final title/label wording.
  - Any batch-page copy asserted in `tests/e2e/docs.spec.ts` updated in
    lockstep.
- **Deps:** none for the sweep; link-text wording depends on AA-DEV-1's
  published retitle (coordinate via that issue's callouts).

### AA-DEV-3 · Sweep sdk/ + reference/ (incl. changelog) — Dev (Batch 3)

- [x] Status: done (2026-07-22)
- **Callouts:** 4/4 files changed. Changelog historical facts preserved —
  "autonomous-hero-flow" there was an ad-hoc framing label, not a recorded
  release name, so rewording it does not alter history. `sdk/reference.md`
  FLAGGED (untouched): a single INC-4821 inside a doctest example (within
  policy as a code-styled value; fix at the platform-repo docstring if the
  example is ever expanded — see §5 F-1); zero "hero" occurrences.
- **Description:** Apply both directives to `src/content/docs/sdk/`
  (**excluding `reference.md`**, auto-generated and flag-only) and
  `src/content/docs/reference/` including `changelog.md`. SDK pages document
  `run_hero_flow` — keep the symbol in code style everywhere the API is the
  subject, but describe it in prose as "the end-to-end governed flow
  (register → deny → approve → succeed)". Changelog entries keep their
  historical facts; reword only anchoring vocabulary. While sweeping
  `sdk/reference.md` (read-only), record every `INC-4821`/"hero" docstring
  violation in §5 for the platform-repo backlog.
- **Acceptance criteria:**
  - No `INC-4821` in batch-file titles, headings, card descriptions, or link
    texts; retained occurrences are code-fence/payload/output `task_id` values
    with generic prose introductions.
  - No "hero flow"/prose "hero" outside code style in batch files (minus
    `reference.md`); `run_hero_flow` still findable and correctly documented
    as the API entry point for the flow.
  - `sdk/reference.md` untouched; its violations enumerated in §5 with symbol
    + offending text, ready for the platform-repo docstring fix.
  - Changelog facts preserved; links to the walkthrough use AA-DEV-1's final
    wording.
  - Any batch-page copy asserted in `tests/e2e/docs.spec.ts` updated in
    lockstep.
- **Deps:** none for the sweep; link-text wording depends on AA-DEV-1's
  published retitle (coordinate via that issue's callouts).

### AA-QA-1 · QA gate: Prettier, docs build, full Playwright suite — QA

- [x] Status: done (2026-07-22)
- **Callouts:** Verification greps clean — zero structural INC-4821
  (titles/headings/labels), zero codename "hero" outside `run_hero_flow` API
  references and Starlight splash-hero mechanics (`heroArch` asset, `hero:`
  frontmatter key — web-design terms, not the codename). Prettier clean;
  `astro build` green (124 pages); full Playwright suite 33/33 passed. Zero
  test assertion changes needed across all batches.
- **Description:** After all three batches report done, run the gate on the
  combined uncommitted tree: (1) Prettier check over changed files, (2) full
  docs build (`astro build` must complete with zero errors/broken links —
  retitled walkthrough page and relabeled sidebar are the top link-breakage
  risk), (3) the **full** Playwright suite including `tests/e2e/docs.spec.ts`
  and `tests/e2e-root/root.spec.ts` (root spec's landing-hero assertions must
  still pass untouched). Then run verification greps over the repo:
  `INC-4821` outside code fences (and in `astro.config.mjs` labels,
  frontmatter titles/descriptions) — expected zero except generic prose
  introductions adjacent to code blocks; "hero" as prose in
  `src/content/docs/` excluding `sdk/reference.md`, code fences, and the
  `run_hero_flow` symbol — expected zero. Route any failure back to the
  owning batch (AA-DEV-1…3) as a callout under that issue, and re-run the
  gate after the fix.
- **Acceptance criteria:**
  - Prettier clean; docs build green with no broken links; full Playwright
    suite green — command output summarized in §6.
  - Verification greps: zero structural `INC-4821` hits; zero prose "hero"
    hits outside `sdk/reference.md`, code style, and the landing-hero test.
  - No stale assertions: every `docs.spec.ts` change traces to a batch page
    edit; `root.spec.ts` unchanged.
  - All work remains uncommitted.
- **Deps:** AA-DEV-1 … AA-DEV-3.

### AA-TPM-1 · Close out epic with evidence and flag hand-offs — TPM

- [x] Status: done (2026-07-22)
- **Description:** Confirm all batch checkboxes and the QA gate are done, fill
  in §6 with evidence (grep summaries, build/test output, touched-file counts
  per batch), finalize §5 flagged items — the `sdk/reference.md` docstring
  violation list and the `run_hero_flow` rename question — as explicit
  hand-offs to the platform repo, flip the epic **Status** header, and present
  the uncommitted change set to the user for review. Do **not** commit.
- **Acceptance criteria:**
  - §6 evidence complete; every issue checked; header status updated.
  - §5 items carry enough detail to be actioned in the platform repo without
    re-investigation, including the breaking-change framing of F-2.
  - Working tree presented for user review; no commits made by this epic.
- **Deps:** AA-QA-1.

## 4. Out of scope

- Hand-editing `src/content/docs/sdk/reference.md` — auto-generated; fixes land
  in the platform repo's docstrings (tracked in §5).
- `tests/e2e-root/root.spec.ts` "hero" references — landing hero section, a
  standard web-design term, not the flow codename.
- Rewriting `reference/changelog.md` history — entries keep their facts; only
  anchoring vocabulary is reworded.
- Renaming the public SDK symbol `run_hero_flow` — a breaking change owned by
  the platform repo; raised as a flagged item (§5), not executed here.
- The marketing root site (`src-root/`) and its landing content — separate
  surface, separate pass.
- Committing or pushing anything — the entire change set stays uncommitted for
  user review.
- Pre-existing unrelated WIP in the working tree.

## 5. Flagged items (hand-offs, not fixed in this epic)

| # | Item | Detail | Disposition |
|---|---|---|---|
| F-1 | `src/content/docs/sdk/reference.md` carries anchoring violations | File is auto-generated from platform-repo docstrings; hand-edits would be overwritten. Batch 3 records every `INC-4821` structural use and prose "hero flow" occurrence (symbol + offending text) found in the generated output. | Platform-repo backlog: fix the SDK docstrings (generic incident-id introductions, functional flow name in prose), then regenerate `reference.md`. |
| F-2 | Public SDK symbol `run_hero_flow` embeds the codename | The docs keep the symbol in code style as an API fact, so the codename remains discoverable in code even after this sweep. Renaming it (e.g., to a functional name) is a **breaking change** to the public SDK surface: deprecation alias, version bump, changelog entry, and a docs regeneration/update pass would all be required. | Platform-repo decision item: evaluate renaming `run_hero_flow` with a deprecation path. If renamed, a follow-up docs epic updates all code-style references here. |

## 6. Evidence log (closed out 2026-07-22)

| Item | Evidence |
|---|---|
| Batch 1–3 completion notes (files touched per batch) | Batch 1 (structural core): walkthrough retitled, sidebar relabeled, homepage heading → "A concrete scenario", overview card + quickstart Next-steps link texts cleaned, quickstart headings "Run/See the hero flow" → "Run/See the end-to-end flow"; four heading renames total, all verified zero inbound links to old anchors; glossary already compliant. Batch 2 (concepts/develop/ops): 11/11 changed; "The autonomous hero flow" heading → "The end-to-end governed flow" (zero inbound); prose INC-4821 narrative → "a sample incident", code values retained. Batch 3 (sdk/changelog): 4/4 changed; changelog facts preserved ("autonomous-hero-flow" was an ad-hoc framing label, not a recorded release name); `sdk/reference.md` flagged, not edited. |
| Canonical retitle/sidebar wording published by AA-DEV-1 | Title: "Temporary elevation walkthrough" (slug untouched). Sidebar label: "Temporary elevation". |
| Prettier check output | Clean — no formatting violations across changed files. |
| Docs build output (incl. link check on retitled page) | `astro build` succeeded — 124 pages, no errors; no broken links from the retitle/relabel (zero inbound links to any renamed anchor). |
| Full Playwright suite output (incl. `docs.spec.ts`, `root.spec.ts`) | Full suite green: 33/33 passed. `root.spec.ts` landing-hero assertions untouched and passing. |
| Verification greps (`INC-4821` structural / prose "hero") | Zero structural INC-4821 hits (titles/headings/sidebar labels/card descriptions/link texts). Zero codename "hero" hits outside `run_hero_flow` API references and Starlight splash-hero mechanics (`heroArch` asset, `hero:` frontmatter key — web-design terms, not the codename). |
| `docs.spec.ts` assertion changes mapped to page edits | Zero test assertion changes were needed across all batches — no asserted copy was altered. |
| `sdk/reference.md` violation list (feeds F-1) | One violation: a single INC-4821 inside a doctest example — within policy as a code-styled value; fix at the platform-repo docstring only if the example is expanded. Zero "hero" occurrences in the generated file. |
| Follow-ups / deviations | Two platform-repo hand-offs open: F-1 (single doctest INC-4821 in `sdk/reference.md`, low priority — within policy today) and F-2 (decision item: renaming the public SDK symbol `run_hero_flow`, a breaking change requiring a deprecation path; if renamed, a follow-up docs epic updates code-style references). Entire change set left **uncommitted** for user review per guardrail; no commits made. |
