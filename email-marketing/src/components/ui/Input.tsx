import * as React from "react";
import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <label className="grid gap-1">
      {label && <span className="text-sm text-neutral-700">{label}</span>}
      <input
        className={clsx(
          "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black",
          className
        )}
        {...props}
      />
    </label>
  );
};
