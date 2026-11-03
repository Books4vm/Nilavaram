/**
 * FinancialAccounts.js
 * Scoped financial-account metadata. Secrets, passwords and full account
 * numbers are never stored in Firestore.
 */

const NILAVARAM_FINANCIAL_ACCOUNT_COLLECTION = 'financialAccounts';

function normalizeFinancialAccountText_(value, fieldName, maxLength) {
  const text = String(value == null ? '' : value).trim();
  if (!text) throw new Error(fieldName + ' is required.');
  if (text.length > maxLength) {
    throw new Error(fieldName + ' is too long.');
  }
  return text;
}

function getFinancialAccountRecord_(recordId, clientId, entityId) {
  const record = getDocumentOrNull_(
    NILAVARAM_FINANCIAL_ACCOUNT_COLLECTION,
    recordId
  );
  if (!record) throw new Error('The financial account was not found.');
  if (String(record.clientId) !== String(clientId) ||
      String(record.entityId) !== String(entityId)) {
    throw new Error('That financial account is outside the selected business.');
  }
  return record;
}

function financialAccountUserCanAccess_(record, user, permission) {
  if (!record || !user) return false;
  if (['admin', 'superadmin'].indexOf(user.role) !== -1 ||
      normalizeEmail_(record.createdBy) === normalizeEmail_(user.email)) {
    return true;
  }
  const required = permission === 'edit' ? 'edit' : 'view';
  return (record.sharedUsers || []).some(function(entry) {
    return normalizeEmail_(entry.email) === normalizeEmail_(user.email) &&
      (entry.permission === 'edit' || entry.permission === required);
  });
}

function requireFinancialAccountAccess_(
  record,
  user,
  clientId,
  entityId,
  permission
) {
  if (String(record.clientId) !== String(clientId) ||
      String(record.entityId) !== String(entityId)) {
    throw new Error('That financial account is outside the selected business.');
  }
  if (!financialAccountUserCanAccess_(record, user, permission)) {
    throw new Error(
      'This financial account has not been shared with your Nilavaram account.'
    );
  }
}

function getFinancialAccounts(clientId, entityId) {
  const context = requireWorkspaceContext_(clientId, entityId, 'financial-accounts');
  return firestoreGetCollection_(NILAVARAM_FINANCIAL_ACCOUNT_COLLECTION)
    .map(fromFirestoreDocument_)
    .filter(function(record) {
      return record.status !== 'deleted' &&
        String(record.clientId) === String(clientId) &&
        String(record.entityId) === String(entityId) &&
        financialAccountUserCanAccess_(record, context.user, 'view');
    })
    .sort(function(a, b) {
      return String(a.institutionName || '').localeCompare(
        String(b.institutionName || '')
      );
    })
    .map(function(record) {
      return {
        id: record.id,
        institutionName: record.institutionName || '',
        accountName: record.accountName || '',
        accountType: record.accountType || '',
        lastFour: record.lastFour || '',
        currency: record.currency || '',
        status: record.status || 'active',
        sourceDocumentId: record.sourceDocumentId || '',
        canEdit: financialAccountUserCanAccess_(record, context.user, 'edit'),
        canShare: financialAccountCanManageSharing_(record, context.user),
        sharedUsers: (record.sharedUsers || []).map(function(entry) {
          return {
            email: normalizeEmail_(entry.email),
            permission: entry.permission === 'edit' ? 'edit' : 'view'
          };
        }),
        updatedAt: record.updatedAt || ''
      };
    });
}

function saveFinancialAccount(clientId, entityId, input) {
  const context = requireWorkspaceContext_(
    clientId,
    entityId,
    'financial-accounts'
  );
  if (['admin', 'editor', 'superadmin'].indexOf(context.user.role) === -1) {
    throw new Error('Editor permission is required to change financial accounts.');
  }

  const values = input || {};
  const institutionName = normalizeFinancialAccountText_(
    values.institutionName, 'Institution name', 120
  );
  const accountName = normalizeFinancialAccountText_(
    values.accountName, 'Account name', 120
  );
  const accountType = normalizeFinancialAccountText_(
    values.accountType, 'Account type', 60
  );
  const lastFour = String(values.lastFour || '').trim();
  if (lastFour && !/^\d{4}$/.test(lastFour)) {
    throw new Error('Last four digits must contain exactly four numbers.');
  }
  const currency = String(values.currency || 'USD').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('Currency must be a three-letter code.');
  }
  const sourceDocumentId = String(values.sourceDocumentId || '').trim();
  if (sourceDocumentId.length > 200) {
    throw new Error('Source document reference is too long.');
  }

  const recordId = String(values.id || '').trim() ||
    Utilities.getUuid().replace(/-/g, '');
  const previous = values.id
    ? getFinancialAccountRecord_(recordId, clientId, entityId)
    : null;
  if (previous) {
    requireFinancialAccountAccess_(
      previous, context.user, clientId, entityId, 'edit'
    );
  }
  const record = {
    clientId: String(clientId),
    entityId: String(entityId),
    institutionName: institutionName,
    accountName: accountName,
    accountType: accountType,
    lastFour: lastFour,
    currency: currency,
    sourceDocumentId: sourceDocumentId,
    status: 'active',
    createdAt: previous && previous.createdAt || new Date(),
    createdBy: previous && previous.createdBy || context.user.email,
    sharedUsers: previous && previous.sharedUsers || [],
    updatedAt: new Date(),
    updatedBy: context.user.email
  };

  firestoreSetDocument_(
    NILAVARAM_FINANCIAL_ACCOUNT_COLLECTION,
    recordId,
    toFirestoreFields_(record)
  );
  writeAudit_(
    previous ? 'financial-account-updated' : 'financial-account-created',
    context.user.email,
    {
      recordId: recordId,
      clientId: String(clientId),
      entityId: String(entityId),
      institutionName: institutionName,
      accountName: accountName
    }
  );
  return {
    success: true,
    account: {
      id: recordId,
      institutionName: institutionName,
      accountName: accountName,
      accountType: accountType,
      lastFour: lastFour,
      currency: currency,
      status: 'active',
      sourceDocumentId: sourceDocumentId,
      updatedAt: record.updatedAt
    }
  };
}

