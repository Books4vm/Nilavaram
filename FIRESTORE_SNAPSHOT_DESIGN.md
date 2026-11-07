# Firestore Snapshot Utility Design
**Status:** Ready for Review (NOT EXECUTED)  
**Date:** 2026-11-07  
**Purpose:** Export complete menus and menuItems collections for comparison and reconciliation  

---

## 1. Utility Function Specification

### Function Name
`exportFirestoreSnapshot_()`

### Location
Insert into `Navigation.js` after existing `getNavigationForShell()` function (approx line 240)

### Execution Method
1. Open `/dev` deployment in browser
2. Open browser Developer Tools (F12)
3. Paste function call: `exportFirestoreSnapshot_()`
4. Monitor console output for completion message
5. Snapshot file location printed in console

### Constraints
- **Read-only:** No Firestore writes
- **Auth:** Uses existing Firestore credential from ModuleWindow context
- **Isolation:** /dev and production share same Firestore database (limitation noted)
- **Scope:** Export menus and menuItems collections only
- **No Secrets:** Does not log auth tokens, credentials, or sensitive fields

---

## 2. Complete Function Code

```javascript
function exportFirestoreSnapshot_() {
  const FIRESTORE_PROJECT_ID = PropertiesService.getUserProperties().getProperty('FIRESTORE_PROJECT_ID');
  if (!FIRESTORE_PROJECT_ID) {
    Logger.log('ERROR: FIRESTORE_PROJECT_ID not found in user properties');
    return;
  }

  const FIRESTORE_DB = 'default'; // Firestore uses '(default)' database
  const firebaseToken = ScriptApp.getOAuthToken();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const snapshotData = {
    timestamp: new Date().toISOString(),
    firestoreProjectId: FIRESTORE_PROJECT_ID,
    collections: {}
  };

  const collections = ['menus', 'menuItems'];
  const pageSize = 100; // Firestore REST API default max per page

  try {
    for (const collectionName of collections) {
      Logger.log(`\nExporting collection: ${collectionName}`);
      
      const collectionDocs = [];
      let pageToken = null;
      let pageNum = 0;
      let totalDocs = 0;

      // Pagination loop
      do {
        pageNum++;
        Logger.log(`  Fetching page ${pageNum}...`);

        const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DB}/documents/${collectionName}?pageSize=${pageSize}${pageToken ? '&pageToken=' + pageToken : ''}`;

        const options = {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + firebaseToken,
            'Content-Type': 'application/json'
          },
          muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(url, options);
        const responseCode = response.getResponseCode();

        if (responseCode !== 200) {
          Logger.log(`  ERROR: HTTP ${responseCode} from Firestore REST API`);
          Logger.log(`  Response: ${response.getContentText()}`);
          break;
        }

        const data = JSON.parse(response.getContentText());
        
        if (data.documents && Array.isArray(data.documents)) {
          const docCount = data.documents.length;
          collectionDocs.push(...data.documents);
          totalDocs += docCount;
          Logger.log(`  Page ${pageNum}: ${docCount} documents (total so far: ${totalDocs})`);
        } else {
          Logger.log(`  Page ${pageNum}: No documents returned`);
        }

        // Get next page token if it exists
        pageToken = data.nextPageToken || null;

      } while (pageToken);

      snapshotData.collections[collectionName] = {
        documentCount: collectionDocs.length,
        documents: collectionDocs
      };

      Logger.log(`Total ${collectionName}: ${collectionDocs.length} documents\n`);
    }

    // Verify counts
    const menusCount = snapshotData.collections.menus?.documentCount || 0;
    const menuItemsCount = snapshotData.collections.menuItems?.documentCount || 0;

    snapshotData.summary = {
      menus: menusCount,
      menuItems: menuItemsCount,
      total: menusCount + menuItemsCount,
      exported: new Date().toISOString()
    };

    // Write snapshot to user properties (temporary storage)
    const snapshot_json = JSON.stringify(snapshotData, null, 2);
    
    // For production use, would write to Google Drive or Cloud Storage
    // For now, output to browser console for manual save
    Logger.log('\n=== SNAPSHOT SUMMARY ===');
    Logger.log('Menus: ' + menusCount);
    Logger.log('MenuItems: ' + menuItemsCount);
    Logger.log('Total: ' + snapshotData.summary.total);
    Logger.log('Timestamp: ' + snapshotData.summary.exported);
    Logger.log('=======================\n');
    
    Logger.log('Snapshot exported successfully');
    Logger.log('Firestore Project: ' + FIRESTORE_PROJECT_ID);
    Logger.log('Database: ' + FIRESTORE_DB);
    Logger.log('Export timestamp: ' + timestamp);
    Logger.log('\n--- FULL SNAPSHOT JSON (copy from output below) ---\n');
    Logger.log(snapshot_json);

    return snapshotData;

  } catch (error) {
    Logger.log('ERROR during snapshot export: ' + error.toString());
    return null;
  }
}
```

---

## 3. Execution Instructions

### Step 1: Open /dev Deployment
```
https://script.google.com/macros/d/{SCRIPT_ID}/usercallable?workspace=1
```

### Step 2: Open Developer Console
- Press `F12` in browser
- Click **Console** tab

### Step 3: Execute Function
```javascript
exportFirestoreSnapshot_()
```

### Step 4: Monitor Console Output
- Watch for `Exporting collection: menus`
- Watch for `Exporting collection: menuItems`
- Watch for pagination messages
- Watch for HTTP response codes
- Final output shows document counts and full JSON

### Step 5: Verify Completion
Expected output format:
```
Exporting collection: menus
  Fetching page 1...
  Page 1: N documents (total so far: N)
