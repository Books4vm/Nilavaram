/**
 * TransactionWorkbench.js
 * Controlled source-to-books intake, reconciliation and rule approval.
 */

const NILAVARAM_WORKBENCH_SCHEMA_VERSION = 1;

function normalizeWorkbenchMoney_(value, label, allowZero) {
  const number = Number(value);
  if (!isFinite(number) || (!allowZero && number <= 0)) {
    throw new Error((label || 'Amount') + ' is invalid.');
  }
  const cents = Math.round(number * 100);
  if (Math.abs(number - cents / 100) > 0.0000001) {
    throw new Error((label || 'Amount') + ' may contain only two decimals.');
  }
  return cents;
}

function workbenchStatus_(record) {
  const evidencePassed = record.evidenceStatus === 'verified';
  const reconciliationPassed =
    record.reconciliationStatus === 'reconciled' ||
    record.reconciliationStatus === 'matched-existing';
  const accountPassed = record.accountApprovalStatus === 'approved';
  return {
    evidence: evidencePassed ? 'passed' : 'review',
    reconciliation: reconciliationPassed ? 'passed' : 'review',
    accountAssignment: accountPassed ? 'passed' : 'review',
    readyToPost: evidencePassed && accountPassed,
    fullyReconciled: reconciliationPassed
  };
}

function setupTransactionWorkbench_() {
  createIfMissing_('transactionRules', 'ctu-paycheck-m', {
    ruleId: 'ctu-paycheck-m',
    name: 'M - CTU Paycheck',
    version: 1,
    matchText: ['CTU', 'CTU PAYROLL', 'CTU PAYCHECK'],
    transactionType: 'receipt',
    memberEntityId: 'member-m',
    debitAccountCode: '11110',
    creditAccountCode: '7M110',
    matchReason: 'Approved payee/description pattern',
    confidence: 100,
    status: 'active',
    approvedBy: 'initial-accounting-design',
    approvedAt: new Date()
  });
}

function getTransactionWorkbench() {
  requireCurrentUser_();
  ensureAccountingFoundation_();
  setupTransactionWorkbench_();
  const sourceRecords = firestoreGetCollection_('sourceRecords')
    .map(fromFirestoreDocument_)
    .sort(function(a, b) {
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    })
    .slice(0, 100)
    .map(function(record) {
      record.controls = workbenchStatus_(record);
      return record;
    });
  const rules = firestoreGetCollection_('transactionRules')
    .map(fromFirestoreDocument_)
    .filter(function(rule) { return rule.status === 'active'; })
    .sort(function(a, b) { return String(a.name).localeCompare(String(b.name)); });
  return {
    policyVersion: '2026-07-28.1',
    postingEnabled: false,
    lockedRules: [
      'Downloaded/imported records remain outside the books until matched or approved as new.',
      'External proof is preferred; manual and correction input must be a Journal Entry with evidence and audit notes.',
      'Reconciliation is mandatory input validation and must disclose duplicates, missing items and differences.',
      'A reconciliation is complete only when adjusted external balance minus adjusted book balance equals $0.00.',
      'Non-zero differences and incomplete controls display red review alerts and are never forced.',
      'Account suggestions require user confirmation and preserve the complete rule decision trail.',
      'A material or uncertain correction should be reviewed by a qualified CPA and entered as a separate Journal Entry.',
      'A green check means a recorded control passed; red means review is required.'
    ],
    sourceRecords: sourceRecords,
    rules: rules,
    counts: {
      total: sourceRecords.length,
      redReview: sourceRecords.filter(function(r) {
        return !r.controls.readyToPost || !r.controls.fullyReconciled;
      }).length,
      ready: sourceRecords.filter(function(r) {
        return r.controls.readyToPost;
      }).length
    },
    formulas: {
      reconciliation:
        'Adjusted external balance - Adjusted book balance = $0.00'
    }
  };
}

