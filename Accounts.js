/**
 * Accounts.js
 * Firestore-backed entities and editable five-character Chart of Accounts.
 */

const NILAVARAM_ACCOUNTING_FOUNDATION_VERSION = 8;

function numericMemberCodeToVisible_(code) {
  const value = String(code || '').toUpperCase();
  const memberLetters = { '71': 'M', '72': 'A', '73': 'S', '74': 'R' };
  return memberLetters[value.slice(0, 2)] && /^\d{5}$/.test(value)
    ? '7' + memberLetters[value.slice(0, 2)] + value.slice(2)
    : value;
}

function visibleMemberCodeToNumeric_(code) {
  const value = String(code || '').toUpperCase();
  const memberNumbers = { M: '1', A: '2', S: '3', R: '4' };
  return /^7[MASR]\d{3}$/.test(value)
    ? '7' + memberNumbers[value.charAt(1)] + value.slice(2)
    : value;
}

function isValidAccountCode_(code) {
  return /^\d{5}$/.test(code) || /^7[MASR]\d{3}$/.test(code);
}

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
  setupApprovedMemberUseAccounts_();
  migrateMemberAccountCodes_();
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

function migrateMemberAccountCodes_() {
  const accountWrites = [];
  firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_)
    .forEach(function(account) {
      const visibleCode = numericMemberCodeToVisible_(account.code);
      const visibleParent = numericMemberCodeToVisible_(account.parentCode);
      if (visibleCode === account.code &&
          visibleParent === String(account.parentCode || '')) return;
      const updated = {};
      Object.keys(account).forEach(function(key) {
        if (key !== 'id') updated[key] = account[key];
      });
      if (visibleCode !== account.code) {
        updated.exportCode = account.exportCode || account.code;
        updated.code = visibleCode;
      }
      if (visibleParent !== String(account.parentCode || '')) {
        updated.parentCode = visibleParent;
      }
      updated.updatedAt = new Date();
      accountWrites.push({
        id: account.id,
        fields: toFirestoreFields_(updated)
      });
    });
  for (let index = 0; index < accountWrites.length; index += 400) {
    firestoreBatchSetDocuments_(
      'accounts',
      accountWrites.slice(index, index + 400)
    );
  }

  ['transactionRules', 'transactions'].forEach(function(collectionName) {
    const writes = [];
    firestoreGetCollection_(collectionName)
      .map(fromFirestoreDocument_)
      .forEach(function(record) {
        const updated = {};
        Object.keys(record).forEach(function(key) {
          if (key !== 'id') updated[key] = record[key];
        });
        let changed = false;
        ['debitAccountCode', 'creditAccountCode'].forEach(function(field) {
          if (!record[field]) return;
          const visible = numericMemberCodeToVisible_(record[field]);
          if (visible !== record[field]) {
            updated[field] = visible;
            changed = true;
          }
        });
        if (Array.isArray(record.lines)) {
          updated.lines = record.lines.map(function(line) {
            const migratedLine = {};
            Object.keys(line).forEach(function(key) {
              migratedLine[key] = line[key];
            });
            const visible = numericMemberCodeToVisible_(line.accountCode);
            if (visible !== line.accountCode) {
              migratedLine.accountCode = visible;
              changed = true;
            }
            return migratedLine;
          });
        }
        if (changed) {
          updated.updatedAt = new Date();
          writes.push({
            id: record.id,
            fields: toFirestoreFields_(updated)
          });
        }
      });
    for (let index = 0; index < writes.length; index += 400) {
      firestoreBatchSetDocuments_(
        collectionName,
        writes.slice(index, index + 400)
      );
    }
  });
}

