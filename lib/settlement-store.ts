'use client';

import {
  ApplicantSettlementRecord,
  CourseSettlementMeta,
  COURSE_SETTLEMENT_METAS,
  INITIAL_SETTLEMENT_RECORDS,
  PaymentStatus,
  EnrollmentStatus,
  SettlementStatus,
} from '@/data/settlements';

export type {
  ApplicantSettlementRecord,
  CourseSettlementMeta,
  PaymentStatus,
  EnrollmentStatus,
  SettlementStatus,
};

const STORAGE_KEY = 'aiedu_settlement_records_real_only_v3';
const USER_ORDERS_KEY = 'aiedu_user_order_ids_v1';
const USER_EMAIL_KEY = 'platform-learner-email';

const MOCK_APPLICANT_NAMES = new Set([
  '김수강', '곽성진', '이지은', '정우진', '박민수', '김태희', '서지민', '오선호',
  '한유진', '윤도현', '강태석'
]);

export function filterOutMockRecords(records: ApplicantSettlementRecord[]): ApplicantSettlementRecord[] {
  return records.filter((r) => {
    if (MOCK_APPLICANT_NAMES.has(r.applicantName)) return false;
    if (r.orderId && r.orderId.startsWith('ORD-2025')) return false;
    if (r.id && (r.id.startsWith('rec-00') || r.id.startsWith('rec-101') || r.id.startsWith('rec-102') || r.id.startsWith('rec-103'))) return false;
    if (r.courseId !== 'ai-work-automation-master' && r.courseId !== 'ai-work-automation-1027') return false;
    return true;
  });
}

export function resetToRealSettlementRecords(): ApplicantSettlementRecord[] {
  if (typeof window !== 'undefined') {
    const clean = filterOutMockRecords(INITIAL_SETTLEMENT_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('aiedu-settlement-change', { detail: clean }));
    return clean;
  }
  return filterOutMockRecords(INITIAL_SETTLEMENT_RECORDS);
}

export interface NewApplicationInput {
  courseId: string;
  courseTitle?: string;
  applicantName: string;
  email: string;
  phone: string;
  company?: string;
  amount: number;
  paymentMethod: '신용카드' | '카카오페이' | '토스페이' | '무통장입금' | '법인계산서';
  receiptType?: '미신청' | '개인소득공제' | '사업자증빙' | '세금계산서';
  receiptNumber?: string;
  depositorName?: string;
  notes?: string;
}

export function getSettlementRecords(): ApplicantSettlementRecord[] {
  if (typeof window === 'undefined') {
    return filterOutMockRecords(INITIAL_SETTLEMENT_RECORDS);
  }
  try {
    // Purge legacy storage keys
    const legacyKeys = [
      'aiedu_settlement_records_v1',
      'aiedu_settlement_records_v2',
      'aiedu_settlement_records_v3',
      'aiedu_settlement_records_v4',
      'aiedu_settlement_records_v5',
      'aiedu_settlement_records_real_only_v1',
      'aiedu_settlement_records_real_only_v2',
    ];
    legacyKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const clean = filterOutMockRecords(INITIAL_SETTLEMENT_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      return clean;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const filtered = filterOutMockRecords(parsed);
      if (filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered.length > 0 ? filtered : filterOutMockRecords(INITIAL_SETTLEMENT_RECORDS);
    }
    const clean = filterOutMockRecords(INITIAL_SETTLEMENT_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return clean;
  } catch (err) {
    console.error('Failed to load settlement records:', err);
    return filterOutMockRecords(INITIAL_SETTLEMENT_RECORDS);
  }
}

export function saveSettlementRecords(records: ApplicantSettlementRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('aiedu-settlement-change', { detail: records }));
  } catch (err) {
    console.error('Failed to save settlement records:', err);
  }
}

