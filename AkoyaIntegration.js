/**
 * AkoyaIntegration.js
 * Akoya sandbox authorization and account-data connection foundation.
 *
 * Required Apps Script Properties:
 * AKOYA_ENVIRONMENT
 * AKOYA_CLIENT_ID
 * AKOYA_CLIENT_SECRET
 * AKOYA_REDIRECT_URI
 *
 * Secrets and consumer tokens remain in Apps Script Properties. They must not
 * be written to Firestore, GitHub, logs, or browser-visible page data.
 */

const NILAVARAM_AKOYA_SANDBOX_PROVIDER = 'mikomo';
const NILAVARAM_AKOYA_STATE_TTL_MS = 10 * 60 * 1000;
const NILAVARAM_AKOYA_SCOPES = 'openid profile offline_access';

function getAkoyaConfig_() {
  const properties = PropertiesService.getScriptProperties();
  return {
    environment: String(
      properties.getProperty('AKOYA_ENVIRONMENT') || 'sandbox'
    ).toLowerCase(),
    clientId: String(properties.getProperty('AKOYA_CLIENT_ID') || ''),
    clientSecret: String(
      properties.getProperty('AKOYA_CLIENT_SECRET') || ''
    ),
    redirectUri: String(
      properties.getProperty('AKOYA_REDIRECT_URI') || ''
    )
  };
}

function getMissingAkoyaConfig_(config) {
  const missing = [];
  if (!config.clientId) missing.push('AKOYA_CLIENT_ID');
  if (!config.clientSecret) missing.push('AKOYA_CLIENT_SECRET');
  if (!config.redirectUri) missing.push('AKOYA_REDIRECT_URI');
  if (config.environment !== 'sandbox') {
    missing.push('AKOYA_ENVIRONMENT=sandbox');
  }
  return missing;
}

function getAkoyaIdentityBase_(config) {
  return config.environment === 'sandbox'
    ? 'https://sandbox-idp.ddp.akoya.com'
    : 'https://idp.ddp.akoya.com';
}

function getAkoyaProductsBase_(config) {
  return config.environment === 'sandbox'
    ? 'https://sandbox-products.ddp.akoya.com'
    : 'https://products.ddp.akoya.com';
}

function buildAkoyaQueryString_(values) {
  return Object.keys(values)
    .map(function(key) {
      return encodeURIComponent(key) + '=' +
        encodeURIComponent(String(values[key]));
    })
    .join('&');
}

function getAkoyaAuthorizationUrl_() {
  const config = getAkoyaConfig_();
  const missing = getMissingAkoyaConfig_(config);
  if (missing.length) {
    throw new Error(
      'Akoya setup is waiting for these Apps Script Properties: ' +
      missing.join(', ') + '.'
    );
  }

  const state = Utilities.getUuid() + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperties({
    AKOYA_PENDING_STATE: state,
    AKOYA_PENDING_STATE_CREATED_AT: String(Date.now())
  });

  return getAkoyaIdentityBase_(config) + '/auth?' +
    buildAkoyaQueryString_({
      connector: NILAVARAM_AKOYA_SANDBOX_PROVIDER,
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: NILAVARAM_AKOYA_SCOPES,
      state: state
    });
}

function parseAkoyaResponse_(response, operation) {
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
      String(
        data.error_description ||
        data.message ||
        data.error ||
        ('HTTP ' + status)
      )
    );
  }
  return data;
}

function requestAkoyaInitialTokens_(code) {
  const config = getAkoyaConfig_();
  const authorization = Utilities.base64Encode(
    config.clientId + ':' + config.clientSecret
  );
  const response = UrlFetchApp.fetch(
    getAkoyaIdentityBase_(config) + '/token',
    {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      headers: {
        Authorization: 'Basic ' + authorization,
        Accept: 'application/json'
      },
      payload: {
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        code: String(code)
      },
      muteHttpExceptions: true
    }
  );
  return parseAkoyaResponse_(response, 'Akoya authorization');
}

function requestAkoyaRefreshTokens_(refreshToken) {
  const config = getAkoyaConfig_();
  const response = UrlFetchApp.fetch(
    getAkoyaIdentityBase_(config) + '/token',
    {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      payload: {
        grant_type: 'refresh_token',
        refresh_token: String(refreshToken),
        client_id: config.clientId,
        client_secret: config.clientSecret
      },
      muteHttpExceptions: true
    }
  );
  return parseAkoyaResponse_(response, 'Akoya token refresh');
}

function storeAkoyaTokens_(tokens) {
  const values = {
    AKOYA_ID_TOKEN: String(tokens.id_token || ''),
    AKOYA_ID_TOKEN_EXPIRES_AT: String(
      Date.now() + (Number(tokens.expires_in || 900) * 1000)
    ),
    AKOYA_CONNECTED_PROVIDER: NILAVARAM_AKOYA_SANDBOX_PROVIDER,
    AKOYA_CONNECTED_AT: new Date().toISOString()
  };
  if (tokens.refresh_token) {
    values.AKOYA_REFRESH_TOKEN = String(tokens.refresh_token);
  }
  PropertiesService.getScriptProperties().setProperties(values);
}

