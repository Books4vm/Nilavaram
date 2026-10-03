/**
 * InviteEmailEngine.js
 * Email 1 = full invite. Email 2 = short alert (Gmail app push on phone).
 */

function buildInviteEmailSubject_(displayName) {
  const safeName = String(displayName || '').trim();
  return safeName
    ? 'Nilavaram invitation for ' + safeName
    : 'You are invited to Nilavaram';
}

function buildInviteAlertSubject_() {
  return 'ALERT — Check Spam for your Nilavaram invitation';
}

function buildInviteAlertBody_(email) {
  const safeEmail = String(email || '').trim().toLowerCase();
  return [
    'Nilavaram invitation reminder',
    '',
    'Your Nilavaram invitation was sent to: ' + safeEmail,
    '',
    'If you do not see it in your Inbox, open Gmail and check Spam or Junk.',
    '',
    'Open the invitation email and use the link inside it.',
    'Sign in with exactly: ' + safeEmail,
    '',
    'This is an email reminder only — not SMS.'
  ].join('\n');
}

function sendInviteAlertEmailToUser_(email) {
  const normalized = normalizeEmail_(email);
  const sender = normalizeEmail_(Session.getActiveUser().getEmail()) ||
    NILAVARAM_PRIMARY_ADMIN_EMAIL;

  GmailApp.sendEmail(
    normalized,
    buildInviteAlertSubject_(),
    buildInviteAlertBody_(normalized),
    {
      name: 'Nilavaram Alerts',
      replyTo: sender
    }
  );

  writeAudit_('invite-alert-email-sent', normalized, {
    sentBy: sender
  });

  return {
    success: true,
    message: 'Reminder alert sent to ' + normalized + '.'
  };
}

function sendInviteEmailToUser_(email) {
  const normalized = normalizeEmail_(email);
  let user = getUserByEmail_(normalized);
  if (!user) {
    throw new Error('User not found.');
  }
  if (user.status !== 'invited') {
    throw new Error('Invite email is only sent for pending invitations.');
  }
  if (user.role === 'disabled') {
    throw new Error('Disabled users cannot receive invitation emails.');
  }

  user = ensureInviteTokenForUser_(normalized);
  const mainUiUrl = getMainUiUrl_();
  const body = buildInviteMessage_(
    user.email,
    user.displayName,
    user.role,
    mainUiUrl,
    user.inviteToken
  );
  const sender = normalizeEmail_(Session.getActiveUser().getEmail()) ||
    NILAVARAM_PRIMARY_ADMIN_EMAIL;

  GmailApp.sendEmail(normalized, buildInviteEmailSubject_(user.displayName), body, {
    name: 'Nilavaram',
    replyTo: sender
  });

  user.lastInviteSentAt = new Date();
  user.inviteEmailSentCount = Number(user.inviteEmailSentCount || 0) + 1;
  user.updatedAt = new Date();
  delete user.id;
  firestoreSetDocument_('users', normalized, toFirestoreFields_(user));

  writeAudit_('invite-email-sent', normalized, {
    sentBy: sender,
    inviteEmailSentCount: user.inviteEmailSentCount
  });

  try {
    sendInviteAlertEmailToUser_(normalized);
    user.lastInviteAlertSentAt = new Date();
    user.inviteAlertSentCount = Number(user.inviteAlertSentCount || 0) + 1;
    delete user.id;
    firestoreSetDocument_('users', normalized, toFirestoreFields_(user));
  } catch (alertError) {
    writeAudit_('invite-alert-email-failed', normalized, {
      error: String(alertError && alertError.message || alertError)
    });
  }

  return {
    success: true,
    message: 'Invitation and reminder alert sent to ' + normalized + '.',
    email: normalized,
    inviteUrl: buildInviteUrl_(mainUiUrl, user.inviteToken)
  };
}

function resendInviteEmail(email) {
  requireAdmin_();
  return sendInviteEmailToUser_(email);
}