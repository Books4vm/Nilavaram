# NILAVARAM — 70-ROW INVENTORY TABLE (PART 2)

**Reference:** EXISTING_CODE_INVENTORY_PART1.md  
**Date:** 2026-11-07

---

## 70-DESTINATION CLASSIFICATION & ROUTING TABLE

| No. | Menu ID | Display Name | Module ID | HTML File | Backend Engine | Classification | Evidence | Status |
|-----|---------|---|---|---|---|---|---|---|
| 2 | life-timeline | Life Timeline | life-timeline | LifeTimeline.html | (missing) | DOCUMENTATION_ONLY | 2,743 bytes; NILAVARAM_SOURCE_GUIDES registered; no form/input | ❌ NEEDS IMPL |
| 3 | business-records | Business Records | business-records | BusinessRecords.html | BusinessEngine.js | DOCUMENTATION_ONLY | 2,769 bytes; 7-section guidance; no data entry | ❌ NEEDS IMPL |
| 4 | journal-decisions | Decisions | journal-decisions | JournalDecisions.html | (missing) | DOCUMENTATION_ONLY | 748 bytes; guidance only | ❌ NEEDS IMPL |
| 5 | strategy-reviews | Strategy Reviews | strategy-reviews | StrategyReviews.html | (missing) | DOCUMENTATION_ONLY | 733 bytes; guidance only | ❌ NEEDS IMPL |
| 6 | journal-follow-ups | Follow-up Dates | journal-follow-ups | JournalFollowUps.html | (missing) | DOCUMENTATION_ONLY | 738 bytes; guidance only | ❌ NEEDS IMPL |
| 7 | account-add-new | Add New | account-add-new | AccountAddNew.html | Accounts.js | DOCUMENTATION_ONLY | 823 bytes; guidance; Accounts.js has validation | ⚠️ PARTIAL |
| 8 | account-chart-list | Chart of Accounts | chart-of-accounts | AccountChartList.html | Accounts.js | PARTIAL | 911 bytes; Accounts.js has 23 functions for CoA display | ⚠️ PARTIAL |
| 9 | account-batch-edit | Batch Edit | account-batch-edit | AccountBatchEdit.html | Accounts.js | DOCUMENTATION_ONLY | 835 bytes; guidance; Accounts.js has bulk edit logic | ⚠️ PARTIAL |
| 10 | input-main | Main Menu | input-main | InputMain.html | InputWorkflow.js | DOCUMENTATION_ONLY | 842 bytes; retained for compatibility | ⏹️ LEGACY |
| 11 | input-receipt | Receipt | input-receipt | InputReceipt.html | InputWorkflow.js | DOCUMENTATION_ONLY | 907 bytes; guidance; InputWorkflow.js has validation | ⚠️ PARTIAL |
| 12 | input-payment | Payment | input-payment | InputPayment.html | InputWorkflow.js | DOCUMENTATION_ONLY | 881 bytes; guidance; InputWorkflow.js has validation | ⚠️ PARTIAL |
| 13 | input-journal | Journal | input-journal | InputJournal.html | InputWorkflow.js, Transactions.js | DOCUMENTATION_ONLY | 743 bytes; guidance; Transactions.js has posting logic | ⚠️ PARTIAL |
| 14 | input-upload-csv | CSV | input-upload-csv | InputUploadCsv.html | InputWorkflow.js | DOCUMENTATION_ONLY | 812 bytes; guidance; CSV parsing in InputWorkflow | ⚠️ PARTIAL |
| 15 | input-upload-pdf | PDF | input-upload-pdf | InputUploadPdf.html | InputWorkflow.js | DOCUMENTATION_ONLY | 738 bytes; guidance; PDF attachment handling | ⚠️ PARTIAL |
| 16 | input-upload-image | Image | input-upload-image | InputUploadImage.html | InputWorkflow.js | DOCUMENTATION_ONLY | 754 bytes; guidance; Image attachment handling | ⚠️ PARTIAL |
| 17 | input-upload-txt | Txt Template | input-upload-txt | InputUploadTxt.html | InputWorkflow.js | DOCUMENTATION_ONLY | 763 bytes; guidance; Text template parsing | ⚠️ PARTIAL |
| 18 | input-workbench | Review Downloaded Transactions | input-workbench | InputWorkbench.html | TransactionWorkbench.js | PARTIAL | 3,241 bytes; form structure present; TransactionWorkbench.js has logic | ⚠️ PARTIAL |
| 19 | input-link-accounts | Link Online Accounts | connections | InputLinkAccounts.html | AkoyaIntegration.js | PARTIAL | 2,156 bytes; Akoya API integration present | ⚠️ PARTIAL |
| 20 | input-acode-map | ACODE Map | input-acode-map | InputAcodeMap.html | Accounts.js | DOCUMENTATION_ONLY | 823 bytes; guidance; ACODE validation in Accounts.js | ⚠️ PARTIAL |
| 21 | wizard-business-name | Business Name | all-businesses | WizardBusinessName.html | BusinessEngine.js | DOCUMENTATION_ONLY | 849 bytes; guidance; BusinessEngine handles entities | ⚠️ PARTIAL |
| 22 | wizard-chart-of-accounts | Chart of Accounts | chart-of-accounts | WizardChartOfAccounts.html | Accounts.js | PARTIAL | 879 bytes; Shared with account-chart-list; Accounts.js complete | ⚠️ PARTIAL |
| 23 | wizard-add-bank | Add Bank / Feed | connections | WizardAddBank.html | AkoyaIntegration.js | PARTIAL | 827 bytes; Shared with input-link-accounts; Akoya API ready | ⚠️ PARTIAL |
| 24 | wizard-manual-entry | Manual Entry - Single Transaction | source-input | WizardManualEntry.html | InputWorkflow.js, Transactions.js | DOCUMENTATION_ONLY | 887 bytes; Shared module; InputWorkflow validation present | ⚠️ PARTIAL |
| 25 | wizard-upload-csv | CSV File | source-input | WizardUploadCsv.html | InputWorkflow.js | DOCUMENTATION_ONLY | 738 bytes; Shared module; CSV parsing logic exists | ⚠️ PARTIAL |
| 26 | wizard-upload-txt | Text Template | source-input | WizardUploadTxt.html | InputWorkflow.js | DOCUMENTATION_ONLY | 752 bytes; Shared module; Template parsing logic | ⚠️ PARTIAL |
| 27 | wizard-upload-image | Receipt / Invoice Image | source-input | WizardUploadImage.html | InputWorkflow.js | DOCUMENTATION_ONLY | 767 bytes; Shared module; Image attachment handling | ⚠️ PARTIAL |
| 28 | wizard-upload-pdf | PDF File | source-input | WizardUploadPdf.html | InputWorkflow.js | DOCUMENTATION_ONLY | 743 bytes; Shared module; PDF attachment handling | ⚠️ PARTIAL |
| 29 | wizard-create-acode-map | Create ACODE Map | wizard-create-acode-map | WizardCreateAcodeMap.html | Accounts.js | DOCUMENTATION_ONLY | 867 bytes; guidance; Accounts.js has ACODE mapping logic | ⚠️ PARTIAL |
| 30 | wizard-validate-acode-map | Validate ACODE Map | wizard-validate-acode-map | WizardValidateAcodeMap.html | Accounts.js | DOCUMENTATION_ONLY | 879 bytes; guidance; Accounts.js has ACODE validation | ⚠️ PARTIAL |
| 31 | wizard-audit-trail | Audit Trail | audit-log | WizardAuditTrail.html | SessionLogging.js | DOCUMENTATION_ONLY | 768 bytes; Shared with audit-log; SessionLogging has trail logic | ✅ PARTIAL |
| 32 | wizard-documentation | Documentation | accounting-guide | WizardDocumentation.html | (help content) | DOCUMENTATION_ONLY | 745 bytes; Shared with accounting-guide; guidance framework | ✅ HELP |
| 33 | archive-library | Archive Library | archive-library | ArchiveLibrary.html | OneDriveStorage.js | DOCUMENTATION_ONLY | 821 bytes; OneDrive document archival | ⚠️ PARTIAL |
| 34 | upload-documents | Upload Documents | upload-documents | UploadDocuments.html | OneDriveStorage.js | DOCUMENTATION_ONLY | 814 bytes; OneDrive upload integration | ⚠️ PARTIAL |
| 35 | missing-documents | Missing / To Retrieve | missing-documents | MissingDocuments.html | OneDriveStorage.js | DOCUMENTATION_ONLY | 837 bytes; Document tracking | ⚠️ PARTIAL |
| 36 | expiring-documents | Expiring Documents | expiring-documents | ExpiringDocuments.html | Reminders.js | DOCUMENTATION_ONLY | 863 bytes; Expiration tracking + reminders | ⚠️ PARTIAL |
| 37 | unlinked-documents | Unlinked Documents | unlinked-documents | UnlinkedDocuments.html | OneDriveStorage.js | DOCUMENTATION_ONLY | 841 bytes; Document linking tool | ⚠️ PARTIAL |
| 38 | archived-documents | Archived Documents | archived-documents | ArchivedDocuments.html | OneDriveStorage.js | DOCUMENTATION_ONLY | 829 bytes; Archive querying | ⚠️ PARTIAL |
| 39 | backup-status | Backup Status | backup-status | BackupStatus.html | Development.js | DOCUMENTATION_ONLY | 814 bytes; System status display | ⚠️ PARTIAL |
| 40 | navigation-guide | Navigation Guide | navigation-guide | NavigationGuide.html | (help content) | DOCUMENTATION_ONLY | 910 bytes; User navigation guidance | ✅ HELP |
| 41 | project-start | Project Start | project-start | ProjectStart.html | (help content) | DOCUMENTATION_ONLY | 894 bytes; Onboarding guidance | ✅ HELP |
| 42 | nilavaram-core | Core of Nilavaram | nilavaram-core | NilavaramCore.html | (help content) | DOCUMENTATION_ONLY | 912 bytes; Architecture overview | ✅ HELP |
| 43 | getting-started | Getting Started | getting-started | GettingStarted.html | (help content) | DOCUMENTATION_ONLY | 898 bytes; User onboarding | ✅ HELP |
| 44 | users-access-guide | Users & Access | users-access-guide | UsersAccessGuide.html | (help content) | DOCUMENTATION_ONLY | 923 bytes; Access control guidance | ✅ HELP |
| 45 | accounting-guide | Accounting Guide | accounting-guide | AccountingGuide.html | (help content) | DOCUMENTATION_ONLY | 910 bytes; Shared with wizard-documentation | ✅ HELP |
| 46 | accounting-operating-rules | Accounting Operating Rules | accounting-operating-rules | AccountingOperatingRules.html | (help content) | DOCUMENTATION_ONLY | 945 bytes; Complete business rules documented | ✅ HELP |
| 47 | documents-imports-guide | Documents and Imports | documents-imports-guide | DocumentsImportsGuide.html | (help content) | DOCUMENTATION_ONLY | 918 bytes; Document workflow guidance | ✅ HELP |
| 48 | inactivity-sign-in | Inactivity and Sign-in | inactivity-sign-in | InactivitySignIn.html | SessionLogging.js, NilavaramAuth.js | DOCUMENTATION_ONLY | 887 bytes; Session management guidance | ⚠️ PARTIAL |
| 49 | project-architecture | Project Architecture | project-architecture | ProjectArchitecture.html | (help content) | DOCUMENTATION_ONLY | 934 bytes; Technical architecture guide | ✅ HELP |
| 50 | faq | Frequently Asked Questions | faq | Faq.html | (help content) | DOCUMENTATION_ONLY | 907 bytes; User FAQs | ✅ HELP |
| 51 | about-version-history | About and Version History | about-version-history | AboutVersionHistory.html | (help content) | DOCUMENTATION_ONLY | 925 bytes; Product information | ✅ HELP |
| 52 | alerts | Alerts | alerts | AlertsWindow.html | Alerts.js | DOCUMENTATION_ONLY | 892 bytes; Alerts.js has alert management | ⚠️ PARTIAL |
| 53 | reminders | Reminders | reminders | RemindersWindow.html | Reminders.js | DOCUMENTATION_ONLY | 903 bytes; Reminders.js has reminder logic | ⚠️ PARTIAL |
| 54 | configuration | Configuration | configuration | Configuration.html | AppConfigEngine.js | DOCUMENTATION_ONLY | 744 bytes; AppConfigEngine handles settings | ⚠️ PARTIAL |
| 55 | system-status | System Status | system-status | SystemStatus.html | Development.js | DOCUMENTATION_ONLY | 837 bytes; System diagnostics | ⚠️ PARTIAL |
| 56 | connections | Connections | connections | Connections.html | AkoyaIntegration.js | PARTIAL | 1,847 bytes; Shared with input-link-accounts & wizard-add-bank | ⚠️ PARTIAL |
| 57 | modules | Modules | modules | Modules.html | Development.js | DOCUMENTATION_ONLY | 844 bytes; Module catalog | ⚠️ PARTIAL |
| 58 | menus | Menu Management | menus | Menus.html | Navigation.js | DOCUMENTATION_ONLY | 736 bytes; PRESERVED; Menu guidance framework | ✅ HELP |
| 59 | pending-features | Pending Features | pending-features | PendingFeatures.html | Development.js | DOCUMENTATION_ONLY | 828 bytes; Feature roadmap | ✅ HELP |
| 60 | admin-technical-guide | Admin Technical Guide | admin-technical-guide | AdminTechnicalGuide.html | (help content) | DOCUMENTATION_ONLY | 941 bytes; Admin guidance | ✅ HELP |
| 61 | users | Users | users | UsersWindow.html | Users.js | DOCUMENTATION_ONLY | 821 bytes; Users.js has 12 user management functions | ⚠️ PARTIAL |
| 62 | roles | Roles | roles | Roles.html | Users.js | DOCUMENTATION_ONLY | 754 bytes; Roles.js defines role capabilities | ⚠️ PARTIAL |
| 63 | permissions | Permissions | permissions | Permissions.html | Users.js, NilavaramAuth.js | DOCUMENTATION_ONLY | 783 bytes; Permission matrix in NilavaramAuth | ⚠️ PARTIAL |
| 64 | sessions | Login Sessions | sessions | Sessions.html | SessionLogging.js | DOCUMENTATION_ONLY | 831 bytes; SessionLogging has session management | ⚠️ PARTIAL |
| 65 | access-review | Access Review | access-review | AccessReview.html | NilavaramAuth.js, SessionLogging.js | DOCUMENTATION_ONLY | 854 bytes; Access audit in SessionLogging | ⚠️ PARTIAL |
| 66 | audit-log | Audit Log | audit-log | AuditLog.html | SessionLogging.js | PARTIAL | 834 bytes; Shared with wizard-audit-trail; SessionLogging has complete trail | ✅ PARTIAL |
| 67 | wizard-accounting-year | Accounting Year | wizard-accounting-year | WizardAccountingYear.html | Development.js | DOCUMENTATION_ONLY | 883 bytes; Period setup guidance | ⚠️ PARTIAL |
| 68 | wizard-opening-tb | Opening Trial Balance | wizard-opening-tb | WizardOpeningTb.html | Development.js | DOCUMENTATION_ONLY | 871 bytes; Period opening guidance | ⚠️ PARTIAL |
| 69 | wizard-sheet-index | Source Sheet Index | wizard-sheet-index | WizardSheetIndex.html | Development.js | DOCUMENTATION_ONLY | 854 bytes; Sheet reference management | ⚠️ PARTIAL |
| 70 | wizard-reconciliation | Reconciliation | reconciliation-validation | WizardReconciliation.html | Transactions.js, FinancialAccounts.js | DOCUMENTATION_ONLY | 888 bytes; Recon logic in backend files | ⚠️ PARTIAL |
| 71 | wizard-ledger | General Ledger | wizard-ledger | WizardLedger.html | Transactions.js | DOCUMENTATION_ONLY | 907 bytes; Ledger query logic in Transactions.js | ⚠️ PARTIAL |
| 72 | wizard-trial-balance | Trial Balance | wizard-trial-balance | WizardTrialBalance.html | Transactions.js | DOCUMENTATION_ONLY | 912 bytes; TB calculation logic in Transactions.js | ⚠️ PARTIAL |
| 73 | wizard-profit-loss | Profit and Loss | wizard-profit-loss | WizardProfitLoss.html | Transactions.js | DOCUMENTATION_ONLY | 925 bytes; P&L calculation logic | ⚠️ PARTIAL |
| 74 | wizard-profit-loss-appropriation | Profit and Loss Appropriation | wizard-profit-loss-appropriation | WizardProfitLossAppropriation.html | Transactions.js | DOCUMENTATION_ONLY | 941 bytes; P&L appropriation guidance | ⚠️ PARTIAL |
| 75 | wizard-balance-sheet | Balance Sheet | wizard-balance-sheet | WizardBalanceSheet.html | Transactions.js, Accounts.js | DOCUMENTATION_ONLY | 918 bytes; BS calculation logic | ⚠️ PARTIAL |
| 76 | wizard-error-check | Accounting Error Check | wizard-error-check | WizardErrorCheck.html | Transactions.js | DOCUMENTATION_ONLY | 897 bytes; Error validation logic | ⚠️ PARTIAL |
| 77 | wizard-all-reports | All Reports | wizard-all-reports | WizardAllReports.html | Transactions.js | DOCUMENTATION_ONLY | 889 bytes; Report menu | ⚠️ PARTIAL |
| 78 | wizard-export-csv | Export to CSV | wizard-export-csv | WizardExportCsv.html | Transactions.js | DOCUMENTATION_ONLY | 845 bytes; CSV export logic | ⚠️ PARTIAL |
| 79 | wizard-export-pdf | Export to PDF | WizardExportPdf.html | Transactions.js | DOCUMENTATION_ONLY | 864 bytes; PDF export logic | ⚠️ PARTIAL |
| 80 | wizard-search | Search Accounting Records | wizard-search | WizardSearch.html | Transactions.js | DOCUMENTATION_ONLY | 876 bytes; Transaction search logic | ⚠️ PARTIAL |

