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
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