function getAkoyaIdToken_() {
  const properties = PropertiesService.getScriptProperties();
  const idToken = String(properties.getProperty('AKOYA_ID_TOKEN') || '');
  const expiresAt = Number(
    properties.getProperty('AKOYA_ID_TOKEN_EXPIRES_AT') || 0
  );
  if (idToken && expiresAt > Date.now() + 120000) return idToken;

  const refreshToken = String(
    properties.getProperty('AKOYA_REFRESH_TOKEN') || ''
  );
  if (!refreshToken) {
    throw new Error(
      'Akoya Sandbox is not connected. Select Connect Akoya Sandbox.'
    );
  }
  const tokens = requestAkoyaRefreshTokens_(refreshToken);
  storeAkoyaTokens_(tokens);
  return String(tokens.id_token || '');
}

function completeAkoyaAuthorization_(parameters) {
  const properties = PropertiesService.getScriptProperties();
  const expectedState = String(
    properties.getProperty('AKOYA_PENDING_STATE') || ''
  );
  const createdAt = Number(
    properties.getProperty('AKOYA_PENDING_STATE_CREATED_AT') || 0
  );
  properties.deleteProperty('AKOYA_PENDING_STATE');
  properties.deleteProperty('AKOYA_PENDING_STATE_CREATED_AT');

  if (parameters.error) {
    throw new Error(
      'Akoya authorization was not completed: ' +
      String(parameters.error_description || parameters.error)
    );
  }
  if (!expectedState || String(parameters.state || '') !== expectedState) {
    throw new Error(
      'Akoya security validation failed. Start the connection again.'
    );
  }
  if (!createdAt || Date.now() - createdAt > NILAVARAM_AKOYA_STATE_TTL_MS) {
    throw new Error(
      'Akoya authorization expired. Start the connection again.'
    );
  }
  if (!parameters.code) {
    throw new Error('Akoya did not return an authorization code.');
  }

  const tokens = requestAkoyaInitialTokens_(parameters.code);
  if (!tokens.id_token || !tokens.refresh_token) {
    throw new Error('Akoya did not return the required connection tokens.');
  }
  storeAkoyaTokens_(tokens);
  return getAkoyaConnectionStatus_();
}

function akoyaGet_(path, interactionType) {
  const config = getAkoyaConfig_();
  const response = UrlFetchApp.fetch(
    getAkoyaProductsBase_(config) + path,
    {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + getAkoyaIdToken_(),
        Accept: 'application/json',
        'x-akoya-interaction-type': interactionType || 'user',
        'x-akoya-intent-type': 'nonpayments',
        'x-akoya-last-access': new Date().toISOString()
      },
      muteHttpExceptions: true
    }
  );
  return parseAkoyaResponse_(response, 'Akoya data request');
}

function readAkoyaSandboxAccounts_() {
  return akoyaGet_(
    '/accounts/v3/' + NILAVARAM_AKOYA_SANDBOX_PROVIDER +
    '?mode=standard&offset=0&limit=50',
    'user'
  );
}

function countAkoyaAccounts_(payload) {
  if (!payload) return 0;
  if (Array.isArray(payload.accounts)) return payload.accounts.length;
  const categories = [
    'depositAccount',
    'loanAccount',
    'locAccount',
    'investmentAccount',
    'insuranceAccount',
    'annuityAccount'
  ];
  return categories.reduce(function(total, category) {
    const value = payload[category];
    if (Array.isArray(value)) return total + value.length;
    return total + (value ? 1 : 0);
  }, 0);
}

function getAkoyaConnectionStatus_() {
  const config = getAkoyaConfig_();
  const missing = getMissingAkoyaConfig_(config);
  const properties = PropertiesService.getScriptProperties();
  const connected = Boolean(
    properties.getProperty('AKOYA_REFRESH_TOKEN')
  );
  return {
    configured: missing.length === 0,
    connected: connected,
    environment: config.environment,
    provider: connected
      ? String(
        properties.getProperty('AKOYA_CONNECTED_PROVIDER') ||
        NILAVARAM_AKOYA_SANDBOX_PROVIDER
      )
      : '',
    connectedAt: connected
      ? String(properties.getProperty('AKOYA_CONNECTED_AT') || '')
      : '',
    missingProperties: missing,
    validationState: connected
      ? 'Authorization saved; live account check pending'
      : 'Not connected'
  };
}

function validateAkoyaConnectionForUi() {
  const status = getAkoyaConnectionStatus_();
  if (!status.configured) {
    throw new Error(
      'Missing secure settings: ' +
      status.missingProperties.join(', ') + '.'
    );
  }
  if (!status.connected) return status;

  const accounts = readAkoyaSandboxAccounts_();
  status.accountCount = countAkoyaAccounts_(accounts);
  status.validationState = 'Live Akoya Sandbox validation passed';
  status.checkedAt = new Date().toISOString();
  return status;
}
