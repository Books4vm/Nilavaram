/**
 * Navigation.js
 * Builds role-filtered, nested dashboard navigation from Firestore.
 */

function getNavigation() {
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
          (!menu.roles || menu.roles.indexOf(user.role) !== -1);
      }).sort(function(a, b) { return a.order - b.order; }),
      items: records.items.filter(function(item) {
        if (!item.enabled || (item.roles || []).indexOf(user.role) === -1) {
          return false;
        }
        if (user.role !== 'ltd' || item.type === 'group') return true;
        return (user.allowedModules || []).indexOf(item.moduleId) !== -1;
      }).sort(function(a, b) { return a.order - b.order; })
    };
  }

  function countModules(tree) {
    return tree.reduce(function(total, menu) {
      function countChildren(children) {
        return (children || []).reduce(function(count, child) {
          return count + (child.moduleId ? 1 : 0) +
            countChildren(child.children);
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

  let records = filterRecords(readNavigationRecords());
  if (records.menus.length < 2 || !records.items.some(function(item) {
    return item.moduleId;
  })) {
    const setup = setupNavigation_();
    if (setup.menuDefinitions && setup.menuItemDefinitions) {
      records = filterRecords({
        menus: setup.menuDefinitions,
        items: setup.menuItemDefinitions
      });
    } else {
      records = filterRecords(readNavigationRecords());
    }
  }
  const navigation = buildTree(records);
  if (!navigation.some(function(menu) {
    return menu.moduleId || (menu.children || []).some(function(child) {
      return child.moduleId;
    });
  })) {
    return readStaticNavigationCatalog_();
  }
  navigation.moduleCount = countModules(navigation);
  return navigation;
}

function readStaticNavigationCatalog_() {
  const html = HtmlService.createHtmlOutputFromFile('MenuCatalog').getContent();
  const match = html.match(/<script[^>]*id="nilavaram-menu-catalog"[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error('MenuCatalog.html does not contain a navigation catalog.');
  const navigation = JSON.parse(match[1].trim());
  navigation.moduleCount = navigation.reduce(function(total, menu) {
    function countChildren(children) {
      return (children || []).reduce(function(count, child) {
        return count + (child.moduleId ? 1 : 0) + countChildren(child.children);
      }, 0);
    }
    return total + (menu.moduleId ? 1 : 0) + countChildren(menu.children);
  }, 0);
  return navigation;
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

  let navigationNeedsSetup = !config ||
    config.version !== NILAVARAM_NAVIGATION_VERSION;
  if (!navigationNeedsSetup) {
    const menus = firestoreGetCollection_('menus');
    const items = firestoreGetCollection_('menuItems');
    navigationNeedsSetup = menus.length < 5 || items.length < 20 ||
      !menus.some(function(menu) {
      return menu.id === 'personal-life';
    }) || !items.some(function(item) {
      return item.id === 'all-businesses';
    });
  }
  if (navigationNeedsSetup) {
    setupNavigation_();
  }
}
