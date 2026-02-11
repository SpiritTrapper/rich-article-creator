import { ButtonHTMLAttributes, forwardRef, ForwardedRef, ReactNode } from "react";

import clsx from "clsx";

type StyleType = "blank" | "gray" | "gray-border" | "dark";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  styleType?: StyleType;
  children?: ReactNode;
}

const styleMap: Record<StyleType, string> = {
  blank: "bg-transparent border-none cursor-pointer inline-flex items-center justify-center p-0",
  gray: "bg-[var(--Monochrome-Fields,#f5f5f5)] border-none rounded-xl cursor-pointer inline-flex items-center justify-center px-3 py-2",
  "gray-border":
    "bg-transparent border border-[var(--monochrome-outline-lines,#e0e0e0)] rounded-xl cursor-pointer inline-flex items-center justify-center px-3 py-2 text-sm",
  dark: "bg-[var(--Monochrome-Main-color,#1a1a1a)] text-white border-none rounded-xl cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm",
};

function ButtonInner(
  { styleType = "blank", className, children, disabled, ...rest }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      className={clsx(styleMap[styleType], disabled && "opacity-50 cursor-not-allowed", className)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

const Button = forwardRef(ButtonInner);
Button.displayName = "Button";

export default Button;
