import React, { useEffect, useRef } from 'react';
import {
  Home,
  Briefcase,
  LayoutGrid,
  MapPin,
  MapPinned,
  CloudSun,
  Heart,
  FolderHeart,
  PlusCircle,
  BookOpen,
  Settings,
  UserRound,
  Moon,
  Sun,
  X,
  ChevronLeft,
  ClipboardCheck,
} from 'lucide-react';
import { StudioProfile, ViewTab } from '../types/pose';

interface Props {
  open: boolean;
  onClose: () => void;
  activeTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  onOpenAddPose: () => void;
  onOpenStudioProfile: () => void;
  onOpenChecklist: () => void;
  profile: StudioProfile | null;
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
  onOpenStudioProfile,
  onOpenChecklist,
  profile,
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

  const touchStart = useRef<number | null>(null);
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
    { tab: 'mylocations', icon: MapPinned, label: 'لوکیشن‌های من' },
    { tab: 'weather', icon: CloudSun, label: 'آب‌وهوا و نور' },
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
    { tab: 'principles', icon: BookOpen, label: 'اصول ژست‌دهی' },
    { icon: UserRound, label: 'پروفایل', action: () => { onOpenStudioProfile(); onClose(); } },
    { icon: ClipboardCheck, label: 'چک‌لیست وسایل', action: () => { onOpenChecklist(); onClose(); } },
    { tab: 'office', icon: Briefcase, label: 'دفتر آتلیه / استودیو' },
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
          top: 'calc(10px + env(safe-area-inset-top, 0px))',
          bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          right: '12px',
          width: 'min(78vw, 296px)',
          borderRadius: '22px',
        }}
        role="dialog"
        aria-label="منوی برنامه"
        onTouchStart={(e) => { touchStart.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          const end = e.changedTouches[0]?.clientX;
          touchStart.current = null;
          if (start !== null && end !== undefined && end - start > 70) onClose();
        }}
      >
        <div className="sticky top-0 z-10 px-4 py-4 border-b border-line bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)' }}>
              {profile?.logo ? <img src={profile.logo} alt="تصویر پروفایل" className="w-full h-full object-cover" /> : <UserRound className="w-7 h-7 text-gold" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted">خوش آمدی</span>
              <b className="block text-[15px] truncate">{profile?.name || 'پروفایل کاربر'}</b>
            </div>
          </div>
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
