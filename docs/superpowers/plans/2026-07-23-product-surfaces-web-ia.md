# PaloNexus Product Surfaces Web IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the PaloNexus marketing site and docs navigation to present one product with Integrate, Enforce, and Observe surfaces while accurately separating shipped self-hosted capabilities from planned Cloud Beta and coding-agent work.

**Architecture:** Keep the existing Astro content collections and shared navigation. Make copy changes in the existing landing-page/content Markdown files, add explicit deployment and lifecycle labels, and use the platform SaaS design as the source of truth for Cloud claims. No platform runtime or new approval UI is built in this plan.

**Tech Stack:** Astro, Markdown/MDX, shared `site-nav.mjs`, Prettier, Playwright.

---

## File map

- Modify: `src/content/docs/getting-started/overview.mdx` — product introduction and three-surface entry points.
- Modify: `src/content/docs/getting-started/quickstart.mdx` — Local/self-hosted onboarding distinction.
- Modify: `src/content/docs/concepts/architecture.md` — shipped Control Plane and deployment boundaries.
- Modify: `src/content/docs/concepts/feature-matrix.md` — shipped/planned matrix, including Cloud Beta state.
- Modify: `src/content/docs/operations/index.md`, `src/content/docs/operations/command-center.md`, and `src/content/docs/operations/self-hosting.md` — Self-hosted current path and Cloud private-beta language.
- Modify: `src/content/docs/develop/index.md`, `src/content/docs/develop/agent-identity.md`, and `src/content/docs/develop/delegations-and-approvals.md` — Integrate surface, identity provisioning, and approval contract.
- Modify: `src/content/docs/operations/command-center.md` — Observe surface and current portal access model.
- Modify: `shared/site-nav.mjs` — audience/deployment labels and links, preserving existing routes.
- Modify: `src-root/content/landing/hero.md`, `platform.md`, `governance.md`, `command-center.md`, `solutions.md`, `use-cases.md`, `closing.md`, `src-root/components/landing/Nav.astro`, and `src-root/components/landing/ClosingCta.astro` — marketing packaging and Cloud CTA.
- Test: `tests/e2e/product-surfaces.spec.ts` and `tests/e2e-root/product-surfaces.spec.ts`.

### Task 1: Add failing product-surface tests and establish copy guardrails

**Files:**
- Test: `tests/e2e/product-surfaces.spec.ts`, `tests/e2e-root/product-surfaces.spec.ts`.
- Reference: `/Users/raj/ai/palonexus/platform/docs/saas-cloud-beta-design.md`.

- [ ] **Step 1: Write failing assertions**

Assert the docs and root builds contain Integrate/Enforce/Observe, Local/Cloud Private Beta/Self-hosted, Request access, Connector-required wording, and planned labels. Assert no Start Cloud Beta, no available-now CTA, and no categorical no-hosted-secrets claim before Connector evidence. Assert current self-hosted portal approval is distinct from planned Cloud email approval.

- [ ] **Step 2: Record the copy rules in the implementation branch**

Use these rules while editing: self-hosted Control Plane, identity, SDK paths, portal approvals, audit, and DOKS are shipped; Cloud is `private-beta` with **Request access**; Cloud production actions require a customer-side Connector; the categorical no-hosted-production-secrets claim is allowed only after the platform launch-evidence checklist passes; email-to-web approval is planned Cloud behavior; Policy Studio and Codex/Claude/Companion are planned.

- [ ] **Step 3: Run the focused tests and verify failure**

```bash
npx playwright test tests/e2e/product-surfaces.spec.ts
npm run test:e2e:root -- --grep "product surfaces"
```

