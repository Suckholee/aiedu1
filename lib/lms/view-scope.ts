export function acceptsScope(started:string,current:string,actor:string|null|undefined,member:string|undefined){return started===current&&(!actor||actor===member);}
