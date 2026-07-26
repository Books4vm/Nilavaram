/**
 * Help.js
 * Editable Markdown Help articles with history, audits and Admin alerts.
 */

function getHelpArticleDefaults_() {
  return {
    'project-start': {
      title: 'Project Start',
      content: [
        '# Project Start',
        '',
        'Nilavaram is a private, long-term Personal, Family and Business Information System.',
        '',
        '## Core purpose',
        '- Record personal, education, employment and business history.',
        '- Preserve important documents and identify documents still to be retrieved.',
        '- Organize properties, financial accounts, trusts, entities and stated ownership.',
        '- Track renewals, filing duties, reminders and follow-up dates.',
        '- Keep a private decision journal for decisions, reasons and later reviews.',
        '- Share each record or document only with specifically approved users.',
        '- Provide one cloud interface with safe backup and long-term archive protection.',
        '',
        '## Working principles',
        '- The development intentions may be completed in any practical sequence.',
        '- New personal records should begin as Private and owned by mangai8100@gmail.com.',
        '- Visibility is decided separately for every record and document.',
        '- OneDrive or Google Drive may hold original files; Firestore holds their organized details, links and permissions.',
        '- Missing documents remain listed so they can be retrieved later if they become available.',
        '',
        '**Status:** This is the agreed foundation for Nilavaram.'
      ].join('\n')
    },
    'navigation-guide': {
      title: 'Navigation Guide',
      content: buildNavigationGuideContent_()
    },
    'getting-started': {
      title: 'Getting Started',
      content: [
        '# Getting Started',
        '',
        'This guide will explain first login, selecting a business and dashboard basics.',
        '',
        '## Current status',
        '- The foundation is being developed.',
        '- Instructions will be added as each module becomes available.'
      ].join('\n')
    },
    'users-access-guide': {
      title: 'Users & Access',
      content: [
        '# Users & Access',
        '',
        'Nilavaram is invitation-only and uses Google identity.',
        '',
        '## Roles',
        '- Admin: manages the application, users and permissions.',
        '- Editor: changes permitted business data and Help content.',
        '- Reader: reads permitted information.',
        '- Ltd: reads only assigned modules.',
        '- Disabled: cannot access Nilavaram.'
      ].join('\n')
    },
    'accounting-guide': {
      title: 'Accounting Guide',
      content: [
        '# Accounting Guide',
        '',
        'Nilavaram follows the flow from transaction input to accounting processing and reports.',
        '',
        '## Basic flow',
        '- Enter or import transactions.',
        '- Review and categorize them.',
        '- Post entries to the ledger.',
        '- Prepare the trial balance and financial statements.'
      ].join('\n')
    },
    'documents-imports-guide': {
      title: 'Documents and Imports',
      content: [
        '# Documents and Imports',
        '',
        'This guide will explain CSV, Excel, PDF and supporting-document workflows.',
        '',
        '- Transaction data may be imported temporarily through Google Sheets.',
        '- Large PDFs, scans and images should be stored in OneDrive or Google Drive.',
        '- Firestore stores the file link, ownership and related transaction information.'
      ].join('\n')
    },
    'inactivity-sign-in': {
      title: 'Inactivity and Sign-in',
      content: [
        '# Inactivity and Sign-in',
        '',
        '## Planned session behavior',
        '- Warn the user after 9 minutes of inactivity.',
        '- End the Nilavaram session after 10 minutes of inactivity.',
        '- Require the user to sign in again using the Google ID.',
        '',
        '**Status:** Planned, not yet implemented.',
        '',
        '**Assigned to:** mangai8100@gmail.com',
        '',
        '**Due date:** 09-AUG-2026'
      ].join('\n')
    },
    'project-architecture': {
      title: 'Project Architecture',
      content: [
        '# Project Architecture',
        '',
        'Nilavaram uses cloud services according to the kind of information being stored.',
        '',
        '- **Firestore:** application data and short Help content.',
        '- **Markdown:** structured, space-efficient explanations.',
        '- **Google Docs:** collaborative teaching documents.',
        '- **Google Sheets:** import, export and temporary analysis.',
        '- **OneDrive:** large documents and attachments.',
        '- **GitHub:** source code and developer documentation.',
        '',
        'Markdown remains ordinary text while supporting headings, lists, examples and emphasis in the UI.'
      ].join('\n')
    },
    'faq': {
      title: 'Frequently Asked Questions',
      content: [
        '# Frequently Asked Questions',
        '',
        'Questions and answers will be added here as Nilavaram develops.'
      ].join('\n')
    },
    'about-version-history': {
      title: 'About and Version History',
      content: [
        '# About and Version History',
        '',
        'This page will record important releases, completed features and user-facing changes.'
      ].join('\n')
    },
    'admin-technical-guide': {
      title: 'Admin Technical Guide',
      content: [
        '# Admin Technical Guide',
        '',
        'This Admin-only guide explains how Nilavaram development and cloud synchronization work.',
        '',
        '## Main working copy',
        '```',
        'C:\\Users\\theso\\Documents\\nn\\Nilavaram',
        '```',
        'VS Code edits this working copy. Do not use another folder as the main source without deliberately changing the project setup.',
        '',
        '## Development flow',
        '```',
        'VS Code → clasp push → Apps Script → /dev testing → production deployment',
        '                 ↓',
        '              Firestore',
        '',
        'VS Code → Git commit → GitHub version history',
        '```',
        '',
        '## clasp and Apps Script',
        '- `.clasp.json` links this folder to the Apps Script project. Its Script ID identifies the project but is not a password.',
        '- `clasp status` lists files linked to Apps Script.',
        '- `clasp push` uploads the current local Apps Script files.',
        '- The `/dev` web-app URL tests the latest uploaded code.',
        '- The `/exec` URL shows the last production deployment until a new version is deployed.',
        '- The personal `.clasprc.json` OAuth credential file must never be displayed in Nilavaram or committed to GitHub.',
        '',
        '## GitHub',
        '- Repository: `https://github.com/Books4vm/Nilavaram.git`',
        '- GitHub stores version history; it does not execute Nilavaram.',
        '- Use `git status`, `git add`, `git commit`, `git pull --rebase origin main`, and `git push origin main` carefully.',
        '- GitHub passwords or access tokens must remain in the approved credential manager, never in project notes.',
        '',
        '## Firestore',
        '- Firestore stores centralized application data such as menus, users, permissions, Help articles, alerts, audits and development tasks.',
        '- Apps Script reads the project identifier from the Script Property named `FIRESTORE_PROJECT_ID`.',
        '- Apps Script authenticates Firestore requests with a temporary Google OAuth token.',
        '- The Project ID may be documented for Admins; OAuth tokens, private keys and service-account secrets must never be displayed.',
        '',
        '## Other storage',
        '- Google Docs: collaborative teaching documents.',
        '- Google Sheets: imports, exports and temporary analysis.',
        '- OneDrive or Google Drive: large PDFs, scans, invoices and attachments.',
        '- Firestore stores file metadata and links rather than large file contents.',
        '',
        '## Credential register',
        '- Apps Script link: configured in `.clasp.json`.',
        '- clasp OAuth: configured per authorized developer outside the repository.',
        '- Firestore Project ID: configured in Apps Script Properties.',
        '- GitHub authentication: configured through Git or the operating-system credential manager.',
        '- OneDrive/Microsoft Graph authentication: not yet configured.',
        '',
        '**Security rule:** Document where a credential is stored and who owns it, but never copy the secret value into Firestore, Help, GitHub or screenshots.'
      ].join('\n')
    }
  };
}

