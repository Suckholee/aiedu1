import { platformIdentity, isPlatformAdmin, visiblePlatform } from '@/lib/platform-access';
import { platformBucket } from '@/lib/firebase-admin';
import path from 'node:path';
import { mutatePlatform } from '@/lib/platform-store';
export const runtime = 'nodejs';
export async function POST(request: Request) {
    try {
        const user = await platformIdentity(request);
        if (!isPlatformAdmin(user)) return Response.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        const form = await request.formData();
        const file = form.get('file');
        const courseId = String(form.get('courseId') ?? '');
        if (!(file instanceof File) || file.size === 0 || file.size > 20 * 1024 * 1024)
            throw Error('20MB 이하의 파일을 선택하세요.');
        const ext = path.extname(file.name).toLowerCase();
        if (!['.pdf', '.pptx', '.ppt', '.docx', '.xlsx', '.txt'].includes(ext))
            throw Error('PDF, PPT, Word, Excel, TXT 자료만 업로드할 수 있습니다.');
        const id = crypto.randomUUID() + ext;
        const object = platformBucket.file(`aieduPlatforms/main/files/${id}`);
        const token = crypto.randomUUID();
        await object.save(Buffer.from(await file.arrayBuffer()), { resumable: false, metadata: { contentType: file.type || 'application/octet-stream', metadata: { firebaseStorageDownloadTokens: token } } });
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${platformBucket.name}/o/${encodeURIComponent(object.name)}?alt=media&token=${token}`;
        try {
            const data = await mutatePlatform(d => { if (!d.courses.some(c => c.id === courseId))
                throw Error('과정을 찾을 수 없습니다.'); d.materials.push({ id: crypto.randomUUID(), courseId, title: file.name, url: downloadUrl, createdAt: new Date().toISOString() }); d.logs.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), message: '자료 파일 업로드' }); });
            return Response.json(visiblePlatform(data, user));
        }
        catch (e) {
            await object.delete();
            throw e;
        }
    }
    catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : '업로드 실패' }, { status: 400 });
    }
}
