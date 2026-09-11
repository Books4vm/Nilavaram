/**
 * ContextEngine.js
 * Nilavaram workspace context: user + client + business + module.
 */

function normalizeAllowedEntityIds_(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.map(function(id) {
    return String(id || '').trim();
  }).filter(function(id) {
    return !!id;
  });
}

function normalizeAllowedClientIds_(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.map(function(id) {
    return String(id || '').trim();
  }).filter(function(id) {
    return !!id;
  });
}

function userHasUnrestrictedEntityAccess_(user) {
  if (!user) return false;
  if (user.role === 'superadmin' || user.role === 'admin') return true;
  if (typeof isSuperAdminEmail_ === 'function' &&
      isSuperAdminEmail_(user.email)) {
    return true;
  }
  return false;
}

function userHasUnrestrictedClientAccess_(user) {
  return userHasUnrestrictedEntityAccess_(user);
}

function canUserAccessClient_(user, clientId) {
  const normalizedClientId = String(clientId || '').trim();
  if (!normalizedClientId) return false;
  if (userHasUnrestrictedClientAccess_(user)) return true;
  const list = normalizeAllowedClientIds_(user.allowedClientIds);
  if (!list.length) return true;
  return list.indexOf(normalizedClientId) !== -1;
}

function requireUserClientAccess_(user, clientId) {
  if (!canUserAccessClient_(user, clientId)) {
    throw new Error(
      'Your Nilavaram access does not include the selected client.'
    );
  }
}

function canUserAccessEntity_(user, entityId) {
  const normalizedEntityId = String(entityId || '').trim();
  if (!normalizedEntityId) return false;
  if (userHasUnrestrictedEntityAccess_(user)) return true;
  const list = normalizeAllowedEntityIds_(user.allowedEntityIds);
  if (!list.length) return true;
  return list.indexOf(normalizedEntityId) !== -1;
}

function requireUserEntityAccess_(user, entityId) {
  if (!canUserAccessEntity_(user, entityId)) {
    throw new Error(
      'Your Nilavaram access does not include the selected business.'
    );
  }
}

function requireActiveClient_(clientId) {
  const normalizedClientId = String(clientId || '').trim();
  if (!normalizedClientId) {
    throw new Error('Select a client before continuing.');
  }
  const client = getDocumentOrNull_('clients', normalizedClientId);
  if (!client || client.status !== 'active') {
    throw new Error('The selected client is not available.');
  }
  return client;
}

function requireActiveEntityForClient_(entityId, clientId) {
  const normalizedEntityId = String(entityId || '').trim();
  if (!normalizedEntityId) {
    throw new Error('Select a business before continuing.');
  }
  const entity = getDocumentOrNull_('entities', normalizedEntityId);
  if (!entity || entity.status !== 'active') {
    throw new Error('The selected business is not available.');
  }
  if (clientId && String(entity.clientId || '') !== String(clientId)) {
    throw new Error('That business does not belong to the selected client.');
  }
  return entity;
}

function findMenuItemForModule_(moduleId) {
  const normalizedModuleId = String(moduleId || '').trim();
  if (!normalizedModuleId) {
    throw new Error('Select a menu item before opening a module window.');
  }
  const menuItems = firestoreGetCollection_('menuItems')
    .map(fromFirestoreDocument_);
  const menuItem = menuItems.find(function(item) {
    return item.enabled !== false &&
      (item.id === normalizedModuleId ||
        item.moduleId === normalizedModuleId);
  });
  if (!menuItem) {
    throw new Error(
      'That menu item is not registered in Firestore navigation.'
    );
  }
  return menuItem;
}

function requireMenuItemAccess_(user, menuItem, clientId, entityId) {
  if (!roleAllowed_(menuItem.roles, user.role)) {
    throw new Error(
      'Your role does not include access to ' + menuItem.label + '.'
    );
  }
  if (!scopeAllows_(menuItem.clientIds, clientId)) {
    throw new Error(
      menuItem.label + ' is not available for the selected client.'
    );
  }
  if (!scopeAllows_(menuItem.entityIds, entityId)) {
    throw new Error(
      menuItem.label + ' is not available for the selected business.'
    );
  }
  if (user.role === 'ltd' && menuItem.type !== 'group' &&
      (user.allowedModules || []).length &&
      (user.allowedModules || []).indexOf(
        menuItem.moduleId || menuItem.id
      ) === -1) {
    throw new Error(
      'Your limited access does not include ' + menuItem.label + '.'
    );
  }
}

function resolveWorkspaceClientId_(clientId, entityId) {
  let normalizedClientId = String(clientId || '').trim();
  if (normalizedClientId) return normalizedClientId;
  const entity = getDocumentOrNull_('entities', String(entityId || '').trim());
  if (entity && entity.clientId) {
    return String(entity.clientId);
  }
  return '';
}

/**
 * Validates user + client + business + module before module work begins.
 *
 * @param {string} clientId Selected client identifier.
 * @param {string} entityId Selected business identifier.
 * @param {string} moduleId Requested module identifier.
 * @returns {Object}
 */
function requireWorkspaceContext_(clientId, entityId, moduleId) {
  const user = requireCurrentUser_();
  const normalizedClientId = resolveWorkspaceClientId_(clientId, entityId);

  requireActiveClient_(normalizedClientId);
  requireUserClientAccess_(user, normalizedClientId);
  requireUserEntityAccess_(user, entityId);

  const entity = requireActiveEntityForClient_(entityId, normalizedClientId);
  const menuItem = findMenuItemForModule_(moduleId);

  requireMenuItemAccess_(
    user,
    menuItem,
    normalizedClientId,
    entity.id
  );

  return {
    user: user,
    clientId: normalizedClientId,
    entity: entity,
    menuItem: menuItem
  };
}