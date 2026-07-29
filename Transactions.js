/**
 * Transactions.js
 * Plain-language transaction entry with reusable suggestion rules.
 */

const NILAVARAM_TRANSACTION_SCHEMA_VERSION = 1;

function requireAccountingEditor_() {
  const user = requireCurrentUser_();
  if (['admin', 'editor'].indexOf(user.role) === -1) {
    throw new Error('Admin or Editor permission is required for transactions.');
  }
  return user;
}

function copyRecordWithoutId_(record) {
  const copy = {};
  Object.keys(record || {}).forEach(function(key) {
    if (key !== 'id') copy[key] = record[key];
  });
  return copy;
}

function moneyToCents_(amount) {
  const value = Number(amount);
  if (!isFinite(value) || value <= 0) {
    throw new Error('Enter an amount greater than zero.');
  }
  const cents = Math.round(value * 100);
  if (Math.abs(value - cents / 100) > 0.0000001) {
    throw new Error('Amount may contain no more than two decimal places.');
  }
  return cents;
}

function createTransactionIdentity_() {
  const id = Utilities.getUuid();
  const stamp = Utilities.formatDate(
    new Date(),
    'America/Los_Angeles',
    'yyyyMMdd-HHmmss'
  );
  return {
    id: id,
    number: 'TXN-' + stamp + '-' +
      id.replace(/-/g, '').slice(0, 6).toUpperCase()
  };
}

function buildDraftJournalLine_(transaction, lineNumber, side, account,
    amountCents, entityId, userEmail) {
  const lineId = transaction.id + '-L' + String(lineNumber).padStart(3, '0');
  return {
    id: lineId,
    record: {
      schemaVersion: NILAVARAM_TRANSACTION_SCHEMA_VERSION,
      lineId: lineId,
      transactionId: transaction.id,
      transactionNumber: transaction.number,
      lineNumber: lineNumber,
      side: side,
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      entityId: entityId,
      currency: 'USD',
      amountCents: amountCents,
      debitCents: side === 'debit' ? amountCents : 0,
      creditCents: side === 'credit' ? amountCents : 0,
      status: 'draft',
      createdBy: userEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
}

function setupTransactionFoundation_() {
  createIfMissing_('transactionRules', 'ctu-paycheck-m', {
    name: 'M - CTU Paycheck',
    matchText: ['CTU', 'CTU PAYROLL', 'CTU PAYCHECK'],
    transactionType: 'paycheck',
    memberEntityId: 'member-m',
    debitAccountCode: '11110',
    creditAccountCode: '7M110',
    status: 'active',
    confidence: 'approved-example'
  });
}

function findTransactionSuggestion(description) {
  requireCurrentUser_();
  ensureAccountingFoundation_();
  setupTransactionFoundation_();
  const text = String(description || '').trim().toUpperCase();
  if (!text) return null;

  const rules = firestoreGetCollection_('transactionRules')
    .map(fromFirestoreDocument_)
    .filter(function(rule) { return rule.status === 'active'; });

  const rule = rules.find(function(candidate) {
    return (candidate.matchText || []).some(function(match) {
      return text.indexOf(String(match).toUpperCase()) !== -1;
    });
  });
  if (rule) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      transactionType: rule.transactionType,
      memberEntityId: rule.memberEntityId,
      debitAccountCode: rule.debitAccountCode,
      creditAccountCode: rule.creditAccountCode,
      explanation: 'This matches the previously approved pattern: ' + rule.name + '. Please review before saving.'
    };
  }

  const prior = firestoreGetCollection_('transactions')
    .map(fromFirestoreDocument_)
    .filter(function(transaction) {
      const approved = transaction.status === 'posted' ||
        transaction.reconciliationStatus === 'reconciled';
      const priorText = String(transaction.description || '').toUpperCase();
      return approved && priorText &&
        (text.indexOf(priorText) !== -1 || priorText.indexOf(text) !== -1);
    })
    .sort(function(a, b) {
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    })[0];

  if (!prior || !prior.lines || prior.lines.length !== 2) return null;
  const debitLine = prior.lines.find(function(line) { return line.side === 'debit'; });
  const creditLine = prior.lines.find(function(line) { return line.side === 'credit'; });
  if (!debitLine || !creditLine) return null;

  return {
    ruleId: '',
    ruleName: prior.description,
    transactionType: 'other',
    memberEntityId: prior.entityId,
    debitAccountCode: debitLine.accountCode,
    creditAccountCode: creditLine.accountCode,
    explanation: 'A reconciled or posted transaction used this pattern before. Please review the suggestion before saving.'
  };
}

