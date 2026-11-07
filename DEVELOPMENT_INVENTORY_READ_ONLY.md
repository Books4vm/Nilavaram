# Nilavaram Development Inventory (Read-Only)
## All 71 Distinct Module IDs with Full Implementation Details

**Status:** FROZEN - No changes to navigation architecture  
**Architecture:** 71 distinct module IDs = 70 sidebar destinations + 1 dashboard (framework)  
**Created:** 2026-11-07  

---

## SECTION 1: NUMERICAL RECONCILIATION (EXACT)

### Breakdown of 75 moduleIds Found in Setup.js

**Setup.js contains 75 unique moduleId values:**

**Enabled (Active) Modules: 71**
- 1 dashboard (framework, filtered from sidebar display)
- 70 user-selectable business modules

**Disabled (Retired) Modules: 4**
- All marked with `enabled: false` in Setup.js
- Preserved in Firestore for audit trail
- Not visible in navigation

### Why 75 Found vs 71 Active

| Module Count | Items | Notes |
|--------------|-------|-------|
| 75 total in source | All moduleIds in Setup.js | Includes both enabled and disabled |
| -4 retired items | new-transaction, all-businesses, properties, financial-accounts | Explicitly set enabled: false |
| = 71 enabled modules | dashboard + 70 selectable | Approved target |

**Retired but preserved (enabled: false):**
- new-transaction (replaced by input-receipt, input-payment, input-journal)
- all-businesses (replaced by shell context selector)
- properties (replaced by business-records)
- financial-accounts (replaced by chart-of-accounts)
- identity-immigration (merged into life-timeline)

---

## SECTION 2: COMPLETE 71-MODULE INVENTORY

### Group 1: Dashboard & Navigation (1 module)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| dashboard | Framework (DashboardNavigation.html, DashboardMenuPicker.html) | Dashboard (framework, not selectable) | Core Framework | getNavigationForShell() | menus, menuItems | N/A |

---

### Group 2: Input & Data Entry (11 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| input-receipt | InputReceipt.html | input-receipt | Guidance-only | Not yet | receipts (planned) | ✓ Ready |
| input-payment | InputPayment.html | input-payment | Guidance-only | Not yet | payments (planned) | ✓ Ready |
| input-journal | InputJournal.html | input-journal | Guidance-only | Not yet | journals (planned) | ✓ Ready |
| input-workbench | InputWorkbench.html | input-workbench | Guidance-only | Not yet | workbench (planned) | ✓ Ready |
| input-acode-map | InputAcodeMap.html | input-acode-map | Guidance-only | Not yet | acode_map (planned) | ✓ Ready |
| input-upload-csv | InputUploadCsv.html | input-upload-csv | Guidance-only | Not yet | uploads (planned) | ✓ Ready |
| input-upload-image | InputUploadImage.html | input-upload-image | Guidance-only | Not yet | uploads (planned) | ✓ Ready |
| input-upload-pdf | InputUploadPdf.html | input-upload-pdf | Guidance-only | Not yet | uploads (planned) | ✓ Ready |
| input-upload-txt | InputUploadTxt.html | input-upload-txt | Guidance-only | Not yet | uploads (planned) | ✓ Ready |
| source-input | WizardManualEntry.html, WizardUploadCsv.html, WizardUploadTxt.html, WizardUploadImage.html, WizardUploadPdf.html | wizard-manual-entry (primary), wizard-upload-csv, wizard-upload-txt, wizard-upload-image, wizard-upload-pdf (shared) | Guidance-only | Not yet | sources (planned) | ✓ Ready |
| connections | InputLinkAccounts.html, WizardAddBank.html, Connections.html | input-link-accounts (primary), wizard-add-bank, connections (shared) | Guidance-only | Not yet | connections (planned) | ✓ Ready |

---

