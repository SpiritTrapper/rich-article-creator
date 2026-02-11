import { InputHTMLAttributes } from "react";

import clsx from "clsx";
import { Controller, useFormContext } from "react-hook-form";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  className?: string;
  errorMessage?: string;
}

export default function EditorInput({ name, label, errorMessage, className, ...props }: Props) {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col gap-2 items-start w-full">
      {label && <h5 className="t5 m-0">{label}</h5>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...props}
            {...field}
            type="text"
            autoComplete="off"
            aria-autocomplete="none"
            className={clsx("border border-transparent", className, {
              "border-(--Colors-Red)!": !!errorMessage,
            })}
          />
        )}
      />
      {!!errorMessage && <p className="t5 m-0 text-(--Colors-Red)">{errorMessage}</p>}
    </div>
  );
}
