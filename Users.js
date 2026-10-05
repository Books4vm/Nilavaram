/**
 * Users.js
 * Invitation-only user and role administration.
 */

const NILAVARAM_ROLES = ['superadmin', 'admin', 'editor', 'reader', 'ltd', 'disabled'];

const NILAVARAM_SUPER_ADMIN_EMAILS = [
  'mangai8100@gmail.com',
  'mvenkat.jmj@gmail.com',
  'thesolarcpa@gmail.com',
  'vm8100@gmail.com',
  'waleed.fahid.acctg@gmail.com'
];

function isSuperAdminEmail_(email) {
  return NILAVARAM_SUPER_ADMIN_EMAILS
    .map(normalizeEmail_)
    .indexOf(normalizeEmail_(email)) !== -1;
}

function requirePrimaryDeveloper_() {
  const email = getCurrentEmail_();
  if (email !== normalizeEmail_(NILAVARAM_PRIMARY_ADMIN_EMAIL)) {
    throw new Error('Developer access denied.');
  }
  return requireCurrentUser_();
}

function requireSuperAdmin_() {
  const user = requireCurrentUser_();
  if (user.role !== 'superadmin' && !isSuperAdminEmail_(user.email)) {
    throw new Error('Super Admin permission is required.');
  }
  return user;
}

function ensureSuperAdminUsers_() {
  NILAVARAM_SUPER_ADMIN_EMAILS.forEach(function(email, index) {
    const normalized = normalizeEmail_(email);
    const existing = getUserByEmail_(normalized);
    firestoreSetDocument_('users', normalized, toFirestoreFields_({
      email: normalized,
      displayName: index === 0 ? 'Owner Super Admin' : 'Super Admin',
      role: 'superadmin',
      allowedModules: [],
      allowedClientIds: [],
      allowedEntityIds: [],
      status: 'active',
      invitedBy: NILAVARAM_PRIMARY_ADMIN_EMAIL,
      invitedAt: existing ? existing.invitedAt : new Date(),
      acceptedAt: existing ? existing.acceptedAt : new Date(),
      updatedAt: new Date()
    }));
  });
}

function normalizeEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function generateInviteToken_() {
  return Utilities.getUuid().replace(/-/g, '');
}

/**
 * Normalizes a US mobile number to E.164 (+1XXXXXXXXXX).
 *
 * @param {string} input Raw phone input.
 * @returns {string}
 */
function normalizeUsMobilePhone_(input) {
  const digits = String(input || '').replace(/\D/g, '');
  let tenDigit = digits;
  if (tenDigit.length === 11 && tenDigit.charAt(0) === '1') {
    tenDigit = tenDigit.slice(1);
  }
  if (tenDigit.length !== 10) {
    throw new Error('Enter a valid US mobile phone number (10 digits).');
  }
  return '+1' + tenDigit;
}

/**
 * @param {string} e164 Phone in E.164 form.
 * @returns {string}
 */
function formatUsMobilePhoneForDisplay_(e164) {
  const digits = String(e164 || '').replace(/\D/g, '');
  const tenDigit = digits.length === 11 && digits.charAt(0) === '1'
    ? digits.slice(1)
    : digits;
  if (tenDigit.length !== 10) {
    return String(e164 || '');
  }
  return '(' + tenDigit.slice(0, 3) + ') ' +
    tenDigit.slice(3, 6) + '-' + tenDigit.slice(6);
}

/**
 * @param {string} mainUiUrl Canonical Main UI URL.
 * @param {string} inviteToken Invitation token.
 * @returns {string}
 */
function buildInviteUrl_(mainUiUrl, inviteToken) {
  const base = String(mainUiUrl || getMainUiUrl_()).trim();
  const token = String(inviteToken || '').trim();
  if (!token) {
    return base;
  }
  const joiner = base.indexOf('?') === -1 ? '?' : '&';
  return base + joiner + 'invite=' + encodeURIComponent(token);
}

