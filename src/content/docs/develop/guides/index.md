---
title: Guides
description: End-to-end, copy-pasteable PaloNexus walkthroughs that string the SDK, the consoles, and the audit chain into one narrated flow on the seeded sample-organization fixtures.
sidebar:
  order: 7
---

Longer-form, end-to-end walkthroughs that narrate a complete flow — SDK, consoles, and the
audit chain together — on the seeded **devops-incident** fixtures of the sample
organization (no invented users). Where
the [recipes](/docs/develop/recipes/) are short single-pattern snippets, a guide is the full
story from `register` to `revoke`.

## The guides

| Guide | What it covers |
|---|---|
| [Temporary elevation walkthrough](/docs/develop/guides/temporary-elevation-walkthrough/) | While triaging a sample incident, an agent acting on behalf of its owner is denied a regulated runbook, requests a task-scoped delegation, an authorized approver approves, the read succeeds, and access is audited then revoked — deny-by-default, just-in-time (JIT) elevation, audit-by-construction. |

## Related

- [Quickstart](/docs/getting-started/quickstart/) — the typed API the guides use.
- [Authority delegation](/docs/develop/delegations-and-approvals/) — the human-in-the-loop layer.
- [Recipes](/docs/develop/recipes/) — short single-pattern offline snippets.
- [Glossary](/docs/getting-started/glossary/) — the identity and access management (IAM) acronyms.
