import React from 'react';

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