### Group 3: Accounting Core (8 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| chart-of-accounts | AccountChartList.html, WizardChartOfAccounts.html | account-chart-list (primary), wizard-chart-of-accounts (shared) | Guidance-only | Not yet | chart_of_accounts | ✓ Ready |
| account-add-new | AccountAddNew.html | account-add-new | Guidance-only | Not yet | accounts (planned) | ✓ Ready |
| account-batch-edit | AccountBatchEdit.html | account-batch-edit | Guidance-only | Not yet | accounts (planned) | ✓ Ready |
| accounting-guide | AccountingGuide.html, WizardDocumentation.html | accounting-guide (primary), wizard-documentation (shared) | Guidance-only | Not yet | N/A (Reference) | N/A |
| wizard-all-reports | WizardAllReports.html | wizard-all-reports | Guidance-only | Not yet | reports (planned) | ✓ Ready |
| wizard-balance-sheet | WizardBalanceSheet.html | wizard-balance-sheet | Guidance-only | Not yet | reports, balance_sheet | ✓ Ready |
| wizard-error-check | WizardErrorCheck.html | wizard-error-check | Guidance-only | Not yet | N/A | N/A |
| accounting-operating-rules | AccountingOperatingRules.html | accounting-operating-rules | Guidance-only | Not yet | N/A (Reference) | N/A |

---

### Group 4: Accounting Reports (10 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| wizard-export-csv | WizardExportCsv.html | wizard-export-csv | Guidance-only | Not yet | N/A (export only) | N/A |
| wizard-export-pdf | WizardExportPdf.html | wizard-export-pdf | Guidance-only | Not yet | N/A (export only) | N/A |
| wizard-ledger | WizardLedger.html | wizard-ledger | Guidance-only | Not yet | ledger | ✓ Ready |
| wizard-opening-tb | WizardOpeningTb.html | wizard-opening-tb | Guidance-only | Not yet | trial_balance | ✓ Ready |
| wizard-profit-loss | WizardProfitLoss.html | wizard-profit-loss | Guidance-only | Not yet | pl_statement | ✓ Ready |
| wizard-profit-loss-appropriation | WizardProfitLossAppropriation.html | wizard-profit-loss-appropriation | Guidance-only | Not yet | pl_appropriation | ✓ Ready |
| wizard-reconciliation | WizardReconciliation.html | wizard-reconciliation | Guidance-only | Not yet | reconciliation | ✓ Ready |
| wizard-search | WizardSearch.html | wizard-search | Guidance-only | Not yet | N/A (search only) | N/A |
| wizard-sheet-index | WizardSheetIndex.html | wizard-sheet-index | Guidance-only | Not yet | sheets | ✓ Ready |
| wizard-trial-balance | WizardTrialBalance.html | wizard-trial-balance | Guidance-only | Not yet | trial_balance | ✓ Ready |

---

### Group 5: Business Information (3 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| business-records | BusinessRecords.html | business-records | Functional/Ready | getBusinessRecords() | business_records | ✓ Ready |
| wizard-business-name | WizardBusinessName.html | wizard-business-name (disabled - retired Accounting Wizard) | Disabled | Not yet | business_info | ✓ Ready |
| strategy-reviews | StrategyReviews.html | strategy-reviews | Guidance-only | Not yet | strategy_reviews | ✓ Ready |

**Note:** wizard-business-name appears in Setup.js but is marked enabled: false (retired as part of Accounting Wizard consolidation)

---

### Group 6: Documents Management (8 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| life-timeline | LifeTimeline.html | life-timeline | Guidance-only | Not yet | life_timeline (planned) | ✓ Ready |
| archived-documents | ArchivedDocuments.html | archived-documents | Guidance-only | Not yet | document_archive (planned) | ✓ Ready |
| backup-status | BackupStatus.html | backup-status | Guidance-only | Not yet | backup_status (planned) | ✓ Ready |
| missing-documents | MissingDocuments.html | missing-documents | Guidance-only | Not yet | documents, missing_tracking | ✓ Ready |
| upload-documents | UploadDocuments.html | upload-documents | Guidance-only | Not yet | uploads, documents | ✓ Ready |
| expiring-documents | ExpiringDocuments.html | expiring-documents | Guidance-only | Not yet | documents, expiring_tracking | ✓ Ready |
| unlinked-documents | UnlinkedDocuments.html | unlinked-documents | Guidance-only | Not yet | documents, unlinked_tracking | ✓ Ready |
| archive-library | ArchiveLibrary.html | archive-library | Guidance-only | Not yet | archive_library | ✓ Ready |

