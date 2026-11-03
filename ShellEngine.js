/**
 * ShellEngine.js
 * Main workspace shell data from Firestore only.
 */

const NILAVARAM_SESSION_WARNING_MINUTES = 9;
const NILAVARAM_SESSION_TIMEOUT_MINUTES = 10;

function getDashboardShell(nilavaramSessionKey) {
  const info = getDashboardInfo(nilavaramSessionKey);
  const shell = {
    info: info,
    clients: [],
    entities: [],
    defaultContext: null,
    navigation: [],
    sessionPolicy: {
      warningMinutes: NILAVARAM_SESSION_WARNING_MINUTES,
      timeoutMinutes: NILAVARAM_SESSION_TIMEOUT_MINUTES
    }
  };

  if (info.accessStatus === 'active') {
    try {
      shell.clients = getClientGroupsForShell_(nilavaramSessionKey);
      shell.defaultContext = getUserDefaultWorkspaceContext_(
        nilavaramSessionKey
      );
      if (shell.clients.length === 1) {
        shell.entities = getBusinessEntitiesForShell_(
          shell.clients[0].name,
          nilavaramSessionKey
        );
      }

    } catch (error) {
      shell.shellError = String(error && error.message || error);
    }
  }

  return shell;
}

function getNavigationForShellRefresh() {
  return getNavigation();
}

function getUserDefaultWorkspaceContext_(nilavaramSessionKey) {
  const user = requireCurrentUser_(nilavaramSessionKey);
  const clientId = String(user.defaultClientId || '').trim();
  const entityId = String(user.defaultEntityId || '').trim();
  const accountingYear = String(user.defaultAccountingYear || '2026').trim();
  if (!clientId || !entityId) return null;
  if (!canUserAccessClient_(user, clientId) ||
      !canUserAccessEntity_(user, entityId)) {
    return null;
  }
  const client = getDocumentOrNull_('clients', clientId);
  const entity = getDocumentOrNull_('entities', entityId);
  if (!client || client.status !== 'active' ||
      !entity || entity.status !== 'active' ||
      String(entity.clientId) !== clientId) {
    return null;
  }
  return {
    clientId: clientId,
    clientName: String(client.name || ''),
    entityId: entityId,
    entityName: String(entity.name || ''),
    accountingYear: accountingYear
  };
}

function saveUserDefaultWorkspaceContext(
  clientId,
  entityId,
  accountingYear,
  nilavaramSessionKey
) {
  const user = requireCurrentUser_(nilavaramSessionKey);
  const client = requireActiveClient_(clientId);
  const entity = requireActiveEntityForClient_(entityId, client.id);
  requireUserClientAccess_(user, client.id);
  requireUserEntityAccess_(user, entity.id);
  const year = String(accountingYear || '2026').trim();
  if (!/^\d{4}$/.test(year)) {
    throw new Error('Accounting year must be a four-digit year.');
  }
  user.defaultClientId = client.id;
  user.defaultEntityId = entity.id;
  user.defaultAccountingYear = year;
  user.updatedAt = new Date();
  delete user.id;
  firestoreSetDocument_(
    'users',
    normalizeEmail_(user.email),
    toFirestoreFields_(user)
  );
  writeAudit_('workspace-default-context-saved', user.email, {
    clientId: client.id,
    entityId: entity.id,
    accountingYear: year
  });
  return {
    clientId: client.id,
    clientName: String(client.name || ''),
    entityId: entity.id,
    entityName: String(entity.name || ''),
    accountingYear: year
  };
}