function getSimpleTransactionSetup() {
  requireCurrentUser_();
  ensureAccountingFoundation_();
  setupTransactionFoundation_();
  const allAccounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_);
  const parentCodes = {};
  allAccounts.forEach(function(account) {
    if (account.status === 'active' && account.parentCode) {
      parentCodes[account.parentCode] = true;
    }
  });
  return {
    entities: firestoreGetCollection_('entities')
      .map(fromFirestoreDocument_)
      .filter(function(entity) { return entity.status === 'active'; })
      .sort(function(a, b) { return a.name.localeCompare(b.name); }),
    accounts: allAccounts
      .filter(function(account) {
        return account.status === 'active' &&
          account.accountType !== 'group' &&
          !parentCodes[account.code];
      })
      .sort(function(a, b) {
        return String(a.exportCode || a.code)
          .localeCompare(String(b.exportCode || b.code));
      })
  };
}

function saveSimpleTransaction(input) {
  const user = requireAccountingEditor_();
  const amountCents = moneyToCents_(input && input.amount);
  const amount = amountCents / 100;
  const date = String(input && input.date || '').trim();
  const description = String(input && input.description || '').trim();
  const debitCode = String(input && input.debitAccountCode || '').trim();
  const creditCode = String(input && input.creditAccountCode || '').trim();
  const entityId = String(input && input.entityId || '').trim();
  const sourceDocumentName = String(input && input.sourceDocumentName || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Enter the transaction date.');
  if (!description) throw new Error('Describe what happened.');
  if (debitCode === creditCode) throw new Error('The two accounting sides cannot use the same account.');

  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_)
    .filter(function(account) { return account.status === 'active'; });
  const parentCodes = {};
  accounts.forEach(function(account) {
    if (account.parentCode) parentCodes[account.parentCode] = true;
  });
  const debit = accounts.find(function(account) { return account.code === debitCode; });
  const credit = accounts.find(function(account) { return account.code === creditCode; });
  if (!debit || !credit) throw new Error('Select two active accounts.');
  [debit, credit].forEach(function(account) {
    if (account.accountType === 'group' || parentCodes[account.code]) {
      throw new Error(
        'Account ' + account.code +
        ' is a heading or subgroup and cannot receive a transaction.'
      );
    }
  });
  const entity = getDocumentOrNull_('entities', entityId);
  if (!entity || entity.status !== 'active') {
    throw new Error('Select an active member, trust or entity.');
  }

  const transaction = createTransactionIdentity_();
  const debitLine = buildDraftJournalLine_(
    transaction, 1, 'debit', debit, amountCents, entityId, user.email
  );
  const creditLine = buildDraftJournalLine_(
    transaction, 2, 'credit', credit, amountCents, entityId, user.email
  );
  const createdAt = new Date();
  const header = {
    schemaVersion: NILAVARAM_TRANSACTION_SCHEMA_VERSION,
    transactionId: transaction.id,
    transactionNumber: transaction.number,
    transactionDate: date,
    description: description,
    entityId: entityId,
    currency: 'USD',
    amount: amount,
    amountCents: amountCents,
    sourceType: 'manual',
    lineCount: 2,
    totalDebitCents: amountCents,
    totalCreditCents: amountCents,
    balanced: true,
    lines: [
      {
        lineId: debitLine.id,
        side: 'debit',
        accountId: debit.id,
        accountCode: debit.code,
        amount: amount,
        amountCents: amountCents
      },
      {
        lineId: creditLine.id,
        side: 'credit',
        accountId: credit.id,
        accountCode: credit.code,
        amount: amount,
        amountCents: amountCents
      }
    ],
    sourceDocumentName: sourceDocumentName,
    documentIds: [],
    documentStatus: sourceDocumentName ? 'named-not-linked' : 'missing',
    status: 'draft',
    postingStatus: 'unposted',
    reconciliationStatus: 'unreconciled',
    createdBy: user.email,
    createdAt: createdAt,
    updatedAt: createdAt
  };

  firestoreCommitDocuments_([
    {
      collection: 'transactions',
      id: transaction.id,
      fields: toFirestoreFields_(header)
    },
    {
      collection: 'journalLines',
      id: debitLine.id,
      fields: toFirestoreFields_(debitLine.record)
    },
    {
      collection: 'journalLines',
      id: creditLine.id,
      fields: toFirestoreFields_(creditLine.record)
    }
  ]);
  writeAudit_('draft-transaction-created', user.email, {
    transactionId: transaction.id,
    transactionNumber: transaction.number,
    schemaVersion: NILAVARAM_TRANSACTION_SCHEMA_VERSION,
    amount: amount,
    amountCents: amountCents,
    debitAccountCode: debitCode,
    creditAccountCode: creditCode
  });

  return {
    success: true,
    transactionId: transaction.id,
    transactionNumber: transaction.number,
    message: 'Draft ' + transaction.number +
      ' saved with two balanced journal lines. It is Unreconciled and not posted.'
  };
}

