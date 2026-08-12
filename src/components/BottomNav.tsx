import React from 'react';
import { Home, LayoutGrid, MapPin, Heart, Shuffle } from 'lucide-react';
import { ViewTab } from '../types/pose';

interface Props {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onNextPose: () => void;
  favoritesCount: number;
}

const ITEMS: { tab: ViewTab; icon: React.ElementType; label: string }[] = [
  { tab: 'home', icon: Home, label: 'خانه' },
  { tab: 'library', icon: LayoutGrid, label: 'ژست‌ها' },
  { tab: 'locations', icon: MapPin, label: 'لوکیشن' },
  { tab: 'favorites', icon: Heart, label: 'نشان‌شده' },
];

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onNextPose,
  favoritesCount,
}) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-40 safe-bottom border-t border-line"
    style={{
      background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
      backdropFilter: 'blur(16px)',
    }}
  >
    <div className="max-w-md mx-auto px-3 h-[64px] flex items-center justify-between">
      {ITEMS.slice(0, 2).map((it) => (
        <NavBtn
          key={it.tab}
          {...it}
          active={activeTab === it.tab}
          onClick={() => onTabChange(it.tab)}
        />
      ))}

      {/* دکمه اصلی: پیشنهاد ژست بعدی */}
      <button
        onClick={onNextPose}
        className="relative -translate-y-4 w-14 h-14 rounded-full flex flex-col items-center justify-center a-ring active:scale-90 transition-transform"
        style={{
          background: 'linear-gradient(135deg, var(--color-gold2), var(--color-gold) 55%, var(--color-rose))',
          color: '#241B0C',
          border: '4px solid var(--color-bg)',
          boxShadow: '0 12px 30px -10px color-mix(in srgb, var(--color-gold) 80%, transparent)',
        }}
        aria-label="پیشنهاد ژست بعدی"
      >
        <Shuffle className="w-5 h-5" />
        <span className="text-[9px] font-extrabold mt-0.5">بعدی</span>
      </button>

      {ITEMS.slice(2).map((it) => (
        <NavBtn
          key={it.tab}
          {...it}
          active={activeTab === it.tab}
          badge={it.tab === 'favorites' ? favoritesCount : undefined}
          onClick={() => onTabChange(it.tab)}
        />
      ))}
    </div>
  </nav>
);

const NavBtn: React.FC<{
  icon: React.ElementType;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}> = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors"
    style={{ color: active ? 'var(--color-gold)' : 'var(--color-faint)' }}
  >
    <span className="relative">
      <Icon className="w-5 h-5" style={{ transform: active ? 'scale(1.1)' : 'none' }} />
      {typeof badge === 'number' && badge > 0 && (
        <span
          className="absolute -top-1.5 -left-2 min-w-[16px] text-center text-[9px] font-extrabold rounded-full px-1"
          style={{ background: 'var(--color-rose)', color: '#fff' }}
        >
          {badge}
        </span>
      )}
    </span>
    <span className="text-[10px] font-semibold">{label}</span>
  </button>
);
