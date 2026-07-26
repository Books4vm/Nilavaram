/**
 * Alerts.js
 * User-visible administrative notifications.
 */

function getMyAlerts() {
  const user = requireCurrentUser_();
  if (user.role !== 'admin') {
    throw new Error('Admin permission is required.');
  }

  return firestoreGetCollection_('alerts')
    .map(fromFirestoreDocument_)
    .filter(function(alert) {
      return normalizeEmail_(alert.recipientEmail) === user.email;
    })
    .sort(function(a, b) {
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
}

function markAlertRead(alertId) {
  const user = requireCurrentUser_();
  const alert = fromFirestoreDocument_(
    firestoreGetDocument_('alerts', String(alertId || ''))
  );
  if (normalizeEmail_(alert.recipientEmail) !== user.email) {
    throw new Error('This alert does not belong to the signed-in user.');
  }

  delete alert.id;
  alert.status = 'read';
  alert.readAt = new Date();
  firestoreSetDocument_(
    'alerts',
    String(alertId),
    toFirestoreFields_(alert)
  );
  return { success: true };
}
