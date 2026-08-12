import React, { useEffect } from 'react';
import {
  Home,
  LayoutGrid,
  MapPin,
  Heart,
  FolderHeart,
  PlusCircle,
  Play,
  Info,
  BookOpen,
  AlertTriangle,
  WandSparkles,
  Settings,
  Moon,
  Sun,
  X,
  ChevronLeft,
} from 'lucide-react';
import { ViewTab } from '../types/pose';
import { LogoLockup } from './Logo';

interface Props {
  open: boolean;
  onClose: () => void;
  activeTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  onOpenAddPose: () => void;
  onOpenShootMode: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  counts: { total: number; favorites: number; mine: number };
}

/**
 * منوی کناری.
 * از سمت راست باز می‌شود و عمداً کل صفحه را نمی‌پوشاند:
 * از بالا (زیر هدر)، از پایین (بالای نوار پایین) و از سمت چپ فاصله دارد
 * و گوشه‌هایش گرد است.
 */
export const SideMenu: React.FC<Props> = ({
  open,
  onClose,
  activeTab,
  onNavigate,
  onOpenAddPose,
  onOpenShootMode,
  theme,
  onToggleTheme,
  counts,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (tab: ViewTab) => {
    onNavigate(tab);
    onClose();
  };

  const items: {
    tab?: ViewTab;
    icon: React.ElementType;
    label: string;
    badge?: number;
    action?: () => void;
    accent?: boolean;
  }[] = [
    { tab: 'home', icon: Home, label: 'خانه' },
    { tab: 'library', icon: LayoutGrid, label: 'کتابخانه ژست‌ها', badge: counts.total },
    { tab: 'locations', icon: MapPin, label: 'لوکیشن‌ها' },
    { tab: 'favorites', icon: Heart, label: 'علاقه‌مندی‌ها', badge: counts.favorites },
    { tab: 'myposes', icon: FolderHeart, label: 'ژست‌های من', badge: counts.mine },
    {
      icon: PlusCircle,
      label: 'افزودن ژست جدید',
      accent: true,
      action: () => {
        onOpenAddPose();
        onClose();
      },
    },
    {
      icon: Play,
      label: 'حالت عکاسی',
      accent: true,
      action: () => {
        onOpenShootMode();
        onClose();
      },
    },
    { tab: 'principles', icon: BookOpen, label: 'اصول ژست‌دهی' },
    { tab: 'generator', icon: WandSparkles, label: 'موتور ساخت ژست' },
    { tab: 'emergency', icon: AlertTriangle, label: 'حالت اضطراری لوکیشن' },
    { tab: 'about', icon: Info, label: 'معرفی برنامه' },
    { tab: 'settings', icon: Settings, label: 'تنظیمات' },
  ];

  return (
    <>
      {/* پرده پشت منو: با یک کلیک بسته می‌شود */}
      <div
        className="fixed inset-0 z-[70] a-fade"
        style={{ background: 'rgba(4,3,8,.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden
      />

      {/* پنل شناور سمت راست */}
      <aside
        className="fixed z-[71] a-slide-right card overflow-y-auto no-scrollbar shadow-2xl"
        style={{
          top: 'calc(74px + env(safe-area-inset-top, 0px))',
          bottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
          right: '12px',
          width: 'min(78vw, 296px)',
          borderRadius: '22px',
        }}
        role="dialog"
        aria-label="منوی برنامه"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 border-b border-line bg-surface/80 backdrop-blur-md">
          <LogoLockup size={30} subtitle={false} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-ink"
            aria-label="بستن منو"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-2.5 space-y-1">
          {items.map((it, idx) => {
            const active = it.tab && activeTab === it.tab;
            const Icon = it.icon;
            return (
              <button
                key={idx}
                onClick={() => (it.action ? it.action() : it.tab && go(it.tab))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-right"
                style={{
                  background: active
                    ? 'color-mix(in srgb, var(--color-gold) 16%, transparent)'
                    : 'transparent',
                  border: active
                    ? '1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)'
                    : '1px solid transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: it.accent || active ? 'var(--color-gold)' : 'var(--color-muted)' }}
                />
                <span
                  className="flex-1 text-[13px] font-semibold"
                  style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink)' }}
                >
                  {it.label}
                </span>
                {typeof it.badge === 'number' && it.badge > 0 && (
                  <span className="pill text-[10px] px-2 py-0.5">{it.badge}</span>
                )}
                <ChevronLeft className="w-3.5 h-3.5 text-faint" />
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-1 space-y-2">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl border border-line"
          >
            <span className="flex items-center gap-2.5 text-[13px] font-semibold">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-gold" />
              ) : (
                <Sun className="w-4 h-4 text-gold" />
              )}
              {theme === 'dark' ? 'تم تیره' : 'تم روشن'}
            </span>
            <span className="text-[10px] text-faint">تغییر</span>
          </button>

          <p className="text-[10px] text-faint text-center leading-relaxed pt-1">
            نسخه ۱.۰ · کاملاً آفلاین
          </p>
        </div>
      </aside>
    </>
  );
};