/**
 * @param {string} inviteToken Invitation token from the URL.
 * @returns {Object|null}
 */
function getUserByInviteToken_(inviteToken) {
  const token = String(inviteToken || '').trim();
  if (!token) {
    return null;
  }
  return firestoreGetCollection_('users')
    .map(fromFirestoreDocument_)
    .find(function(user) {
      return String(user.inviteToken || '') === token;
    }) || null;
}

/**
 * Ensures a pending invite has a token before building invite links.
 *
 * @param {string} email Invited user email.
 * @returns {Object}
 */
function ensureInviteTokenForUser_(email) {
  const normalized = normalizeEmail_(email);
  const user = getUserByEmail_(normalized);
  if (!user || user.status !== 'invited') {
    return user;
  }
  if (user.inviteToken) {
    return user;
  }
  user.inviteToken = generateInviteToken_();
  user.inviteTokenIssuedAt = new Date();
  user.updatedAt = new Date();
  delete user.id;
  firestoreSetDocument_('users', normalized, toFirestoreFields_(user));
  return user;
}

function getCurrentEmail_(nilavaramSessionKey) {
  const sk = String(nilavaramSessionKey || '').trim();
  if (sk) {
    const fromSession = getEmailForNilavaramSession_(sk);
    if (fromSession) {
      return fromSession;
    }
    throw new Error('Your sign-in expired. Please sign in again.');
  }

  let email = '';
  try {
    email = Session.getActiveUser().getEmail();
  } catch (error) {}

  email = normalizeEmail_(email);
  if (!email) {
    throw new Error(
      'Sign in with your Google account and allow Nilavaram when prompted.'
    );
  }
  return email;
}

/**
 * Shows which email an invite link expects (login hint only).
 *
 * @param {string} inviteToken Token from URL.
 * @returns {string} Invited email or empty.
 */
function getInvitedEmailHintForToken_(inviteToken) {
  const token = String(inviteToken || '').trim();
  if (!token) {
    return '';
  }
  const user = getUserByInviteToken_(token);
  return user ? normalizeEmail_(user.email) : '';
}

/**
 * Login gate — visitor identity only (never the deploying account).
 * Called from Login.html via google.script.run.
 *
 * @returns {{success: boolean, email: string, message: string}}
 */
function getLoggedInUser() {
  let email = '';
  try {
    email = Session.getActiveUser().getEmail();
  } catch (error) {}

  email = normalizeEmail_(email);

  if (!email) {
    return {
      success: false,
      email: '',
      message:
        'Sign in with your invited Google account and allow Nilavaram when Google asks.'
    };
  }

  return {
    success: true,
    email: email,
    message: 'Signed in.'
  };
} 

function getUserByEmail_(email) {
  try {
    return fromFirestoreDocument_(
      firestoreGetDocument_('users', normalizeEmail_(email))
    );
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') !== -1) {
      return null;
    }
    throw error;
  }
}

function requireCurrentUser_(nilavaramSessionKey) {
  const user = getUserByEmail_(
    getCurrentEmail_(nilavaramSessionKey)
  );
  if (!user || user.status !== 'active' || user.role === 'disabled') {
    throw new Error('Access denied. This Google account has no active invitation.');
  }
  return user;
}

function requireAdmin_() {
  const user = requireCurrentUser_();
  if (['superadmin', 'admin'].indexOf(user.role) === -1 &&
      !isSuperAdminEmail_(user.email)) {
    throw new Error('Admin permission is required.');
  }
  return user;
}