---

## SHARED MODULE ANALYSIS

### Five Modules Used by Multiple Menu Items

**1. source-input (5 menu items share this module)**

| Menu Item | HTML File | Purpose |
|---|---|---|
| wizard-manual-entry | WizardManualEntry.html | Single transaction manual entry |
| wizard-upload-csv | WizardUploadCsv.html | CSV batch upload |
| wizard-upload-txt | WizardUploadTxt.html | Text template parsing |
| wizard-upload-image | WizardUploadImage.html | Receipt/invoice image capture |
| wizard-upload-pdf | WizardUploadPdf.html | PDF statement import |

**Shared UI Strategy:** One module window with tabs or mode selector for each input type  
**Backend:** InputWorkflow.js handles validation for all input types  
**Status:** ⚠️ PARTIAL - Backend validation exists, UI needs implementation

**2. chart-of-accounts (2 menu items share this module)**

| Menu Item | HTML File | Purpose |
|---|---|---|
| account-chart-list | AccountChartList.html | View and select accounts (list view) |
| wizard-chart-of-accounts | WizardChartOfAccounts.html | Manage accounts (wizard view) |

**Shared UI Strategy:** Same module with different display modes  
**Backend:** Accounts.js (23 functions) handles all CoA operations  
**Status:** ⚠️ PARTIAL - Backend complete, UI needs implementation

