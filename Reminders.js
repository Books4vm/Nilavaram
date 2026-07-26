/**
 * Reminders.js
 * Private and selectively shared reminders.
 */

function setupInitialReminders_() {
  const reminderId = 'trust-tax-filing-review';
  try {
    firestoreGetDocument_('reminders', reminderId);
    return;
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') === -1) {
      throw error;
    }
  }

  firestoreSetDocument_(
    'reminders',
    reminderId,
    toFirestoreFields_({
      title: 'Trust tax filing review',
      ownerEmail: 'mangai8100@gmail.com',
      assignedTo: 'mangai8100@gmail.com',
      visibility: 'private',
      allowedUsers: [],
      status: 'needs-details',
      preparationDueDate: '2026-08-02',
      filingDueDate: '',
      emailRecipient: 'mangai8100@gmail.com',
      emailReminderOffsetsDays: [30, 14, 7, 3, 1],
      emailEnabled: false,
      notes: 'Identify the trust, tax years, required form and actual filing deadline before enabling email delivery.',
      createdAt: new Date()
    })
  );
}

function getMyReminders() {
  const user = requireCurrentUser_();
  return firestoreGetCollection_('reminders')
    .map(fromFirestoreDocument_)
    .filter(function(reminder) {
      return normalizeEmail_(reminder.ownerEmail) === user.email ||
        (reminder.allowedUsers || []).map(normalizeEmail_).indexOf(user.email) !== -1;
    })
    .sort(function(a, b) {
      return String(a.preparationDueDate || a.filingDueDate)
        .localeCompare(String(b.preparationDueDate || b.filingDueDate));
    });
}
