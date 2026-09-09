/**
 * AppConfigEngine.js
 * Canonical Main UI URL and other app-wide settings in Firestore only.
 */

const NILAVARAM_APP_CONFIG_DOC = 'app-config';

function getDeploymentMainUiUrl_() {
  try {
    const url = ScriptApp.getService().getUrl();
    return String(url || '').trim();
  } catch (error) {
    return '';
  }
}

function readAppConfig_() {
  try {
    return fromFirestoreDocument_(
      firestoreGetDocument_('system', NILAVARAM_APP_CONFIG_DOC)
    );
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') !== -1) {
      return null;
    }
    throw error;
  }
}

/**
 * Returns the canonical Main UI URL.
 * Priority: Firestore → live deployment URL.
 */
function getMainUiUrl_() {
  const config = readAppConfig_();
  const saved = config && String(config.mainUiUrl || '').trim();
  if (saved) return saved;
  return getDeploymentMainUiUrl_();
}

/**
 * Admin read-only view of Main UI URL.
 */
function getMainUiUrlForAdmin() {
  requireAdmin_();
  return {
    mainUiUrl: getMainUiUrl_(),
    source: readAppConfig_() && readAppConfig_().mainUiUrl ? 'firestore' : 'deployment-fallback',
    updatedAt: readAppConfig_() ? readAppConfig_.updatedAt : null,
    updatedBy: readAppConfig_() ? readAppConfig_.updatedBy : null
  };
}

/**
 * Super Admin saves the canonical Main UI URL.
 */
function saveMainUiUrl(inputUrl) {
  const admin = requireSuperAdmin_();
  const url = String(inputUrl || '').trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/i.test(url)) {
    throw new Error(
      'Enter a valid Apps Script web app URL ending with /exec.'
    );
  }

  firestoreSetDocument_('system', NILAVARAM_APP_CONFIG_DOC, toFirestoreFields_({
    mainUiUrl: url,
    updatedAt: new Date(),
    updatedBy: admin.email
  }));

  writeAudit_('main-ui-url-saved', admin.email, { mainUiUrl: url });

  return {
    success: true,
    message: 'Main UI URL saved.',
    mainUiUrl: url
  };
}

/**
 * Super Admin reads live deployment URL and saves it to Firestore.
 */
function refreshMainUiUrlFromDeployment() {
  const admin = requireSuperAdmin_();
  const url = getDeploymentMainUiUrl_();
  if (!url) {
    throw new Error('Could not read the deployment URL from Apps Script.');
  }

  firestoreSetDocument_('system', NILAVARAM_APP_CONFIG_DOC, toFirestoreFields_({
    mainUiUrl: url,
    updatedAt: new Date(),
    updatedBy: admin.email
  }));

  writeAudit_('main-ui-url-refreshed', admin.email, { mainUiUrl: url });

  return {
    success: true,
    message: 'Main UI URL refreshed from deployment.',
    mainUiUrl: url
  };
}