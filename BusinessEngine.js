/**
 * BusinessEngine.js
 * Client groups and business entities — Firestore only.
 */

const NILAVARAM_CLIENT_GROUP = 'VAV Group';

const NILAVARAM_DEFAULT_CLIENTS = [
  { id: 'vav-group', name: 'VAV Group', order: 10 },
  { id: 'deco-mondial', name: 'Deco mondial', order: 20 },
  { id: 'vela-portus', name: 'Vela Portus', order: 30 }
];

const NILAVARAM_DEFAULT_BUSINESS_ENTITIES = [
  { id: 'vav-tr', name: 'VAV Tr.' },
  { id: 'om-namasivaya-tr', name: 'Om Namasivaya Tr' },
  { id: 'vm-tr', name: 'VM Tr' },
  { id: 'vm', name: 'VM' },
  { id: 'ma', name: 'MA' },
  { id: 'ms', name: 'MS' },
  { id: 'mr', name: 'MR' }
];

function ensureClientRecords_() {
  NILAVARAM_DEFAULT_CLIENTS.forEach(function(item) {
    firestoreSetDocument_('clients', item.id, toFirestoreFields_({
      name: item.name,
      order: item.order,
      status: 'active',
      updatedAt: new Date()
    }));
  });
}

function ensureClientBusinessEntities_() {
  ensureClientRecords_();
  NILAVARAM_DEFAULT_BUSINESS_ENTITIES.forEach(function(item) {
    firestoreSetDocument_('entities', item.id, toFirestoreFields_({
      name: item.name,
      clientGroup: NILAVARAM_CLIENT_GROUP,
      clientId: 'vav-group',
      entityType: 'business',
      status: 'active',
      updatedAt: new Date()
    }));
  });
}

function getClientGroupsForShell_() {
  requireCurrentUser_();
  ensureClientRecords_();
  return firestoreGetCollection_('clients')
    .map(fromFirestoreDocument_)
    .filter(function(client) {
      return client.status === 'active';
    })
    .sort(function(a, b) {
      return Number(a.order || 0) - Number(b.order || 0);
    })
    .map(function(client) {
      return { id: client.id, name: client.name };
    });
}

function getBusinessEntitiesForShell_(clientGroupName) {
  requireCurrentUser_();
  ensureClientBusinessEntities_();
  const group = String(clientGroupName || NILAVARAM_CLIENT_GROUP);
  return firestoreGetCollection_('entities')
    .map(fromFirestoreDocument_)
    .filter(function(entity) {
      return entity.status === 'active' &&
        entity.entityType === 'business' &&
        entity.clientGroup === group;
    })
    .sort(function(a, b) {
      return String(a.name).localeCompare(String(b.name));
    })
    .map(function(entity) {
      return { id: entity.id, name: entity.name };
    });
}

function getBusinessEntitiesForClient(clientId) {
  requireCurrentUser_();
  const client = getDocumentOrNull_('clients', String(clientId || '').trim());
  if (!client || client.status !== 'active') {
    throw new Error('Choose a valid client.');
  }
  ensureClientBusinessEntities_();
  return firestoreGetCollection_('entities')
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
}

function addClientBusinessEntity(name, clientGroupName) {
  const user = requireCurrentUser_();
  if (['superadmin', 'admin', 'editor'].indexOf(user.role) === -1) {
    throw new Error('Only Admin or Editor users may add a business name.');
  }
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    throw new Error('Enter a business name.');
  }
  const group = String(clientGroupName || NILAVARAM_CLIENT_GROUP).trim();
  const client = firestoreGetCollection_('clients')
    .map(fromFirestoreDocument_)
    .find(function(item) {
      return item.name === group && item.status === 'active';
    });
  if (!client) {
    throw new Error('Choose a valid client before adding a business.');
  }
  const id = trimmed.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!id) {
    throw new Error('That business name is not usable.');
  }
  const existing = getDocumentOrNull_('entities', id);
  if (existing) {
    if (
      existing.clientId === client.id &&
      existing.entityType === 'business' &&
      existing.status === 'active'
    ) {
      throw new Error('That business name already exists.');
    }
    firestoreSetDocument_('entities', id, toFirestoreFields_({
      name: trimmed,
      clientGroup: group,
      clientId: client.id,
      entityType: 'business',
      status: 'active',
      updatedAt: new Date()
    }));
    return { success: true, entity: { id: id, name: trimmed }, relinked: true };
  }
  firestoreSetDocument_('entities', id, toFirestoreFields_({
    name: trimmed,
    clientGroup: group,
    clientId: client.id,
    entityType: 'business',
    status: 'active',
    createdBy: user.email,
    createdAt: new Date()
  }));
  return { success: true, entity: { id: id, name: trimmed } };
}

function rewriteShellClientsAndBusinesses() {
  requirePrimaryDeveloper_();
  ensureClientRecords_();
  NILAVARAM_DEFAULT_BUSINESS_ENTITIES.forEach(function(item) {
    firestoreSetDocument_('entities', item.id, toFirestoreFields_({
      name: item.name,
      clientGroup: NILAVARAM_CLIENT_GROUP,
      clientId: 'vav-group',
      entityType: 'business',
      status: 'active',
      updatedAt: new Date()
    }));
  });
  return {
    success: true,
    clients: getClientGroupsForShell_(),
    vavGroupBusinesses: getBusinessEntitiesForClient('vav-group')
  };
}