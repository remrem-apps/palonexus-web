---
title: Temporary elevation walkthrough
description: End-to-end guide — an agent acting on behalf of its owner is denied a regulated runbook, requests a task-scoped delegation, an authorized approver approves, the read succeeds, and access is audited then revoked. Copy-pasteable, runs offline.
sidebar:
  order: 8
---

This is the canonical, copy-pasteable walkthrough of **temporary, task-scoped elevation** on a
**regulated** asset — the end-to-end governed flow (register → deny → approve → succeed) of the
`devops-incident` scenario. An AI agent acts **on behalf
of its owner** (who can deploy services but deliberately lacks `runbooks:read`), is denied the
regulated DB-failover runbook, opens a time-boxed delegation request, an **authorized approver**
approves it, the privileged read succeeds for one task, and every hop is recorded on a
tamper-evident audit chain — then access returns to zero.

Every Python snippet on this page runs against `PaloNexus.offline()` — no cluster, no network —
using the seeded sample-organization fixtures (no invented users). It is the doctest-trimmed companion
to the [Quickstart](/docs/getting-started/quickstart/), the [LangGraph adapter](/docs/sdk/langgraph/),
and [Authority delegation](/docs/develop/delegations-and-approvals/).

:::note[What this demonstrates]
**Deny-by-default**, **just-in-time (JIT) elevation** instead of standing secrets, and
**audit-by-construction**. The agent never holds more authority than the human it represents,
and the elevation is a named human decision, on the record.
:::

## Scenario narrative

The sample organization's site-reliability-engineering (SRE) team wants an incident-triage agent that pulls logs, compares deployments,
and — when an incident is bad enough — reads the **regulated DB-failover runbook** to propose a
remediation. That runbook (`runbooks-api:/runbooks/db-failover`, `dataClass: regulated`) is
exactly the asset that must **not** be standing access for a bot.

The arc, in brief:

1. **Build** — a developer registers `northstar-devops-incident-agent` with a mandatory
   owner and sponsor.
2. **Run** — the agent triages a sample incident (`INC-4821` in the code below): `logs:read`, `deployments:compare` succeed, because
   the owner genuinely holds those scopes. The agent only ever borrows the owner's real authority.
3. **Denied** — the agent reaches for the runbook (`runbooks:read`). `/authz` returns
   **deny / needs-approval** — the owner doesn't hold `runbooks:read`, so neither can the agent.
4. **Elevate** — the agent opens a **task-scoped delegation request**, bounded to the incident task.
5. **Approve** — an authorized approver approves in the portal, qualifying on both gates:
   holding `org:agents:approve` **and** covering the DevOps domain (separation of duties — the
   owner does not self-approve).
6. **Succeed** — with the time-boxed delegation, the agent re-calls `runbooks:read`; `/authz`
   now allows it and the agent reads the failover procedure.
7. **Audit** — the tamper-evident chain shows request → deny → delegation → approval → the single
   privileged read; every hop carries the on-behalf-of subject.
8. **Revoke** — the delegation expires (or is revoked); the next `runbooks:read` denies again.

## Personas and the regulated asset

Stable enterprise subject is the **`employeeId`** (`NST-####`), deterministic across re-seeds —
never the email. All hold org membership in `northstar-corp`. See the
[glossary](/docs/getting-started/glossary/) for the identity and access management (IAM) acronyms.

| Role | Subject | Seeded email | Authority |
|---|---|---|---|
| **Owner** | `NST-1011` | ethan.park@northstar.example | On-behalf-of subject (holds `deployments:*`, **not** `runbooks:read`) |
| **Sponsor + Approver** | `NST-1002` | maya.chen@northstar.example | `org:agents:approve`, covers DevOps |
| **Operator** | `NST-1012` | arjun.mehta@northstar.example | Runs the scenario day to day |
| **Auditor** | `NST-1003` | omar.haddad@northstar.example | Approve authority covers Security only |
| **Negative persona** | `NST-1018` | claire.evans@northstar.example | No scopes; must be hard-denied |
| **Developer** | `NST-1026` | julian.smith@northstar.example | Builds + registers the agent |

