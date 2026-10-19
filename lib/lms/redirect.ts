/** Only same-site paths; never carry tokens or provider error text in redirects. */
export function safeNext(value:string|null|undefined) {
  if(!value||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value)||value.startsWith('/auth/'))return '/';
  try {const url=new URL(value,'https://lms.invalid');return url.origin==='https://lms.invalid'?url.pathname+url.search+url.hash:'/';}catch{return '/';}
}
export function requestOrigin(request:Request) {
  const host=request.headers.get('host')??new URL(request.url).host;
  const local=/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host);
  return `${local?'http':'https'}://${host}`;
}
