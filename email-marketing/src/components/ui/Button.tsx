import * as React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button: React.FC<ButtonProps> = ({ variant = "primary", className, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2";
  const styles: Record<string, string> = {
    primary: "bg-black text-white hover:bg-neutral-800 focus:ring-black",
    secondary: "bg-white text-black border border-neutral-200 hover:bg-neutral-100 focus:ring-neutral-200",
    ghost: "bg-transparent text-black hover:bg-neutral-100 focus:ring-neutral-200",
  };
  return <button className={clsx(base, styles[variant], className)} {...props} />;
};
