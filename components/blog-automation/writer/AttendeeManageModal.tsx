'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  User,
  Building2,
  Target,
  Award,
  FileText,
  Save,
  Trash2,
  Loader2,
  Wand2,
  ClipboardPaste,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  BniAttendee,
  saveBniAttendee,
  deleteBniAttendee,
} from '@/lib/blog-automation/bni-attendee-storage';

interface AttendeeManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendee?: BniAttendee | null;
  userId?: string;
  onSaved: (attendee: BniAttendee) => void;
  onDeleted?: (attendeeId: string) => void;
}

export function AttendeeManageModal({
  open,
  onOpenChange,
  attendee,
  userId,
  onSaved,
  onDeleted,
}: AttendeeManageModalProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [chapter, setChapter] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [targetReferral, setTargetReferral] = useState('');
  const [partnerStrength, setPartnerStrength] = useState('');
  const [sheetSummary, setSheetSummary] = useState('');
  const [preferredPlace, setPreferredPlace] = useState('');

  // AI 분석용 원문 양식지 텍스트
  const [rawSheetText, setRawSheetText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (attendee) {
      setName(attendee.name || '');
      setCompany(attendee.company || '');
      setChapter(attendee.chapter || '');
      setSpecialty(attendee.specialty || '');
      setTargetReferral(attendee.targetReferral || '');
      setPartnerStrength(attendee.partnerStrength || '');
      setSheetSummary(attendee.sheetSummary || '');
      setPreferredPlace(attendee.preferredPlace || '');
      setRawSheetText('');
    } else {
      setName('');
      setCompany('');
      setChapter('');
      setSpecialty('');
      setTargetReferral('');
      setPartnerStrength('');
      setSheetSummary('');
      setPreferredPlace('');
      setRawSheetText('');
    }
  }, [attendee, open]);

  // AI 양식지 스마트 파싱
  const handleParseSheet = async () => {
    if (!rawSheetText.trim()) {
      toast.error('분석할 양식지 또는 카카오톡 소개글을 입력해주세요.');
      return;
    }

    setIsParsing(true);
    try {
      const res = await fetch('/api/blog-auto/writer/parse-121-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetText: rawSheetText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '양식지 분석에 실패했습니다.');
      }

      const parsed = data.data;
      if (parsed.partnerName) setName(parsed.partnerName);
      if (parsed.partnerCompany) {
        const comp = parsed.partnerCompany;
        // 챕터 분리 시도
        if (comp.includes('(') && comp.includes(')')) {
          const parts = comp.split('(');
          setCompany(parts[0].trim());
          setChapter(parts[1].replace(')', '').trim());
        } else {
          setCompany(comp);
        }
      }
      if (parsed.partnerField) setSpecialty(parsed.partnerField);
      if (parsed.targetReferral) setTargetReferral(parsed.targetReferral);
      if (parsed.partnerStrength) setPartnerStrength(parsed.partnerStrength);
      if (parsed.sheetSummary) setSheetSummary(parsed.sheetSummary);
      if (parsed.preferredPlace) setPreferredPlace(parsed.preferredPlace);

      toast.success('✨ 양식지 내용이 분석되어 항목별로 자동 입력되었습니다!');
    } catch (e: any) {
      toast.error(e.message || '양식지 분석 중 오류가 발생했습니다.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('참석자(대표님) 성함을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const itemToSave: BniAttendee = {
        id: attendee?.id || `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        company: company.trim(),
        chapter: chapter.trim() || 'BNI 챕터',
        specialty: specialty.trim(),
        targetReferral: targetReferral.trim(),
        partnerStrength: partnerStrength.trim(),
        sheetSummary: sheetSummary.trim(),
        preferredPlace: preferredPlace.trim(),
        createdAt: attendee?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      const saved = await saveBniAttendee(itemToSave, userId);
      toast.success(`🤝 '${saved.name}' 파트너 정보가 저장되었습니다.`);
      onSaved(saved);
      onOpenChange(false);
    } catch (e) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!attendee?.id) return;
    if (!confirm(`'${attendee.name}' 파트너 정보를 삭제하시겠습니까?`)) return;

    try {
      await deleteBniAttendee(attendee.id, userId);
      toast.info('파트너 정보가 삭제되었습니다.');
      onDeleted?.(attendee.id);
      onOpenChange(false);
    } catch (e) {
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white p-5 sm:p-6 rounded-3xl border-slate-200 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                {attendee ? '회의 참석자(파트너) 정보 수정' : '새 BNI 파트너 및 원투원 양식지 등록'}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                상대방 대표님의 121 사전 양식지와 프로필을 등록해두면 미팅 시 클릭 한 번으로 자동 완성됩니다.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* 🌟 1. 양식지 원문 붙여넣기 & AI 자동 분석 섹션 */}
          <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <ClipboardPaste className="size-3.5 text-indigo-600" />
                <span>원투원 양식지 / 카카오톡 소개글 붙여넣기 (선택)</span>
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isParsing || !rawSheetText.trim()}
                onClick={handleParseSheet}
                className="h-7 text-xs font-bold border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-100/80 shadow-2xs gap-1"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    <span>AI 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="size-3 text-indigo-600" />
                    <span>AI 자동 분석 채우기</span>
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={rawSheetText}
              onChange={(e) => setRawSheetText(e.target.value)}
              placeholder="상대방 대표님이 보내주신 BNI 121 양식지, 회사 소개서 내용 또는 카톡 프로필 텍스트를 여기에 그대로 붙여넣고 [AI 자동 분석 채우기]를 누르시면 아래 항목들이 자동으로 채워집니다."
              rows={3}
              className="text-xs bg-white resize-none border-indigo-200 focus-visible:ring-indigo-500"
            />
          </div>

          {/* ── 2. 기본 정보 ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="size-3 text-indigo-600" />
                참석자(대표님) 성함 <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김성훈 대표"
                className="h-8 text-xs bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 className="size-3 text-indigo-600" />
                회사명
              </Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="예: 알파브랜딩"
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">소속 BNI 챕터</Label>
              <Input
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="예: BNI 마스터 챕터"
                className="h-8 text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">전문분야 / 주력 사업</Label>
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="예: 기업 브랜딩 및 공간 디자인"
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>

          {/* ── 3. 비즈니스 리퍼럴 프로필 (GAINS) ── */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Target className="size-3.5 text-rose-500" />
                이상적인 추천 고객 (소개 희망 리퍼럴)
              </Label>
              <Input
                value={targetReferral}
                onChange={(e) => setTargetReferral(e.target.value)}
                placeholder="어떤 고객을 만났을 때 대표님께 연결해드리면 가장 좋을까요?"
                className="h-8 text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Award className="size-3.5 text-amber-500" />
                차별화된 핵심 강점 &amp; 경쟁력
              </Label>
              <Input
                value={partnerStrength}
                onChange={(e) => setPartnerStrength(e.target.value)}
                placeholder="경쟁사와 다른 대표님만의 독보적인 강점"
                className="h-8 text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText className="size-3.5 text-slate-500" />
                121 사전 양식지 메모 요약
              </Label>
              <Textarea
                value={sheetSummary}
                onChange={(e) => setSheetSummary(e.target.value)}
                placeholder="파트너의 가업/경력 배경, 주력 서비스 요약 등 기억해 둘 핵심 메모"
                rows={2}
                className="text-xs bg-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">선호 미팅 장소 (선택)</Label>
              <Input
                value={preferredPlace}
                onChange={(e) => setPreferredPlace(e.target.value)}
                placeholder="예: 압구정 로데오 카페, 르글라스 압구정"
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>

          {/* ── 액션 버튼 ── */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {attendee ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
              >
                <Trash2 className="size-3.5" />
                <span>삭제</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                취소
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1 shadow-xs"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>파트너 정보 저장 및 적용</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
