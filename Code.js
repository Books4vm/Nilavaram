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
  template.connectionsBootstrapJson = JSON.stringify(
    connectionsBootstrap
  ).replace(/</g, '\\u003c');
  template.openConnectionsOnLoadJson = JSON.stringify(validateOneDrive);
  return template.evaluate().setTitle('Nilavaram');
}

function escapeHtmlServer_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