function loadTransactionJournalLines_(transaction) {
  const lines = Array.isArray(transaction.lines) ? transaction.lines : [];
  if (!lines.length || lines.length !== Number(transaction.lineCount || 0)) {
    throw new Error('The transaction journal-line index is incomplete.');
  }
  return lines.map(function(indexedLine) {
    const lineId = String(indexedLine.lineId || '');
    if (!lineId) {
      throw new Error(
        'This draft uses an older structure and requires controlled migration.'
      );
    }
    const line = getDocumentOrNull_('journalLines', lineId);
    if (!line || line.transactionId !== transaction.id) {
      throw new Error('A required journal line is missing or incorrectly linked.');
    }
    return line;
  });
}

function validateDraftForPosting_(transaction, journalLines) {
  if (Number(transaction.schemaVersion) !==
      NILAVARAM_TRANSACTION_SCHEMA_VERSION) {
    throw new Error('The transaction schema requires controlled migration.');
  }
  if (transaction.status !== 'draft' ||
      transaction.postingStatus !== 'unposted') {
    throw new Error('Only an unposted draft can be posted.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction.transactionDate)) {
    throw new Error('The transaction date is invalid.');
  }
  if (!String(transaction.description || '').trim()) {
    throw new Error('The transaction description is missing.');
  }
  const entity = getDocumentOrNull_('entities', transaction.entityId);
  if (!entity || entity.status !== 'active') {
    throw new Error('The member, trust or entity is no longer active.');
  }

  const activeAccounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_)
    .filter(function(account) { return account.status === 'active'; });
  const accountById = {};
  const parentCodes = {};
  activeAccounts.forEach(function(account) {
    accountById[account.id] = account;
    if (account.parentCode) parentCodes[account.parentCode] = true;
  });

  let totalDebitCents = 0;
  let totalCreditCents = 0;
  const seenLineIds = {};
  journalLines.forEach(function(line) {
    if (seenLineIds[line.id]) throw new Error('A journal line is duplicated.');
    seenLineIds[line.id] = true;
    if (line.status !== 'draft') {
      throw new Error('Every journal line must still be a draft.');
    }
    if (!Number.isInteger(line.amountCents) || line.amountCents <= 0) {
      throw new Error('Every journal line must have a positive cent amount.');
    }
    const account = accountById[line.accountId];
    if (!account || account.code !== line.accountCode) {
      throw new Error(
        'Journal account ' + String(line.accountCode || '') +
        ' is inactive or no longer matches the Chart of Accounts.'
      );
    }
    if (account.accountType === 'group' || parentCodes[account.code]) {
      throw new Error(
        'Account ' + account.code +
        ' is a heading or subgroup and cannot be posted.'
      );
    }
    if (line.side === 'debit' &&
        line.debitCents === line.amountCents &&
        Number(line.creditCents || 0) === 0) {
      totalDebitCents += line.amountCents;
      return;
    }
    if (line.side === 'credit' &&
        line.creditCents === line.amountCents &&
        Number(line.debitCents || 0) === 0) {
      totalCreditCents += line.amountCents;
      return;
    }
    throw new Error('A journal line has an invalid debit or credit direction.');
  });

  if (totalDebitCents <= 0 || totalDebitCents !== totalCreditCents) {
    throw new Error('Total debits must equal total credits before posting.');
  }
  if (totalDebitCents !== Number(transaction.amountCents) ||
      totalDebitCents !== Number(transaction.totalDebitCents) ||
      totalCreditCents !== Number(transaction.totalCreditCents)) {
    throw new Error('The transaction header does not match its journal lines.');
  }
  return {
    totalDebitCents: totalDebitCents,
    totalCreditCents: totalCreditCents
  };
}

