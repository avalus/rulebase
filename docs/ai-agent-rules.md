# AI Agent Rules: Essentials and Markdown Examples

AI agent rules are explicit, reusable policies that guide how an agent plans, chooses tools, executes actions, and presents outputs. They complement prompts (intent) and tools (capability) by adding governance: consistency, safety, and quality.

## Why use rules (not just prompts and tools)

- Ensure consistent decisions and avoid prompt drift over time.
- Enforce safety/compliance (privacy, security, approvals) before actions run.
- Raise quality through minimum standards, checklists, and output structure.
- Scale behavior across agents/teams with versioned, testable policies.

## How rules fit into agent loops

- Attach to key phases: planning, tool selection, execution, and output.
- Evaluate conditions (inputs, context, risk) and decide to block, require, prefer, transform, or monitor.
- Produce audit logs for traceability and quality review.

## Rule formats

Rules can be expressed in different formats depending on the tool or framework: Markdown checklists, YAML/JSON policies, or domain-specific DSLs. This guide concentrates on Markdown for readability and portability.

## Markdown rules (short examples)

```markdown
# Coding Assistant – Safe Edits & Quality Gate

Scope: planning, tool_use, execution, output

Policies
- Edit only within `./src` and `./tests` directories.
- Prefer patch-based edits; avoid raw file writes.
- When code changes: add/update tests; run tests and report results.
- Keep changes minimal and aligned with existing style; avoid unrelated edits.
- Explain errors and fixes clearly; include commands to reproduce.

Auditing
- Log changed files, reasoning, and references (tickets/PRs) for review.
```

```markdown
# Support Agent – Tone & Completeness

Scope: output

Policies
- Use empathetic, concise language; avoid jargon; define acronyms.
- Provide step‑by‑step resolution, a safe workaround, and a safety note.
- Include one vetted link and clear next steps; ask one clarifying question if info is missing.

Quality Gates
- Structure replies: Summary → Steps → Link → Next steps → Confirmation.
```

## Common enforcement actions

- Block: stop disallowed or risky actions.
- Require: add prerequisites (tests, approvals, confirmations).
- Prefer: bias toward safer/approved tools and workflows.
- Transform: sanitize or reformat outputs (mask PII, enforce structure).
- Monitor: allow but log, alert, or route for review.

## Where rules help beyond coding

- Data analysis: enforce anonymization and aggregation before sharing outputs.
- Customer support: ensure tone, completeness, and safe guidance.
- Marketing: match brand voice, add disclaimers, avoid unsupported claims.
- Compliance/legal: constrain advice to general info; require citations.
- DevOps/SRE: require dry‑run, change ticket, and output recording.
- Education/tutoring: ask clarifying questions; teach stepwise; verify understanding.

## Designing effective rules

- Keep rules atomic with clear scope and intent.
- Attach rules to concrete events/conditions in the agent loop.
- Nudge first (prefer/require), block when necessary.
- Test rules and collect telemetry; iterate with evidence.
- Version policies and document rationale.

## Summary

Rules make AI agents reliable: prompts set direction and tools enable action, while rules ensure consistent, safe, high‑quality behavior. Although many formats exist, Markdown rules offer a simple, portable way to encode and share policies across diverse agents and domains.