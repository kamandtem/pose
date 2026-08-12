import React from 'react';

export const EmptyState: React.FC<{
  emoji: string;
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}> = ({ emoji, title, text, action }) => (
  <div className="card p-8 text-center">
    <div className="text-4xl mb-3">{emoji}</div>
    <h3 className="font-extrabold text-[15px]">{title}</h3>
    <p className="text-[12px] text-muted leading-relaxed mt-2 max-w-xs mx-auto">{text}</p>
    {action && (
      <button onClick={action.onClick} className="btn btn-primary mt-5">
        {action.label}
      </button>
    )}
  </div>
);
