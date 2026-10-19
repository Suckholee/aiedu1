# Member signup details and contact preferences

Migration `202610190009` extends existing Supabase profiles without changing member identities, roles, enrollment or financial records. Future identities require profile completion after Google/Kakao authentication. Existing members receive a reminder, retain access and can update `/my-profile` from the sidebar or account menu.

Required fields: name, Korean mobile phone, industry and privacy acknowledgement. Organization and job title are optional. Verified identity email remains server-owned. Phone normalization accepts hyphens/spaces and +82; collection does not verify ownership of the number.

The service Alimtalk preference and marketing consent are separate, optional and initially false. A member can save without opting into either, and withdraw later. The server stores consent version and timestamps; `lms_contact_consents` preserves opt-in/withdrawal history and never duplicates an unchanged retry. Clients cannot set consent timestamps, identity UUIDs, roles or another member's ID. Only the service-only RPC, called after server authentication and same-origin validation, can update the current member's details. Anonymous access and client writes remain closed.

`/admin/members` shows phone, industry, job, completion status and latest consent timestamps, with search and industry/completion/Alimtalk preference filters. Admin profile editing does not fabricate the member's contact preferences. The application form pre-fills saved contact details. Existing orders retain their historical customer details.

## Alimtalk status

The user has a Kakao channel, but no messaging delivery provider is connected. This change collects information and preferences; it sends no messages, makes no paid provider signup, and does not claim delivery is enabled. Activation still requires the channel identity, a chosen official delivery provider, server credentials stored in Production and approved informational message templates. A future sender must check the current active member, current service preference and current phone at dispatch, and implement idempotent event delivery. Marketing must not be sent using informational Alimtalk templates.

Official service guide: https://kakaobusiness.gitbook.io/main/ad/infotalk

## Validation

- `npm run test:lms-member-profile`: 42 SQL/validation/RLS checks, including preserving existing members, consent refusal/withdrawal, retries and rejected privilege fields.
- Existing signup/identity-bridge/transition checks.
- `npm run test:lms-http`: includes anonymous profile read/write and cross-origin rejection.
- `scripts/backup-lms-profiles.mjs` writes a private local snapshot. `scripts/audit-lms-member-profile.mjs <backup>` verifies existing identity/contact/role/order preservation without printing private data.
