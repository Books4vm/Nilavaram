# Business Records Pilot Implementation Design
## Full End-to-End Module Development with Firestore Integration & OneDrive Support

**Status:** DESIGN PHASE - Awaiting approval before implementation  
**Module:** business-records (ModuleId)  
**HTML Source:** BusinessRecords.html  
**Target Completion:** Development in /dev only (no production changes)  
**Objective:** Demonstrate complete Nilavaram development pattern for future modules

---

## SECTION 1: PILOT SCOPE & OBJECTIVES

### What This Pilot Will Deliver

✓ **Dynamic Data Loading**
- Load business entity records from Firestore collection `business_records`
- Display in real-time with client/entity context filtering
- Support pagination for large datasets

✓ **User Interface**
- Read view: Table display of all business records with sortable columns
- Edit view: Form for creating/updating business information
- Inline validation with user-friendly error messages
- Role-based visibility (read-only vs edit access)

✓ **Data Persistence**
- Create new business records via validated form
- Update existing records with change tracking
- Delete records with confirmation workflow (soft-delete, not hard-delete)
- Atomic operations with transaction safety

✓ **Authorization & Audit**
- Role-based access control (read-only for 'reader' role, edit for 'editor'/'admin')
- Every create/update/delete logged to audit_log collection
- User identification and timestamp on all changes
- Original value preservation for audit trail

✓ **Error Handling**
- Network failure recovery with user notification
- Validation errors with field-level hints
- Concurrent edit detection (optimistic locking)
- Graceful degradation if Firestore unavailable

✓ **OneDrive Integration**
- Optional document attachment references (no auth changes)
- Document URL storage in Firestore without authentication secrets
- Display linked documents in business record detail view
- Test without OneDrive credentials (mock references)

✓ **Testing in /dev**
- Isolated Firestore test collection `business_records_dev`
- No impact to production data
- Comprehensive test cases included
- Rollback plan documented

---

## SECTION 2: DATA MODEL & FIRESTORE SCHEMA

### Current HTML File
**Location:** [BusinessRecords.html](C:/Users/theso/Documents/nn/Nilavaram/BusinessRecords.html)

### Module Registration (Required Placeholder - Already Present)
```javascript
NILAVARAM_SOURCE_GUIDES['business-records'] = {
  sourceReady: false,  // Will be true when guidance is reviewed
  purpose: 'Maintain information about business entities and their key facts',
  source: 'Firestore collection: business_records',
  display: 'Table with detail views, forms for create/edit/delete',
  steps: [
    '1. Load business records from Firestore',
    '2. Display in organized table format',
    '3. Click any row to view full details',
    '4. Create new record using form',
    '5. Edit or delete existing records'
  ],
  learn: [
    'Each business has multiple business records (subsidiaries, branches, legal entities, etc)',
    'Business records link to financial accounts and reporting hierarchy',
    'OneDrive documents can be attached to each record'
  ],
  dos: [
    'Keep business names and identifiers accurate',
    'Use consistent naming across related entities',
    'Attach supporting legal documents to records',
    'Audit trail shows all changes and deletions'
  ],
  donts: [
    'Do not delete active business entities without archiving',
    'Do not modify business IDs after creation',
    'Do not enter sensitive financial passwords'
  ],
  status: 'Development: Firestore integration phase'
};
```

### Firestore Collection: `business_records`

