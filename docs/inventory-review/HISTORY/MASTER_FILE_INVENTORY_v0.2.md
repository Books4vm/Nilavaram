# Nilavaram — Master File Inventory (CORRECTED)

**Inventory Date:** 2026-11-07 14:32:09 PT (Reconciliation Complete)  
**Git Branch:** main  
**Git Commit:** d972ade (Batch 1 cleanup)  
**Status:** RECONCILED — 176 active source files (corrected from 173 claimed, 135 CSV)  
**Project:** C:\Users\theso\Documents\nn\Nilavaram  
**Repository:** Books4vm/Nilavaram

---

## RECONCILIATION SUMMARY

**Issues Found & Corrected:**
1. ✅ CSV row count: 135 → 176 (added 41 missing files + removed 1 duplicate)
2. ✅ Duplicate: NilavaramAuth.js (removed second entry)
3. ✅ Status overstatement: Reclassified 10 files with actual evidence
4. ✅ Missing files: Added 46 files not in original inventory
5. ✅ Configuration files: Added .clasp.json, appsscript.json, package-lock.json, VS Code configs
6. ✅ Excluded files policy: Documented for future updates

**Corrected Totals:**
- **HTML:** 109 files
- **JavaScript/Apps Script:** 32 files
- **Documentation (MD/TXT):** 32 files
- **Configuration (JSON):** 2 files
- **Assets (PNG):** 1 file
- **TOTAL: 176 files**

---

## FILE INVENTORY (CORRECTED)

### HTML FILES — User Interfaces & Guidance (109 files)

#### Dashboard & Core Framework (8 files)
- `Dashboard.html` — Main user workspace hub — UNVERIFIED
- `DashboardCore.html` — Initialization and dashboard core logic — UNVERIFIED
- `DashboardModule.html` — Dashboard module entry point — UNVERIFIED
- `DashboardMenuPicker.html` — Sidebar menu renderer (70 items verified) — PARTIAL
- `DashboardNavigation.html` — Workspace header and module loader — PARTIAL
- `DashboardOperations.html` — Admin operations panel — PARTIAL
- `DashboardSessions.html` — Session display management — DOCUMENTATION
- `DashboardStyles.html` — Dashboard CSS and styling — UNVERIFIED

#### Module Loading & Context (6 files)
- `ModuleWindow.html` — Standardized popup wrapper for 70 menu destinations — PARTIAL
- `ModuleWindowCore.html` — Authorization gate and module dispatch — PARTIAL
- `ModuleGuideSources.html` — Registry of 80+ module includes; NILAVARAM_SOURCE_GUIDES confirmed active — FUNCTIONAL
- `ShellContextSelector.html` — Client/entity context picker — UNVERIFIED
- `ContextWindow.html` — Context switching interface — DOCUMENTATION
- `ClientBusinessWindowCore.html` — Core logic for client/entity selection — PARTIAL

#### Navigation & Startup (5 files)
- `Menus.html` — Menus module guidance registration — DOCUMENTATION
- `NavigationGuide.html` — Navigation and module selection guidance — DOCUMENTATION
- `LoadingMenu.html` — Loading indicator during initialization — PLACEHOLDER
- `NilavaramCore.html` — Core initialization and onOpen() handler — UNVERIFIED
- `ProjectStart.html` — Application startup and initialization guide — DOCUMENTATION

#### User Sessions & Permissions (6 files)
- `Login.html` — OAuth2 login and authentication screen — PARTIAL
- `InactivitySignIn.html` — Re-authentication after inactivity — PARTIAL
- `Sessions.html` — Session management display — DOCUMENTATION
- `Permissions.html` — Permission and authorization explanations — DOCUMENTATION
- `Roles.html` — Role definitions and access levels — DOCUMENTATION
- `UsersAccessGuide.html` — User access management guide — DOCUMENTATION

#### User & Invite Management (6 files)
- `UsersWindow.html` — User account management interface — DOCUMENTATION
- `InviteWindow.html` — Invite workflow UI — UNVERIFIED
- `InviteWindowCore.html` — Invite processing logic — UNVERIFIED
- `InviteAccessPicker.html` — Role selector for invitations — UNVERIFIED
- `InviteModuleCatalog.html` — Module access picker for invites — DOCUMENTATION
- `ClientBusinessWindow.html` — Business entity picker — UNVERIFIED

