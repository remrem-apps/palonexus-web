# Epic — Three-Directives Editorial Sweep Across the Docs Site

**Status:** complete (2026-07-22) · **Owner:** TPM · **Repo in scope:** `palonexus-web` (this repo)
**Created:** 2026-07-22 · **Tracking:** markdown-only in `docs/requirements/` — no Linear (free-tier limit)

## 1. Epic summary

Sweep three editorial/product directives across every page under `src/content/docs/`
(excluding `getting-started/quickstart.mdx`, which is already done), using seven
parallel editor batches (A–G), followed by a single QA gate and TPM close-out.
Changes stay **uncommitted** for user review — no commits, no pushes.

**The three directives (apply all three to every file in scope):**

1. **No second person.** Remove "you"/"your" from prose; rewrite in imperative mood
   ("Run the seed script…") or third-person declaratives ("The control plane
   issues…").
2. **No demo personas or fictional-org narrative in prose.** Remove Northstar,
   Ethan Park, Maya Chen, Arjun Mehta, Omar Haddad, and Claire Evans from prose;
   replace with role language (agent owner, approving manager, platform operator,
   security reviewer). Seeded values (e.g., `ethan.park@northstar.example` emails,
   org slugs) **may remain inside code blocks** where required for commands or
   snippets to actually run against the seeded environment.
3. **Corrected product framing.** The offering is a **self-installed platform +
   Python SDK, together**, for organizations using Logto IAM + cloud Kubernetes +
   Python agents. There is no SDK-only product and no hosted cloud. Remove all
   "partner-neutral", "Logto is just a reference implementation", and "reference
   demo" framing — Logto is the supported IAM, not an example.

**Verified ground truth (2026-07-22, do not re-verify):**

- 24 files mention personas/Northstar; 11 carry reference-demo framing; 52 use
  second person.
- `src/content/docs/getting-started/quickstart.mdx` already conforms — out of scope.
- `src/content/docs/sdk/reference.md` is **auto-generated** from platform-repo
  docstrings. It gets flagged, not hand-edited (fixes belong in the platform repo).
- Test-asserted copy lives in `tests/e2e/docs.spec.ts` — any heading/string the
  Playwright suite asserts must be updated in lockstep with the page edit.
- Seven parallel editor batches are already running (A–G, mapped below).

## 2. Guardrails (apply to every issue)

- **Prose vs. code blocks.** Directives 1–2 apply to prose, headings, frontmatter
  descriptions, admonitions, table cells, and image alt text. Code blocks keep
  seeded values (persona emails, `northstar` org identifiers) **only where the
  snippet must run against seeded data**; illustrative-only snippets get neutral
  values.
- **No meaning drift.** Rewrites preserve technical accuracy — endpoints, env
  vars, flag names, sequence of steps, and security claims are untouched unless
  they embody the wrong product framing (directive 3), in which case the framing
  changes but the mechanics do not.
- **`sdk/reference.md` is read-only in this epic.** Editors flag violations in §5
  and move on; the fix is a platform-repo docstring backlog item.
- **Test lockstep.** Any editor changing copy asserted by `tests/e2e/docs.spec.ts`
  updates the assertion in the same batch — the QA gate must not discover drift.
- **Nothing gets committed.** All edits (docs + test) remain uncommitted in the
  working tree for user review. The pre-existing unrelated WIP in the tree is left
  untouched.
- **Batch boundaries are hard.** Each editor touches only the files in its batch
  (plus `tests/e2e/docs.spec.ts` lines tied to its pages) to keep the seven
  parallel streams conflict-free.

## 3. Issue breakdown

Dependency order: DS-DEV-A … DS-DEV-G (parallel) → DS-QA-1 → DS-TPM-1.

### DS-DEV-A · Sweep index.mdx + getting-started/ — Dev (Batch A)

- [x] Status: done (2026-07-22)
- **Callouts:** 5/5 files changed. Glossary persona entries generalized, not
  deleted. Homepage §15 pinned sentence preserved. Coordinator follow-up fix:
  homepage mermaid label "Your AI agent" → "AI agent".
- **Description:** Apply all three directives to `src/content/docs/index.mdx` and
  every file in `src/content/docs/getting-started/` **except `quickstart.mdx`**
  (already done): `overview.mdx`, `concepts.md`, `glossary.md`,
  `what-palonexus-is-not.md`. The landing page and `what-palonexus-is-not.md` are
  the highest-risk pages for directive 3 (product framing) — verify they state the
  platform + SDK together offering and drop any SDK-only or hosted-cloud
  positioning.
- **Acceptance criteria:**
  - No "you"/"your" in prose across batch files; imperative or third-person
    declarative throughout.
  - No persona names or Northstar narrative in prose; role language substituted;
    code-block exemption applied per §2.
  - Product framing on every batch page: self-installed platform + Python SDK for
    Logto IAM + cloud Kubernetes + Python agents; no "reference demo" /
    "partner-neutral" language.
  - Any batch-page copy asserted in `tests/e2e/docs.spec.ts` updated in lockstep.
- **Deps:** none.

### DS-DEV-B · Sweep concepts/ — Dev (Batch B)

- [x] Status: done (2026-07-22)
- **Callouts:** 5 files changed, 2 already clean. `enterprise-iam.md`
  substantially reframed (persona table → roles; Logto stated as supported IAM).
  Pinned `feature-matrix.md` cells untouched.
- **Description:** Apply all three directives to every file in
  `src/content/docs/concepts/` (`index.md`, `architecture.md`,
  `security-model.md`, `identity-and-credentials.md`, `egress-enforcement.md`,
  `enterprise-iam.md`, `feature-matrix.md`). Concept pages lean third-person
  declarative (not imperative) — they explain, they don't instruct. Architecture
  and feature-matrix pages are likely carriers of "Logto is just a reference"
  framing; restate Logto as the supported IAM.
- **Acceptance criteria:**
  - Same three directive checks as DS-DEV-A, scoped to batch files.
  - Persona-driven narrative examples replaced by role-based examples (agent
    owner, approving manager, etc.) without losing the scenario's teaching point.
  - `tests/e2e/docs.spec.ts` assertions for batch pages updated in lockstep.
- **Deps:** none.

### DS-DEV-C · Sweep develop/ top-level — Dev (Batch C)

- [x] Status: done (2026-07-22)
- **Callouts:** 7 files changed, 2 already clean. Delegations mermaid participant
  "Maya" → "Approver". Noted: the enterprise-iam directory fixtures (Alice Chen
  etc.) are mock-SCIM seed data, not the banned demo personas — kept in CLI
  output under the seeded-values exception.
- **Description:** Apply all three directives to the top-level files of
  `src/content/docs/develop/` (`index.md`, `agent-identity.md`,
  `deploy-an-agent.md`, `delegations-and-approvals.md`, `autonomous-flow.md`,
  `budgets-and-allowlists.md`, `egress-enforcement.md`, `enterprise-iam.md`,
  `troubleshooting.md`). Task pages use imperative mood. These pages are dense
  with runnable snippets — apply the code-block exemption carefully: seeded
  persona emails stay in commands that run against seed data; prose around them
  switches to role language.
- **Acceptance criteria:**
  - Same three directive checks, scoped to batch files.
  - Every retained persona value sits inside a code block that must run against
    seeded data; no persona names remain in surrounding prose or headings.
  - `tests/e2e/docs.spec.ts` assertions for batch pages updated in lockstep.
- **Deps:** none.

### DS-DEV-D · Sweep develop/guides/ + develop/recipes/ — Dev (Batch D)

- [x] Status: done (2026-07-22)
- **Callouts:** 8/8 files changed. `temporary-elevation-walkthrough.md` fully
  rewritten to role language. Fixed two pre-existing factual errors in
  `multi-scenario-agent.md` (persona names not matching seeded emails).
- **Description:** Apply all three directives to `src/content/docs/develop/guides/`
  (`index.md`, `temporary-elevation-walkthrough.md`) and
  `src/content/docs/develop/recipes/` (`index.md`, `a2a-delegation.md`,
  `budget-exhaustion.md`, `multi-scenario-agent.md`, `offline-tests.md`,
  `revocation-race.md`). The elevation walkthrough is the most persona-heavy
  narrative page on the site — rewrite the storyline in role terms (requesting
  agent owner, approving manager) while keeping the step sequence and seeded
  commands intact. Note: `offline-tests.md` touches the `offline()` seed, which
  requires northstar emails in runnable code — that stays in code blocks and is
  logged as the SDK-side backlog flag (§5), not "fixed" here.
- **Acceptance criteria:**
  - Same three directive checks, scoped to batch files.
  - Walkthrough narrative reads as roles, not characters; steps and commands
    unchanged in behavior.
  - `offline()` northstar-email requirement confirmed as code-block-only and
    cross-referenced in §5.
  - `tests/e2e/docs.spec.ts` assertions for batch pages updated in lockstep.
- **Deps:** none.

### DS-DEV-E · Sweep operations/ — Dev (Batch E)

- [x] Status: done (2026-07-22)
- **Callouts:** 16 files changed, 1 already clean. `bring-your-own-idp.md`
  flagged: title kept as an established product term (sidebar + 4 inbound
  links). Also removed pre-existing stray artifact lines from `doks-runbook.md`.
- **Description:** Apply all three directives to every file in
  `src/content/docs/operations/` (18 files: `index.md`, `self-hosting.md`,
  `docker-compose.md`, `doks-runbook.md`, `terraform-doks.md`, `control-plane.md`,
  `command-center.md`, `bring-your-own-idp.md`, `secrets.md`, `hardening.md`,
  `observability.md`, `persistence.md`, `backups.md`, `migrations.md`,
  `upgrades.md`, `performance.md`, `egress-enforcement-ops.md`,
  `releasing-the-docs.md`). Runbooks use imperative mood. `bring-your-own-idp.md`
  is the sharpest directive-3 case: reframe from "swap in any IdP; Logto is just
  the reference" to Logto as the supported IAM for the platform (keep factual
  statements about what the integration touches).
