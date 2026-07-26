/**
 * Navigation.js
 * Builds role-filtered, nested dashboard navigation from Firestore.
 */

function getNavigation() {
  const user = requireCurrentUser_();
  ensureNavigationSetup_();

  const menus = firestoreGetCollection_('menus')
    .map(fromFirestoreDocument_)
    .filter(function(menu) {
      return menu.enabled &&
        (!menu.roles || menu.roles.indexOf(user.role) !== -1);
    })
    .sort(function(a, b) { return a.order - b.order; });

  const items = firestoreGetCollection_('menuItems')
    .map(fromFirestoreDocument_)
    .filter(function(item) {
      if (!item.enabled || (item.roles || []).indexOf(user.role) === -1) {
        return false;
      }
      if (user.role !== 'ltd' || item.type === 'group') return true;
      return (user.allowedModules || []).indexOf(item.moduleId) !== -1;
    })
    .sort(function(a, b) { return a.order - b.order; });

  function buildChildren(parentId) {
    return items
      .filter(function(item) { return item.parentId === parentId; })
      .map(function(item) {
        return {
          id: item.id,
          label: item.label,
          description: item.description || '',
          moduleId: item.moduleId || '',
          type: item.type || 'link',
          level: item.level || 2,
          children: buildChildren(item.id)
        };
      });
  }

  return menus.map(function(menu) {
    return {
      id: menu.id,
      label: menu.label,
      description: menu.description || '',
      type: menu.type || 'group',
      moduleId: menu.moduleId || '',
      children: buildChildren(menu.id)
    };
  });
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
