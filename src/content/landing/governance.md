---
section: governance
eyebrow: Human approval across the surfaces
heading: Approval is a workflow, not a fourth product.
items:
  - >-
    Integrate: an agent raises a narrow request through the SDK with its identity, owner,
    task, action, resource, and requested duration.
  - >-
    Enforce: the Control Plane validates authority, holds the action, and applies an
    allow, deny, or approval-required decision fail closed.
  - >-
    Observe: the current self-hosted portal shows approval queues, history, posture, and
    audit context. Email-to-web approval is planned for Cloud Beta.
  - >-
    Approver-authority verification: PaloNexus verifies whether that human is authorized
    to approve this action for this resource — an approval click from the wrong person
    is not authority.
  - >-
    An authority graph behind every decision: human → role → resource ownership →
    delegation → agent → task → operation → resource → constraints → issued credential →
    recorded action.
  - >-
    Lifecycle-linked revocation: when an owner leaves, changes role, or a task closes,
    the delegations and credentials that depended on them are revoked automatically.
  - >-
    A verifiable authority trail: every action traces back to the agent, the accountable
    owner, the delegation, the approver's entitlement, the policy version, and the
    credential issued.
---

PaloNexus answers the question approval checkboxes skip — was this person entitled to grant
this authority? — so security teams can say yes to agents without handing out standing access.
