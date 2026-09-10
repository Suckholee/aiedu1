import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { autoResize?: boolean; showCount?: boolean; maxLength?: number }
>(({ className, autoResize, showCount, maxLength, onChange, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = React.useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoResize) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize]);

  React.useEffect(() => {
    adjustHeight();
  }, [props.value, adjustHeight]);

  // resize 이벤트에 반응 — 온보딩 전환 후 높이 재계산용
  React.useEffect(() => {
    if (!autoResize) return;
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [autoResize, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    if (autoResize) {
      requestAnimationFrame(adjustHeight);
    }
  };

  const charCount = typeof props.value === 'string' ? props.value.length : 0;

  return (
    <div className="relative">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          autoResize && "resize-none overflow-hidden",
          showCount && "pb-7",
          className
        )}
        ref={(el) => {
          innerRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
        }}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
      {showCount && (
        <span className={cn(
          "absolute bottom-2 right-3 text-[11px] tabular-nums pointer-events-none",
          maxLength && charCount > maxLength * 0.9 ? "text-amber-500" : "text-slate-400"
        )}>
          {charCount.toLocaleString()}{maxLength ? ` / ${maxLength.toLocaleString()}` : '자'}
        </span>
      )}
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
