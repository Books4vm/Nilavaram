/**
 * Navigation.js
 * Builds role-filtered, nested dashboard navigation from Firestore.
 */

function normalizeScopeList_(ids) {
  if (!ids || !ids.length) return ['*'];
  return ids.map(String);
}

function scopeAllows_(ids, value) {
  const list = normalizeScopeList_(ids);
  if (list.indexOf('*') !== -1) return true;
  if (!value) return false;
  return list.indexOf(String(value)) !== -1;
}

function roleAllowed_(roles, role) {
  if (role === 'superadmin') return true;
  return !roles || !roles.length || roles.indexOf(role) !== -1;
}

function resolveWiringStatus_(moduleId) {
  const id = String(moduleId || '').trim();
  if (!id) return 'planned';

  const live = [
    'chart-of-accounts', 'account-add-new', 'account-batch-edit',
    'input-main', 'input-receipt', 'input-payment', 'input-journal',
    'input-upload-csv', 'input-upload-pdf', 'input-upload-image',
    'input-upload-txt', 'input-workbench', 'input-acode-map',
    'connections', 'users', 'alerts', 'reminders', 'pending-features',
    'about-version-history'
  ];
  const help = [
    'navigation-guide', 'project-start', 'nilavaram-core', 'getting-started',
    'users-access-guide', 'accounting-guide', 'accounting-operating-rules',
    'documents-imports-guide', 'inactivity-sign-in', 'project-architecture',
    'faq', 'admin-technical-guide'
  ];
  const partial = [
    'all-businesses', 'system-status', 'backup-status', 'archive-library',
    'upload-documents', 'missing-documents', 'expiring-documents',
    'archived-documents', 'unlinked-documents', 'source-input',
    'reconciliation-validation', 'audit-log', 'new-transaction',
    'transaction-workbench', 'account-rule-review', 'manual-journal-entry'
  ];

  if (live.indexOf(id) !== -1) return 'live';
  if (help.indexOf(id) !== -1) return 'help';
  if (partial.indexOf(id) !== -1) return 'partial';
  if (id.indexOf('wizard-') === 0) return 'partial';
  return 'planned';
}

function attachWiringStatus_(node) {
  if (node.moduleId) {
    node.wiringStatus = node.wiringStatus || resolveWiringStatus_(node.moduleId);
  }
  (node.children || []).forEach(attachWiringStatus_);
  return node;
}

function getNavigation(clientId, entityId) {
  return buildNavigationTree_(clientId, entityId);
}

function getNavigationForShell(clientId, entityId) {
  requireCurrentUser_();
  return buildNavigationTree_(clientId, entityId);
}

