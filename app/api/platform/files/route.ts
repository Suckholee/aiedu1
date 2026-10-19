import { platformIdentity, isPlatformAdmin, visiblePlatform } from '@/lib/platform-access';
import { platformBucket } from '@/lib/firebase-admin';
import path from 'node:path';
import { readPlatform } from '@/lib/platform-store';
import {requireMember,requireSameOrigin,LmsError} from '@/lib/lms/access';
import {resolveCohort,legacyLearningCommand} from '@/lib/lms/platform-learning';
export const runtime = 'nodejs';
export async function POST(request: Request) {
    try {
        requireSameOrigin(request);
        const member=await requireMember(['admin','operations']);
        const user = await platformIdentity(request);
        if(member.legacy_firebase_uid!==user?.uid)throw new LmsError('현재 계정으로 다시 로그인하세요.',401);
        if (!isPlatformAdmin(user)) return Response.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        const form = await request.formData();
        const file = form.get('file');
        const courseId = String(form.get('courseId') ?? '');
        if (!(file instanceof File) || file.size === 0 || file.size > 20 * 1024 * 1024)
            throw Error('20MB 이하의 파일을 선택하세요.');
        await resolveCohort(courseId);
        const ext = path.extname(file.name).toLowerCase();
        if (!['.pdf', '.pptx', '.ppt', '.docx', '.xlsx', '.txt'].includes(ext))
            throw Error('PDF, PPT, Word, Excel, TXT 자료만 업로드할 수 있습니다.');
        const id = crypto.randomUUID() + ext;
        const object = platformBucket.file(`aieduPlatforms/main/files/${id}`);
        const token = crypto.randomUUID();
        await object.save(Buffer.from(await file.arrayBuffer()), { resumable: false, metadata: { contentType: file.type || 'application/octet-stream', metadata: { firebaseStorageDownloadTokens: token } } });
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${platformBucket.name}/o/${encodeURIComponent(object.name)}?alt=media&token=${token}`;
        let registered=false;
        try {
            await legacyLearningCommand({action:'material',courseId,title:file.name,url:downloadUrl},member);
            registered=true;
            const data=await readPlatform();
            return Response.json(visiblePlatform(data, user),{headers:{'Cache-Control':'private, no-store','Vary':'Cookie, Authorization'}});
        }
        catch (e) {
            if(!registered)await object.delete();
            throw e;
        }
    }
    catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : '업로드 실패' }, { status: e instanceof LmsError?e.status:400,headers:{'Cache-Control':'private, no-store'} });
    }
}