function defaultPrivateRecord_(record, ownerEmail) {
  const normalizedOwner = normalizeEmail_(ownerEmail || record && record.ownerEmail || '');
  const safeRecord = Object.assign({}, record || {});
  safeRecord.visibility = safeRecord.visibility || 'private';
  safeRecord.ownerEmail = normalizedOwner || safeRecord.ownerEmail || NILAVARAM_PRIMARY_ADMIN_EMAIL;
  safeRecord.allowedUsers = Array.isArray(safeRecord.allowedUsers)
    ? safeRecord.allowedUsers.map(normalizeEmail_)
    : [];
  safeRecord.updatedAt = safeRecord.updatedAt || new Date();
  if (!safeRecord.createdBy) {
    safeRecord.createdBy = normalizeEmail_(Session.getActiveUser().getEmail()) || NILAVARAM_PRIMARY_ADMIN_EMAIL;
  }
  return safeRecord;
}

function canAccessPrivateRecord_(record, email) {
  const userEmail = normalizeEmail_(email);
  if (!record || !record.visibility || record.visibility !== 'private') {
    return true;
  }
  if (normalizeEmail_(record.ownerEmail) === userEmail) {
    return true;
  }
  if ((record.allowedUsers || []).map(normalizeEmail_).indexOf(userEmail) !== -1) {
    return true;
  }
  return false;
}

/**
 * Active clients and businesses for the invite checkbox UI.
 *
 * @returns {Object[]}
 */
function getInviteClientEntityCatalogForAdmin_() {
  requireAdmin_();
  ensureClientRecords_();
  ensureClientBusinessEntities_();

  return firestoreGetCollection_('clients')
    .map(fromFirestoreDocument_)
    .filter(function(client) {
      return client.status === 'active';
    })
    .sort(function(a, b) {
      return Number(a.order || 0) - Number(b.order || 0);
    })
    .map(function(client) {
      const entities = firestoreGetCollection_('entities')
        .map(fromFirestoreDocument_)
        .filter(function(entity) {
          return entity.status === 'active' &&
            entity.entityType === 'business' &&
            entity.clientId === client.id;
        })
        .sort(function(a, b) {
          return String(a.name).localeCompare(String(b.name));
        })
        .map(function(entity) {
          return { id: entity.id, name: entity.name };
        });

      return {
        id: client.id,
        name: client.name,
        entities: entities
      };
    });
}

/**
 * Lists users for the Admin Users page.
 *
 * @returns {Object[]}
 */
function getUsers() {
  requireAdmin_();
  return firestoreGetCollection_('users')
    .map(fromFirestoreDocument_)
    .sort(function(a, b) {
      return String(a.email).localeCompare(String(b.email));
    });
}

/**
 * Invites a user or changes an existing user's access.
 *
 * @param {Object} input User form values.
 * @returns {Object}
 */
