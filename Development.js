/**
 * Development.js
 * Visible project intentions that may be completed in any sequence.
 */

function createDevelopmentTaskIfMissing_(taskId, task) {
  try {
    firestoreGetDocument_('developmentTasks', taskId);
    return;
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') === -1) {
      throw error;
    }
  }

  task.status = task.status || 'planned';
  task.assignedTo = task.assignedTo || 'mangai8100@gmail.com';
  task.sequence = 'flexible';
  task.createdAt = new Date();
  firestoreSetDocument_(
    'developmentTasks',
    taskId,
    toFirestoreFields_(task)
  );
}

function setupProjectIntentTasks_() {
  const personalTasks = [
    ['personal-life-timeline', 'Build Life Timeline', 'Create private life-event records with linked available or missing documents.'],
    ['identity-immigration', 'Organize Identity & Immigration', 'Track identity, citizenship, immigration documents and renewals.'],
    ['education-history', 'Organize Education History', 'Record education events and available or missing certificates.'],
    ['employment-history', 'Organize Employment History', 'Record work history and supporting documents.'],
    ['business-milestones', 'Organize Business Milestones', 'Link important business names and events to the life timeline.'],
    ['renewal-system', 'Build Renewal Tracking', 'Track expiry and renewal dates for documents and registrations.']
  ];

  personalTasks.forEach(function(item) {
    createDevelopmentTaskIfMissing_(item[0], {
      title: item[1],
      requirements: [item[2]],
      dueDate: ''
    });
  });

  createDevelopmentTaskIfMissing_('owner-private-access', {
    title: 'Establish Owner-Only Privacy',
    dueDate: '2026-08-02',
    requirements: [
      'Default new personal records to Private',
      'Set owner to mangai8100@gmail.com',
      'Separate technical Admin permission from private-data permission',
      'Test with non-sensitive sample information'
    ]
  });

  createDevelopmentTaskIfMissing_('private-decision-journal', {
    title: 'Build Private Decision Journal',
    dueDate: '2026-08-10',
    requirements: [
      'Record decisions and reasons',
      'Preserve version history',
      'Support strategy reviews and follow-up dates',
      'Default records to Private'
    ]
  });

  createDevelopmentTaskIfMissing_('safe-backup', {
    title: 'Establish Safe Automated Backup',
    dueDate: '2026-08-16',
    requirements: [
      'Provide one Nilavaram interface',
      'Protect Firestore metadata and document references',
      'Create automated export or backup with minimal user action',
      'Display backup status in the UI'
    ]
  });

  createDevelopmentTaskIfMissing_('documents-lifetime-archive', {
    title: 'Build Lifetime Documents Archive',
    dueDate: '',
    requirements: [
      'Track available and missing documents',
      'Preserve original files without alteration',
      'Record storage location, visibility and retention',
      'Support OneDrive or Google Drive document storage'
    ]
  });

  createDevelopmentTaskIfMissing_('assets-estate-organization', {
    title: 'Organize Assets, Trusts and Estate Records',
    dueDate: '',
    requirements: [
      'Record properties and financial accounts',
      'Record trusts, trustees, beneficiaries and stated ownership',
      'Link documents from OneDrive one at a time',
      'Do not make legal conclusions about asset protection'
    ]
  });

  createDevelopmentTaskIfMissing_('session-security', {
    title: 'Session Security',
    dueDate: '2026-08-09',
    requirements: [
      'Warn after 9 minutes of inactivity',
      'End the session after 10 minutes',
      'Require Google sign-in again'
    ]
  });

  createDevelopmentTaskIfMissing_('trust-tax-filing-details', {
    title: 'Confirm Overdue Trust Tax Filing Details',
    dueDate: '2026-08-02',
    requirements: [
      'Identify the trust',
      'Identify each unfiled tax year',
      'Confirm the required form and actual deadline with a tax professional',
      'Then activate the five-email reminder schedule'
    ]
  });

  createDevelopmentTaskIfMissing_('dynamic-dashboard-attention', {
    title: 'Build Dynamic Dashboard — Attention Required',
    dueDate: '2026-08-02',
    requirements: [
      'Display live Firestore counts instead of sample numbers',
      'Show reminders, unread alerts, unreconciled entries and uncoded entries',
      'Refresh the display after relevant records change'
    ]
  });

  createDevelopmentTaskIfMissing_('family-record-structure', {
    title: 'Define Family, Member, Trust and Business Records',
    dueDate: '2026-08-04',
    requirements: [
      'Create one family-level reporting group',
      'Keep ownership, tax identity and legal responsibility separate',
      'Use internal member IDs instead of Social Security numbers',
      'Apply visibility separately to each record and document'
    ]
  });

  createDevelopmentTaskIfMissing_('continuous-accounting-input', {
    title: 'Build Continuous Accounting Input',
    dueDate: '2026-08-06',
    requirements: [
      'Accept entries from relevant pages throughout Nilavaram',
      'Send every accounting entry into one common workflow',
      'Update the workflow immediately rather than waiting for batch processing',
      'Keep the source page and supporting document linked to the entry'
    ]
  });

  createDevelopmentTaskIfMissing_('double-entry-controls', {
    title: 'Build Double-Entry Bookkeeping Controls',
    dueDate: '2026-08-08',
    requirements: [
      'Require total debits to equal total credits before posting',
      'Keep incomplete entries as drafts',
      'Preserve corrections and posting history in the audit log',
      'Prevent posted entries from being silently overwritten'
    ]
  });

  createDevelopmentTaskIfMissing_('reconciliation-account-coding', {
    title: 'Build Reconciliation and Account Assignment',
    dueDate: '2026-08-09',
    requirements: [
      'Match source entries with bank and credit-card activity',
      'Assign valid codes from the Chart of Accounts',
      'Show the current stage: input, reconciliation, coding or posting',
      'Allow approved rules to suggest, but not conceal, account assignments'
    ]
  });

  createDevelopmentTaskIfMissing_('payables-reminder-control', {
    title: 'Build Payables and Reminder Control',
    dueDate: '2026-08-10',
    requirements: [
      'Store amount, due date, responsible member and payment account',
      'Track automatic-payment status, supporting bill and payment confirmation',
      'Support adjustable reminder schedules',
      'Highlight due-soon and overdue payments on the Dashboard'
    ]
  });

  createDevelopmentTaskIfMissing_('dynamic-family-reports', {
    title: 'Build Dynamic Family Financial Reports',
    dueDate: '2026-08-11',
    requirements: [
      'Prepare reports from posted double-entry records',
      'Show assets, liabilities and combined family net worth',
      'Show payables and other attention items',
      'Allow separate person, trust and business views plus an authorized family view'
    ]
  });

  createDevelopmentTaskIfMissing_('transaction-entry-import-workbench', {
    title: 'Build Transaction Entry and Import Workbench',
    dueDate: '2026-08-07',
    requirements: [
      'Provide a separate manual transaction-entry page',
      'Select debit and credit accounts from the live Chart of Accounts',
      'Accept CSV transaction imports with a review step',
      'Accept PDF source documents without treating unverified extraction as posted data',
      'Allow relevant modules to create entries through the same accounting service'
    ]
  });

  createDevelopmentTaskIfMissing_('entry-level-reconciliation', {
    title: 'Build Entry-by-Entry Reconciliation',
    dueDate: '2026-08-09',
    requirements: [
      'Store reconciliation status on every transaction',
      'Display a clear reconciled, unreconciled or disputed mark',
      'Record who reconciled the entry and when',
      'Allow controlled corrections without removing audit history'
    ]
  });

  createDevelopmentTaskIfMissing_('account-documents-annual-summaries', {
    title: 'Link Account Documents and Annual Summaries',
    dueDate: '2026-08-11',
    requirements: [
      'Link downloaded online documents to the related account',
      'Record reporting year, document type, owner and visibility',
      'Support annual-summary updates from online portals',
      'Keep document storage separate from the live Firestore account master'
    ]
  });
}

function getDevelopmentTasks() {
  requireCurrentUser_();
  return firestoreGetCollection_('developmentTasks')
    .map(fromFirestoreDocument_)
    .sort(function(a, b) {
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && !b.dueDate) return -1;
      return String(a.dueDate).localeCompare(String(b.dueDate));
    });
}
