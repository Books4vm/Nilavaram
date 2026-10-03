/**
 * NilavaramAuth.js
 * Google Identity Services (ID token) + Nilavaram server session.
 */

const NILAVARAM_SESSION_CACHE_PREFIX = 'nlv:';
const NILAVARAM_SESSION_TTL_SECONDS = 21600; // 6 hours

function getGoogleOauthClientId_() {
  const fromProps = String(
    PropertiesService.getScriptProperties().getProperty('GOOGLE_OAUTH_CLIENT_ID') || ''
  ).trim();
  if (fromProps) {
    return fromProps;
  }
  throw new Error(
    'Missing GOOGLE_OAUTH_CLIENT_ID in Script properties.'
  );
}

function verifyGoogleIdToken_(idToken) {
  const clientId = getGoogleOauthClientId_();
  const token = String(idToken || '').trim();
  if (!token) {
    throw new Error('No Google sign-in token received.');
  }

  const url =
    'https://oauth2.googleapis.com/tokeninfo?id_token=' +
    encodeURIComponent(token);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    throw new Error('Google could not verify your sign-in. Try again.');
  }

  const payload = JSON.parse(response.getContentText());
  if (String(payload.aud || '') !== clientId) {
    throw new Error('Sign-in token was not issued for Nilavaram.');
  }
  if (String(payload.email_verified || '') !== 'true') {
    throw new Error('This Google account email is not verified.');
  }

  const email = normalizeEmail_(String(payload.email || ''));
  if (!email) {
    throw new Error('Google did not return an email address.');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = parseInt(payload.exp, 10);
  if (!exp || exp < now) {
    throw new Error('Your Google sign-in expired. Try again.');
  }

  return payload;
}

function createNilavaramSession_(email) {
  const sessionKey = Utilities.getUuid();
  CacheService.getScriptCache().put(
    NILAVARAM_SESSION_CACHE_PREFIX + sessionKey,
    normalizeEmail_(email),
    NILAVARAM_SESSION_TTL_SECONDS
  );
  return sessionKey;
}

function getEmailForNilavaramSession_(sessionKey) {
  const key = String(sessionKey || '').trim();
  if (!key) {
    return '';
  }
  const cached = CacheService.getScriptCache().get(
    NILAVARAM_SESSION_CACHE_PREFIX + key
  );
  return normalizeEmail_(cached || '');
}

/**
 * Login.html calls this via google.script.run.
 */
function signInWithGoogleIdToken(idToken, inviteEmailHint) {
  try {
    const payload = verifyGoogleIdToken_(idToken);
    const email = normalizeEmail_(payload.email);
    const hint = normalizeEmail_(inviteEmailHint || '');

    if (hint && hint !== email) {
      return {
        success: false,
        email: email,
        sessionKey: '',
        message:
          'This invitation is for ' + hint + '. You signed in as ' + email + '.'
      };
    }

    let user = getUserByEmail_(email);
    if (
      !user &&
      NILAVARAM_INITIAL_ADMIN_EMAILS.map(normalizeEmail_).indexOf(email) !== -1
    ) {
      setupNilavaram();
      user = getUserByEmail_(email);
    }

    if (!user) {
      return {
        success: false,
        email: email,
        sessionKey: '',
        message: 'This Google account is not on the Nilavaram user list.'
      };
    }

    if (user.status === 'disabled' || user.role === 'disabled') {
      return {
        success: false,
        email: email,
        sessionKey: '',
        message: 'This account is disabled.'
      };
    }

    if (user.status !== 'active' && user.status !== 'invited') {
      return {
        success: false,
        email: email,
        sessionKey: '',
        message: 'This account is not allowed to sign in yet.'
      };
    }

    const sessionKey = createNilavaramSession_(email);
    return {
      success: true,
      email: email,
      sessionKey: sessionKey,
      message: 'Signed in.'
    };
  } catch (error) {
    return {
      success: false,
      email: '',
      sessionKey: '',
      message: String(error && error.message || error)
    };
  }
}
