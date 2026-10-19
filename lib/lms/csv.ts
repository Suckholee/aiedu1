// Quote every cell and neutralize spreadsheet formula prefixes in user-supplied values.
export function csvDocument(rows:unknown[][]){return '\ufeff'+rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
