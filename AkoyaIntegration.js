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
    ).trim().toLowerCase(),
    clientId: String(
      properties.getProperty('AKOYA_CLIENT_ID') || ''
    ).trim(),
    clientSecret: String(
      properties.getProperty('AKOYA_CLIENT_SECRET') || ''
    ).trim(),
    redirectUri: String(
      properties.getProperty('AKOYA_REDIRECT_URI') || ''
    ).trim()
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
    config.clientId + ':' + config.clientSecret,
    Utilities.Charset.UTF_8
  );
  const payload = {
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
    code: String(code)
  };
  let response = UrlFetchApp.fetch(
    getAkoyaIdentityBase_(config) + '/token',
    {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      headers: {
        Authorization: 'Basic ' + authorization,
        Accept: 'application/json'
      },
      payload: payload,
      muteHttpExceptions: true
    }
  );
  if (response.getResponseCode() === 401) {
    payload.client_id = config.clientId;
    payload.client_secret = config.clientSecret;
    response = UrlFetchApp.fetch(
      getAkoyaIdentityBase_(config) + '/token',
      {
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        headers: {
          Accept: 'application/json'
        },
        payload: payload,
        muteHttpExceptions: true
      }
    );
  }
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

function akoyaSha256Hex_(value) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  ).map(function(byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ('0' + unsigned.toString(16)).slice(-2);
  }).join('');
}

function unwrapAkoyaAccount_(item) {
  if (!item || typeof item !== 'object') return null;
  const categories = [
    'depositAccount',
    'loanAccount',
    'locAccount',
    'investmentAccount',
    'insuranceAccount',
    'annuityAccount'
  ];
  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];
    if (item[category]) {
      const account = item[category];
      account.akoyaAccountCategory = category;
      return account;
    }
  }
  return item.accountId ? item : null;
}

function flattenAkoyaAccounts_(payload) {
  const result = [];
  if (!payload || typeof payload !== 'object') return result;
  (payload.accounts || []).forEach(function(item) {
    const account = unwrapAkoyaAccount_(item);
    if (account) result.push(account);
  });
  [
    'depositAccount',
    'loanAccount',
    'locAccount',
    'investmentAccount',
    'insuranceAccount',
    'annuityAccount'
  ].forEach(function(category) {
    const values = payload[category];
    if (!values) return;
    (Array.isArray(values) ? values : [values]).forEach(function(value) {
      const account = unwrapAkoyaAccount_(
        value.accountId ? value : (function() {
          const wrapped = {};
          wrapped[category] = value;
          return wrapped;
        })()
      );
      if (account && !result.some(function(existing) {
        return String(existing.accountId) === String(account.accountId);
      })) {
        result.push(account);
      }
    });
  });
  return result;
}

function selectAkoyaCheckingAccount_(payload) {
  const accounts = flattenAkoyaAccounts_(payload);
  const checking = accounts.filter(function(account) {
    return String(account.accountType || '').toUpperCase() === 'CHECKING';
  });
  if (!checking.length) {
    throw new Error(
      'The permissioned Akoya sandbox data does not contain a checking account.'
    );
  }
  return checking[0];
}

function unwrapAkoyaTransaction_(item) {
  if (!item || typeof item !== 'object') return null;
  const keys = Object.keys(item);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    if (/Transaction$/.test(key) && item[key]) return item[key];
  }
  return item.transactionId ? item : null;
}

function flattenAkoyaTransactions_(payload) {
  return (payload && payload.transactions || [])
    .map(unwrapAkoyaTransaction_)
    .filter(function(item) { return Boolean(item); });
}

function readAllAkoyaCheckingTransactions_(accountId, startTime, endTime) {
  const limit = 50;
  const transactions = [];
  let offset = 0;
  for (let page = 0; page < 10; page += 1) {
    const payload = akoyaGet_(
      '/transactions/v3/' + NILAVARAM_AKOYA_SANDBOX_PROVIDER +
      '/' + encodeURIComponent(accountId) + '?' +
      buildAkoyaQueryString_({
        mode: 'standard',
        startTime: startTime,
        endTime: endTime,
        offset: offset,
        limit: limit
      }),
      'batch'
    );
    const pageTransactions = flattenAkoyaTransactions_(payload);
    Array.prototype.push.apply(transactions, pageTransactions);
    if (pageTransactions.length < limit) break;
    offset += pageTransactions.length;
  }
  return transactions;
}