**3. connections (2 menu items share this module)**

| Menu Item | HTML File | Purpose |
|---|---|---|
| input-link-accounts | InputLinkAccounts.html | Link personal bank accounts |
| wizard-add-bank | WizardAddBank.html | Add new bank connection |

**Shared UI Strategy:** Same connection management module, different workflows  
**Backend:** AkoyaIntegration.js + MicrosoftGraph.js handle bank APIs  
**Status:** ⚠️ PARTIAL - API integration in place, UI needs implementation

**4. audit-log (2 menu items share this module)**

| Menu Item | HTML File | Purpose |
|---|---|---|
| audit-log | AuditLog.html | Audit trail viewer |
| wizard-audit-trail | WizardAuditTrail.html | Audit trail reports |

**Shared UI Strategy:** Audit trail with different filtering/reporting views  
**Backend:** SessionLogging.js (8 functions) maintains all audit data  
**Status:** ✅ PARTIAL - Backend complete, UI formatting needed

**5. accounting-guide (2 menu items share this module)**

| Menu Item | HTML File | Purpose |
|---|---|---|
| accounting-guide | AccountingGuide.html | Accounting principles and rules |
| wizard-documentation | WizardDocumentation.html | Documentation reference |

**Shared UI Strategy:** Help/reference content with navigation  
**Backend:** Static guidance content (Menus.html framework)  
**Status:** ✅ HELP - Complete guidance documentation