function saveUser(input) {
  const admin = requireAdmin_();
  const email = normalizeEmail_(input && input.email);
  const role = String(input && input.role || '').toLowerCase();
  const allowedModules = Array.isArray(input && input.allowedModules)
    ? input.allowedModules.map(String)
    : [];
  const allowedClientIds = Array.isArray(input && input.allowedClientIds)
    ? normalizeAllowedClientIds_(input.allowedClientIds)
    : [];
  const allowedEntityIds = Array.isArray(input && input.allowedEntityIds)
    ? normalizeAllowedEntityIds_(input.allowedEntityIds)
    : [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid Google account email address.');
  }
  if (NILAVARAM_ROLES.indexOf(role) === -1) {
    throw new Error('Select a valid role.');
  }

  const previous = getUserByEmail_(email);
  if (previous && previous.role === 'admin' && role !== 'admin') {
    const admins = getUsers().filter(function(user) {
      return user.role === 'admin' && user.status === 'active';
    });
    if (admins.length === 1) {
      throw new Error('The last active Admin cannot be downgraded or disabled.');
    }
  }

  const status = role === 'disabled'
    ? 'disabled'
    : (previous ? previous.status : 'invited');

  const record = {
    email: email,
    displayName: String(input.displayName || '').trim(),
    role: role,
    allowedClientIds: ['admin', 'reader', 'editor', 'ltd'].indexOf(role) !== -1
      ? allowedClientIds
      : [],
    allowedEntityIds: ['admin', 'reader', 'editor', 'ltd'].indexOf(role) !== -1
      ? allowedEntityIds
      : [],
    allowedModules: role === 'ltd' ? allowedModules : [],
    status: status,
    invitedBy: previous ? previous.invitedBy : admin.email,
    invitedAt: previous ? previous.invitedAt : new Date(),
    updatedAt: new Date()
  };

  if (role !== 'disabled') {
    record.mobilePhone = normalizeUsMobilePhone_(input && input.mobilePhone);
    record.mobileCountry = 'US';
    record.smsOptIn = true;
  } else if (previous) {
    record.mobilePhone = previous.mobilePhone || '';
    record.mobileCountry = previous.mobileCountry || 'US';
    record.smsOptIn = !!previous.smsOptIn;
  } else {
    record.mobilePhone = '';
    record.mobileCountry = 'US';
    record.smsOptIn = false;
  }

  if (status === 'invited') {
    record.inviteToken = generateInviteToken_();
    record.inviteTokenIssuedAt = new Date();
  } else if (previous && previous.inviteToken) {
    record.inviteToken = previous.inviteToken;
    record.inviteTokenIssuedAt = previous.inviteTokenIssuedAt || null;
  }

  if (previous) {
    record.lastInviteSentAt = previous.lastInviteSentAt || null;
    record.inviteEmailSentCount = Number(previous.inviteEmailSentCount || 0);
    record.inviteProfileConfirmedAt = previous.inviteProfileConfirmedAt || null;
  } else {
    record.lastInviteSentAt = null;
    record.inviteEmailSentCount = 0;
    record.inviteProfileConfirmedAt = null;
  }

  firestoreSetDocument_('users', email, toFirestoreFields_(record));
  writeAudit_(previous ? 'user-access-changed' : 'user-invited', email, {
    oldRole: previous ? previous.role : null,
    newRole: role,
    allowedModules: record.allowedModules,
    allowedClientIds: record.allowedClientIds,
    allowedEntityIds: record.allowedEntityIds,
    mobilePhone: record.mobilePhone || ''
  });

  const baseMessage = previous ? 'User access updated.' : 'User invitation created.';

  if (record.status === 'invited' && role !== 'disabled') {
    try {
      const emailResult = sendInviteEmailToUser_(email);
      return {
        success: true,
        message: baseMessage + ' ' + emailResult.message,
        emailSent: true,
        email: email,
        inviteUrl: emailResult.inviteUrl
      };
    } catch (error) {
      return {
        success: true,
        message: baseMessage + ' Email was not sent: ' +
          String(error && error.message || error),
        emailSent: false,
        emailError: String(error && error.message || error),
        email: email
      };
    }
  }

  return {
    success: true,
    message: baseMessage,
    emailSent: false,
    email: email
  };
}

/**
 * Validates an invite token against the signed-in Google account.
 *
 * @param {string} inviteToken Token from the URL.
 * @returns {Object}
 */
function validateInviteLanding(inviteToken) {
  const signedInEmail = getCurrentEmail_();
  const token = String(inviteToken || '').trim();
  if (!token) {
    return { hasToken: false };
  }

  const invitedUser = getUserByInviteToken_(token);
  if (!invitedUser) {
    return {
      hasToken: true,
      valid: false,
      message: 'This invitation link is invalid or has expired.'
    };
  }

  if (invitedUser.status === 'active') {
    return {
      hasToken: true,
      valid: true,
      alreadyActive: true,
      email: invitedUser.email,
      displayName: invitedUser.displayName || invitedUser.email,
      role: invitedUser.role,
      emailMatchesSignedIn: normalizeEmail_(invitedUser.email) === signedInEmail,
      mobilePhoneDisplay: formatUsMobilePhoneForDisplay_(invitedUser.mobilePhone || ''),
      profileConfirmed: !!invitedUser.inviteProfileConfirmedAt
    };
  }

  if (invitedUser.status !== 'invited') {
    return {
      hasToken: true,
      valid: false,
      message: 'This invitation is no longer available.'
    };
  }

  return {
    hasToken: true,
    valid: true,
    email: invitedUser.email,
    displayName: invitedUser.displayName || invitedUser.email,
    role: invitedUser.role,
    emailMatchesSignedIn: normalizeEmail_(invitedUser.email) === signedInEmail,
    mobilePhoneDisplay: formatUsMobilePhoneForDisplay_(invitedUser.mobilePhone || ''),
    profileConfirmed: !!invitedUser.inviteProfileConfirmedAt
  };
}

