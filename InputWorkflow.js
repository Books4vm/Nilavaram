/**
 * InputWorkflow.js
 * End-user input, batch reconciliation and ACODE assignment workspace.
 */

const NILAVARAM_INPUT_WORKFLOW_VERSION = '2026-08-08.1';

function shortInstitutionName_(record) {
  const value = String(record.sourceFinancialInstitution || '').toLowerCase();
  if (value.indexOf('bank of america') !== -1) return 'BOA';
  if (value.indexOf('wells fargo') !== -1) return 'WF';
  if (value.indexOf('space coast') !== -1) return 'SCCU';
  if (value.indexOf('boeing') !== -1 || value.indexOf('becu') !== -1) return 'BECU';
  if (value.indexOf('bank of baroda') !== -1) return 'BoB Mylapore';
  if (value.indexOf('mikomo') !== -1) return 'Akoya Mikomo';
  return String(record.sourceFinancialInstitution || record.sourceProvider || 'Source');
}

function lastFourAccount_(record) {
  const display = String(record.sourceAccountDisplay || '');
  const displayMatch = display.match(/([A-Za-z0-9]{4})\s*$/);
  if (displayMatch) return displayMatch[1];
  const id = String(record.sourceAccountId || '');
  return id.slice(-4) || '----';
}

function sourceProofLabel_(record) {
  const prefix = record.sourceProvider === 'akoya' ? 'Akoya API ' : '';
  return prefix + shortInstitutionName_(record) + ' ACCT# ' +
    lastFourAccount_(record);
}

function getInputWorkspace() {
  const data = getTransactionWorkbench();
  const groupsByKey = {};
  data.sourceRecords.forEach(function(record) {
    const key = [
      record.sourceProvider || record.sourceType || 'manual',
      record.sourceEnvironment || 'live',
      record.sourceAccountId || record.sourceBatchId || 'unassigned'
    ].join('|');
    if (!groupsByKey[key]) {
      groupsByKey[key] = {
        key: key,
        provider: record.sourceProvider || record.sourceType || 'file',
        environment: record.sourceEnvironment || 'live',
        sourceAccountId: record.sourceAccountId || '',
        sourceAccountDisplay: record.sourceAccountDisplay || 'Unassigned source',
        proofLabel: sourceProofLabel_(record),
        recordCount: 0,
        receiptCents: 0,
        paymentCents: 0,
        reconciledCount: 0,
        acodeApprovedCount: 0,
        records: []
      };
    }
    const group = groupsByKey[key];
    const direction = bankDirection_(record);
    const view = copyRecordWithoutId_(record);
    view.id = record.id;
    view.direction = direction;
    view.proofLabel = sourceProofLabel_(record);
    view.receiptCents = direction === 'money-in' ? Number(record.amountCents || 0) : 0;
    view.paymentCents = direction === 'money-out' ? Number(record.amountCents || 0) : 0;
    view.externalBalanceCents = record.externalRunningBalanceCents == null
      ? null : Number(record.externalRunningBalanceCents);
    group.records.push(view);
    group.recordCount += 1;
    group.receiptCents += view.receiptCents;
    group.paymentCents += view.paymentCents;
    if (record.reconciliationStatus === 'reconciled') group.reconciledCount += 1;
    if (record.accountApprovalStatus === 'approved') group.acodeApprovedCount += 1;
  });
  const groups = Object.keys(groupsByKey).map(function(key) {
    const group = groupsByKey[key];
    group.records.sort(function(a, b) {
      return String(a.transactionDate || '').localeCompare(String(b.transactionDate || '')) ||
        String(a.sourceRecordNumber || '').localeCompare(String(b.sourceRecordNumber || ''));
    });
    group.reconciliationStatus = group.reconciledCount === group.recordCount
      ? 'reconciled' : 'pending';
    group.acodeStatus = group.acodeApprovedCount === group.recordCount
      ? 'complete' : 'pending';
    return group;
  }).sort(function(a, b) {
    return a.proofLabel.localeCompare(b.proofLabel);
  });
  const setup = getSimpleTransactionSetup();
  return {
    version: NILAVARAM_INPUT_WORKFLOW_VERSION,
    postingEnabled: false,
    groups: groups,
    accounts: setup.accounts,
    entities: setup.entities,
    rules: data.rules,
    counts: data.counts
  };
}

function centsFromSignedInput_(value, label) {
  const amount = Number(value);
  if (!isFinite(amount)) throw new Error((label || 'Amount') + ' is invalid.');
  const cents = Math.round(amount * 100);
  if (Math.abs(amount - cents / 100) > 0.0000001) {
    throw new Error((label || 'Amount') + ' may contain only two decimals.');
  }
  return cents;
}

