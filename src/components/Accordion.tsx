import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const KEY = 'pd_accordion_v1';

function readState(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function writeState(v: Record<string, boolean>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

interface Props {
  /** کلید ذخیره وضعیت باز/بسته بودن؛ بین ژست‌ها مشترک است */
  id?: string;
  title: string;
  icon?: React.ReactNode;
  /** خلاصه‌ای که وقتی بسته است کنار عنوان دیده می‌شود */
  hint?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** بخش اکاردئونی: عنوان همیشه دیده می‌شود، محتوا با لمس باز و بسته می‌شود. */
export const Accordion: React.FC<Props> = ({
  id,
  title,
  icon,
  hint,
  badge,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState<boolean>(() => {
    const saved = readState()[id ? id : title];
    return typeof saved === 'boolean' ? saved : defaultOpen;
  });

  useEffect(() => {
    const saved = readState()[id ? id : title];
    setOpen(typeof saved === 'boolean' ? saved : defaultOpen);
  }, [id, defaultOpen]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    const all = readState();
    all[id ? id : title] = next;
    writeState(all);
  };

  return (
    <section className="card overflow-hidden">
      <button
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3.5 text-right"
      >
        {icon}
        <span className="flex-1 min-w-0">
          <span className="block font-extrabold text-[14px]">{title}</span>
          {!open && hint && (
            <span className="block text-[10.5px] text-muted mt-1 line-clamp-1">{hint}</span>
          )}
        </span>
        {badge}
        <ChevronDown
          className="w-4 h-4 shrink-0 text-faint"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-line a-fade">{children}</div>
      )}
    </section>
  );
};
