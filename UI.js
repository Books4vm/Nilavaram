/**
 * ==========================================================
 * File : UI.js
 * Project : Nilavaram
 * Purpose :
 *     Dashboard support functions.
 *     Returns startup information and placeholder messages.
 * ==========================================================
 */

/**
 * Dashboard startup information.
 */
function getDashboardInfo() {
  const email = getCurrentEmail_();
  let currentUser = getUserByEmail_(email);

  /*
   * First-run bootstrap:
   * If one of the two explicitly approved initial Admins opens Nilavaram
   * before setup has been run, create the initial Firestore records
   * automatically and then read the newly created Admin record.
   */
  if (
    !currentUser &&
    NILAVARAM_INITIAL_ADMIN_EMAILS
      .map(normalizeEmail_)
      .indexOf(email) !== -1
  ) {
    setupNilavaram();
    currentUser = getUserByEmail_(email);
  }

  return {

    applicationName: "Nilavaram",

    version: "1.0",

    project: "nn",

    user: email,

    role: currentUser ? currentUser.role : 'none',

    accessStatus: currentUser ? currentUser.status : 'not-invited',

    dateTime: new Date().toLocaleString(),

    status: currentUser && currentUser.status === 'active'
      ? "Ready"
      : "Access not active"

  };

}

/**
 * Returns non-secret Admin locations and access links for the live UI.
 */
function buildStorageAccessInfo_() {
  return {
    vscodeFolder: 'C:\\Users\\theso\\Documents\\nn\\Nilavaram',
    githubRepository: 'https://github.com/Books4vm/Nilavaram',
    githubBranch: 'main',
    appsScriptWebApp:
      'https://script.google.com/macros/s/' +
      'AKfycbxMMqgLL6xmJp__dI4vDHj0zZ_6ZyZsb_-' +
      'KsspdNU99WXW1ZJrRzJTaVObTJ8C2s-3Q/exec',
    localOneDrive: 'C:\\Users\\theso\\OneDrive',
    primaryOneDriveAccount: 'vmurugan@hotmail.com',
    externalDrive: 'E:\\',
    externalDriveLabel: 'My Passport',
    externalCodeBackup: 'E:\\nn\\Nilavaram',
    dataRoot: 'E:\\nn\\Nilavaram Data',
    recommendedArchiveFolder: 'E:\\nn\\Nilavaram Data\\99 Archive',
    oneDriveSyncSource: 'E:\\nn\\Nilavaram Data\\04 OneDrive Sync',
    externalDriveFreeGb: 3778.2,
    credentialNotice:
      'Credentials are maintained separately. Passwords, tokens and secrets ' +
      'must not be stored in Nilavaram, Firestore, GitHub or these notes.'
  };
}

function getAdminStorageAccessInfo() {
  requireAdmin_();
  return buildStorageAccessInfo_();
}

function buildConnectionsBootstrap_() {
  const config = getMicrosoftConfig_();
  const missing = getMissingMicrosoftConfig_(config);
  const hasRefreshToken = Boolean(
    PropertiesService.getScriptProperties()
      .getProperty('MICROSOFT_REFRESH_TOKEN')
  );
  return {
    build: 16,
    accessInfo: buildStorageAccessInfo_(),
    hasRefreshToken: hasRefreshToken,
    microsoftStatus: {
      configured: missing.length === 0,
      connected: hasRefreshToken,
      expectedAccount: NILAVARAM_MICROSOFT_ACCOUNT,
      missingProperties: missing,
      account: hasRefreshToken ? NILAVARAM_MICROSOFT_ACCOUNT : '',
      driveType: hasRefreshToken ? 'Authorization saved' : '',
      quotaState: hasRefreshToken ? 'Live quota check pending' : ''
    },
    liveValidationPassed: false,
    liveValidationError: '',
    akoyaStatus: getAkoyaConnectionStatus_(),
    akoyaValidationPassed: false,
    akoyaValidationError: ''
  };
}

/**
 * Loads the Connections screen in one server request. Keeping this as one
 * request avoids leaving the UI on a permanent loading message when either of
 * two chained browser-to-server calls does not return.
 */
function getConnectionsPageData() {
  const bootstrap = buildConnectionsBootstrap_();
  const missing = bootstrap.microsoftStatus.missingProperties;
  const hasRefreshToken = bootstrap.hasRefreshToken;
  const result = {
    build: bootstrap.build,
    accessInfo: bootstrap.accessInfo,
    microsoftStatus: bootstrap.microsoftStatus,
    microsoftError: ''
  };
  if (missing.length === 0 && hasRefreshToken) {
    try {
      result.microsoftStatus = readMicrosoftDriveSummary_();
      result.microsoftStatus.configured = true;
      result.microsoftStatus.expectedAccount = NILAVARAM_MICROSOFT_ACCOUNT;
    } catch (error) {
      result.microsoftError = String(error && error.message || error);
    }
  }
  return result;
}

/**
 * Returns the startup identity and navigation in one browser-to-server call.
 * This reduces the time spent waiting between separate startup requests.
 */
function getDashboardShell() {
  const info = getDashboardInfo();
  return {
    info: info,
    navigation: info.accessStatus === 'active' ? getNavigation() : []
  };
}


/**
 * Temporary response until the module is implemented.
 */
function openModule(moduleId) {
  requireCurrentUser_();

  return {

    success: true,

    message: moduleId + " module is under development."

  };

}


/**
 * Test Firestore
 */
function testFirestore() {

  try {
    requireAdmin_();

    const result = firestoreGetDocument_(

      "system",

      "connection-test"

    );

    return {

      success: true,

      message: "Firestore Connected",

      data: result

    };

  }

  catch(err){

    return {

      success:false,

      message:err.message

    };

  }

}
