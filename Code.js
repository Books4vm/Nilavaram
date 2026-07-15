/**
 * Code.gs
 * Nilavaram startup and Firestore connection tests.
 */

/**
 * Writes a test document to Firestore.
 */
function testFirestoreWrite() {
  const result = firestoreSetDocument_(
    'system',
    'connection-test',
    {
      projectName: {
        stringValue: 'Nilavaram'
      },
      appsScriptProject: {
        stringValue: 'nn'
      },
      connected: {
        booleanValue: true
      },
      administratorEmail: {
        stringValue:
          Session.getEffectiveUser().getEmail() || 'Not available'
      },
      connectedAt: {
        timestampValue: new Date().toISOString()
      }
    }
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Reads the test document back from Firestore.
 */
function testFirestoreRead() {
  const result = firestoreGetDocument_(
    'system',
    'connection-test'
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}
