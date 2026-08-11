/**
 * OneDriveStorage.js
 * OneDrive-backed annual source-record files. Firestore retains only a small
 * verified archive index; transaction payloads live in Microsoft OneDrive.
 */

const NILAVARAM_ONEDRIVE_STORAGE_VERSION = 1;
const NILAVARAM_ONEDRIVE_ROOT = 'Nilavaram';
const NILAVARAM_ONEDRIVE_INDEX_PROPERTY = 'ONEDRIVE_SOURCE_INDEX_ITEM_ID';
const NILAVARAM_ONEDRIVE_READY_PROPERTY = 'ONEDRIVE_SOURCE_BACKEND_READY';

function requirePrimaryAdminForOneDriveStorage_() {
  const email = getCurrentEmail_();
  if (NILAVARAM_INITIAL_ADMIN_EMAILS.map(normalizeEmail_).indexOf(email) === -1) {
    throw new Error('Configured Admin permission is required for storage migration.');
  }
  return {email: email, role: 'admin'};
}

function microsoftGraphRequestRaw_(path, method, payload, contentType) {
  const buildOptions = function(token) {
    const options = {
      method: method || 'get',
      headers: {Authorization: 'Bearer ' + token},
      muteHttpExceptions: true,
      followRedirects: true
    };
    if (payload !== undefined) {
      options.contentType = contentType || 'application/json';
      options.payload = payload;
    }
    return options;
  };
  const url = 'https://graph.microsoft.com/v1.0' + path;
  let response = UrlFetchApp.fetch(
    url,
    buildOptions(getMicrosoftAccessToken_())
  );
  if (response.getResponseCode() === 401) {
    clearMicrosoftAccessToken_();
    response = UrlFetchApp.fetch(
      url,
      buildOptions(getMicrosoftAccessToken_(true))
    );
  }
  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    let message = response.getContentText();
    try {
      const parsed = JSON.parse(message);
      message = parsed.error && parsed.error.message || message;
    } catch (ignore) {}
    const safePath = String(path || '').split('?')[0];
    const error = new Error(
      'Microsoft Graph storage request failed during ' +
      String(method || 'get').toUpperCase() + ' ' + safePath +
      ' (HTTP ' + status + '): ' + message
    );
    error.httpStatus = status;
    throw error;
  }
  return response;
}

function microsoftGraphJsonRequest_(path, method, value) {
  const payload = value === undefined ? undefined : JSON.stringify(value);
  const response = microsoftGraphRequestRaw_(
    path, method || 'get', payload, 'application/json'
  );
  const text = response.getContentText();
  return text ? JSON.parse(text) : {};
}

function microsoftGraphTryGet_(path) {
  try {
    return microsoftGraphJsonRequest_(path, 'get');
  } catch (error) {
    if (error.httpStatus === 404) return null;
    throw error;
  }
}

function oneDriveSafeName_(value) {
  return String(value || 'unknown')
    .replace(/[\\/:*?"<>|#%]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'unknown';
}

function oneDrivePathAddress_(segments) {
  return segments.map(function(segment) {
    return encodeURIComponent(oneDriveSafeName_(segment));
  }).join('/');
}

function ensureOneDriveFolderPath_(segments) {
  let parentId = 'root';
  const completed = [];
  segments.forEach(function(segment) {
    completed.push(segment);
    const path = oneDrivePathAddress_(completed);
    let item = microsoftGraphTryGet_(
      '/me/drive/root:/' + path + '?$select=id,name,folder,parentReference,webUrl'
    );
    if (!item) {
      const parentPath = parentId === 'root'
        ? '/me/drive/root/children'
        : '/me/drive/items/' + encodeURIComponent(parentId) + '/children';
      try {
        item = microsoftGraphJsonRequest_(parentPath, 'post', {
          name: oneDriveSafeName_(segment),
          folder: {},
          '@microsoft.graph.conflictBehavior': 'fail'
        });
      } catch (error) {
        // A concurrent request may have created it after the lookup.
        item = microsoftGraphTryGet_(
          '/me/drive/root:/' + path + '?$select=id,name,folder,parentReference,webUrl'
        );
        if (!item) throw error;
      }
    }
    if (!item.folder) throw new Error(path + ' exists in OneDrive but is not a folder.');
    parentId = String(item.id || '');
  });
  return parentId;
}

function oneDriveSha256_(text) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text),
    Utilities.Charset.UTF_8
  ).map(function(value) {
    const byte = value < 0 ? value + 256 : value;
    return ('0' + byte.toString(16)).slice(-2);
  }).join('');
}

