export const normalizeReferralCode = (value: string) => value.trim().replace(/\s/g, '').toUpperCase().replace(/^NP(?=[0-9A-F]{12}$)/, 'NP-');
export const validReferralCode = (value: string) => /^NP-[0-9A-F]{12}$/.test(normalizeReferralCode(value));
export function maskedReferrer(name: string) {
  const chars = Array.from(name.trim());
  return chars.length <= 1 ? '회원' : chars.length === 2 ? `${chars[0]}*` : `${chars[0]}${'*'.repeat(Math.min(3, chars.length - 2))}${chars.at(-1)}`;
}
