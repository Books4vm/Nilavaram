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
