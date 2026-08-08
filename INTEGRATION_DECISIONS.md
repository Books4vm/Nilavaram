# Nilavaram Transaction and Document Integration Decisions

Status: Approved and locked on 2026-07-28.

These requirements may be extended through a later recorded decision, but they
must not be silently weakened or removed during implementation.

## Transaction processing

- Process every transaction individually and update the current output
  immediately. Batch import is an intake convenience only; every imported row
  becomes an individually identified transaction.
- Post every valid, balanced transaction even when reconciliation or a
  supporting document is pending.
- Display unresolved reconciliation, coding, document, upload and integration
  conditions as prominent red alerts. Reports must disclose these exceptions.
- Use a unique transaction ID and a content hash/idempotency record to prevent
  duplicate posting and duplicate document uploads.
- Never silently overwrite a posted transaction. Corrections must preserve the
  prior values, user, timestamp and reason in an append-only audit history.

## System responsibilities

- Google Apps Script runs the Nilavaram application code.
- OneDrive is the authoritative file backend for downloaded/imported source
  transactions, annual source-data files, statements, evidence, exports and
  backups. Source files are separated by account and calendar/tax year.
- Firestore is restricted to essential structured controls: the Chart of
  Accounts, users and permissions, compact OneDrive indexes, durable drive/item
  references, rules, locks, posting controls and essential audit metadata. It
  must not retain a second working copy of every downloaded source row after a
  verified OneDrive migration.
- External evidence is registered by durable metadata: source-record ID,
  document name, external/cloud reference and file hash. File contents remain
  on the approved external HDD/OneDrive storage path.
- OneDrive and SharePoint store the actual evidence files, statements, receipts,
  invoices, scans, exports and backups. Google Drive may be used for approved
  complementary storage and backups.
- The authoritative VS Code and Git working copy remains
  `C:\Users\theso\Documents\nn\Nilavaram`. `E:\nn\Nilavaram` is an external
  backup copy and must not be used concurrently as a second Git working copy.
- Local documents, exports and backups use the separate
  `E:\nn\Nilavaram Data` tree. The file-sync source for manual OneDrive
  synchronization is `E:\nn\Nilavaram Data\04 OneDrive Sync`; private data
  must not be placed inside either Git repository.
- Firestore stores only the essential Microsoft drive ID/item ID index needed
  to locate linked files; each annual OneDrive file also contains its own
  manifest and SHA-256 verification value.
  Accounting relationships and reports must not depend on a Windows path or
  visible OneDrive folder name.
- Moving or renaming a OneDrive document must not change its transaction link or
  accounting output. Missing access must create an alert without deleting the
  retained metadata or accounting record.
- A storage location may be updated separately with an audit record; moving a
  file never changes a journal line, account assignment or financial report.

## Microsoft integration

- Use Microsoft Graph for direct cloud access. Desktop synchronization is
  optional and must not be required.
- Use the approved Nilavaram Apps Script production `/exec` address recorded in
  `README.md` as the Microsoft Entra Web redirect URI.
- Do not use `thesolarcpa@outlook.com` as a Nilavaram document repository. The
  owner has reserved that account because approximately 67 percent of its 1 TB
  capacity is already used.
- Use `vmurugan@hotmail.com` as the approved primary OneDrive repository
  candidate. Microsoft account storage showed 0.2 GB used out of 1 TB on
  2026-07-28, leaving approximately 999.8 GB available.
- The owner has maintained and paid for one Microsoft 365 Family subscription
  covering all six family accounts for approximately three to four years and
  intends to continue it. Treat this as a continuing storage foundation, while
  still monitoring renewal status, sharing status and quota.
  Activation still requires the owner to authenticate and grant Microsoft
  Graph access; Nilavaram must then confirm and monitor the quota automatically.
- Support the owner's OneDrive and explicitly approved shared OneDrive folders.
  Request additional Microsoft consent or administrator approval when required.
- Use a SharePoint document library as the preferred long-term team repository.
- Track storage usage and warn an Admin before OneDrive, SharePoint or Google
  Drive capacity becomes insufficient. The warning must tell the Admin to free
  space or purchase/add capacity.
- Preserve recoverable workflow states when Microsoft Graph or Firestore is
  temporarily unavailable. A retry must not create a duplicate transaction or
  duplicate file.

## Safe cross-service sequence

1. Create an identified input record.
2. Upload or register the evidence file and calculate its hash.
3. Store the Microsoft drive ID, item ID and file metadata.
4. Validate balanced journal lines and post the transaction.
5. Refresh reports immediately.
6. Retain reconciliation and document exceptions as red alerts until resolved.
7. Record each state change in the audit history.

OneDrive/SharePoint and Firestore cannot participate in one atomic transaction.
The implementation must therefore use durable intermediate states and safe,
idempotent retries.
