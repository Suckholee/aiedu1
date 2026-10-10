'use client';

export type TransactionType = '입금' | '출금';
export type TransactionCategory =
  | '수강료'
  | '강의장대관'
  | '교재교구'
  | '강사료'
  | '식대'
  | '다과비'
  | '마케팅비'
  | '기타경비';

export interface BankTransactionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: TransactionType;
  category: TransactionCategory;
  account: string;
  counterparty: string;
  amount: number;
  note?: string;
  status: '확인완료' | '대기' | '취소';
  courseTitle?: string;
}

const STORAGE_KEY = 'aiedu_ledger_transactions_v2';

export const INITIAL_LEDGER_TRANSACTIONS: BankTransactionRecord[] = [
  {
    id: 'tx-20261010-001',
    date: '2026-10-10',
    time: '09:12',
    type: '입금',
    category: '수강료',
    account: '기업은행 123-456789-01-012',
    counterparty: '황선도',
    amount: 150000,
    note: '수강료 입금 (정상 납부)',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-002',
    date: '2026-10-10',
    time: '09:15',
    type: '입금',
    category: '수강료',
    account: '기업은행 123-456789-01-012',
    counterparty: '이보배',
    amount: 150000,
    note: '수강료 입금 (정상 납부)',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-003',
    date: '2026-10-10',
    time: '09:18',
    type: '입금',
    category: '수강료',
    account: '기업은행 123-456789-01-012',
    counterparty: '조보겸',
    amount: 150000,
    note: '수강료 입금 (정상 납부)',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-004',
    date: '2026-10-10',
    time: '09:20',
    type: '출금',
    category: '강의장대관',
    account: '기업은행 123-456789-01-012',
    counterparty: '(서강대)',
    amount: 220000,
    note: '강의장 및 세미나실 대관료 지출',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-005',
    date: '2026-10-10',
    time: '09:22',
    type: '출금',
    category: '교재교구',
    account: '기업은행 123-456789-01-012',
    counterparty: '(알파구리인창점)',
    amount: 175500,
    note: '수강생 교재 출력/제본 및 문구류 소모품비',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-006',
    date: '2026-10-10',
    time: '09:24',
    type: '입금',
    category: '수강료',
    account: '기업은행 123-456789-01-012',
    counterparty: '임영미',
    amount: 150000,
    note: '수강료 입금 (정상 납부)',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-007',
    date: '2026-10-10',
    time: '09:25',
    type: '입금',
    category: '수강료',
    account: '기업은행 123-456789-01-012',
    counterparty: '옥리안',
    amount: 100000,
    note: '이주빈추천 특별할인 적용',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-008',
    date: '2026-10-10',
    time: '09:26',
    type: '입금',
    category: '수강료',
    account: '기업은행 123-456789-01-012',
    counterparty: '지미란',
    amount: 100000,
    note: '이주빈추천 특별할인 적용',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-009',
    date: '2026-10-10',
    time: '09:28',
    type: '입금',
    category: '수강료',
    account: '기업은행 123-456789-01-012',
    counterparty: '김해리',
    amount: 150000,
    note: '한선희 대납 입금 확인',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
  {
    id: 'tx-20261010-010',
    date: '2026-10-10',
    time: '20:15',
    type: '출금',
    category: '식대',
    account: '기업은행 123-456789-01-012',
    counterparty: '저녁식사비 (식당)',
    amount: 257000,
    note: '강사진 및 운영진/수강생 저녁 식사비 지출',
    status: '확인완료',
    courseTitle: 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  },
];

export function getLedgerTransactions(): BankTransactionRecord[] {
  if (typeof window === 'undefined') {
    return INITIAL_LEDGER_TRANSACTIONS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEDGER_TRANSACTIONS));
      return INITIAL_LEDGER_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_LEDGER_TRANSACTIONS;
  } catch (err) {
    console.error('Failed to load ledger transactions:', err);
    return INITIAL_LEDGER_TRANSACTIONS;
  }
}

export function saveLedgerTransactions(records: BankTransactionRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('aiedu-ledger-change', { detail: records }));
  } catch (err) {
    console.error('Failed to save ledger transactions:', err);
  }
}

export function addLedgerTransaction(
  input: Omit<BankTransactionRecord, 'id' | 'date' | 'time'> & { date?: string; time?: string }
): BankTransactionRecord {
  const records = getLedgerTransactions();
  const now = new Date();
  const date = input.date || now.toISOString().slice(0, 10);
  const time = input.time || now.toTimeString().slice(0, 5);
  const id = `tx-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRecord: BankTransactionRecord = {
    id,
    date,
    time,
    type: input.type,
    category: input.category,
    account: input.account || '기업은행 123-456789-01-012',
    counterparty: input.counterparty.trim(),
    amount: input.amount,
    note: input.note?.trim(),
    status: input.status || '확인완료',
    courseTitle: input.courseTitle || 'AI 업무자동화 실전 마스터 클래스 (서강대 특강)',
  };

  const next = [newRecord, ...records];
  saveLedgerTransactions(next);
  return newRecord;
}

export function subscribeLedgerChanges(callback: (records: BankTransactionRecord[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<BankTransactionRecord[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getLedgerTransactions());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getLedgerTransactions());
    }
  };

  window.addEventListener('aiedu-ledger-change', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('aiedu-ledger-change', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function getLedgerSummary(records: BankTransactionRecord[]) {
  const incomeRecords = records.filter((r) => r.type === '입금' && r.status === '확인완료');
  const expenseRecords = records.filter((r) => r.type === '출금' && r.status === '확인완료');

  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    incomeCount: incomeRecords.length,
    expenseCount: expenseRecords.length,
    totalCount: records.length,
  };
}