function getHelpArticle(articleId) {
  const user = requireCurrentUser_();
  const id = String(articleId || '').trim();
  const defaults = getHelpArticleDefaults_();
  if (!defaults[id]) throw new Error('Unknown Help article.');
  if (id === 'admin-technical-guide' && user.role !== 'admin') {
    throw new Error('Admin permission is required.');
  }

  let article = null;
  try {
    article = fromFirestoreDocument_(
      firestoreGetDocument_('helpArticles', id)
    );
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') === -1) {
      throw error;
    }
  }

  if (!article) {
    const createdAt = new Date();
    article = {
      title: defaults[id].title,
      content: defaults[id].content,
      version: 1,
      status: 'active',
      updatedBy: NILAVARAM_PRIMARY_ADMIN_EMAIL,
      updatedAt: createdAt
    };
    firestoreSetDocument_('helpArticles', id, toFirestoreFields_(article));
    article.updatedAt = createdAt.toISOString();
  }

  article.articleId = id;
  article.canEdit = user.role === 'admin' || user.role === 'editor';
  return article;
}

function buildNavigationGuideContent_() {
  const lines = [
    '# Navigation Guide',
    '',
    'This guide explains the menus available to your current role.',
    ''
  ];

  function appendItems(items, level) {
    (items || []).forEach(function(item) {
      lines.push(
        Array(level).join('  ') + '- **' + item.label + ':** ' +
        (item.description || 'Opens this module.')
      );
      appendItems(item.children, level + 1);
    });
  }

  getNavigation().forEach(function(section) {
    lines.push('## ' + section.label);
    if (section.description) lines.push(section.description);
    appendItems(section.children, 1);
    lines.push('');
  });

  return lines.join('\n').trim();
}

