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
 * Returns non-secret Admin locations and access links for the live UI.
 */
function buildStorageAccessInfo_() {
  return {
    vscodeFolder: 'C:\\Users\\theso\\Documents\\nn\\Nilavaram',
    githubRepository: 'https://github.com/Books4vm/Nilavaram',
    githubBranch: 'main',
    appsScriptWebApp:
      'https://script.google.com/macros/s/' +
      'AKfycbxMMqgLL6xmJp__dI4vDHj0zZ_6ZyZsb_-' +
      'KsspdNU99WXW1ZJrRzJTaVObTJ8C2s-3Q/exec',
    localOneDrive: 'C:\\Users\\theso\\OneDrive',
    primaryOneDriveAccount: 'vmurugan@hotmail.com',
    externalDrive: 'E:\\',
    externalDriveLabel: 'My Passport',
    externalCodeBackup: 'E:\\nn\\Nilavaram',
    dataRoot: 'E:\\nn\\Nilavaram Data',
    recommendedArchiveFolder: 'E:\\nn\\Nilavaram Data\\99 Archive',
    oneDriveSyncSource: 'E:\\nn\\Nilavaram Data\\04 OneDrive Sync',
    externalDriveFreeGb: 3778.2,
    credentialNotice:
      'Credentials are maintained separately. Passwords, tokens and secrets ' +
      'must not be stored in Nilavaram, Firestore, GitHub or these notes.'
  };
}

function getAdminStorageAccessInfo() {
  requireAdmin_();
  return buildStorageAccessInfo_();
}

function getBackupStatus() {
  requireAdmin_();
  const access = buildStorageAccessInfo_();
  const backupFiles = getOneDriveBackupFiles().files;
  const status = {
    status: 'planned',
    summary: 'Safe backup is configured as a layered local and cloud process. The authoritative code remains in VS Code and GitHub, while large files and document content remain in OneDrive and the external backup copy.',
    project: {
      authoritativeCodeFolder: access.vscodeFolder,
      githubRepository: access.githubRepository,
      githubBranch: access.githubBranch,
      appsScriptWebApp: access.appsScriptWebApp
    },
    externalCopies: {
      externalCodeBackup: access.externalCodeBackup,
      dataRoot: access.dataRoot,
      oneDriveSyncSource: access.oneDriveSyncSource,
      archiveFolder: access.recommendedArchiveFolder
    },
    fileStorage: {
      localOneDrive: access.localOneDrive,
      primaryOneDriveAccount: access.primaryOneDriveAccount,
      externalDrive: access.externalDrive,
      externalDriveLabel: access.externalDriveLabel
    },
    firestore: {
      purpose: 'Stores vital application metadata, links, permissions, help articles, alerts, audit records and development tasks.',
      notForSecrets: 'Passwords, tokens, private keys and service-account secrets must not be stored here.'
    },
    backupRoutine: [
      'Keep the authoritative VS Code project on C: and treat the external E: code folder as a backup copy only.',
      'Store large files, scans and attachments in OneDrive or Google Drive and keep their metadata in Firestore.',
      'Keep the backup data root on the external HDD and archive old content in the archive folder.',
      'Commit and push code changes to GitHub after the app is tested in the /dev deployment.'
    ],
    oneDriveBackups: backupFiles,
    nextAction: 'Run a focused validation pass after each code change, then commit and push the source to GitHub and refresh the Apps Script /dev test.',
    updatedAt: new Date().toISOString()
  };

  return status;
}