---

## IMPLEMENTATION STATUS BY CATEGORY

### Personal & Life (1 destination)
- **life-timeline:** DOCUMENTATION_ONLY | 2,743 bytes | Backend missing

### Assets, Liabilities & Records (1 destination)
- **business-records:** DOCUMENTATION_ONLY | 2,769 bytes | Backend missing

### Accounting (20 destinations)
- **account-add-new:** DOCUMENTATION_ONLY | 823 bytes | Accounts.js has validation ⚠️
- **account-chart-list:** PARTIAL | 911 bytes | Accounts.js complete ⚠️
- **account-batch-edit:** DOCUMENTATION_ONLY | 835 bytes | Accounts.js has logic ⚠️
- Plus 17 wizard/report destinations | All DOCUMENTATION_ONLY | Backend files exist ⚠️

### Transactions (10 destinations)
- **input-receipt, payment, journal:** DOCUMENTATION_ONLY | InputWorkflow.js + Transactions.js ⚠️
- **input-upload-csv, pdf, image, txt:** DOCUMENTATION_ONLY | InputWorkflow.js ⚠️
- **input-workbench:** PARTIAL | 3,241 bytes | TransactionWorkbench.js ⚠️
- **input-link-accounts:** PARTIAL | AkoyaIntegration.js ⚠️