Total menus: N documents

Exporting collection: menuItems
  Fetching page 1...
  Page 1: N documents (total so far: N)
Total menuItems: N documents

=== SNAPSHOT SUMMARY ===
Menus: N
MenuItems: N
Total: N
Timestamp: 2026-11-07T...
=======================

Snapshot exported successfully
Firestore Project: [PROJECT_ID]
Database: (default)
Export timestamp: 2026-11-07_031822

--- FULL SNAPSHOT JSON (copy from output below) ---

{
  "timestamp": "2026-11-07T03:18:22Z",
  "firestoreProjectId": "[PROJECT_ID]",
  "collections": {
    "menus": {
      "documentCount": N,
      "documents": [...]
    },
    "menuItems": {
      "documentCount": N,
      "documents": [...]
    }
  },
  "summary": {
    "menus": N,
    "menuItems": N,
    "total": N,
    "exported": "2026-11-07T03:18:22Z"
  }
}
```

### Step 6: Save Snapshot
1. Copy the full JSON output
2. Save to file: `FIRESTORE_SNAPSHOT_EXPORT_[TIMESTAMP].json`
3. Store in session artifacts directory for comparison

---

## 4. Error Handling & Troubleshooting

### HTTP 401 (Unauthorized)
- Auth token expired
- Solution: Refresh /dev page and retry

### HTTP 403 (Forbidden)
- User lacks read permission to menus/menuItems
- Solution: Check Firestore security rules and user permissions

### HTTP 400 (Bad Request)
- Invalid collection name or token
- Solution: Verify FIRESTORE_PROJECT_ID is set correctly

### Pagination Failure
- pageToken becomes invalid
- Solution: Export will stop at last valid page; count will be incomplete
- Workaround: Run snapshot again to capture full data across multiple attempts

### No Documents Returned
- Collection may be empty or non-existent
- Solution: Verify Firestore setup in Navigation.js

---

## 5. Important Limitations

1. **Shared Firestore Database:** Both /dev and production use the same Firestore project and database. This snapshot exports production data. Do not execute in production or modify data afterward without careful review.

2. **No Automatic Backup:** This utility exports data but does not create a Firestore backup. It is a read-only snapshot for reconciliation purposes.

3. **Manual Storage:** Snapshot JSON must be manually copied from console. Implement Drive/Cloud Storage integration later if automated backup is needed.

4. **Large Collections:** If menus or menuItems exceed 10,000 documents, pagination will take time. Current implementation handles all sizes correctly but may produce large JSON output.

---

## 6. Comparison Workflow (After Snapshot)

1. Export snapshot using `exportFirestoreSnapshot_()`
2. Save JSON to file
3. Parse JSON to count:
   - Total menus documents
   - Total menuItems documents
4. Compare against Setup.js:
   - Count active (enabled: true) items in Setup.js
   - Count parent menu groups
   - Identify missing or extra Firestore documents
5. Report discrepancies
6. Plan correction actions (setupNavigation_() if approved)

---

## 7. No Changes to Existing Code Yet

- **Navigation.js** is NOT MODIFIED (function will be added after approval)
- **ModuleWindow.html** is NOT MODIFIED
- **Setup.js** is NOT MODIFIED
- **Firestore data** is NOT MODIFIED (read-only export only)
- **Application behavior** is NOT AFFECTED

---

## Next Steps

1. ✅ Review this design for completeness and correctness
2. ⏳ Await approval to add function to Navigation.js
3. ⏳ Execute in /dev deployment to capture Firestore state
4. ⏳ Compare snapshot against Setup.js definitions
5. ⏳ Present reconciliation findings for further approval
