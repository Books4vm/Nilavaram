/**
 * MicrosoftGraph.js
 * Central Microsoft Graph authentication and OneDrive connection.
 *
 * Required Apps Script Properties:
 * MICROSOFT_CLIENT_ID
 * MICROSOFT_CLIENT_SECRET
 * MICROSOFT_REDIRECT_URI
 *
 * Sensitive credentials and tokens stay in Apps Script Properties. Firestore
 * receives only non-secret connection status and storage metadata.
 */

const NILAVARAM_MICROSOFT_ACCOUNT = 'vmurugan@hotmail.com';
const NILAVARAM_MICROSOFT_TENANT = 'consumers';
const NILAVARAM_MICROSOFT_SCOPES =
  'offline_access User.Read Files.ReadWrite';
const NILAVARAM_MICROSOFT_AUTH_STATE_TTL_MS = 10 * 60 * 1000;

function getMicrosoftConfig_() {
  const properties = PropertiesService.getScriptProperties();
  return {
    clientId: String(properties.getProperty('MICROSOFT_CLIENT_ID') || ''),
    clientSecret: String(
      properties.getProperty('MICROSOFT_CLIENT_SECRET') || ''
    ),
    redirectUri: String(
      properties.getProperty('MICROSOFT_REDIRECT_URI') || ''
    )
  };
}

function getMissingMicrosoftConfig_(config) {
  const missing = [];
  if (!config.clientId) missing.push('MICROSOFT_CLIENT_ID');
  if (!config.clientSecret) missing.push('MICROSOFT_CLIENT_SECRET');
  if (!config.redirectUri) missing.push('MICROSOFT_REDIRECT_URI');
  return missing;
}

function getMicrosoftAuthorizeEndpoint_() {
  return 'https://login.microsoftonline.com/' +
    NILAVARAM_MICROSOFT_TENANT + '/oauth2/v2.0/authorize';
}

function getMicrosoftTokenEndpoint_() {
  return 'https://login.microsoftonline.com/' +
    NILAVARAM_MICROSOFT_TENANT + '/oauth2/v2.0/token';
}

function buildQueryString_(values) {
  return Object.keys(values)
    .map(function(key) {
      return encodeURIComponent(key) + '=' +
        encodeURIComponent(String(values[key]));
    })
    .join('&');
}

/**
 * Returns a Microsoft authorization URL for the central repository account.
 * Only an active Nilavaram Admin may begin this flow.
 */
function getMicrosoftAuthorizationUrl() {
  const admin = requireAdmin_();
  const config = getMicrosoftConfig_();
  const missing = getMissingMicrosoftConfig_(config);
  if (missing.length) {
    throw new Error(
      'Microsoft Graph setup is waiting for these Apps Script Properties: ' +
      missing.join(', ') + '.'
    );
  }

  const state = Utilities.getUuid() + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperties({
    MICROSOFT_PENDING_STATE: state,
    MICROSOFT_PENDING_STATE_CREATED_AT: String(Date.now()),
    MICROSOFT_PENDING_STATE_STARTED_BY: admin.email
  });

  return {
    authorizationUrl: getMicrosoftAuthorizeEndpoint_() + '?' +
      buildQueryString_({
        client_id: config.clientId,
        response_type: 'code',
        redirect_uri: config.redirectUri,
        response_mode: 'query',
        scope: NILAVARAM_MICROSOFT_SCOPES,
        state: state,
        prompt: 'select_account'
      }),
    expectedAccount: NILAVARAM_MICROSOFT_ACCOUNT
  };
}

function parseMicrosoftResponse_(response, operation) {
  const status = response.getResponseCode();
  const text = response.getContentText();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(operation + ' returned an unreadable response.');
  }
  if (status < 200 || status >= 300) {
    throw new Error(
      operation + ' failed: ' +
      String(data.error_description || data.error &&
        data.error.message || data.error || ('HTTP ' + status))
    );
  }
  return data;
}