export function addSettlementApplication(
  input: NewApplicationInput
): ApplicantSettlementRecord {
  const records = getSettlementRecords();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderId = `ORD-${dateStr}-${randomNum}`;
  const recordId = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const isPrepaid = input.paymentMethod === '신용카드' || input.paymentMethod === '카카오페이' || input.paymentMethod === '토스페이';
  const paymentStatus: PaymentStatus = isPrepaid ? '결제완료' : '미결제';
  const settlementStatus: SettlementStatus = '정산대기';
  const enrollmentStatus: EnrollmentStatus = '신청';

  const instructorShare = Math.round(input.amount * 0.7);
  const taxDeducted = Math.round(instructorShare * 0.033);
  const netToInstructor = instructorShare - taxDeducted;

  const newRecord: ApplicantSettlementRecord = {
    id: recordId,
    orderId,
    courseId: input.courseId,
    applicantName: input.applicantName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    company: input.company?.trim() || '개인 수강생',
    appliedAt: now.toISOString(),
    paidAt: isPrepaid ? now.toISOString() : undefined,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    paymentStatus,
    enrollmentStatus,
    settlementStatus,
    instructorShare,
    taxDeducted,
    netToInstructor,
    taxInvoiceStatus:
      input.receiptType === '세금계산서'
        ? '신청접수'
        : input.receiptType === '개인소득공제' || input.receiptType === '사업자증빙'
        ? '신청접수'
        : '미신청',
    cashReceiptType: input.receiptType,
    cashReceiptNumber: input.receiptNumber,
    note: [
      input.notes?.trim(),
      input.depositorName ? `입금자명: ${input.depositorName}` : null,
      input.receiptNumber ? `증빙번호: ${input.receiptNumber}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
  };

  const updatedRecords = [newRecord, ...records];
  saveSettlementRecords(updatedRecords);

  // Save order id to user orders for guest lookup
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_EMAIL_KEY, newRecord.email);
      const prevOrderIds: string[] = JSON.parse(
        localStorage.getItem(USER_ORDERS_KEY) || '[]'
      );
      if (!prevOrderIds.includes(orderId)) {
        prevOrderIds.unshift(orderId);
        localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(prevOrderIds));
      }
    } catch (e) {
      console.warn('Failed to save user order key:', e);
    }
  }

  return newRecord;
}

export function updateSettlementRecord(
  id: string,
  updates: Partial<ApplicantSettlementRecord>
): ApplicantSettlementRecord[] {
  const records = getSettlementRecords();
  const next = records.map((r) => {
    if (r.id !== id) return r;
    const merged = { ...r, ...updates };
    if (updates.amount !== undefined && updates.amount !== r.amount) {
      merged.instructorShare = Math.round(merged.amount * 0.7);
      merged.taxDeducted = Math.round(merged.instructorShare * 0.033);
      merged.netToInstructor = merged.instructorShare - merged.taxDeducted;
    }
    return merged;
  });
  saveSettlementRecords(next);
  return next;
}

export function getDynamicCourseMetas(
  baseMetas: CourseSettlementMeta[],
  records: ApplicantSettlementRecord[]
): CourseSettlementMeta[] {
  return baseMetas.map((meta) => {
    const courseRecords = records.filter((r) => r.courseId === meta.courseId);
    if (courseRecords.length === 0) return meta;

    const currentCount = courseRecords.length;
    const totalRevenue = courseRecords.reduce((sum, r) => sum + r.amount, 0);
    const settledRecords = courseRecords.filter((r) => r.settlementStatus === '정산완료');
    const unsettledRecords = courseRecords.filter((r) => r.settlementStatus === '정산대기');

    const settledRevenue = settledRecords.reduce((sum, r) => sum + r.amount, 0);
    const unsettledRevenue = unsettledRecords.reduce((sum, r) => sum + r.amount, 0);

    const totalInstructorFee = courseRecords.reduce((sum, r) => sum + r.netToInstructor, 0);
    const settledInstructorFee = settledRecords.reduce((sum, r) => sum + r.netToInstructor, 0);
    const unsettledInstructorFee = unsettledRecords.reduce(
      (sum, r) => sum + r.netToInstructor,
      0
    );

    return {
      ...meta,
      currentCount,
      totalRevenue,
      settledRevenue,
      unsettledRevenue,
      totalInstructorFee,
      settledInstructorFee,
      unsettledInstructorFee,
    };
  });
}

export function subscribeSettlementChanges(callback: (records: ApplicantSettlementRecord[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<ApplicantSettlementRecord[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getSettlementRecords());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getSettlementRecords());
    }
  };

  window.addEventListener('aiedu-settlement-change', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('aiedu-settlement-change', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function getUserApplications(): ApplicantSettlementRecord[] {
  if (typeof window === 'undefined') return [];
  const records = getSettlementRecords();
  const email = (localStorage.getItem(USER_EMAIL_KEY) || '').trim().toLowerCase();
  const orderIds: string[] = JSON.parse(localStorage.getItem(USER_ORDERS_KEY) || '[]');

  if (!email && orderIds.length === 0) return [];

  return records.filter(
    (r) =>
      (email && r.email.toLowerCase() === email) ||
      (r.orderId && orderIds.includes(r.orderId))
  );
}