function uploadOneDriveJson_(parentId, fileName, value) {
  const content = JSON.stringify(value, null, 2);
  const item = JSON.parse(microsoftGraphRequestRaw_(
    '/me/drive/items/' + encodeURIComponent(parentId) + ':/' +
      encodeURIComponent(oneDriveSafeName_(fileName)) + ':/content',
    'put', content, 'application/json; charset=utf-8'
  ).getContentText());
  return {
    itemId: String(item.id || ''),
    driveId: String(item.parentReference && item.parentReference.driveId || ''),
    name: String(item.name || fileName),
    webUrl: String(item.webUrl || ''),
    size: Number(item.size || content.length),
    eTag: String(item.eTag || ''),
    sha256: oneDriveSha256_(content),
    content: content
  };
}

function downloadOneDriveJson_(itemId) {
  // Graph /content redirects to a short-lived, preauthenticated OneDrive URL.
  // Capture that redirect, then fetch it without forwarding the bearer token.
  const graphUrl = 'https://graph.microsoft.com/v1.0/me/drive/items/' +
    encodeURIComponent(itemId) + '/content';
  const fetchGraphContent = function(token) {
    return UrlFetchApp.fetch(graphUrl, {
      method: 'get',
      headers: {Authorization: 'Bearer ' + token},
      muteHttpExceptions: true,
      followRedirects: false
    });
  };
  let response = fetchGraphContent(getMicrosoftAccessToken_());
  if (response.getResponseCode() === 401) {
    clearMicrosoftAccessToken_();
    response = fetchGraphContent(getMicrosoftAccessToken_(true));
  }
  let status = response.getResponseCode();
  if (status >= 300 && status < 400) {
    const headers = response.getAllHeaders();
    const downloadUrl = String(headers.Location || headers.location || '');
    if (!downloadUrl) {
      throw new Error('Microsoft Graph content redirect did not include a download URL.');
    }
    response = UrlFetchApp.fetch(downloadUrl, {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true
    });
    status = response.getResponseCode();
  }
  if (status < 200 || status >= 300) {
    const error = new Error(
      'OneDrive verification download failed (HTTP ' + status + ').'
    );
    error.httpStatus = status;
    throw error;
  }
  const text = response.getContentText();
  const value = JSON.parse(text);
  return {value: value, content: text, sha256: oneDriveSha256_(text)};
}

function sourceRecordGroupKey_(record) {
  return [
    String(record.sourceProvider || record.sourceType || 'manual'),
    String(record.sourceEnvironment || 'live'),
    String(record.sourceAccountId || record.sourceBatchId || 'unassigned'),
    String(record.transactionDate || '').slice(0, 4) || 'undated'
  ].join('|');
}

function emptyOneDriveSourceIndex_() {
  return {
    schemaVersion: NILAVARAM_ONEDRIVE_STORAGE_VERSION,
    storageProvider: 'Microsoft OneDrive',
    repositoryAccount: NILAVARAM_MICROSOFT_ACCOUNT,
    updatedAt: new Date().toISOString(),
    files: []
  };
}