**The two-gate approval rule** (`authority.py::decide`): an approver must hold
`org:agents:approve`/`delegations:approve` **and** `covers_scenario` (hold ≥1 of the DevOps
scenario's resource scopes). Consequences worth showing live:

- **The approver approves** ✅ — holds `org:agents:approve` *and* `runbooks:read` via the DevOps service-owner role.
- **The auditor is denied as approver** ❌ — holds `org:agents:approve` but only covers **Security** →
  `outside_scenario_domain:devops-incident`. The auditor can only **audit**.
- **The negative persona is denied everything** ❌ — no scopes; invariant-enforced to never hold `org:agents:*`.

The regulated asset under test:

| Attribute | Value |
|---|---|
| Resource identifier | `runbooks-api:/runbooks/db-failover` |
| `requireScope` | **`runbooks:read`** |
| `dataClass` | **`regulated`** |
| Control-plane enforcer | `runbooks-operator` |
| Incident context | `INC-4821` |

## Developer walkthrough

**Install** (lean core; framework bindings are extras):

```bash
pip install 'palonexus[langgraph]'   # add ,langchain / ,test as needed
```

**Configure** — `from_env()` reads the `PALONEXUS_*` vars; unset values fall back to local-dev
defaults. See [Configuration & environment](/docs/sdk/config-env/) for the full list.

<!-- no-doctest: live-only — these exports target a real cluster (offline uses PaloNexus.offline()) -->
```bash
export PALONEXUS_CONTROL_PLANE_URL=http://localhost:9191   # /authz decision point
export PALONEXUS_MGMT_URL=http://localhost:8181            # registry + /v1/audit
export PALONEXUS_IDP_URL=http://localhost:8090             # agent-idp
export PALONEXUS_API_KEY=pn_live_…                         # sent as bearer
export PALONEXUS_TENANT_ID=7gdgqfu5j0oo                    # seeded sample-org tenant id
export PALONEXUS_OFFLINE=1                                 # in-memory FakeControlPlane, no cluster
```

The shape of the flow is always the same four moves inside a bound **task**:
`check` (deny) → `request_delegation` (pending) → *human approve* → `authorize` (allow). The
typed error tree makes it possible to catch exactly the case that matters:

<!-- no-doctest: illustrative fragment — uses `task` from a neighbouring block (not standalone-runnable) -->
```python
from palonexus import ApprovalRequired, PolicyDenied, ControlPlaneUnavailable

try:
    task.authorize(action="runbooks:read",
                   resource="runbooks-api:/runbooks/db-failover")
except ApprovalRequired as e:        # 401 + needs-approval -> drive request_delegation / interrupt
    deleg = task.request_delegation(action="runbooks:read",
                                    resource="runbooks-api:/runbooks/db-failover",
                                    reason="INC-4821", ttl=300)
except PolicyDenied as e:            # 403 hard deny — no path forward (e.reason / e.decision)
    ...
except ControlPlaneUnavailable:      # decision point down — FAIL CLOSED, never a silent allow
    raise
```

The full tree: `PaloNexusError` (base) → `GovernanceError`, `PolicyDenied`, `ApprovalRequired`,
`DelegationExpired`, `CredentialRevoked`, `IdentityNotProvisioned`, `ControlPlaneUnavailable`.

## Python SDK example

The whole lifecycle in one runnable block:
`register → provision → check (denied) → request_delegation → approve (out of band) →
authorize → audit.tail → revoke → cascade`. This runs against `PaloNexus.offline()` exactly as
written.

```python
from palonexus import PaloNexus, ApprovalRequired, GovernanceError

AGENT = "northstar-devops-incident-agent"
OWNER = "ethan.park@northstar.example"
SPONSOR = "maya.chen@northstar.example"
NEGATIVE = "claire.evans@northstar.example"
ACTION = "runbooks:read"
RESOURCE = "runbooks-api:/runbooks/db-failover"
TASK = "INC-4821"

with PaloNexus.offline() as pn:
    # 0) Governance guard — a missing sponsor is rejected client-side, before any network call.
    try:
        pn.agents.register(name=AGENT, owner=OWNER, sponsor="", scenario="devops-incident")
    except GovernanceError as e:
        print("0) governance guard:", e)

    # 1) Register (mandatory owner + sponsor) and provision a did:key.
    agent = pn.agents.register(name=AGENT, owner=OWNER, sponsor=SPONSOR,
                               scenario="devops-incident", risk_tier="high")
    identity = agent.provision()
    print("1) provisioned:", identity.did)

    with pn.task(subject=OWNER, task_id=TASK, scenario="devops-incident", actor=AGENT) as task:
        # 2) Deny-by-default: the owner does not hold runbooks:read, so neither does the agent.
        assert task.check(action=ACTION, resource=RESOURCE).needs_approval
        try:
            task.authorize(action=ACTION, resource=RESOURCE)
        except ApprovalRequired as e:
            print("2) authorize raised:", repr(e.reason))

        # 3) Open a task-scoped, time-boxed delegation request (pending).
        deleg = task.request_delegation(action=ACTION, resource=RESOURCE,
                                        reason=f"{TASK} db failover", ttl=300)
        print("3) request_delegation:", deleg.id, deleg.status)

        # 4) The approver approves. Offline this drives the in-memory control plane; in
        #    production the approver clicks Approve in the /approvals console
        #    (separation of duties — not the owner).
        approved = pn._fake.approve_delegation(deleg.id, approver=SPONSOR)

        # 5) Retry: the approved, time-boxed delegation lets the privileged read through.
        assert task.authorize(action=ACTION, resource=RESOURCE).allow
        print("5) authorize allowed after approval")

    # 6) Negative persona: hard-denied for this scenario (no authority).
    with pn.task(subject=NEGATIVE, task_id=TASK, scenario="devops-incident", actor=AGENT) as bad:
        assert not bad.check(action=ACTION, resource=RESOURCE).allow
        print("6) negative persona (Claire) hard-denied")

    # 7) Tamper-evident audit chain for the task (every row carries the on-behalf-of subject).
    for ev in pn.audit.tail(task_id=TASK):
        print("7) audit:", ev.seq, ev.decision, ev.actor, ev.action)
    assert pn.audit.verify_chain()

    # 8) Revoke the grant — deny-by-default reasserts immediately.
    pn.revoke(approved.id, reason="incident closed")

    # 9) Cascade (tenant-scoped offline; SCIM-leaver scoping is subject= on a real cluster).
    print("9) cascade:", pn.revocation.cascade())
```

Representative offline output:

```text
0) governance guard: agent registration requires a business sponsor
1) provisioned: did:key:z6Mk…
2) authorize raised: 'needs human-approved delegation'
3) request_delegation: deleg-… pending
5) authorize allowed after approval
6) negative persona (Claire) hard-denied
7) audit: 1 deny northstar-devops-incident-agent runbooks:read
7) audit: 2 deny northstar-devops-incident-agent runbooks:read
7) audit: 3 allow northstar-devops-incident-agent runbooks:read
7) audit: 4 deny northstar-devops-incident-agent runbooks:read
9) cascade: {'delegations_revoked': 0, 'agents_suspended': 0, 'agents_quarantined': 0}
```

:::note[Offline vs. live reason strings]
The offline `FakeControlPlane` reports `needs human-approved delegation`; on a real cluster the
egress decision reports `no approved delegation` (and the control-plane fail-closed default is
`human-approved delegation required for regulated target`). All three mean the same thing — see
[Troubleshooting](/docs/develop/troubleshooting/) to decode any deny reason.
:::

## LangGraph example

The same flow as a governed LangGraph node with a human-in-the-loop (HITL) `interrupt()` →
approve → `Command(resume=...)`. **A durable checkpointer + `thread_id` are required** —
without them `interrupt()` cannot pause and resume. This is the shipped
`examples/langgraph_runbook_hitl.py`, runnable with no network. For the full adapter reference
see [LangGraph adapter](/docs/sdk/langgraph/).

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command
from typing_extensions import TypedDict
from palonexus import PaloNexus
from palonexus.langgraph import governed_node

RUNBOOKS = {"db-failover": "1. Fail over to the standby primary.\n2. Verify replica lag is zero."}
AGENT = "northstar-devops-incident-agent"
OWNER = "ethan.park@northstar.example"
APPROVER = "maya.chen@northstar.example"

class TriageState(TypedDict, total=False):
    runbook_name: str
    runbook_steps: str
    triage_plan: str

pn = PaloNexus.offline()
agent = pn.agents.register(name=AGENT, owner=OWNER, sponsor=APPROVER, scenario="devops-incident")
agent.provision()

@governed_node(pn, action="runbooks:read",
               resource=lambda s: f"runbooks-api:/runbooks/{s['runbook_name']}")
def read_runbook(state: TriageState) -> dict:
    # Runs ONLY after /authz allows (after the delegation is approved).
    return {"runbook_steps": RUNBOOKS[state["runbook_name"]]}

def propose(state: TriageState) -> dict:
    return {"triage_plan": f"Follow runbook:\n{state.get('runbook_steps', '(none)')}"}

graph = (StateGraph(TriageState)
         .add_node("read_runbook", read_runbook)
         .add_node("propose", propose)
         .add_edge(START, "read_runbook")
         .add_edge("read_runbook", "propose")
         .add_edge("propose", END)
         .compile(checkpointer=MemorySaver()))     # durable checkpointer required for HITL

config = {"configurable": {"thread_id": "INC-4821"}}

with pn.task(subject=OWNER, task_id="INC-4821", scenario="devops-incident", actor=AGENT):
    # 1) First pass: deny-by-default -> the node interrupts for approval.
    out = graph.invoke({"runbook_name": "db-failover"}, config)
    assert "__interrupt__" in out
    payload = out["__interrupt__"][0].value["palonexus"]
    print(f"[interrupt] needs approval: {payload['action']} on {payload['resource']}")

    # 2) Human approval, out-of-band. Offline this drives the in-memory control plane;
    #    in production the approver clicks Approve in the portal.
    pending = pn._fake.open_delegations(OWNER)
    pn._fake.approve_delegation(pending[0].id, approver=APPROVER)
    print(f"[approve ] {APPROVER} approved delegation {pending[0].id}")

    # 3) Resume: the node re-checks, is now allowed, and reads the runbook.
    out = graph.invoke(Command(resume=True), config)

print("[done    ]", out["runbook_steps"].splitlines()[0])
pn.close()
```

```text
[interrupt] needs approval: runbooks:read on runbooks-api:/runbooks/db-failover
[approve ] maya.chen@northstar.example approved delegation deleg-…
[done    ] 1. Fail over to the standby primary.
```

On a needs-approval decision, `governed_node` auto-starts `request_delegation` (idempotent across
interrupt/resume) and `interrupt()`s; the interrupt payload carries
`{action, resource, delegation_id, subject, task}` under the `palonexus` key for the approver UI.

## Temporary elevation flow

Each step → SDK call → underlying API → the real policy decision and audit deltas.

| # | Step | SDK call | API call | Decision / reason (real) |
|---|---|---|---|---|
| 1 | **Initial check — denied** | `task.check(action, resource)` | `POST /authz` (`X-Palonexus-On-Behalf-Of`, `-Actor`, `-Action`, `-Resource`) | **401** · `X-Palonexus-Needs-Approval: true` · `X-Palonexus-Deny-Reason: no approved delegation` → `PolicyDecision(allow=False, needs_approval=True)` |
| 2 | **Request delegation** | `task.request_delegation(..., ttl=300)` | `POST /v1/delegations/request` | **201** · `Delegation(status="pending")`; `notAfter = now + ttl` |
| 3 | **Approver approves → Verifiable Credential (VC) minted** | portal / `pn._fake.approve_delegation(id, approver=)` | `POST /v1/delegations/{id}/approve {"approver":"maya.chen@…"}` (authority `org:agents:approve`) | **200** · `status=approved`, `vcJti`, `notAfter` |
| 4 | **Retry authorize → allow** | `task.authorize(action, resource)` | `POST /authz` (identical headers) | **200** · `X-Palonexus-Subject: ethan.park@…` → `PolicyDecision(allow=True)`; audit `allow=true rule=inline` |
| 5 | **TTL expiry** | next `task.check(...)` after `notAfter` | `GET /v1/delegations/check` | live `{"ok":false,"reason":"delegation expired"}` → `PolicyDecision(expired=True)` → `authorize` raises `DelegationExpired`. Offline: fast-forward with `pn._fake.advance(seconds)` to prove the same revert deterministically |
| 6 | **Revoke** | `pn.revoke(delegation, reason=)` | `POST /v1/revoke {"vcJti": …}` | **200** · stays denied across restore |
| 7 | **Next check — denied again** | `task.check(action, resource)` | `POST /authz` | **401**/**403** — back to deny-by-default |
| (opt) | **Cascade** | `pn.revocation.cascade()` | `POST /v1/revocation/cascade` | `{delegations_revoked, agents_suspended, agents_quarantined}` |

On a live cluster the audit chain stays intact across the whole deny→approve→succeed→revoke
lifecycle: `GET /v1/audit/verify → {"ok":true,"brokenAtSeq":0}`.

### Proving expiry and approver authority offline

The two time-and-authority guarantees — *only the right human may approve* (AC-6) and *access is
temporary* (AC-7) — are enforced by `PaloNexus.offline()`, so they can be proven with no cluster.
`pn._fake.advance(seconds)` fast-forwards the delegation clock; `may_approve` runs the two-gate rule:

```python
from palonexus import PaloNexus, DelegationExpired, GovernanceError

AGENT = "northstar-devops-incident-agent"
OWNER, APPROVER = "ethan.park@northstar.example", "maya.chen@northstar.example"
AUDITOR = "omar.haddad@northstar.example"   # holds org:agents:approve for Security, not DevOps
ACTION, RESOURCE, TASK = "runbooks:read", "runbooks-api:/runbooks/db-failover", "INC-4821"

with PaloNexus.offline() as pn:
    pn.agents.register(name=AGENT, owner=OWNER, sponsor=APPROVER, scenario="devops-incident").provision()
    with pn.task(subject=OWNER, task_id=TASK, scenario="devops-incident", actor=AGENT) as task:
        deleg = task.request_delegation(action=ACTION, resource=RESOURCE, reason=TASK, ttl=300)

        # AC-6: the auditor holds approve authority — but for the Security domain, not DevOps.
        try:
            pn._fake.approve_delegation(deleg.id, approver=AUDITOR)
        except GovernanceError as e:
            print("approver rejected:", e)          # outside_scenario_domain:devops-incident

        pn._fake.approve_delegation(deleg.id, approver=APPROVER)     # the approver qualifies on both gates
        assert task.authorize(action=ACTION, resource=RESOURCE).allow

        # AC-7: fast-forward past notAfter — access is temporary, so it reverts to deny.
        pn._fake.advance(301)
        try:
            task.authorize(action=ACTION, resource=RESOURCE)
        except DelegationExpired:
            print("access expired — re-approval required")
```

```text
approver rejected: omar.haddad@northstar.example may not approve delegation deleg-…: outside_scenario_domain:devops-incident
access expired — re-approval required
```

## Operational experience

### The approver — `/approvals`

The approver works the **Authority Delegation** console (`/approvals`). Set the **Approver** input (top-right,
persisted to `localStorage`) to the approver's seeded email (`maya.chen@northstar.example`) — that string is sent as `approver`
and lands in the delegation + audit record. Pending cards show the agent (`actorName`), a
**DataClassBadge** flagging the regulated tool, the action, resource, task id, reason, and
requested time. **Approve** → `POST /v1/delegations/{id}/approve` mints the Delegation VC
(`status: approved`, `vcJti`, `notAfter`). Active-credential cards show approved-by, VC jti, a
live **Expires** countdown, and a **Revoke** button. The mechanics live in
[Authority delegation](/docs/develop/delegations-and-approvals/).

### The auditor — `/audit`

The auditor reviews the **hash-chained, tamper-evident** decision log (`/audit`): filter by task id,
agent, or scenario; **Verify chain** reports *"Chain intact (N records)"* or
*"BROKEN at seq N"*; each row deep-links to its Tempo trace and exports to CSV/JSON. The
compliance framing is immutable: *who* (`subject=ethan.park`, on-behalf-of), *what*
(`action`/`resource`), *when*, *decision* (`allow`), *why* (`rule`+`reason`), *who approved*
(`approver=maya.chen`). `pn.audit.verify_chain()` is the same recomputation, and it still passes
after a backup/restore drill.

## Local and DOKS deployment

This page runs entirely offline. To watch the same deny → approve → succeed flow against real
services, follow the existing operations runbooks rather than re-deriving them here:

- [Docker Compose](/docs/operations/docker-compose/) — the no-cluster path. The compose
  `smoke.sh` asserts the decision trio (`allow` public / `deny` private /
  `needs-approval` regulated egress) using this exact canonical target.
- [DOKS runbook](/docs/operations/doks-runbook/) — zero-to-authority-bound-agent on `palonexus-doks`,
  the DigitalOcean Kubernetes Service (DOKS) cluster,
  including the `SecurityPolicy.extAuth` keystone and the deploy-then-validate sign-off.

:::caution[Live cluster runs `AGENT_IDENTITY_MODE=vc`]
On the live cluster an anonymous, header-only egress `curl` **fails closed at 403** (*"verified
agent credential required"*). The **401 + needs-approval** transition appears only once a verified
agent Verifiable Presentation (VP) is present (the egress-sidecar flow), or via the `/simulate`
dry-run. Mark the sensitive tool `dataClass: regulated` to force human-approved delegation via
Rego (the Open Policy Agent policy language).
:::

## Failure cases

The **two-code convention** (`authz.go serveEgress` + [Troubleshooting](/docs/develop/troubleshooting/)):
**401 + `X-Palonexus-Needs-Approval: true`** = needs-approval → SDK `ApprovalRequired`;
**403** = hard deny → SDK `PolicyDenied`. Both stamp `X-Palonexus-Deny-Reason` into the audit log.

| # | Case / trigger | Expected (HTTP · SDK error) | Coverage |
|---|---|---|---|
| 1 | Check before delegation | offline `needs_approval=True`; egress **401** needs-approval | ✅ |
| 2 | Authorize without approval | **401** → `ApprovalRequired` (`authorize` raises; `check` returns) | ✅ |
| 3 | Negative persona | offline hard deny **403** `…not authorized for scenario devops-incident` | ⚠️ offline-enforced; live control-plane scenario-authority hard-deny still via authority-preview (gap) |
| 4 | Delegation expired (TTL) | `check` `expired=True` → `authorize` raises `DelegationExpired` | ✅ offline (`pn._fake.advance`) + live |
| 5 | Delegation revoked mid-task | live StatusList re-check denies next call **403** → `CredentialRevoked` | ✅ |
| 6 | Register without owner/sponsor | `GovernanceError` before any network call | ✅ |
| 7 | Unreachable `/authz` | fail-closed → `ControlPlaneUnavailable` (never silent allow) | ✅ |
| 8 | Approver lacks authority / wrong domain | `approve_delegation` raises `GovernanceError` (`lacks org:agents:approve` / `outside_scenario_domain:…`); only the qualified approver may approve devops | ✅ offline (`may_approve` two-gate) + live |
| 9 | Wrong resource/scope mismatch | deny — must match the exact `(action, resource)` tuple | ✅ |
| 10 | Cascade / SCIM (System for Cross-domain Identity Management) leaver | all on-behalf-of (or tenant) delegations revoked; next call denies | ✅ |

:::note[Offline parity — what the fake now enforces]
The offline `FakeControlPlane` now models **TTL clock-expiry** (case 4 — fast-forward with
`pn._fake.advance(seconds)`; an expired grant reverts to deny and `authorize` raises
`DelegationExpired`) and **approver-authority on approve** (case 8 — `approve_delegation` runs the
two-gate `may_approve` rule, so only an `org:agents:approve` holder who covers the scenario domain
can approve). Covered by `tests/test_elevation_gaps.py`.

One asymmetry remains and is the opposite of a fake gap: the negative-persona hard-deny (case 3) is
**offline-enforced** but the *live* control plane currently relies on authority-preview rather than a
first-class scenario-authority hard-deny at `/authz`. That control-plane enhancement is tracked as a
build follow-up in Linear under PaloNexus.
:::

## Acceptance and cleanup

The acceptance slice for this flow (legend: ✅ implemented + tested · 🟡 partial / live-only):

| # | Criterion | Status |
|---|---|---|
| AC-1 | Agent identity minted (did:key + Membership VC, VP/call) | ✅ |
| AC-2 | Mandatory human ownership (owner + sponsor) | ✅ |
| AC-3 | Task-scoped delegation (exact `(action, resource)` tuple) | ✅ |
| AC-4 | Denied access surfaced clearly (no silent 500) | ✅ |
| AC-5 | Elevation request (`ttl`) creates a pending grant | ✅ |
| AC-6 | Approval by an authorized employee; others can't | ✅ two-gate `may_approve` enforced offline + live |
| AC-7 | Temporary (TTL) access; expiry denies | ✅ `notAfter` honored live; offline clock-expiry via `pn._fake.advance` |
| AC-8 | Enforcement at egress (same `/authz`; proxy floor) | ✅ |
| AC-9 | Audit hash-chained + verifiable; tamper detected | ✅ |
| AC-10 | Revocation — single | ✅ |
| AC-11 | Revocation — cascade / leaver | ✅ |
| AC-12 | Fail-closed everywhere | ✅ |

**Cleanup / reset.** Offline: a fresh seeded `FakeControlPlane` per test (the shipped pytest
fixture); `request_delegation` is idempotent per `(subject, action, resource)`, and
`revoke`/`cascade` reset the baseline. On-cluster: `nsr_seeder.cli cleanup --mode hard-reset` then
`reseed` (deletes only seed-owned records); the backup/restore drill is non-destructive.

## Next

- [Quickstart](/docs/getting-started/quickstart/) — the typed API this guide uses, one page.
- [LangGraph adapter](/docs/sdk/langgraph/) · [Authority delegation](/docs/develop/delegations-and-approvals/).
- [Recipes](/docs/develop/recipes/) — more runnable offline governance patterns.
- [Troubleshooting](/docs/develop/troubleshooting/) — decode any deny reason · [Glossary](/docs/getting-started/glossary/).