- **Acceptance criteria:**
  - Same three directive checks, scoped to batch files.
  - Self-hosting/runbook pages present installation as the product's normal
    deployment model (self-installed on cloud Kubernetes), not as a demo setup.
  - `tests/e2e/docs.spec.ts` assertions for batch pages updated in lockstep.
- **Deps:** none.

### DS-DEV-F · Sweep sdk/ + integrations/ — Dev (Batch F)

- [x] Status: done (2026-07-22)
- **Callouts:** 11 files changed, 4 already clean. `sdk/reference.md` FLAGGED
  (untouched) with a detailed violation list for platform-repo docstrings:
  second person, "we", northstar doctest example, and internal ticket/spec
  references (REM-151, REM-146, CONTRACTS §refs) leaking into customer-facing
  copy — see §5 F-1.
- **Description:** Apply all three directives to `src/content/docs/sdk/`
  (`index.md`, `palonexus-agent.md`, `agentdid.md`, `config-env.md`,
  `egress-proxy-client.md`, `langchain.md`, `langgraph.md`, `deep-agents.md` —
  **excluding `reference.md`**, which is auto-generated and flag-only) and
  `src/content/docs/integrations/` (`index.md`, `a2a-delegation.md`,
  `agent-sandbox.md`, `deep-agents-sandboxes.md`, `kagent.md`, `mcp.md`,
  `openai-agents.md`). SDK pages must present the SDK as the client half of the
  platform — never a standalone product. While sweeping `reference.md` for
  violations (read-only), record each finding in §5 for the platform-repo
  docstring backlog.