function registerSourceRecord(input) {
  const user = requireAccountingEditor_();
  const sourceType = String(input && input.sourceType || '').trim();
  const allowedSources = ['bank-download', 'csv', 'pdf', 'image'];
  if (allowedSources.indexOf(sourceType) === -1) {
    throw new Error('Select bank download, CSV, PDF or image.');
  }
  const date = String(input && input.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Enter the source transaction date.');
  }
  const amountCents = normalizeWorkbenchMoney_(input.amount, 'Amount', false);
  const description = String(input && input.description || '').trim();
  const evidenceName = String(input && input.evidenceName || '').trim();
  const fileHash = String(input && input.fileHash || '').trim().toLowerCase();
  const storageReference =
    String(input && input.storageReference || '').trim();
  const externalReference =
    String(input && input.externalReference || '').trim();
  if (!description) throw new Error('Enter the source description.');
  if (!evidenceName) throw new Error('Select or identify the source evidence.');
  if (!/^[a-f0-9]{64}$/.test(fileHash)) {
    throw new Error('The evidence SHA-256 file hash is required.');
  }
  if (!storageReference) {
    throw new Error('Enter the external HDD or OneDrive storage reference.');
  }

  const existing = firestoreGetCollection_('sourceRecords')
    .map(fromFirestoreDocument_);
  const duplicate = existing.find(function(record) {
    return record.fileHash === fileHash &&
      record.externalReference === externalReference &&
      record.transactionDate === date &&
      Number(record.amountCents) === amountCents;
  });
  if (duplicate) {
    throw new Error(
      'Possible duplicate: this evidence/reference is already registered as ' +
      duplicate.sourceRecordNumber + '.'
    );
  }

  const identity = createTransactionIdentity_();
  const now = new Date();
  const record = {
    schemaVersion: NILAVARAM_WORKBENCH_SCHEMA_VERSION,
    sourceRecordId: identity.id,
    sourceRecordNumber: 'SRC-' + identity.number.slice(4),
    sourceType: sourceType,
    transactionDate: date,
    description: description,
    amountCents: amountCents,
    currency: 'USD',
    externalReference: externalReference,
    evidenceName: evidenceName,
    fileHashAlgorithm: 'SHA-256',
    fileHash: fileHash,
    storageReference: storageReference,
    evidenceStatus: 'verified',
    booksStatus: 'outside-books',
    matchStatus: 'unmatched',
    reconciliationStatus: 'pending',
    accountApprovalStatus: 'pending',
    postingStatus: 'blocked-until-account-approval',
    alertLevel: 'red',
    alertMessage:
      'Reconciliation and account assignment require review.',
    createdBy: user.email,
    createdAt: now,
    updatedAt: now
  };
  firestoreSetDocument_(
    'sourceRecords',
    identity.id,
    toFirestoreFields_(record)
  );
  writeAudit_('source-record-registered', user.email, {
    sourceRecordId: identity.id,
    sourceRecordNumber: record.sourceRecordNumber,
    sourceType: sourceType,
    fileHash: fileHash,
    booksStatus: 'outside-books'
  });
  return {
    success: true,
    sourceRecordId: identity.id,
    message: record.sourceRecordNumber +
      ' registered with verified evidence. It remains outside the books.'
  };
}

