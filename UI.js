/**
 * ==========================================================
 * File : UI.js
 * Project : Nilavaram
 * Purpose :
 *     Dashboard support functions.
 *     Returns startup information and placeholder messages.
 * ==========================================================
 */

/**
 * Dashboard startup information.
 */
function getDashboardInfo() {
  const email = getCurrentEmail_();
  let currentUser = getUserByEmail_(email);

  /*
   * First-run bootstrap:
   * If one of the two explicitly approved initial Admins opens Nilavaram
   * before setup has been run, create the initial Firestore records
   * automatically and then read the newly created Admin record.
   */
  if (
    !currentUser &&
    NILAVARAM_INITIAL_ADMIN_EMAILS
      .map(normalizeEmail_)
      .indexOf(email) !== -1
  ) {
    setupNilavaram();
    currentUser = getUserByEmail_(email);
  }

  return {

    applicationName: "Nilavaram",

    version: "1.0",

    project: "nn",

    user: email,

    role: currentUser ? currentUser.role : 'none',

    accessStatus: currentUser ? currentUser.status : 'not-invited',

    dateTime: new Date().toLocaleString(),

    status: currentUser && currentUser.status === 'active'
      ? "Ready"
      : "Access not active"

  };

}


/**
 * Temporary response until the module is implemented.
 */
function openModule(moduleId) {
  requireCurrentUser_();

  return {

    success: true,

    message: moduleId + " module is under development."

  };

}


/**
 * Test Firestore
 */
function testFirestore() {

  try {
    requireAdmin_();

    const result = firestoreGetDocument_(

      "system",

      "connection-test"

    );

    return {

      success: true,

      message: "Firestore Connected",

      data: result

    };

  }

  catch(err){

    return {

      success:false,

      message:err.message

    };

  }

}
