/**
 * ShellEngine.js
 * Main workspace shell data from Firestore only.
 */

const NILAVARAM_SESSION_WARNING_MINUTES = 9;
const NILAVARAM_SESSION_TIMEOUT_MINUTES = 10;

function getDashboardShell() {
  const info = getDashboardInfo();
  const shell = {
    info: info,
    clients: [],
    entities: [],
    navigation: [],
    sessionPolicy: {
      warningMinutes: NILAVARAM_SESSION_WARNING_MINUTES,
      timeoutMinutes: NILAVARAM_SESSION_TIMEOUT_MINUTES
    }
  };

  if (info.accessStatus === 'active') {
    try {
      shell.clients = getClientGroupsForShell_();
      if (shell.clients.length === 1) {
        shell.entities = getBusinessEntitiesForShell_(shell.clients[0].name);
      }
    } catch (error) {
      shell.shellError = String(error && error.message || error);
    }
  }

  return shell;
}

function getNavigationForShellRefresh() {
  return getNavigation();
}