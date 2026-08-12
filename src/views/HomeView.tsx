import React from 'react';
import { Shuffle, Play, ArrowLeft, Heart, Clock, Sparkles, PlusCircle } from 'lucide-react';
import { CategoryType, LocationType, Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { SectionGuide } from '../components/SectionGuide';
import { LOCATIONS } from '../data/locations';

interface Props {
  poses: Pose[];
  favoriteIds: string[];
  recentIds: string[];
  onSelect: (p: Pose) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNextPose: () => void;
  onOpenShootMode: () => void;
  onOpenAddPose: () => void;
  onPickCategory: (c: CategoryType) => void;
  onPickLocation: (l: LocationType) => void;
  onTab: (t: ViewTab) => void;
}

const CATEGORY_META: { name: CategoryType; emoji: string; sub: string }[] = [
  { name: 'عروس و داماد', emoji: '💑', sub: 'ژست‌های دونفره اصلی' },
  { name: 'عروس', emoji: '👰', sub: 'پرتره تک‌نفره' },
  { name: 'داماد', emoji: '🤵', sub: 'استایل و پرتره' },
  { name: 'زوج', emoji: '❤️', sub: 'صمیمی و کژوال' },
  { name: 'گروهی', emoji: '👥', sub: 'ساقدوش و خانواده' },
  { name: 'کودک و خانواده', emoji: '🧒', sub: 'لحظه‌های گرم' },
];

export const HomeView: React.FC<Props> = ({
  poses,
  favoriteIds,
  recentIds,
  onSelect,
  onToggleFavorite,
  onNextPose,
  onOpenShootMode,
  onOpenAddPose,
  onPickCategory,
  onPickLocation,
  onTab,
}) => {
  const favorites = poses.filter((p) => favoriteIds.includes(p.id));
  const recents = recentIds
    .map((id) => poses.find((p) => p.id === id))
    .filter(Boolean) as Pose[];
  const mine = poses.filter((p) => p.isCustom);

  const countOf = (c: CategoryType) => poses.filter((p) => p.category === c).length;
  const countLoc = (l: LocationType) => poses.filter((p) => p.locations.includes(l)).length;

  return (
    <div className="space-y-7">
      <SectionGuide section="home" title="خانه، نقطه شروع توست" text="اینجا پیشنهاد ژست، دسته‌بندی‌ها، لوکیشن‌ها، نشان‌شده‌ها و آخرین ژست‌های دیده‌شده را یکجا می‌بینی." />
      {/* هیرو */}
      <section className="card relative overflow-hidden p-5 sm:p-7">
        <div
          className="absolute -top-16 -left-10 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'color-mix(in srgb, var(--color-gold) 22%, transparent)' }}
        />
        <div
          className="absolute -bottom-20 -right-10 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'color-mix(in srgb, var(--color-plum) 26%, transparent)' }}
        />

        <div className="relative space-y-3.5">
          <span className="pill">
            <Sparkles className="w-3 h-3 text-gold" />
            {poses.length} ژست آماده اجرا
          </span>

          <h1 className="text-[22px] sm:text-[26px] font-extrabold leading-snug">
            سر صحنه معطل نمان.
            <br />
            <span className="gold-text">ژست بعدی را همین‌جا بگیر.</span>
          </h1>

          <p className="text-[12px] text-muted leading-relaxed max-w-md">
            مراحل اجرا، فرم بدن و دست، جهت نگاه و جمله‌ای که باید به سوژه بگویید: همه در یک صفحه.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button onClick={onNextPose} className="btn btn-primary">
              <Shuffle className="w-4 h-4" />
              پیشنهاد ژست بعدی
            </button>
            <button onClick={onOpenShootMode} className="btn btn-ghost">
              <Play className="w-3.5 h-3.5 text-gold" fill="currentColor" />
              حالت عکاسی
            </button>
            <button onClick={onOpenAddPose} className="btn btn-ghost">
              <PlusCircle className="w-4 h-4 text-gold" />
              ژست خودم
            </button>
          </div>
        </div>
      </section>

      {/* لوکیشن‌ها */}
      <section className="space-y-3">
        <SectionHead title="بر اساس لوکیشن" onMore={() => onTab('locations')} />
        <div className="grid grid-cols-2 gap-2.5">
          {LOCATIONS.map((l) => (
            <button
              key={l.key}
              onClick={() => onPickLocation(l.key)}
              className="card card-hover relative overflow-hidden p-3.5 text-right h-24 flex flex-col justify-between"
            >
              <div
                className="absolute inset-0 opacity-45"
                style={{
                  background: `linear-gradient(135deg, ${l.colors[0]}, ${l.colors[1]} 60%, ${l.colors[2]})`,
                }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-xl">{l.emoji}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(8,6,14,.45)', color: '#F4F1EA' }}
                >
                  {countLoc(l.key)} ژست
                </span>
              </div>
              <div className="relative">
                <h3 className="font-extrabold text-[13px]" style={{ color: '#FFF8EC' }}>
                  {l.key}
                </h3>
                <p className="text-[10px] line-clamp-1" style={{ color: 'rgba(255,248,236,.75)' }}>
                  {l.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* دسته‌بندی‌ها */}
      <section className="space-y-3">
        <SectionHead title="دسته‌بندی سوژه" onMore={() => onTab('library')} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORY_META.map((c) => (
            <button
              key={c.name}
              onClick={() => onPickCategory(c.name)}
              className="card card-hover p-3.5 text-right h-24 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{c.emoji}</span>
                <span className="pill !text-[10px] !px-2 !py-0.5">{countOf(c.name)}</span>
              </div>
              <div>
                <h3 className="font-bold text-[12px]">{c.name}</h3>
                <p className="text-[10px] text-faint line-clamp-1">{c.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {mine.length > 0 && (
        <section className="space-y-3">
          <SectionHead
            title={`ژست‌های من (${mine.length})`}
            icon={<Sparkles className="w-4 h-4 text-gold" />}
            onMore={() => onTab('myposes')}
          />
          <div className="grid grid-cols-2 gap-3">
            {mine.slice(0, 2).map((p) => (
              <PoseCard
                key={p.id}
                pose={p}
                isFavorite={favoriteIds.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelect}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section className="space-y-3">
          <SectionHead
            title={`نشان‌شده‌ها (${favorites.length})`}
            icon={<Heart className="w-4 h-4" style={{ color: 'var(--color-rose)' }} fill="currentColor" />}
            onMore={() => onTab('favorites')}
          />
          <div className="grid grid-cols-2 gap-3">
            {favorites.slice(0, 4).map((p) => (
              <PoseCard
                key={p.id}
                pose={p}
                isFavorite
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelect}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {recents.length > 0 && (
        <section className="space-y-3">
          <SectionHead title="آخرین ژست‌های دیده‌شده" icon={<Clock className="w-4 h-4 text-gold" />} />
          <div className="grid grid-cols-2 gap-3">
            {recents.slice(0, 4).map((p) => (
              <PoseCard
                key={p.id}
                pose={p}
                isFavorite={favoriteIds.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelect}
                compact
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const SectionHead: React.FC<{
  title: string;
  icon?: React.ReactNode;
  onMore?: () => void;
}> = ({ title, icon, onMore }) => (
  <div className="flex items-center justify-between">
    <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
      {icon}
      {title}
    </h2>
    {onMore && (
      <button onClick={onMore} className="flex items-center gap-1 text-[11px] font-bold text-gold">
        مشاهده همه
        <ArrowLeft className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);