**Primary Collection Schema:**
```
Collection: business_records
├─ Document ID: {businessId}-{recordNumber} (e.g., "vav-group-001")
│
├─ REQUIRED FIELDS:
│  ├─ id (string): Unique identifier {businessId}-{recordNumber}
│  ├─ businessId (string): Parent business entity ID (e.g., "vav-group")
│  ├─ entityId (string): Specific entity within business (e.g., "*" for all, or specific entityId)
│  ├─ name (string): Legal business name or entity name
│  ├─ businessType (string): enum["corporation", "llc", "sole-proprietor", "partnership", "nonprofit", "other"]
│  ├─ description (string): Business purpose and key information
│  ├─ status (string): enum["active", "archived", "inactive", "dissolved"]
│  ├─ createdAt (timestamp): Document creation time
│  ├─ updatedAt (timestamp): Last modification time
│  ├─ createdBy (string): User ID of creator
│  ├─ updatedBy (string): User ID of last editor
│
├─ OPTIONAL FIELDS:
│  ├─ registrationNumber (string): Business registration/license number
│  ├─ registrationDate (string): Date of official registration (YYYY-MM-DD)
│  ├─ jurisdiction (string): State/country of registration
│  ├─ website (string): Business website URL
│  ├─ phone (string): Business contact phone
│  ├─ email (string): Business contact email
│  ├─ addresses (object): { legal: "", mailing: "", office: "" }
│  ├─ parentEntity (string): Link to parent business if subsidiary
│  ├─ subsidiaries (array): Links to child entities
│  ├─ documents (array): OneDrive references
│  │  └─ { name: "", url: "", type: "registration|tax|license|other", uploadedAt: timestamp }
│  ├─ tags (array): Custom categorization ["public", "private", "holding", ...]
│  ├─ notes (string): Internal notes
│
├─ ACCESS CONTROL:
│  ├─ clientIds (array): Clients with access (e.g., ["vav-group"])
│  ├─ entityIds (array): Specific entities with access (e.g., ["*"] or ["entity-1", "entity-2"])
│  ├─ readRoles (array): Roles allowed to read (default: ["admin", "editor", "reader"])
│  ├─ writeRoles (array): Roles allowed to write (default: ["admin", "editor"])
│  ├─ deleteRoles (array): Roles allowed to delete (default: ["admin"])
│
└─ SCHEMA VERSION:
   └─ schemaVersion (number): 1 (for future migrations)
```

### Firestore Collection: `audit_log` (For Recording Changes)

**Audit Entry Structure:**
```
Collection: audit_log
├─ Document ID: auto-generated
│
└─ AUDIT FIELDS:
   ├─ timestamp (timestamp): When the change occurred
   ├─ userId (string): User who made the change
   ├─ action (string): "create" | "update" | "delete" | "archive"
   ├─ collection (string): "business_records"
   ├─ documentId (string): ID of changed document
   ├─ businessId (string): Parent business (for filtering)
   ├─ entityId (string): Affected entity
   ├─ changes (object): Only populated for "update" actions
   │  └─ { fieldName: { before: oldValue, after: newValue }, ... }
   ├─ reason (string): Optional explanation (provided by user)
   ├─ status (string): "success" | "failed"
   └─ errorMessage (string): If status="failed"
```

### Firestore Collection: `business_records_dev` (For Testing)

**Purpose:** Isolated test collection for /dev deployment  
**Lifecycle:**
- Created fresh for each dev session
- Populated with sample test data
- Deleted at end of testing (or kept for regression testing)
- Uses exact same schema as production `business_records`

---

## SECTION 3: BACKEND FUNCTIONS (APPS SCRIPT)

**File:** [Navigation.js](C:/Users/theso/Documents/nn/Nilavaram/Navigation.js) (add functions)

### Function 1: getBusinessRecords()

```javascript
/**
 * Load all business records for the current client and entity context
 * Called by BusinessRecords.html when module opens
 *
 * @param {string} clientId - Current client context
 * @param {string} entityId - Current entity context (or "*" for all)
 * @returns {object} {success: boolean, records: array, error: string}
 */
function getBusinessRecords(clientId, entityId) {
  try {
    const firestoreDb = FirestoreApp.getFirestore(clientId);
    
    // Query business_records collection (or _dev for testing)
    const collection = isDevMode() ? 'business_records_dev' : 'business_records';
    let query = firestoreDb.collection(collection)
      .where('clientIds', 'array-contains', clientId);
    
    // Apply entity filter
    if (entityId !== '*') {
      query = query.where('entityIds', 'array-contains', entityId);
    }
    
    // Execute query
    const snapshot = query.get();
    
    if (!snapshot.documents || snapshot.documents.length === 0) {
      return {
        success: true,
        records: [],
        message: 'No business records found for this context'
      };
    }
    
    // Transform to array
    const records = snapshot.documents.map(doc => ({
      id: doc.name.split('/').pop(),  // Extract ID from Firestore path
      ...doc.obj
    }));
    
    // Sort by updatedAt descending (most recent first)
    records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    
    return {
      success: true,
      records: records,
      count: records.length
    };
  } catch (error) {
    Logger.log('ERROR in getBusinessRecords: ' + error.message);
    return {
      success: false,
      error: error.message,
      records: []
    };
  }
}
```

### Function 2: saveBusinessRecord()

