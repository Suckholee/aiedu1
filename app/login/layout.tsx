import type {Metadata} from 'next';
export const metadata: Metadata = {title: '이메일 로그인 | 네오앤피터', robots: {index: false, follow: false}};
export default function LoginLayout({children}: {children: React.ReactNode}) {return children;}
