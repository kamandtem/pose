import React from 'react';
import { Menu, Play, Plus } from 'lucide-react';
import { LogoMark } from './Logo';

interface Props {
  onOpenMenu: () => void;
  onOpenShootMode: () => void;
  onOpenAddPose: () => void;
}

export const Header: React.FC<Props> = ({ onOpenMenu, onOpenShootMode, onOpenAddPose }) => (
  <header
    className="sticky top-0 z-40 safe-top border-b border-line"
    style={{
      background: 'color-mix(in srgb, var(--color-bg) 82%, transparent)',
      backdropFilter: 'blur(14px)',
    }}
  >
    <div className="max-w-3xl mx-auto px-3 h-[62px] flex items-center justify-between gap-2">
      {/* لمس لوگو = باز شدن منوی کناری */}
      <button
        onClick={onOpenMenu}
        className="flex items-center gap-2.5 pl-1 pr-0 py-1 rounded-2xl active:scale-95 transition-transform"
        aria-label="باز کردن منو"
      >
        <span className="relative">
          <LogoMark size={38} />
          <span
            className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full flex items-center justify-center border"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-line)',
            }}
          >
            <Menu className="w-2.5 h-2.5 text-gold" />
          </span>
        </span>
        <span className="text-right leading-tight">
          <span className="block font-extrabold text-[14px] gold-text">کارگردان ژست</span>
          <span className="block text-[9px] text-faint tracking-[.18em]">POSE DIRECTOR</span>
        </span>
      </button>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenAddPose}
          className="btn btn-ghost !px-3 !py-2"
          aria-label="افزودن ژست جدید"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span className="hidden sm:inline">ژست جدید</span>
        </button>

        <button onClick={onOpenShootMode} className="btn btn-primary !px-3.5 !py-2">
          <Play className="w-3.5 h-3.5" fill="currentColor" />
          <span>حالت عکاسی</span>
        </button>
      </div>
    </div>
  </header>
);
