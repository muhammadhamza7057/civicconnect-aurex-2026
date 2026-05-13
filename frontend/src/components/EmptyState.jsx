import React from 'react';
import Lottie from 'lottie-react';
import emptyAnimation from '../animations/empty-state.json';

export function EmptyState({ title, description, action }) {
  return (
    <div className="cc-card flex flex-col items-center justify-center p-8 text-center">
      <div className="h-40 w-40">
        <Lottie animationData={emptyAnimation} loop />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
