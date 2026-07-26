/**
 * Accounts.js
 * Firestore-backed entities and editable five-digit Chart of Accounts.
 */

const NILAVARAM_ACCOUNTING_FOUNDATION_VERSION = 5;

function getDocumentOrNull_(collectionName, documentId) {
  try {
    return fromFirestoreDocument_(
      firestoreGetDocument_(collectionName, documentId)
    );
  } catch (error) {
    if (String(error.message).indexOf('HTTP status: 404') !== -1) return null;
    throw error;
  }
}

function createIfMissing_(collectionName, documentId, record) {
  if (getDocumentOrNull_(collectionName, documentId)) return;
  record.createdAt = new Date();
  record.updatedAt = new Date();
  firestoreSetDocument_(
    collectionName,
    documentId,
    toFirestoreFields_(record)
  );
}

function setupAccountingFoundation_() {
  [
    ['nilavaram', 'Nilavaram', 'compilation'],
    ['member-m', 'M', 'core-member'],
    ['member-a', 'A', 'core-member'],
    ['member-s', 'S', 'core-member'],
    ['member-r', 'R', 'core-member'],
    ['trust-vav', 'VAV Tr', 'irrevocable-trust'],
    ['trust-om-nama-sivaya', 'OM NAMA SIVAYA Tr', 'irrevocable-trust'],
    ['trust-vm', 'VM Tr', 'irrevocable-trust']
  ].forEach(function(item) {
    createIfMissing_('entities', item[0], {
      name: item[1],
      entityType: item[2],
      status: 'active'
    });
  });

  [
    ['family-10000', '10000', 'ASSETS', 'group', '', 'nilavaram'],
    ['family-11000', '11000', 'Cash and Bank Accounts', 'group', '10000', 'nilavaram'],
    ['family-11100', '11100', 'Bank of America Accounts', 'group', '11000', 'nilavaram'],
    ['family-11110', '11110', 'BOA Ch * 0137', 'asset', '11100', 'nilavaram'],
    ['family-20000', '20000', 'EXTERNAL LIABILITIES', 'group', '', 'nilavaram'],
    ['family-30000', '30000', 'RESERVED', 'group', '', 'nilavaram'],
    ['family-40000', '40000', 'INCOME', 'group', '', 'nilavaram'],
    ['family-50000', '50000', 'EXPENSES', 'group', '', 'nilavaram'],
    ['family-60000', '60000', 'TRANSFERS AND CLEARING', 'group', '', 'nilavaram'],
    ['family-70000', '70000', 'CORE-MEMBER NET WORTH', 'group', '', 'nilavaram'],
    ['family-71000', '71000', 'M — Net Worth', 'net-worth', '70000', 'nilavaram'],
    ['family-71100', '71100', 'M — Employment and Other Deposits', 'net-worth', '71000', 'nilavaram'],
    ['family-71110', '71110', 'M - CTU Paycheck', 'net-worth', '71100', 'nilavaram'],
    ['family-72000', '72000', 'A — Net Worth', 'net-worth', '70000', 'nilavaram'],
    ['family-73000', '73000', 'S — Net Worth', 'net-worth', '70000', 'nilavaram'],
    ['family-74000', '74000', 'R — Net Worth', 'net-worth', '70000', 'nilavaram']
    ,['family-75000', '75000', 'VAV Tr — Net Worth', 'net-worth', '70000', 'trust-vav']
    ,['family-76000', '76000', 'OM NAMA SIVAYA Tr — Net Worth', 'net-worth', '70000', 'trust-om-nama-sivaya']
    ,['family-77000', '77000', 'VM Tr — Net Worth', 'net-worth', '70000', 'trust-vm']
    ,['family-80000', '80000', 'RESERVED', 'group', '', 'nilavaram']
    ,['family-90000', '90000', 'SYSTEM CONTROL', 'group', '', 'nilavaram']
  ].forEach(function(item) {
    createIfMissing_('accounts', item[0], {
      code: item[1],
      name: item[2],
      accountType: item[3],
      parentCode: item[4],
      entityId: item[5],
      status: 'active',
      openingDate: '2025-01-01',
      notes: ''
    });
  });

  removeKnownDuplicateAccounts_();
  migrateNilavaramTerminology_();
  applyAccountClassificationNotes_();
  firestoreSetDocument_(
    'system',
    'nilavaram-foundation',
    toFirestoreFields_({
      title: 'Nilavaram Foundation',
      familyName: 'M Family',
      familyHead: 'M',
      familyHeadBasis: 'Family Head under the family’s Saiva and Tamil cultural tradition; this is an internal administrative designation.',
      accountingModel: 'Current-status compilation with ownership identified separately for each member, trust and other entity',
      effectiveFrom: '2025-01-01',
      policyStatements: [
        'Nilavaram shows the current status: assets, payables, net worth and related details.',
        'Every item identifies the member, trust or other name in which it is held.',
        'Nilavaram does not earn income in its own capacity under this internal accounting model.',
        'Income belongs to the core member who earned or received it.',
        'Member earnings increase that member’s recorded net worth section.',
        'Common and individual payments identify the member concerned.',
        'Nilavaram does not prepare a combined family Profit and Loss account.',
        'The intended combined net income in Nilavaram is always zero.'
      ],
      clarification: 'Nilavaram records the stated ownership and current position. It does not determine legal ownership, federal or state tax treatment, or the separate reporting duties of a person, business or irrevocable trust.',
      updatedAt: new Date()
    })
  );
  const oldFoundation = getDocumentOrNull_(
    'system',
    'family-accounting-foundation'
  );
  if (oldFoundation) {
    firestoreDeleteDocument_('system', 'family-accounting-foundation');
  }
  firestoreSetDocument_(
    'system',
    'accounting-config',
    toFirestoreFields_({
      version: NILAVARAM_ACCOUNTING_FOUNDATION_VERSION,
      updatedAt: new Date()
    })
  );
}

