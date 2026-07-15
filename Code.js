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
function doGet() {
  return HtmlService
    .createTemplateFromFile('Dashboard')
    .evaluate()
    .setTitle('Nilavaram Administration');
}