```javascript
/**
 * Create or update a business record
 *
 * @param {string} clientId - Current client
 * @param {string} entityId - Current entity
 * @param {object} recordData - Complete business record object
 * @returns {object} {success: boolean, id: string, error: string}
 */
function saveBusinessRecord(clientId, entityId, recordData) {
  try {
    const firestoreDb = FirestoreApp.getFirestore(clientId);
    const collection = isDevMode() ? 'business_records_dev' : 'business_records';
    const userId = Session.getActiveUser().getEmail();
    const now = Utilities.formatDate(new Date(), Session.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    
    // Validate required fields
    const required = ['name', 'businessType', 'status'];
    for (let field of required) {
      if (!recordData[field]) {
        throw new Error('Required field missing: ' + field);
      }
    }
    
    // Set audit fields
    const document = {
      ...recordData,
      clientIds: recordData.clientIds || [clientId],
      entityIds: recordData.entityIds || [entityId],
      readRoles: recordData.readRoles || ['admin', 'editor', 'reader'],
      writeRoles: recordData.writeRoles || ['admin', 'editor'],
      deleteRoles: recordData.deleteRoles || ['admin'],
      schemaVersion: 1,
      updatedAt: now,
      updatedBy: userId
    };
    
    // If creating new (no ID), set createdAt
    if (!recordData.id) {
      document.createdAt = now;
      document.createdBy = userId;
      document.id = generateBusinessRecordId(clientId);
    }
    
    // Save to Firestore
    firestoreDb.collection(collection).document(document.id).set(document);
    
    // Log to audit trail
    logAudit(clientId, entityId, 'business_records', 
      recordData.id ? 'update' : 'create', 
      document.id, recordData.id ? recordData : null, document, userId);
    
    return {
      success: true,
      id: document.id,
      message: recordData.id ? 'Record updated' : 'Record created'
    };
  } catch (error) {
    Logger.log('ERROR in saveBusinessRecord: ' + error.message);
    
    // Log failure to audit
    logAudit(clientId, entityId, 'business_records',
      recordData.id ? 'update' : 'create',
      recordData.id || 'NEW', null, null, 
      Session.getActiveUser().getEmail(), error.message);
    
    return {
      success: false,
      error: error.message,
      id: recordData.id || null
    };
  }
}
```

### Function 3: deleteBusinessRecord()

```javascript
/**
 * Soft-delete a business record (mark as archived, don't hard-delete)
 *
 * @param {string} clientId - Current client
 * @param {string} entityId - Current entity
 * @param {string} recordId - ID of record to delete
 * @param {string} reason - Reason for deletion (audit trail)
 * @returns {object} {success: boolean, error: string}
 */
function deleteBusinessRecord(clientId, entityId, recordId, reason) {
  try {
    const firestoreDb = FirestoreApp.getFirestore(clientId);
    const collection = isDevMode() ? 'business_records_dev' : 'business_records';
    const userId = Session.getActiveUser().getEmail();
    const now = Utilities.formatDate(new Date(), Session.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    
    // Retrieve current record for audit trail
    const docRef = firestoreDb.collection(collection).document(recordId);
    const currentDoc = docRef.get();
    
    if (!currentDoc.exists) {
      throw new Error('Record not found: ' + recordId);
    }
    
    const oldData = currentDoc.obj;
    
    // Soft-delete: mark as archived with deletion timestamp
    const updateData = {
      status: 'archived',
      archivedAt: now,
      archivedBy: userId,
      archivedReason: reason || 'No reason provided'
    };
    
    docRef.update(updateData);
    
    // Log to audit trail with full details
    logAudit(clientId, entityId, 'business_records', 'delete', 
      recordId, oldData, updateData, userId);
    
    return {
      success: true,
      message: 'Record archived (soft-deleted, not permanently removed)'
    };
  } catch (error) {
    Logger.log('ERROR in deleteBusinessRecord: ' + error.message);
    
    logAudit(clientId, entityId, 'business_records', 'delete',
      recordId, null, null, Session.getActiveUser().getEmail(), error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Function 4: logAudit()

```javascript
/**
 * Log changes to audit_log collection for compliance tracking
 *
 * @param {string} clientId
 * @param {string} entityId
 * @param {string} collection
 * @param {string} action
 * @param {string} documentId
 * @param {object} oldData
 * @param {object} newData
 * @param {string} userId
 * @param {string} errorMessage (optional)
 */
