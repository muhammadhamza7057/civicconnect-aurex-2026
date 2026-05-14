import React from 'react';

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted">{eyebrow}</p> : null}
        <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-text">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">{action}</div> : null}
    </div>
  );
}
