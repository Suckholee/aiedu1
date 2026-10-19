// Linking a legacy order keeps the unused generated order as cancelled history.
// Choose the live order for a given application cycle before considering that history.
export function applicationOrder<T extends {enrollment_id:string|null;enrollment_applied_at:string|null;status:string;created_at:string}>(orders:T[],enrollment:{id:string;applied_at:string}){const matches=orders.filter(o=>o.enrollment_id===enrollment.id&&o.enrollment_applied_at===enrollment.applied_at);return matches.find(o=>o.status!=='cancelled')??matches.sort((a,b)=>b.created_at.localeCompare(a.created_at))[0];}