/**
 * Saves one-time invitee profile confirmation before acceptance.
 *
 * @param {string} inviteToken Token from the invitation URL.
 * @param {Object} input Profile fields from the onboarding form.
 * @returns {Object}
 */
function completeInviteOnboarding(inviteToken, input) {
  const email = getCurrentEmail_();
  const user = getUserByEmail_(email);
  if (!user || user.status !== 'invited') {
    throw new Error('No pending invitation was found for this Google account.');
  }

  const token = String(inviteToken || '').trim();
  if (user.inviteToken) {
    if (!token || token !== user.inviteToken) {
      throw new Error('Open the invitation link from your email and try again.');
    }
  }

  const displayName = String(input && input.displayName || '').trim();
  if (!displayName) {
    throw new Error('Enter your display name.');
  }

  user.displayName = displayName;
  user.mobilePhone = normalizeUsMobilePhone_(input && input.mobilePhone);
  user.mobileCountry = 'US';
  user.smsOptIn = true;
  user.inviteProfileConfirmedAt = new Date();
  user.updatedAt = new Date();
  delete user.id;
  firestoreSetDocument_('users', email, toFirestoreFields_(user));
  writeAudit_('invite-profile-confirmed', email, {
    mobilePhone: user.mobilePhone
  });

  return {
    success: true,
    message: 'Profile confirmed.'
  };
}

/**
 * Activates the matching invitation after Google identifies the user.
 *
 * @param {string} inviteToken Optional token from the invitation URL.
 * @returns {Object}
 */
function acceptMyInvitation(inviteToken) {
  const email = getCurrentEmail_();
  const user = getUserByEmail_(email);
  if (!user || user.status !== 'invited') {
    throw new Error('No pending invitation was found for this Google account.');
  }

  const token = String(inviteToken || '').trim();
  if (user.inviteToken) {
    if (!token || token !== user.inviteToken) {
      throw new Error('Open the invitation link from your email and try again.');
    }
  }

  if (!user.inviteProfileConfirmedAt) {
    throw new Error('Confirm your profile details before accepting the invitation.');
  }

  user.status = 'active';
  user.acceptedAt = new Date();
  user.updatedAt = new Date();
  delete user.inviteToken;
  delete user.inviteTokenIssuedAt;
  delete user.id;
  firestoreSetDocument_('users', email, toFirestoreFields_(user));
  writeAudit_('invitation-accepted', email, {});

  return { success: true, message: 'Invitation accepted.' };
}

function writeAudit_(action, targetEmail, details) {
  const actor = normalizeEmail_(Session.getActiveUser().getEmail()) ||
    NILAVARAM_PRIMARY_ADMIN_EMAIL;
  const id = Utilities.getUuid();
  firestoreSetDocument_('auditLog', id, toFirestoreFields_({
    action: action,
    actorEmail: actor,
    targetEmail: normalizeEmail_(targetEmail),
    details: details || {},
    createdAt: new Date()
  }));
}

/**
 * Builds the ready-to-send invite message for an Admin to copy.
 */
