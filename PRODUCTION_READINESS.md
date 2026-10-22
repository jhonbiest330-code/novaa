# NOVA Academy: production readiness gap analysis

**Current status: adult-facing demonstration, not production software for children.**

| System area | Existing pilot | Work still required before selling child access |
|---|---|---|
| Marketing and demo | Working buyer tour and demo navigation | Real sales site, published customer terms |
| Classroom | Structured demo lesson, visual navigation, answer checks | Full lesson state recovery, classroom-scale load testing, vetted content |
| AI voice | Realtime integration coded, secret on server, adult-only browser opt-in | End-to-end verified voice quality, reliability, usage monitoring, age-eligible provider access and privacy review |
| Curriculum | 128 curriculum outline entries; 8+ sample sequences | Complete instructional materials, full educator review and grade-specific validation |
| Accounts | Password-protected adult demo, optional evaluator usernames | Proper identity provider, password resets, MFA for staff, invitation expiry, role-based permissions |
| Multi-school isolation | None for real data (fictional shared content only) | PostgreSQL org-scoped storage, enforced row-level security and tests against cross-school access |
| Parent portal | Fictional dashboard | Verified guardian-child relationship, minimal real data, access logging, reporting controls |
| Payments | None | Manual invoices for pilots or approved gateway, hosted payments, server-side entitlements and renewals |
| Student records | Browser-only fictional state | Secure persistent database, controlled media storage, data export/retention/deletion and backups |
| Content studio | Guided/prepared demo experiences | Secure, approved AI provider integration, quotas, moderation and auditability |
| Privacy and safeguarding | Adult-only restrictions and notices | Jurisdictional legal review, parental/school authorization, provider age eligibility, data minimization, content safeguards and incident escalation |
| Hosting | Render-ready Node backend | Appropriate paid uptime, database, monitoring, disaster recovery, staging, metrics and tested rollback |
| Security | Demo-only Basic Auth and limited token minting | Real authentication, production-grade RBAC, tenant isolation, security reviews, abuse monitoring and secrets management |

## Proposed production architecture

- **Frontend**: existing NOVA UI refactored into accessible React components as needed; classroom and teacher/admin/parent experiences separated by role.
- **Backend**: Node/TypeScript API, explicit lesson state machine, validated AI action/tool calls, strong rate limits, audit logs and usage caps.
- **Authentication/database**: managed PostgreSQL and an identity provider, with tenant isolation enforced in every query and security rules at the database level (e.g. Supabase Auth + Postgres/RLS, if chosen).
- **Storage**: private buckets with signed URLs and retention controls for approved project outputs.
- **Billing**: school organizations, plan entitlements, concurrency and voice quotas enforced on the server; verified payment webhooks or verified manual invoicing.
- **Voice**: API credentials server-only. A live session must be teacher-authorized and must terminate reliably on stop, disconnection or quota exhaustion.
- **Content**: versioned educator-reviewed lesson manifests separate from model instructions. Static narration and interactive activities work even if OpenAI is unavailable.
- **Observability**: uptime alerts, AI usage and costs, errors, safety incident escalation, privacy-conservative logs, backups and recovery drills.

## Special requirement for children

OpenAI's under-18 API guidance says developers serving minors need additional safeguards. It says **do not use OpenAI services to process personal data of children under 13 or the applicable age of digital consent without first implementing Zero Data Retention**. Review https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance and applicable local laws. A single disclaimer, password, or parental checkbox does **not** make the platform compliant. Third-party creative APIs have separate requirements.

## Minimum proof before first paid school rollout involving minors

1. Verify privacy and legal obligations in the deployment market, school authorization and guardians where required.
2. Implement legitimate staff/student/parent auth, account recovery and role/tenant security; test cross-school data isolation.
3. Author and review every lesson actually included in the sale. Require teacher approval for high-impact feedback.
4. Validate live conversation and interruptibility, offline fallbacks, microphone controls, cost quotas, and supported voice/model behavior with adult testers.
5. Test storage, progress persistence, backups, deletion, and school reporting accuracy end-to-end.
6. Conduct security, accessibility and child-safety reviews and document their results.
7. Confirm infrastructure costs and a realistic support SLA before making commercial promises.

## Business sequence

**Now:** Adult demos and interviews → scoped proposals → build the missing platform → small supervised/compliant school pilot → documented outcome evaluation → licensed school expansion → parent portal as part of the school service.
