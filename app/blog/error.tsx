'use client';
export default function BlogError({reset}:{reset:()=>void}){return <div className="mx-auto max-w-3xl px-6 py-24"><h1 className="text-2xl font-semibold">블로그를 불러오지 못했습니다.</h1><p className="mt-4 text-sm text-slate-500">잠시 후 다시 확인해주세요.</p><button onClick={reset} className="mt-6 rounded-full border px-6 py-3 text-sm">다시 불러오기</button></div>;}
