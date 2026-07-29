# Nilavaram Accounting Operating Rules

Status: Approved and locked on 2026-07-28.

These rules define how accounting records must be handled. A later change may
extend them only through a recorded decision and must not silently weaken the
audit, balance, document or reconciliation controls.

## What each storage location means

- Google Apps Script runs the Nilavaram program.
- Firestore is the authoritative live accounting database. It stores
  transaction headers, journal lines, account assignments, reconciliation
  state, alerts, document metadata and audit history.
- `E:\nn\Nilavaram Data` stores local source documents, exports and backups.
  It is not the live database and Apps Script cannot directly read the drive.
- `E:\nn\Nilavaram Data\04 OneDrive Sync` is the approved source folder for
  the owner's file-sync application.
- OneDrive stores cloud copies of evidence files. A file copy does not become
  an accounting transaction until Nilavaram records and posts the transaction.

## Required transaction identity

Every transaction has:

- an immutable Firestore document ID;
- a human-readable transaction number;
- a schema version;
- the source, date, description, currency, entity and amount;
- an explicit draft, posted, corrected or locked state;
- reconciliation and document states that are separate from posting;
- creation and update users and timestamps.

The transaction ID is never reused. Import retries must reuse the same
idempotency key rather than create another accounting event.

## Required journal structure

The transaction header explains what happened. Separate journal-line records
explain the accounting effect.

- Each line belongs to exactly one transaction.
- Each line has a stable line ID and line number.
- Money is stored as integer cents to prevent binary-decimal rounding errors.
- Each line has either a debit or a credit amount, never both.
- Total debits must equal total credits before posting.
- Account IDs and codes come from the active Chart of Accounts.
- Reports will ultimately read posted journal lines, not descriptions or
  document folder names.

The header and all lines must be committed atomically. If any part fails,
Firestore must save none of them.

## Posting and reconciliation

- A valid balanced transaction posts immediately when the posting feature is
  enabled.
- Reconciliation is not a condition of posting.
- A posted but unreconciled transaction remains in reports and displays an
  unresolved reconciliation alert.
- Reconciliation marks the existing transaction; it does not create a second
  accounting event.
- Missing evidence is disclosed separately and does not silently remove a
  valid posted transaction.

## Corrections, locks and audit

- A posted transaction is never silently overwritten or deleted.
- A correction records the previous values, new values, reason, user and time.
- A material accounting correction uses reversing and replacement journal
  lines when that feature is implemented.
- Locked or closed-period transactions require a controlled reopening process.
- Audit records are append-only from the application workflow.

## Documents and duplicates

- Original documents remain on the external HDD and/or OneDrive according to
  the approved retention workflow.
- Firestore stores document metadata and links, not large file contents.
- Moving a local file does not change the journal.
- Unique transaction IDs, import idempotency keys and file hashes prevent
  duplicate posting and duplicate uploads.
- A same-date/same-amount warning is not proof of duplication; the user must
  review it before rejecting a legitimate repeated transaction.

## Safe user workflow

1. Preserve or receive the source document.
2. Record what happened once.
3. Select or approve the entity and accounts.
4. Review debit, credit, date and amount.
5. Post the balanced entry.
6. Resolve red document and reconciliation alerts later.
7. Correct through the controlled correction workflow, never by replacing
   Firestore records or deleting files manually.

## Locked source-to-books workflow

These additional rules were approved on 2026-07-28:

1. A downloaded or imported source record remains outside the books until it
   is matched to an existing posted transaction or approved and categorized
   as a new transaction.
2. External evidence is the preferred source. Each bank, card, CSV, PDF or
   image input records its source, external reference, evidence name, file
   hash and unique source-record ID.
3. Manual accounting input is permitted only through a Journal Entry. A manual
   or correction Journal Entry requires evidence details and an audit note.
4. Reconciliation is mandatory input validation. It checks source balances,
   source activity, matches, duplicates, missing items and agreement with the
   books.
5. Reconciliation is complete only when:

       Adjusted external balance - Adjusted book balance = $0.00

6. A non-zero difference, duplicate, missing proof, incomplete account
   assignment or unresolved match is a red review alert. The system must not
   silently force a balance.
7. An accounting correction is a new, traceable Journal Entry. The UI must
   advise core members to obtain a qualified CPA's review for a material or
   uncertain correction.
8. Account assignments may be suggested from a previously approved rule, but
   the user must confirm or change the suggestion before posting.
9. Every decision retains its rule ID, rule version, match reason, suggested
   accounts, confidence, approver, approval time, whether it was changed and
   the reason for the change.
10. A green check means the recorded control passed. A red alert means review
    is required; it never means approval.
11. Posting is transaction-by-transaction and immediate after all mandatory
    input controls pass. A pending reconciliation must remain clearly
    disclosed and must never be described as complete.

## Implementation status

- Step 1 — permanent transaction header and journal-line structure: completed.
- Step 2 — immediate balanced posting with active-account revalidation and
  idempotent retry protection: completed.
- Step 3 — expanded append-only accounting audit history: next.
