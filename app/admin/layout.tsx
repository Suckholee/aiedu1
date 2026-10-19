import type { ReactNode } from 'react';
import { currentMember } from '@/lib/lms/access';
import { AdminAccess } from '@/components/lms/AdminAccess';
export default async function AdminLayout({children}:{children:ReactNode}) {
  const member=await currentMember();
  if(!member?.roles.some(r=>['admin','operations','finance'].includes(r)))return <AdminAccess/>;
  return children;
}
