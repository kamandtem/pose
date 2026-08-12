import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  CategoryType,
  DifficultyLevel,
  EMPTY_FILTERS,
  FilterState,
  LocationType,
  PoseType,
} from '../types/pose';
import { LOCATION_KEYS } from '../data/locations';

const CATEGORIES: (CategoryType | 'همه')[] = [
  'همه',
  'عروس و داماد',
  'عروس',
  'داماد',
  'زوج',
  'گروهی',
  'کودک و خانواده',
];
const TYPES: (PoseType | 'همه')[] = [
  'همه',
  'ایستاده',
  'نشسته',
  'راه رفتن',
  'بغل کردن',
  'رمانتیک',
  'رسمی',
  'خلاقانه',
  'حرکتی',
];
const DIFFS: (DifficultyLevel | 'همه')[] = ['همه', 'آسان', 'متوسط', 'حرفه‌ای'];
const LOCS: (LocationType | 'همه')[] = ['همه', ...LOCATION_KEYS];

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  total: number;
}

export const Filters: React.FC<Props> = ({ filters, onChange, total }) => {
  const [expanded, setExpanded] = useState(false);

  const dirty =
    filters.search !== '' ||
    filters.category !== 'همه' ||
    filters.poseType !== 'همه' ||
    filters.difficulty !== 'همه' ||
    filters.location !== 'همه' ||
    filters.customOnly;

  const Row = <T extends string>({
    label,
    options,
    value,
    onPick,
  }: {
    label: string;
    options: T[];
    value: T;
    onPick: (v: T) => void;
  }) => (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onPick(o)}
            className={`pill ${value === o ? 'pill-on' : ''}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="card p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="جستجو: عنوان، تگ، لوکیشن، مراحل اجرا..."
            className="field !pr-9 !pl-9 !rounded-full"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              aria-label="پاک کردن جستجو"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)
          }
          className="btn btn-ghost !px-3 !py-2.5 shrink-0"
          style={{
            borderColor: expanded || dirty ? 'var(--color-gold)' : 'var(--color-line)',
          }}
          aria-label="فیلترها"
        >
          <SlidersHorizontal className="w-4 h-4 text-gold" />
        </button>
      </div>

      <Row
        label="لوکیشن"
        options={LOCS}
        value={filters.location}
        onPick={(v) => onChange({ ...filters, location: v })}
      />

      {expanded && (
        <div className="space-y-3 a-fade">
          <Row
            label="دسته‌بندی سوژه"
            options={CATEGORIES}
            value={filters.category}
            onPick={(v) => onChange({ ...filters, category: v })}
          />
          <Row
            label="حالت ژست"
            options={TYPES}
            value={filters.poseType}
            onPick={(v) => onChange({ ...filters, poseType: v })}
          />
          <Row
            label="سطح سختی"
            options={DIFFS}
            value={filters.difficulty}
            onPick={(v) => onChange({ ...filters, difficulty: v })}
          />
          <button
            onClick={() => onChange({ ...filters, customOnly: !filters.customOnly })}
            className={`pill ${filters.customOnly ? 'pill-on' : ''}`}
          >
            فقط ژست‌های خودم
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-line">
        <span className="text-[11px] text-muted font-semibold">{total} ژست یافت شد</span>
        {dirty && (
          <button
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            className="flex items-center gap-1 text-[11px] font-bold text-gold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            پاک کردن فیلترها
          </button>
        )}
      </div>
    </div>
  );
};
