'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import { formatPhone, phoneEdit } from '@/lib/ui/phone';

type PhoneInputProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/** Use for phone fields throughout the platform; accepts digits and pasted numbers. */
export function PhoneInput({ value, defaultValue = '', onValueChange, ...props }: PhoneInputProps) {
  const [local, setLocal] = useState(() => formatPhone(defaultValue));
  useEffect(() => { if (value === undefined) setLocal(formatPhone(defaultValue)); }, [defaultValue, value]);
  const displayed = formatPhone(value ?? local);
  return <input {...props} type="tel" inputMode="numeric" autoComplete={props.autoComplete ?? 'tel'} value={displayed}
    onChange={event => {
      const input = event.currentTarget, raw = input.value;
      const { formatted, caret } = phoneEdit(raw, input.selectionStart ?? raw.length, displayed, (event.nativeEvent as InputEvent).inputType);
      if (value === undefined) setLocal(formatted);
      onValueChange?.(formatted);
      requestAnimationFrame(() => {
        if (input.isConnected && document.activeElement === input) input.setSelectionRange(caret, caret);
      });
    }}/>
}
