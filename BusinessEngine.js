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

function slugIdFromName_(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function nextClientOrder_() {
  ensureClientRecords_();
  const clients = firestoreGetCollection_('clients')
    .map(fromFirestoreDocument_)
    .filter(function(client) {
      return client.status === 'active';
    });
  if (!clients.length) return 10;
  return Math.max.apply(null, clients.map(function(client) {
    return Number(client.order || 0);
  })) + 10;
}

function readActiveClientById_(clientId) {
  const client = getDocumentOrNull_('clients', String(clientId || '').trim());
  if (!client || client.status !== 'active') {
    throw new Error('Choose a valid active client.');
  }
  return client;
}

function readActiveBusinessById_(entityId) {
  const entity = getDocumentOrNull_('entities', String(entityId || '').trim());
  if (!entity || entity.status !== 'active' || entity.entityType !== 'business') {
    throw new Error('Choose a valid active business.');
  }
  return entity;
}

function filterClientsForCurrentUser_(clients) {
  const user = requireCurrentUser_();
  return (clients || []).filter(function(client) {
    return canUserAccessClient_(user, client.id);
  });
}

function filterEntitiesForCurrentUser_(entities) {
  const user = requireCurrentUser_();
  return (entities || []).filter(function(entity) {
    return canUserAccessEntity_(user, entity.id);
  });
}

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

function getActiveClientsFromFirestore_() {
  ensureClientRecords_();
  return firestoreGetCollection_('clients')
    .map(fromFirestoreDocument_)
    .filter(function(client) {
      return client.status === 'active';
    })
    .sort(function(a, b) {
      return Number(a.order || 0) - Number(b.order || 0);
    });
}

function getBusinessEntitiesForClientAdmin_(clientId) {
  readActiveClientById_(clientId);
  ensureClientBusinessEntities_();
  return firestoreGetCollection_('entities')
    .map(fromFirestoreDocument_)
    .filter(function(entity) {
      return entity.status === 'active' &&
        entity.entityType === 'business' &&
        entity.clientId === clientId;
    })
    .sort(function(a, b) {
      return String(a.name).localeCompare(String(b.name));
    })
    .map(function(entity) {
      return { id: entity.id, name: entity.name };
    });
}

/**
 * Full client + business tree for admin pop-up and invite pickers.
 *
 * @returns {Object[]}
 */
function getClientBusinessAdminCatalog_() {
  return getActiveClientsFromFirestore_().map(function(client) {
    return {
      id: client.id,
      name: client.name,
      order: client.order || 0,
      entities: getBusinessEntitiesForClientAdmin_(client.id)
    };
  });
}

/**
 * Gate 2 for Clients & Businesses pop-up.
 *
 * @returns {Object}
 */
function getClientBusinessPageData() {
  requireAdmin_();
  return {
    clients: getClientBusinessAdminCatalog_(),
    canManageClients: true,
    canManageBusinesses: true
  };
}

function getClientGroupsForShell_() {
  requireCurrentUser_();
  const clients = getActiveClientsFromFirestore_().map(function(client) {
    return { id: client.id, name: client.name };
  });
  return filterClientsForCurrentUser_(clients);
}

function getBusinessEntitiesForShell_(clientGroupName) {
  requireCurrentUser_();
  ensureClientBusinessEntities_();
  const group = String(clientGroupName || NILAVARAM_CLIENT_GROUP);
  const entities = firestoreGetCollection_('entities')
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
  return filterEntitiesForCurrentUser_(entities);
}

function getBusinessEntitiesForClient(clientId) {
  const user = requireCurrentUser_();
  const client = readActiveClientById_(clientId);
  if (!canUserAccessClient_(user, client.id)) {
    throw new Error('Your Nilavaram access does not include the selected client.');
  }
  const entities = getBusinessEntitiesForClientAdmin_(client.id);
  return filterEntitiesForCurrentUser_(entities);
}

/**
 * Creates a new client record.
 *
 * @param {string} name Display name.
 * @returns {Object}
 */
function createClientRecord(name) {
  const admin = requireAdmin_();
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    throw new Error('Enter a client name.');
  }

  const id = slugIdFromName_(trimmed);
  if (!id) {
    throw new Error('That client name is not usable.');
  }

  const existing = getDocumentOrNull_('clients', id);
  if (existing && existing.status === 'active') {
    throw new Error('A client with that name already exists.');
  }

  const record = {
    name: trimmed,
    order: nextClientOrder_(),
    status: 'active',
    createdBy: admin.email,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  firestoreSetDocument_('clients', id, toFirestoreFields_(record));
  writeAudit_('client-created', id, {
    name: trimmed,
    actorEmail: admin.email
  });

  return {
    success: true,
    message: 'Client created.',
    client: { id: id, name: trimmed }
  };
}

/**
 * Renames an existing client
 * @param {string} clientId
 * @param {string} name
 * @returns {Object}
 */
function updateClientRecord(clientId, name) {
  const admin = requireAdmin_();
  const client = readActiveClientById_(clientId);
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    throw new Error('Enter a client name.');
  }

  const previousName = client.name;
  client.name = trimmed;
  client.updatedAt = new Date();
  client.updatedBy = admin.email;
  delete client.id;

  firestoreSetDocument_('clients', clientId, toFirestoreFields_(client));

  const entities = firestoreGetCollection_('entities')
    .map(fromFirestoreDocument_)
    .filter(function(entity) {
      return entity.status === 'active' &&
        entity.entityType === 'business' &&
        entity.clientId === clientId;
    });

  entities.forEach(function(entity) {
    const entityDocId = entity.id;
    entity.clientGroup = trimmed;
    entity.updatedAt = new Date();
    entity.updatedBy = admin.email;
    delete entity.id;
    firestoreSetDocument_('entities', entityDocId, toFirestoreFields_(entity));
  });

  writeAudit_('client-renamed', clientId, {
    previousName: previousName,
    newName: trimmed,
    actorEmail: admin.email
  });

  return {
    success: true,
    message: 'Client name updated.',
    client: { id: clientId, name: trimmed }
  };
}

