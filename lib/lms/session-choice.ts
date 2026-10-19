import type {LmsMember} from './types';
// On restore the verified Supabase session wins. An explicit Google login may select another identity.
export function chooseSession(member:LmsMember|null|undefined,firebaseUid:string|null,explicitGoogle=false){return member&&(!explicitGoogle||member.legacy_firebase_uid===firebaseUid)?member:null;}