function createSafeBackupPackage() {
  requireAdmin_();

  const access = buildStorageAccessInfo_();
  const timestamp = new Date();
  const backupRecord = {
    backupType: 'Nilavaram Safe Backup',
    createdAt: timestamp.toISOString(),
    owner: 'mangai8100@gmail.com',
    source: {
      codeFolder: access.vscodeFolder,
      githubRepository: access.githubRepository,
      githubBranch: access.githubBranch,
      appsScriptWebApp: access.appsScriptWebApp
    },
    storage: {
      oneDrive: {
        root: access.localOneDrive,
        syncSource: access.oneDriveSyncSource,
        targetFolder: 'Nilavaram/Backups',
        status: 'ready-to-store'
      },
      externalDrive: {
        driveLetter: 'E:',
        volumeLabel: access.externalDriveLabel,
        path: 'E:\\nn\\Nilavaram Data\\99 Archive\\Backups',
        status: 'local-copy-ready'
      }
    },
    firestore: {
      purpose: 'Metadata and links only; do not keep file payloads inside Firestore.'
    },
    notes: [
      'The app stores the backup metadata in Firestore and the actual file payload in OneDrive.',
      'The Windows local E: drive path is recorded as the required local external backup target for manual or scheduled sync.',
      'Apps Script cannot directly write to the local Windows E: drive from the cloud runtime.'
    ]
  };

  const folderId = ensureOneDriveFolderPath_(['Nilavaram', 'Backups']);
  const fileName = 'nilavaram-safe-backup-' + Utilities.formatDate(timestamp, 'UTC', 'yyyyMMdd-HHmmss') + '.json';
  const upload = uploadOneDriveJson_(folderId, fileName, backupRecord);

  backupRecord.storage.oneDrive.itemId = upload.itemId;
  backupRecord.storage.oneDrive.webUrl = upload.webUrl;
  backupRecord.storage.oneDrive.status = 'saved-in-onedrive';
  backupRecord.storage.externalDrive.status = 'ready-for-local-copy';
  backupRecord.storage.externalDrive.manualCopyCommand = 'Copy the generated backup file from OneDrive to E:\\nn\\Nilavaram Data\\99 Archive\\Backups';

  return {
    success: true,
    message: 'Safe backup prepared in OneDrive and scheduled for the local E: external-drive copy.',
    backup: backupRecord
  };
}

