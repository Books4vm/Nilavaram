/**
 * Transactions.js
 * Plain-language transaction entry with reusable suggestion rules.
 */

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
  const user = requireCurrentUser_();
  const amount = Number(input && input.amount);
  const date = String(input && input.date || '').trim();
  const description = String(input && input.description || '').trim();
  const debitCode = String(input && input.debitAccountCode || '').trim();
  const creditCode = String(input && input.creditAccountCode || '').trim();
  const entityId = String(input && input.entityId || '').trim();
  const sourceDocumentName = String(input && input.sourceDocumentName || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Enter the transaction date.');
  if (!(amount > 0)) throw new Error('Enter an amount greater than zero.');
  if (!description) throw new Error('Describe what happened.');
  if (debitCode === creditCode) throw new Error('The two accounting sides cannot use the same account.');

  const accounts = firestoreGetCollection_('accounts')
    .map(fromFirestoreDocument_)
    .filter(function(account) { return account.status === 'active'; });
  const debit = accounts.find(function(account) { return account.code === debitCode; });
  const credit = accounts.find(function(account) { return account.code === creditCode; });
  if (!debit || !credit) throw new Error('Select two active accounts.');

  const id = Utilities.getUuid();
  firestoreSetDocument_('transactions', id, toFirestoreFields_({
    transactionDate: date,
    description: description,
    entityId: entityId,
    amount: amount,
    lines: [
      { side: 'debit', accountId: debit.id, accountCode: debit.code, amount: amount },
      { side: 'credit', accountId: credit.id, accountCode: credit.code, amount: amount }
    ],
    sourceDocumentName: sourceDocumentName,
    status: 'draft',
    reconciliationStatus: 'unreconciled',
    createdBy: user.email,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  writeAudit_('draft-transaction-created', user.email, {
    transactionId: id,
    amount: amount,
    debitAccountCode: debitCode,
    creditAccountCode: creditCode
  });

  return {
    success: true,
    message: 'Draft transaction saved. It is marked Unreconciled and has not been posted.'
  };
}
