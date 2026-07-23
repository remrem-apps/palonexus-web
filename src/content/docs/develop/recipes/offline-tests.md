---
title: "Recipe: offline tests"
description: Prove the deny-by-default contract in CI with the shipped pytest fixtures — offline_pn, fake_control_plane, devops_personas — no cluster, no network, no API key.
sidebar:
  order: 6
---

The SDK ships a pytest plugin (`palonexus.pytest_plugin`, auto-registered via entry point) so
agent test suites can assert the governance contract with **no cluster, no network, no API key**.
Three fixtures cover the common cases:

| Fixture | Yields |
|---|---|
| `fake_control_plane` | a fresh in-memory `FakeControlPlane` (deny-by-default) |
| `offline_pn` | a `PaloNexus` bound to that fake — the canonical SDK fixture (closed automatically) |
| `devops_personas` | the `devops-incident` `ScenarioAuthority` — the scenario's seeded owner/sponsor/approver/negative cast |

No setup needed beyond `pip install palonexus` — the plugin registers itself.

## A deny-by-default test suite

The personas come from the seed fixtures (the cast of the
[temporary-elevation walkthrough](/docs/develop/guides/temporary-elevation-walkthrough/)) —
the `devops-incident` scenario includes an always-denied negative persona:

```python
# test_governance.py
def test_owner_is_deny_by_default(offline_pn, devops_personas):
    sc = devops_personas
    offline_pn.agents.register(name=sc.agent, owner=sc.owner, sponsor=sc.sponsor,
                               scenario=sc.key).provision()
    with offline_pn.task(subject=sc.owner, task_id="INC-1", scenario=sc.key, actor=sc.agent) as t:
        d = t.check(action="runbooks:read", resource="runbooks-api:/runbooks/db-failover")
        assert d.needs_approval                      # no standing authority -> needs approval

def test_negative_persona_is_hard_denied(offline_pn, devops_personas):
    sc = devops_personas
    offline_pn.agents.register(name=sc.agent, owner=sc.owner, sponsor=sc.sponsor,
                               scenario=sc.key).provision()
    with offline_pn.task(subject=sc.negative, task_id="INC-1", scenario=sc.key, actor=sc.agent) as t:
        d = t.check(action="runbooks:read", resource="runbooks-api:/runbooks/db-failover")
        assert d.allow is False and d.needs_approval is False   # negative persona: hard deny

def test_approve_then_revoke(offline_pn, fake_control_plane, devops_personas):
    sc = devops_personas
    offline_pn.agents.register(name=sc.agent, owner=sc.owner, sponsor=sc.sponsor,
                               scenario=sc.key).provision()
    action, resource = "runbooks:read", "runbooks-api:/runbooks/db-failover"
    with offline_pn.task(subject=sc.owner, task_id="INC-1", scenario=sc.key, actor=sc.agent) as t:
        deleg = t.request_delegation(action=action, resource=resource, reason="INC-1", ttl=300)
        fake_control_plane.approve_delegation(deleg.id, approver=sc.approver)
        assert t.check(action=action, resource=resource).allow is True
        offline_pn.revoke(deleg.id, reason="closed")
        assert t.check(action=action, resource=resource).allow is False     # revocation race
```

```bash
pytest test_governance.py -q
# ...                                                                  [100%]
# 3 passed
```

## Why test offline

- **Fast and hermetic.** Each test gets a clean `FakeControlPlane`; no fixtures to tear down, no
  flaky network.
- **Same semantics as production.** The fake is **deny-by-default** and fail-closed — anonymous
  denies, the negative persona hard-denies, missing delegation needs-approval, revocation flips
  back to deny — so a green offline suite reflects the real contract.
- **Seeded personas.** Tests use the shipped seed fixtures, so they exercise the same
  identities every example in these docs uses and never drift into invented users.

## In CI (the doc-test gate)

The same `offline()` mode powers the docs **doc-test** gate: every code snippet in
these docs is executed in `offline()` and must pass, so the examples can never silently rot. Run
the shipped examples as smoke tests the same way:

```bash
python examples/offline_quickstart.py
python examples/deepagents_runbook_governance.py     # gate logic runs even without the extra
```

## Related

- [Quickstart](/docs/getting-started/quickstart/) — the API under test.
- [Multi-scenario agent](/docs/develop/recipes/multi-scenario-agent/) — fan out across scenarios in tests.
- [Security model](/docs/concepts/security-model/) — the invariants these tests pin down.
