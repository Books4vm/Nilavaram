/**
 * SessionLogging.js
 * Append-only module window session records stored in OneDrive.
 * Admin users may read billing logs; other roles may write their own events.
 */

/**
 * Records one module-window session event from the main workspace shell.
 *
 * @param {Object} input Session payload from the browser.
 * @returns {Object}
 */
function recordModuleSessionEvent(input) {
  const user = requireCurrentUser_();
  const payload = input || {};
  const record = {
    sessionId: String(payload.sessionId || '').trim(),
    eventType: String(payload.eventType || 'close').trim(),
    moduleId: String(payload.moduleId || '').trim(),
    moduleLabel: String(payload.moduleLabel || '').trim(),
    windowName: String(payload.windowName || payload.moduleLabel || '').trim(),
    clientGroup: String(payload.clientGroup || '').trim(),
    clientIp: String(payload.clientIp || '').trim(),
    entityId: String(payload.entityId || '').trim(),
    entityName: String(payload.entityName || '').trim(),
    userEmail: user.email,
    userRole: user.role,
    openedAt: payload.openedAt || null,
    lastActiveAt: payload.lastActiveAt || null,
    closedAt: payload.closedAt || null,
    durationMinutes: payload.durationMinutes == null
      ? null
      : Number(payload.durationMinutes),
    closeReason: String(payload.closeReason || '').trim(),
    recordedAt: new Date().toISOString()
  };

  if (!record.sessionId) {
    throw new Error('A session id is required for billing logs.');
  }
  if (!record.moduleId) {
    throw new Error('A module id is required for billing logs.');
  }

  try {
    saveModuleSessionRecordToOneDrive_(record);
  } catch (error) {
    writeAudit_('module-session-log-failed', user.email, {
      sessionId: record.sessionId,
      moduleId: record.moduleId,
      entityId: record.entityId,
      closeReason: record.closeReason,
      error: String(error && error.message || error)
    });
    throw error;
  }

  return {
    success: true,
    sessionId: record.sessionId
  };
}

/**
 * Lists module session records for Admin billing review.
 *
 * @param {Object} options Optional day filter (YYYY-MM-DD, UTC).
 * @returns {Object}
 */
function getModuleSessionLogsForAdmin(options) {
  requireAdmin_();
  const day = String(options && options.day || Utilities.formatDate(
    new Date(),
    'UTC',
    'yyyy-MM-dd'
  ));
  const month = day.substring(0, 7);
  const folderSegments = ['Nilavaram', 'SessionLogs', month];
  let files = [];

  try {
    files = listOneDriveFolderChildren_(folderSegments).filter(function(entry) {
      return entry.name.indexOf('session-' + day + '-') === 0 &&
        entry.name.slice(-5) === '.json';
    });
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') === -1) {
      throw error;
    }
  }

  const records = files.map(function(entry) {
    try {
      return downloadOneDriveJson_(entry.id).value;
    } catch (error) {
      return {
        sessionId: entry.name,
        error: String(error && error.message || error)
      };
    }
  }).sort(function(a, b) {
    return String(b.recordedAt || '').localeCompare(String(a.recordedAt || ''));
  });

  return {
    day: day,
    count: records.length,
    records: records
  };
}

/**
 * Writes one immutable session record to OneDrive.
 *
 * @param {Object} record Session record.
 * @returns {Object}
 */
function saveModuleSessionRecordToOneDrive_(record) {
  const month = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM');
  const day = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
  const folderId = ensureOneDriveFolderPath_(['Nilavaram', 'SessionLogs', month]);
  const safeSessionId = String(record.sessionId || 'unknown')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = 'session-' + day + '-' + safeSessionId + '-' +
    String(record.eventType || 'event') + '.json';
  return uploadOneDriveJson_(folderId, fileName, record);
}