function financialAccountCanManageSharing_(record, user) {
  return normalizeEmail_(record.createdBy) === normalizeEmail_(user.email) ||
    ['admin', 'superadmin'].indexOf(user.role) !== -1;
}

function getFinancialAccountShareCandidates(clientId, entityId, recordId) {
  const context = requireWorkspaceContext_(
    clientId,
    entityId,
    'financial-accounts'
  );
  const record = getFinancialAccountRecord_(recordId, clientId, entityId);
  if (!financialAccountCanManageSharing_(record, context.user)) {
    throw new Error('Only the record owner or an Admin may manage sharing.');
  }
  return firestoreGetCollection_('users')
    .map(fromFirestoreDocument_)
    .filter(function(user) {
      return user.status === 'active' &&
        normalizeEmail_(user.email) !== normalizeEmail_(record.createdBy) &&
        canUserAccessClient_(user, clientId) &&
        canUserAccessEntity_(user, entityId);
    })
    .sort(function(a, b) {
      return String(a.email).localeCompare(String(b.email));
    })
    .map(function(user) {
      return {
        email: normalizeEmail_(user.email),
        displayName: user.displayName || user.email,
        role: user.role || 'reader',
        permission: (record.sharedUsers || []).some(function(entry) {
          return normalizeEmail_(entry.email) === normalizeEmail_(user.email) &&
            entry.permission === 'edit';
        }) ? 'edit' : (record.sharedUsers || []).some(function(entry) {
          return normalizeEmail_(entry.email) === normalizeEmail_(user.email);
        }) ? 'view' : ''
      };
    });
}

function updateFinancialAccountSharing(
  clientId,
  entityId,
  recordId,
  shares
) {
  const context = requireWorkspaceContext_(
    clientId,
    entityId,
    'financial-accounts'
  );
  const record = getFinancialAccountRecord_(recordId, clientId, entityId);
  if (!financialAccountCanManageSharing_(record, context.user)) {
    throw new Error('Only the record owner or an Admin may manage sharing.');
  }
  const requested = Array.isArray(shares) ? shares : [];
  const activeUsers = firestoreGetCollection_('users')
    .map(fromFirestoreDocument_)
    .filter(function(user) {
      return user.status === 'active' &&
        normalizeEmail_(user.email) !== normalizeEmail_(record.createdBy) &&
        canUserAccessClient_(user, clientId) &&
        canUserAccessEntity_(user, entityId);
    });
  const allowedEmails = activeUsers.map(function(user) {
    return normalizeEmail_(user.email);
  });
  const seen = {};
  const sharedUsers = requested.map(function(entry) {
    const email = normalizeEmail_(entry && entry.email);
    const permission = entry && entry.permission === 'edit' ? 'edit' : 'view';
    if (!email || allowedEmails.indexOf(email) === -1 || seen[email]) return null;
    seen[email] = true;
    return {
      email: email,
      permission: permission,
      sharedAt: new Date(),
      sharedBy: context.user.email
    };
  }).filter(function(entry) { return entry !== null; });

  record.sharedUsers = sharedUsers;
  record.updatedAt = new Date();
  record.updatedBy = context.user.email;
  delete record.id;
  firestoreSetDocument_(
    NILAVARAM_FINANCIAL_ACCOUNT_COLLECTION,
    recordId,
    toFirestoreFields_(record)
  );
  writeAudit_('financial-account-sharing-updated', context.user.email, {
    recordId: recordId,
    clientId: String(clientId),
    entityId: String(entityId),
    sharedUsers: sharedUsers.map(function(entry) {
      return {email: entry.email, permission: entry.permission};
    })
  });
  return {success: true, sharedUsers: sharedUsers};
}

function getMyAccessibleWorkspace(nilavaramSessionKey) {
  const user = requireCurrentUser_(nilavaramSessionKey);
  const clients = getActiveClientsFromFirestore_()
    .filter(function(client) {
      return canUserAccessClient_(user, client.id);
    });
  return clients.map(function(client) {
    return {
      clientId: client.id,
      clientName: client.name,
      entities: getBusinessEntitiesForClientAdmin_(client.id)
        .filter(function(entity) {
          return canUserAccessEntity_(user, entity.id);
        })
        .map(function(entity) {
          return {
            entityId: entity.id,
            entityName: entity.name
          };
        })
    };
  }).filter(function(client) {
    return client.entities.length > 0;
  });
}
