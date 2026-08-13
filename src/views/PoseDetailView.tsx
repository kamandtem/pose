import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Heart,
  Play,
  Shuffle,
  AlertTriangle,
  Repeat,
  Camera,
  ImagePlus,
  Trash2,
  StickyNote,
  Check,
  Users,
  MapPin,
} from 'lucide-react';
import { Pose } from '../types/pose';
import { PoseVisual } from '../components/PoseVisual';
import { ScriptPanel } from '../components/ScriptPanel';
import { PoseChecklist } from '../components/PoseChecklist';
import { Accordion } from '../components/Accordion';
import { FilmPlan } from '../components/FilmPlan';
import { fileToCompressedDataUrl } from '../services/media';
import { removeUserPhoto, setNote, setUserPhoto } from '../services/storage';

interface Props {
  pose: Pose;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNextPose: () => void;
  onOpenShootMode: () => void;
  onDataChanged: () => void;
  onDelete: (pose: Pose) => void;
  onToast: (text: string, ok?: boolean) => void;
  bigScript: boolean;
}

export const PoseDetailView: React.FC<Props> = ({
  pose,
  onBack,
  isFavorite,
  onToggleFavorite,
  onNextPose,
  onOpenShootMode,
  onDataChanged,
  onDelete,
  onToast,
  bigScript,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [noteText, setNoteText] = useState(pose.note || '');
  const [savedNote, setSavedNote] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);

  useEffect(() => {
    setNoteText(pose.note || '');
    setSavedNote(false);
  }, [pose.id, pose.note]);

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await fileToCompressedDataUrl(file);
      const ok = setUserPhoto(pose.id, data);
      onToast(
        ok ? 'عکس مرجع شما برای این ژست ذخیره شد.' : 'حافظه پر است؛ چند عکس قدیمی را حذف کنید.',
        ok
      );
      onDataChanged();
    } catch {
      onToast('عکس خوانده نشد.', false);
    }
  };

  const dropPhoto = () => {
    removeUserPhoto(pose.id);
    onToast('عکس مرجع حذف شد.', true);
    onDataChanged();
  };

  const saveNote = () => {
    setNote(pose.id, noteText);
    setSavedNote(true);
    onDataChanged();
    setTimeout(() => setSavedNote(false), 1800);
  };

  return (
    <div className="space-y-4">
      {/* تصویر و هدر */}
      <div className="card overflow-hidden">
        <div className="relative aspect-[4/3]">
          <PoseVisual pose={pose} />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--color-bg) 96%, transparent), transparent 52%)',
            }}
          />

          <button
            onClick={onBack}
            className="absolute top-3 right-3 p-2 rounded-full"
            style={{ background: 'rgba(8,6,14,.55)', backdropFilter: 'blur(6px)' }}
            aria-label="بازگشت"
          >
            <ChevronRight className="w-5 h-5" style={{ color: '#F4F1EA' }} />
          </button>

          <button
            onClick={() => onDelete(pose)}
            className="absolute top-3 left-14 p-2 rounded-full"
            style={{ background: 'rgba(8,6,14,.55)', backdropFilter: 'blur(6px)' }}
            aria-label="حذف ژست"
          >
            <Trash2 className="w-5 h-5" style={{ color: 'var(--color-rose)' }} />
          </button>

          <button
            onClick={(e) => onToggleFavorite(pose.id, e)}
            className="absolute top-3 left-3 p-2 rounded-full"
            style={{
              background: isFavorite ? 'var(--color-rose)' : 'rgba(8,6,14,.55)',
              backdropFilter: 'blur(6px)',
            }}
            aria-label="نشان کردن"
          >
            <Heart className="w-5 h-5" style={{ color: '#fff' }} fill={isFavorite ? '#fff' : 'none'} />
          </button>

          <div className="absolute bottom-3 right-4 left-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="pill !text-[10px]">{pose.category}</span>
              <span className="pill !text-[10px]">{pose.poseType}</span>
              <span className="pill !text-[10px]">{pose.difficulty}</span>
            </div>
            <h1 className="mt-2 text-[19px] font-extrabold leading-snug">{pose.title}</h1>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between gap-2 border-t border-line">
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {pose.peopleCount} نفر
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {pose.locations.join(' · ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => fileRef.current?.click()} className="btn btn-ghost !py-2 !px-3 !text-[11px]">
              <ImagePlus className="w-3.5 h-3.5 text-gold" />
              {pose.image ? 'تغییر عکس' : 'عکس مرجع'}
            </button>
            {pose.image && (
              <button
                onClick={dropPhoto}
                className="btn btn-ghost !py-2 !px-2.5"
                aria-label="حذف عکس مرجع"
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--color-rose)' }} />
              </button>
            )}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
      </div>

      {/* اقدام سریع */}
      <div className="flex items-center gap-2">
        <button onClick={onOpenShootMode} className="btn btn-primary flex-1">
          <Play className="w-4 h-4" fill="currentColor" />
          اجرای این ژست
        </button>
        <button onClick={onNextPose} className="btn btn-ghost">
          <Shuffle className="w-4 h-4 text-gold" />
          بعدی
        </button>
      </div>

      <ScriptPanel lines={pose.photographerScript} big={bigScript} />

      {pose.variations.length > 0 && (
        <Accordion title="تنوع‌های همین ژست" icon={<Repeat className="w-4 h-4 text-gold" />}>
          <div className="flex flex-wrap gap-1.5">
            {pose.variations.map((v, i) => (
              <span key={i} className="pill !text-[11px] !py-1.5">
                {v}
              </span>
            ))}
          </div>
        </Accordion>
      )}

      <PoseChecklist pose={pose} />

      <button onClick={() => setFilmOpen(true)} className="btn w-full !py-3.5" style={{background:'color-mix(in srgb, var(--color-rose) 14%, transparent)',border:'1px solid color-mix(in srgb, var(--color-rose) 45%, transparent)',color:'var(--color-rose)'}}><span>🎬</span> فیلم‌برداری همین ژست، ساخت پلان</button>

      {/* مراحل اجرا */}
      <Accordion defaultOpen title="مراحل اجرا">
        <ol className="space-y-2.5">
          {pose.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold mt-0.5"
                style={{
                  background: 'color-mix(in srgb, var(--color-gold) 18%, transparent)',
                  color: 'var(--color-gold)',
                }}
              >
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Accordion>

      {/* فرم بدن */}
      <Accordion title="فرم بدن و جزئیات">
        <div className="space-y-2.5">
          <Detail label="بدن" text={pose.bodyPosition} />
          <Detail label="دست‌ها" text={pose.handPosition} />
          <Detail label="پاها" text={pose.footPosition} />
          <Detail label="سر" text={pose.headDirection} />
          <Detail label="نگاه" text={pose.eyeDirection} />
        </div>
      </Accordion>

      {pose.commonMistakes.length > 0 && (
        <Accordion
          title="اشتباهات رایج"
          icon={<AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-rose)' }} />}
        >
          <ul className="space-y-2">
            {pose.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                  style={{ background: 'var(--color-rose)' }}
                />
                {m}
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      <Accordion title="تنظیمات دوربین" icon={<Camera className="w-4 h-4 text-gold" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Detail label="کادربندی" text={pose.cameraTips.framing} />
          <Detail label="زاویه" text={pose.cameraTips.cameraAngle} />
          <Detail label="فاصله" text={pose.cameraTips.suggestedDistance} />
          <Detail label="لنز" text={pose.cameraTips.lensSuggestion} />
        </div>
        <div className="mt-2.5">
          <Detail label="نور" text={pose.cameraTips.lightTip} />
        </div>
      </Accordion>

      {/* یادداشت شخصی */}
      <Accordion title="یادداشت من" icon={<StickyNote className="w-4 h-4 text-gold" />}>
        <textarea
          value={noteText}
          rows={3}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="هر نکته‌ای که از تجربه خودت داری اینجا بنویس؛ در جستجو هم پیدا می‌شود."
          className="field resize-none leading-relaxed"
        />
        <button onClick={saveNote} className="btn btn-ghost !py-2 !px-3.5 mt-2 !text-[11px]">
          {savedNote ? (
            <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-teal)' }} />
          ) : (
            <StickyNote className="w-3.5 h-3.5 text-gold" />
          )}
          {savedNote ? 'ذخیره شد' : 'ذخیره یادداشت'}
        </button>
      </Accordion>

      <div className="flex flex-wrap gap-1.5 pb-2">
        {pose.tags.map((t) => (
          <span key={t} className="pill !text-[10px]">
            #{t}
          </span>
        ))}
      </div>
      <FilmPlan pose={pose} open={filmOpen} onClose={() => setFilmOpen(false)} />
    </div>
  );
};


const Detail: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div>
    <span className="text-[10px] font-extrabold text-faint">{label}</span>
    <p className="text-[12.5px] leading-relaxed">{text}</p>
  </div>
);
