/**
 * EnsureSuperAdmins.js
 * Run once in Apps Script to write Nilavaram super-admin users to Firestore.
 *
 * How to run:
 * 1. clasp push
 * 2. Apps Script Editor → select ensureSuperAdminUsersInFirestore
 * 3. Run → authorize if prompted
 * 4. Check Execution log + Firestore users collection
 */

const ENSURE_SUPER_ADMIN_PROFILES = [
    {
      email: 'mangai8100@gmail.com',
      displayName: 'Owner Super Admin'
    },
    {
      email: 'mvenkat.jmj@gmail.com',
      displayName: 'Super Admin — MV'
    },
    {
      email: 'thesolarcpa@gmail.com',
      displayName: 'Super Admin — CPA'
    },
    {
      email: 'vm8100@gmail.com',
      displayName: 'Super Admin — VM'
    },
    {
      email: 'waleed.fahid.acctg@gmail.com',
      displayName: 'Super Admin — Waleed'
    }
  ];
  
  /**
   * Writes all configured super-admin users to Firestore.
   *
   * @returns {Object}
   */
  function ensureSuperAdminUsersInFirestore() {
    const results = [];
  
    ENSURE_SUPER_ADMIN_PROFILES.forEach(function(profile) {
      const email = String(profile.email || '').trim().toLowerCase();
      if (!email) return;
  
      let existing = null;
      try {
        existing = fromFirestoreDocument_(
          firestoreGetDocument_('users', email)
        );
      } catch (error) {
        if (String(error.message).indexOf('HTTP status: 404') === -1) {
          throw error;
        }
      }
  
      const record = {
        email: email,
        displayName: profile.displayName || 'Super Admin',
        role: 'superadmin',
        allowedModules: [],
        allowedClientIds: [],
        allowedEntityIds: [],
        status: 'active',
        invitedBy: 'mangai8100@gmail.com',
        invitedAt: existing && existing.invitedAt ? existing.invitedAt : new Date(),
        acceptedAt: existing && existing.acceptedAt ? existing.acceptedAt : new Date(),
        updatedAt: new Date()
      };
  
      firestoreSetDocument_('users', email, toFirestoreFields_(record));
      results.push({
        email: email,
        displayName: record.displayName,
        status: record.status
      });
    });
  
    return {
      success: true,
      message: 'Super-admin users written to Firestore.',
      count: results.length,
      users: results
    };
  }