import { GoogleAIFileManager } from '@google/generative-ai/server';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  deleteObject,
  getBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../firebase';
import type { RagDocument, RagFolder } from './types';

const COLLECTION = 'blog-auto-documents';
const FOLDERS_COLLECTION = 'blog-auto-folders';

const fileManager = new GoogleAIFileManager(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

// ─── Register (Storage 업로드는 클라이언트에서 완료) ────

export async function registerRagDocument(params: {
  storagePath: string;
  fileName: string;
  mimeType: string;
  topic: string;
  sizeBytes: number;
  fileBuffer: Buffer;
  folderId?: string;
}): Promise<RagDocument> {
  const { storagePath, fileName, mimeType, topic, sizeBytes, fileBuffer, folderId } = params;

  // 1. Gemini File API에 업로드
  const { tmpFilePath, cleanup } = await writeTempFile(fileBuffer, fileName);
  let geminiFile;
  try {
    geminiFile = await fileManager.uploadFile(tmpFilePath, {
      mimeType,
      displayName: fileName,
    });
  } finally {
    cleanup();
  }

  // 2. Firestore에 메타데이터 저장
  const expiry = new Date(Date.now() + 47 * 60 * 60 * 1000); // 47시간 (안전 마진)
  const docRef = await addDoc(collection(db, COLLECTION), {
    fileName,
    mimeType,
    storagePath,
    geminiFileUri: geminiFile.file.uri,
    geminiFileExpiry: Timestamp.fromDate(expiry),
    topic,
    sizeBytes,
    ...(folderId ? { folderId } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as RagDocument;
}

// ─── URI 갱신 ────────────────────────────────────

export async function ensureValidFileUri(ragDoc: RagDocument): Promise<string> {
  const now = new Date();
  const expiry = ragDoc.geminiFileExpiry.toDate();

  if (now < expiry) {
    return ragDoc.geminiFileUri;
  }

  // 만료됨 → Storage에서 다시 업로드
  const storageRef = ref(storage, ragDoc.storagePath);
  const fileBytes = await getBytes(storageRef);
  const buffer = Buffer.from(fileBytes);

  const { tmpFilePath, cleanup } = await writeTempFile(buffer, ragDoc.fileName);
  let geminiFile;
  try {
    geminiFile = await fileManager.uploadFile(tmpFilePath, {
      mimeType: ragDoc.mimeType,
      displayName: ragDoc.fileName,
    });
  } finally {
    cleanup();
  }

  const newExpiry = new Date(Date.now() + 47 * 60 * 60 * 1000);
  await updateDoc(doc(db, COLLECTION, ragDoc.id), {
    geminiFileUri: geminiFile.file.uri,
    geminiFileExpiry: Timestamp.fromDate(newExpiry),
    updatedAt: serverTimestamp(),
  });

  return geminiFile.file.uri;
}

// ─── 조회 ────────────────────────────────────────

export async function getRagDocuments(): Promise<RagDocument[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RagDocument));
}

export async function getRagDocument(id: string): Promise<RagDocument | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as RagDocument;
}

// ─── 삭제 ────────────────────────────────────────

export async function deleteRagDocument(id: string): Promise<void> {
  const ragDoc = await getRagDocument(id);
  if (!ragDoc) return;

  // Storage 파일 삭제
  try {
    await deleteObject(ref(storage, ragDoc.storagePath));
  } catch {
    // Storage 삭제 실패해도 계속 진행
  }

  // Gemini 파일 삭제 시도
  try {
    const fileName = ragDoc.geminiFileUri.split('/').pop();
    if (fileName) {
      await fileManager.deleteFile(fileName);
    }
  } catch {
    // Gemini 파일 삭제 실패해도 계속 진행
  }

  // Firestore 메타데이터 삭제
  await deleteDoc(doc(db, COLLECTION, id));
}

// ─── 이미지 다운로드 URL ─────────────────────

export async function getImageDownloadUrl(ragDoc: RagDocument): Promise<string | null> {
  if (!ragDoc.mimeType.startsWith('image/')) return null;
  try {
    return await getDownloadURL(ref(storage, ragDoc.storagePath));
  } catch {
    return null;
  }
}

// ─── Folder CRUD ─────────────────────────────────

const FOLDER_COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export async function createRagFolder(name: string): Promise<RagFolder> {
  const existing = await getRagFolders();
  const color = FOLDER_COLORS[existing.length % FOLDER_COLORS.length];
  const docRef = await addDoc(collection(db, FOLDERS_COLLECTION), {
    name,
    color,
    createdAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as RagFolder;
}

export async function getRagFolders(): Promise<RagFolder[]> {
  const q = query(collection(db, FOLDERS_COLLECTION), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RagFolder));
}

export async function deleteRagFolder(folderId: string): Promise<void> {
  // 폴더 내 문서들을 루트로 이동
  const docs = await getRagDocuments();
  const folderDocs = docs.filter((d) => d.folderId === folderId);
  for (const d of folderDocs) {
    await updateDoc(doc(db, COLLECTION, d.id), { folderId: '', updatedAt: serverTimestamp() });
  }
  await deleteDoc(doc(db, FOLDERS_COLLECTION, folderId));
}

export async function updateDocFolder(docId: string, folderId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, docId), {
    folderId: folderId || '',
    updatedAt: serverTimestamp(),
  });
}

// ─── Helpers ─────────────────────────────────────

async function writeTempFile(
  buffer: Buffer,
  fileName: string
): Promise<{ tmpFilePath: string; cleanup: () => void }> {
  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');

  const tmpDir = os.tmpdir();
  const tmpFilePath = path.join(tmpDir, `rag_${Date.now()}_${fileName}`);
  fs.writeFileSync(tmpFilePath, buffer);

  return {
    tmpFilePath,
    cleanup: () => {
      try {
        fs.unlinkSync(tmpFilePath);
      } catch {
        // ignore
      }
    },
  };
}