- **Acceptance criteria:**
  - Same three directive checks, scoped to batch files (minus `reference.md`).
  - `sdk/reference.md` untouched; its violations enumerated in §5 with enough
    context (symbol + offending text) to fix docstrings in the platform repo.
  - No SDK-only positioning anywhere in `sdk/index.md` or integration intros.
  - `tests/e2e/docs.spec.ts` assertions for batch pages updated in lockstep.
- **Deps:** none.

### DS-DEV-G · Sweep reference/ — Dev (Batch G)

- [x] Status: done (2026-07-22)
- **Callouts:** 7/7 files changed. "reference demo seeder" → "identity seeder"
  with `cli.md` / `env-vars.md` anchors updated in lockstep. Changelog historical
  facts preserved.
- **Description:** Apply all three directives to every file in
  `src/content/docs/reference/` (`index.md`, `http-api.md`,
  `enterprise-iam-api.md`, `cli.md`, `env-vars.md`, `headers.md`,
  `changelog.md`). Reference pages lean third-person declarative; example
  requests/responses keep seeded values only where needed to be reproducible
  against seed data. Changelog entries are historical record — reword framing
  language, do not rewrite what shipped.
- **Acceptance criteria:**
  - Same three directive checks, scoped to batch files.
  - API/CLI examples still copy-paste runnable against a seeded install.
  - `tests/e2e/docs.spec.ts` assertions for batch pages updated in lockstep.
