/**
 * Safe navigation-only reset.
 * Run this instead of setupNilavaram() when you want to rebuild the menu and
 * menu-item records without creating or modifying admin users.
 */
function resetNavigationOnly() {
  // Rebuild the Firestore navigation from the current source-of-truth.
  setupNavigation_();

  // Explicitly retire stale legacy backup entries that can otherwise reappear
  // in the left navigation and confuse users with duplicate backup items.
  [
    'wizard-backup',
    'backup-status-legacy',
    'back-up',
    'backup'
  ].forEach(function(itemId) {
    try {
      firestoreSetDocument_('menuItems', itemId, toFirestoreFields_({
        menuId: 'documents',
        parentId: 'documents',
        level: 2,
        label: 'Retired Backup Entry',
        description: 'Retired to prevent duplicate backup menu items.',
        moduleId: 'backup-status',
        type: 'link',
        order: 999,
        enabled: false,
        roles: ['admin'],
        retiredAt: new Date()
      }));
    } catch (error) {
      if (String(error.message).indexOf('HTTP status: 404') === -1) {
        throw error;
      }
    }
  });

  // Ensure the version stamp matches the current navigation definition.
  firestoreSetDocument_('system', 'navigation-config', toFirestoreFields_({
    version: NILAVARAM_NAVIGATION_VERSION,
    updatedAt: new Date()
  }));

  return {
    success: true,
    message: 'Navigation reset only. Admin records were not changed.'
  };
}