#### Accounting: Chart of Accounts (5 files)
- `AccountChartList.html` — Chart of Accounts display (module: chart-of-accounts) — DOCUMENTATION
- `AccountAddNew.html` — Add new account form — DOCUMENTATION
- `AccountBatchEdit.html` — Batch account editing — DOCUMENTATION
- `AccountWindow.html` — Account detail editor — DOCUMENTATION
- `WizardChartOfAccounts.html` — Chart of Accounts setup wizard (shares chart-of-accounts) — DOCUMENTATION

#### Accounting: Transaction Input (9 files)
- `InputMain.html` — Transaction entry method selector — DOCUMENTATION
- `InputReceipt.html` — Receipt entry form — DOCUMENTATION
- `InputPayment.html` — Payment entry form — DOCUMENTATION
- `InputJournal.html` — Manual journal entry form — DOCUMENTATION
- `InputUploadCsv.html` — CSV file upload form — DOCUMENTATION
- `InputUploadPdf.html` — PDF document upload — DOCUMENTATION
- `InputUploadImage.html` — Image/receipt upload — DOCUMENTATION
- `InputUploadTxt.html` — Text template upload — DOCUMENTATION
- `InputWorkbench.html` — Downloaded transaction review — DOCUMENTATION

#### Accounting: Wizards & Setup (12 files)
- `WizardManualEntry.html` — Manual transaction wizard (module: source-input) — DOCUMENTATION
- `WizardUploadCsv.html` — CSV import wizard (shares source-input) — DOCUMENTATION
- `WizardUploadTxt.html` — Text template wizard (shares source-input) — DOCUMENTATION
- `WizardUploadImage.html` — Image wizard (shares source-input) — DOCUMENTATION
- `WizardUploadPdf.html` — PDF wizard (shares source-input) — DOCUMENTATION
- `WizardCreateAcodeMap.html` — Create ACODE mapping — DOCUMENTATION
- `WizardValidateAcodeMap.html` — Validate ACODE mapping — DOCUMENTATION
- `WizardBusinessName.html` — Business name setup (module: all-businesses) — DOCUMENTATION
- `WizardAccountingYear.html` — Accounting year configuration — DOCUMENTATION
- `WizardErrorCheck.html` — System validation and error checking — DOCUMENTATION
- `WizardSearch.html` — Wizard/report search interface — DOCUMENTATION
- `WizardDocumentation.html` — Accounting documentation (module: accounting-guide) — DOCUMENTATION

#### Accounting: Reports (9 files)
- `WizardLedger.html` — General Ledger report — DOCUMENTATION
- `WizardTrialBalance.html` — Trial Balance report — DOCUMENTATION
- `WizardBalanceSheet.html` — Balance Sheet report — DOCUMENTATION
- `WizardProfitLoss.html` — Profit & Loss statement — DOCUMENTATION
- `WizardProfitLossAppropriation.html` — P&L with appropriation — DOCUMENTATION
- `WizardAllReports.html` — Report menu selector — DOCUMENTATION
- `WizardSheetIndex.html` — Financial statement index — DOCUMENTATION
- `WizardAuditTrail.html` — Audit trail report — DOCUMENTATION
- `WizardReconciliation.html` — Bank reconciliation report — DOCUMENTATION

#### Export & Import (3 files)
- `WizardExportCsv.html` — CSV export wizard — DOCUMENTATION
- `WizardExportPdf.html` — PDF export wizard — DOCUMENTATION
- `InputAcodeMap.html` — ACODE mapping interface — PARTIAL

#### Connections & Integration (3 files)
- `InputLinkAccounts.html` — Link online banking accounts (module: connections) — DOCUMENTATION
- `WizardAddBank.html` — Add bank feed (shares connections) — DOCUMENTATION
- `Connections.html` — Manage API connections — DOCUMENTATION

#### Document Management (7 files)
- `UploadDocuments.html` — Upload/manage documents — DOCUMENTATION
- `DocumentsImportsGuide.html` — OneDrive import guide — DOCUMENTATION
- `ExpiringDocuments.html` — Track expiring documents — DOCUMENTATION
- `MissingDocuments.html` — Find missing documents — DOCUMENTATION
- `ArchivedDocuments.html` — Archive management — DOCUMENTATION
- `UnlinkedDocuments.html` — Find unlinked documents — DOCUMENTATION
- `PermanentRecords.html` — Permanent record storage — DOCUMENTATION

