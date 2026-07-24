/**
 * Users.js
 * Invitation-only user and role administration.
 */

const NILAVARAM_ROLES = ['admin', 'editor', 'reader', 'ltd', 'disabled'];

function normalizeEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function getCurrentEmail_() {
  const email = normalizeEmail_(Session.getActiveUser().getEmail());
  if (!email) {
    throw new Error('Google could not identify the signed-in email address.');
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
  if (user.role !== 'admin') {
    throw new Error('Admin permission is required.');
  }
  return user;
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
    allowedModules: record.allowedModules
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
