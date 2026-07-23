---
title: Recipes
description: A cookbook of runnable, offline PaloNexus governance patterns — A2A delegation, the revocation race, budget exhaustion, a multi-scenario agent, and offline tests — all using the seeded sample-organization fixtures.
sidebar:
  order: 1
---

Task-focused, **runnable** patterns built on the shipped `examples/` and the
**devops-incident** scenario — the scenario from the
[temporary-elevation walkthrough](/docs/develop/guides/temporary-elevation-walkthrough/).
Every snippet here runs against `PaloNexus.offline()` (no cluster,
no network, no API key) using the seeded fixtures of the sample
organization — **no invented users**:

> **devops-incident** — a seeded owner, a sponsor who is also the approver, an operator, an
> auditor, and a seeded **negative persona** (must be hard-denied). The
> [walkthrough](/docs/develop/guides/temporary-elevation-walkthrough/#personas-and-the-regulated-asset)
> maps each role to its seeded subject and email.

Each recipe was executed against the shipped `palonexus` package while writing these docs.

## The cookbook

| Recipe | Pattern |
|---|---|
| [A2A delegation](/docs/develop/recipes/a2a-delegation/) | An agent delegates to a sub-agent; the agent-to-agent (A2A) hop is itself gated and carries the original on-behalf-of subject. |
| [Revocation race](/docs/develop/recipes/revocation-race/) | A grant is revoked mid-run; the next `/authz` check denies immediately. |
| [Budget exhaustion](/docs/develop/recipes/budget-exhaustion/) | An agent hits its calls/tokens ceiling; how the deny surfaces and how to set the budget. |
| [Multi-scenario agent](/docs/develop/recipes/multi-scenario-agent/) | One process governing several scenarios at once, each with its own personas and negative case. |
| [Offline tests](/docs/develop/recipes/offline-tests/) | Prove the deny-by-default contract in CI with the shipped pytest fixtures. |

## Prerequisites

```bash
pip install palonexus                       # base install runs every recipe here
```

All recipes share this preamble (register + provision the authority-bound agent):

```python
from palonexus import PaloNexus

AGENT = "northstar-devops-incident-agent"
OWNER, APPROVER = "ethan.park@northstar.example", "maya.chen@northstar.example"

pn = PaloNexus.offline()                     # in-memory FakeControlPlane, deny-by-default
agent = pn.agents.register(name=AGENT, owner=OWNER, sponsor=APPROVER, scenario="devops-incident")
agent.provision()                            # mints did:key + Membership VC (idempotent)
```

## Related

- [Quickstart](/docs/getting-started/quickstart/) — the typed API these recipes use.
- [LangChain](/docs/sdk/langchain/) · [LangGraph](/docs/sdk/langgraph/) · [Deep Agents](/docs/sdk/deep-agents/) adapters.
- [Troubleshooting](/docs/develop/troubleshooting/) — decode any deny reason a recipe hits.
- [Security model](/docs/concepts/security-model/) — the invariants the recipes demonstrate.
