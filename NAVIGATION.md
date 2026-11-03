# Nilavaram Navigation

Nilavaram stores navigation records in Firestore, allowing authorized changes
to names, order, visibility and nesting. A down arrow opens a menu and an up
arrow closes it. The interface should normally use no more than three levels.

## Menu data and action contract

### Locked product requirement: self-service guidance

Every user-facing popup must explain its purpose, data displayed, available
actions, permission differences, confidentiality rules and the result of
saving or revoking a change. Guidance must appear inside the popup before the
user performs the action; users must not need a trainer or support team to
understand the basic workflow. Administrators may provide additional
explanation, but administrator assistance is not a substitute for in-product
documentation.

This requirement applies to every current and future menu, including forms,
sharing dialogs, upload screens, reports, connections, accounting workflows
and destructive or irreversible actions. Use short headings, numbered steps,
plain language, warnings before sensitive actions and clear success/error
messages. Keep the guidance synchronized with the actual permission checks and
workflow behavior.

Every destination follows the same pattern: the server checks the signed-in
user, client, business, role and module permission; the page then reads current
records from Firestore or an approved integration. Each page should expose only
the actions allowed by the user's role and should record important changes in
the audit log.

| Menu | Dynamic data source | Helpful actions |
|---|---|---|
| Dashboard | Firestore status, tasks, accounting summaries and authorized access catalog | Search accessible businesses, select context, open detail, refresh |
| Personal & Life | Firestore personal-record metadata and protected document references | Add, edit, link evidence, mark missing, renew, view history |
| Businesses | Firestore clients and business entities | Add, edit, deactivate, reactivate, select, view related records |
| Assets, Liabilities & Supporting Records | Firestore metadata plus authorized OneDrive evidence links | Add, edit, search, link owner, attach evidence, view history |
| Security | Firestore users, roles, permissions, sessions and audits | Invite, change role, disable/reactivate, review access, inspect audit |
| Transactions | Firestore drafts and indexes; connected imports through approved APIs | Enter, upload, validate, categorize, reconcile, approve, post |
| Accounting | Firestore chart of accounts, journals and controls | Add/edit accounts, open balances, reconcile, close, review |
| Customers & Vendors | Firestore contact, invoice, bill and balance records | Add, edit, search, record activity, review receivable/payable status |
| Private Journal | Firestore records protected by owner and allowed-user rules | Add, edit, schedule follow-up, review history; no broad sharing |
| Documents & Archive | Firestore metadata and protected OneDrive document references | Upload, link, search, mark missing, renew, archive, open authorized file |
| Tasks | Firestore alerts, reminders and follow-ups | Add, assign, snooze, complete, filter by due date and status |
| Reports | Server-calculated accounting and operational records | Filter period, view, validate, export approved output, search |
| System | Firestore configuration and connection health; Apps Script status | Inspect status, manage approved settings, test connections, manage modules |
| Help | Versioned Firestore help content and approved project documentation | Search, expand guidance, view navigation and security instructions |

“Planned” or “partial” pages may display their current status instead of
pretending that a workflow is complete. A menu label is not a promise that its
data service has already been implemented.

## Dashboard

Summarizes the selected business, balances, pending work and recent activity.
The Dashboard also provides **My accessible businesses**, a server-filtered
search across every client and business the signed-in user may access. Selecting
an entry sets the working context without requiring the user to remember the
client name. The list contains only authorized IDs and names; it does not
reveal another client's records.

Dashboard data is read dynamically from Firestore and approved service
metadata. It should provide:

- **Open / View:** Opens a readable detail window for the selected context.
- **Refresh:** Re-reads current data rather than relying on stale browser data.
- **Search:** Finds an accessible client or business by name.
- **Use this business:** Sets the authorized client/business context and reloads
  the role-filtered menu.

For returning users, Nilavaram stores the last confirmed client, business and
accounting year as a server-validated default on the user's profile. At the
next login, the system restores that default only if the user still has access
and the records are still active. First-time users must complete the normal
selection steps. The **Change client / business** popup remains available at
any time and saving a new selection replaces the default.

Summary totals must be calculated by server-side accounting services from
approved records. The interface must not invent totals when a service is not
implemented.

## Personal & Life

Organizes the owner's history and the documents that support it.

- **Life Timeline:** Records personal and family events.
- **Identity & Immigration:** Organizes identity, citizenship and immigration records.
- **Education:** Records education and certificates. The same authorized user
  may find permitted education records from each accessible business for
  convenience. This does not automatically disclose the records to every user
  in those businesses; explicit authorization or record sharing remains
  required. Users can share with selected authorized users and revoke that
  access when it is no longer needed.
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

### Financial Accounts detail

The Financial Accounts page is scoped to the selected client and business.
Firestore stores only metadata such as institution name, account label, account
type, currency, last four digits and a supporting-document reference. It must
never store passwords, security answers, access tokens or full account numbers.
The page provides:

- **Add New:** Creates a metadata record after server-side validation.
- **Edit:** Updates the selected record only within the authorized business.
- **Refresh:** Reloads the current records from Firestore.
- **Source reference:** Links the record to approved evidence metadata; the
  actual large document remains in OneDrive.
- **Audit:** Records create and update actions with the user and scoped record
  identifiers.
- **Manage sharing:** The owner can select active users who already have access
  to the same business and grant **View** or **Edit** permission. Saving the
  list revokes any user removed from the list. A newly invited user can be
  selected after that user becomes active and has business access.

The server checks the signed-in user, client access, business access, menu
permission and editor role before writes. Readers can view authorized records
but cannot add or modify them. Record-level sharing does not bypass the user's
normal client, business or module permission. Admins can manage sharing for
administrative recovery; they cannot use sharing to expose a business the
recipient is not already authorized to access.

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

User access is the primary navigation scope. A user who manages multiple
businesses should use Dashboard → **My accessible businesses** rather than
opening an unscoped repository view. Client, business, role and module checks
remain server-side; hiding a button is not an authorization control.

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

Documents are displayed through Firestore metadata and authorization-aware
links. OneDrive is the approved location for large evidence files. Nilavaram
must not list the entire central OneDrive repository to every user. A document
link is shown only when its metadata is associated with an authorized client,
business, user or workflow. Opening a document should use a short-lived,
server-created link or the existing protected application flow; passwords,
tokens and private repository paths are never displayed.

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
