# Nilavaram Navigation

Nilavaram stores navigation records in Firestore, allowing authorized changes
to names, order, visibility and nesting. A down arrow opens a menu and an up
arrow closes it. The interface should normally use no more than three levels.

## Dashboard

Summarizes the selected business, balances, pending work and recent activity.

## Personal & Life

Organizes the owner's history and the documents that support it.

- **Life Timeline:** Records personal and family events.
- **Identity & Immigration:** Organizes identity, citizenship and immigration records.
- **Education:** Records education and certificates.
- **Employment:** Records work history and supporting documents.
- **Business Milestones:** Includes important businesses as life events.
- **Renewals:** Tracks documents and registrations that expire.

## Businesses

Manages the businesses maintained in Nilavaram.

- **All Businesses:** Lists active and inactive businesses. Its page will
  provide Add, Edit, Deactivate, Reactivate and safe Delete actions.

## Assets, Liabilities & Supporting Records

Organizes assets, liabilities, ownership, business governance records and
references to supporting documents. Large files remain in approved external
storage; Firestore retains essential metadata, links, permissions and audit
information.

This is an expandable left-menu group. Each item below is a separate clickable
destination; the group does not open a combined tabbed popup.

- **Properties:** Records real estate and significant physical property.
- **Financial Accounts:** Records bank, investment, retirement and other financial accounts.
- **Entities & Ownership:** Records businesses, entities and ownership relationships.
- **Owned Assets:** Links assets to the owner identified in source documents.
- **Borrowings & Liabilities:** Records loans, credit balances, notes payable and related evidence.
- **Estate & Planning Records:** Organizes estate, succession, beneficiary and planning records.
- **Business & Governance Records:** Organizes board, shareholder, member and trustee minutes, resolutions and related records.

## Security

Controls invitations, users, roles and access monitoring.

- **Users**
  - **Invitations:** Invites a Google account and assigns access.
  - **Active Users:** Manages current users, roles and permissions.
  - **Disabled Users:** Reviews or reactivates disabled accounts.
- **Roles & Permissions:** Defines what each role may see or change.
- **Login Sessions:** Shows available user-session information.
- **Access Review:** Supports periodic permission reviews.
- **Audit Log:** Records invitations, role changes and important actions.

## Transactions

Handles transaction entry, file imports, review and posting.

- **Data Entry:** Records receipts, payments and journal entries.
- **File Upload:** Imports CSV, PDF, image and text-template source files.
- **Downloaded Transactions:** Reviews transaction records received from connected accounts or imported sources.
  - **Review Downloaded Transactions:** Reviews downloaded account batches before reconciliation and further processing.
  - **Link Online Accounts:** Opens secure online-account connections.
  - **ACODE Map:** Reviews rule suggestions, assigns ACODEs and creates reusable rules.

## Accounting

Contains bookkeeping, reconciliation and closing functions.

- **Accounting Year:** Sets the opening date, fiscal year and controlled
  reporting period.
- **Chart of Accounts:** Maintains Assets, Liabilities, Equity, Income and
  Expense accounts.
- **Opening Trial Balance:** Prepares and validates the balanced opening entry
  before transaction imports.
- **Journal:** Shows debit-and-credit accounting entries.
- **Reconciliation:** Compares Nilavaram balances with external statements.
- **Period Close:** Controls month-end and year-end closing.
- **Categorization Rules:** Suggests accounts for recurring transactions.

Detailed accounts remain inside the Chart of Accounts page:

```text
Assets → Current Assets → Bank Accounts → Main Bank — 7451
```

## Customers & Vendors

Manages buyers, suppliers and related balances.

- **Customers**
  - **Customer List:** Stores customer details.
  - **Accounts Receivable:** Tracks invoices, receipts and balances.
- **Vendors**
  - **Vendor List:** Stores supplier details.
  - **Accounts Payable:** Tracks bills, payments and balances.

## Private Journal

Provides an owner-private area for decisions and changing strategies.

- **Decisions:** Records a decision and its reasons.
- **Strategy Reviews:** Preserves later reviews and corrections.
- **Follow-up Dates:** Records when a decision should be reconsidered.

