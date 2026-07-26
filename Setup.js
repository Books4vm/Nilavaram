/**
 * Setup.js
 * One-time, repeatable creation of Nilavaram's initial Firestore records.
 */

const NILAVARAM_PRIMARY_ADMIN_EMAIL = 'mangai8100@gmail.com';
const NILAVARAM_INITIAL_ADMIN_EMAILS = [
  'mangai8100@gmail.com',
  'vm8100@gmail.com'
];
const NILAVARAM_NAVIGATION_VERSION = 9;

/**
 * Creates or refreshes the Firestore-driven navigation.
 *
 * @returns {Object}
 */
function setupNavigation_() {
  const menus = [
    { id: 'dashboard', label: 'Dashboard', description: 'Provides an overview of the selected business, pending work and recent activity.', order: 10, type: 'link', moduleId: 'dashboard', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'personal-life', label: 'Personal & Life', description: 'Organizes personal history, identity, education, work, business milestones and renewals.', order: 20, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'businesses', label: 'Businesses', description: 'Manages the businesses maintained in Nilavaram.', order: 30, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'assets-estate', label: 'Assets & Estate', description: 'Organizes properties, accounts, trusts, ownership and estate documents.', order: 40, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'security', label: 'Security', description: 'Controls users, roles, permissions and access monitoring.', order: 50, type: 'group', roles: ['admin'] },
    { id: 'transactions', label: 'Transactions', description: 'Handles transaction entry, review, categorization and posting.', order: 60, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'accounting', label: 'Accounting', description: 'Contains bookkeeping, reconciliation and period-closing functions.', order: 70, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'contacts', label: 'Customers & Vendors', description: 'Manages buyers, suppliers, receivables and payables.', order: 80, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'private-journal', label: 'Private Journal', description: 'Keeps private decisions, strategy reviews and follow-up dates.', order: 90, type: 'group', roles: ['admin'] },
    { id: 'documents', label: 'Documents & Archive', description: 'Preserves available, missing, expiring and archived documents.', order: 100, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'tasks', label: 'Tasks', description: 'Collects alerts, reminders and follow-ups requiring attention.', order: 110, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'reports', label: 'Reports', description: 'Produces financial statements and supporting schedules.', order: 120, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'system', label: 'System', description: 'Contains technical configuration and application-management functions.', order: 130, type: 'group', roles: ['admin'] },
    { id: 'help', label: 'Help', description: 'Provides guidance for using Nilavaram and understanding its workflow.', order: 140, type: 'group', roles: ['admin', 'editor', 'reader', 'ltd'] }
  ];

  const menuItems = [
    { id: 'life-timeline', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Life Timeline', description: 'Records life events and links available or missing documents.', moduleId: 'life-timeline', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'identity-immigration', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Identity & Immigration', description: 'Organizes identity, citizenship and immigration records.', moduleId: 'identity-immigration', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'education', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Education', description: 'Records education history and supporting documents.', moduleId: 'education', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'employment', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Employment', description: 'Records employment history and supporting documents.', moduleId: 'employment', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'business-milestones', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Business Milestones', description: 'Links important business events to business records.', moduleId: 'business-milestones', order: 50, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'renewals', menuId: 'personal-life', parentId: 'personal-life', level: 2, label: 'Renewals', description: 'Tracks documents and registrations requiring renewal.', moduleId: 'renewals', order: 60, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'all-businesses', menuId: 'businesses', parentId: 'businesses', level: 2, label: 'All Businesses', description: 'Lists active and inactive businesses and opens business-management actions.', moduleId: 'all-businesses', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'properties', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Properties', description: 'Records real estate and other significant property.', moduleId: 'properties', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'financial-accounts', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Financial Accounts', description: 'Records bank, investment, insurance and retirement accounts.', moduleId: 'financial-accounts', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'trusts-entities', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Trusts & Entities', description: 'Records trusts, entities, trustees and beneficiaries.', moduleId: 'trusts-entities', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'trust-owned-assets', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Trust-Owned Assets', description: 'Links assets to the ownership stated in trust and title documents.', moduleId: 'trust-owned-assets', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'estate-documents', menuId: 'assets-estate', parentId: 'assets-estate', level: 2, label: 'Estate Documents', description: 'Organizes estate-planning documents and instructions.', moduleId: 'estate-documents', order: 50, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'journal-decisions', menuId: 'private-journal', parentId: 'private-journal', level: 2, label: 'Decisions', description: 'Records private decisions with reasons and version history.', moduleId: 'journal-decisions', order: 10, enabled: true, roles: ['admin'] },
    { id: 'strategy-reviews', menuId: 'private-journal', parentId: 'private-journal', level: 2, label: 'Strategy Reviews', description: 'Reviews and updates private strategies over time.', moduleId: 'strategy-reviews', order: 20, enabled: true, roles: ['admin'] },
    { id: 'journal-follow-ups', menuId: 'private-journal', parentId: 'private-journal', level: 2, label: 'Follow-up Dates', description: 'Tracks dates for reconsidering private decisions.', moduleId: 'journal-follow-ups', order: 30, enabled: true, roles: ['admin'] },
    { id: 'archive-library', menuId: 'documents', parentId: 'documents', level: 2, label: 'Archive Library', description: 'Lists preserved documents and their metadata.', moduleId: 'archive-library', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'upload-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Upload Documents', description: 'Adds documents to approved cloud storage.', moduleId: 'upload-documents', order: 20, enabled: true, roles: ['admin', 'editor'] },
    { id: 'missing-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Missing / To Retrieve', description: 'Records expected documents that have not yet been located.', moduleId: 'missing-documents', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'expiring-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Expiring Documents', description: 'Lists documents approaching expiration or renewal.', moduleId: 'expiring-documents', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'unlinked-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Unlinked Documents', description: 'Shows documents not yet linked to a person, business, asset or trust.', moduleId: 'unlinked-documents', order: 50, enabled: true, roles: ['admin', 'editor'] },
    { id: 'archived-documents', menuId: 'documents', parentId: 'documents', level: 2, label: 'Archived Documents', description: 'Retains inactive records for history and audit.', moduleId: 'archived-documents', order: 60, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'backup-status', menuId: 'documents', parentId: 'documents', level: 2, label: 'Backup Status', description: 'Shows planned and completed backup protections.', moduleId: 'backup-status', order: 70, enabled: true, roles: ['admin'] },
    { id: 'navigation-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Navigation Guide', description: 'Explains the menus available to the signed-in user.', moduleId: 'navigation-guide', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'project-foundation', menuId: 'help', parentId: 'help', level: 2, label: 'Project Foundation', description: 'Explains Nilavaram’s core purpose, privacy and archive principles.', moduleId: '', type: 'group', order: 15, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'project-start', menuId: 'help', parentId: 'project-foundation', level: 3, label: 'Project Start', description: 'Records the agreed core purpose of Nilavaram.', moduleId: 'project-start', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'getting-started', menuId: 'help', parentId: 'help', level: 2, label: 'Getting Started', description: 'Introduces first login, business selection and dashboard basics.', moduleId: 'getting-started', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'users-access-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Users & Access', description: 'Explains invitations, roles and permissions.', moduleId: 'users-access-guide', order: 30, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'accounting-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Accounting Guide', description: 'Explains Nilavaram accounting concepts and workflow.', moduleId: 'accounting-guide', order: 40, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'documents-imports-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Documents and Imports', description: 'Explains document storage and transaction imports.', moduleId: 'documents-imports-guide', order: 50, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'security-sessions-guide', menuId: 'help', parentId: 'help', level: 2, label: 'Security & Sessions', description: 'Explains sign-in, access and session security.', moduleId: '', type: 'group', order: 60, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'inactivity-sign-in', menuId: 'help', parentId: 'security-sessions-guide', level: 3, label: 'Inactivity and Sign-in', description: 'Explains the planned inactivity warning and secure sign-in requirement.', moduleId: 'inactivity-sign-in', order: 10, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'project-architecture', menuId: 'help', parentId: 'help', level: 2, label: 'Project Architecture', description: 'Explains where Nilavaram stores data, documents and source code.', moduleId: 'project-architecture', order: 70, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'faq', menuId: 'help', parentId: 'help', level: 2, label: 'Frequently Asked Questions', description: 'Collects common questions and answers.', moduleId: 'faq', order: 80, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'about-version-history', menuId: 'help', parentId: 'help', level: 2, label: 'About and Version History', description: 'Records important Nilavaram releases and changes.', moduleId: 'about-version-history', order: 90, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'alerts', menuId: 'tasks', parentId: 'tasks', level: 2, label: 'Alerts', description: 'Shows unread and reviewed administrative notifications.', moduleId: 'alerts', order: 10, enabled: true, roles: ['admin'] },
    { id: 'reminders', menuId: 'tasks', parentId: 'tasks', level: 2, label: 'Reminders', description: 'Shows private and shared reminders with planned notification schedules.', moduleId: 'reminders', order: 20, enabled: true, roles: ['admin', 'editor', 'reader', 'ltd'] },
    { id: 'configuration', menuId: 'system', label: 'Configuration', description: 'Maintains Nilavaram and business-level settings.', moduleId: 'configuration', order: 10, enabled: true, roles: ['admin'] },
    { id: 'system-status', menuId: 'system', label: 'System Status', description: 'Shows version, deployment and connection health.', moduleId: 'system-status', order: 20, enabled: true, roles: ['admin'] },
    { id: 'firestore', menuId: 'system', label: 'Firestore', description: 'Tests and diagnoses the Firestore connection.', moduleId: 'firestore', order: 30, enabled: true, roles: ['admin'] },
    { id: 'connections', menuId: 'system', label: 'Connections', description: 'Manages future online-service connections without displaying readable passwords.', moduleId: 'connections', order: 40, enabled: true, roles: ['admin'] },
    { id: 'modules', menuId: 'system', label: 'Modules', description: 'Enables or disables major Nilavaram features.', moduleId: 'modules', order: 50, enabled: true, roles: ['admin'] },
    { id: 'menus', menuId: 'system', label: 'Menu Management', description: 'Renames, reorders, enables or hides Firestore menu records.', moduleId: 'menus', order: 60, enabled: true, roles: ['admin'] },
    { id: 'project-development', menuId: 'system', parentId: 'system', level: 2, label: 'Project Development', description: 'Shows planned Nilavaram development work and assignments.', moduleId: '', type: 'group', order: 70, enabled: true, roles: ['admin'] },
    { id: 'pending-features', menuId: 'system', parentId: 'project-development', level: 3, label: 'Pending Features', description: 'Lists approved features that have not yet been completed.', moduleId: 'pending-features', order: 10, enabled: true, roles: ['admin'] },
    { id: 'admin-technical-guide', menuId: 'system', parentId: 'project-development', level: 3, label: 'Admin Technical Guide', description: 'Explains the development flow, commands and safe credential locations.', moduleId: 'admin-technical-guide', order: 20, enabled: true, roles: ['admin'] },
    { id: 'users', menuId: 'security', label: 'Users', description: 'Invites users and manages their roles and access.', moduleId: 'users', order: 10, enabled: true, roles: ['admin'] },
    { id: 'roles', menuId: 'security', label: 'Roles', description: 'Defines the available user roles.', moduleId: 'roles', order: 20, enabled: true, roles: ['admin'] },
    { id: 'permissions', menuId: 'security', label: 'Permissions', description: 'Defines what each role may see or change.', moduleId: 'permissions', order: 30, enabled: true, roles: ['admin'] },
    { id: 'sessions', menuId: 'security', label: 'Login Sessions', description: 'Shows available user-session information.', moduleId: 'sessions', order: 40, enabled: true, roles: ['admin'] },
    { id: 'access-review', menuId: 'security', label: 'Access Review', description: 'Supports periodic reviews of user access.', moduleId: 'access-review', order: 50, enabled: true, roles: ['admin'] },
    { id: 'audit-log', menuId: 'security', label: 'Audit Log', description: 'Records invitations, role changes and important actions.', moduleId: 'audit-log', order: 60, enabled: true, roles: ['admin'] }
  ];

  menus.forEach(function(menu) {
    firestoreSetDocument_('menus', menu.id, toFirestoreFields_({
      label: menu.label,
      description: menu.description,
      order: menu.order,
      enabled: true,
      type: menu.type,
      moduleId: menu.moduleId || '',
      roles: menu.roles
    }));
  });

  ['registry', 'administration'].forEach(function(menuId) {
    firestoreSetDocument_('menus', menuId, toFirestoreFields_({
      label: menuId === 'registry' ? 'Registry' : 'Administration',
      order: 999,
      enabled: false,
      type: 'group',
      moduleId: '',
      roles: ['admin']
    }));
  });

  menuItems.forEach(function(item) {
    firestoreSetDocument_('menuItems', item.id, toFirestoreFields_({
      menuId: item.menuId,
      parentId: item.parentId || item.menuId,
      level: item.level || 2,
      label: item.label,
      description: item.description,
      moduleId: item.moduleId || '',
      type: item.type || 'link',
      order: item.order,
      enabled: item.enabled,
      roles: item.roles
    }));
  });

  firestoreSetDocument_('system', 'navigation-config', toFirestoreFields_({
    version: NILAVARAM_NAVIGATION_VERSION,
    updatedAt: new Date()
  }));

  setupProjectIntentTasks_();
  setupInitialReminders_();

  return {
    menus: menus.length,
    menuItems: menuItems.length,
    navigationVersion: NILAVARAM_NAVIGATION_VERSION
  };
}

/**
 * Creates or refreshes the initial menus, menu items and Admins.
 *
 * @returns {Object}
 */
function setupNilavaram() {
  const navigation = setupNavigation_();
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
    menusCreated: navigation.menus,
    menuItemsCreated: navigation.menuItems
  });

  return {
    success: true,
    message: 'Nilavaram setup completed.',
    admins: adminEmails,
    menus: navigation.menus,
    menuItems: navigation.menuItems
  };
}