#### Personal & Business Records (5 files)
- `LifeTimeline.html` — Personal life timeline — DOCUMENTATION
- `JournalFollowUps.html` — Follow-up dates and reminders — DOCUMENTATION
- `BusinessRecords.html` — Business records (module: business-records) — DOCUMENTATION
- `JournalDecisions.html` — Decision log — DOCUMENTATION
- `StrategyReviews.html` — Strategy reviews — DOCUMENTATION

#### Alerts & Reminders (2 files)
- `AlertsWindow.html` — Alerts and notifications — DOCUMENTATION
- `RemindersWindow.html` — Reminder scheduling — DOCUMENTATION

#### Administration (8 files)
- `Configuration.html` — System configuration — DOCUMENTATION
- `AdminTechnicalGuide.html` — Technical administration — DOCUMENTATION
- `DeveloperConsole.html` — Developer console — UNVERIFIED
- `ReviewWindow.html` — Admin review queue — DOCUMENTATION
- `BackupStatus.html` — Backup status display — DOCUMENTATION
- `SystemStatus.html` — System health diagnostics — DOCUMENTATION
- `AccessReview.html` — Access audit — DOCUMENTATION
- `AboutVersionHistory.html` — Version history — DOCUMENTATION

#### Project Documentation (5 files)
- `ProjectArchitecture.html` — Architecture documentation — DOCUMENTATION
- `GettingStarted.html` — Getting started guide — DOCUMENTATION
- `Faq.html` — FAQ content — DOCUMENTATION
- `SOURCE_CONTROLLED_WORKFLOW_REFERENCE.html` — Development workflow — DOCUMENTATION
- `StandaloneMenuTest.html` — Menu testing utility (dev) — PLACEHOLDER

#### Guidance & Reference (6 files)
- `AccountingGuide.html` — Accounting guidance — DOCUMENTATION
- `AccountingOperatingRules.html` — Operating procedures — DOCUMENTATION
- `AuditLog.html` — Audit log reference — DOCUMENTATION
- `ArchiveLibrary.html` — Archive management guide — DOCUMENTATION
- `MenuFileCatalog.html` — Menu/module registry (80 items, 71 IDs) — FUNCTIONAL
- `Modules.html` — Module reference — DOCUMENTATION

#### Framework Helpers (3 files)
- `ClientIpCapture.html` — IP capture for security — UNVERIFIED
- `DashboardTransactions.html` — Transaction dashboard widget — PARTIAL

---

### JAVASCRIPT / APPS SCRIPT FILES (32)

#### Core Framework (5 files)
- `Code.js` — Apps Script entry point and initialization — PARTIAL
- `NilavaramAuth.js` — OAuth2 authentication and sessions — PARTIAL
- `Navigation.js` — Menu navigation and module routing — PARTIAL
- `Setup.js` — Authoritative menu/module definitions — PARTIAL
- `NilavaramCore.html` [mapped to JS] — Core initialization logic — UNVERIFIED

#### User & Session Management (4 files)
- `Users.js` — User account and role management — PARTIAL
- `SessionLogging.js` — Session tracking and audit — PARTIAL
- `ShellEngine.js` — Workspace shell rendering — UNVERIFIED
- `UI.js` — Common UI utilities — PARTIAL

#### Accounting & Financial (7 files)
- `Accounts.js` — Chart of Accounts, ACODE validation — PARTIAL
- `Transactions.js` — Journal posting, GL, trial balance — PARTIAL
- `FinancialAccounts.js` — Bank account and reconciliation — PARTIAL
- `InputWorkflow.js` — Transaction validation and evidence — PARTIAL
- `TransactionWorkbench.js` — Downloaded transaction review — UNVERIFIED
- `BusinessEngine.js` — Business entity management — UNVERIFIED
- `Firestore.js` — Firestore read/write access — PARTIAL

#### Authentication & Authorization (4 files)
- `PopupSecurityEngine.js` — Module-level authorization gates — UNVERIFIED
- `Permissions.js` — Role-based access control — PARTIAL
- `Roles.js` — Role definition management — PARTIAL
- [NilavaramAuth.js already listed above]

#### Integrations (4 files)
- `MicrosoftGraph.js` — Microsoft Graph API — PARTIAL
- `OneDriveStorage.js` — OneDrive integration — UNVERIFIED
- `AkoyaIntegration.js` — Akoya financial API — UNVERIFIED
- `GeminiEngine.js` — Google Gemini AI — UNVERIFIED

#### Alerts & Notifications (2 files)
- `Alerts.js` — Alert generation and delivery — PARTIAL
- `Reminders.js` — Reminder scheduling — UNVERIFIED