function setupApprovedMemberUseAccounts_() {
  const existingAccounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);
  const existingCodes = {};
  existingAccounts.forEach(function(account) {
    existingCodes[account.code] = true;
    existingCodes[visibleMemberCodeToNumeric_(account.code)] = true;
  });

  const pending = [];
  const addAccount = function(code, name, accountType, parentCode, entityId,
      categoryFamily, categorySuffix) {
    if (existingCodes[code]) return;
    const mark = accountType === 'group' ? 'SUBGROUP' : 'ENTRY ACCOUNT';
    const explanation = accountType === 'group'
      ? 'Organizes related accounts. Transactions cannot be entered here.'
      : 'May be selected when entering a transaction.';
    pending.push({
      id: 'approved-' + code,
      fields: toFirestoreFields_({
        code: code,
        name: name,
        accountType: accountType,
        parentCode: parentCode,
        entityId: entityId,
        status: 'active',
        openingDate: '2025-01-01',
        categoryFamily: categoryFamily,
        categorySuffix: categorySuffix || '',
        taxReviewRequired: true,
        notes: '[Classification] ' + mark + ': ' + explanation,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    });
    existingCodes[code] = true;
  };

  const members = [
    { letter: 'M', entityId: 'member-m', base: 71000, autoBase: 71200 },
    { letter: 'A', entityId: 'member-a', base: 72000, autoBase: 72200 },
    { letter: 'S', entityId: 'member-s', base: 73000, autoBase: 73200 },
    { letter: 'R', entityId: 'member-r', base: 74000, autoBase: 74200 }
  ];
  const directCategories = [
    ['01', 'Advertising'],
    ['08', 'Renters insurance'],
    ['10', 'Interest expense'],
    ['11', 'Legal expenses'],
    ['12', 'Professional fees'],
    ['14', 'Vehicle rent/lease'],
    ['15', 'Apartment rent/lease'],
    ['16', 'Repairs and maintenance'],
    ['17', 'Supplies'],
    ['18', 'Taxes and licenses'],
    ['19', 'Travel'],
    ['20', 'Meals and restaurants'],
    ['21', 'Utilities'],
    ['23', 'Other business-related use'],
    ['24', 'Equipment rent/lease'],
    ['30', 'Health insurance'],
    ['31', 'Medical and dental'],
    ['32', 'Pharmacy and prescriptions'],
    ['33', 'Vision care'],
    ['34', 'Other health costs'],
    ['40', 'Mortgage interest'],
    ['41', 'Apartment utilities'],
    ['42', 'Household repairs']
  ];
  const autoCategories = [
    ['01', 'Gas'],
    ['02', 'Parking'],
    ['03', 'Repairs'],
    ['04', 'Registration and tags'],
    ['05', 'Tolls'],
    ['06', 'Insurance'],
    ['07', 'Parts'],
    ['08', 'Wash and detailing'],
    ['09', 'Roadside assistance'],
    ['10', 'Other auto use']
  ];

  members.forEach(function(member) {
    addAccount(
      String(member.base + 100),
      member.letter + ' — Employment and Other Deposits',
      'group', String(member.base), member.entityId, 'member-receipt', '100'
    );
    addAccount(
      String(member.base + 190),
      member.letter + ' — Other member income/deposits',
      'net-worth', String(member.base + 100), member.entityId,
      'member-receipt', '190'
    );
    directCategories.forEach(function(category) {
      const code = String(member.base + Number(category[0])).padStart(5, '0');
      addAccount(
        code,
        member.letter + ' — ' + category[1],
        'net-worth',
        String(member.base),
        member.entityId,
        'member-use',
        category[0]
      );
    });

    const autoParent = String(member.autoBase);
    addAccount(
      autoParent,
      member.letter + ' — Auto',
      'group',
      String(member.base),
      member.entityId,
      'auto',
      ''
    );
    autoCategories.forEach(function(category) {
      const code = String(member.autoBase + Number(category[0]))
        .padStart(5, '0');
      addAccount(
        code,
        member.letter + ' — Auto ' + category[1],
        'net-worth',
        autoParent,
        member.entityId,
        'auto',
        category[0]
      );
    });
  });

  addAccount(
    '75100',
    'VAV Tr — Property',
    'group',
    '75000',
    'trust-vav',
    'property',
    ''
  );
  [
    ['75101', 'Property insurance'],
    ['75102', 'Property tax'],
    ['75103', 'Property repairs'],
    ['75104', 'Property utilities'],
    ['75105', 'Property mortgage interest']
  ].forEach(function(item) {
    addAccount(
      item[0],
      'VAV Tr — ' + item[1],
      'net-worth',
      '75100',
      'trust-vav',
      'property',
      item[0].slice(-2)
    );
  });

  for (let index = 0; index < pending.length; index += 400) {
    firestoreBatchSetDocuments_(
      'accounts',
      pending.slice(index, index + 400)
    );
  }
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
    const nameChanged = updated.name !== account.name;
    if (!nameChanged && updated.notes === String(account.notes || '')) return;
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
  const nearCode = String(input && input.nearCode || '').trim().toUpperCase();
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

  const memberBases = {
    'member-m': 71000,
    'member-a': 72000,
    'member-s': 73000,
    'member-r': 74000
  };
  const memberLetters = {
    'member-m': 'M',
    'member-a': 'A',
    'member-s': 'S',
    'member-r': 'R'
  };

  // Nilavaram does not use the generic 50000 expense section. A payment for a
  // member reduces that member's net-worth position and therefore belongs in
  // the shared 7M/7A/7S/7R member-use structure.
  if (purpose === 'expense') {
    if (!memberBases[entityId]) {
      throw new Error(
        'The 50000 expense group is NOT USED in this Nilavaram profile. ' +
        'Select the member concerned so Nilavaram can suggest a member-use ACODE.'
      );
    }

    const memberLetter = memberLetters[entityId];
    const usedSuffixes = {};
    accounts.forEach(function(account) {
      const visible = numericMemberCodeToVisible_(
        account.code || account.exportCode || ''
      );
      const match = visible.match(/^7[MASR](\d{3})$/);
      if (match) usedSuffixes[match[1]] = true;
    });

    let startSuffix = 1;
    const nearMatch = nearCode.match(/^7([MASR])(\d{3})$/);
    if (nearMatch) startSuffix = Number(nearMatch[2]) + 1;

    const suffixChoices = [];
    for (let pass = 0; pass < 2 && suffixChoices.length < 3; pass += 1) {
      const first = pass === 0 ? startSuffix : 1;
      const last = pass === 0 ? 999 : startSuffix - 1;
      for (let suffix = first; suffix <= last && suffixChoices.length < 3;
          suffix += 1) {
        const value = String(suffix).padStart(3, '0');
        if (!usedSuffixes[value]) suffixChoices.push(value);
      }
    }
    if (!suffixChoices.length) {
      throw new Error('No unused member-use suffix remains in the Chart of Accounts.');
    }

    // Accept either "Internet" or a user-entered "R — Internet" without
    // duplicating the member prefix in the saved account name.
    const plainMemberName = name.replace(/^[MASR]\s*[—-]\s*/i, '').trim();
    const memberName = memberLetter + ' — ' + plainMemberName;
    const choices = suffixChoices.map(function(suffix) {
      const visibleCode = '7' + memberLetter + suffix;
      return {
        code: visibleCode,
        exportCode: String(memberBases[entityId] + Number(suffix)),
        name: memberName,
        accountType: 'net-worth',
        parentCode: '7' + memberLetter + '000',
        label: visibleCode + ' — next unused shared member-use suffix'
      };
    });
    return {
      code: choices[0].code,
      exportCode: choices[0].exportCode,
      name: choices[0].name,
      accountType: choices[0].accountType,
      parentCode: choices[0].parentCode,
      choices: choices,
      explanation: nearMatch
        ? 'Suggested after ' + nearCode + '. The suffix is unused for every member, so its meaning remains consistent across 7M, 7A, 7S and 7R. You may choose another suggestion or enter your own valid ACODE.'
        : 'The generic 50000 expense group is not used. Choose a member-use suggestion or enter your own valid member ACODE.'
    };
  }
  if (memberBases[entityId] &&
      (purpose === 'paycheck' || purpose === 'equity')) {
    definition.parent = String(memberBases[entityId]);
    definition.start = memberBases[entityId] + 110;
    definition.end = memberBases[entityId] + 990;
  }

  if (purpose === 'equity' && !memberBases[entityId]) {
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
    if (account.exportCode) used[account.exportCode] = true;
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

  const exportCode = suggestedCode;
  if (['member-m', 'member-a', 'member-s', 'member-r']
      .indexOf(entityId) !== -1) {
    suggestedCode = numericMemberCodeToVisible_(suggestedCode);
    definition.parent = numericMemberCodeToVisible_(definition.parent);
  }

  let suggestedName = name;
  if (purpose === 'bank' && lastFour && name.indexOf('*') === -1) {
    suggestedName += ' * ' + lastFour;
  }

  return {
    code: suggestedCode,
    exportCode: exportCode,
    name: suggestedName,
    accountType: definition.type,
    parentCode: definition.parent,
    explanation: 'Nilavaram selected the next available five-character code and its accounting group. You may review the advanced details before saving.'
  };
}

function getChartOfAccountsData() {
  const user = requireCurrentUser_();
  ensureAccountingFoundation_();
  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_)
    .sort(function(a, b) {
      return String(a.exportCode || a.code)
        .localeCompare(String(b.exportCode || b.code));
    });
  accounts.forEach(function(account) {
    const classification = getAccountClassification_(
      account,
      accounts
    );
    account.displayMark = classification.mark;
    account.displayExplanation = classification.explanation;
    account.isHidden = account.status === 'inactive';
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
    accounts: accounts
  };
}

function setChartAccountVisibility(accountId, visible) {
  const admin = requireAdmin_();
  const account = getDocumentOrNull_('accounts', String(accountId || ''));
  if (!account) throw new Error('The account was not found.');
  const nextStatus = visible ? 'active' : 'inactive';
  firestoreSetDocument_('accountHistory', Utilities.getUuid(), toFirestoreFields_({
    accountId: account.id,
    previousRecord: account,
    changeType: visible ? 'restored' : 'hidden',
    changedBy: admin.email,
    changedAt: new Date()
  }));
  const updated = {};
  Object.keys(account).forEach(function(key) {
    if (key !== 'id') updated[key] = account[key];
  });
  updated.status = nextStatus;
  updated.updatedAt = new Date();
  updated.updatedBy = admin.email;
  firestoreSetDocument_('accounts', account.id, toFirestoreFields_(updated));
  writeAudit_(visible ? 'chart-account-restored' : 'chart-account-hidden',
    admin.email, {accountId: account.id, code: account.code});
  return {success: true, message: visible ? 'Account restored.' : 'Account hidden.'};
}

function setChartAccountsVisibilityBatch(accountIds, visible) {
  requireAdmin_();
  const ids = (accountIds || []).map(String).filter(Boolean);
  if (!ids.length) throw new Error('Select at least one account.');
  if (ids.length > 100) throw new Error('A batch may contain no more than 100 accounts.');
  const results = ids.map(function(id) {
    return setChartAccountVisibility(id, Boolean(visible));
  });
  return {
    success: true,
    count: results.length,
    message: results.length + ' account(s) were ' +
      (visible ? 'restored.' : 'hidden.')
  };
}

function accountReferenceMatches_(record, account) {
  const code = String(account.code || '');
  const id = String(account.id || '');
  return [
    record.accountId,
    record.accountCode,
    record.debitAccountId,
    record.creditAccountId,
    record.debitAccountCode,
    record.creditAccountCode,
    record.counterAccountCode,
    record.bankAccountCode,
    record.suggestedDebitAccountCode,
    record.suggestedCreditAccountCode
  ].some(function(value) {
    const text = String(value || '');
    return text && (text === id || text === code);
  });
}

function summarizeAccountReference_(collection, record) {
  return {
    collection: collection,
    id: String(record.id || record.transactionId || record.sourceRecordId || ''),
    date: String(record.transactionDate || record.date || record.createdAt || ''),
    description: String(record.description || record.payee || record.name ||
      record.matchText || record.ruleName || ''),
    status: String(record.postingStatus || record.accountApprovalStatus ||
      record.status || '')
  };
}

function getChartAccountDeletionReview(accountId) {
  requireAdmin_();
  const account = getDocumentOrNull_('accounts', String(accountId || ''));
  if (!account) throw new Error('The account was not found.');
  const references = [];
  const inspect = function(collection, records, matcher) {
    (records || []).forEach(function(record) {
      if ((matcher || accountReferenceMatches_)(record, account)) {
        references.push(summarizeAccountReference_(collection, record));
      }
    });
  };
  inspect('Child account', firestoreGetCollection_('accounts').map(fromFirestoreDocument_),
    function(record) { return String(record.parentCode || '') === String(account.code || ''); });
  inspect('Transaction', firestoreGetCollection_('transactions').map(fromFirestoreDocument_));
  inspect('Journal line', firestoreGetCollection_('journalLines').map(fromFirestoreDocument_));
  inspect('ACODE rule', firestoreGetCollection_('transactionRules').map(fromFirestoreDocument_));
  inspect('Source input', getSourceRecords_());
  return {
    account: {id: account.id, code: account.code, name: account.name,
      status: account.status},
    canDelete: references.length === 0,
    referenceCount: references.length,
    references: references.slice(0, 200),
    referencesTruncated: references.length > 200
  };
}

function deleteUnusedChartAccount(accountId) {
  const admin = requireAdmin_();
  const review = getChartAccountDeletionReview(accountId);
  if (!review.canDelete) {
    throw new Error(
      'Account ' + review.account.code + ' has ' + review.referenceCount +
      ' reference(s). Reassign them before deletion.'
    );
  }
  const previous = getDocumentOrNull_('accounts', review.account.id);
  firestoreSetDocument_('accountHistory', Utilities.getUuid(), toFirestoreFields_({
    accountId: previous.id,
    previousRecord: previous,
    changeType: 'deleted-unused-account',
    changedBy: admin.email,
    changedAt: new Date()
  }));
  firestoreDeleteDocument_('accounts', previous.id);
  writeAudit_('unused-chart-account-deleted', admin.email, {
    accountId: previous.id,
    code: previous.code,
    name: previous.name
  });
  return {success: true, message: 'Unused account ' + previous.code + ' was deleted.'};
}

function reviewAndDeleteUnusedChartAccountsBatch(accountIds) {
  const admin = requireAdmin_();
  const ids = (accountIds || []).map(String).filter(Boolean);
  if (!ids.length) throw new Error('Select at least one account.');
  if (ids.length > 100) throw new Error('A batch may contain no more than 100 accounts.');

  // Load each source once so a batch review does not repeatedly read OneDrive
  // or Firestore for every selected account.
  const accounts = firestoreGetCollection_('accounts').map(fromFirestoreDocument_);
  const transactions = firestoreGetCollection_('transactions').map(fromFirestoreDocument_);
  const journalLines = firestoreGetCollection_('journalLines').map(fromFirestoreDocument_);
  const rules = firestoreGetCollection_('transactionRules').map(fromFirestoreDocument_);
  const sourceRecords = getSourceRecords_();
  const accountById = {};
  accounts.forEach(function(account) { accountById[account.id] = account; });
  const deleted = [];
  const blocked = [];

  ids.forEach(function(id) {
    const account = accountById[id];
    if (!account) {
      blocked.push({id: id, code: '', name: '', referenceCount: 0,
        reason: 'Account was not found. Refresh Batch Edit.'});
      return;
    }
    const references = [];
    const inspect = function(collection, records, matcher) {
      records.forEach(function(record) {
        if ((matcher || accountReferenceMatches_)(record, account)) {
          references.push(summarizeAccountReference_(collection, record));
        }
      });
    };
    inspect('Child account', accounts, function(record) {
      return record.id !== account.id &&
        String(record.parentCode || '') === String(account.code || '');
    });
    inspect('Transaction', transactions);
    inspect('Journal line', journalLines);
    inspect('ACODE rule', rules);
    inspect('Source input', sourceRecords);
    if (references.length) {
      blocked.push({
        id: account.id,
        code: account.code,
        name: account.name,
        referenceCount: references.length,
        reason: 'Reassign the listed references before deletion.',
        references: references.slice(0, 25),
        referencesTruncated: references.length > 25
      });
      return;
    }
    firestoreSetDocument_('accountHistory', Utilities.getUuid(), toFirestoreFields_({
      accountId: account.id,
      previousRecord: account,
      changeType: 'batch-deleted-unused-account',
      changedBy: admin.email,
      changedAt: new Date()
    }));
    firestoreDeleteDocument_('accounts', account.id);
    writeAudit_('unused-chart-account-batch-deleted', admin.email, {
      accountId: account.id, code: account.code, name: account.name
    });
    deleted.push({id: account.id, code: account.code, name: account.name});
  });
  return {
    success: true,
    deleted: deleted,
    blocked: blocked,
    message: deleted.length + ' unused account(s) deleted; ' +
      blocked.length + ' protected account(s) retained.'
  };
}

function saveChartAccount(input) {
  const admin = requireAdmin_();
  const id = String(input && input.id || '').trim();
  const code = String(input && input.code || '').trim().toUpperCase();
  const name = String(input && input.name || '').trim();
  const entityId = String(input && input.entityId || '').trim();
  const accountType = String(input && input.accountType || '').trim();
  const parentCode = String(input && input.parentCode || '').trim().toUpperCase();
  const status = String(input && input.status || 'active').trim();
  const notes = String(input && input.notes || '').trim();

  if (!isValidAccountCode_(code)) {
    throw new Error(
      'Account code must contain five characters, such as 11110 or 7M020.'
    );
  }
  if (!name) throw new Error('Enter an account name.');
  if (!getDocumentOrNull_('entities', entityId)) {
    throw new Error('Select a valid entity.');
  }
  if (['group', 'asset', 'liability', 'net-worth', 'income', 'expense', 'clearing']
      .indexOf(accountType) === -1) {
    throw new Error('Select a valid account type.');
  }
  if (parentCode && !isValidAccountCode_(parentCode)) {
    throw new Error('Parent code must be blank or contain five characters.');
  }
  if (['active', 'inactive'].indexOf(status) === -1) {
    throw new Error('Select a valid status.');
  }

  if (status === 'active' &&
      (parentCode === '50000' || parentCode === '40000')) {
    throw new Error(
      parentCode + ' is marked NOT USED in the current Nilavaram profile. ' +
      'Use a member-specific 7M/7A/7S/7R account, or configure a separate ' +
      'accounting profile before using this group.'
    );
  }

  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);
  const exportCode = visibleMemberCodeToNumeric_(code);
  const duplicate = accounts.some(function(account) {
    if (account.id === id) return false;
    const existingVisible = String(account.code || '').toUpperCase();
    const existingExport = String(
      account.exportCode || visibleMemberCodeToNumeric_(existingVisible)
    ).toUpperCase();
    return existingVisible === code ||
      existingExport === exportCode ||
      existingVisible === exportCode ||
      existingExport === code;
  });
  if (duplicate) {
    throw new Error(
      'Account code ' + code +
      ' is already in use. Every five-character code must be unique.'
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
    exportCode: exportCode,
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
  if (/^7[MASR]\d{3}$/.test(code)) {
    savedAccount.categoryFamily =
      /(employment|paycheck|deposit|income|receipt)/i.test(name)
        ? 'member-receipt' : 'member-use';
  } else if (previous && previous.categoryFamily) {
    savedAccount.categoryFamily = previous.categoryFamily;
  }
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
