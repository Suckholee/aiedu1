import type {BlogCategory} from '@/lib/brand-blog/types';

// Original geometric cover artwork, shared by the journal and landing-page cards.
export function BlogCover({category,slug}:{category:BlogCategory;slug:string}){
 const seed=Array.from(slug).reduce((value,char)=>(Math.imul(value,31)+char.charCodeAt(0))>>>0,7);
 const palettes={workflow:[['#df402e','#1c6395','#e3bc4f'],['#b84b37','#304f60','#c8ac5a'],['#ca5c46','#4c6c61','#dcc785']],content:[['#c66c4d','#6d7970','#e0b753'],['#b75452','#728b9a','#debd82'],['#a86645','#647967','#d3aa6b']],platform:[['#556b91','#8c9aba','#eed47b'],['#466c6a','#8eb0a6','#e5c389'],['#6f6383','#a39ab1','#e3c785']],ai:[['#253e39','#7b9185','#e0bd62'],['#354d65','#8c9dab','#d7bc83'],['#51455c','#a395a0','#dbbb79']]};
 const [primary,secondary,accent]=palettes[category][seed%3];
 const composition=(seed>>>4)%3;
 const x=100+(seed%7)*20;

 const common={className:'h-full w-full',viewBox:'0 0 600 400',preserveAspectRatio:'xMidYMid slice','aria-hidden':true as const,focusable:false as const};
 if(composition===1)return <svg {...common}>
  <rect width="600" height="400" fill="#ece8dc"/>
  <rect x={x} width={600-x} height="400" fill={primary}/>
  <circle cx={x+100} cy="200" r="142" fill={accent}/>
  <path d={`M${x+100} 58A142 142 0 0 1 ${x+100} 342Z`} fill={secondary}/>
  <path d={`M${x+100} 0V400`} stroke="#ece8dc" strokeWidth="2"/>
  <path d="M28 44H78M28 58H58M28 342H78M28 356H58" stroke={secondary} strokeWidth="2"/>
  <text x="28" y="378" fill="#34413d" fontSize="10" letterSpacing="3" fontFamily="Arial, sans-serif">A DIFFERENT ANGLE</text>
 </svg>;
 if(composition===2)return <svg {...common}>
  <rect width="600" height="400" fill="#ece8dc"/>
  <path d="M0 80H330V400H0Z" fill={primary}/>
  <path d="M110 0H440V320H110Z" fill={secondary}/>
  <path d="M220 0H600V240H220Z" fill="#c3cfbd"/>
  <path d="M330 0H600V160H330Z" fill={accent}/>
  <path d="M110 80H220V160H330V240H440V320H550" fill="none" stroke="#f8f5e9" strokeWidth="2"/>
  <circle cx="110" cy="80" r="6" fill="#f8f5e9"/><circle cx="550" cy="320" r="6" fill="#f8f5e9"/>
  <text x="28" y="374" fill="#f2f0e7" fontSize="12" letterSpacing="4" fontFamily="Arial, sans-serif">IDEAS INTO PRACTICE</text>
 </svg>;
 if(category==='workflow')return <svg {...common}>
  <rect width="600" height="400" fill="#eeeae0"/>
  <path d="M146 0H600V258H146Z" fill={primary}/>
  <path d="M0 270H132V400H0Z" fill={secondary}/>
  <path d="M474 332H600V400H474Z" fill={accent}/>
  <path d="M140 0V400M0 264H600M468 264V400M468 326H600" stroke="#222c2a" strokeWidth="14"/>
  <circle cx="80" cy="80" r="28" fill="none" stroke="#a29e90" strokeWidth="1"/>
  <path d="M66 80H94M80 66V94" stroke="#a29e90"/>
  <text x="170" y="376" fill="#34413d" fontSize="12" letterSpacing="4" fontFamily="Arial, sans-serif">WORK / FLOW</text>
 </svg>;
 if(category==='content')return <svg {...common}>
  <rect width="600" height="400" fill="#eee7dc"/>
  <rect x="0" width="205" height="400" fill={primary}/>
  <circle cx="350" cy="200" r="151" fill={accent}/>
  <path d="M350 49A151 151 0 0 1 350 351Z" fill={secondary}/>
  <rect x="470" y="0" width="130" height="400" fill="#283d3c"/>
  <path d="M35 50H170M35 70H125M35 330H170M35 350H125" stroke="#f3eadd" strokeWidth="2" opacity=".65"/>
  <text x="228" y="378" fill="#34413d" fontSize="12" letterSpacing="4" fontFamily="Arial, sans-serif">MAKE A STORY</text>
 </svg>;
 if(category==='platform')return <svg {...common}>
  <rect width="600" height="400" fill="#dce4ee"/>
  <path d="M0 80H330V400H0Z" fill={primary}/>
  <path d="M110 0H440V320H110Z" fill={secondary}/>
  <path d="M220 0H600V240H220Z" fill="#c3cfbd"/>
  <path d="M330 0H600V160H330Z" fill={accent}/>
  <path d="M110 80H220V160H330V240H440V320H550" fill="none" stroke="#f8f5e9" strokeWidth="2"/>
  <circle cx="110" cy="80" r="6" fill="#f8f5e9"/><circle cx="550" cy="320" r="6" fill="#f8f5e9"/>
  <text x="28" y="374" fill="#f2f0e7" fontSize="12" letterSpacing="4" fontFamily="Arial, sans-serif">BUILD YOUR OWN</text>
 </svg>;
 return <svg {...common}>
  <rect width="600" height="400" fill="#e7e4d9"/>
  <circle cx="300" cy="200" r="168" fill={primary}/>
  <circle cx="300" cy="200" r="118" fill={secondary}/>
  <circle cx="300" cy="200" r="68" fill={accent}/>
  <path d="M300 0V400M0 200H600" stroke="#e7e4d9" strokeWidth="2"/>
  <path d="M0 0H300V200H0Z" fill="#e7e4d9"/>
  <path d="M48 152L152 48M83 152L152 83M118 152L152 118" stroke="#7b9185" strokeWidth="2"/>
  <text x="28" y="374" fill="#34413d" fontSize="12" letterSpacing="4" fontFamily="Arial, sans-serif">A NEW PERSPECTIVE</text>
 </svg>;
}