function buildNavigationTree_(clientId, entityId) {
  const user = requireCurrentUser_();
  ensureNavigationSetup_();

  function readNavigationRecords() {
    return {
      menus: firestoreGetCollection_('menus').map(fromFirestoreDocument_),
      items: firestoreGetCollection_('menuItems').map(fromFirestoreDocument_)
    };
  }

  function filterRecords(records) {
    return {
      menus: records.menus.filter(function(menu) {
        return menu.enabled !== false &&
          roleAllowed_(menu.roles, user.role) &&
          scopeAllows_(menu.clientIds, clientId);
      }).sort(function(a, b) { return a.order - b.order; }),
      items: records.items.filter(function(item) {
        if (item.enabled === false) return false;
        if (!roleAllowed_(item.roles, user.role)) return false;
        if (!scopeAllows_(item.clientIds, clientId)) return false;
        if (!scopeAllows_(item.entityIds, entityId)) return false;
        if (user.role !== 'ltd' || item.type === 'group') return true;
        return (user.allowedModules || []).indexOf(item.moduleId) !== -1;
      }).sort(function(a, b) { return a.order - b.order; })
    };
  }

  function countModules(tree) {
    return tree.reduce(function(total, menu) {
      function countChildren(children) {
        return (children || []).reduce(function(count, child) {
          return count + (child.moduleId ? 1 : 0) + countChildren(child.children);
        }, 0);
      }
      return total + (menu.moduleId ? 1 : 0) + countChildren(menu.children);
    }, 0);
  }

  function buildTree(records) {
    const menus = records.menus;
    const items = records.items;

    function buildChildren(parentId) {
      return items
        .filter(function(item) { return item.parentId === parentId; })
        .map(function(item) {
          return attachWiringStatus_({
            id: item.id,
            label: item.label,
            description: item.description || '',
            moduleId: item.moduleId || '',
            type: item.type || 'link',
            level: item.level || 2,
            wiringStatus: item.wiringStatus || '',
            children: buildChildren(item.id)
          });
        });
    }

    return menus.map(function(menu) {
      return attachWiringStatus_({
        id: menu.id,
        label: menu.label,
        description: menu.description || '',
        type: menu.type || 'group',
        moduleId: menu.moduleId || '',
        wiringStatus: menu.wiringStatus || '',
        children: buildChildren(menu.id)
      });
    });
  }

  let records = filterRecords(readNavigationRecords());
  if (records.menus.length < 2 || !records.items.some(function(item) {
    return item.moduleId;
  })) {
    setupNavigation_();
    records = filterRecords(readNavigationRecords());
  }

  const navigation = buildTree(records);
  if (!navigation.some(function(menu) {
    return menu.moduleId || (menu.children || []).some(function(child) {
      return child.moduleId;
    });
  })) {
    throw new Error(
      'No menu items matched this user, client and business. Run rewriteNavigationInFirestore().'
    );
  }

  navigation.moduleCount = countModules(navigation);
  return navigation;
}

function readStaticNavigationCatalog_() {
  throw new Error(
    'Navigation is missing in Firestore. Sign in as the owner, open ?developer=1, and run Reset shell data.'
  );
}

function ensureNavigationSetup_() {
  let config = null;
  try {
    config = fromFirestoreDocument_(
      firestoreGetDocument_('system', 'navigation-config')
    );
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') === -1) {
      throw error;
    }
  }

  if (!config || config.version !== NILAVARAM_NAVIGATION_VERSION) {
    setupNavigation_();
  }
}

/**
 * Confirms that the signed-in user may open a module for the selected business.
 *
 * @param {string} moduleId Requested module identifier.
 * @param {string} entityId Selected business entity identifier.
 * @returns {Object}
 */
function authorizeModuleAccess(moduleId, entityId) {
  const user = requireCurrentUser_();
  const normalizedModuleId = String(moduleId || '').trim();
  const normalizedEntityId = String(entityId || '').trim();

  if (!normalizedModuleId) {
    throw new Error('Select a menu item before opening a module window.');
  }
  if (!normalizedEntityId) {
    throw new Error('Select a business before opening a module window.');
  }

  const entity = getDocumentOrNull_('entities', normalizedEntityId);
  if (!entity || entity.status !== 'active') {
    throw new Error('The selected business is not available.');
  }

  const menuItems = firestoreGetCollection_('menuItems').map(fromFirestoreDocument_);
  const menuItem = menuItems.find(function(item) {
    return item.enabled !== false &&
      (item.id === normalizedModuleId || item.moduleId === normalizedModuleId);
  });
  if (!menuItem) {
    throw new Error('That menu item is not registered in Firestore navigation.');
  }
  if (!roleAllowed_(menuItem.roles, user.role)) {
    throw new Error('Your role does not include access to ' + menuItem.label + '.');
  }
  if (user.role === 'ltd' && menuItem.type !== 'group' &&
      (user.allowedModules || []).indexOf(menuItem.moduleId || menuItem.id) === -1) {
    throw new Error('Your limited access does not include ' + menuItem.label + '.');
  }

  return {
    authorized: true,
    moduleId: menuItem.moduleId || menuItem.id,
    moduleLabel: menuItem.label,
    entityId: entity.id,
    entityName: entity.name,
    description: menuItem.description || ''
  };
}