function migrateNilavaramTerminology_() {
  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);
  accounts.forEach(function(account) {
    if (account.entityId !== 'family-fund') return;
    const updated = {};
    Object.keys(account).forEach(function(key) {
      if (key !== 'id') updated[key] = account[key];
    });
    updated.entityId = 'nilavaram';
    updated.updatedAt = new Date();
    firestoreSetDocument_(
      'accounts',
      account.id,
      toFirestoreFields_(updated)
    );
  });
  if (getDocumentOrNull_('entities', 'family-fund')) {
    firestoreDeleteDocument_('entities', 'family-fund');
  }
}

function ensureAccountingFoundation_() {
  const config = getDocumentOrNull_('system', 'accounting-config');
  if (!config ||
      config.version !== NILAVARAM_ACCOUNTING_FOUNDATION_VERSION) {
    setupAccountingFoundation_();
  }
}

function removeKnownDuplicateAccounts_() {
  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);

  accounts.forEach(function(account) {
    const isDuplicateOmAccount =
      account.code === '77000' &&
      account.entityId === 'trust-om-nama-sivaya' &&
      account.id !== 'family-77000';

    if (!isDuplicateOmAccount) return;

    firestoreSetDocument_(
      'accountHistory',
      Utilities.getUuid(),
      toFirestoreFields_({
        accountId: account.id,
        previousRecord: account,
        changedBy: NILAVARAM_PRIMARY_ADMIN_EMAIL,
        changedAt: new Date(),
        reason: 'Duplicate five-digit code corrected'
      })
    );

    firestoreDeleteDocument_('accounts', account.id);

    writeAudit_('duplicate-chart-account-removed',
      NILAVARAM_PRIMARY_ADMIN_EMAIL, {
        accountId: account.id,
        duplicateCode: '77000',
        retainedOmCode: '76000',
        retainedVmCode: '77000'
      });
  });
}