function akoyaTransactionDate_(transaction) {
  const value = String(
    transaction.postedTimestamp ||
    transaction.transactionTimestamp ||
    transaction.memoTimestamp ||
    transaction.postedDate ||
    transaction.date ||
    ''
  );
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function akoyaTransactionDescription_(transaction) {
  return String(
    transaction.description ||
    transaction.memo ||
    transaction.name ||
    transaction.category ||
    'Akoya sandbox transaction'
  ).trim();
}

/**
 * Imports the permissioned Mikomo checking transactions into sourceRecords.
 * Every record remains outside the books and is safe to re-run because its
 * document identity is derived from provider, account and transaction IDs.
 */
function importAkoyaSandboxCheckingTransactions() {
  const user = requireAccountingEditor_();
  if (!isOneDriveSourceBackendReady_()) {
    throw new Error(
      'Initialize OneDrive source storage before importing more transactions.'
    );
  }
  const status = validateAkoyaConnectionForUi();
  if (!status.connected) {
    throw new Error('Connect Akoya Sandbox before importing transactions.');
  }

  const accountsPayload = readAkoyaSandboxAccounts_();
  const account = selectAkoyaCheckingAccount_(accountsPayload);
  const accountId = String(account.accountId || '');
  const startTime = '2025-01-01T00:00:00Z';
  const endTime = new Date().toISOString();
  const transactions = readAllAkoyaCheckingTransactions_(
    accountId,
    startTime,
    endTime
  );
  const existing = getSourceRecords_();
  const existingKeys = {};
  existing.forEach(function(record) {
    if (record.externalSourceKey) {
      existingKeys[String(record.externalSourceKey)] = true;
    }
  });

  const now = new Date();
  const batchId = 'akoya-' +
    Utilities.formatDate(now, 'America/Los_Angeles', 'yyyyMMdd-HHmmss');
  const newRecords = [];
  let skipped = 0;
  let invalid = 0;
  transactions.forEach(function(transaction) {
    const transactionId = String(transaction.transactionId || '').trim();
    const date = akoyaTransactionDate_(transaction);
    const rawAmount = Number(transaction.amount);
    if (!transactionId || !date || !isFinite(rawAmount)) {
      invalid += 1;
      return;
    }
    const externalSourceKey = [
      'akoya',
      'sandbox',
      NILAVARAM_AKOYA_SANDBOX_PROVIDER,
      accountId,
      transactionId
    ].join('|');
    if (existingKeys[externalSourceKey]) {
      skipped += 1;
      return;
    }
    existingKeys[externalSourceKey] = true;
    const identityHash = akoyaSha256Hex_(externalSourceKey);
    const contentHash = akoyaSha256Hex_(
      JSON.stringify(transaction)
    );
    const amountCents = Math.abs(Math.round(rawAmount * 100));
    const record = {
      schemaVersion: NILAVARAM_WORKBENCH_SCHEMA_VERSION,
      sourceRecordId: 'akoya-' + identityHash.slice(0, 40),
      sourceRecordNumber: 'AKOYA-' +
        identityHash.slice(0, 12).toUpperCase(),
      sourceBatchId: batchId,
      sourceType: 'bank-download',
      sourceProvider: 'akoya',
      sourceEnvironment: 'sandbox',
      sourceFinancialInstitution: NILAVARAM_AKOYA_SANDBOX_PROVIDER,
      sourceAccountId: accountId,
      sourceAccountType: String(account.accountType || 'CHECKING'),
      sourceAccountDisplay: String(
        account.accountNumberDisplay ||
        account.nickname ||
        account.description ||
        'Mikomo checking'
      ),
      externalSourceKey: externalSourceKey,
      externalReference: transactionId,
      transactionDate: date,
      description: akoyaTransactionDescription_(transaction),
      amountCents: amountCents,
      signedSourceAmountCents: Math.round(rawAmount * 100),
      debitCreditMemo: String(transaction.debitCreditMemo || ''),
      transactionStatus: String(transaction.status || ''),
      currency: String(
        transaction.currency &&
        transaction.currency.currencyCode ||
        transaction.currencyCode ||
        'USD'
      ),
      evidenceName: 'Akoya Sandbox API transaction',
      evidenceType: 'consumer-permissioned-api',
      fileHashAlgorithm: 'SHA-256',
      fileHash: contentHash,
      storageReference:
        'akoya://sandbox/' + NILAVARAM_AKOYA_SANDBOX_PROVIDER +
        '/' + accountId + '/' + transactionId,
      evidenceStatus: 'verified',
      booksStatus: 'outside-books',
      matchStatus: 'unmatched',
      reconciliationStatus: 'pending',
      accountApprovalStatus: 'pending',
      postingStatus: 'blocked-until-account-approval',
      alertLevel: 'red',
      alertMessage:
        'Imported from Akoya Sandbox. Reconciliation and account assignment ' +
        'require review.',
      createdBy: user.email,
      createdAt: now,
      updatedAt: now
    };
    record.id = record.sourceRecordId;
    newRecords.push(record);
  });

  if (newRecords.length) {
    saveAllSourceRecords_(existing.concat(newRecords));
  }
  const batch = {
    sourceBatchId: batchId,
    sourceProvider: 'akoya',
    sourceEnvironment: 'sandbox',
    sourceFinancialInstitution: NILAVARAM_AKOYA_SANDBOX_PROVIDER,
    sourceAccountId: accountId,
    sourceAccountDisplay: String(
      account.accountNumberDisplay ||
      account.nickname ||
      account.description ||
      'Mikomo checking'
    ),
    requestedStartTime: startTime,
    requestedEndTime: endTime,
    downloadedCount: transactions.length,
    addedCount: newRecords.length,
    duplicateSkippedCount: skipped,
    invalidSkippedCount: invalid,
    booksStatus: 'outside-books',
    postingStatus: 'not-posted',
    importedBy: user.email,
    importedAt: now
  };
  try {
    firestoreSetDocument_(
      'sourceBatches', batchId, toFirestoreFields_(batch)
    );
    writeAudit_('akoya-sandbox-source-imported', user.email, {
      sourceBatchId: batchId,
      sourceAccountId: accountId,
      downloadedCount: transactions.length,
      addedCount: newRecords.length,
      duplicateSkippedCount: skipped,
      invalidSkippedCount: invalid,
      booksStatus: 'outside-books',
      storageProvider: 'Microsoft OneDrive'
    });
  } catch (ignoreFirestoreQuotaError) {}
  return {
    success: true,
    sourceBatchId: batchId,
    accountType: String(account.accountType || 'CHECKING'),
    accountDisplay: batch.sourceAccountDisplay,
    downloadedCount: transactions.length,
    addedCount: newRecords.length,
    duplicateSkippedCount: skipped,
    invalidSkippedCount: invalid,
    booksStatus: 'outside-books',
    postingStatus: 'not-posted'
  };
}
