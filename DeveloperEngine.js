/**
 * DeveloperEngine.js
 * Owner-only Firestore shell editor. Never exposed in user HTML.
 */

const DEVELOPER_SHELL_COLLECTIONS = {
    clients: true,
    menus: true,
    menuItems: true,
    entities: 'business-only'
  };
  
  function developerAssertShellCollection_(collectionName) {
    const name = String(collectionName || '').trim();
    if (!DEVELOPER_SHELL_COLLECTIONS[name]) {
      throw new Error('That collection is not editable from the developer console.');
    }
    return name;
  }
  
  function developerListCollection(collectionName) {
    requirePrimaryDeveloper_();
    const collection = developerAssertShellCollection_(collectionName);
    const docs = firestoreGetCollection_(collection).map(fromFirestoreDocument_);
    if (collection === 'entities') {
      return docs.filter(function(item) {
        return item.entityType === 'business';
      });
    }
    return docs;
  }
  
  function developerGetRecord(collectionName, documentId) {
    requirePrimaryDeveloper_();
    const collection = developerAssertShellCollection_(collectionName);
    const record = fromFirestoreDocument_(
      firestoreGetDocument_(collection, String(documentId || '').trim())
    );
    if (collection === 'entities' && record.entityType !== 'business') {
      throw new Error('Only business entities may be edited here.');
    }
    return record;
  }
  
  function developerSaveRecord(collectionName, documentId, fields) {
    requirePrimaryDeveloper_();
    const collection = developerAssertShellCollection_(collectionName);
    const id = String(documentId || '').trim();
    if (!id) {
      throw new Error('Document ID is required.');
    }
    const payload = Object.assign({}, fields || {});
    payload.updatedAt = new Date();
    if (collection === 'entities') {
      payload.entityType = 'business';
    }
    if (collection === 'clients' && payload.status == null) {
      payload.status = 'active';
    }
    firestoreSetDocument_(collection, id, toFirestoreFields_(payload));
    writeAudit_('developer-save', NILAVARAM_PRIMARY_ADMIN_EMAIL, {
      collection: collection,
      id: id
    });
    return { success: true, message: 'Saved ' + collection + '/' + id + '.' };
  }
  
  function developerDeleteRecord(collectionName, documentId) {
    requirePrimaryDeveloper_();
    const collection = developerAssertShellCollection_(collectionName);
    const id = String(documentId || '').trim();
    if (!id) {
      throw new Error('Document ID is required.');
    }
    if (collection === 'entities') {
      const record = developerGetRecord(collection, id);
      if (record.entityType !== 'business') {
        throw new Error('Only business entities may be deleted here.');
      }
    }
    firestoreDeleteDocument_(collection, id);
    writeAudit_('developer-delete', NILAVARAM_PRIMARY_ADMIN_EMAIL, {
      collection: collection,
      id: id
    });
    return { success: true, message: 'Deleted ' + collection + '/' + id + '.' };
  }
  
  function developerGetOverview() {
    requirePrimaryDeveloper_();
    return {
      owner: NILAVARAM_PRIMARY_ADMIN_EMAIL,
      superAdmins: NILAVARAM_SUPER_ADMIN_EMAILS,
      collections: Object.keys(DEVELOPER_SHELL_COLLECTIONS),
      clients: developerListCollection('clients'),
      businesses: developerListCollection('entities'),
      menus: developerListCollection('menus').length,
      menuItems: developerListCollection('menuItems').length
    };
  }