function requestMicrosoftToken_(payload) {
  const response = UrlFetchApp.fetch(getMicrosoftTokenEndpoint_(), {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: payload,
    muteHttpExceptions: true
  });
  return parseMicrosoftResponse_(response, 'Microsoft authorization');
}

function storeMicrosoftTokens_(tokens) {
  const properties = PropertiesService.getScriptProperties();
  const values = {
    MICROSOFT_ACCESS_TOKEN: String(tokens.access_token || ''),
    MICROSOFT_ACCESS_TOKEN_EXPIRES_AT: String(
      Date.now() + (Number(tokens.expires_in || 3600) * 1000)
    )
  };
  if (tokens.refresh_token) {
    values.MICROSOFT_REFRESH_TOKEN = String(tokens.refresh_token);
  }
  properties.setProperties(values);
}

function getMicrosoftAccessToken_(forceRefresh) {
  const properties = PropertiesService.getScriptProperties();
  const accessToken = String(
    properties.getProperty('MICROSOFT_ACCESS_TOKEN') || ''
  );
  const expiresAt = Number(
    properties.getProperty('MICROSOFT_ACCESS_TOKEN_EXPIRES_AT') || 0
  );
  if (!forceRefresh && accessToken && expiresAt > Date.now() + 120000) {
    return accessToken;
  }

  const refreshToken = String(
    properties.getProperty('MICROSOFT_REFRESH_TOKEN') || ''
  );
  if (!refreshToken) {
    throw new Error('OneDrive is not connected. Select Connect OneDrive.');
  }

  const config = getMicrosoftConfig_();
  const tokens = requestMicrosoftToken_({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    redirect_uri: config.redirectUri,
    scope: NILAVARAM_MICROSOFT_SCOPES
  });
  storeMicrosoftTokens_(tokens);
  return String(tokens.access_token);
}

function clearMicrosoftAccessToken_() {
  const properties = PropertiesService.getScriptProperties();
  properties.deleteProperty('MICROSOFT_ACCESS_TOKEN');
  properties.deleteProperty('MICROSOFT_ACCESS_TOKEN_EXPIRES_AT');
}

function microsoftGraphGet_(path) {
  const url = 'https://graph.microsoft.com/v1.0' + path;
  let response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {Authorization: 'Bearer ' + getMicrosoftAccessToken_()},
    muteHttpExceptions: true
  });
  if (response.getResponseCode() === 401) {
    clearMicrosoftAccessToken_();
    response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {Authorization: 'Bearer ' + getMicrosoftAccessToken_(true)},
      muteHttpExceptions: true
    });
  }
  return parseMicrosoftResponse_(response, 'Microsoft Graph');
}

function toGigabytes_(bytes) {
  return Math.round((Number(bytes || 0) / 1073741824) * 10) / 10;
}

function readMicrosoftDriveSummary_() {
  const profile = microsoftGraphGet_(
    '/me?$select=mail,userPrincipalName'
  );
  const drive = microsoftGraphGet_(
    '/me/drive?$select=id,driveType,owner,quota,webUrl'
  );
  const ownerEmail = normalizeEmail_(
    profile.mail || profile.userPrincipalName
  );
  if (ownerEmail !== NILAVARAM_MICROSOFT_ACCOUNT) {
    throw new Error(
      'Wrong Microsoft account connected. Sign in as ' +
      NILAVARAM_MICROSOFT_ACCOUNT + '.'
    );
  }
  return {
    connected: true,
    account: ownerEmail,
    driveId: String(drive.id || ''),
    driveType: String(drive.driveType || ''),
    webUrl: String(drive.webUrl || ''),
    totalGb: toGigabytes_(drive.quota && drive.quota.total),
    usedGb: toGigabytes_(drive.quota && drive.quota.used),
    remainingGb: toGigabytes_(drive.quota && drive.quota.remaining),
    quotaState: String(drive.quota && drive.quota.state || 'unknown'),
    checkedAt: new Date()
  };
}