/**
 * Creates a business under a client.
 *
 * @param {string} clientId
 * @param {string} name
 * @returns {Object}
 */
function createBusinessForClient(clientId, name) {
  const admin = requireAdmin_();
  const client = readActiveClientById_(clientId);
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    throw new Error('Enter a business name.');
  }

  const id = slugIdFromName_(trimmed);
  if (!id) {
    throw new Error('That business name is not usable.');
  }

  const existing = getDocumentOrNull_('entities', id);
  if (
    existing &&
    existing.status === 'active' &&
    existing.entityType === 'business' &&
    existing.clientId === client.id
  ) {
    throw new Error('That business name already exists for this client.');
  }

  const record = {
    name: trimmed,
    clientGroup: client.name,
    clientId: client.id,
    entityType: 'business',
    status: 'active',
    createdBy: admin.email,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  firestoreSetDocument_('entities', id, toFirestoreFields_(record));
  writeAudit_('business-created', id, {
    name: trimmed,
    clientId: client.id,
    actorEmail: admin.email
  });

  return {
    success: true,
    message: 'Business created.',
    entity: { id: id, name: trimmed, clientId: client.id }
  };
}

/**
 * Renames an existing business entity.
 *
 * @param {string} entityId
 * @param {string} name
 * @returns {Object}
 */
function updateBusinessEntityRecord(entityId, name) {
  const admin = requireAdmin_();
  const entity = readActiveBusinessById_(entityId);
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    throw new Error('Enter a business name.');
  }

  const previousName = entity.name;
  entity.name = trimmed;
  entity.updatedAt = new Date();
  entity.updatedBy = admin.email;
  delete entity.id;

  firestoreSetDocument_('entities', entityId, toFirestoreFields_(entity));
  writeAudit_('business-renamed', entityId, {
    previousName: previousName,
    newName: trimmed,
    clientId: entity.clientId,
    actorEmail: admin.email
  });

  return {
    success: true,
    message: 'Business name updated.',
    entity: { id: entityId, name: trimmed, clientId: entity.clientId }
  };
}

/**
 * Legacy helper — adds a business by client group display name.
 *
 * @param {string} name
 * @param {string} clientGroupName
 * @returns {Object}
 */
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
  return createBusinessForClient(client.id, trimmed);
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