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

  const reminderRecord = defaultPrivateRecord_({
    title: 'Trust tax filing review',
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
  }, 'mangai8100@gmail.com');

  firestoreSetDocument_(
    'reminders',
    reminderId,
    toFirestoreFields_(reminderRecord)
  );
}

function getMyReminders() {
  const user = requireCurrentUser_();
  return firestoreGetCollection_('reminders')
    .map(fromFirestoreDocument_)
    .filter(function(reminder) {
      return canAccessPrivateRecord_(reminder, user.email);
    })
    .sort(function(a, b) {
      return String(a.preparationDueDate || a.filingDueDate)
        .localeCompare(String(b.preparationDueDate || b.filingDueDate));
    });
}

function getPrivateJournalEntries() {
  const user = requireCurrentUser_();
  return firestoreGetCollection_('privateJournal')
    .map(fromFirestoreDocument_)
    .filter(function(entry) {
      return canAccessPrivateRecord_(entry, user.email);
    })
    .sort(function(a, b) {
      return String(b.updatedAt || b.createdAt || '').localeCompare(
        String(a.updatedAt || a.createdAt || '')
      );
    });
}

function savePrivateDecision(input) {
  const user = requireCurrentUser_();
  const id = String(input && input.id || Utilities.getUuid());
  const existing = (() => {
    try {
      return fromFirestoreDocument_(firestoreGetDocument_('privateJournal', id));
    } catch (error) {
      if (String(error.message).indexOf('HTTP status: 404') === -1) {
        throw error;
      }
      return null;
    }
  })();

  const title = String(input && input.title || '').trim();
  const decision = String(input && input.decision || '').trim();
  const reason = String(input && input.reason || '').trim();
  const followUpDate = String(input && input.followUpDate || '').trim();

  if (!title) throw new Error('Enter a title for the decision.');
  if (!decision) throw new Error('Enter the decision itself.');
  if (!reason) throw new Error('Enter the reason or context for the decision.');

  const record = defaultPrivateRecord_({
    title: title,
    decision: decision,
    reason: reason,
    followUpDate: followUpDate,
    status: String(input && input.status || 'active').trim() || 'active',
    createdAt: existing ? (existing.createdAt || new Date()) : new Date(),
    updatedAt: new Date(),
    visibility: 'private',
    ownerEmail: user.email,
    allowedUsers: [user.email],
    reviews: Array.isArray(existing && existing.reviews) ? existing.reviews : []
  }, user.email);

  if (existing) {
    const historyEntry = {
      id: Utilities.getUuid(),
      parentId: id,
      title: existing.title,
      decision: existing.decision,
      reason: existing.reason,
      followUpDate: existing.followUpDate || '',
      status: existing.status || 'active',
      reviewedAt: new Date(),
      summary: 'Prior version preserved before update.'
    };
    firestoreSetDocument_(
      'privateJournalHistory',
      historyEntry.id,
      toFirestoreFields_(historyEntry)
    );
    record.version = Number(existing.version || 1) + 1;
  } else {
    record.version = 1;
  }

  delete record.id;
  firestoreSetDocument_('privateJournal', id, toFirestoreFields_(record));

  return {
    success: true,
    id: id,
    message: existing ? 'Private decision updated.' : 'Private decision saved.'
  };
}

function addPrivateDecisionReview(entryId, input) {
  const user = requireCurrentUser_();
  const id = String(entryId || '');
  if (!id) throw new Error('Select a decision to review.');

  const entry = fromFirestoreDocument_(firestoreGetDocument_('privateJournal', id));
  if (!canAccessPrivateRecord_(entry, user.email)) {
    throw new Error('This private decision is not available to this user.');
  }

  const reviewText = String(input && input.reviewText || '').trim();
  const followUpDate = String(input && input.followUpDate || '').trim();
  if (!reviewText) throw new Error('Enter a review summary.');

  const review = {
    id: Utilities.getUuid(),
    entryId: id,
    reviewText: reviewText,
    followUpDate: followUpDate || entry.followUpDate || '',
    reviewedBy: user.email,
    reviewedAt: new Date()
  };

  const reviews = Array.isArray(entry.reviews) ? entry.reviews.slice() : [];
  reviews.push(review);
  entry.reviews = reviews;
  entry.followUpDate = review.followUpDate || entry.followUpDate || '';
  entry.updatedAt = new Date();
  entry.lastReviewedAt = new Date();
  delete entry.id;

  firestoreSetDocument_('privateJournal', id, toFirestoreFields_(entry));
  firestoreSetDocument_(
    'privateJournalHistory',
    review.id,
    toFirestoreFields_(review)
  );

  return { success: true, id: id, message: 'Review saved.' };
}

function deletePrivateDecision(entryId) {
  const user = requireCurrentUser_();
  const entry = fromFirestoreDocument_(firestoreGetDocument_('privateJournal', String(entryId || '')));
  if (!canAccessPrivateRecord_(entry, user.email)) {
    throw new Error('This private decision is not available to this user.');
  }
  if (normalizeEmail_(entry.ownerEmail) !== user.email) {
    throw new Error('Only the owner can delete a private decision.');
  }

  firestoreDeleteDocument_('privateJournal', String(entryId));
  return { success: true, message: 'Private decision deleted.' };
}
