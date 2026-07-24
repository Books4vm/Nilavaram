/**
 * Firestore.gs
 * Nilavaram Firestore connection engine.
 */

/**
 * Returns the configured Google Cloud Project ID.
 *
 * @returns {string}
 */
function getFirestoreProjectId_() {
  const projectId = PropertiesService
    .getScriptProperties()
    .getProperty('FIRESTORE_PROJECT_ID');

  if (!projectId) {
    throw new Error(
      'FIRESTORE_PROJECT_ID is missing from Apps Script Properties.'
    );
  }

  return projectId;
}

/**
 * Returns the base Firestore REST API URL.
 *
 * @returns {string}
 */
function getFirestoreBaseUrl_() {
  const projectId = getFirestoreProjectId_();

  return (
    'https://firestore.googleapis.com/v1/projects/' +
    encodeURIComponent(projectId) +
    '/databases/(default)/documents'
  );
}

/**
 * Sends an authenticated request to Firestore.
 *
 * @param {string} url Firestore REST API URL.
 * @param {string} method HTTP method.
 * @param {Object=} payload Optional request body.
 * @returns {Object}
 */
function firestoreRequest_(url, method, payload) {
  const options = {
    method: method,
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions: true
  };

  if (payload !== undefined) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(
      'Firestore request failed.\n' +
      'HTTP status: ' + statusCode + '\n' +
      'Response: ' + responseText
    );
  }

  return responseText ? JSON.parse(responseText) : {};
}

/**
 * Creates or updates a Firestore document.
 *
 * @param {string} collectionName Firestore collection.
 * @param {string} documentId Firestore document ID.
 * @param {Object} firestoreFields Fields in Firestore REST format.
 * @returns {Object}
 */
function firestoreSetDocument_(
  collectionName,
  documentId,
  firestoreFields
) {
  const url =
    getFirestoreBaseUrl_() +
    '/' + encodeURIComponent(collectionName) +
    '/' + encodeURIComponent(documentId);

  return firestoreRequest_(url, 'patch', {
    fields: firestoreFields
  });
}

/**
 * Reads one Firestore document.
 *
 * @param {string} collectionName Firestore collection.
 * @param {string} documentId Firestore document ID.
 * @returns {Object}
 */
function firestoreGetDocument_(collectionName, documentId) {
  const url =
    getFirestoreBaseUrl_() +
    '/' + encodeURIComponent(collectionName) +
    '/' + encodeURIComponent(documentId);

  return firestoreRequest_(url, 'get');
}

/**
 * Reads every document in a Firestore collection.
 *
 * @param {string} collectionName Firestore collection.
 * @returns {Object[]}
 */
function firestoreGetCollection_(collectionName) {
  const url =
    getFirestoreBaseUrl_() +
    '/' + encodeURIComponent(collectionName) +
    '?pageSize=300';

  const result = firestoreRequest_(url, 'get');
  return result.documents || [];
}

/**
 * Converts an ordinary JavaScript value to Firestore REST format.
 *
 * @param {*} value JavaScript value.
 * @returns {Object}
 */
function toFirestoreValue_(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(toFirestoreValue_)
      }
    };
  }
  if (typeof value === 'object') {
    const fields = {};
    Object.keys(value).forEach(function(key) {
      fields[key] = toFirestoreValue_(value[key]);
    });
    return { mapValue: { fields: fields } };
  }
  return { stringValue: String(value) };
}

/**
 * Converts a plain object to Firestore REST fields.
 *
 * @param {Object} object Plain JavaScript object.
 * @returns {Object}
 */
function toFirestoreFields_(object) {
  const fields = {};
  Object.keys(object).forEach(function(key) {
    fields[key] = toFirestoreValue_(object[key]);
  });
  return fields;
}

/**
 * Converts a Firestore REST value to an ordinary JavaScript value.
 *
 * @param {Object} value Firestore REST value.
 * @returns {*}
 */
function fromFirestoreValue_(value) {
  if (!value) return null;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(fromFirestoreValue_);
  }
  if ('mapValue' in value) {
    return fromFirestoreFields_(value.mapValue.fields || {});
  }
  return null;
}

/**
 * Converts Firestore REST fields to a plain object.
 *
 * @param {Object} fields Firestore fields.
 * @returns {Object}
 */
function fromFirestoreFields_(fields) {
  const object = {};
  Object.keys(fields || {}).forEach(function(key) {
    object[key] = fromFirestoreValue_(fields[key]);
  });
  return object;
}

/**
 * Converts a Firestore REST document to a plain object with its ID.
 *
 * @param {Object} document Firestore REST document.
 * @returns {Object}
 */
function fromFirestoreDocument_(document) {
  const object = fromFirestoreFields_(document.fields || {});
  object.id = document.name.split('/').pop();
  return object;
}
