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
 * Visitor email for login routing only — never falls back to deployer.
 *
 * @returns {string}
 */
function getActiveVisitorEmailOrEmpty_() {
  try {
    return normalizeEmail_(Session.getActiveUser().getEmail());
  } catch (error) {
    return '';
  }
}

/**
 * Active web app URL (must match Google Cloud redirect URI).
 *
 * @returns {string}
 */
function getNilavaramWebAppUrl_() {
  return String(
    ScriptApp.getService().getUrl() || getMainUiUrl_() || ''
  ).trim();
}

/**
 * Query params to carry from Login to Dashboard (?workspace=1).
 *
 * @param {Object} parameters doGet parameters.
 * @returns {Object}
 */
function buildPreservedLoginQuery_(parameters) {
  const preserved = {};
  if (parameters.invite) {
    preserved.invite = String(parameters.invite);
  }
  if (parameters.validateOneDrive === '1') {
    preserved.validateOneDrive = '1';
  }
  if (parameters.validateAkoya === '1') {
    preserved.validateAkoya = '1';
  }
  return preserved;
}

/**
 * OAuth state for Google redirect login (returned on callback).
 *
 * @param {Object} parameters Login page query params.
 * @returns {string}
 */
function buildGoogleOAuthState_(parameters) {
  const invite = parameters && parameters.invite
    ? String(parameters.invite).trim()
    : '';
  return invite ? ('login:' + invite) : 'login';
}

/**
 * @param {string} state
 * @returns {{ inviteToken: string }|null}
 */
function parseGoogleOAuthState_(state) {
  const value = String(state || '').trim();
  if (value === 'login') {
    return { inviteToken: '' };
  }
  if (value.indexOf('login:') === 0) {
    return { inviteToken: value.slice(6) };
  }
  return null;
}

/**
 * Google authorization URL (full-page redirect).
 *
 * @param {Object} parameters
 * @param {string} redirectUri
 * @returns {string}
 */
function buildGoogleAuthorizationUrl_(parameters, redirectUri) {
  const clientId = getGoogleOauthClientId_();
  const state = buildGoogleOAuthState_(parameters || {});
  let url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    'client_id=' + encodeURIComponent(clientId) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_type=code' +
    '&scope=' + encodeURIComponent('openid email profile') +
    '&state=' + encodeURIComponent(state) +
    '&prompt=select_account';
  const inviteHint = getInvitedEmailHintForToken_(
    parameters && parameters.invite
  );
  if (inviteHint) {
    url += '&login_hint=' + encodeURIComponent(inviteHint);
  }
  return url;
}

/**
 * Serves the login page (Sign in with Google redirect).
 *
 * @param {Object} parameters doGet parameters.
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function serveLoginPage_(parameters) {
  const params = parameters || {};
  const loginTemplate = HtmlService.createTemplateFromFile('Login');
  const execUrl = getNilavaramWebAppUrl_();

  loginTemplate.execUrlJson = JSON.stringify(execUrl)
    .replace(/</g, '\\u003c');
  loginTemplate.preservedQueryJson = JSON.stringify(
    buildPreservedLoginQuery_(params)
  ).replace(/</g, '\\u003c');
  loginTemplate.invitedEmailHintJson = JSON.stringify(
    getInvitedEmailHintForToken_(params.invite)
  ).replace(/</g, '\\u003c');
  loginTemplate.clientIdJson = JSON.stringify(getGoogleOauthClientId_())
    .replace(/</g, '\\u003c');

  loginTemplate.loginUrl = buildGoogleAuthorizationUrl_(params, execUrl);

  return loginTemplate.evaluate()
    .setTitle('Nilavaram — Sign in')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * @returns {string}
 */
function getGoogleOauthClientSecret_() {
  const secret = String(
    PropertiesService.getScriptProperties().getProperty(
      'GOOGLE_OAUTH_CLIENT_SECRET'
    ) || ''
  ).trim();
  if (!secret) {
    throw new Error(
      'Missing GOOGLE_OAUTH_CLIENT_SECRET in Script properties.'
    );
  }
  return secret;
}

/**
 * @param {string} code
 * @param {string} redirectUri
 * @returns {Object}
 */
function exchangeGoogleAuthCode_(code, redirectUri) {
  const payload = {
    code: String(code || ''),
    client_id: getGoogleOauthClientId_(),
    client_secret: getGoogleOauthClientSecret_(),
    redirect_uri: String(redirectUri || ''),
    grant_type: 'authorization_code'
  };
  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: payload,
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) {
    Logger.log('Google token exchange: ' + response.getContentText());
    throw new Error('Google sign-in exchange failed. Try again.');
  }
  const tokens = JSON.parse(response.getContentText());
  if (!tokens.id_token) {
    throw new Error('Google did not return an ID token.');
  }
  return tokens;
}