Expected: FAIL until the content is aligned.

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/e2e/product-surfaces.spec.ts tests/e2e-root/product-surfaces.spec.ts
git commit -m "test: define product surface messaging"
```

### Task 2: Reframe the marketing product model

**Files:**
- Modify: `src-root/content/landing/hero.md`, `platform.md`, `governance.md`, `command-center.md`, `solutions.md`, `use-cases.md`, `closing.md`, and `src-root/components/landing/ClosingCta.astro`.
- Modify: `src/content/docs/getting-started/overview.mdx`.

- [ ] **Step 1: Add the three-surface narrative**

Use the exact lifecycle verbs and audience mapping: **Integrate — SDK** for developers/agent owners, **Enforce — Control Plane** for platform/security operations, and **Observe — Command Center** for security administrators and leaders.

- [ ] **Step 2: Add identity, policy, and approval ownership**

Explain that SDK registration initiates agent identity provisioning, the Control Plane issues/verifies identity and enforces policy, and the Command Center exposes posture and investigations. Describe Policy Studio as planned. Present approval as a cross-surface workflow; describe current self-hosted portal approval separately from planned Cloud email-to-web approval.

- [ ] **Step 3: Add deployment choices without creating editions**

Present Local, Cloud Private Beta, and Self-hosted as deployment paths for the same product. Keep Cloud CTA as **Request access** and state that production actions require a customer-side Connector. Do not claim public SaaS availability.

- [ ] **Step 4: Add planned coding-agent language**

Label thin Codex/Claude Code adapters as planned and Companion as planned later, starting with macOS. State cooperative plugin boundaries and avoid implying device-level enforcement exists.

- [ ] **Step 5: Commit the marketing/content changes**

```bash
git add src-root/content/landing/hero.md src-root/content/landing/platform.md src-root/content/landing/governance.md src-root/content/landing/command-center.md src-root/content/landing/solutions.md src-root/content/landing/use-cases.md src-root/content/landing/closing.md src-root/components/landing/ClosingCta.astro src/content/docs/getting-started/overview.mdx
git commit -m "docs: frame PaloNexus as connected product surfaces"
```

### Task 3: Align documentation navigation and audience paths

**Files:**
- Modify: `shared/site-nav.mjs`.
- Modify: `src/content/docs/develop/index.md`, `src/content/docs/operations/index.md`, `src/content/docs/concepts/index.md`, `src/content/docs/sdk/index.md`.

- [ ] **Step 1: Add audience entry points**

Ensure navigation exposes paths for SDK developers, Local Runtime users, self-hosting/platform operations, security administrators, approvers, investigators/leaders, and Cloud private-beta requesters.

Update these pages in this task: `src/content/docs/concepts/architecture.md` (shipped Control Plane/deployment boundary), `src/content/docs/concepts/feature-matrix.md` (shipped/planned/Cloud state), `src/content/docs/getting-started/quickstart.mdx` (Local versus self-hosted), `src/content/docs/operations/self-hosting.md` (current Kubernetes path), `src/content/docs/operations/command-center.md` (current Tailscale/port-forward portal), `src/content/docs/develop/agent-identity.md` (SDK provisioning), and `src/content/docs/develop/delegations-and-approvals.md` (current portal approval versus planned Cloud email).

- [ ] **Step 2: Preserve existing routes and links**

Do not add links to Codex/Claude adapters or Companion installation pages before they ship. Use existing route names where possible; update labels rather than creating duplicate pages.

- [ ] **Step 3: Add current portal access qualification**

Link the Command Center documentation with its current Tailscale/port-forward operator access and do not present it as an already-public tenant portal.

- [ ] **Step 4: Commit navigation changes**

```bash
git add shared/site-nav.mjs src/content/docs/concepts/architecture.md src/content/docs/concepts/feature-matrix.md src/content/docs/concepts/index.md src/content/docs/getting-started/quickstart.mdx src/content/docs/develop/index.md src/content/docs/develop/agent-identity.md src/content/docs/develop/delegations-and-approvals.md src/content/docs/operations/index.md src/content/docs/operations/self-hosting.md src/content/docs/operations/command-center.md src/content/docs/sdk/index.md
git commit -m "docs: align navigation with product surfaces"
```

### Task 4: Make tests pass and validate both Astro builds

**Files:**
- Create or modify: `tests/e2e/product-surfaces.spec.ts`, `tests/e2e-root/product-surfaces.spec.ts`.

- [ ] **Step 1: Implement minimal content and selectors**

Use accessible headings, links, and visible text; avoid brittle CSS selectors.

- [ ] **Step 2: Run focused and full validation**

```bash
npx prettier --check .
npm run build
npm run build:root
npx playwright test tests/e2e/product-surfaces.spec.ts
npm run test:e2e:root -- --grep "product surfaces"
npm run test:e2e
```

Expected: formatting, build, focused test, and full suite pass.

- [ ] **Step 3: Commit verification coverage**

```bash
git add tests/e2e/product-surfaces.spec.ts tests/e2e-root/product-surfaces.spec.ts
git commit -m "test: verify product surface messaging"
```

### Task 5: Visual and link review

**Files:**
- No new source files unless defects are found.

- [ ] **Step 1: Run the local site**

```bash
npm run dev -- --host 127.0.0.1
```

- [ ] **Step 2: Review key routes in local Playwright**

Review landing page, getting started, SDK, operations, Command Center, and Cloud request-access paths at desktop and mobile widths. Check heading hierarchy, CTA state, tables, cards, and no horizontal overflow.

- [ ] **Step 3: Check links and console output**

Run the existing Playwright link/navigation coverage and inspect browser console output for errors.

- [ ] **Step 4: Fix only scoped defects and rerun validation**

```bash
npm run validate
npm run validate:root
```

- [ ] **Step 5: Commit final web IA changes**

```bash
git add src shared tests
git commit -m "docs: verify product surfaces experience"
```