function saveSourceBatchReconciliation(input) {
  const user = requireAccountingEditor_();
  const ids = Array.isArray(input && input.sourceRecordIds)
    ? input.sourceRecordIds.map(String) : [];
  if (!ids.length) throw new Error('The reconciliation batch is empty.');
  if (!input.confirmAll) {
    throw new Error('Confirm that every displayed transaction was reviewed.');
  }
  const openingCents = centsFromSignedInput_(input.openingBalance, 'Opening balance');
  const externalEndingCents = centsFromSignedInput_(
    input.externalEndingBalance, 'External ending balance'
  );
  const all = firestoreGetCollection_('sourceRecords').map(fromFirestoreDocument_);
  const byId = {};
  all.forEach(function(record) { byId[record.id] = record; });
  const records = ids.map(function(id) {
    if (!byId[id]) throw new Error('A selected source record was not found.');
    return byId[id];
  });
  const groupKey = [records[0].sourceProvider, records[0].sourceEnvironment,
    records[0].sourceAccountId].join('|');
  const duplicateKeys = {};
  let receipts = 0;
  let payments = 0;
  records.forEach(function(record) {
    const key = [record.sourceProvider, record.sourceEnvironment,
      record.sourceAccountId].join('|');
    if (key !== groupKey) throw new Error('One reconciliation may contain only one source account.');
    if (duplicateKeys[record.externalSourceKey]) {
      throw new Error('A duplicate source transaction is present in the batch.');
    }
    duplicateKeys[record.externalSourceKey] = true;
    const direction = bankDirection_(record);
    if (direction === 'money-in') receipts += Number(record.amountCents || 0);
    else if (direction === 'money-out') payments += Number(record.amountCents || 0);
    else throw new Error('A transaction has no reliable receipt/payment direction.');
  });
  const systemEndingCents = openingCents + receipts - payments;
  const differenceCents = externalEndingCents - systemEndingCents;
  if (differenceCents !== 0) {
    return {
      success: false,
      status: 'difference',
      receiptCents: receipts,
      paymentCents: payments,
      systemEndingCents: systemEndingCents,
      externalEndingCents: externalEndingCents,
      differenceCents: differenceCents,
      message: 'Red: external ending balance and system ending balance do not agree.'
    };
  }
  const now = new Date();
  const writes = records.map(function(record) {
    const updated = copyRecordWithoutId_(record);
    updated.reconciliationStatus = 'reconciled';
    updated.batchOpeningBalanceCents = openingCents;
    updated.batchReceiptCents = receipts;
    updated.batchPaymentCents = payments;
    updated.systemEndingBalanceCents = systemEndingCents;
    updated.externalEndingBalanceCents = externalEndingCents;
    updated.reconciliationDifferenceCents = 0;
    updated.reconciledBy = user.email;
    updated.reconciledAt = now;
    updated.alertLevel = updated.accountApprovalStatus === 'approved' ? 'none' : 'red';
    updated.alertMessage = updated.accountApprovalStatus === 'approved'
      ? '' : 'Reconciliation passed; ACODE assignment remains pending.';
    updated.updatedAt = now;
    return {collection: 'sourceRecords', id: record.id,
      fields: toFirestoreFields_(updated)};
  });
  for (let index = 0; index < writes.length; index += 400) {
    firestoreCommitDocuments_(writes.slice(index, index + 400));
  }
  writeAudit_('source-account-batch-reconciled', user.email, {
    groupKey: groupKey,
    recordCount: records.length,
    openingBalanceCents: openingCents,
    receiptCents: receipts,
    paymentCents: payments,
    externalEndingBalanceCents: externalEndingCents,
    differenceCents: 0
  });
  return {
    success: true,
    status: 'reconciled',
    recordCount: records.length,
    systemEndingCents: systemEndingCents,
    externalEndingCents: externalEndingCents,
    differenceCents: 0,
    message: 'Green: the batch is reviewed and reconciled. ACODE assignment remains separate.'
  };
}