/**
 * After Google redirects with ?code=...&state=login...
 *
 * @param {Object} parameters doGet parameters.
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function completeGoogleLoginFromOAuthRedirect_(parameters) {
  const parsed = parseGoogleOAuthState_(parameters.state);
  if (!parsed) {
    throw new Error('Invalid sign-in state. Open Nilavaram and sign in again.');
  }
  const redirectUri = getNilavaramWebAppUrl_();
  const tokens = exchangeGoogleAuthCode_(parameters.code, redirectUri);
  const inviteHint = getInvitedEmailHintForToken_(parsed.inviteToken);
  const auth = signInWithGoogleIdToken(tokens.id_token, inviteHint);
  if (!auth.success) {
    throw new Error(auth.message || 'Sign in was not completed.');
  }
  return buildNilavaramSessionHandoffPage_(auth.sessionKey, parsed.inviteToken);
}

/**
 * Browser page: save session key, then open workspace.
 *
 * @param {string} sessionKey
 * @param {string} inviteToken
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function buildNilavaramSessionHandoffPage_(sessionKey, inviteToken) {
  const base = getNilavaramWebAppUrl_().split('?')[0];
  let workspaceUrl = base + '?workspace=1';

  if (inviteToken) {
    workspaceUrl += '&invite=' + encodeURIComponent(inviteToken);
  }

  const keyJson = JSON.stringify(String(sessionKey || ''));
  const safeWorkspaceUrl = String(workspaceUrl)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return HtmlService.createHtmlOutput(
    '<!doctype html>' +
    '<html>' +
    '<head>' +
    '<base target="_top">' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Signing in</title>' +
    '</head>' +
    '<body>' +
    '<p>Google sign-in completed successfully.</p>' +
    '<p><a id="continueLink" target="_top" href="' + safeWorkspaceUrl + '">Continue to Nilavaram</a></p>' +
    '<script>' +
    'try{' +
    'localStorage.setItem("nilavaramSessionKey",' + keyJson + ');' +
    '}catch(e){}' +
    '</script>' +
    '</body>' +
    '</html>'
  ).setTitle('Nilavaram - Signing in');
}

/**
 * Web application entry point.
 *
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  const parameters = e && e.parameter || {};
  if (parameters.developer === '1') {
    try {
      requirePrimaryDeveloper_();
      return HtmlService.createHtmlOutputFromFile('DeveloperConsole')
        .setTitle('Nilavaram Developer');
    } catch (error) {
      return buildAuthorizationErrorPage_('Developer Console', error);
    }
  }
  if (parameters.loadingMenu === '1') {
    return HtmlService
      .createHtmlOutputFromFile('LoadingMenu')
      .setTitle('Nilavaram - Loading Menu');
  }
  if (parameters.standalone === '1') {
    return HtmlService
      .createHtmlOutputFromFile('StandaloneMenuTest')
      .setTitle('Nilavaram Standalone Menu');
  }
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

  if (parameters.clientBusinessWindow === '1') {
    try {
      authorizePopupWindow_(
        'clientBusinessWindow',
        parameters.clientId,
        parameters.entityId
      );
      const cbTemplate = HtmlService.createTemplateFromFile('ClientBusinessWindow');
      cbTemplate.clientIdJson = JSON.stringify(String(parameters.clientId || ''))
        .replace(/</g, '\\u003c');
      cbTemplate.clientNameJson = JSON.stringify(String(parameters.clientName || ''))
        .replace(/</g, '\\u003c');
      cbTemplate.entityIdJson = JSON.stringify(String(parameters.entityId || ''))
        .replace(/</g, '\\u003c');
      cbTemplate.entityNameJson = JSON.stringify(String(parameters.entityName || ''))
        .replace(/</g, '\\u003c');
      cbTemplate.userEmailJson = JSON.stringify(String(parameters.user || ''))
        .replace(/</g, '\\u003c');
      cbTemplate.userRoleJson = JSON.stringify(String(parameters.role || ''))
        .replace(/</g, '\\u003c');
      return cbTemplate.evaluate()
        .setTitle('Nilavaram — Clients & Businesses');
    } catch (error) {
      return buildAuthorizationErrorPage_('Clients & Businesses', error);
    }
  }
  if (parameters.contextWindow === '1') {
    return HtmlService.createHtmlOutputFromFile('ContextWindow')
      .setTitle('Nilavaram — Change context');
  }
  if (parameters.moduleWindow === '1') {
    try {
      authorizeModuleWindowLoad_(
        parameters.clientId,
        parameters.entityId,
        parameters.moduleId
      );
    } catch (error) {
      return buildAuthorizationErrorPage_(
        String(parameters.moduleLabel || parameters.moduleId || 'Module'),
        error
      );
    }

    const moduleTemplate = HtmlService.createTemplateFromFile('ModuleWindow');
    moduleTemplate.moduleIdJson = JSON.stringify(String(parameters.moduleId || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.moduleLabelJson = JSON.stringify(String(parameters.moduleLabel || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.clientIdJson = JSON.stringify(String(parameters.clientId || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.clientNameJson = JSON.stringify(String(parameters.clientName || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.entityIdJson = JSON.stringify(String(parameters.entityId || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.entityNameJson = JSON.stringify(String(parameters.entityName || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.sessionIdJson = JSON.stringify(String(parameters.sessionId || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.userEmailJson = JSON.stringify(String(parameters.userEmail || ''))
      .replace(/</g, '\\u003c');
    moduleTemplate.userRoleJson = JSON.stringify(String(parameters.userRole || ''))
      .replace(/</g, '\\u003c');
    return moduleTemplate.evaluate().setTitle(
      'Nilavaram — ' + String(parameters.moduleLabel || parameters.moduleId || 'Module')
    );
  }
  if (parameters.reviewWindow === 'acode') {
    const reviewTemplate = HtmlService.createTemplateFromFile('ReviewWindow');
    reviewTemplate.groupKeyJson = JSON.stringify(
      String(parameters.groupKey || '')
    ).replace(/</g, '\\u003c');
    reviewTemplate.appsScriptWebAppJson = JSON.stringify(
      buildStorageAccessInfo_().appsScriptWebApp
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
  if (parameters.inviteWindow === '1') {
    try {
      authorizePopupWindow_(
        'inviteWindow',
        parameters.clientId,
        parameters.entityId
      );
      const inviteTemplate = HtmlService.createTemplateFromFile('InviteWindow');
      inviteTemplate.clientIdJson = JSON.stringify(String(parameters.clientId || ''))
        .replace(/</g, '\\u003c');
      inviteTemplate.clientNameJson = JSON.stringify(String(parameters.clientName || ''))
        .replace(/</g, '\\u003c');
      inviteTemplate.entityIdJson = JSON.stringify(String(parameters.entityId || ''))
        .replace(/</g, '\\u003c');
      inviteTemplate.entityNameJson = JSON.stringify(String(parameters.entityName || ''))
        .replace(/</g, '\\u003c');
      inviteTemplate.userEmailJson = JSON.stringify(String(parameters.user || ''))
        .replace(/</g, '\\u003c');
      inviteTemplate.userRoleJson = JSON.stringify(String(parameters.role || ''))
        .replace(/</g, '\\u003c');
      return inviteTemplate.evaluate()
        .setTitle('Nilavaram — Users & Invitations');
    } catch (error) {
      return buildAuthorizationErrorPage_('Users & Invitations', error);
    }
  }

  if (
    parameters.code &&
    parameters.provider !== 'akoya' &&
    parseGoogleOAuthState_(parameters.state)
  ) {
    try {
      return completeGoogleLoginFromOAuthRedirect_(parameters);
    } catch (error) {
      return buildAuthorizationErrorPage_('Nilavaram Sign in', error);
    }
  }

  if (parameters.workspace !== '1') {
    return serveLoginPage_(parameters);
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
  let dashboardInfoBootstrap;
  try {
    dashboardInfoBootstrap = getDashboardInfo();
    dashboardInfoBootstrap.bootstrapSource = 'engine-page-load';
  } catch (error) {
    dashboardInfoBootstrap = {
      applicationName: 'Nilavaram',
      user: '',
      role: '',
      accessStatus: 'error',
      status: 'Access not active',
      bootstrapSource: 'engine-page-load',
      bootstrapError: String(error && error.message || error)
    };
  }
  template.dashboardInfoJson = JSON.stringify(
    dashboardInfoBootstrap
  ).replace(/</g, '\\u003c');
  template.connectionsBootstrapJson = JSON.stringify(
    connectionsBootstrap
  ).replace(/</g, '\\u003c');
  template.openConnectionsOnLoadJson = JSON.stringify(
    validateOneDrive || validateAkoya
  );
  return template.evaluate().setTitle('Nilavaram Workspace');
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