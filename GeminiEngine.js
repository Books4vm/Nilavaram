/**
 * GeminiEngine.js
 * Google AI Studio (Gemini) via UrlFetchApp — key in Script property GEMINI_API_KEY.
 */

/** Change model here if AI Studio returns 404 (see AI Studio model list). */
const GEMINI_MODEL_ID = 'gemini-3.6-flash';

function getGeminiApiKey_() {
  const key = String(
    PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || ''
  ).trim();
  if (!key) {
    throw new Error(
      'Missing GEMINI_API_KEY in Script properties (Project settings).'
    );
  }
  return key;
}

/**
 * @param {string} promptText User prompt.
 * @returns {string} Model text or error message.
 */
function callGemini(promptText) {
  const apiKey = getGeminiApiKey_();
  const prompt = String(promptText || '').trim();
  if (!prompt) {
    return 'Error: prompt is empty.';
  }

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    GEMINI_MODEL_ID +
    ':generateContent?key=' +
    encodeURIComponent(apiKey);

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status !== 200) {
    Logger.log('Gemini HTTP ' + status + ': ' + body);
    return 'Error generating response (HTTP ' + status + '). Check Executions log.';
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch (error) {
    Logger.log('Gemini parse error: ' + body);
    return 'Error parsing Gemini response.';
  }

  const parts = json.candidates &&
    json.candidates[0] &&
    json.candidates[0].content &&
    json.candidates[0].content.parts;

  if (parts && parts[0] && parts[0].text) {
    return parts[0].text;
  }

  Logger.log('Gemini unexpected response: ' + body);
  return 'Error generating response (no text in candidates).';
}

/** Run from editor: select testGemini → Run */
function testGemini() {
  const result = callGemini('Explain compounding interest in two sentences.');
  Logger.log(result);
}

function listGeminiModels() {
  const apiKey = getGeminiApiKey_();
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models?key=' +
    encodeURIComponent(apiKey);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  Logger.log(response.getContentText());
}