function getAccountClassification_(account, allAccounts) {
  if (account.status === 'inactive') {
    return {
      mark: 'INACTIVE',
      explanation: 'Retained for history and unavailable for new entries.'
    };
  }
  if (!account.parentCode) {
    const rootExplanations = {
      '10000': 'Main heading for bank accounts, investments, properties and other assets. Transactions cannot be entered here.',
      '20000': 'Main heading for credit cards, mortgages, loans and other amounts owed outside the family. Transactions cannot be entered here.',
      '30000': 'Reserved for a future approved purpose. It is not available for transactions.',
      '40000': 'Main heading for income maintained separately for a person, trust or business. Transactions cannot be entered here.',
      '50000': 'Main heading for expenses maintained separately for a person, trust or business. Transactions cannot be entered here.',
      '60000': 'Main heading for transfers and items awaiting proper classification. Transactions cannot be entered here.',
      '70000': 'Main heading for member and trust net worth. Transactions cannot be entered here.',
      '80000': 'Reserved for a future approved purpose. It is not available for transactions.',
      '90000': 'Technical system-control heading. Ordinary users cannot enter transactions here.'
    };
    if (account.code === '40000' || account.code === '50000') {
      return {
        mark: 'NOT USED — NILAVARAM',
        explanation: account.code === '40000'
          ? 'Nilavaram does not record combined income. Member earnings appear under 70000. Reserved for a separate accounting profile if later required.'
          : 'Nilavaram does not prepare a combined expense or Profit and Loss account. Payments identify the member concerned. Reserved for a separate accounting profile if later required.'
      };
    }
    return {
      mark: 'MAIN GROUP',
      explanation: rootExplanations[account.code] ||
        'Top-level heading. Transactions cannot be entered here.'
    };
  }
  const hasChildren = (allAccounts || []).some(function(candidate) {
    return candidate.parentCode === account.code &&
      candidate.status !== 'inactive';
  });
  if (account.accountType === 'group' || hasChildren) {
    return {
      mark: 'SUBGROUP',
      explanation: 'Organizes related accounts. Transactions cannot be entered here.'
    };
  }
  return {
    mark: 'ENTRY ACCOUNT',
    explanation: 'May be selected when entering a transaction.'
  };
}

function applyAccountClassificationNotes_() {
  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);
  accounts.forEach(function(account) {
    const classification = getAccountClassification_(account, accounts);
    const updated = {};
    Object.keys(account).forEach(function(key) {
      if (key !== 'id') updated[key] = account[key];
    });
    if (account.id === 'family-70000') {
      updated.name = 'MEMBER AND TRUST NET WORTH';
    }
    const existingNotes = String(account.notes || '')
      .replace(/\s*\[Classification\][\s\S]*$/, '')
      .trim();
    updated.notes = [
      existingNotes,
      '[Classification] ' + classification.mark + ': ' +
        classification.explanation
    ].filter(Boolean).join(' ');
    updated.updatedAt = new Date();
    firestoreSetDocument_(
      'accounts',
      account.id,
      toFirestoreFields_(updated)
    );
  });
}

function suggestChartAccount(input) {
  requireAdmin_();
  ensureAccountingFoundation_();
  const purpose = String(input && input.purpose || '').trim();
  const entityId = String(input && input.entityId || '').trim();
  const name = String(input && input.name || '').trim();
  const lastFour = String(input && input.lastFour || '').replace(/\D/g, '');
  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);

  if (!getDocumentOrNull_('entities', entityId)) {
    throw new Error('First select who or which organization this belongs to.');
  }

  const definitions = {
    'bank': { start: 11110, end: 11990, type: 'asset', parent: '11000' },
    'credit-card': { start: 21110, end: 21990, type: 'liability', parent: '21000' },
    'loan': { start: 22110, end: 22990, type: 'liability', parent: '22000' },
    'paycheck': { start: 71110, end: 74990, type: 'net-worth', parent: '70000' },
    'property': { start: 14110, end: 14990, type: 'asset', parent: '14000' },
    'investment': { start: 13110, end: 13990, type: 'asset', parent: '13000' },
    'expense': { start: 50110, end: 59990, type: 'expense', parent: '50000' },
    'equity': { start: 70110, end: 79990, type: 'net-worth', parent: '70000' },
    'other': { start: 60110, end: 69990, type: 'clearing', parent: '60000' }
  };
  const definition = definitions[purpose];
  if (!definition) throw new Error('Select what you are adding.');

  if (purpose === 'equity') {
    const trustParents = {
      'trust-vav': '75000',
      'trust-om-nama-sivaya': '76000',
      'trust-vm': '77000'
    };
    definition.parent = trustParents[entityId] || '70000';
    definition.start = Number(definition.parent) + 10;
    definition.end = Number(definition.parent) + 990;
  }

  const used = {};
  accounts.forEach(function(account) {
    used[account.code] = true;
  });
  let suggestedCode = '';
  for (let code = definition.start; code <= definition.end; code += 10) {
    const value = String(code).padStart(5, '0');
    if (!used[value]) {
      suggestedCode = value;
      break;
    }
  }
  if (!suggestedCode) throw new Error('No available code remains in this category.');

  let suggestedName = name;
  if (purpose === 'bank' && lastFour && name.indexOf('*') === -1) {
    suggestedName += ' * ' + lastFour;
  }

  return {
    code: suggestedCode,
    name: suggestedName,
    accountType: definition.type,
    parentCode: definition.parent,
    explanation: 'Nilavaram selected the next available five-digit code and its accounting group. You may review the advanced details before saving.'
  };
}

