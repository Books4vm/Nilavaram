/**
 * ResetShellDataOnly.js
 * Rebuilds shell collections only. Does not touch accounts/transactions.
 */

function deleteAllDocumentsInCollection_(collectionName) {
    firestoreGetCollection_(collectionName).forEach(function(doc) {
      const id = doc.name.split('/').pop();
      firestoreDeleteDocument_(collectionName, id);
    });
  }
  
  function deleteBusinessEntitiesOnly_() {
    firestoreGetCollection_('entities').forEach(function(doc) {
      const entity = fromFirestoreDocument_(doc);
      if (entity.entityType === 'business') {
        firestoreDeleteDocument_('entities', entity.id);
      }
    });
  }
  
  function resetShellDataOnly() {
    requirePrimaryDeveloper_();
  
    deleteAllDocumentsInCollection_('clients');
    deleteBusinessEntitiesOnly_();
    deleteAllDocumentsInCollection_('menus');
    deleteAllDocumentsInCollection_('menuItems');
  
    ensureSuperAdminUsers_();
    ensureClientRecords_();
    ensureClientBusinessEntities_();
    setupNavigation_();
  
    writeAudit_('shell-data-reset', NILAVARAM_PRIMARY_ADMIN_EMAIL, {
      clients: NILAVARAM_DEFAULT_CLIENTS.length,
      businesses: NILAVARAM_DEFAULT_BUSINESS_ENTITIES.length,
      navigationVersion: NILAVARAM_NAVIGATION_VERSION
    });
  
    return {
      success: true,
      message: 'Shell data reset complete. Clients, businesses and menu rebuilt in Firestore.',
      clients: getClientGroupsForShell_(),
      businesses: getBusinessEntitiesForShell_(NILAVARAM_CLIENT_GROUP),
      navigationCount: getNavigation().moduleCount || 0
    };
  }