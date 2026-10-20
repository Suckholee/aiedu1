import {MapPin,ExternalLink} from 'lucide-react';
import {merchant} from '@/lib/merchant';
export function CourseVenue({location}:{location:string}){
 const venue=location?.trim()||'장소 안내 예정';
 const address=venue.includes('위든타워')?merchant.address.split(',')[0]:'';
 const mapAvailable=!/온라인|비대면|zoom|줌|예정|추후|미정|별도 안내/i.test(venue);
 const query=address?`${address} 위든타워`:venue;
 return <div className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true"/><div className="min-w-0"><p className="font-semibold">{venue}</p>{address&&<p className="mt-1 text-xs text-slate-500">{address}</p>}{mapAvailable&&<a className="mt-2 inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" href={`https://map.naver.com/p/search/${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" aria-label={`${venue} 네이버 지도에서 보기 (새 창)`}>네이버 지도에서 보기<ExternalLink className="size-3" aria-hidden="true"/></a>}</div></div>;
}
