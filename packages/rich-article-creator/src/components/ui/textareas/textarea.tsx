import { TextareaHTMLAttributes, forwardRef, ForwardedRef } from "react";

import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isCounter?: boolean;
}

function TextareaInner(
  { className, isCounter, maxLength, value, ...rest }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        className={clsx(
          "w-full resize-none rounded-xl border border-(--monochrome-outline-lines,#e0e0e0) bg-transparent px-3 py-2 text-sm outline-none",
          "focus:border-(--Monochrome-Main-color,#1a1a1a)",
          className,
        )}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      {isCounter && maxLength != null && (
        <span className="absolute bottom-2 right-3 text-xs text-(--Monochrome-Auxiliary,#999)">
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  );
}

const Textarea = forwardRef(TextareaInner);
Textarea.displayName = "Textarea";

export default Textarea;