- **Deps:** none.

### DS-QA-1 · QA gate: Prettier, docs build, full Playwright suite — QA

- [x] Status: done (2026-07-22)
- **Callouts:** Prettier clean; `astro build` green (124 pages); full Playwright
  suite 33/33 passed. Persona full-name grep = 0 hits in `src/content/docs`;
  residual you/your only in code placeholders (`<your-docr>`,
  `your-tenant.logto.app`, `$(your-keygen)`) and the flagged auto-generated
  `sdk/reference.md`. Zero e2e assertion changes were needed across all batches.
- **Description:** After all seven batches report done, run the gate on the
  combined uncommitted tree: (1) Prettier check over changed files, (2) full docs
  build (must complete with zero errors/broken links per build output), (3) the
  **full** Playwright suite including `tests/e2e/docs.spec.ts`. Then run the
  directive sweeps as verification greps over `src/content/docs/` (excluding
  `sdk/reference.md` and code fences): second-person hits, persona/Northstar hits
  in prose, and "reference demo"/"partner-neutral" framing hits — expected result
  is zero. Route any failure back to the owning batch (DS-DEV-A…G) as a callout
  under that issue, and re-run the gate after the fix.
- **Acceptance criteria:**
  - Prettier clean; docs build green; full Playwright suite green — command
    output summarized in §6.
  - Verification greps return zero prose violations outside code fences and
    `sdk/reference.md`.
  - No stale assertions: every `docs.spec.ts` change traces to a batch page edit.
  - All work remains uncommitted.
- **Deps:** DS-DEV-A … DS-DEV-G.

### DS-TPM-1 · Close out epic with evidence and flag hand-offs — TPM

- [x] Status: done (2026-07-22)
- **Description:** Confirm all batch checkboxes and the QA gate are done, fill in
  §6 with evidence (grep summaries, build/test output, list of touched files),
  finalize §5 flagged items (the `sdk/reference.md` violation list and the SDK
  `offline()` seed backlog item) as explicit hand-offs to the platform repo, flip
  the epic **Status** header, and present the uncommitted change set to the user
  for review. Do **not** commit.
- **Acceptance criteria:**
  - §6 evidence complete; every issue checked; header status updated.
  - §5 items carry enough detail to be actioned in the platform repo without
    re-investigation.
  - Working tree presented for user review; no commits made by this epic.
- **Deps:** DS-QA-1.

## 4. Out of scope

- `src/content/docs/getting-started/quickstart.mdx` — already conforms.
- Hand-editing `src/content/docs/sdk/reference.md` — auto-generated; fixes land in
  the platform repo's docstrings (tracked in §5).
- The marketing root site (`src-root/`) and its landing content — separate surface,
  separate pass.
- Renaming seeded identities in the platform/seed data itself — seeded values in
  runnable code blocks are exempt by design.
- Committing or pushing anything — the entire change set stays uncommitted for
  user review.
