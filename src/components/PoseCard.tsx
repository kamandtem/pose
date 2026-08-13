import React from 'react';
import { Heart, Users, ChevronLeft, MapPin, Sparkles, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { Pose } from '../types/pose';
import { PoseVisual } from './PoseVisual';

interface Props {
  pose: Pose;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (pose: Pose) => void;
  onDelete: (pose: Pose) => void;
  onAddToProject: (pose: Pose) => void;
  compact?: boolean;
}

const DIFF_COLOR: Record<string, string> = {
  'آسان': 'var(--color-teal)',
  'متوسط': 'var(--color-gold)',
  'حرفه‌ای': 'var(--color-rose)',
};

export const PoseCard: React.FC<Props> = ({
  pose,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onDelete,
  onAddToProject,
  compact,
}) => (
  <div
    onClick={() => onSelect(pose)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(pose); }}
    role="button"
    tabIndex={0}
    className="card card-hover text-right overflow-hidden flex flex-col w-full cursor-pointer"
    style={{ borderColor: 'var(--color-line)' }}
  >
    <div className={`relative w-full overflow-hidden ${compact ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
      <PoseVisual pose={pose} />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--color-bg) 92%, transparent), transparent 58%)',
        }}
      />

      <div className="absolute top-2.5 right-2.5 left-2.5 flex items-start justify-between gap-2">
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-full"
          style={{ background: 'rgba(8,6,14,.6)', color: '#F4F1EA', backdropFilter: 'blur(6px)' }}
        >
          {pose.category}
        </span>

        <span className="flex items-center gap-1">
          <span
            onClick={(e) => { e.stopPropagation(); onAddToProject(pose); }}
            className="p-2 rounded-full"
            style={{ background: 'rgba(8,6,14,.6)' }}
            role="button"
            aria-label="افزودن به پروژه"
          ><Plus className="w-3.5 h-3.5" style={{ color: 'var(--color-teal)' }} /></span>
          <span
            onClick={(e) => { e.stopPropagation(); onDelete(pose); }}
            className="p-2 rounded-full"
            style={{ background: 'rgba(8,6,14,.6)' }}
            role="button"
            aria-label="حذف ژست"
          >
            <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--color-rose)' }} />
          </span>
          <span
          onClick={(e) => onToggleFavorite(pose.id, e)}
          className="p-2 rounded-full active:scale-90 transition-transform"
          style={{
            background: isFavorite ? 'var(--color-rose)' : 'rgba(8,6,14,.6)',
            backdropFilter: 'blur(6px)',
          }}
          role="button"
          aria-label="نشان کردن"
        >
          <Heart
            className="w-3.5 h-3.5"
            style={{ color: '#fff' }}
            fill={isFavorite ? '#fff' : 'none'}
          />
          </span>
        </span>
      </div>

      <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between gap-2">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(8,6,14,.55)',
            color: DIFF_COLOR[pose.difficulty],
            backdropFilter: 'blur(6px)',
          }}
        >
          {pose.difficulty}
        </span>

        <span className="flex items-center gap-2">
          {pose.isCustom && (
            <span
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-gold)', color: '#241B0C' }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              مال من
            </span>
          )}
          {pose.image && (
            <span
              className="p-1 rounded-full"
              style={{ background: 'rgba(8,6,14,.55)' }}
              title="عکس مرجع شما"
            >
              <ImageIcon className="w-2.5 h-2.5" style={{ color: '#F4F1EA' }} />
            </span>
          )}
          <span
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(8,6,14,.55)', color: '#D9D3E0' }}
          >
            <Users className="w-2.5 h-2.5" />
            {pose.peopleCount}
          </span>
        </span>
      </div>
    </div>

    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
      <div>
        <h3 className="font-bold text-[13px] leading-snug line-clamp-2">{pose.title}</h3>
        <p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">
          {pose.photographerScript[0] || pose.steps[0]}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-line">
        <span className="flex items-center gap-1 text-[10px] text-faint">
          <MapPin className="w-3 h-3" />
          {pose.locations.join(' · ')}
        </span>
        <span className="flex items-center gap-0.5 text-[11px] font-bold text-gold">
          راهنما
          <ChevronLeft className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  </div>
);
