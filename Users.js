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

function getCurrentEmail_() {
  let email = '';

  try {
    email = Session.getActiveUser().getEmail();
  } catch (error) {}

  if (!email) {
    try {
      email = Session.getEffectiveUser().getEmail();
    } catch (error) {}
  }

  email = normalizeEmail_(email);

  if (!email) {
    throw new Error(
      'Google could not identify the signed-in email address. ' +
      'Sign in with your Google account and allow Nilavaram when prompted.'
    );
  }

  return email;
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

function requireCurrentUser_() {
  const user = getUserByEmail_(getCurrentEmail_());
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
    status: role === 'disabled' ? 'disabled' : (previous ? previous.status : 'invited'),
    invitedBy: previous ? previous.invitedBy : admin.email,
    invitedAt: previous ? previous.invitedAt : new Date(),
    updatedAt: new Date()
  };

  firestoreSetDocument_('users', email, toFirestoreFields_(record));
  writeAudit_(previous ? 'user-access-changed' : 'user-invited', email, {
    oldRole: previous ? previous.role : null,
    newRole: role,
    allowedModules: record.allowedModules,
    allowedClientIds: record.allowedClientIds,
    allowedEntityIds: record.allowedEntityIds
  });

  return {
    success: true,
    message: previous ? 'User access updated.' : 'User invitation created.'
  };
}

/**
 * Activates the matching invitation after Google identifies the user.
 *
 * @returns {Object}
 */
function acceptMyInvitation() {
  const email = getCurrentEmail_();
  const user = getUserByEmail_(email);
  if (!user || user.status !== 'invited') {
    throw new Error('No pending invitation was found for this Google account.');
  }

  user.status = 'active';
  user.acceptedAt = new Date();
  user.updatedAt = new Date();
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
function buildInviteMessage_(email, displayName, role, mainUiUrl) {
  const safeEmail = normalizeEmail_(email);
  const safeRole = String(role || 'reader');
  const safeName = String(displayName || safeEmail).trim();
  const url = String(mainUiUrl || getMainUiUrl_()).trim();

  return [
    'You are invited to Nilavaram.',
    '',
    'Name: ' + safeName,
    'Google account: ' + safeEmail,
    'Role: ' + safeRole,
    '',
    'Steps:',
    '1. Open this link: ' + url,
    '2. Sign in with Google using exactly: ' + safeEmail,
    '3. Click "Accept invitation".',
    '',
    'Do not share this link with anyone who was not invited.',
    'Nilavaram does not use a separate password — Google sign-in only.'
  ].join('\n');
}

/**
 * One server call for the Invite window UI.
 */
function getInvitePageData() {
  const admin = requireAdmin_();
  const config = getMainUiUrlForAdmin();
  const users = getUsers();
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
  const user = getUserByEmail_(email);
  if (!user) {
    throw new Error('User not found.');
  }
  return {
    email: user.email,
    displayName: user.displayName || user.email,
    role: user.role,
    status: user.status,
    message: buildInviteMessage_(
      user.email,
      user.displayName,
      user.role,
      getMainUiUrl_()
    ),
    mainUiUrl: getMainUiUrl_()
  };
}