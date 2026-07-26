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
