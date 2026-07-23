---
title: "Recipe: multi-scenario agent"
description: Govern several seeded scenarios from one process — each with its own owner/sponsor/approver/negative persona — proving authority and the deny-by-default boundary are per-scenario, not global.
sidebar:
  order: 5
---

A platform team rarely runs just one agent. This recipe governs **three** seeded scenarios from
a single process and shows that authority is **per-scenario**: each scenario's owner is
deny-by-default until granted, and each scenario's **negative persona** is hard-denied — a person
authorized in one scenario has no standing in another.

The seeded scenarios (from `palonexus.testing.SEED_SCENARIOS`) each carry a full
owner/sponsor/approver/negative cast — `devops-incident` is the scenario the
[temporary-elevation walkthrough](/docs/develop/guides/temporary-elevation-walkthrough/) narrates:

| Scenario | Agent | Owner | Negative persona |
|---|---|---|---|
| `devops-incident` | `northstar-devops-incident-agent` | `ethan.park@northstar.example` | `claire.evans@northstar.example` |
| `customer-support` | `northstar-support-triage-agent` | `sofia.martinez@northstar.example` | `noah.patel@northstar.example` |
| `finance-reconciliation` | `northstar-finance-recon-agent` | `daniel.kim@northstar.example` | `liam.oconnor@northstar.example` |

```python
from palonexus import PaloNexus
from palonexus.testing import SEED_SCENARIOS

pn = PaloNexus.offline()

for key in ("devops-incident", "customer-support", "finance-reconciliation"):
    sc = SEED_SCENARIOS[key]
    pn.agents.register(name=sc.agent, owner=sc.owner, sponsor=sc.sponsor, scenario=key).provision()

    # The scenario's negative persona is HARD-denied (never needs-approval).
    with pn.task(subject=sc.negative, task_id="T-1", scenario=key, actor=sc.agent) as task:
        d = task.check(action=sc.permissions[0], resource=f"{key}-api:/x")
        assert d.allow is False and d.needs_approval is False

    # The scenario's owner is deny-by-default until a delegation is approved.
    with pn.task(subject=sc.owner, task_id="T-1", scenario=key, actor=sc.agent) as task:
        assert task.check(action=sc.permissions[0], resource=f"{key}-api:/x").needs_approval
        pn._fake.grant(subject=sc.owner, action=sc.permissions[0],
                       resource=f"{key}-api:/x", scenario=key)
        assert task.check(action=sc.permissions[0], resource=f"{key}-api:/x").allow

    print(f"{key:24} negative denied · owner allowed-after-grant")

assert pn.audit.verify_chain()
pn.close()
```

```text
devops-incident          negative denied · owner allowed-after-grant
customer-support         negative denied · owner allowed-after-grant
finance-reconciliation   negative denied · owner allowed-after-grant
```

## What this proves

- **The boundary is per-scenario.** The customer-support negative persona being denied
  there says nothing about devops-incident — each scenario carries its own authority and its own
  red test case.
- **No global allow.** Granting the `customer-support` owner does not grant the
  `devops-incident` owner; every `(subject, action, resource)` is decided on its own.
- **One audit chain.** All scenarios append to the same tamper-evident chain;
  `pn.audit.tail(...)` filters by `task_id`, agent, or subject.

This is the same authority model the seed's `AuthorityEngine` and the portal's
[policy simulator](/docs/getting-started/glossary/) use — the offline fake mirrors it so an
agent fleet can fan out across scenarios in tests without a cluster.

## Related

- [Quickstart](/docs/getting-started/quickstart/) · [Offline tests](/docs/develop/recipes/offline-tests/).
- [Glossary — Scenario / Negative persona](/docs/getting-started/glossary/).