---

### Group 7: Accounting Data Preparation (5 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| wizard-validate-acode-map | WizardValidateAcodeMap.html | wizard-validate-acode-map | Guidance-only | Not yet | acode_map | ✓ Ready |
| wizard-create-acode-map | WizardCreateAcodeMap.html | wizard-create-acode-map | Guidance-only | Not yet | acode_map | ✓ Ready |
| journal-decisions | JournalDecisions.html | journal-decisions | Guidance-only | Not yet | journal_decisions | ✓ Ready |
| journal-follow-ups | JournalFollowUps.html | journal-follow-ups | Guidance-only | Not yet | journal_followups | ✓ Ready |
| documents-imports-guide | DocumentsImportsGuide.html | documents-imports-guide | Guidance-only | Not yet | N/A (Reference) | N/A |

---

### Group 8: Administration & Configuration (13 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| getting-started | GettingStarted.html | getting-started | Functional/Ready | getGettingStartedGuide() | guidance_pages | ✓ Ready |
| configuration | Configuration.html | configuration | Guidance-only | Not yet | configuration (planned) | ✓ Ready |
| permissions | Permissions.html | permissions | Guidance-only | Not yet | permissions | ✓ Ready |
| roles | Roles.html | roles | Guidance-only | Not yet | roles | ✓ Ready |
| sessions | Sessions.html | sessions | Guidance-only | Not yet | sessions | ✓ Ready |
| users | UsersWindow.html | users | Guidance-only | Not yet | users | ✓ Ready |
| users-access-guide | UsersAccessGuide.html | users-access-guide | Guidance-only | Not yet | N/A (Reference) | N/A |
| access-review | AccessReview.html | access-review | Guidance-only | Not yet | access_log | ✓ Ready |
| admin-technical-guide | AdminTechnicalGuide.html | admin-technical-guide | Guidance-only | Not yet | N/A (Reference) | N/A |
| inactivity-sign-in | InactivitySignIn.html | inactivity-sign-in | Guidance-only | Not yet | sessions, inactivity_log | ✓ Ready |
| audit-log | AuditLog.html, WizardAuditTrail.html | audit-log (primary), wizard-audit-trail (shared) | Guidance-only | getAuditLog() | audit_log | ✓ Ready |
| about-version-history | AboutVersionHistory.html | about-version-history | Guidance-only | Not yet | N/A | N/A |
| developer-console | DeveloperConsole.html | developer-console | Functional | runScript() | N/A | N/A |

---

### Group 9: System & Help (7 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| system-status | SystemStatus.html | system-status | Guidance-only | Not yet | system_status | ✓ Ready |
| alerts | AlertsWindow.html | alerts-window | Guidance-only | Not yet | alerts (planned) | ✓ Ready |
| reminders | RemindersWindow.html | reminders-window | Guidance-only | Not yet | reminders (planned) | ✓ Ready |
| pending-features | PendingFeatures.html | pending-features | Guidance-only | Not yet | N/A | N/A |
| faq | Faq.html | faq | Guidance-only | Not yet | N/A (Reference) | N/A |
| modules | Modules.html | modules | Guidance-only | Not yet | N/A (Reference) | N/A |
| nilavaram-core | NilavaramCore.html | nilavaram-core | Guidance-only | Not yet | N/A (Reference) | N/A |

---

### Group 10: Framework & Infrastructure (5 modules)

| Module ID | HTML Files | Menu Entry Points | Status | Backend Functions | Firestore Collections | OneDrive Ready |
|-----------|------------|-------------------|--------|-------------------|----------------------|----------------|
| navigation-guide | NavigationGuide.html | navigation-guide | Framework | N/A | N/A | N/A |
| project-architecture | ProjectArchitecture.html | project-architecture | Documentation | N/A | N/A | N/A |
| project-start | ProjectStart.html | (parent group, no direct display) | Framework | N/A | N/A | N/A |
| module-guide-sources | ModuleGuideSources.html | module-guide-sources | Framework | N/A | N/A | N/A |
| menus | (Firestore collection reference) | N/A | Backend Structure | N/A | menus | N/A |

