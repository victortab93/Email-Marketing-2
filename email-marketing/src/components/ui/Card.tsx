import * as React from "react";

export const Card: React.FC<React.PropsWithChildren<{ title?: string; actions?: React.ReactNode }>> = ({ title, actions, children }) => {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          <div>{actions}</div>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