function saveMicrosoftConnectionSummary_(summary) {
  firestoreSetDocument_(
    'system',
    'microsoft-graph',
    toFirestoreFields_({
      provider: 'Microsoft Graph',
      account: summary.account,
      status: 'connected',
      driveId: summary.driveId,
      driveType: summary.driveType,
      webUrl: summary.webUrl,
      totalGb: summary.totalGb,
      usedGb: summary.usedGb,
      remainingGb: summary.remainingGb,
      quotaState: summary.quotaState,
      checkedAt: summary.checkedAt,
      updatedAt: new Date()
    })
  );
}

/**
 * Handles the Microsoft redirect delivered to the Nilavaram web app.
 */
function completeMicrosoftAuthorization_(parameters) {
  const admin = requireAdmin_();
  const properties = PropertiesService.getScriptProperties();
  const expectedState = String(
    properties.getProperty('MICROSOFT_PENDING_STATE') || ''
  );
  const createdAt = Number(
    properties.getProperty('MICROSOFT_PENDING_STATE_CREATED_AT') || 0
  );
  const state = String(parameters && parameters.state || '');

  if (!expectedState || state !== expectedState ||
      Date.now() - createdAt > NILAVARAM_MICROSOFT_AUTH_STATE_TTL_MS) {
    throw new Error('The Microsoft sign-in request is invalid or expired.');
  }
  if (parameters.error) {
    throw new Error(
      'Microsoft sign-in was not completed: ' +
      String(parameters.error_description || parameters.error)
    );
  }
  const code = String(parameters.code || '');
  if (!code) throw new Error('Microsoft did not return an authorization code.');

  const config = getMicrosoftConfig_();
  const tokens = requestMicrosoftToken_({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: config.redirectUri,
    scope: NILAVARAM_MICROSOFT_SCOPES
  });
  storeMicrosoftTokens_(tokens);
  properties.deleteProperty('MICROSOFT_PENDING_STATE');
  properties.deleteProperty('MICROSOFT_PENDING_STATE_CREATED_AT');
  properties.deleteProperty('MICROSOFT_PENDING_STATE_STARTED_BY');

  const summary = readMicrosoftDriveSummary_();
  saveMicrosoftConnectionSummary_(summary);
  writeAudit_('microsoft-graph-connected', summary.account, {
    driveId: summary.driveId,
    driveType: summary.driveType,
    remainingGb: summary.remainingGb,
    connectedBy: admin.email
  });
  return summary;
}

function getMicrosoftConnectionStatus() {
  requireAdmin_();
  const config = getMicrosoftConfig_();
  const missing = getMissingMicrosoftConfig_(config);
  const properties = PropertiesService.getScriptProperties();
  const hasRefreshToken = Boolean(
    properties.getProperty('MICROSOFT_REFRESH_TOKEN')
  );

  if (missing.length) {
    return {
      configured: false,
      connected: false,
      expectedAccount: NILAVARAM_MICROSOFT_ACCOUNT,
      missingProperties: missing
    };
  }
  if (!hasRefreshToken) {
    return {
      configured: true,
      connected: false,
      expectedAccount: NILAVARAM_MICROSOFT_ACCOUNT,
      missingProperties: []
    };
  }

  const summary = readMicrosoftDriveSummary_();
  saveMicrosoftConnectionSummary_(summary);
  summary.configured = true;
  summary.expectedAccount = NILAVARAM_MICROSOFT_ACCOUNT;
  return summary;
}

/**
 * Performs the narrow live Graph verification used by the Connections UI.
 * It intentionally avoids Firestore/user lookups so a storage check cannot be
 * blocked by an unrelated database request.
 */
function validateMicrosoftConnectionForUi() {
  const config = getMicrosoftConfig_();
  const missing = getMissingMicrosoftConfig_(config);
  if (missing.length) {
    throw new Error(
      'Missing secure settings: ' + missing.join(', ') + '.'
    );
  }
  const summary = readMicrosoftDriveSummary_();
  summary.configured = true;
  summary.expectedAccount = NILAVARAM_MICROSOFT_ACCOUNT;
  return summary;
}