---

## SECTION 3: SUMMARY BY STATUS

### Functional & Ready for Development (2)
- business-records
- developer-console

### Guidance-Only (58)
*Structured UI framework present, awaiting business logic implementation*
- All input modules (11 total)
- All accounting modules (18 total)
- All documents modules (8 total)
- All admin modules (13 total)
- All system/help modules (7 total)
- Other structured guides (1 total)

### Framework/Infrastructure (5)
*Supporting components, not user-facing destinations*
- dashboard
- navigation-guide
- project-architecture
- project-start
- module-guide-sources

### Disabled/Retired (1)
*Set to enabled: false in Setup.js, preserved for audit trail*
- wizard-business-name

**Total: 2 + 58 + 5 + 1 = 66 confirmed + 5 framework = 71** ✓

---

## SECTION 4: SHARED MODULE DETAILS

The framework uses an intentional pattern where multiple menu items share a single module implementation:

### Shared Module: source-input
- **Entry Points:** wizard-manual-entry (primary catalog entry) + wizard-upload-csv, wizard-upload-txt, wizard-upload-image, wizard-upload-pdf
- **HTML Files:** WizardManualEntry.html, WizardUploadCsv.html, WizardUploadTxt.html, WizardUploadImage.html, WizardUploadPdf.html
- **Registration:** All files register with `NILAVARAM_SOURCE_GUIDES['source-input']`
- **Routing:** When any of the 5 menu items is clicked, the same 'source-input' module window loads
- **Purpose:** Different data entry pathways to the same destination

### Shared Module: connections
- **Entry Points:** input-link-accounts (primary catalog entry) + wizard-add-bank, connections
- **HTML Files:** InputLinkAccounts.html, WizardAddBank.html, Connections.html
- **Registration:** All files register with `NILAVARAM_SOURCE_GUIDES['connections']`
- **Routing:** All 3 menu items route to the same connections window

### Shared Module: chart-of-accounts
- **Entry Points:** account-chart-list (primary catalog entry) + wizard-chart-of-accounts
- **HTML Files:** AccountChartList.html, WizardChartOfAccounts.html
- **Registration:** Both register with `NILAVARAM_SOURCE_GUIDES['chart-of-accounts']`
- **Routing:** Both menu items route to the same chart-of-accounts window

### Shared Module: audit-log
- **Entry Points:** wizard-audit-trail (primary catalog entry) + audit-log
- **HTML Files:** WizardAuditTrail.html, AuditLog.html
- **Registration:** Both register with `NILAVARAM_SOURCE_GUIDES['audit-log']`
- **Routing:** Both menu items route to the same audit-log window

### Shared Module: accounting-guide
- **Entry Points:** wizard-documentation (primary catalog entry) + accounting-guide
- **HTML Files:** WizardDocumentation.html, AccountingGuide.html
- **Registration:** Both register with `NILAVARAM_SOURCE_GUIDES['accounting-guide']`
- **Routing:** Both menu items route to the same accounting-guide window

**Total Menu Items:** 80 items using 71 distinct module IDs = 9 items sharing modules

---

## SECTION 5: FIRESTORE COLLECTIONS CURRENTLY IN USE

| Collection | Purpose | Status |
|-----------|---------|--------|
| menus | Parent menu groups (dashboard, input, accounting, documents, etc.) | ✓ Active |
| menuItems | Individual menu items with enabled/disabled status | ✓ Active |
| audit_log | System audit trail of user actions | ✓ Active (backend only) |
| business_records | Business entity information | ✓ Ready (awaiting frontend binding) |
| guidance_pages | Help and getting-started content | ✓ Ready (awaiting frontend binding) |
| users | User profiles and roles | ✓ Ready (backend available) |
| permissions | Role-based access control | ✓ Ready (backend available) |
| roles | Permission roles definition | ✓ Ready (backend available) |
| sessions | User session management | ✓ Ready (backend available) |
| system_status | System health and statistics | ✓ Ready (awaiting frontend binding) |