function saveSourceBatchAcodeAssignments(input) {
  const user = requireAccountingEditor_();
  const assignments = Array.isArray(input && input.assignments)
    ? input.assignments : [];
  if (!assignments.length) throw new Error('No ACODE assignments were supplied.');
  if (!input.confirmAll) throw new Error('Confirm the complete ACODE review before saving.');
  const records = firestoreGetCollection_('sourceRecords').map(fromFirestoreDocument_);
  const byId = {};
  records.forEach(function(record) { byId[record.id] = record; });
  const accounts = getSimpleTransactionSetup().accounts;
  const accountsByCode = {};
  accounts.forEach(function(account) { accountsByCode[account.code] = account; });
  const activeRules = firestoreGetCollection_('transactionRules')
    .map(fromFirestoreDocument_)
    .filter(function(rule) { return rule.status === 'active'; });
  const priorPatterns = getPriorApprovedPatterns_(records);
  const now = new Date();
  const writes = [];
  let createdRules = 0;
  assignments.forEach(function(assignment) {
    const id = String(assignment.sourceRecordId || '');
    const record = byId[id];
    if (!record) throw new Error('A selected source record was not found.');
    const counterCode = String(assignment.counterAccountCode || '');
    if (!accountsByCode[counterCode]) {
      throw new Error('Select an active ACODE for ' + record.sourceRecordNumber + '.');
    }
    const suggestion = accountRuleSuggestion_(
      record, activeRules, accountsByCode, priorPatterns
    );
    const direction = bankDirection_(record);
    if (direction === 'unknown') throw new Error('Direction requires review for ' + record.sourceRecordNumber + '.');
    const bankCode = String(suggestion.bankAccountCode || '');
    if (!bankCode || !accountsByCode[bankCode] || bankCode === counterCode) {
      throw new Error('The bank-side ACODE is missing or conflicts for ' + record.sourceRecordNumber + '.');
    }
    const updated = copyRecordWithoutId_(record);
    updated.bankAccountCode = bankCode;
    updated.debitAccountCode = direction === 'money-out' ? counterCode : bankCode;
    updated.creditAccountCode = direction === 'money-out' ? bankCode : counterCode;
    updated.suggestedDebitAccountCode = suggestion.debitAccountCode || '';
    updated.suggestedCreditAccountCode = suggestion.creditAccountCode || '';
    updated.ruleId = suggestion.ruleId || '';
    updated.ruleVersion = suggestion.ruleId ? 1 : 0;
    updated.ruleMatchReason = suggestion.reason || 'User ACODE selection';
    updated.ruleConfidence = Number(suggestion.confidence || 0);
    updated.ruleSuggestionChanged = counterCode !== String(suggestion.counterAccountCode || '');
    updated.ruleChangeReason = updated.ruleSuggestionChanged
      ? String(assignment.changeReason || 'User changed or supplied ACODE during batch review.') : '';
    updated.accountApprovalStatus = 'approved';
    updated.accountApprovedBy = user.email;
    updated.accountApprovedAt = now;
    updated.postingStatus = 'ready-not-posted';
    updated.alertLevel = updated.reconciliationStatus === 'reconciled' ? 'none' : 'red';
    updated.alertMessage = updated.reconciliationStatus === 'reconciled'
      ? '' : 'ACODE approved; reconciliation remains pending.';
    updated.updatedAt = now;
    writes.push({collection: 'sourceRecords', id: id,
      fields: toFirestoreFields_(updated)});

    if (assignment.createRule) {
      const matchText = String(assignment.ruleText || record.description || '').trim();
      if (!matchText) throw new Error('Rule text is required.');
      const ruleId = 'bank-rule-' + Utilities.getUuid();
      const rule = {
        ruleId: ruleId,
        name: String(assignment.ruleName || ('Rule - ' + matchText)).trim(),
        version: 1,
        priority: Number(assignment.priority || 50),
        direction: direction,
        transactionType: direction === 'money-in' ? 'receipt' : 'payment',
        matchField: 'description',
        matchOperator: String(assignment.operator || 'contains'),
        matchText: [matchText],
        debitAccountCode: updated.debitAccountCode,
        creditAccountCode: updated.creditAccountCode,
        counterAccountCode: counterCode,
        bankAccountCode: bankCode,
        matchReason: 'User-created ACODE rule during batch review: ' + matchText,
        confidence: assignment.operator === 'exactly' ? 95 : 90,
        autoPost: false,
        status: 'active',
        approvedBy: user.email,
        approvedAt: now,
        createdAt: now,
        updatedAt: now
      };
      writes.push({collection: 'transactionRules', id: ruleId,
        fields: toFirestoreFields_(rule)});
      createdRules += 1;
    }
  });
  for (let index = 0; index < writes.length; index += 400) {
    firestoreCommitDocuments_(writes.slice(index, index + 400));
  }
  writeAudit_('source-account-batch-acode-approved', user.email, {
    assignmentCount: assignments.length,
    createdRuleCount: createdRules,
    postingStatus: 'ready-not-posted'
  });
  return {
    success: true,
    assignmentCount: assignments.length,
    createdRuleCount: createdRules,
    message: assignments.length + ' ACODE assignments saved; ' +
      createdRules + ' rules created. Nothing was posted.'
  };
}