## Documents & Archive

Preserves available documents while tracking missing and expiring records.

- **Archive Library:** Lists preserved documents and their metadata.
- **Upload Documents:** Adds new documents.
- **Missing / To Retrieve:** Keeps expected documents visible until located.
- **Expiring Documents:** Shows documents approaching expiration or renewal.
- **Unlinked Documents:** Shows documents not connected to a transaction.
- **Archived Documents:** Retains inactive documents for history.
- **Backup Status:** Shows planned and completed backup protection.

## Tasks

Collects work requiring attention.

- **Alerts:** Shows important exceptions or warnings.
- **Reminders:** Shows items due on a date.
- **Follow-ups:** Tracks matters requiring further action.

## Reports

Produces financial statements and supporting schedules.

- **General Ledger:** Displays posted journal lines by account and date.
- **Trial Balance:** Displays balanced debit and credit totals by account.
- **Profit and Loss:** Reports income and expenses for the selected period.
- **Profit and Loss Appropriation:** Shows the controlled allocation of
  current-period results.
- **Balance Sheet:** Reports assets, liabilities and equity as of a selected
  date.
- **All Reports:** Runs the complete validated reporting package for the
  selected period.
- **Export:** Exports approved accounting data and reports in CSV or PDF.
- **Search Accounting Records:** Searches transactions, account codes,
  evidence and audit references.
- **Receivable Reports:** Customer Details and Receivable Aging.
- **Payable Reports:** Vendor Details and Payable Aging.
- **Closing Reports:** Reconciliation, Month-End Close and Year-End Close.

## System

Contains technical and application-management functions.

- **Configuration:** Maintains application and business settings.
- **System Status:** Shows version, deployment and connection health.
- **Firestore:** Tests and diagnoses Firestore connectivity.
- **Connections:** Manages future online-service connections without exposing
  readable passwords.
- **Modules:** Enables or disables major features.
- **Menu Management:** Renames, reorders, enables or hides menu records.
- **Project Development**
  - **Pending Features:** Displays approved development assignments, including
    the assignee, due date, status and requirements.
  - **Admin Technical Guide:** Explains the VS Code, clasp, Apps Script,
    Firestore and GitHub flow. It identifies credential locations and status
    without revealing secret values.

## Help

Provides expandable user guidance.

- **Project Foundation**
  - **Project Start:** Records Nilavaram's agreed purpose, privacy and archive principles.
  - **Core of Nilavaram:** Explains the universal current-status design and
    the M family accounting profile. It also explains that Income and Expense
    accounts remain available for other user profiles.
- **Navigation Guide:** Reads the visible Firestore navigation and explains the
  menus available to the signed-in user's role. Admins and Editors can correct
  its content; prior versions, audits and Admin alerts are retained.
- **Getting Started:** First login, business selection and dashboard basics.
- **Users & Access:** Invitations, roles and permissions.
- **Accounting Guide:** Transactions, accounts, reconciliation and reports.
- **Documents and Imports:** CSV, Excel, PDF and supporting-document workflows.
- **Security & Sessions**
  - **Inactivity and Sign-in:** Documents the planned 9-minute warning,
    10-minute session ending and required Google sign-in.
- **Project Architecture:** Explains the Firestore, Markdown, Google Docs,
  Google Sheets, OneDrive and GitHub storage responsibilities.
- **Frequently Asked Questions:** Common questions and answers.
- **About and Version History:** Releases and user-facing changes.

## Collapsed view

```text
Dashboard
↓ Personal & Life
↓ Businesses
↓ Assets, Liabilities & Supporting Records
↓ Security
↓ Transactions
↓ Accounting
↓ Customers & Vendors
↓ Private Journal
↓ Documents & Archive
↓ Tasks
↓ Reports
↓ System
↓ Help
```

Firestore hierarchy records use `parentId` and `level`. For example,
`all-businesses` has `parentId: "businesses"` and `level: 2`. Future third-level
records will use the submenu item as `parentId` and `level: 3`.
