/**
 * Code.js
 * Nilavaram application entry points.
 */

/**
 * This project is intentionally standalone and does not rely on a
 * Google Sheet or any spreadsheet UI. The web app entry point is
 * doGet() below.
 */

/**
 * Allows HTML files to include reusable HTML fragments later.
 *
 * @param {string} filename HTML filename without extension.
 * @returns {string}
 */
function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

/**
 * Web application entry point.
 *
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  const parameters = e && e.parameter || {};
  if (parameters.accountWindow === 'new') {
    const accountTemplate = HtmlService.createTemplateFromFile('AccountWindow');
    accountTemplate.ownerJson = JSON.stringify(String(parameters.owner || 'all'));
    accountTemplate.categoryJson = JSON.stringify(String(parameters.category || 'member-payment'));
    return accountTemplate.evaluate().setTitle('Nilavaram — Add New ACODE');
  }
  if (parameters.reconnectOneDrive === '1') {
    try {
      const request = getMicrosoftRecoveryAuthorizationUrl_();
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Reconnect OneDrive</title></head><body>' +
        '<h1>Reconnect OneDrive</h1>' +
        '<p>Microsoft must issue fresh authorization for the Nilavaram ' +
        'repository account.</p>' +
        '<p><b>Expected account:</b> ' +
        escapeHtmlServer_(request.expectedAccount) + '</p>' +
        '<p><a href="' + escapeHtmlServer_(request.authorizationUrl) +
        '" target="_top">Continue to Microsoft sign-in</a></p>' +
        '<p>Sign in only as the expected Microsoft account. Do not share its ' +
        'password, code or token in Nilavaram or this chat.</p>' +
        '</body></html>'
      ).setTitle('Reconnect OneDrive');
    } catch (error) {
      return buildAuthorizationErrorPage_('Reconnect OneDrive', error);
    }
  }
  if (parameters.migrateOneDriveSource === '1') {
    try {
      const result = migrateFirestoreSourceRecordsToOneDrive();
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>OneDrive Recovery Completed</title></head><body>' +
        '<h1>OneDrive recovery completed</h1>' +
        '<p><b>' + escapeHtmlServer_(result.message) + '</b></p>' +
        '<p>Recovery mode is now disabled. Firestore records were retained.</p>' +
        '<p><a href="' + escapeHtmlServer_(
          buildStorageAccessInfo_().appsScriptWebApp
        ) + '" target="_top">Return to Nilavaram</a></p>' +
        '</body></html>'
      ).setTitle('OneDrive Recovery Completed');
    } catch (error) {
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>OneDrive Recovery Status</title></head><body>' +
        '<h1>OneDrive recovery did not complete</h1>' +
        '<p><b>' + escapeHtmlServer_(error && error.message || error) + '</b></p>' +
        '<p>No Firestore records were deleted.</p>' +
        (String(error && error.message || error).indexOf('Unauthenticated') !== -1
          ? '<p><a href="' + escapeHtmlServer_(
              buildStorageAccessInfo_().appsScriptWebApp
            ) + '?reconnectOneDrive=1" target="_top">Reconnect OneDrive</a>, ' +
            'then run the recovery again.</p>'
          : '<p>If the message says quota exceeded, wait for the Firestore daily ' +
            'quota to reset and use this link again.</p>') +
        '<p><a href="' + escapeHtmlServer_(
          buildStorageAccessInfo_().appsScriptWebApp
        ) + '" target="_top">Return to Nilavaram</a></p>' +
        '</body></html>'
      ).setTitle('OneDrive Recovery Status');
    }
  }
  if (parameters.reviewWindow === 'acode') {
    const reviewTemplate = HtmlService.createTemplateFromFile('ReviewWindow');
    reviewTemplate.groupKeyJson = JSON.stringify(
      String(parameters.groupKey || '')
    ).replace(/</g, '\\u003c');
    return reviewTemplate.evaluate().setTitle('Nilavaram ACODE Assignment');
  }
  if (parameters.startAkoya === '1') {
    try {
      const authorizationUrl = getAkoyaAuthorizationUrl_();
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Connect Akoya Sandbox</title></head><body>' +
        '<h1>Connect Akoya Sandbox</h1>' +
        '<p>You are leaving Nilavaram for Akoya’s secure sandbox ' +
        'authorization page.</p>' +
        '<p><a href="' + escapeHtmlServer_(authorizationUrl) +
        '" target="_top">Continue to Akoya Sandbox</a></p>' +
        '<p>Use only Akoya sandbox test credentials. Do not enter a real ' +
        'bank password during sandbox testing.</p>' +
        '</body></html>'
      ).setTitle('Connect Akoya Sandbox');
    } catch (error) {
      return buildAuthorizationErrorPage_(
        'Akoya Sandbox Connection',
        error
      );
    }
  }
  if (
    parameters.provider === 'akoya' &&
    (parameters.code || parameters.error)
  ) {
    try {
      const akoyaStatus = completeAkoyaAuthorization_(parameters);
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Akoya Sandbox Connected</title></head><body>' +
        '<h1>Akoya Sandbox connected</h1>' +
        '<p>Provider: ' +
        escapeHtmlServer_(akoyaStatus.provider) + '.</p>' +
        '<p>The authorization token is stored securely. No sandbox ' +
        'transactions have been posted to the books.</p>' +
        '<p><a href="' + escapeHtmlServer_(
          buildStorageAccessInfo_().appsScriptWebApp
        ) + '?validateAkoya=1" target="_top">' +
        'Validate the sandbox account connection</a></p>' +
        '</body></html>'
      ).setTitle('Akoya Sandbox Connected');
    } catch (error) {
      return buildAuthorizationErrorPage_(
        'Akoya Sandbox Connection',
        error
      );
    }
  }
  if (parameters.importAkoyaSandbox === '1') {
    try {
      const importResult = importAkoyaSandboxCheckingTransactions();
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Akoya Sandbox Import</title></head><body>' +
        '<h1>Akoya sandbox source import completed</h1>' +
        '<p><b>Account:</b> ' +
        escapeHtmlServer_(importResult.accountDisplay) + ' (' +
        escapeHtmlServer_(importResult.accountType) + ')</p>' +
        '<p><b>Downloaded:</b> ' +
        escapeHtmlServer_(importResult.downloadedCount) + '</p>' +
        '<p><b>Added to source input:</b> ' +
        escapeHtmlServer_(importResult.addedCount) + '</p>' +
        '<p><b>Duplicates safely skipped:</b> ' +
        escapeHtmlServer_(importResult.duplicateSkippedCount) + '</p>' +
        '<p><b>Invalid records skipped:</b> ' +
        escapeHtmlServer_(importResult.invalidSkippedCount) + '</p>' +
        '<p><b>Books status:</b> Outside the books</p>' +
        '<p><b>Posting status:</b> Not posted</p>' +
        '<p><a href="' + escapeHtmlServer_(
          buildStorageAccessInfo_().appsScriptWebApp
        ) + '" target="_top">Return to Nilavaram</a></p>' +
        '</body></html>'
      ).setTitle('Akoya Sandbox Import');
    } catch (error) {
      return buildAuthorizationErrorPage_(
        'Akoya Sandbox Import',
        error
      );
    }
  }
  if (parameters.code || parameters.error) {
    try {
      const summary = completeMicrosoftAuthorization_(parameters);
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>OneDrive Connected</title></head><body>' +
        '<h1>OneDrive connected</h1>' +
        '<p>Nilavaram is connected to ' +
        escapeHtmlServer_(summary.account) + '.</p>' +
        '<p>Available space: ' +
        escapeHtmlServer_(String(summary.remainingGb)) + ' GB.</p>' +
        '<p>You may close this page and refresh Connections in Nilavaram.</p>' +
        '</body></html>'
      ).setTitle('OneDrive Connected');
    } catch (error) {
      return HtmlService.createHtmlOutput(
        '<!doctype html><html><head><base target="_top">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>OneDrive Connection</title></head><body>' +
        '<h1>Connection not completed</h1><p>' +
        escapeHtmlServer_(error.message) + '</p>' +
        '<p>Return to Nilavaram Connections and try again.</p>' +
        '</body></html>'
      ).setTitle('OneDrive Connection');
    }
  }
  const template = HtmlService.createTemplateFromFile('Dashboard');
  const validateOneDrive = parameters.validateOneDrive === '1';
  const validateAkoya = parameters.validateAkoya === '1';
  let connectionsBootstrap = buildConnectionsBootstrap_();
  if (validateOneDrive) {
    try {
      connectionsBootstrap.microsoftStatus =
        validateMicrosoftConnectionForUi();
      connectionsBootstrap.liveValidationPassed = true;
    } catch (error) {
      connectionsBootstrap.liveValidationError =
        String(error && error.message || error);
    }
  }
  if (validateAkoya) {
    try {
      connectionsBootstrap.akoyaStatus =
        validateAkoyaConnectionForUi();
      connectionsBootstrap.akoyaValidationPassed = true;
    } catch (error) {
      connectionsBootstrap.akoyaValidationError =
        String(error && error.message || error);
    }
  }
  template.connectionsBootstrapJson = JSON.stringify(
    connectionsBootstrap
  ).replace(/</g, '\\u003c');
  template.openConnectionsOnLoadJson = JSON.stringify(
    validateOneDrive || validateAkoya
  );
  return template.evaluate().setTitle('Nilavaram');
}

function buildAuthorizationErrorPage_(title, error) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><base target="_top">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + escapeHtmlServer_(title) + '</title></head><body>' +
    '<h1>Connection not completed</h1><p>' +
    escapeHtmlServer_(error && error.message || error) + '</p>' +
    '<p>Return to Nilavaram Connections and try again.</p>' +
    '</body></html>'
  ).setTitle(title);
}

function escapeHtmlServer_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
