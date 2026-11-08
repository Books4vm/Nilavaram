/**
 * UserMenuPreferences.js
 * User-scoped menu visibility and ordering preferences.
 *
 * Stores only:
 * - Menu item IDs
 * - Visibility state (shown/hidden)
 * - Display order
 * - Version/update metadata
 *
 * Does NOT:
 * - Duplicate menu definitions
 * - Override authorization
 * - Allow menu deletion
 * - Modify shared menus or menuItems collections
 */

/**
 * Gets the current user's menu preferences.
 * Returns an object with visibility and ordering state.
 *
 * @param {string} nilavaramSessionKey User session key for authentication.
 * @returns {Object} { version, items: [{ id, visible, order }] }
 */
function getUserMenuPreferences(nilavaramSessionKey) {
  const user = requireCurrentUser_(nilavaramSessionKey);
  const userEmail = normalizeEmail_(user.email);

  try {
    const doc = fromFirestoreDocument_(
      firestoreGetDocument_('userMenuPreferences', userEmail)
    );
    return doc || { version: 1, items: [] };
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') !== -1) {
      return { version: 1, items: [] };
    }
    throw error;
  }
}

/**
 * Saves user menu preferences.
 * Preferences are scoped to the authenticated user.
 *
 * @param {Array} items Array of { id, visible, order } objects.
 * @param {string} nilavaramSessionKey User session key.
 * @returns {Object}
 */
function saveUserMenuPreferences(items, nilavaramSessionKey) {
  const user = requireCurrentUser_(nilavaramSessionKey);
  const userEmail = normalizeEmail_(user.email);

  if (!Array.isArray(items)) {
    throw new Error('Menu preferences items must be an array.');
  }

  const prefs = {
    version: 1,
    items: items.map(function(item) {
      return {
        id: String(item.id || '').trim(),
        visible: Boolean(item.visible),
        order: Number(item.order) || 0
      };
    }),
    updatedAt: new Date(),
    updatedBy: user.email
  };

  firestoreSetDocument_(
    'userMenuPreferences',
    userEmail,
    toFirestoreFields_(prefs)
  );

  writeAudit_('user-menu-preferences-saved', user.email, {
    itemCount: items.length,
    timestamp: new Date().toISOString()
  });

  return { success: true, saved: items.length };
}

/**
 * Resets user menu preferences to default (clears all stored preferences).
 * The next load will use the authoritative menu defaults from Firestore.
 *
 * @param {string} nilavaramSessionKey User session key.
 * @returns {Object}
 */
function resetUserMenuPreferencesToDefault(nilavaramSessionKey) {
  const user = requireCurrentUser_(nilavaramSessionKey);
  const userEmail = normalizeEmail_(user.email);

  try {
    firestoreDeleteDocument_('userMenuPreferences', userEmail);
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') === -1) {
      throw error;
    }
  }

  writeAudit_('user-menu-preferences-reset', user.email, {
    resetAt: new Date().toISOString()
  });

  return { success: true, reset: true };
}

/**
 * Applies user menu preferences to a navigation tree.
 * Filters visible items and reorders based on stored preferences.
 * Does NOT modify the original navigation.
 *
 * @param {Array} navigation Navigation tree from buildNavigationTree_.
 * @param {Array} preferencesItems User preferences items array.
 * @returns {Array} Filtered and reordered navigation tree.
 */
function applyUserMenuPreferences(navigation, preferencesItems) {
  if (!preferencesItems || !preferencesItems.length) {
    return navigation;
  }

  const prefsMap = {};
  preferencesItems.forEach(function(pref) {
    prefsMap[String(pref.id)] = {
      visible: pref.visible !== false,
      order: Number(pref.order) || 0
    };
  });

  function filterAndReorder(nodes) {
    return nodes
      .map(function(node) {
        const pref = prefsMap[String(node.id)];
        const visible = !pref || pref.visible !== false;

        if (!visible) {
          return null;
        }

        return {
          id: node.id,
          label: node.label,
          description: node.description || '',
          type: node.type || 'link',
          moduleId: node.moduleId || '',
          wiringStatus: node.wiringStatus || 'planned',
          children: filterAndReorder(node.children || []),
          preferenceOrder: pref ? pref.order : node.order || 0
        };
      })
      .filter(function(node) {
        return node !== null;
      })
      .sort(function(a, b) {
        return a.preferenceOrder - b.preferenceOrder;
      });
  }

  return filterAndReorder(navigation);
}