function readOneDriveSourceIndex_() {
  const properties = PropertiesService.getScriptProperties();
  const itemId = String(properties.getProperty(
    NILAVARAM_ONEDRIVE_INDEX_PROPERTY
  ) || '');
  if (!itemId) return emptyOneDriveSourceIndex_();
  try {
    return downloadOneDriveJson_(itemId).value;
  } catch (error) {
    if (error.httpStatus === 404) {
      properties.deleteProperty(NILAVARAM_ONEDRIVE_INDEX_PROPERTY);
      return emptyOneDriveSourceIndex_();
    }
    throw error;
  }
}

function writeOneDriveSourceIndex_(index) {
  index.schemaVersion = NILAVARAM_ONEDRIVE_STORAGE_VERSION;
  index.storageProvider = 'Microsoft OneDrive';
  index.repositoryAccount = NILAVARAM_MICROSOFT_ACCOUNT;
  index.updatedAt = new Date().toISOString();
  const folderId = ensureOneDriveFolderPath_([
    NILAVARAM_ONEDRIVE_ROOT, 'System'
  ]);
  const uploaded = uploadOneDriveJson_(folderId, 'source-index.json', index);
  PropertiesService.getScriptProperties().setProperty(
    NILAVARAM_ONEDRIVE_INDEX_PROPERTY, uploaded.itemId
  );
  return uploaded;
}

function writeSourceRecordsToOneDrive_(records) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const grouped = {};
    records.forEach(function(record) {
      const key = sourceRecordGroupKey_(record);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(record);
    });
    const index = emptyOneDriveSourceIndex_();
    Object.keys(grouped).sort().forEach(function(key) {
      const groupRecords = grouped[key].sort(function(a, b) {
        return String(a.transactionDate || '').localeCompare(String(b.transactionDate || '')) ||
          String(a.sourceRecordNumber || '').localeCompare(String(b.sourceRecordNumber || ''));
      });
      const sample = groupRecords[0] || {};
      const year = String(sample.transactionDate || '').slice(0, 4) || 'Undated';
      const provider = oneDriveSafeName_(sample.sourceProvider || sample.sourceType || 'Manual');
      const account = oneDriveSafeName_(sample.sourceAccountDisplay || sample.sourceAccountId || 'Unassigned');
      const folderId = ensureOneDriveFolderPath_([
        NILAVARAM_ONEDRIVE_ROOT, 'Source Data', year, provider, account
      ]);
      const payload = {
        schemaVersion: NILAVARAM_ONEDRIVE_STORAGE_VERSION,
        groupKey: key,
        accountingYear: year,
        sourceProvider: String(sample.sourceProvider || ''),
        sourceEnvironment: String(sample.sourceEnvironment || ''),
        sourceAccountId: String(sample.sourceAccountId || ''),
        exportedAt: new Date().toISOString(),
        recordCount: groupRecords.length,
        records: groupRecords
      };
      const uploaded = uploadOneDriveJson_(folderId,
        'transactions-' + year + '.json', payload);
      const verified = downloadOneDriveJson_(uploaded.itemId);
      if (verified.sha256 !== uploaded.sha256 ||
          Number(verified.value.recordCount || 0) !== groupRecords.length) {
        throw new Error('OneDrive verification failed for ' + key + '.');
      }
      index.files.push({
        groupKey: key,
        accountingYear: year,
        provider: provider,
        account: account,
        driveId: uploaded.driveId,
        itemId: uploaded.itemId,
        fileName: uploaded.name,
        webUrl: uploaded.webUrl,
        recordCount: groupRecords.length,
        contentSha256: uploaded.sha256,
        verifiedAt: new Date().toISOString()
      });
    });
    const indexUpload = writeOneDriveSourceIndex_(index);
    PropertiesService.getScriptProperties().setProperty(
      NILAVARAM_ONEDRIVE_READY_PROPERTY, 'true'
    );
    CacheService.getScriptCache().remove('onedrive-source-records-v1');
    return {index: index, indexItemId: indexUpload.itemId};
  } finally {
    lock.releaseLock();
  }
}

