import React from 'react';
import {
  ArrowLeft,
  Heart,
  Clock,
  Sparkles,
  PlusCircle,
  Users2,
  UserRound,
  UserSquare2,
  HeartHandshake,
  Users,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CategoryType, LocationType, MyLocation, Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { SectionGuide } from '../components/SectionGuide';
import { LOCATIONS } from '../data/locations';
import { WeatherCard } from '../components/WeatherCard';

interface Props {
  poses: Pose[];
  favoriteIds: string[];
  recentIds: string[];
  onSelect: (p: Pose) => void;
  onDelete: (p: Pose) => void;
  onAddToProject: (p: Pose) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddPose: () => void;
  onPickCategory: (c: CategoryType) => void;
  onPickLocation: (l: LocationType) => void;
  onTab: (t: ViewTab) => void;
  selectedLocation: MyLocation | null;
  onOpenWeather: () => void;
  onOpenMyLocations: () => void;
}

const CATEGORY_META: { name: CategoryType; icon: LucideIcon; sub: string }[] = [
  { name: 'عروس و داماد', icon: Users2, sub: 'ژست‌های دونفره اصلی' },
  { name: 'عروس', icon: UserRound, sub: 'پرتره تک‌نفره' },
  { name: 'داماد', icon: UserSquare2, sub: 'استایل و پرتره' },
  { name: 'زوج', icon: HeartHandshake, sub: 'صمیمی و کژوال' },
  { name: 'گروهی', icon: Users, sub: 'ساقدوش و خانواده' },
];

export const HomeView: React.FC<Props> = ({
  poses,
  favoriteIds,
  recentIds,
  onSelect,
  onDelete,
  onAddToProject,
  onToggleFavorite,
  onOpenAddPose,
  onPickCategory,
  onPickLocation,
  onTab,
  selectedLocation,
  onOpenWeather,
  onOpenMyLocations,
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

      <WeatherCard selected={selectedLocation} onOpen={onOpenWeather} />
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
            <button onClick={onOpenAddPose} className="btn btn-ghost">
              <PlusCircle className="w-4 h-4 text-gold" />
              ژست خودم
            </button>
            <button onClick={onOpenMyLocations} className="btn btn-ghost">
              <MapPin className="w-4 h-4 text-gold" />
              لوکیشن‌های من
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
              <img
                src={l.cover}
                alt={l.key}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, ${l.colors[0]} 55%, transparent), color-mix(in srgb, ${l.colors[1]} 30%, transparent) 60%, rgba(6,5,10,.55))`,
                }}
              />
              <div className="relative flex items-center justify-between">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(8,6,14,.32)' }}
                >
                  <l.icon className="w-4 h-4" style={{ color: '#FFF8EC' }} />
                </span>
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
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--color-gold) 14%, transparent)', color: 'var(--color-gold)' }}
                >
                  <c.icon className="w-4 h-4" />
                </span>
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
                onDelete={onDelete}
                onAddToProject={onAddToProject}
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
                onDelete={onDelete}
                onAddToProject={onAddToProject}
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
                onDelete={onDelete}
                onAddToProject={onAddToProject}
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
