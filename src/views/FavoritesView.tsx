import React from 'react';
import { Heart, Play } from 'lucide-react';
import { Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { EmptyState } from '../components/EmptyState';
import { SectionGuide } from '../components/SectionGuide';

interface Props {
  poses: Pose[];
  favoriteIds: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (p: Pose) => void;
  onOpenShootMode: () => void;
  onTab: (t: ViewTab) => void;
}

export const FavoritesView: React.FC<Props> = ({
  poses,
  favoriteIds,
  onToggleFavorite,
  onSelect,
  onOpenShootMode,
  onTab,
}) => {
  const list = favoriteIds
    .map((id) => poses.find((p) => p.id === id))
    .filter(Boolean) as Pose[];

  return (
    <div className="space-y-4">
      <SectionGuide section="favorites" title="لیست اجرای امروز" text="قبل از شروع پروژه، ژست‌های موردنظرت را نشان کن تا سر صحنه فقط همان‌ها را اجرا کنی." />
      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-extrabold text-[15px]">
            <Heart className="w-4 h-4" style={{ color: 'var(--color-rose)' }} fill="currentColor" />
            لیست اجرای امروز
          </h2>
          <p className="text-[11px] text-muted mt-1">
            {list.length} ژست نشان‌شده، آماده اجرا سر صحنه
          </p>
        </div>
        {list.length > 0 && (
          <button onClick={onOpenShootMode} className="btn btn-primary shrink-0">
            <Play className="w-3.5 h-3.5" fill="currentColor" />
            شروع
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          emoji="🤍"
          title="هنوز ژستی نشان نکردی"
          text="قبل از پروژه، ژست‌هایی که می‌خواهی اجرا کنی را نشان کن تا سر صحنه سریع پیدایشان کنی."
          action={{ label: 'رفتن به کتابخانه ژست‌ها', onClick: () => onTab('library') }}
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((p) => (
            <PoseCard
              key={p.id}
              pose={p}
              isFavorite
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