/**
 * Posts one balanced draft exactly once. A repeat call is idempotent.
 */
function postTransaction(transactionId) {
  const user = requireAccountingEditor_();
  const id = String(transactionId || '').trim();
  if (!id) throw new Error('Transaction ID is required.');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Another posting is in progress. Please try again.');
  }
  try {
    const transaction = getDocumentOrNull_('transactions', id);
    if (!transaction) throw new Error('The transaction was not found.');
    if (transaction.status === 'posted' &&
        transaction.postingStatus === 'posted') {
      return {
        success: true,
        alreadyPosted: true,
        transactionId: transaction.id,
        transactionNumber: transaction.transactionNumber,
        message: transaction.transactionNumber + ' was already posted.'
      };
    }

    const journalLines = loadTransactionJournalLines_(transaction);
    const totals = validateDraftForPosting_(transaction, journalLines);
    const postedAt = new Date();
    const updatedTransaction = copyRecordWithoutId_(transaction);
    updatedTransaction.status = 'posted';
    updatedTransaction.postingStatus = 'posted';
    updatedTransaction.balanced = true;
    updatedTransaction.totalDebitCents = totals.totalDebitCents;
    updatedTransaction.totalCreditCents = totals.totalCreditCents;
    updatedTransaction.postedBy = user.email;
    updatedTransaction.postedAt = postedAt;
    updatedTransaction.updatedAt = postedAt;
    updatedTransaction.lines = updatedTransaction.lines.map(function(line) {
      const updated = copyRecordWithoutId_(line);
      updated.status = 'posted';
      return updated;
    });

    const writes = [{
      collection: 'transactions',
      id: transaction.id,
      fields: toFirestoreFields_(updatedTransaction)
    }];
    journalLines.forEach(function(line) {
      const updatedLine = copyRecordWithoutId_(line);
      updatedLine.status = 'posted';
      updatedLine.postedBy = user.email;
      updatedLine.postedAt = postedAt;
      updatedLine.updatedAt = postedAt;
      writes.push({
        collection: 'journalLines',
        id: line.id,
        fields: toFirestoreFields_(updatedLine)
      });
    });
    firestoreCommitDocuments_(writes);

    writeAudit_('transaction-posted', user.email, {
      transactionId: transaction.id,
      transactionNumber: transaction.transactionNumber,
      totalDebitCents: totals.totalDebitCents,
      totalCreditCents: totals.totalCreditCents,
      reconciliationStatus: transaction.reconciliationStatus
    });

    return {
      success: true,
      alreadyPosted: false,
      transactionId: transaction.id,
      transactionNumber: transaction.transactionNumber,
      reconciliationStatus: transaction.reconciliationStatus,
      message: transaction.transactionNumber +
        ' posted successfully. It remains Unreconciled.'
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Saves a recoverable draft and immediately attempts to post it.
 */
function saveAndPostSimpleTransaction(input) {
  requireAccountingEditor_();
  throw new Error(
    'The former quick-post screen has been retired. Use the Transaction ' +
    'Workbench so evidence, reconciliation and rule approval are recorded.'
  );
}
