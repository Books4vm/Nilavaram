/**
 * Setup.js
 * One-time, repeatable creation of Nilavaram's initial Firestore records.
 */

const NILAVARAM_PRIMARY_ADMIN_EMAIL = 'mangai8100@gmail.com';
const NILAVARAM_INITIAL_ADMIN_EMAILS = [
  'mangai8100@gmail.com',
  'vm8100@gmail.com'
];
const NILAVARAM_NAVIGATION_VERSION = 19;

/**
 * Creates or refreshes the Firestore-driven navigation.
 *
 * @returns {Object}
 */
function setupNavigation_() {
  const menus = [
    { id: 'dashboard', label: 'Dashboard', description: 'Provides an overview of the selected business, pending work and recent activity.', order: 10, type: 'link', moduleId: 'dashboard', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'personal-life', label: 'Personal & Life', description: 'Organizes personal history, identity, education, work, business milestones and renewals.', order: 20, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'businesses', label: 'Businesses', description: 'Manages the businesses maintained in Nilavaram.', order: 30, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'assets-estate', label: 'Assets & Estate', description: 'Organizes properties, accounts, trusts, ownership and estate documents.', order: 40, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'security', label: 'Security', description: 'Controls users, roles, permissions and access monitoring.', order: 50, type: 'group', roles: ['admin'] },
    { id: 'transactions', label: 'Input', description: 'Records manual transactions, imports source files, reviews downloads, reconciles accounts and assigns ACODEs.', order: 60, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'accounting-wizard', label: 'Accounting Wizard', description: 'Guides setup, transaction input, validation, reporting, audit and export work in one place.', order: 65, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'accounting', label: 'Accounting', description: 'Contains bookkeeping, reconciliation and period-closing functions.', order: 70, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'contacts', label: 'Customers & Vendors', description: 'Manages buyers, suppliers, receivables and payables.', order: 80, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'private-journal', label: 'Private Journal', description: 'Keeps private decisions, strategy reviews and follow-up dates.', order: 90, type: 'group', roles: ['admin'] },
    { id: 'documents', label: 'Documents & Archive', description: 'Preserves available, missing, expiring and archived documents.', order: 100, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'tasks', label: 'Tasks', description: 'Collects alerts, reminders and follow-ups requiring attention.', order: 110, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'reports', label: 'Reports', description: 'Produces financial statements and supporting schedules.', order: 120, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'system', label: 'System', description: 'Contains technical configuration and application-management functions.', order: 130, type: 'group', roles: ['admin'] },
    { id: 'help', label: 'Help', description: 'Provides guidance for using Nilavaram and understanding its workflow.', order: 140, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] }
  ];

  const menuItems = [
    { id: 'life-timeline', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Life Timeline', description: 'Records life events and links available or missing documents.', moduleId: 'life-timeline', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'identity-immigration', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Identity & Immigration', description: 'Organizes identity, citizenship and immigration records.', moduleId: 'identity-immigration', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'education', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Education', description: 'Records education history and supporting documents.', moduleId: 'education', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'employment', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Employment', description: 'Records employment history and supporting documents.', moduleId: 'employment', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'business-milestones', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Business Milestones', description: 'Links important business events to business records.', moduleId: 'business-milestones', order: 50, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'renewals', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Renewals', description: 'Tracks documents and registrations requiring renewal.', moduleId: 'renewals', order: 60, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'all-businesses', menuId: 'businesses', parentId: 'businesses', level: 2, label: 'All Businesses', description: 'Lists active and inactive businesses and opens business-management actions.', moduleId: 'all-businesses', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'properties', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Properties', description: 'Records real estate and other significant property.', moduleId: 'properties', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'financial-accounts', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Financial Accounts', description: 'Records bank, investment, insurance and retirement accounts.', moduleId: 'financial-accounts', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'trusts-entities', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Trusts & Entities', description: 'Records trusts, entities, trustees and beneficiaries.', moduleId: 'trusts-entities', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'trust-owned-assets', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Trust-Owned Assets', description: 'Links assets to the ownership stated in trust and title documents.', moduleId: 'trust-owned-assets', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'estate-documents', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Estate Documents', description: 'Organizes estate-planning documents and instructions.', moduleId: 'estate-documents', order: 50, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'journal-decisions', menuId: 'private-journal', parentId: 'private-journal', level: 2, label: 'Decisions', description: 'Records private decisions with reasons and version history.', moduleId: 'journal-decisions', order: 10, enabled: true, roles: ['admin'] },
    { id: 'strategy-reviews', menuId: 'private-journal', parentId: 'private-journal', level: 2, label: 'Strategy Reviews', description: 'Reviews and updates private strategies over time.', moduleId: 'strategy-reviews', order: 20, enabled: true, roles: ['admin'] },
    { id: 'journal-follow-ups', menuId: 'private-journal', parentId: 'private-journal', level: 2, label: 'Follow-up Dates', description: 'Tracks dates for reconsidering private decisions.', moduleId: 'journal-follow-ups', order: 30, enabled: true, roles: ['admin'] },
    { id: 'chart-of-accounts', menuId: 'accounting', parentId: 'accounting', level: 2, label: 'Chart of Accounts', description: 'Adds, views and batch-maintains ACODEs.', moduleId: '', type: 'group', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'account-add-new', menuId: 'accounting', parentId: 'chart-of-accounts', level: 3, label: 'Add New', description: 'Creates one new ACODE using a simple guided form.', moduleId: 'account-add-new', order: 10, enabled: true, roles: ['admin', 'editor'] },
    { id: 'account-chart-list', menuId: 'accounting', parentId: 'chart-of-accounts', level: 3, label: 'Chart of Accounts', description: 'Displays the account list and opens individual Edit controls.', moduleId: 'chart-of-accounts', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'account-batch-edit', menuId: 'accounting', parentId: 'chart-of-accounts', level: 3, label: 'Batch Edit', description: 'Hides or restores multiple selected accounts together.', moduleId: 'account-batch-edit', order: 30, enabled: true, roles: ['admin'] },
    { id: 'input-main', menuId: 'transactions', parentId: 'transactions', level: 2, label: 'Main Menu', description: 'Opens the complete transaction-input workspace.', moduleId: 'input-main', order: 5, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'input-receipt', menuId: 'transactions', parentId: 'transactions', level: 2, label: 'Receipt', description: 'Records a manual receipt with supporting evidence.', moduleId: 'input-receipt', order: 10, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-payment', menuId: 'transactions', parentId: 'transactions', level: 2, label: 'Payment', description: 'Records a manual payment with supporting evidence.', moduleId: 'input-payment', order: 20, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-journal', menuId: 'transactions', parentId: 'transactions', level: 2, label: 'Journal', description: 'Records a balanced multi-row journal with evidence and audit notes.', moduleId: 'input-journal', order: 30, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-file-upload', menuId: 'transactions', parentId: 'transactions', level: 2, label: 'File Upload', description: 'Registers source files after the related account is selected.', moduleId: '', type: 'group', order: 40, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-upload-csv', menuId: 'transactions', parentId: 'input-file-upload', level: 3, label: 'CSV', description: 'Registers a CSV transaction batch for a selected account.', moduleId: 'input-upload-csv', order: 10, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-upload-pdf', menuId: 'transactions', parentId: 'input-file-upload', level: 3, label: 'PDF', description: 'Registers a PDF statement for a selected account.', moduleId: 'input-upload-pdf', order: 20, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-upload-image', menuId: 'transactions', parentId: 'input-file-upload', level: 3, label: 'Image', description: 'Registers receipt or invoice images for a selected account.', moduleId: 'input-upload-image', order: 30, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-upload-txt', menuId: 'transactions', parentId: 'input-file-upload', level: 3, label: 'Txt Template', description: 'Registers a structured text transaction batch.', moduleId: 'input-upload-txt', order: 40, enabled: true, roles: ['admin', 'editor'] },
    { id: 'input-download-files', menuId: 'transactions', parentId: 'transactions', level: 2, label: 'Download Files', description: 'Reviews automatically downloaded transaction sources.', moduleId: '', type: 'group', order: 50, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'input-workbench', menuId: 'transactions', parentId: 'input-download-files', level: 3, label: 'Workbench', description: 'Lists downloaded account batches for review and reconciliation.', moduleId: 'input-workbench', order: 10, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'input-link-accounts', menuId: 'transactions', parentId: 'input-download-files', level: 3, label: 'Link Online Accounts', description: 'Opens secure online-account connections.', moduleId: 'connections', order: 20, enabled: true, roles: ['admin'] },
    { id: 'input-acode-map', menuId: 'transactions', parentId: 'input-download-files', level: 3, label: 'ACODE Map', description: 'Reviews rule suggestions, assigns ACODEs and creates reusable rules.', moduleId: 'input-acode-map', order: 30, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-setup', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: 'Set Up', description: 'Defines the business, accounting period, accounts and opening balances.', moduleId: '', type: 'group', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-business-name', menuId: 'accounting-wizard', parentId: 'wizard-setup', level: 3, label: 'Business Name', description: 'Selects or maintains the business whose books are being prepared.', moduleId: 'all-businesses', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-accounting-year', menuId: 'accounting-wizard', parentId: 'wizard-setup', level: 3, label: 'Accounting Year', description: 'Sets the opening date, fiscal year and controlled reporting period.', moduleId: 'wizard-accounting-year', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-chart-of-accounts', menuId: 'accounting-wizard', parentId: 'wizard-setup', level: 3, label: 'Chart of Accounts', description: 'Opens the active Firestore Chart of Accounts.', moduleId: 'chart-of-accounts', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-opening-tb', menuId: 'accounting-wizard', parentId: 'wizard-setup', level: 3, label: 'Opening Trial Balance', description: 'Prepares and validates the balanced opening entry before transaction imports.', moduleId: 'wizard-opening-tb', order: 40, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-add-bank', menuId: 'accounting-wizard', parentId: 'wizard-setup', level: 3, label: 'Add Bank / Feed', description: 'Registers a bank account and its secure transaction-feed connection.', moduleId: 'connections', order: 50, enabled: true, roles: ['admin'] },
    { id: 'wizard-sheet-index', menuId: 'accounting-wizard', parentId: 'wizard-setup', level: 3, label: 'Source Sheet Index', description: 'Indexes statements, CSV files and other imported source batches.', moduleId: 'wizard-sheet-index', order: 60, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-input', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: 'Input', description: 'Collects manual and file-based source transactions outside the books.', moduleId: '', type: 'group', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-manual-entry', menuId: 'accounting-wizard', parentId: 'wizard-input', level: 3, label: 'Manual Entry - Single Transaction', description: 'Registers one transaction and its source evidence for validation.', moduleId: 'source-input', order: 10, enabled: true, roles: ['admin', 'editor'] },
    { id: 'wizard-file-upload', menuId: 'accounting-wizard', parentId: 'wizard-input', level: 3, label: 'File Upload - Multiple Transactions', description: 'Groups supported source-file choices without posting them automatically.', moduleId: '', type: 'group', order: 20, enabled: true, roles: ['admin', 'editor'] },
    { id: 'wizard-upload-csv', menuId: 'accounting-wizard', parentId: 'wizard-file-upload', level: 4, label: 'CSV File', description: 'Registers a bank or accounting CSV source batch.', moduleId: 'source-input', order: 10, enabled: true, roles: ['admin', 'editor'] },
    { id: 'wizard-upload-txt', menuId: 'accounting-wizard', parentId: 'wizard-file-upload', level: 4, label: 'Text Template', description: 'Registers a structured text-template source batch.', moduleId: 'source-input', order: 20, enabled: true, roles: ['admin', 'editor'] },
    { id: 'wizard-upload-image', menuId: 'accounting-wizard', parentId: 'wizard-file-upload', level: 4, label: 'Receipt / Invoice Image', description: 'Registers an image as transaction evidence.', moduleId: 'source-input', order: 30, enabled: true, roles: ['admin', 'editor'] },
    { id: 'wizard-upload-pdf', menuId: 'accounting-wizard', parentId: 'wizard-file-upload', level: 4, label: 'PDF File', description: 'Registers a PDF statement or supporting document.', moduleId: 'source-input', order: 40, enabled: true, roles: ['admin', 'editor'] },
    { id: 'wizard-create-acode-map', menuId: 'accounting-wizard', parentId: 'wizard-file-upload', level: 4, label: 'Create ACODE Map', description: 'Creates reusable source-description to account-code suggestions.', moduleId: 'wizard-create-acode-map', order: 50, enabled: true, roles: ['admin', 'editor'] },
    { id: 'wizard-validate-acode-map', menuId: 'accounting-wizard', parentId: 'wizard-file-upload', level: 4, label: 'Validate ACODE Map', description: 'Checks mapped account codes against the active Chart of Accounts.', moduleId: 'wizard-validate-acode-map', order: 60, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-reconciliation', menuId: 'accounting-wizard', parentId: 'wizard-input', level: 3, label: 'Reconciliation', description: 'Matches and arithmetically validates source records before posting.', moduleId: 'reconciliation-validation', order: 30, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-output', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: 'Output', description: 'Produces accounting ledgers, trial balances and financial statements.', moduleId: '', type: 'group', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-ledger', menuId: 'accounting-wizard', parentId: 'wizard-output', level: 3, label: 'General Ledger', description: 'Displays posted journal lines by account and date.', moduleId: 'wizard-ledger', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-trial-balance', menuId: 'accounting-wizard', parentId: 'wizard-output', level: 3, label: 'Trial Balance', description: 'Displays balanced debit and credit totals by account.', moduleId: 'wizard-trial-balance', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-profit-loss', menuId: 'accounting-wizard', parentId: 'wizard-output', level: 3, label: 'Profit and Loss', description: 'Reports income and expenses for the selected period.', moduleId: 'wizard-profit-loss', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-profit-loss-appropriation', menuId: 'accounting-wizard', parentId: 'wizard-output', level: 3, label: 'Profit and Loss Appropriation', description: 'Shows the controlled allocation of current-period results.', moduleId: 'wizard-profit-loss-appropriation', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-balance-sheet', menuId: 'accounting-wizard', parentId: 'wizard-output', level: 3, label: 'Balance Sheet', description: 'Reports assets, liabilities and equity as of a selected date.', moduleId: 'wizard-balance-sheet', order: 50, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-error-check', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: 'Error Check', description: 'Lists unbalanced, duplicate, unmapped, missing-evidence and reconciliation exceptions.', moduleId: 'wizard-error-check', order: 40, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-audit-trail', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: 'Audit Trail', description: 'Shows append-only accounting and administrative change history.', moduleId: 'audit-log', order: 50, enabled: true, roles: ['admin'] },
    { id: 'wizard-all-reports', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: '1-Click All Reports', description: 'Runs the complete validated reporting package for the selected period.', moduleId: 'wizard-all-reports', order: 60, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-export', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: 'Export', description: 'Exports approved data and reports in portable formats.', moduleId: '', type: 'group', order: 70, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-export-csv', menuId: 'accounting-wizard', parentId: 'wizard-export', level: 3, label: 'Export to CSV', description: 'Exports approved tabular accounting data.', moduleId: 'wizard-export-csv', order: 10, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-export-pdf', menuId: 'accounting-wizard', parentId: 'wizard-export', level: 3, label: 'Export to PDF', description: 'Exports approved financial reports as PDF files.', moduleId: 'wizard-export-pdf', order: 20, enabled: true, roles: ['admin', 'editor', 'reader'] },
    { id: 'wizard-utilities', menuId: 'accounting-wizard', parentId: 'accounting-wizard', level: 2, label: 'Utilities / Tools', description: 'Provides backup, documentation and search tools.', moduleId: '', type: 'group', order: 80, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-backup', menuId: 'accounting-wizard', parentId: 'wizard-utilities', level: 3, label: 'Back Up', description: 'Opens backup status and external-copy guidance.', moduleId: 'backup-status', order: 10, enabled: true, roles: ['admin'] },
    { id: 'wizard-documentation', menuId: 'accounting-wizard', parentId: 'wizard-utilities', level: 3, label: 'Documentation', description: 'Opens the accounting workflow and operating rules.', moduleId: 'accounting-guide', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'wizard-search', menuId: 'accounting-wizard', parentId: 'wizard-utilities', level: 3, label: 'Search', description: 'Searches transactions, account codes, evidence and audit references.', moduleId: 'wizard-search', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'archive-library', menuId: 'documents', parentId: 'documents', level: 2, label: 'Archive Library', description: 'Lists preserved documents and their metadata.', moduleId: 'archive-library', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'upload-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Upload Documents', description: 'Adds documents to approved cloud storage.', moduleId: 'upload-documents', order: 20, enabled: true, roles: ['admin', 'editor'] },
    { id: 'missing-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Missing / To Retrieve', description: 'Records expected documents that have not yet been located.', moduleId: 'missing-documents', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'expiring-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Expiring Documents', description: 'Lists documents approaching expiration or renewal.', moduleId: 'expiring-documents', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'unlinked-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Unlinked Documents', description: 'Shows documents not yet linked to a person, business, asset or trust.', moduleId: 'unlinked-documents', order: 50, enabled: true, roles: ['admin', 'editor'] },
    { id: 'archived-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Archived Documents', description: 'Retains inactive records for history and audit.', moduleId: 'archived-documents', order: 60, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'backup-status', menuId: 'documents', parentId: 'documents', level: 2, label: 'Backup Status', description: 'Shows planned and completed backup protections.', moduleId: 'backup-status', order: 70, enabled: true, roles: ['admin'] },
    { id: 'navigation-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Navigation Guide', description: 'Explains the menus available to the signed-in user.', moduleId: 'navigation-guide', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'project-foundation', menuId: 'help', parentId: 'help', level: 2, label: 'Project Foundation', description: 'Explains Nilavaram’s core purpose, privacy and archive principles.', moduleId: '', type: 'group', order: 15, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'project-start', menuId: 'help', parentId: 'project-foundation', level: 3, label: 'Project Start', description: 'Records the agreed core purpose of Nilavaram.', moduleId: 'project-start', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'nilavaram-core', menuId: 'help', parentId: 'project-foundation', level: 3, label: 'Core of Nilavaram', description: 'Explains the universal design and the current M family accounting profile.', moduleId: 'nilavaram-core', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'getting-started', menuId: 'help', parentId: 'help', level: 2, label: 'Getting Started', description: 'Introduces first login, business selection and dashboard basics.', moduleId: 'getting-started', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'users-access-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Users & Access', description: 'Explains invitations, roles and permissions.', moduleId: 'users-access-guide', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'accounting-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Accounting Guide', description: 'Explains Nilavaram accounting concepts and workflow.', moduleId: 'accounting-guide', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'accounting-operating-rules', menuId: 'help', parentId: 'help', level: 2, label: 'Accounting Operating Rules', description: 'Shows the locked transaction, posting, reconciliation, correction, storage and audit rules.', moduleId: 'accounting-operating-rules', order: 45, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'documents-imports-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Documents and Imports', description: 'Explains document storage and transaction imports.', moduleId: 'documents-imports-guide', order: 50, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'security-sessions-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Security & Sessions', description: 'Explains sign-in, access and session security.', moduleId: '', type: 'group', order: 60, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'inactivity-sign-in', menuId: 'help', parentId: 'security-sessions-guide', level: 3, label: 'Inactivity and Sign-in', description: 'Explains the planned inactivity warning and secure sign-in requirement.', moduleId: 'inactivity-sign-in', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'project-architecture', menuId: 'help', parentId: 'help', level: 2, label: 'Project Architecture', description: 'Explains where Nilavaram stores data, documents and source code.', moduleId: 'project-architecture', order: 70, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'faq', menuId: 'help', parentId: 'help', level: 2, label: 'Frequently Asked Questions', description: 'Collects common questions and answers.', moduleId: 'faq', order: 80, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'about-version-history', menuId: 'help', parentId: 'help', level: 2, label: 'About and Version History', description: 'Records important Nilavaram releases and changes.', moduleId: 'about-version-history', order: 90, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'alerts', menuId: 'tasks', parentId: 'tasks', level: 2, label: 'Alerts', description: 'Shows unread and reviewed administrative notifications.', moduleId: 'alerts', order: 10, enabled: true, roles: ['admin'] },
    { id: 'reminders', menuId: 'tasks', parentId: 'tasks', level: 2, label: 'Reminders', description: 'Shows private and shared reminders with planned notification schedules.', moduleId: 'reminders', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'configuration', menuId: 'system', label: 'Configuration', description: 'Maintains Nilavaram and business-level settings.', moduleId: 'configuration', order: 10, enabled: true, roles: ['admin'] },
    { id: 'system-status', menuId: 'system', label: 'System Status', description: 'Shows version, deployment and connection health.', moduleId: 'system-status', order: 20, enabled: true, roles: ['admin'] },
    { id: 'firestore', menuId: 'system', label: 'Firestore', description: 'Tests and diagnoses the Firestore connection.', moduleId: 'firestore', order: 30, enabled: true, roles: ['admin'] },
    { id: 'connections', menuId: 'system', label: 'Connections', description: 'Manages future online-service connections without displaying readable passwords.', moduleId: 'connections', order: 40, enabled: true, roles: ['admin'] },
    { id: 'modules', menuId: 'system', label: 'Modules', description: 'Enables or disables major Nilavaram features.', moduleId: 'modules', order: 50, enabled: true, roles: ['admin'] },
    { id: 'menus', menuId: 'system', label: 'Menu Management', description: 'Renames, reorders, enables or hides Firestore menu records.', moduleId: 'menus', order: 60, enabled: true, roles: ['admin'] },
    { id: 'project-development', menuId: 'system', parentId: 'system', level: 2, label: 'Project Development', description: 'Shows planned Nilavaram development work and assignments.', moduleId: '', type: 'group', order: 70, enabled: true, roles: ['admin'] },
    { id: 'pending-features', menuId: 'system', parentId: 'project-development', level: 3, label: 'Pending Features', description: 'Lists approved features that have not yet been completed.', moduleId: 'pending-features', order: 10, enabled: true, roles: ['admin'] },
    { id: 'admin-technical-guide', menuId: 'system', parentId: 'project-development', level: 3, label: 'Admin Technical Guide', description: 'Explains the development flow, commands and safe credential locations.', moduleId: 'admin-technical-guide', order: 20, enabled: true, roles: ['admin'] },
    { id: 'users', menuId: 'security', label: 'Users', description: 'Invites users and manages their roles and access.', moduleId: 'users', order: 10, enabled: true, roles: ['admin'] },
    { id: 'roles', menuId: 'security', label: 'Roles', description: 'Defines the available user roles.', moduleId: 'roles', order: 20, enabled: true, roles: ['admin'] },
    { id: 'permissions', menuId: 'security', label: 'Permissions', description: 'Defines what each role may see or change.', moduleId: 'permissions', order: 30, enabled: true, roles: ['admin'] },
    { id: 'sessions', menuId: 'security', label: 'Login Sessions', description: 'Shows available user-session information.', moduleId: 'sessions', order: 40, enabled: true, roles: ['admin'] },
    { id: 'access-review', menuId: 'security', label: 'Access Review', description: 'Supports periodic reviews of user access.', moduleId: 'access-review', order: 50, enabled: true, roles: ['admin'] },
    { id: 'audit-log', menuId: 'security', label: 'Audit Log', description: 'Records invitations, role changes and important actions.', moduleId: 'audit-log', order: 60, enabled: true, roles: ['admin'] }
  ];

  menus.forEach(function(menu) {
    firestoreSetDocument_('menus', menu.id, toFirestoreFields_({
      label: menu.label,
      description: menu.description,
      order: menu.order,
      enabled: true,
      type: menu.type,
      moduleId: menu.moduleId || '',
      roles: menu.roles
    }));
  });

  ['registry', 'administration'].forEach(function(menuId) {
    firestoreSetDocument_('menus', menuId, toFirestoreFields_({
      label: menuId === 'registry' ? 'Registry' : 'Administration',
      order: 999,
      enabled: false,
      type: 'group',
      moduleId: '',
      roles: ['admin']
    }));
  });

  firestoreSetDocument_('menuItems', 'new-transaction', toFirestoreFields_({
    menuId: 'transactions',
    parentId: 'transactions',
    level: 2,
    label: 'New Transaction (replaced)',
    description: 'Replaced by the controlled Transaction Workbench.',
    moduleId: 'new-transaction',
    order: 999,
    enabled: false,
    roles: ['admin', 'editor']
  }));

  menuItems.forEach(function(item) {
    firestoreSetDocument_('menuItems', item.id, toFirestoreFields_({
      menuId: item.menuId,
      parentId: item.parentId || item.menuId,
      level: item.level || 2,
      label: item.label,
      description: item.description,
      moduleId: item.moduleId || '',
      type: item.type || 'link',
      order: item.order,
      enabled: item.enabled,
      roles: item.roles
    }));
  });

  // These records belonged to the earlier four-step Transaction Workbench.
  // Firestore does not remove documents merely because they are no longer in
  // the current menu definition, so explicitly retire them to prevent the old
  // and new Input menus from being displayed together.
  [
    'transaction-workbench',
    'source-input',
    'reconciliation-validation',
    'account-rule-review',
    'manual-journal-entry'
  ].forEach(function(itemId) {
    firestoreSetDocument_('menuItems', itemId, toFirestoreFields_({
      menuId: 'transactions',
      parentId: 'transactions',
      level: 2,
      label: 'Retired Input Workflow Item',
      description: 'Replaced by the Input main menu and its organized submenus.',
      moduleId: '',
      type: 'link',
      order: 999,
      enabled: false,
      roles: ['admin', 'editor', 'reader', 'ltd'],
      retiredAt: new Date()
    }));
  });

  firestoreSetDocument_('system', 'navigation-config', toFirestoreFields_({
    version: NILAVARAM_NAVIGATION_VERSION,
    updatedAt: new Date()
  }));

  setupProjectIntentTasks_();
  setupInitialReminders_();
  setupAccountingFoundation_();
  setupTransactionFoundation_();

  return {
    menus: menus.length,
    menuItems: menuItems.length,
    navigationVersion: NILAVARAM_NAVIGATION_VERSION
  };
}

/**
 * Creates or refreshes the initial menus, menu items and Admins.
 *
 * @returns {Object}
 */
function setupNilavaram() {
  const navigation = setupNavigation_();
  const adminEmails = NILAVARAM_INITIAL_ADMIN_EMAILS.map(normalizeEmail_);
  adminEmails.forEach(function(adminEmail, index) {
    firestoreSetDocument_('users', adminEmail, toFirestoreFields_({
      email: adminEmail,
      displayName: index === 0 ? 'Primary Admin' : 'Admin',
      role: 'admin',
      allowedModules: [],
      status: 'active',
      invitedBy: NILAVARAM_PRIMARY_ADMIN_EMAIL,
      invitedAt: new Date(),
      updatedAt: new Date()
    }));
  });

  writeAudit_('initial-setup', NILAVARAM_PRIMARY_ADMIN_EMAIL, {
    role: 'admin',
    admins: adminEmails,
    menusCreated: navigation.menus,
    menuItemsCreated: navigation.menuItems
  });

  return {
    success: true,
    message: 'Nilavaram setup completed.',
    admins: adminEmails,
    menus: navigation.menus,
    menuItems: navigation.menuItems
  };
}