function saveSourceReconciliation(input) {
  const user = requireAccountingEditor_();
  const id = String(input && input.sourceRecordId || '').trim();
  const source = getDocumentOrNull_('sourceRecords', id);
  if (!source) throw new Error('The source record was not found.');
  const externalBeginning = normalizeWorkbenchMoney_(
    input.externalBeginning, 'External beginning balance', true
  );
  const externalActivity = normalizeWorkbenchMoney_(
    input.externalActivity, 'External activity', true
  );
  const externalEnding = normalizeWorkbenchMoney_(
    input.externalEnding, 'External ending balance', true
  );
  const bookBeginning = normalizeWorkbenchMoney_(
    input.bookBeginning, 'Book beginning balance', true
  );
  const bookActivity = normalizeWorkbenchMoney_(
    input.bookActivity, 'Book activity', true
  );
  const outstanding = normalizeWorkbenchMoney_(
    input.outstanding, 'Outstanding adjustments', true
  );
  const adjustedExternal = externalEnding;
  const adjustedBook = bookBeginning + bookActivity + outstanding;
  const difference = adjustedExternal - adjustedBook;
  const arithmeticDifference =
    externalBeginning + externalActivity - externalEnding;
  const passed = difference === 0 && arithmeticDifference === 0;
  const now = new Date();
  const updated = copyRecordWithoutId_(source);
  updated.externalBeginningCents = externalBeginning;
  updated.externalActivityCents = externalActivity;
  updated.externalEndingCents = externalEnding;
  updated.bookBeginningCents = bookBeginning;
  updated.bookActivityCents = bookActivity;
  updated.outstandingCents = outstanding;
  updated.adjustedExternalCents = adjustedExternal;
  updated.adjustedBookCents = adjustedBook;
  updated.reconciliationDifferenceCents = difference;
  updated.sourceArithmeticDifferenceCents = arithmeticDifference;
  updated.reconciliationStatus = passed ? 'reconciled' : 'difference';
  updated.reconciledBy = passed ? user.email : '';
  updated.reconciledAt = passed ? now : null;
  updated.alertLevel = passed &&
    updated.accountApprovalStatus === 'approved' ? 'none' : 'red';
  updated.alertMessage = passed
    ? (updated.accountApprovalStatus === 'approved'
      ? ''
      : 'Account assignment still requires approval.')
    : 'Reconciliation difference requires review. Do not force the balance.';
  updated.updatedAt = now;
  firestoreSetDocument_('sourceRecords', id, toFirestoreFields_(updated));
  writeAudit_('source-reconciliation-checked', user.email, {
    sourceRecordId: id,
    differenceCents: difference,
    sourceArithmeticDifferenceCents: arithmeticDifference,
    status: updated.reconciliationStatus
  });
  return {
    success: passed,
    differenceCents: difference,
    arithmeticDifferenceCents: arithmeticDifference,
    message: passed
      ? 'Green check: adjusted external balance minus adjusted book balance is $0.00.'
      : 'Red alert: the reconciliation does not equal $0.00. Review missing, duplicate, cutoff or correction items.'
  };
}