function buildInviteMessage_(email, displayName, role, mainUiUrl, inviteToken) {
  const safeEmail = normalizeEmail_(email);
  const safeRole = String(role || 'reader');
  const safeName = String(displayName || safeEmail).trim();
  const onboardingUrl = buildInviteUrl_(mainUiUrl, inviteToken);

  return [
    'You are invited to Nilavaram.',
    '',
    'Name: ' + safeName,
    'Google account: ' + safeEmail,
    'Role: ' + safeRole,
    '',
    'Important:',
    '- If this message is not in your Inbox, check Spam or Junk.',
    '- You will also receive a short ALERT email — that is intentional.',
    '- Sign in with Google using exactly: ' + safeEmail,
    '',
    'Steps:',
    '1. Open your personal setup link: ' + onboardingUrl,
    '2. Sign in with the Google account above.',
    '3. Confirm your profile and accept the invitation.',
    '4. Nilavaram will then open your workspace.',
    '',
    'Do not share this link.',
    'Nilavaram uses Google sign-in only — no separate password.'
  ].join('\n');
}

/**
 * One server call for the Invite window UI.
 */
function getInvitePageData() {
  const admin = requireAdmin_();
  const config = getMainUiUrlForAdmin();
  const users = getUsers().map(function(user) {
    return {
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      status: user.status,
      allowedClientIds: user.allowedClientIds || [],
      allowedEntityIds: user.allowedEntityIds || [],
      allowedModules: user.allowedModules || [],
      mobilePhone: user.mobilePhone || '',
      mobilePhoneDisplay: formatUsMobilePhoneForDisplay_(user.mobilePhone || '')
    };
  });
  const isSuperAdmin = admin.role === 'superadmin' || isSuperAdminEmail_(admin.email);

  return {
    mainUiUrl: config.mainUiUrl,
    mainUiSource: config.source,
    mainUiUpdatedAt: config.updatedAt,
    mainUiUpdatedBy: config.updatedBy,
    canEditMainUiUrl: isSuperAdmin,
    currentAdminEmail: admin.email,
    roles: ['admin', 'editor', 'reader', 'ltd', 'disabled'],
    accessCatalog: {
      clients: getInviteClientEntityCatalogForAdmin_()
    },
    users: users
  };
}

/**
 * Returns a fresh invite message after save/resend.
 */
function getInviteMessageForUser(email) {
  requireAdmin_();
  let user = ensureInviteTokenForUser_(email);
  if (!user) {
    throw new Error('User not found.');
  }
  return {
    email: user.email,
    displayName: user.displayName || user.email,
    role: user.role,
    status: user.status,
    inviteUrl: buildInviteUrl_(getMainUiUrl_(), user.inviteToken),
    message: buildInviteMessage_(
      user.email,
      user.displayName,
      user.role,
      getMainUiUrl_(),
      user.inviteToken
    ),
    mainUiUrl: getMainUiUrl_()
  };
}

/**
 * Refreshes client/business pickers without reloading the whole invite page.
 */
function getInviteAccessCatalog() {
  requireAdmin_();
  return {
    accessCatalog: {
      clients: getInviteClientEntityCatalogForAdmin_()
    }
  }; 
}

/**
 * @deprecated Use signInWithGoogleIdToken from Login.html.
 */
function verifyUserToken(idToken, inviteEmailHint) {
  const auth = signInWithGoogleIdToken(idToken, inviteEmailHint || '');
  if (!auth.success) {
    return {
      success: false,
      error: auth.message || 'Authentication failed.'
    };
  }
  const base = String(ScriptApp.getService().getUrl() || '').split('?')[0];
  return {
    success: true,
    email: auth.email,
    sessionKey: auth.sessionKey,
    redirectUrl: base + '?workspace=1'
  };
}

/**
 * Checks Firestore to verify if the user exists and is authorized.
 */
function checkUserAuthorization(email) {
  if (!email) return false;
  
  // Uses Nilavaram's existing Firestore helper
  const user = getUserByEmail_(email); 
  
  // Grant access if the user document exists and status is active or invited
  return !!(user && (user.status === 'active' || user.status === 'invited'));
}