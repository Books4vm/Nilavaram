/**
 * Setup.js
 * One-time, repeatable creation of Nilavaram's initial Firestore records.
 */

const NILAVARAM_PRIMARY_ADMIN_EMAIL = 'mangai8100@gmail.com';
const NILAVARAM_INITIAL_ADMIN_EMAILS = [
  'mangai8100@gmail.com',
  'vm8100@gmail.com'
];

/**
 * Creates or refreshes the initial menus, menu items and first Admin.
 *
 * Run this function manually once from the Apps Script editor after clasp push.
 * It is safe to run again: documents with the same IDs are updated.
 *
 * @returns {Object}
 */
function setupNilavaram() {
  const menus = [
    { id: 'system', label: 'System', order: 10, enabled: true },
    { id: 'security', label: 'Security', order: 20, enabled: true },
    { id: 'registry', label: 'Registry', order: 30, enabled: true },
    { id: 'administration', label: 'Administration', order: 40, enabled: true }
  ];

  const menuItems = [
    { id: 'configuration', menuId: 'system', label: 'Configuration', moduleId: 'configuration', order: 10, enabled: true, roles: ['admin'] },
    { id: 'firestore', menuId: 'system', label: 'Firestore', moduleId: 'firestore', order: 20, enabled: true, roles: ['admin'] },
    { id: 'system-status', menuId: 'system', label: 'System Status', moduleId: 'system-status', order: 30, enabled: true, roles: ['admin'] },
    { id: 'users', menuId: 'security', label: 'Users', moduleId: 'users', order: 10, enabled: true, roles: ['admin'] },
    { id: 'roles', menuId: 'security', label: 'Roles', moduleId: 'roles', order: 20, enabled: true, roles: ['admin'] },
    { id: 'permissions', menuId: 'security', label: 'Permissions', moduleId: 'permissions', order: 30, enabled: true, roles: ['admin'] },
    { id: 'files', menuId: 'registry', label: 'Files', moduleId: 'files', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'modules', menuId: 'registry', label: 'Modules', moduleId: 'modules', order: 20, enabled: true, roles: ['admin'] },
    { id: 'menus', menuId: 'registry', label: 'Menus', moduleId: 'menus', order: 30, enabled: true, roles: ['admin'] },
    { id: 'sessions', menuId: 'administration', label: 'Sessions', moduleId: 'sessions', order: 10, enabled: true, roles: ['admin'] },
    { id: 'audit-log', menuId: 'administration', label: 'Audit Log', moduleId: 'audit-log', order: 20, enabled: true, roles: ['admin'] },
    { id: 'settings', menuId: 'administration', label: 'Settings', moduleId: 'settings', order: 30, enabled: true, roles: ['admin'] }
  ];

  menus.forEach(function(menu) {
    firestoreSetDocument_('menus', menu.id, toFirestoreFields_({
      label: menu.label,
      order: menu.order,
      enabled: menu.enabled
    }));
  });

  menuItems.forEach(function(item) {
    firestoreSetDocument_('menuItems', item.id, toFirestoreFields_({
      menuId: item.menuId,
      label: item.label,
      moduleId: item.moduleId,
      order: item.order,
      enabled: item.enabled,
      roles: item.roles
    }));
  });

  const adminEmails = NILAVARAM_INITIAL_ADMIN_EMAILS.map(normalizeEmail_);
  adminEmails.forEach(function(adminEmail, index) {
    firestoreSetDocument_('users', adminEmail, toFirestoreFields_({
      email: adminEmail,
      displayName: index === 0 ? 'Primary Admin' : 'Admin',
      role: 'admin',
      allowedModules: [],
      status: 'active',
      invitedBy: NILAVARAM_PRIMARY_ADMIN_EMAIL,
      invitedAt: new Date(),
      updatedAt: new Date()
    }));
  });

  writeAudit_('initial-setup', NILAVARAM_PRIMARY_ADMIN_EMAIL, {
    role: 'admin',
    admins: adminEmails,
    menusCreated: menus.length,
    menuItemsCreated: menuItems.length
  });

  return {
    success: true,
    message: 'Nilavaram setup completed.',
    admins: adminEmails,
    menus: menus.length,
    menuItems: menuItems.length
  };
}
