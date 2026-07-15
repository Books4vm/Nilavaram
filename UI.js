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

  return {

    applicationName: "Nilavaram",

    version: "1.0",

    project: "nn",

    user: Session.getActiveUser().getEmail(),

    dateTime: new Date().toLocaleString(),

    status: "Ready"

  };

}


/**
 * Temporary response until the module is implemented.
 */
function openModule(moduleId) {

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