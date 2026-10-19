/** Display formatting only: never interpret a phone number as a numeric value. */
export function phoneDigits(value: string) {
  return value.trim().replace(/^\+82[\s-]*/, '0').replace(/\D/g, '');
}
export function formatPhone(value: string) {
  const digits = phoneDigits(value);
  const first = digits.startsWith('02') ? 2 : /^050[2-8]/.test(digits) ? 4 : 3;
  const middle = digits.startsWith('02') ? (digits.length > 9 ? 4 : 3)
    : /^050[2-8]/.test(digits) || digits.startsWith('010') || digits.length > 10 ? 4 : 3;
  if (!digits.startsWith('0')) return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
  if (digits.length <= first) return digits;
  if (digits.length <= first + middle) return `${digits.slice(0, first)}-${digits.slice(first)}`;
  return `${digits.slice(0, first)}-${digits.slice(first, first + middle)}-${digits.slice(first + middle)}`;
}
/** Preserve the caret's digit position when separators are inserted or removed. */
export function phoneCaret(formatted: string, digitsBefore: number) {
  if (!digitsBefore) return 0;
  let count = 0;
  for (let index = 0; index < formatted.length; index++) {
    if (/\d/.test(formatted[index]) && ++count === digitsBefore) return index + 1;
  }
  return formatted.length;
}

/** Native inputType also handles separator deletion on mobile software keyboards. */
export function phoneEdit(raw: string, selection: number, previous: string, inputType?: string) {
  let digits = phoneDigits(raw), before = phoneDigits(raw.slice(0, selection)).length;
  if (digits === phoneDigits(previous) && inputType?.startsWith('delete')) {
    const index = inputType === 'deleteContentBackward' ? before - 1 : before;
    if (index >= 0 && index < digits.length) {
      digits = digits.slice(0, index) + digits.slice(index + 1);
      if (inputType === 'deleteContentBackward') before--;
    }
  }
  const formatted = formatPhone(digits);
  return { formatted, caret: phoneCaret(formatted, before) };
}
