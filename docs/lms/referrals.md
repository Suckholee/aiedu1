# Personal referral codes

Migration `202610190010` issues a stable, unique `NP-` + 12 uppercase hex character code to each existing profile and defaults a new code for future identities. Issuance uses a transaction advisory lock with collision retries; existing codes are immutable. The operation does not change identities, roles, contact preferences, fees, held seats or past orders.

Members see and copy their code or `/apply?ref=CODE` share link at `/my-profile`. Codes are personal attribution identifiers, not login credentials. Both application forms accept an optional referral code. Authenticated same-origin code lookup returns a masked name only, never contact details or member IDs. The application command carries the code through both platform compatibility and native LMS APIs.

The service-only application RPC validates an active referrer, rejects self-referral and invalid codes, allocates capacity, creates the order and writes `lms_referrals` in the same transaction. One order has at most one immutable attribution snapshot. Duplicate requests preserve the original attribution; a code cannot be appended to an existing unassigned order. Cancellation retains history; reapplication creates a new order and can have a different referrer. No referral discounts, rewards, commissions, payments or notifications are created.

Admin member management shows personal codes. CRM/order lists and details show the referral code and referrer snapshot, searchable together with customer details. Referrers do not receive access to referred learners' personal records. Anonymous reads and direct client writes remain denied.

Validation: `npm run test:lms-referrals` covers issuance/backfill, future member codes, immutability, self/invalid/inactive codes, transaction rollback, duplicate requests, historical reapplications, fee/seat preservation and RLS. Test application input without submitting an actual application in the production browser.
