import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const url = new URL(`http://${request.headers.get('host') ?? ''}`);
    if (process.env.NODE_ENV !== 'development' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))
        return new Response('로컬 환경 전용', { status: 403 });
    const { id } = await params;
    if (!/^[a-f0-9-]{36}\.(pdf|pptx|ppt|docx|xlsx|txt)$/.test(id))
        return new Response('파일 없음', { status: 404 });
    try {
        const bytes = await readFile(path.join(process.cwd(), '.local-data', 'files', id));
        const ext = path.extname(id);
        return new Response(bytes, { headers: { 'Content-Type': ext === '.pdf' ? 'application/pdf' : 'application/octet-stream', 'Content-Disposition': `${ext === '.pdf' ? 'inline' : 'attachment'}; filename="${id}"`, 'X-Content-Type-Options': 'nosniff' } });
    }
    catch {
        return new Response('파일 없음', { status: 404 });
    }
}