function saveHelpArticle(input) {
  const user = requireCurrentUser_();
  if (user.role !== 'admin' && user.role !== 'editor') {
    throw new Error('Admin or Editor permission is required.');
  }

  const articleId = String(input && input.articleId || '').trim();
  const defaults = getHelpArticleDefaults_();
  if (!defaults[articleId]) throw new Error('Unknown Help article.');
  if (articleId === 'admin-technical-guide' && user.role !== 'admin') {
    throw new Error('Admin permission is required.');
  }

  const title = String(input && input.title || '').trim();
  const content = String(input && input.content || '').trim();
  const reason = String(input && input.reason || '').trim() ||
    'No reason provided';
  if (!title || !content) {
    throw new Error('Title and Help content cannot be empty.');
  }

  const previous = getHelpArticle(articleId);
  const previousVersion = Number(previous.version || 1);
  const newVersion = previousVersion + 1;
  const changedAt = new Date();

  firestoreSetDocument_(
    'helpHistory',
    Utilities.getUuid(),
    toFirestoreFields_({
      articleId: articleId,
      title: previous.title,
      content: previous.content,
      version: previousVersion,
      changedBy: user.email,
      changedAt: changedAt,
      reason: reason
    })
  );

  firestoreSetDocument_(
    'helpArticles',
    articleId,
    toFirestoreFields_({
      title: title,
      content: content,
      version: newVersion,
      status: 'active',
      updatedBy: user.email,
      updatedAt: changedAt
    })
  );

  firestoreSetDocument_(
    'auditLog',
    Utilities.getUuid(),
    toFirestoreFields_({
      action: 'help-article-changed',
      actorEmail: user.email,
      targetType: 'helpArticle',
      targetId: articleId,
      oldVersion: previousVersion,
      newVersion: newVersion,
      reason: reason,
      createdAt: changedAt
    })
  );

  createAdminHelpAlerts_(
    user,
    articleId,
    title,
    newVersion,
    reason,
    changedAt
  );

  return {
    success: true,
    message: 'Help article saved as version ' + newVersion + '.',
    version: newVersion
  };
}

function createAdminHelpAlerts_(
  user,
  articleId,
  title,
  version,
  reason,
  changedAt
) {
  firestoreGetCollection_('users')
    .map(fromFirestoreDocument_)
    .filter(function(candidate) {
      return candidate.role === 'admin' && candidate.status === 'active';
    })
    .forEach(function(admin) {
      firestoreSetDocument_(
        'alerts',
        Utilities.getUuid(),
        toFirestoreFields_({
          recipientEmail: admin.email,
          type: 'help-content-changed',
          title: 'Help content changed',
          message:
            title + ' was changed by ' + user.email +
            ' (version ' + version + ').',
          articleId: articleId,
          reason: reason,
          status: 'unread',
          createdAt: changedAt
        })
      );
    });
}