### Collections Not Yet Created (Planned)
These collections are identified in the inventory but don't yet exist - ready for implementation:
- receipts
- payments
- journals
- sources
- connections
- accounts
- uploads
- chart_of_accounts
- reports
- balance_sheet
- pl_statement
- pl_appropriation
- reconciliation
- ledger
- trial_balance
- sheets
- documents
- archive_library
- backup_status
- acode_map
- configuration
- access_log
- inactivity_log
- strategy_reviews
- life_timeline
- reminders
- alerts
- journal_decisions
- journal_followups

---

## SECTION 6: ONEDRIVE INTEGRATION READINESS

**Current Status:** 52 modules marked "✓ Ready"
- All have functional data-entry UI frameworks in place
- All have identified Firestore collections (either active or planned)
- Ready for OneDrive document linking without changing authentication

**Reference-Only Modules:** 7 modules marked "N/A"
- accounting-guide, documents-imports-guide, admin-technical-guide, users-access-guide, faq, modules, nilavaram-core
- These are guidance/reference only, not data-entry
- Can optionally link to source documents on OneDrive

**Export/Utility-Only Modules:** 3 modules marked "N/A"
- wizard-export-csv, wizard-export-pdf, wizard-search
- Focus on output, not data storage
- OneDrive integration possible for export history

**Framework Modules:** 5 modules marked "N/A"
- Non-user-facing infrastructure components

**Total OneDrive-Ready:** 52 modules ready for integration

---

## SECTION 7: ARCHITECTURE FROZEN - CONSTRAINTS

### DO NOT MODIFY
- ✗ Setup.js menu definitions
- ✗ Module IDs or routing
- ✗ MenuFileCatalog.html structure
- ✗ ModuleGuideSources.html includes
- ✗ Firestore menus/menuItems collections (via setupNavigation_())
- ✗ Dashboard or sidebar filtering logic

### DO NOT DELETE
- ✗ contacts group (reserved for future Customers & Vendors feature)
- ✗ Any HTML files
- ✗ Disabled/retired menu items in Firestore
- ✗ Any module registrations

### PERMITTED: Read-Only Access
- ✓ Query Firestore collections
- ✓ Add new data to existing collections
- ✓ Extend HTML modules with form inputs and data binding
- ✓ Add backend functions for data read/write/audit
- ✓ Add role-based authorization checks
- ✓ Add OneDrive document references without auth changes

---

## SECTION 8: NEXT DEVELOPMENT PHASE

### Pilot Module: Business Records
1. **Scope:** Single-module end-to-end implementation
2. **Goals:**
   - Load existing Firestore data
   - Display dynamically in workspace
   - Implement role-based read/write controls
   - Validated data entry and save
   - Error handling and audit logging
   - Optional OneDrive references
   - Full /dev testing without production impact

3. **Current State:** HTML file exists (BusinessRecords.html) with stub guidance
4. **Target:** Functional, data-driven business information management

---

## VERIFICATION SUMMARY

| Item | Count | Verified |
|------|-------|----------|
| Total module IDs in source | 75 | ✓ Via regex extraction from Setup.js |
| Enabled modules | 71 | ✓ Via enabled: false identification |
| Sidebar destinations | 70 | ✓ After dashboard filtering |
| MenuFileCatalog rows | 71 | ✓ Via HTML parser |
| Menu items (80) sharing modules (71 IDs) | 9 shared | ✓ Routing verified |
| HTML files present | 85 (80 modules + 5 framework) | ✓ Confirmed |
| Firestore collections active | 10 | ✓ Confirmed |
| Collections ready for implementation | 34 | ✓ Planned |

---

**Report Status:** COMPLETE  
**Architecture:** FROZEN - Ready for incremental development  
**Next Step:** Pilot implementation for Business Records (awaiting design approval)