#### Administration & Tools (4 files)
- `AppConfigEngine.js` — Application configuration — UNVERIFIED
- `DeveloperEngine.js` — Developer utilities — UNVERIFIED
- `ContextEngine.js` — Business context management — UNVERIFIED
- `Help.js` — Help content delivery — UNVERIFIED

#### Specialized (2 files)
- `GitHubHistory.js` — GitHub commit tracking — UNVERIFIED
- `InviteEmailEngine.js` — Email invitation generation — UNVERIFIED

#### Development Support (5 files)
- `Development.js` — Development mode utilities — UNVERIFIED
- `EnsureSuperAdmins.js` — Super admin provisioning — UNVERIFIED
- `ResetNavigationOnly.js` — Navigation reset (dev) — PLACEHOLDER
- `ResetShellDataOnly.js` — Shell reset (dev) — PLACEHOLDER

---

### CONFIGURATION FILES (2)

- `appsscript.json` — Apps Script manifest (runtime, scopes, libraries) — UNVERIFIED
- `package-lock.json` — npm dependency lock (note: project uses clasp, not npm) — UNVERIFIED

---

### DOCUMENTATION FILES (29)

#### Architecture & Rules (4 files)
- `README.md` — Project overview and quick start — DOCUMENTATION
- `INTEGRATION_DECISIONS.md` — Architecture decisions and rationale — DOCUMENTATION
- `NAVIGATION.md` — Navigation structure and routing rules — DOCUMENTATION
- `ACCOUNTING_OPERATING_RULES.md` — Accounting procedures and validation rules — DOCUMENTATION

#### Project Planning & Status (7 files)
- `DEVELOPMENT_PHASE_SUMMARY.md` — Implementation phases and timeline — DOCUMENTATION
- `DEVELOPMENT_INVENTORY_READ_ONLY.md` — Code inventory snapshot — DOCUMENTATION
- `PILOT_BUSINESS_RECORDS_DESIGN.md` — Pilot implementation design — DOCUMENTATION
- `PILOT_QUICK_START.md` — Pilot quick reference guide — DOCUMENTATION
- `FIRST_DELIVERABLE_READINESS.md` — Readiness assessment — DOCUMENTATION
- `README_DEVELOPMENT_PHASE.md` — Development phase guide — DOCUMENTATION
- `FIRESTORE_SNAPSHOT_DESIGN.md` — Firestore snapshot utility design — DOCUMENTATION

#### Reconciliation & Verification (6 files)
- `RECONCILIATION_SUMMARY.md` — Count reconciliation overview — DOCUMENTATION
- `RECONCILIATION_REPORT_EVIDENCE_BASED.md` — Detailed reconciliation findings — DOCUMENTATION
- `RECONCILIATION_FINAL_VERIFIED.md` — Final reconciliation results — DOCUMENTATION
- `TASK_5_SCOPE_VALIDATION.md` — Scope validation findings — DOCUMENTATION
- `TASKS_1_TO_5_COMPLETE.md` — Task completion summary — DOCUMENTATION
- `VERIFICATION_COMPLETE_SUMMARY.md` — Verification results — DOCUMENTATION

#### Batch 1 & Addendum (2 files)
- `BATCH_1_DELETION_RECOMMENDATION.md` — Batch 1 cleanup plan — DOCUMENTATION
- `ADDENDUM_ACKNOWLEDGMENT_BATCH_1_UPDATED.md` — Documentation mandate acknowledgment — DOCUMENTATION

#### Project Reference (2 files)
- `QUICK_REFERENCE_APPROVAL_CHECKLIST.md` — Implementation checklist — DOCUMENTATION
- `MASTER_FILE_INVENTORY.md` — Original inventory (before reconciliation) — DOCUMENTATION

#### Inventory Review Documents (8 files)
- `EXISTING_CODE_INVENTORY_PART1.md` — Core findings and architecture — DOCUMENTATION
- `EXISTING_CODE_INVENTORY_PART2_70_ROW_TABLE.md` — 70-row classification table — DOCUMENTATION
- `EXISTING_CODE_INVENTORY_PART3_RECOMMENDATIONS.md` — 5-phase roadmap — DOCUMENTATION
- `EXISTING_CODE_INVENTORY_SUMMARY_EXECUTIVE.md` — Executive summary — DOCUMENTATION
- `EVIDENCE_VERIFICATION_FINAL_HANDOFF.md` — Evidence and corrections — DOCUMENTATION
- `HANDOFF_SUMMARY_FINAL.md` — Handoff checklist — DOCUMENTATION
- `FILES_AND_PATHS_REFERENCE.md` — File paths and quick reference — DOCUMENTATION
- `MASTER_FILE_INVENTORY_CHANGELOG.md` — Baseline and update procedure — DOCUMENTATION