function getChartOfAccountsData() {
  const user = requireCurrentUser_();
  ensureAccountingFoundation_();
  const activeAccounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_)
    .filter(function(account) { return account.status === 'active'; })
    .sort(function(a, b) {
      return a.code.localeCompare(b.code);
    });
  activeAccounts.forEach(function(account) {
    const classification = getAccountClassification_(
      account,
      activeAccounts
    );
    account.displayMark = classification.mark;
    account.displayExplanation = classification.explanation;
  });

  return {
    canEdit: user.role === 'admin',
    foundation: fromFirestoreDocument_(
      firestoreGetDocument_('system', 'nilavaram-foundation')
    ),
    entities: firestoreGetCollection_('entities')
      .map(fromFirestoreDocument_)
      .filter(function(entity) { return entity.status === 'active'; })
      .sort(function(a, b) { return a.name.localeCompare(b.name); }),
    accounts: activeAccounts
  };
}

function saveChartAccount(input) {
  const admin = requireAdmin_();
  const id = String(input && input.id || '').trim();
  const code = String(input && input.code || '').trim();
  const name = String(input && input.name || '').trim();
  const entityId = String(input && input.entityId || '').trim();
  const accountType = String(input && input.accountType || '').trim();
  const parentCode = String(input && input.parentCode || '').trim();
  const status = String(input && input.status || 'active').trim();
  const notes = String(input && input.notes || '').trim();

  if (!/^\d{5}$/.test(code)) {
    throw new Error('Account code must contain exactly five numbers.');
  }
  if (!name) throw new Error('Enter an account name.');
  if (!getDocumentOrNull_('entities', entityId)) {
    throw new Error('Select a valid entity.');
  }
  if (['group', 'asset', 'liability', 'net-worth', 'income', 'expense', 'clearing']
      .indexOf(accountType) === -1) {
    throw new Error('Select a valid account type.');
  }
  if (parentCode && !/^\d{5}$/.test(parentCode)) {
    throw new Error('Parent code must be blank or contain five numbers.');
  }
  if (['active', 'inactive'].indexOf(status) === -1) {
    throw new Error('Select a valid status.');
  }

  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);
  const duplicate = accounts.some(function(account) {
    return account.id !== id &&
      account.code === code;
  });
  if (duplicate) {
    throw new Error(
      'Account code ' + code +
      ' is already in use. Every five-digit code must be unique.'
    );
  }

  const previous = id ? getDocumentOrNull_('accounts', id) : null;
  const documentId = previous ? previous.id : Utilities.getUuid();
  if (previous) {
    firestoreSetDocument_(
      'accountHistory',
      Utilities.getUuid(),
      toFirestoreFields_({
        accountId: previous.id,
        previousRecord: previous,
        changedBy: admin.email,
        changedAt: new Date()
      })
    );
  }

  const savedAccount = {
    code: code,
    name: name,
    entityId: entityId,
    accountType: accountType,
    parentCode: parentCode,
    status: status,
    openingDate: previous ? previous.openingDate : '2025-01-01',
    notes: notes.replace(/\s*\[Classification\][\s\S]*$/, '').trim(),
    createdAt: previous ? previous.createdAt : new Date(),
    updatedAt: new Date(),
    updatedBy: admin.email
  };
  const classification = getAccountClassification_(
    savedAccount,
    accounts.concat([savedAccount])
  );
  if (savedAccount.notes.indexOf('[Classification]') === -1) {
    savedAccount.notes = [
      savedAccount.notes,
      '[Classification] ' + classification.mark + ': ' +
        classification.explanation
    ].filter(Boolean).join(' ');
  }
  firestoreSetDocument_(
    'accounts',
    documentId,
    toFirestoreFields_(savedAccount)
  );

  writeAudit_(previous ? 'chart-account-updated' : 'chart-account-created',
    admin.email, {
      accountId: documentId,
      code: code,
      name: name,
      entityId: entityId
    });

  return {
    success: true,
    message: previous ? 'Account updated.' : 'Account added.'
  };
}