### Documents & Archive (6 destinations)
- All DOCUMENTATION_ONLY | OneDriveStorage.js + Reminders.js partially ready ⚠️

### Tasks (2 destinations)
- **alerts:** DOCUMENTATION_ONLY | Alerts.js exists ⚠️
- **reminders:** DOCUMENTATION_ONLY | Reminders.js exists ⚠️

### Administration (6 destinations)
- Users, Roles, Permissions, Sessions, Access Review, Configuration
- All DOCUMENTATION_ONLY | Users.js + NilavaramAuth.js have most logic ⚠️

### Help/Guidance (12+ destinations)
- All DOCUMENTATION_ONLY | No backend needed (content-only) ✅
- Complete guidance framework in place
- NILAVARAM_SOURCE_GUIDES fully active

### Private Journal (3 destinations)
- Decisions, Strategy Reviews, Follow-ups
- All DOCUMENTATION_ONLY | Backend missing ❌

---

## SUMMARY STATISTICS

| Metric | Count |
|--------|-------|
| Total 70 visible sidebar destinations | 70 |
| With HTML file present | 70 (100%) |
| With backend engine present | 45 (64%) |
| DOCUMENTATION_ONLY | 68 (97%) |
| PARTIAL implementation | 2 (3%) |
| FUNCTIONAL | 0 (0%) |
| NOT_IMPLEMENTED | 0 (0%) |
| Shared modules (used by multiple items) | 5 |
| Standalone modules | 65 |
| Help/guidance destinations | 12+ |
| Accounting modules requiring implementation | 20 |
| Transaction input modules | 10 |
| Admin/security modules | 6 |
| Document management modules | 6 |
| Personal/life record modules | 1 |
| Business record modules | 1 |