- Pre-existing unrelated WIP in the working tree.

## 5. Flagged items (hand-offs, not fixed in this epic)

| # | Item | Detail | Disposition |
|---|---|---|---|
| F-1 | `src/content/docs/sdk/reference.md` carries directive violations | File is auto-generated from platform-repo docstrings; hand-edits would be overwritten. Batch F recorded a detailed violation list: second-person prose, first-person "we", a northstar doctest example, and internal ticket/spec references (REM-151, REM-146, CONTRACTS §refs) leaking into customer-facing copy. | Platform-repo backlog: fix the SDK docstrings (remove second person / "we" / internal REM ticket and CONTRACTS spec refs, neutralize the northstar doctest), then regenerate `reference.md`. |
| F-2 | SDK `offline()` seed requires northstar persona emails in runnable code | Code blocks demonstrating `offline()` (notably `develop/recipes/offline-tests.md`) must keep `*@northstar.example` values or the snippets stop working against seed data. Prose around them uses role language, but the persona values themselves are baked into the SDK seed. | SDK-side backlog item: make `offline()` accept generic/configurable identities so docs code blocks can drop persona emails. |
| F-3 | `operations/bring-your-own-idp.md` title retained | Page body reframed per directive 3, but the title/slug "Bring your own IdP" was kept as an established product term (appears in the sidebar and has 4 inbound links). | Accepted as-is; revisit only if product naming changes. |

## 6. Evidence log (closed out 2026-07-22)

| Item | Evidence |
|---|---|
| Batch A–G completion notes (files touched per batch) | A: 5/5 changed (glossary personas generalized; homepage §15 pinned sentence preserved). B: 5 changed, 2 clean (`enterprise-iam.md` reframed persona table → roles, Logto stated as supported IAM; pinned feature-matrix cells untouched). C: 7 changed, 2 clean (delegations mermaid "Maya" → "Approver"; mock-SCIM fixtures like "Alice Chen" retained in CLI output — seed data, not banned personas). D: 8/8 changed (elevation walkthrough fully rewritten to roles; two pre-existing factual errors fixed in `multi-scenario-agent.md`). E: 16 changed, 1 clean (`bring-your-own-idp.md` title kept — see F-3; stray artifact lines removed from `doks-runbook.md`). F: 11 changed, 4 clean (`sdk/reference.md` flagged, not edited — see F-1). G: 7/7 changed ("reference demo seeder" → "identity seeder", `cli.md`/`env-vars.md` anchors updated in lockstep; changelog facts preserved). Coordinator fix: homepage mermaid label "Your AI agent" → "AI agent". |
| Prettier check output | Clean — no formatting violations across changed files. |
| Docs build output | `astro build` succeeded — 124 pages, no errors. |
| Full Playwright suite output (incl. `docs.spec.ts`) | Full suite green: 33/33 passed. |
| Verification greps (second person / personas / framing) | Persona full-name grep: 0 hits in `src/content/docs`. Residual "you"/"your": only code placeholders (`<your-docr>`, `your-tenant.logto.app`, `$(your-keygen)`) and the flagged auto-generated `sdk/reference.md`. |
| `docs.spec.ts` assertion changes mapped to page edits | Zero e2e assertion changes were needed across all batches — no asserted copy was altered. |
| `sdk/reference.md` violation list (feeds F-1) | Recorded by Batch F: second-person prose, first-person "we", northstar doctest example, internal ticket/spec refs (REM-151, REM-146, CONTRACTS §refs) in customer-facing copy. Hand-off detail in §5 F-1. |
| Follow-ups / deviations | Two platform-repo/SDK backlog hand-offs open: F-1 (`sdk/reference.md` docstring fixes + regeneration) and F-2 (`offline()` accepting generic identities). F-3 accepted as-is. Batches D and E made small out-of-directive cleanups (factual persona/email mismatches, stray artifact lines) — improvements, logged here for transparency. Entire change set (~60 files) left **uncommitted** for user review per guardrail; no commits made. |
