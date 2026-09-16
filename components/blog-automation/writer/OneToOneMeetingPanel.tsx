'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Building2,
  Calendar as CalendarIcon,
  MapPin,
  MessageSquareText,
  Lightbulb,
  Handshake,
  Sparkles,
  CheckSquare,
  RotateCcw,
  Target,
  Award,
  FileText,
  UserPlus,
  Edit3,
  Check,
  Briefcase,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Mic,
  FileAudio,
  Loader2,
  Wand2,
  UserCheck,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  FileCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  BniAttendee,
  getBniAttendees,
  DEFAULT_BNI_ATTENDEES,
} from '@/lib/blog-automation/bni-attendee-storage';
import { AttendeeManageModal, loadPdfJs, compressImage } from './AttendeeManageModal';

interface OneToOneMeetingPanelProps {
  customFields: Record<string, string>;
  onCustomFieldsChange: (fields: Record<string, string>) => void;
  topic: string;
  onTopicChange: (topic: string) => void;
  requiredKeywords: string;
  onRequiredKeywordsChange: (keywords: string) => void;
  onTargetAudienceChange?: (audience: string) => void;
  onAddPhotos?: (photos: { name: string; url: string; caption?: string }[]) => void;
}

export function OneToOneMeetingPanel({
  customFields,
  onCustomFieldsChange,
  topic,
  onTopicChange,
  requiredKeywords,
  onRequiredKeywordsChange,
  onTargetAudienceChange,
  onAddPhotos,
}: OneToOneMeetingPanelProps) {
  const { user } = useAuth();

  // 참석자 목록 및 다중 선택 상태 (목업 배제, 사용자 등록 파트너만 관리)
  const [attendees, setAttendees] = useState<BniAttendee[]>([]);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<BniAttendee | null>(null);

  // 블록 포함 토글 상태
  const [includePartnerIntro, setIncludePartnerIntro] = useState(true);
  const [includeStrength, setIncludeStrength] = useState(true);
  const [includeConversation, setIncludeConversation] = useState(true);
  const [includeInsight, setIncludeInsight] = useState(true);
  const [includeSynergy, setIncludeSynergy] = useState(true);
  const [includeLocationMap, setIncludeLocationMap] = useState(true);

  // 🌟 세로 공간 절약용 접기/펼치기 상태
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isPreSheetExpanded, setIsPreSheetExpanded] = useState(false);

  // ── 작성자(나 / 호스트 대표님) 프로필 관리 ──
  const [myProfile, setMyProfile] = useState<{
    name: string;
    company: string;
    chapter: string;
    specialty: string;
    targetReferral?: string;
  }>({
    name: '',
    company: '',
    chapter: '',
    specialty: '',
    targetReferral: '',
  });
  const [isEditingMyProfile, setIsEditingMyProfile] = useState(false);

  // ── 작성자(나 / 호스트 대표님) 121 양식지 업로드 & 파싱 상태 ──
  const [myUploadMode, setMyUploadMode] = useState<'file' | 'text'>('file');
  const [myRawSheetText, setMyRawSheetText] = useState('');
  const [myUploadedFile, setMyUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    base64: string;
  } | null>(null);
  const [isMyDragging, setIsMyDragging] = useState(false);
  const [isParsingMySheet, setIsParsingMySheet] = useState(false);
  const myFileInputRef = useRef<HTMLInputElement>(null);

  const executeParseMySheet = async (params: {
    sheetText?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    setIsParsingMySheet(true);
    try {
      const res = await fetch('/api/blog-auto/writer/parse-121-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetText: params.sheetText,
          fileBase64: params.fileBase64,
          mimeType: params.mimeType,
          partnerName: myProfile.name,
        }),
      });

      const resText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(resText);
      } catch {
        if (res.status === 413 || resText.includes('Request Entity Too Large')) {
          throw new Error('파일 크기가 서버 전송 한도를 초과했습니다. PDF의 텍스트를 복사하여 [📋 텍스트 붙여넣기]에 넣어주세요.');
        }
        throw new Error(`서버 처리 실패 (${res.status}): ${resText.slice(0, 100)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || '양식지 분석에 실패했습니다.');
      }

      const parsed = data.data;

      // 성함: 없거나 새 정보가 있으면 업데이트
      let updatedName = myProfile.name;
      if (parsed.partnerName) {
        updatedName = parsed.partnerName;
      }

      // 회사명 및 챕터 자동 분리
      let updatedCompany = myProfile.company;
      let updatedChapter = myProfile.chapter;
      if (parsed.partnerCompany) {
        const comp = parsed.partnerCompany;
        if (comp.includes('(') && comp.includes(')')) {
          const parts = comp.split('(');
          updatedCompany = parts[0].trim();
          if (!updatedChapter) {
            updatedChapter = parts[1].replace(')', '').trim();
          }
        } else {
          updatedCompany = comp;
        }
      }
      if (parsed.partnerChapter && !updatedChapter) {
        updatedChapter = parsed.partnerChapter;
      }

      const updatedSpecialty = parsed.partnerField || myProfile.specialty;
      const updatedReferral = parsed.targetReferral || myProfile.targetReferral || '';

      const updated = {
        name: updatedName,
        company: updatedCompany,
        chapter: updatedChapter,
        specialty: updatedSpecialty,
        targetReferral: updatedReferral,
      };

      setMyProfile(updated);

      if (updated.name) {
        localStorage.setItem('bni_my_host_profile', JSON.stringify(updated));
        onCustomFieldsChange({
          ...customFields,
          myAuthorName: updated.name,
          myAuthorCompany: updated.company,
          myAuthorChapter: updated.chapter,
          myAuthorSpecialty: updated.specialty,
          myAuthorReferral: updated.targetReferral,
        });
      }

      toast.success('✨ 대표님의 121 양식지가 성공적으로 분석되어 내 정보가 자동 입력되었습니다!');
    } catch (e: any) {
      toast.error(e.message || '양식지 분석 중 오류가 발생했습니다.');
    } finally {
      setIsParsingMySheet(false);
    }
  };

  const handleMyFileSelect = async (file: File) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(lowerName);
    const isText = file.type.startsWith('text/') || lowerName.endsWith('.txt');

    if (!isPdf && !isImage && !isText) {
      toast.error('지원 형식: 이미지 (JPG, PNG, WebP), PDF, TXT 파일만 가능합니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('파일 크기는 최대 50MB까지 업로드할 수 있습니다.');
      return;
    }

    setMyUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
      base64: '',
    });

    // 1) 텍스트 파일 (.txt)
    if (isText) {
      try {
        const textContent = await file.text();
        executeParseMySheet({ sheetText: textContent, fileName: file.name });
      } catch (err: any) {
        toast.error('텍스트 파일 읽기 실패: ' + err.message);
      }
      return;
    }

    // 2) 이미지 파일 (JPG, PNG, WebP) -> Canvas 경량 압축
    if (isImage) {
      try {
        const compressedBase64 = await compressImage(file);
        setMyUploadedFile((prev) => (prev ? { ...prev, base64: compressedBase64 } : null));
        onAddPhotos?.([
          {
            name: file.name,
            url: compressedBase64,
            caption: `${myProfile.name.trim() || '호스트'} 원투원 양식지`,
          },
        ]);
        executeParseMySheet({
          fileBase64: compressedBase64,
          mimeType: 'image/jpeg',
          fileName: file.name,
        });
      } catch (err: any) {
        toast.error('이미지 처리 실패: ' + err.message);
      }
      return;
    }

    // 3) PDF 파일 (대용량 PDF 포함 -> 브라우저 텍스트 직접 추출)
    if (isPdf) {
      setIsParsingMySheet(true);
      try {
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        // 호스트 PDF 페이지 이미지 일괄 추출 (블로그 사진 패널 등록)
        const renderedImages: string[] = [];
        const maxImgPages = Math.min(pdf.numPages, 6);
        for (let p = 1; p <= maxImgPages; p++) {
          try {
            const page = await pdf.getPage(p);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              await page.render({ canvasContext: ctx, viewport }).promise;
              renderedImages.push(canvas.toDataURL('image/jpeg', 0.85));
            }
          } catch (pErr) {
            console.warn(`호스트 PDF ${p}페이지 렌더링 실패:`, pErr);
          }
        }

        if (renderedImages.length > 0) {
          onAddPhotos?.(
            renderedImages.map((imgUrl, idx) => ({
              name: `${file.name.replace(/\.pdf$/i, '')}_host_p${idx + 1}.jpg`,
              url: imgUrl,
              caption: `${myProfile.name.trim() || '호스트'} 원투원 양식지 (${idx + 1}p)`,
            }))
          );
        }

        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 10);

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageStrings = content.items
            .map((it: any) => it.str)
            .filter(Boolean);
          if (pageStrings.length > 0) {
            fullText += `\n[${i}페이지]\n` + pageStrings.join(' ');
          }
        }

        if (fullText.trim().length >= 30) {
          executeParseMySheet({ sheetText: fullText.trim(), fileName: file.name });
          return;
        }

        if (renderedImages.length > 0) {
          executeParseMySheet({
            fileBase64: renderedImages[0],
            mimeType: 'image/jpeg',
            fileName: file.name,
          });
          return;
        }

        if (file.size <= 3 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const b64 = e.target?.result as string;
            executeParseMySheet({ fileBase64: b64, mimeType: 'application/pdf', fileName: file.name });
          };
          reader.readAsDataURL(file);
        } else {
          throw new Error('PDF 텍스트 추출에 실패했습니다. 내용을 복사하여 [📋 텍스트 붙여넣기]로 입력해주세요.');
        }
      } catch (pdfErr: any) {
        console.error('PDF parsing error:', pdfErr);
        setIsParsingMySheet(false);
        if (file.size <= 3 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const b64 = e.target?.result as string;
            executeParseMySheet({ fileBase64: b64, mimeType: 'application/pdf', fileName: file.name });
          };
          reader.readAsDataURL(file);
        } else {
          toast.error(
            '대용량 PDF 처리 안내: 파일 크기가 커서 텍스트 복사 후 [📋 텍스트 붙여넣기]로 넣어주시면 가장 빠르고 정확하게 분석됩니다.'
          );
        }
      }
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bni_my_host_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMyProfile(parsed);
        if (parsed.name && !customFields.myAuthorName) {
          onCustomFieldsChange({
            ...customFields,
            myAuthorName: parsed.name,
            myAuthorCompany: parsed.company || '',
            myAuthorChapter: parsed.chapter || '',
            myAuthorSpecialty: parsed.specialty || '',
            myAuthorReferral: parsed.targetReferral || '',
          });
        }
      }
    } catch {}
  }, []);

  const handleSaveMyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile.name.trim()) {
      toast.error('대표님의 성함을 입력해주세요.');
      return;
    }
    try {
      localStorage.setItem('bni_my_host_profile', JSON.stringify(myProfile));
      onCustomFieldsChange({
        ...customFields,
        myAuthorName: myProfile.name.trim(),
        myAuthorCompany: myProfile.company.trim(),
        myAuthorChapter: myProfile.chapter.trim(),
        myAuthorSpecialty: myProfile.specialty.trim(),
        myAuthorReferral: myProfile.targetReferral?.trim() || '',
      });
      setIsEditingMyProfile(false);
      toast.success('👤 대표님의 정보가 저장되었습니다! 앞으로 모든 121 블로그 글에 내 사업 정보가 자동으로 반영됩니다.');
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  // 🎙️ 녹음본 텍스트(클로바노트) AI 분석 상태
  const [isAnalyzingTranscript, setIsAnalyzingTranscript] = useState(false);

  const handleAnalyzeTranscript = async () => {
    const transcript = customFields.meetingTranscript;
    if (!transcript || !transcript.trim()) {
      toast.error('분석할 녹음본 대화 텍스트(클로바노트 전사본)를 먼저 입력해주세요.');
      return;
    }

    setIsAnalyzingTranscript(true);
    try {
      const res = await fetch('/api/blog-auto/writer/parse-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          partnerName: customFields.partnerName || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '녹음본 텍스트 분석에 실패했습니다.');
      }

      const { data } = await res.json();
      if (data) {
        onCustomFieldsChange({
          ...customFields,
          conversationCore: data.conversationCore || customFields.conversationCore || '',
          myInsight: data.myInsight || customFields.myInsight || '',
          synergyPlan: data.synergyPlan || customFields.synergyPlan || '',
          targetReferral: customFields.targetReferral || data.targetReferral || '',
          partnerStrength: customFields.partnerStrength || data.partnerStrength || '',
        });
        toast.success('🎙️ 녹음본 대화에서 핵심 이야기, 인사이트, 상생 협업 내용을 성공적으로 추출했습니다!');
      }
    } catch (e: any) {
      console.error('Transcript analyze error:', e);
      toast.error(e.message || '녹음본 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzingTranscript(false);
    }
  };

  // 1. 참석자 목록 로드
  useEffect(() => {
    const loadAttendees = async () => {
      try {
        const list = await getBniAttendees(user?.uid);
        if (list) {
          setAttendees(list);
          if (customFields.attendeesJson) {
            try {
              const parsed = JSON.parse(customFields.attendeesJson);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const validIds = parsed
                  .map((a: any) => a.id)
                  .filter((id: string) => list.some((att) => att.id === id));
                if (validIds.length > 0) {
                  setSelectedAttendeeIds(validIds);
                  return;
                }
              }
            } catch {}
          }
          if (customFields.partnerName) {
            const names = customFields.partnerName.split(',').map((n) => n.trim());
            const matched = list.filter((a) => names.includes(a.name));
            if (matched.length > 0) {
              setSelectedAttendeeIds(matched.map((a) => a.id));
            }
          }
        }
      } catch (e) {
        console.error('Error loading attendees:', e);
      }
    };
    loadAttendees();
  }, [user]);

  const handleField = (key: string, val: string) => {
    onCustomFieldsChange({
      ...customFields,
      [key]: val,
    });
  };

  // 2. 참석자 다중 선택 동기화 함수
  const syncAttendeesToFields = (nextIds: string[], list = attendees) => {
    const selected = list.filter((a) => nextIds.includes(a.id));
    if (selected.length === 0) {
      onCustomFieldsChange({
        ...customFields,
        partnerName: '',
        partnerCompany: '',
        partnerField: '',
        targetReferral: '',
        partnerStrength: '',
        sheetSummary: '',
        attendeesJson: '',
      });
      return;
    }

    if (selected.length === 1) {
      const att = selected[0];
      const fullCompany = att.chapter ? `${att.company} (${att.chapter})` : att.company;

      onCustomFieldsChange({
        ...customFields,
        partnerName: att.name,
        partnerCompany: fullCompany,
        partnerField: att.specialty,
        targetReferral: att.targetReferral,
        partnerStrength: att.partnerStrength,
        sheetSummary: att.sheetSummary || '',
        attendeesJson: JSON.stringify(selected),
        meetingPlace: att.preferredPlace || customFields.meetingPlace || '비즈니스 라운지 카페',
        meetingDate: customFields.meetingDate || new Date().toISOString().slice(0, 10),
      });

      if (!topic || topic.includes('[BNI 원투원]')) {
        const cleanName = att.name.replace(' 대표', '');
        onTopicChange(
          `[BNI 원투원] ${att.company} ${cleanName} 대표님과의 121 미팅 - 비즈니스 시너지와 인사이트`
        );
      }

      if (!requiredKeywords || requiredKeywords.includes('BNI원투원')) {
        const cleanName = att.name.replace(' 대표', '');
        onRequiredKeywordsChange(
          `BNI원투원, 121미팅, ${att.company}, ${cleanName}대표, 비즈니스네트워킹, 상생협업`
        );
      }

      if (onTargetAudienceChange) {
        onTargetAudienceChange('BNI 멤버, 기업 대표님 및 사업가, 비즈니스 네트워킹 관심자');
      }
    } else {
      // 2명 이상 다자간 121 미팅
      const names = selected.map((a) => a.name).join(', ');
      const companies = selected
        .map((a) => `${a.company}${a.chapter ? ` (${a.chapter})` : ''}`)
        .join(' / ');
      const fields = selected.map((a) => `${a.name}: ${a.specialty}`).join(' | ');
      const referrals = selected
        .map((a) => `${a.name}: ${a.targetReferral || '미등록'}`)
        .join(' | ');
      const strengths = selected
        .map((a) => `${a.name}: ${a.partnerStrength || '미등록'}`)
        .join(' | ');
      const summaries = selected
        .map((a) => `[${a.name} (${a.company})]\n${a.sheetSummary || '양식지 요약 없음'}`)
        .join('\n\n');

      onCustomFieldsChange({
        ...customFields,
        partnerName: names,
        partnerCompany: companies,
        partnerField: fields,
        targetReferral: referrals,
        partnerStrength: strengths,
        sheetSummary: summaries,
        attendeesJson: JSON.stringify(selected),
        meetingPlace: selected[0]?.preferredPlace || customFields.meetingPlace || '비즈니스 라운지 카페',
        meetingDate: customFields.meetingDate || new Date().toISOString().slice(0, 10),
      });

      if (!topic || topic.includes('[BNI 원투원]')) {
        const partnerLabels = selected
          .map((a) => `${a.company} ${a.name.replace(' 대표', '')} 대표님`)
          .join(' & ');
        onTopicChange(
          `[BNI 원투원] ${partnerLabels}과의 121 미팅 - 비즈니스 시너지와 상생 협업`
        );
      }

      if (!requiredKeywords || requiredKeywords.includes('BNI원투원')) {
        const kwNames = selected
          .map((a) => `${a.company}, ${a.name.replace(' 대표', '')}대표`)
          .join(', ');
        onRequiredKeywordsChange(
          `BNI원투원, 121미팅, 다자간121, ${kwNames}, 비즈니스네트워킹, 상생협업`
        );
      }

      if (onTargetAudienceChange) {
        onTargetAudienceChange('BNI 멤버, 기업 대표님 및 사업가, 비즈니스 네트워킹 관심자');
      }
    }
  };

  // 참석자 토글
  const handleToggleAttendee = (att: BniAttendee) => {
    let nextIds: string[];
    if (selectedAttendeeIds.includes(att.id)) {
      nextIds = selectedAttendeeIds.filter((id) => id !== att.id);
      toast.info(`'${att.name}' 대표님이 미팅에서 제외되었습니다.`);
    } else {
      nextIds = [...selectedAttendeeIds, att.id];
      toast.success(
        nextIds.length > 1
          ? `👥 '${att.name}' 대표님이 추가되어 총 ${nextIds.length}명의 다자간 121 미팅이 구성되었습니다.`
          : `🤝 '${att.name}' 대표님이 선택되었습니다.`
      );
      // 📷 선택된 파트너의 양식지 이미지가 있다면 블로그 사진 목록에 자동 등록
      if (att.sheetImages && att.sheetImages.length > 0) {
        onAddPhotos?.(
          att.sheetImages.map((imgUrl, idx) => ({
            name: `${att.name}_양식지_p${idx + 1}.jpg`,
            url: imgUrl,
            caption: `${att.name} 대표님 121 사전 양식지 (${idx + 1}p)`,
          }))
        );
      }
    }
    setSelectedAttendeeIds(nextIds);
    syncAttendeesToFields(nextIds);
  };

  const handleClearAllAttendees = () => {
    setSelectedAttendeeIds([]);
    syncAttendeesToFields([]);
    toast.info('참석자 선택이 모두 해제되었습니다.');
  };

  // 모달 열기 (신규 등록)
  const handleOpenAddModal = () => {
    setEditingAttendee(null);
    setModalOpen(true);
  };

  // 모달 열기 (수정)
  const handleOpenEditModal = (att: BniAttendee) => {
    setEditingAttendee(att);
    setModalOpen(true);
  };

  // 모달에서 저장 완료 후 콜백
  const handleAttendeeSaved = (saved: BniAttendee) => {
    let updatedList = [...attendees];
    const idx = updatedList.findIndex((a) => a.id === saved.id);
    if (idx >= 0) {
      updatedList[idx] = saved;
    } else {
      updatedList = [saved, ...updatedList];
    }
    setAttendees(updatedList);

    const nextIds = selectedAttendeeIds.includes(saved.id)
      ? selectedAttendeeIds
      : [...selectedAttendeeIds, saved.id];
    setSelectedAttendeeIds(nextIds);
    syncAttendeesToFields(nextIds, updatedList);

    // 📷 저장된 파트너의 양식지 이미지도 블로그 사진 목록에 자동 등록
    if (saved.sheetImages && saved.sheetImages.length > 0) {
      onAddPhotos?.(
        saved.sheetImages.map((imgUrl, idx) => ({
          name: `${saved.name}_양식지_p${idx + 1}.jpg`,
          url: imgUrl,
          caption: `${saved.name} 대표님 121 사전 양식지 (${idx + 1}p)`,
        }))
      );
    }
  };

  // 모달에서 삭제 완료 후 콜백
  const handleAttendeeDeleted = (deletedId: string) => {
    const updatedList = attendees.filter((a) => a.id !== deletedId);
    setAttendees(updatedList);
    const nextIds = selectedAttendeeIds.filter((id) => id !== deletedId);
    setSelectedAttendeeIds(nextIds);
    syncAttendeesToFields(nextIds, updatedList);
  };

  const resetFields = () => {
    setSelectedAttendeeIds([]);
    onCustomFieldsChange({
      ...customFields,
      partnerName: '',
      partnerCompany: '',
      partnerField: '',
      targetReferral: '',
      partnerStrength: '',
      sheetSummary: '',
      attendeesJson: '',
      meetingDate: new Date().toISOString().slice(0, 10),
      meetingPlace: '',
      conversationCore: '',
      myInsight: '',
      synergyPlan: '',
    });
    toast.info('원투원 양식이 비워졌습니다. 새 참석자를 선택하거나 직접 입력하세요.');
  };

  const selectedAttendees = attendees.filter((a) => selectedAttendeeIds.includes(a.id));

  return (
    <div className="space-y-4 rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white p-3.5 sm:p-5 shadow-xs">
      {/* ── 1. 헤더 (BNI 원투원 양식) ── */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-indigo-100 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shrink-0">
            <Handshake className="size-4" />
          </span>
          <h3 className="text-sm font-black text-slate-900 break-keep whitespace-nowrap">
            BNI 원투원 양식 (121 미팅)
          </h3>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 whitespace-nowrap shrink-0">
            실제 참석자 양식지 연동
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="size-3 text-indigo-500" />
            <span>+ 새 참석자/양식지 등록</span>
          </button>
          <button
            type="button"
            onClick={resetFields}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition whitespace-nowrap"
            title="양식 비우기"
          >
            <RotateCcw className="size-3 text-slate-400" />
            <span>양식 비우기</span>
          </button>
        </div>
      </div>

      {/* 🌟 1.5 작성자(나 / 호스트 대표님) 프로필 바 */}
      <div className="rounded-xl border border-indigo-200/80 bg-white p-3 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-6 items-center justify-center rounded-lg bg-slate-900 text-white text-[11px] font-black shrink-0">
              나
            </span>
            <div className="truncate flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-900">
                {myProfile.name ? `${myProfile.name} 대표 (글 작성자)` : '내 정보(글 작성자) 등록'}
              </span>
              {myProfile.company ? (
                <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                  {myProfile.company} {myProfile.chapter ? `(${myProfile.chapter})` : ''}
                </span>
              ) : (
                <span className="text-[10.5px] text-amber-600 font-bold">
                  (미등록: 클릭하여 내 사업 정보를 등록해두세요)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingMyProfile(!isEditingMyProfile)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-1 text-[10.5px] font-bold text-slate-600 transition-all shrink-0 active:scale-95"
          >
            {isEditingMyProfile ? '접기' : myProfile.name ? '✏️ 내 정보 수정' : '+ 내 정보 입력'}
          </button>
        </div>

        {/* 내 프로필 요약 (접혀있을 때) */}
        {!isEditingMyProfile && myProfile.name && (
          <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 truncate border-t border-slate-100 pt-1.5 flex-wrap">
            <span className="text-indigo-600 font-bold">💼 내 전문분야:</span>
            <span className="truncate">{myProfile.specialty || '미등록'}</span>
            {myProfile.targetReferral && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-rose-600 font-bold">🎯 내 희망 리퍼럴:</span>
                <span className="truncate">{myProfile.targetReferral}</span>
              </>
            )}
          </div>
        )}

        {/* 내 프로필 인라인 수정 폼 */}
        {isEditingMyProfile && (
          <div className="space-y-3 pt-2 border-t border-indigo-100 animate-in fade-in duration-150">
            <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              💡 <strong>내 121 양식지</strong>를 업로드하거나 내용을 붙여넣으시면, AI가 대표님의 성함, 회사, 챕터, 주력 사업, 희망 리퍼럴을 <strong>자동으로 분석하여 채워드립니다</strong>. 한 번 등록해두면 모든 121 글에 대표님의 시점(1인칭 '저희 회사')으로 자연스럽게 반영됩니다.
            </div>

            {/* 🌟 내 121 양식지 올리고 AI로 자동 채우기 */}
            <div className="rounded-xl border border-indigo-200/90 bg-indigo-50/30 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-950">
                  <Sparkles className="size-3.5 text-indigo-600" />
                  <span>내 121 양식지로 내 정보 자동 완성</span>
                </div>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => setMyUploadMode('file')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      myUploadMode === 'file'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📁 사진/PDF 업로드
                  </button>
                  <button
                    type="button"
                    onClick={() => setMyUploadMode('text')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      myUploadMode === 'text'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 텍스트/카톡 붙여넣기
                  </button>
                </div>
              </div>

              {myUploadMode === 'file' ? (
                <div>
                  <input
                    ref={myFileInputRef}
                    type="file"
                    accept="image/*,application/pdf,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMyFileSelect(file);
                      e.target.value = '';
                    }}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsMyDragging(true);
                    }}
                    onDragLeave={() => setIsMyDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsMyDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleMyFileSelect(file);
                    }}
                    onClick={() => !isParsingMySheet && myFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all bg-white ${
                      isMyDragging
                        ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                        : 'border-indigo-200/80 hover:border-indigo-400 hover:bg-indigo-50/20'
                    }`}
                  >
                    {isParsingMySheet ? (
                      <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                        <Loader2 className="size-5 text-indigo-600 animate-spin" />
                        <span className="text-xs font-bold text-indigo-900">
                          AI가 내 121 양식지를 분석하는 중...
                        </span>
                        <span className="text-[10px] text-slate-500">
                          성함, 회사명, BNI 챕터, 전문분야, 타겟 리퍼럴을 자동 추출합니다.
                        </span>
                      </div>
                    ) : myUploadedFile ? (
                      <div className="flex items-center justify-between p-1">
                        <div className="flex items-center gap-2 min-w-0 text-left">
                          <FileCheck className="size-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-800 truncate block">
                              {myUploadedFile.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(myUploadedFile.size / 1024).toFixed(0)} KB • 분석 완료
                            </span>
                          </div>
                        </div>
                        <span className="text-[10.5px] font-bold text-indigo-600 hover:underline shrink-0 ml-2">
                          다른 파일 올리기
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1.5 space-y-1">
                        <UploadCloud className="size-5 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-700">
                          내 121 양식지 파일(PDF, 사진, TXT)을 끌어다 놓거나 클릭하세요
                        </span>
                        <span className="text-[10px] text-slate-400">
                          대용량 PDF도 브라우저에서 텍스트만 안전하게 추출하여 즉시 분석됩니다
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Textarea
                    value={myRawSheetText}
                    onChange={(e) => setMyRawSheetText(e.target.value)}
                    placeholder="카카오톡이나 메모장에 작성해 둔 내 121 양식지 텍스트를 여기에 그대로 붙여넣으세요."
                    rows={3}
                    className="text-xs bg-white resize-y leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isParsingMySheet || !myRawSheetText.trim()}
                      onClick={() => executeParseMySheet({ sheetText: myRawSheetText.trim() })}
                      className="h-7 text-xs px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1"
                    >
                      {isParsingMySheet ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          <span>분석 중...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="size-3" />
                          <span>⚡ 텍스트로 내 정보 자동 채우기</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveMyProfile} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700">내 성함 / 직함 *</Label>
                  <Input
                    value={myProfile.name}
                    onChange={(e) => setMyProfile({ ...myProfile, name: e.target.value })}
                    placeholder="예: 이석호 대표"
                    className="h-8 text-xs bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700">내 회사명</Label>
                  <Input
                    value={myProfile.company}
                    onChange={(e) => setMyProfile({ ...myProfile, company: e.target.value })}
                    placeholder="예: 가호석호 / AI에듀"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700">소속 BNI 챕터</Label>
                  <Input
                    value={myProfile.chapter}
                    onChange={(e) => setMyProfile({ ...myProfile, chapter: e.target.value })}
                    placeholder="예: BNI 마스터 챕터"
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700">내 전문분야 / 주력 사업</Label>
                  <Input
                    value={myProfile.specialty}
                    onChange={(e) => setMyProfile({ ...myProfile, specialty: e.target.value })}
                    placeholder="예: 생성형 AI 교육 및 비즈니스 업무 자동화 솔루션"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <Label className="text-[11px] font-bold text-slate-700">내가 소개받고 싶은 고객 (내 타겟 리퍼럴)</Label>
                <Input
                  value={myProfile.targetReferral || ''}
                  onChange={(e) => setMyProfile({ ...myProfile, targetReferral: e.target.value })}
                  placeholder="예: AI 도입을 희망하는 중소기업 대표, 실무 자동화가 필요한 임직원"
                  className="h-8 text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingMyProfile(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  닫기
                </button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs font-bold bg-slate-900 hover:bg-black text-white px-3"
                >
                  💾 내 정보 저장
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 🌟 2. 회의 참석자(파트너) 선택 바 (실제 등록된 대표님만 표시) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-indigo-600" />
            <span>회의 참석자(파트너) 선택</span>
          </span>
          {attendees.length > 0 && (
            <span className="text-[10px] text-slate-400">
              총 {attendees.length}명의 파트너 등록됨
            </span>
          )}
        </div>

        {attendees.length === 0 ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-indigo-200/80 bg-indigo-50/30 text-xs">
            <span className="text-slate-500 font-medium text-[11px]">
              아직 등록된 파트너가 없습니다.
            </span>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <UserPlus className="size-3" />
              <span>+ 실제 파트너 양식지 등록</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {attendees.map((att) => {
              const isSelected = selectedAttendeeIds.includes(att.id);
              return (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => handleToggleAttendee(att)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  {isSelected && <Check className="size-3 text-white" />}
                  <span>{att.name}</span>
                  <span
                    className={`text-[10px] font-normal ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {att.company}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 🌟 3. 회의 참석자 요약 바 (다중 참석자 및 컴팩트 접이식 지원) */}
      {selectedAttendees.length > 0 && (
        <div className="space-y-2">
          {selectedAttendees.length > 1 && (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs">
              <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                <Users className="size-3.5 text-indigo-600" />
                <span>다자간 121 미팅 (참석 파트너 {selectedAttendees.length}명)</span>
              </span>
              <button
                type="button"
                onClick={handleClearAllAttendees}
                className="text-[10.5px] text-slate-500 hover:text-rose-600 font-bold underline transition-colors"
              >
                전체 해제
              </button>
            </div>
          )}

          {selectedAttendees.map((att) => (
            <div key={att.id} className="rounded-xl border border-indigo-200 bg-white p-2.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-2xs shrink-0">
                    {att.name.slice(0, 1)}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900">
                        {att.name}
                      </h4>
                      <span className="rounded bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 text-[9.5px] font-bold text-indigo-700">
                        {att.company}
                      </span>
                      {att.chapter && (
                        <span className="text-[9.5px] text-slate-400 font-medium">
                          ({att.chapter})
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-indigo-900/80 font-medium truncate">
                      💼 {att.specialty || '전문 분야'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 px-2 py-1 text-[10.5px] font-bold transition-all active:scale-95"
                  >
                    {isSummaryExpanded ? (
                      <>
                        <span>요약 접기</span>
                        <ChevronUp className="size-3" />
                      </>
                    ) : (
                      <>
                        <span>양식지 확인</span>
                        <ChevronDown className="size-3" />
                      </>
                    )}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(att)}
                    className="h-6 px-1.5 text-[10.5px] text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                    title="참석자 양식지 직접 수정"
                  >
                    <Edit3 className="size-3 mr-0.5" />
                    수정
                  </Button>
                </div>
              </div>

              {/* 세부 양식지 펼침 영역 */}
              {isSummaryExpanded && (
                <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-rose-50/60 border border-rose-100 p-2 space-y-0.5">
                      <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                        <Target className="size-3 text-rose-600" />
                        <span>이상적인 리퍼럴 (소개 희망 고객)</span>
                      </div>
                      <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                        {att.targetReferral || '미등록'}
                      </p>
                    </div>

                    <div className="rounded-lg bg-amber-50/60 border border-amber-100 p-2 space-y-0.5">
                      <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <Award className="size-3 text-amber-600" />
                        <span>차별화된 핵심 강점 &amp; 경쟁력</span>
                      </div>
                      <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                        {att.partnerStrength || '미등록'}
                      </p>
                    </div>
                  </div>

                  {att.sheetSummary && (
                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700 mr-1">📄 사전 양식지 메모:</span>
                      <span>{att.sheetSummary}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🌟 4. [핵심 입력] 오늘 대화 내용 & 비즈니스 인사이트 (최상단 전면 배치) ── */}
      <div className="rounded-xl border-2 border-indigo-300 bg-gradient-to-b from-indigo-50/60 via-white to-purple-50/20 p-3 sm:p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
            <MessageSquareText className="size-4 text-indigo-600" />
            <span>오늘 나눈 대화 내용 &amp; 비즈니스 인사이트 (121 미팅 메모)</span>
          </div>
          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
            실제 대화 메모 반영
          </span>
        </div>

        {/* 🎙️ 클로바노트 / 녹음본 텍스트 전문 입력 및 AI 자동 분석 박스 */}
        <div className="rounded-xl border border-indigo-200 bg-white p-3 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
              <Mic className="size-3.5 text-rose-500 animate-pulse" />
              <span>🎙️ 녹음본 대화 전문 (클로바노트 / STT 텍스트)</span>
              <span className="text-[9.5px] font-normal text-slate-500">
                (원문 그대로 붙여넣기)
              </span>
            </Label>
            {customFields.meetingTranscript && (
              <button
                type="button"
                onClick={() => handleField('meetingTranscript', '')}
                className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
              >
                지우기
              </button>
            )}
          </div>

          <Textarea
            value={customFields.meetingTranscript || ''}
            onChange={(e) => handleField('meetingTranscript', e.target.value)}
            placeholder="클로바노트, 비토, 스마트폰 음성메모에서 복사한 대화 텍스트 전문을 여기에 그대로 붙여넣으세요. (AI가 자동으로 대화 핵심, 인사이트, 협업 약속을 분석해 드립니다)"
            rows={3}
            className="text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-colors resize-y leading-relaxed"
          />

          <div className="flex items-center justify-between pt-0.5">
            <p className="text-[10px] text-slate-500 leading-tight">
              💡 붙여넣고 버튼을 누르면 아래 항목들이 자동 요약 입력됩니다.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={isAnalyzingTranscript || !customFields.meetingTranscript?.trim()}
              onClick={handleAnalyzeTranscript}
              className="h-7 text-xs px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-2xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              {isAnalyzingTranscript ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>대화 분석 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="size-3 text-yellow-300" />
                  <span>⚡ AI 대화 분석 &amp; 자동 채우기</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-800">
            오늘 나눈 대화의 핵심 &amp; 인상 깊었던 이야기
          </Label>
          <Textarea
            value={customFields.conversationCore || ''}
            onChange={(e) => handleField('conversationCore', e.target.value)}
            placeholder="오늘 어떤 주제로 이야기했는지, 대표님의 이야기 중 기억에 남는 실제 메모를 적어주세요."
            rows={2}
            className="text-xs bg-white resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Lightbulb className="size-3 text-amber-500" />
              나의 비즈니스 인사이트 (내 사업에 적용할 점)
            </Label>
            <Textarea
              value={customFields.myInsight || ''}
              onChange={(e) => handleField('myInsight', e.target.value)}
              placeholder="만남을 통해 얻은 깨달음이나 내 사업에 적용하고 싶은 점"
              rows={2}
              className="text-xs bg-white resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Handshake className="size-3 text-emerald-600" />
              상생 협업 / 다음 약속
            </Label>
            <Textarea
              value={customFields.synergyPlan || ''}
              onChange={(e) => handleField('synergyPlan', e.target.value)}
              placeholder="서로 주고받을 수 있는 비즈니스 소개, 시너지 프로젝트, 다음 약속한 일정"
              rows={2}
              className="text-xs bg-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── 5. 사전 양식지 세부 항목 직접 확인/수정 (선택 접이식 아코디언) ── */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsPreSheetExpanded(!isPreSheetExpanded)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 text-slate-500" />
            <span>사전 양식지 기본 정보 직접 수정 (선택사항)</span>
            <span className="text-[10px] font-normal text-slate-400">
              (파트너 정보 · GAINS · 일시/장소)
            </span>
          </div>
          {isPreSheetExpanded ? (
            <ChevronUp className="size-4 text-slate-400" />
          ) : (
            <ChevronDown className="size-4 text-slate-400" />
          )}
        </button>

        {isPreSheetExpanded && (
          <div className="p-3.5 pt-1 space-y-3 border-t border-slate-200 bg-white animate-in fade-in duration-150">
            {/* 1. 파트너 기본 정보 */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">1. 파트너 대표님 기본 정보</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">성함 *</Label>
                  <Input
                    value={customFields.partnerName || ''}
                    onChange={(e) => handleField('partnerName', e.target.value)}
                    placeholder="예: 홍길동 대표"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">회사명/챕터</Label>
                  <Input
                    value={customFields.partnerCompany || ''}
                    onChange={(e) => handleField('partnerCompany', e.target.value)}
                    placeholder="예: OO솔루션 (BNI 챕터)"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">전문분야</Label>
                  <Input
                    value={customFields.partnerField || ''}
                    onChange={(e) => handleField('partnerField', e.target.value)}
                    placeholder="예: 기업 브랜딩"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* 2. GAINS 프로필 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block">2. 비즈니스 프로필 &amp; GAINS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">이상적인 추천 고객 (타겟 리퍼럴)</Label>
                  <Input
                    value={customFields.targetReferral || ''}
                    onChange={(e) => handleField('targetReferral', e.target.value)}
                    placeholder="어떤 고객을 소개받길 원하는지"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">차별화된 핵심 강점 &amp; 경쟁력</Label>
                  <Input
                    value={customFields.partnerStrength || ''}
                    onChange={(e) => handleField('partnerStrength', e.target.value)}
                    placeholder="대표님만의 독보적인 강점"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* 3. 미팅 일시 및 장소 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block">3. 미팅 일시 및 장소</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">미팅 일자</Label>
                  <Input
                    type="date"
                    value={customFields.meetingDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => handleField('meetingDate', e.target.value)}
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-slate-600">미팅 장소</Label>
                  <Input
                    value={customFields.meetingPlace || ''}
                    onChange={(e) => handleField('meetingPlace', e.target.value)}
                    placeholder="예: 비즈니스 라운지 카페"
                    className="h-7 text-xs bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 8. 블로그 본문 포함 블록 선택 (토글) ── */}
      <div className="pt-2 border-t border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <CheckSquare className="size-3.5 text-indigo-600" />
            블로그 본문 포함 블록 선택
          </span>
          <span className="text-[10px] text-slate-400">
            체크된 항목 중심으로 6단계 서사가 완성됩니다
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includePartnerIntro}
              onChange={(e) => setIncludePartnerIntro(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">① 만남 배경 &amp; 대표님 소개</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeStrength}
              onChange={(e) => setIncludeStrength(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">② 차별화 강점 &amp; 주력 비즈니스</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeConversation}
              onChange={(e) => setIncludeConversation(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">③ 대화 핵심 &amp; 스토리</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeInsight}
              onChange={(e) => setIncludeInsight(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">④ 나의 비즈니스 인사이트</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeSynergy}
              onChange={(e) => setIncludeSynergy(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">⑤ 상생 협업 &amp; 리퍼럴 기회</span>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={includeLocationMap}
              onChange={(e) => setIncludeLocationMap(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-[11px] font-semibold text-slate-700">⑥ 미팅 장소 및 파트너사 정보 안내</span>
          </label>
        </div>
      </div>

      {/* ── 참석자 등록/수정 모달 ── */}
      <AttendeeManageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        attendee={editingAttendee}
        userId={user?.uid}
        onSaved={handleAttendeeSaved}
        onDeleted={handleAttendeeDeleted}
        onAddPhotos={onAddPhotos}
      />
    </div>
  );
}