function readSourceRecordsFromOneDrive_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('onedrive-source-records-v1');
  if (cached) return JSON.parse(cached);
  const index = readOneDriveSourceIndex_();
  const records = [];
  (index.files || []).forEach(function(file) {
    const downloaded = downloadOneDriveJson_(file.itemId);
    if (file.contentSha256 && downloaded.sha256 !== file.contentSha256) {
      throw new Error('OneDrive source file hash mismatch: ' + file.fileName);
    }
    Array.prototype.push.apply(records, downloaded.value.records || []);
  });
  records.forEach(function(record) {
    if (!record.id) record.id = String(record.sourceRecordId || '');
  });
  const serialized = JSON.stringify(records);
  if (serialized.length < 95000) cache.put('onedrive-source-records-v1', serialized, 120);
  return records;
}

function isOneDriveSourceBackendReady_() {
  return PropertiesService.getScriptProperties().getProperty(
    NILAVARAM_ONEDRIVE_READY_PROPERTY
  ) === 'true';
}

function getSourceRecords_() {
  return isOneDriveSourceBackendReady_()
    ? readSourceRecordsFromOneDrive_()
    : firestoreGetCollection_('sourceRecords').map(fromFirestoreDocument_);
}

function saveAllSourceRecords_(records) {
  if (!isOneDriveSourceBackendReady_()) {
    throw new Error(
      'OneDrive source storage is not initialized. Run the safe OneDrive migration first.'
    );
  }
  return writeSourceRecordsToOneDrive_(records);
}

function migrateFirestoreSourceRecordsToOneDrive() {
  // This narrow identity check intentionally avoids a Firestore user read so
  // a Firestore quota incident cannot block evacuation to OneDrive.
  const admin = requirePrimaryAdminForOneDriveStorage_();
  const existing = firestoreGetCollection_('sourceRecords').map(fromFirestoreDocument_);
  if (!existing.length) throw new Error('No Firestore source records were found to migrate.');
  const result = writeSourceRecordsToOneDrive_(existing);
  const total = (result.index.files || []).reduce(function(sum, file) {
    return sum + Number(file.recordCount || 0);
  }, 0);
  if (total !== existing.length) {
    throw new Error('Migration verification count does not match Firestore. Nothing was deleted.');
  }
  // Only one small Firestore index is attempted. A quota error here does not
  // invalidate the verified OneDrive files or enable deletion.
  try {
    firestoreSetDocument_('system', 'onedrive-source-storage', toFirestoreFields_({
      status: 'verified-copy',
      repositoryAccount: NILAVARAM_MICROSOFT_ACCOUNT,
      indexItemId: result.indexItemId,
      fileCount: result.index.files.length,
      recordCount: total,
      migratedBy: admin.email,
      migratedAt: new Date(),
      firestoreDeletionAuthorized: false
    }));
  } catch (ignoreQuotaError) {}
  try {
    writeAudit_('source-records-copied-to-onedrive', admin.email, {
      recordCount: total,
      fileCount: result.index.files.length,
      indexItemId: result.indexItemId,
      firestoreRecordsDeleted: false
    });
  } catch (ignoreQuotaError) {}
  return {
    success: true,
    recordCount: total,
    fileCount: result.index.files.length,
    indexItemId: result.indexItemId,
    message: total + ' source records were copied to ' + result.index.files.length +
      ' verified annual OneDrive file(s). Firestore records were not deleted.'
  };
}

function getOneDriveSourceStorageStatus() {
  requirePrimaryAdminForOneDriveStorage_();
  const ready = isOneDriveSourceBackendReady_();
  const index = ready ? readOneDriveSourceIndex_() : emptyOneDriveSourceIndex_();
  return {
    ready: ready,
    repositoryAccount: NILAVARAM_MICROSOFT_ACCOUNT,
    fileCount: (index.files || []).length,
    recordCount: (index.files || []).reduce(function(sum, file) {
      return sum + Number(file.recordCount || 0);
    }, 0),
    updatedAt: index.updatedAt || '',
    files: index.files || []
  };
}