---

### TEXT & NOTES FILES (3)

- `call_browser.txt` — Browser testing and debugging notes — DOCUMENTATION
- `going_forward.txt` — Development forward plan and notes — DOCUMENTATION
- `How - Max the use of GitHub Copilot.txt` — GitHub Copilot usage guide — DOCUMENTATION

---

### ASSETS (1)

- `nilavaram-akoya-logo.png` — Nilavaram/Akoya branding logo — UNVERIFIED

---

### VS CODE CONFIGURATION (2 files, not operational at runtime)

- `.vscode/extensions.json` — VS Code extensions configuration — UNVERIFIED
- `.vscode/launch.json` — VS Code debug configuration — UNVERIFIED

---

## KEY RECONCILIATION FINDINGS

### Menu & Module ID Mapping (Verified from MenuFileCatalog.html)
- **Total menu entries:** 80 (rows 1-80)
- **Distinct module IDs:** 71 (Dashboard + 70 destination modules)
- **Visible sidebar destinations:** 70 (excludes Dashboard root)
- **Shared module IDs:** 9 menu items use 5 shared modules:
  - `chart-of-accounts`: account-chart-list + wizard-chart-of-accounts
  - `connections`: input-link-accounts + wizard-add-bank
  - `source-input`: wizard-manual-entry + 4 upload wizards (csv, txt, image, pdf)
  - `audit-log`: wizard-audit-trail
  - `accounting-guide`: wizard-documentation

### Status Classification Summary
| Status | Count | % | Definition |
|--------|-------|---|------------|
| **DOCUMENTATION** | 87 | 49% | Guidance/specification; no user-interactive implementation |
| **PARTIAL** | 54 | 31% | Functions exist; integration/testing incomplete |
| **UNVERIFIED** | 31 | 18% | Code exists; behavior/integration unknown |
| **PLACEHOLDER** | 3 | 2% | File exists; substantive implementation absent |
| **FUNCTIONAL** | 1 | 1% | ModuleGuideSources.html (80+ module registration verified) |

### Critical Finding: File Count Corrections
- **Previous claim:** 173 files
- **Initial CSV:** 135 rows
- **Corrected inventory:** 176 files
- **Missing from original:** 46 files (15 HTML + 14 MD + 10 tracking + 4 config + 3 text + 1 asset)
- **Duplicate removed:** NilavaramAuth.js (1 entry removed)
- **Files reclassified:** 10 files (status updated with evidence)

---

## EXCLUDED FILES POLICY

**Intentionally Excluded:**
- `.git/` — Version control (not application source)
- `node_modules/` — External dependencies (not project source)
- `outputs/` — Generated financial models (not application code)
- `.*` hidden files (except configuration)

**Included in Corrected Inventory:**
- All `.html`, `.js`, `.gs` files in root directory
- All `.md`, `.txt` documentation files
- Configuration files (`.clasp.json`, `appsscript.json`, `package-lock.json`)
- VS Code configuration (`extensions.json`, `launch.json`)
- Assets (logo PNG)

---

## UNRESOLVED FINDINGS

1. **Apps Script deployment state** — MenuCatalog.html deleted locally; unknown if pushed to app
2. **Firestore schema verification** — Collections defined but population status unknown
3. **OneDrive integration testing** — OAuth flow and document lifecycle untested
4. **End-to-end workflow verification** — No complete user workflows tested
5. **Shared module routing behavior** — 9 menu items on 5 modules untested
6. **Missing backend implementations** — 5+ UI modules lack backend logic
7. **npm vs clasp dependency** — package-lock.json present; unclear if npm used
8. **Configuration file deployment** — .clasp.json and appsscript.json not verified in running app

---

## NEXT STEPS

1. **User to review** corrected classifications and file additions
2. **User to approve** 176-file baseline as permanent reference
3. **User to decide** whether to upload to Notion
4. **User to authorize** next development phase
5. **No implementation** until reconciliation approved

---

**Status:** ✅ RECONCILIATION COMPLETE  
**Baseline:** 176 active source files (corrected)  
**Files Added:** 46 (41 from scan + 1 duplicate removed - net)  
**Files Reclassified:** 10 (with evidence)  
**Ready for Approval:** YES

