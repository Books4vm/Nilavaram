/**
 * Navigation.js
 * Builds dashboard navigation entirely from Firestore.
 */

/**
 * Returns only the navigation available to the signed-in user.
 *
 * @returns {Object[]}
 */
function getNavigation() {
  const user = requireCurrentUser_();
  const menus = firestoreGetCollection_('menus')
    .map(fromFirestoreDocument_)
    .filter(function(menu) { return menu.enabled; })
    .sort(function(a, b) { return a.order - b.order; });

  const items = firestoreGetCollection_('menuItems')
    .map(fromFirestoreDocument_)
    .filter(function(item) {
      if (!item.enabled || (item.roles || []).indexOf(user.role) === -1) {
        return false;
      }
      return user.role !== 'ltd' ||
        (user.allowedModules || []).indexOf(item.moduleId) !== -1;
    })
    .sort(function(a, b) { return a.order - b.order; });

  return menus.map(function(menu) {
    return {
      id: menu.id,
      heading: menu.label,
      buttons: items
        .filter(function(item) { return item.menuId === menu.id; })
        .map(function(item) {
          return {
            id: item.id,
            label: item.label,
            moduleId: item.moduleId
          };
        })
    };
  }).filter(function(menu) {
    return menu.buttons.length > 0;
  });
}
