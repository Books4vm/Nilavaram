/**
 * PopupSecurityEngine.js
 * LOCKED: every Nilavaram pop-up must use authorizePopupWindow_ /
 * authorizeModuleWindowLoad_ in doGet AND again on page load.
 */

const NILAVARAM_POPUP_WINDOWS = {
    inviteWindow: {
      label: 'Users & Invitations',
      moduleId: 'users',
      requireAdmin: true
    },
    clientBusinessWindow: {
      label: 'Clients & Businesses',
      moduleId: 'all-businesses',
      requireAdmin: true
    }
  };
  
  /**
   * Gate 1 + Gate 2 for admin pop-ups tied to a menu module.
   *
   * @param {string} windowKey
   * @param {string} clientId
   * @param {string} entityId
   * @returns {Object}
   */
  function authorizePopupWindow_(windowKey, clientId, entityId) {
    const config = NILAVARAM_POPUP_WINDOWS[String(windowKey || '').trim()];
    if (!config) {
      throw new Error('Unknown pop-up window: ' + windowKey);
    }
  
    const user = requireCurrentUser_();
    if (config.requireAdmin) {
      requireAdmin_();
    }
  
    const normalizedClientId = String(clientId || '').trim();
    const normalizedEntityId = String(entityId || '').trim();
    if (!normalizedClientId || !normalizedEntityId) {
      throw new Error(
        'Select client and business in the main workspace before opening ' +
        config.label + '.'
      );
    }
  
    requireActiveClient_(normalizedClientId);
    requireUserClientAccess_(user, normalizedClientId);
    requireUserEntityAccess_(user, normalizedEntityId);
    const entity = requireActiveEntityForClient_(
      normalizedEntityId,
      normalizedClientId
    );
  
    if (config.moduleId) {
      const menuItem = findMenuItemForModule_(config.moduleId);
      requireMenuItemAccess_(
        user,
        menuItem,
        normalizedClientId,
        entity.id
      );
    }
  
    return {
      authorized: true,
      windowKey: windowKey,
      windowLabel: config.label,
      clientId: normalizedClientId,
      entityId: entity.id,
      entityName: entity.name,
      userEmail: user.email,
      userRole: user.role
    };
  }
  
  /**
   * Gate 1 for module pop-ups — called from doGet before HTML is served.
   *
   * @param {string} clientId
   * @param {string} entityId
   * @param {string} moduleId
   * @returns {Object}
   */
  function authorizeModuleWindowLoad_(clientId, entityId, moduleId) {
    return requireWorkspaceContext_(clientId, entityId, moduleId);
  }