function logAudit(clientId, entityId, collection, action, documentId, oldData, newData, userId, errorMessage) {
  try {
    const firestoreDb = FirestoreApp.getFirestore(clientId);
    const now = new Date();
    
    // Calculate changes for update actions
    let changes = {};
    if (action === 'update' && oldData && newData) {
      for (let key in newData) {
        if (oldData[key] !== newData[key]) {
          changes[key] = {
            before: oldData[key],
            after: newData[key]
          };
        }
      }
    }
    
    const auditEntry = {
      timestamp: Utilities.formatDate(now, Session.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      userId: userId,
      action: action,
      collection: collection,
      documentId: documentId,
      businessId: clientId,
      entityId: entityId,
      changes: changes,
      status: errorMessage ? 'failed' : 'success',
      errorMessage: errorMessage || null
    };
    
    const auditDb = FirestoreApp.getFirestore(clientId);
    auditDb.collection('audit_log').add(auditEntry);
  } catch (error) {
    // Log audit failures to Apps Script logger only (don't fail the main operation)
    Logger.log('WARNING: Failed to write audit log: ' + error.message);
  }
}
```

### Function 5: checkBusinessRecordAccess()

```javascript
/**
 * Verify user has required access level for business record operation
 *
 * @param {string} userId - User email
 * @param {string} action - "read" | "write" | "delete"
 * @param {object} businessRecord - The record being accessed
 * @param {array} userRoles - User's current roles
 * @returns {boolean} true if access allowed
 */
function checkBusinessRecordAccess(userId, action, businessRecord, userRoles) {
  if (!businessRecord) return false;
  
  const allowedRoles = 
    action === 'read' ? (businessRecord.readRoles || ['admin', 'editor', 'reader']) :
    action === 'write' ? (businessRecord.writeRoles || ['admin', 'editor']) :
    action === 'delete' ? (businessRecord.deleteRoles || ['admin']) :
    [];
  
  // Check if any of user's roles are in allowed roles
  return userRoles.some(role => allowedRoles.includes(role));
}
```

### Function 6: generateBusinessRecordId()

```javascript
/**
 * Generate unique business record ID
 * Format: {clientId}-{type}-{sequence}
 * Example: vav-group-entity-001
 */
function generateBusinessRecordId(clientId) {
  const timestamp = new Date().getTime().toString().slice(-6);  // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return clientId + '-br-' + timestamp + random;
}

function isDevMode() {
  // Check if current deployment is /dev
  const scriptId = ScriptApp.getScriptId();
  const deployments = AppsScript.Deployments.list(scriptId).deployments || [];
  const currentVersion = DriveApp.getFileById(scriptId).getName();
  return currentVersion.includes('dev') || ScriptApp.getOAuthToken().includes('dev');
}
```

---

## SECTION 4: FRONTEND IMPLEMENTATION (HTML/JAVASCRIPT)

**File to Modify:** [BusinessRecords.html](C:/Users/theso/Documents/nn/Nilavaram/BusinessRecords.html)

### Key Frontend Features

**1. Module Registration (Already Present - Keep As Is)**
```javascript
NILAVARAM_SOURCE_GUIDES['business-records'] = { ... }
```

**2. Data Loading & Display**
```javascript
function initializeBusinessRecords() {
  // Called when module opens
  showLoadingSpinner('Loading business records...');
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoadingSpinner();
      if (result.success) {
        displayBusinessRecordsTable(result.records);
      } else {
        showError('Failed to load records: ' + result.error);
      }
    })
    .withFailureHandler(function(error) {
      hideLoadingSpinner();
      showError('Network error: ' + error);
    })
    .getBusinessRecords(window.nilavaramClient, window.nilavaramEntity);
}
```

**3. Table Display with Sorting**
```javascript
function displayBusinessRecordsTable(records) {
  const table = document.getElementById('business-records-table');
  // Render rows with click handlers for detail view
  // Support sort by: name, businessType, status, updatedAt
  // Show onedrive icon if documents attached
}
```

**4. Form for Create/Edit**
```javascript
function openRecordForm(recordId) {
  // If recordId: load existing record and show in edit mode
  // If no recordId: show empty form for creation
  // Fields: name, businessType, description, status, etc.
  // Validate on save using backend validation
}
```

**5. Authorization Check**
```javascript
function canEditRecord(record) {
  // Check user's roles against record.writeRoles
  // Disable edit/delete buttons if user lacks permission
  return window.nilavaramUserRoles.some(role => 
    record.writeRoles.includes(role)
  );
}
```

**6. OneDrive Document References**
```javascript
function attachDocument(recordId, documentUrl) {
  // Store URL reference in Firestore document.documents array
  // Don't authenticate with OneDrive directly
  // Display as clickable links with document type indicator
}
```

---

## SECTION 5: TESTING PLAN

### Test Environment Setup

**Step 1: Create Test Collection**
```javascript
// In Apps Script console:
function createTestDataForBusinessRecords() {
  const firestoreDb = FirestoreApp.getFirestore('vav-group');
  
  // Create test collection: business_records_dev
  // Add 5 sample records with various statuses
  const sampleRecords = [
    {
      id: 'vav-group-br-001',
      name: 'VAV Group Inc',
      businessType: 'corporation',
      status: 'active',
      description: 'Parent holding company',
      registrationDate: '2020-01-15',
      documents: []
    },
    // ... 4 more samples
  ];
  
  sampleRecords.forEach(record => {
    firestoreDb.collection('business_records_dev').document(record.id).set(record);
  });
}
```

### Test Cases

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| TC-1: Load records for client/entity context | Display 5 sample records in table | [ ] |
| TC-2: Create new business record | New record appears in table with ID | [ ] |
| TC-3: Update existing record | Changes saved and audit logged | [ ] |
| TC-4: Soft-delete record | Record marked as archived, not removed | [ ] |
| TC-5: Filter by status (active/archived) | Table updates to show matching records | [ ] |
| TC-6: Sort by name (ascending/descending) | Records reorder without reloading | [ ] |
| TC-7: Reader role sees read-only form | Edit/delete buttons disabled | [ ] |
| TC-8: Editor role can edit | Edit/delete buttons enabled | [ ] |
| TC-9: Validation error on empty name | Form shows error, doesn't save | [ ] |
| TC-10: Concurrent edit detection | Second user sees "this record was updated" warning | [ ] |
| TC-11: Network failure recovery | Retry button offered, no data loss | [ ] |
| TC-12: Audit log records create | Verify audit_log entry exists for new record | [ ] |
| TC-13: Audit log records update | Verify changes field populated with before/after | [ ] |
| TC-14: Audit log records delete | Verify archive action logged with reason | [ ] |
| TC-15: OneDrive reference stored | Document URL persisted in Firestore | [ ] |
| TC-16: OneDrive reference displayed | Document appears in detail view | [ ] |

### Testing Checklist

- [ ] All test cases pass in /dev deployment
- [ ] Audit log entries created for all operations
- [ ] No business_records production data modified
- [ ] Role-based access control enforced
- [ ] Error messages clear and actionable
- [ ] Performance acceptable for 100+ records
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] No console errors or warnings
- [ ] Data validation consistent between frontend/backend

---

## SECTION 6: AFFECTED FILES & CHANGES

### Files to Create (New)
**None** - Using existing BusinessRecords.html

### Files to Modify

**1. Navigation.js** (Add 6 backend functions)
- **Functions:** getBusinessRecords, saveBusinessRecord, deleteBusinessRecord, logAudit, checkBusinessRecordAccess, generateBusinessRecordId, isDevMode
- **Lines:** Add at end of file (after existing navigation functions)
- **Changes:** ~300 lines of new code
- **Risk:** LOW (new functions, no changes to existing navigation logic)
- **Validation:** Test in Apps Script console before deploy

**2. BusinessRecords.html** (Extend existing structure)
- **Current State:** Has NILAVARAM_SOURCE_GUIDES registration only
- **Changes:**
  - Add HTML form template (create/edit)
  - Add table template (display)
  - Add ~400 lines of JavaScript for data binding, validation, error handling
  - Import any required UI libraries (Bootstrap styling already available)
- **Risk:** LOW (isolated to this module, no cross-module dependencies)
- **Validation:** Test all user interactions, all test cases

**3. ModuleGuideSources.html** (No change needed)
- **Current:** Already includes BusinessRecords
- **Status:** No modification required

**4. Setup.js** (No change needed)
- **Current:** business-records menu item already defined
- **Status:** Architecture frozen, no changes

### Files NOT Modified
- DashboardNavigation.html (NO CHANGE)
- DashboardMenuPicker.html (NO CHANGE)
- Firestore collections definition (NO DIRECT MODIFICATION - created via backend functions)
- Any role/permission definitions (NO CHANGE)

---

## SECTION 7: DEPLOYMENT & ROLLBACK

### Deployment to /dev

**Step 1: Push Code to Apps Script**
```bash
clasp push
```

**Step 2: Verify in Apps Script Editor**
- Check Navigation.js for new functions
- Check BusinessRecords.html for new form/table HTML
- No syntax errors in console

**Step 3: Test in /dev URL**
- Open `/dev` deployment in browser
- Navigate to Dashboard → Business Records
- Run through all 16 test cases

**Step 4: Inspect Firestore**
- Verify business_records_dev collection created
- Verify sample data loaded
- Verify audit_log entries written

### Rollback Plan

**If Major Issue Found:**
```javascript
// In Apps Script console:
function deleteTestCollection() {
  const firestoreDb = FirestoreApp.getFirestore('vav-group');
  const collection = firestoreDb.collection('business_records_dev');
  collection.query().get().documents.forEach(doc => {
    collection.document(doc.name.split('/').pop()).delete();
  });
}
```

**If Code Issue Found:**
```bash
# Revert to previous commit
git checkout HEAD~1 -- Navigation.js BusinessRecords.html
clasp push
```

**Protection Measures:**
- ✓ Test collection (business_records_dev) is separate from production
- ✓ All changes logged to audit_log (restorable)
- ✓ No hard deletes (soft delete only)
- ✓ Firestore rules prevent production writes from /dev

---

## SECTION 8: SUCCESS CRITERIA

### Pilot is SUCCESSFUL if:

✓ All 16 test cases pass  
✓ Audit log entries created for every operation  
✓ Role-based access control enforced (read-only for readers, edit for editors)  
✓ No production data modified (test collection only)  
✓ All error cases handled gracefully  
✓ OneDrive references stored and displayed  
✓ Performance acceptable with 100+ records  
✓ No regression in navigation or other modules  
✓ Code meets Nilavaram style guide and best practices  
✓ Full documentation updated  

### Next Steps After Successful Pilot:

1. **Review & Approval** - Demonstrate pilot to stakeholder
2. **Promote Code Pattern** - Use this design for next 3 modules
3. **Production Deployment** - Run setupNavigation_() to sync menus to production
4. **Develop Additional Modules** - life-timeline, input-receipt, input-payment, etc.
5. **OneDrive Deep Integration** - Add full OneDrive API for document management

---

## SECTION 9: CONSTRAINTS & RISKS

### Constraints (Must Obey)
- ✗ DO NOT modify Setup.js or menu definitions
- ✗ DO NOT change module routing or IDs
- ✗ DO NOT modify Firestore menus/menuItems collections
- ✗ DO NOT hard-delete any records (soft-delete only)
- ✗ DO NOT expose passwords or OAuth tokens in code/Firestore
- ✗ DO NOT deploy to production without explicit approval

### Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Production data accidentally modified | HIGH | Use separate test collection; Firestore rules restrict writes |
| Concurrent edit conflicts | MEDIUM | Implement optimistic locking; detect conflicts in backend |
| Audit log incomplete | MEDIUM | Log failures separately; always log before operation succeeds |
| OneDrive link corruption | LOW | Store URLs only, don't process/validate; user can re-add if broken |
| Performance degradation | MEDIUM | Paginate large datasets; add indexes to Firestore on frequently-queried fields |
| Rollback data loss | HIGH | All operations logged; soft-delete preserves data; version control on code |

---

## SECTION 10: IMPLEMENTATION TIMELINE

| Phase | Deliverable | Duration | Status |
|-------|-------------|----------|--------|
| **Phase 1** | Backend functions (Navigation.js) | 2 hours | Ready to start |
| **Phase 2** | Frontend HTML/JS (BusinessRecords.html) | 3 hours | Ready to start |
| **Phase 3** | Testing (all 16 test cases) | 2 hours | Ready to start |
| **Phase 4** | Documentation & Review | 1 hour | Ready to start |
| **TOTAL** | Pilot Complete & Approved | **8 hours** | Ready |

---

## APPROVAL CHECKPOINT

**This design is ready for implementation when:**

- [ ] User reviews pilot scope and objectives
- [ ] User approves Firestore schema and field names
- [ ] User confirms backend function names and signatures
- [ ] User verifies test cases cover business requirements
- [ ] User approves OneDrive reference implementation approach
- [ ] User explicitly authorizes /dev testing without production impact

**Next Action:** Present this design for approval before beginning code changes.

---

**Design Status:** COMPLETE - AWAITING APPROVAL  
**Ready to Implement:** YES (pending user authorization)  
**No Code Changes Made Yet:** ✓ Confirmed  
**Architecture Frozen:** ✓ Confirmed