function saveMultiLineJournalDraft(input) {
  const user = requireAccountingEditor_();
  const date = String(input && input.date || '').trim();
  const description = String(input && input.description || '').trim();
  const entityId = String(input && input.entityId || '').trim();
  const evidenceName = String(input && input.evidenceName || '').trim();
  const fileHash = String(input && input.fileHash || '').toLowerCase();
  const auditNote = String(input && input.auditNote || '').trim();
  const lines = Array.isArray(input && input.lines) ? input.lines : [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Enter the journal date.');
  if (!description || !auditNote) throw new Error('Description and audit note are required.');
  if (!evidenceName || !/^[a-f0-9]{64}$/.test(fileHash)) {
    throw new Error('Attach evidence so its SHA-256 identity can be recorded.');
  }
  if (lines.length < 2) throw new Error('A journal requires at least two rows.');
  const setup = getSimpleTransactionSetup();
  const accounts = {};
  setup.accounts.forEach(function(account) { accounts[account.code] = account; });
  const entity = getDocumentOrNull_('entities', entityId);
  if (!entity || entity.status !== 'active') throw new Error('Select an active entity.');
  let totalDebitCents = 0;
  let totalCreditCents = 0;
  const cleanLines = lines.map(function(line, index) {
    const code = String(line.accountCode || '');
    if (!accounts[code]) throw new Error('Select an active ACODE on journal row ' + (index + 1) + '.');
    const debit = line.debit === '' ? 0 : centsFromSignedInput_(line.debit, 'Debit');
    const credit = line.credit === '' ? 0 : centsFromSignedInput_(line.credit, 'Credit');
    if ((debit > 0) === (credit > 0)) {
      throw new Error('Journal row ' + (index + 1) + ' must contain either a debit or a credit.');
    }
    totalDebitCents += debit;
    totalCreditCents += credit;
    return {account: accounts[code], side: debit > 0 ? 'debit' : 'credit',
      amountCents: debit || credit, memo: String(line.memo || '')};
  });
  if (totalDebitCents <= 0 || totalDebitCents !== totalCreditCents) {
    throw new Error('Total Debit must equal Total Credit before saving.');
  }
  const identity = createTransactionIdentity_();
  const now = new Date();
  const writes = [];
  const lineIndex = [];
  cleanLines.forEach(function(line, index) {
    const built = buildDraftJournalLine_(identity, index + 1, line.side,
      line.account, line.amountCents, entityId, user.email);
    built.record.memo = line.memo;
    writes.push({collection: 'journalLines', id: built.id,
      fields: toFirestoreFields_(built.record)});
    lineIndex.push({lineId: built.id, side: line.side,
      accountId: line.account.id, accountCode: line.account.code,
      amountCents: line.amountCents, amount: line.amountCents / 100});
  });
  const header = {
    schemaVersion: NILAVARAM_TRANSACTION_SCHEMA_VERSION,
    transactionId: identity.id,
    transactionNumber: identity.number,
    transactionDate: date,
    description: description,
    entityId: entityId,
    currency: 'USD',
    amount: totalDebitCents / 100,
    amountCents: totalDebitCents,
    sourceType: 'manual-journal-entry',
    entryPurpose: 'journal',
    lineCount: cleanLines.length,
    totalDebitCents: totalDebitCents,
    totalCreditCents: totalCreditCents,
    balanced: true,
    lines: lineIndex,
    evidenceName: evidenceName,
    fileHashAlgorithm: 'SHA-256',
    fileHash: fileHash,
    storageReference: String(input.storageReference || ''),
    auditNote: auditNote,
    documentStatus: 'verified-metadata',
    status: 'draft',
    postingStatus: 'verification-hold',
    reconciliationStatus: 'unreconciled',
    createdBy: user.email,
    createdAt: now,
    updatedAt: now
  };
  writes.unshift({collection: 'transactions', id: identity.id,
    fields: toFirestoreFields_(header)});
  firestoreCommitDocuments_(writes);
  writeAudit_('multi-line-journal-draft-created', user.email, {
    transactionId: identity.id,
    lineCount: cleanLines.length,
    totalDebitCents: totalDebitCents,
    fileHash: fileHash,
    auditNote: auditNote
  });
  return {success: true, transactionId: identity.id,
    message: identity.number + ' saved as a balanced draft on verification hold.'};
}