function getDocumentArchiveStatus() {
  requireCurrentUser_();
  const access = buildStorageAccessInfo_();
  return {
    status: 'planned',
    summary: 'Nilavaram keeps document metadata in Firestore and preserves original files in OneDrive or the approved external archive tree. The archive is designed to keep the document link stable while the file remains in the authoritative storage backend.',
    storage: {
      oneDriveRoot: access.localOneDrive,
      syncSource: access.oneDriveSyncSource,
      archiveFolder: access.recommendedArchiveFolder,
      externalDrive: access.externalDrive,
      externalDriveLabel: access.externalDriveLabel
    },
    rules: [
      'Firestore stores document metadata, references and retention notes, not the original binary file.',
      'OneDrive or approved cloud storage remains the authoritative home for each preserved source file.',
      'A document move or rename must not break the linked record or accounting trace.',
      'Missing or expired documents must remain visible with a clear status record until resolved.'
    ],
    categories: [
      {
        id: 'archive-library',
        title: 'Archive Library',
        description: 'Preserved documents and their metadata, indexed for quick reference and recovery.',
        status: 'ready for indexing'
      },
      {
        id: 'upload-documents',
        title: 'Upload Documents',
        description: 'Adds approved evidence and long-term records to the repository without duplicating metadata.',
        status: 'ready for upload workflow'
      },
      {
        id: 'missing-documents',
        title: 'Missing / To Retrieve',
        description: 'Shows expected files that still need to be located or restored.',
        status: 'waiting for document match'
      },
      {
        id: 'expiring-documents',
        title: 'Expiring Documents',
        description: 'Displays records that need review for renewal, replacement or archive confirmation.',
        status: 'review pending'
      },
      {
        id: 'archived-documents',
        title: 'Archived Documents',
        description: 'Retains inactive files and their associated audit references for future access.',
        status: 'archive retention active'
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

function buildConnectionsBootstrap_() {
  const config = getMicrosoftConfig_();
  const missing = getMissingMicrosoftConfig_(config);
  const hasRefreshToken = Boolean(
    PropertiesService.getScriptProperties()
      .getProperty('MICROSOFT_REFRESH_TOKEN')
  );
  return {
    build: 54,
    accessInfo: buildStorageAccessInfo_(),
    hasRefreshToken: hasRefreshToken,
    microsoftStatus: {
      configured: missing.length === 0,
      connected: hasRefreshToken,
      expectedAccount: NILAVARAM_MICROSOFT_ACCOUNT,
      missingProperties: missing,
      account: hasRefreshToken ? NILAVARAM_MICROSOFT_ACCOUNT : '',
      driveType: hasRefreshToken ? 'Authorization saved' : '',
      quotaState: hasRefreshToken ? 'Live quota check pending' : ''
    },
    liveValidationPassed: false,
    liveValidationError: '',
    akoyaStatus: getAkoyaConnectionStatus_(),
    akoyaValidationPassed: false,
    akoyaValidationError: ''
  };
}

/**
 * Loads the Connections screen in one server request. Keeping this as one
 * request avoids leaving the UI on a permanent loading message when either of
 * two chained browser-to-server calls does not return.
 */
function getConnectionsPageData() {
  const bootstrap = buildConnectionsBootstrap_();
  const missing = bootstrap.microsoftStatus.missingProperties;
  const hasRefreshToken = bootstrap.hasRefreshToken;
  const result = {
    build: bootstrap.build,
    accessInfo: bootstrap.accessInfo,
    microsoftStatus: bootstrap.microsoftStatus,
    microsoftError: ''
  };
  if (missing.length === 0 && hasRefreshToken) {
    try {
      result.microsoftStatus = readMicrosoftDriveSummary_();
      result.microsoftStatus.configured = true;
      result.microsoftStatus.expectedAccount = NILAVARAM_MICROSOFT_ACCOUNT;
    } catch (error) {
      result.microsoftError = String(error && error.message || error);
    }
  }
  return result;
}

/**
 * Narrow emergency shell used only when Firestore is unavailable. It is
 * limited to the configured initial Admins and exposes only the OneDrive
 * evacuation/verification controls without weakening normal team access.
 */
function getPrimaryAdminRecoveryShell() {
  const email = getCurrentEmail_();
  if (NILAVARAM_INITIAL_ADMIN_EMAILS.map(normalizeEmail_).indexOf(email) === -1) {
    throw new Error('The recovery screen is restricted to a configured Admin.');
  }
  if (isOneDriveSourceBackendReady_()) {
    throw new Error(
      'OneDrive source storage is already active. Recovery mode is disabled.'
    );
  }
  return {
    info: {
      applicationName: 'Nilavaram',
      version: '1.0',
      project: 'nn',
      user: email,
      role: 'admin — storage recovery',
      accessStatus: 'active',
      dateTime: new Date().toLocaleString(),
      status: 'Firestore unavailable — OneDrive recovery mode'
    },
    navigation: [{
      id: 'system-recovery',
      label: 'System Recovery',
      description: 'Restricted storage recovery controls.',
      type: 'group',
      moduleId: '',
      children: [{
        id: 'connections-recovery',
        label: 'OneDrive recovery',
        description: 'Copies source records to verified OneDrive files.',
        moduleId: 'onedrive-recovery',
        type: 'link',
        level: 2,
        children: []
      }]
    }]
  };
}


/**
 * Module launcher. For specific modules that are already implemented, return the
 * live status summary directly rather than the generic placeholder response.
 */
function openModule(moduleId) {
  requireCurrentUser_();

  const normalizedId = String(moduleId || '').trim();

  if (['backup-status', 'wizard-backup', 'back-up', 'backup'].indexOf(normalizedId) !== -1) {
    const status = getBackupStatus();
    return {
      success: true,
      message: 'Backup status: ' + status.summary + ' Next action: ' + status.nextAction
    };
  }

  if ([
    'archive-library',
    'upload-documents',
    'missing-documents',
    'expiring-documents',
    'archived-documents'
  ].indexOf(normalizedId) !== -1) {
    const status = getDocumentArchiveStatus();
    return {
      success: true,
      message: 'Document archive: ' + status.summary
    };
  }

  return {
    success: true,
    message: normalizedId + ' module is under development.'
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