function approveSourceAccountAssignment(input) {
  const user = requireAccountingEditor_();
  const id = String(input && input.sourceRecordId || '').trim();
  const source = getDocumentOrNull_('sourceRecords', id);
  if (!source) throw new Error('The source record was not found.');
  const debitCode = String(input && input.debitAccountCode || '').trim();
  const creditCode = String(input && input.creditAccountCode || '').trim();
  const ruleId = String(input && input.ruleId || '').trim();
  const changedReason = String(input && input.changedReason || '').trim();
  if (!debitCode || !creditCode || debitCode === creditCode) {
    throw new Error('Select two different posting accounts.');
  }
  const accounts = getSimpleTransactionSetup().accounts;
  if (!accounts.some(function(a) { return a.code === debitCode; }) ||
      !accounts.some(function(a) { return a.code === creditCode; })) {
    throw new Error('Both accounts must be active entry accounts.');
  }
  const rule = ruleId ? getDocumentOrNull_('transactionRules', ruleId) : null;
  const suggestedDebit = rule ? String(rule.debitAccountCode || '') : '';
  const suggestedCredit = rule ? String(rule.creditAccountCode || '') : '';
  const changed = !!rule &&
    (debitCode !== suggestedDebit || creditCode !== suggestedCredit);
  if (changed && !changedReason) {
    throw new Error('Explain why the approved suggestion was changed.');
  }
  const now = new Date();
  const updated = copyRecordWithoutId_(source);
  updated.debitAccountCode = debitCode;
  updated.creditAccountCode = creditCode;
  updated.accountApprovalStatus = 'approved';
  updated.ruleId = rule ? rule.id : '';
  updated.ruleVersion = rule ? Number(rule.version || 1) : 0;
  updated.ruleMatchReason = rule
    ? String(rule.matchReason || 'Description matched approved rule')
    : 'User selected accounts without a rule';
  updated.ruleConfidence = rule ? Number(rule.confidence || 0) : 0;
  updated.suggestedDebitAccountCode = suggestedDebit;
  updated.suggestedCreditAccountCode = suggestedCredit;
  updated.ruleSuggestionChanged = changed;
  updated.ruleChangeReason = changedReason;
  updated.accountApprovedBy = user.email;
  updated.accountApprovedAt = now;
  updated.postingStatus = 'ready-not-posted';
  updated.alertLevel =
    updated.reconciliationStatus === 'reconciled' ? 'none' : 'red';
  updated.alertMessage =
    updated.reconciliationStatus === 'reconciled'
      ? ''
      : 'Account assignment passed; reconciliation remains pending.';
  updated.updatedAt = now;
  firestoreSetDocument_('sourceRecords', id, toFirestoreFields_(updated));
  writeAudit_('source-account-assignment-approved', user.email, {
    sourceRecordId: id,
    ruleId: updated.ruleId,
    ruleVersion: updated.ruleVersion,
    ruleMatchReason: updated.ruleMatchReason,
    ruleConfidence: updated.ruleConfidence,
    suggestedDebitAccountCode: suggestedDebit,
    suggestedCreditAccountCode: suggestedCredit,
    approvedDebitAccountCode: debitCode,
    approvedCreditAccountCode: creditCode,
    suggestionChanged: changed,
    changeReason: changedReason
  });
  return {
    success: true,
    message: 'Green check: account assignment approved and fully audited. Posting remains disabled until end-to-end verification.'
  };
}

function saveEvidenceBackedJournalEntry(input) {
  const evidenceName = String(input && input.evidenceName || '').trim();
  const fileHash = String(input && input.fileHash || '').trim().toLowerCase();
  const auditNote = String(input && input.auditNote || '').trim();
  const entryPurpose = String(input && input.entryPurpose || '').trim();
  if (!evidenceName || !/^[a-f0-9]{64}$/.test(fileHash)) {
    throw new Error('A named evidence file and its SHA-256 hash are required.');
  }
  if (!auditNote) throw new Error('An audit explanation is required.');
  if (['manual', 'correction'].indexOf(entryPurpose) === -1) {
    throw new Error('Select Manual or Correction Journal Entry.');
  }
  const draftInput = {
    entityId: input.entityId,
    description: input.description,
    amount: input.amount,
    date: input.date,
    sourceDocumentName: evidenceName,
    debitAccountCode: input.debitAccountCode,
    creditAccountCode: input.creditAccountCode
  };
  const draft = saveSimpleTransaction(draftInput);
  const transaction = getDocumentOrNull_('transactions', draft.transactionId);
  const updated = copyRecordWithoutId_(transaction);
  updated.sourceType = 'manual-journal-entry';
  updated.entryPurpose = entryPurpose;
  updated.evidenceName = evidenceName;
  updated.fileHashAlgorithm = 'SHA-256';
  updated.fileHash = fileHash;
  updated.storageReference = String(input.storageReference || '').trim();
  updated.auditNote = auditNote;
  updated.documentStatus = 'verified-metadata';
  updated.postingStatus = 'verification-hold';
  updated.status = 'draft';
  updated.updatedAt = new Date();
  firestoreSetDocument_(
    'transactions',
    draft.transactionId,
    toFirestoreFields_(updated)
  );
  writeAudit_('evidence-backed-journal-draft-created', requireAccountingEditor_().email, {
    transactionId: draft.transactionId,
    entryPurpose: entryPurpose,
    fileHash: fileHash,
    auditNote: auditNote
  });
  return {
    success: true,
    transactionId: draft.transactionId,
    message: draft.transactionNumber +
      ' saved on verification hold. It was not posted.'
  };
}
