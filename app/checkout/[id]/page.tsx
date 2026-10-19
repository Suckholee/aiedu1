import {CheckoutPanel} from '@/components/lms/CheckoutPanel';
export const metadata={title:'주문·결제 안내 | 네오앤피터'};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <CheckoutPanel orderId={id}/>;}
