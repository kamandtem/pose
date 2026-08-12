import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Trash2, Plus, Save, ImagePlus, Loader2 } from 'lucide-react';
import {
  ArtKey,
  CategoryType,
  DifficultyLevel,
  LocationType,
  Pose,
  PoseType,
} from '../types/pose';
import { LOCATION_KEYS } from '../data/locations';
import { saveCustomPose } from '../services/storage';
import { artForText, progressionMeta } from '../data/poses';
import { approxDataUrlKb, fileToCompressedDataUrl } from '../services/media';
import { PoseVisual } from './PoseVisual';

const CATEGORIES: CategoryType[] = [
  'عروس و داماد',
  'عروس',
  'داماد',
  'زوج',
  'گروهی',
  'کودک و خانواده',
];
const TYPES: PoseType[] = [
  'ایستاده',
  'نشسته',
  'راه رفتن',
  'بغل کردن',
  'رمانتیک',
  'رسمی',
  'خلاقانه',
  'حرکتی',
];
const DIFFS: DifficultyLevel[] = ['آسان', 'متوسط', 'حرفه‌ای'];

const ART_BY_TYPE: Record<PoseType, ArtKey> = {
  'ایستاده': 'faceToFace',
  'نشسته': 'sitting',
  'راه رفتن': 'walk',
  'بغل کردن': 'backHug',
  'رمانتیک': 'forehead',
  'رسمی': 'faceToFace',
  'خلاقانه': 'silhouette',
  'حرکتی': 'dance',
};

interface ListEditorProps {
  label: string;
  hint: string;
  items: string[];
  setter: React.Dispatch<React.SetStateAction<string[]>>;
}

/** ویرایشگر فهرست چندخطی: مراحل اجرا، دیالوگ عکاس، اشتباهات رایج */
const ListEditor: React.FC<ListEditorProps> = ({ label, hint, items, setter }) => {
  const edit = (i: number, v: string) =>
    setter((cur) => cur.map((x, idx) => (idx === i ? v : x)));
  const add = () => setter((cur) => [...cur, '']);
  const remove = (i: number) =>
    setter((cur) => (cur.length <= 1 ? cur : cur.filter((_, idx) => idx !== i)));

  return (
    <div>
      <span className="label">{label}</span>
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="shrink-0 w-6 h-6 mt-1.5 rounded-full flex items-center justify-center text-[10px] font-extrabold"
              style={{
                background: 'color-mix(in srgb, var(--color-gold) 20%, transparent)',
                color: 'var(--color-gold)',
              }}
            >
              {i + 1}
            </span>
            <textarea
              value={v}
              rows={2}
              onChange={(e) => edit(i, e.target.value)}
              placeholder={hint}
              className="field flex-1 resize-none leading-relaxed"
            />
            {items.length > 1 && (
              <button
                onClick={() => remove(i)}
                className="shrink-0 p-2 mt-1 rounded-xl text-faint"
                aria-label="حذف این خط"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={add} className="btn btn-ghost !py-1.5 !px-3 mt-2 !text-[11px]">
        <Plus className="w-3.5 h-3.5 text-gold" />
        افزودن خط
      </button>
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string, ok: boolean) => void;
  editing?: Pose | null;
}

const blankLines = ['', '', ''];

export const AddPoseSheet: React.FC<Props> = ({ open, onClose, onSaved, editing }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('عروس و داماد');
  const [poseType, setPoseType] = useState<PoseType>('ایستاده');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('آسان');
  const [peopleCount, setPeopleCount] = useState(2);
  const [locations, setLocations] = useState<LocationType[]>(['باغ عمارت']);
  const [steps, setSteps] = useState<string[]>(blankLines);
  const [script, setScript] = useState<string[]>(blankLines);
  const [mistakes, setMistakes] = useState<string[]>(['']);
  const [tagText, setTagText] = useState('');
  const [note, setNote] = useState('');
  const [lens, setLens] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setImage(editing.image);
      setTitle(editing.title);
      setCategory(editing.category);
      setPoseType(editing.poseType);
      setDifficulty(editing.difficulty);
      setPeopleCount(editing.peopleCount);
      setLocations(editing.locations.length ? editing.locations : ['باغ عمارت']);
      setSteps(editing.steps.length ? editing.steps : blankLines);
      setScript(editing.photographerScript.length ? editing.photographerScript : blankLines);
      setMistakes(editing.commonMistakes.length ? editing.commonMistakes : ['']);
      setTagText(editing.tags.filter((t) => t !== editing.poseType).join('، '));
      setNote(editing.note || '');
      setLens(editing.cameraTips.lensSuggestion || '');
    } else {
      setImage(undefined);
      setTitle('');
      setCategory('عروس و داماد');
      setPoseType('ایستاده');
      setDifficulty('آسان');
      setPeopleCount(2);
      setLocations(['باغ عمارت']);
      setSteps(blankLines);
      setScript(blankLines);
      setMistakes(['']);
      setTagText('');
      setNote('');
      setLens('');
    }
  }, [open, editing]);

  if (!open) return null;

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await fileToCompressedDataUrl(file);
      setImage(compressed);
    } catch {
      onSaved('عکس خوانده نشد. یک عکس دیگر را امتحان کنید.', false);
    } finally {
      setBusy(false);
    }
  };

  const toggleLoc = (l: LocationType) =>
    setLocations((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));

  const submit = () => {
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    const cleanScript = script.map((s) => s.trim()).filter(Boolean);

    if (!title.trim()) {
      onSaved('عنوان ژست را وارد کنید.', false);
      return;
    }
    if (cleanSteps.length === 0) {
      onSaved('حداقل یک مرحله اجرا برای ژست بنویسید.', false);
      return;
    }

    const tags = tagText
      .split(/[،,\n]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const art = artForText(
      [title, ...cleanSteps, tagText].join(' '),
      ART_BY_TYPE[poseType]
    );

    const pose: Pose = {
      id: editing?.id || `mine-${Date.now()}`,
      title: title.trim(),
      category,
      poseType,
      difficulty,
      peopleCount,
      locations: locations.length ? locations : ['باغ عمارت'],
      art,
      ...progressionMeta(difficulty, art, peopleCount),
      image,
      tags: Array.from(new Set([...tags, poseType, ...locations, 'ژست من'])),
      steps: cleanSteps,
      bodyPosition: note.trim() || 'فرم بدن را طبق مراحل اجرا تنظیم کنید.',
      handPosition: 'انگشتان کشیده و آزاد، بدون انقباض.',
      footPosition: 'وزن روی پای عقب، پای جلو کمی سبک.',
      headDirection: 'چانه کمی جلو تا خط فک تمیز دیده شود.',
      eyeDirection: 'نگاه در ثانیه آخر روی نقطه هدف بنشیند.',
      photographerScript: cleanScript.length ? cleanScript : ['آرام در همین حالت بمانید.'],
      commonMistakes: mistakes.map((m) => m.trim()).filter(Boolean),
      variations: [],
      cameraTips: {
        framing: 'مدیوم شات',
        cameraAngle: 'هم‌سطح چشم سوژه',
        suggestedDistance: '۲ تا ۳ متر',
        lensSuggestion: lens.trim() || '85mm f/1.8',
        lightTip: 'نور اصلی با زاویه ۴۵ درجه از یک سمت.',
      },
      isCustom: true,
      createdAt: editing?.createdAt || Date.now(),
      note: note.trim() || undefined,
    };

    const res = saveCustomPose(pose);
    if (res.ok) {
      onSaved(editing ? 'ژست به‌روزرسانی شد.' : 'ژست شما ذخیره شد و در جستجو پیدا می‌شود.', true);
      onClose();
    } else {
      onSaved(res.error || 'ذخیره نشد.', false);
    }
  };

  const previewArt = artForText(title, ART_BY_TYPE[poseType]);

  const preview: Pose = {
    id: 'preview',
    title: title || 'پیش‌نمایش ژست',
    category,
    poseType,
    difficulty,
    peopleCount,
    locations: locations.length ? locations : ['باغ عمارت'],
    art: previewArt,
    ...progressionMeta(difficulty, previewArt, peopleCount),
    image,
    tags: [],
    steps: [],
    bodyPosition: '',
    handPosition: '',
    footPosition: '',
    headDirection: '',
    eyeDirection: '',
    photographerScript: [],
    commonMistakes: [],
    variations: [],
    cameraTips: {
      framing: '',
      cameraAngle: '',
      suggestedDistance: '',
      lensSuggestion: '',
      lightTip: '',
    },
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-line bg-surface/90 backdrop-blur-md">
          <h2 className="font-extrabold text-[15px]">
            {editing ? 'ویرایش ژست' : 'افزودن ژست جدید'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* عکس ژست */}
          <div>
            <span className="label">عکس ژست (از گالری یا دوربین)</span>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-line">
              <PoseVisual pose={preview} contain={!!image} />
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                </div>
              )}
              <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-primary !py-2 !px-3 !text-[11px]"
                >
                  {image ? <Camera className="w-3.5 h-3.5" /> : <ImagePlus className="w-3.5 h-3.5" />}
                  {image ? 'تغییر عکس' : 'انتخاب عکس'}
                </button>
                {image && (
                  <button
                    onClick={() => setImage(undefined)}
                    className="btn btn-ghost !py-2 !px-3 !text-[11px]"
                    style={{ background: 'rgba(8,6,14,.6)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف عکس
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickImage}
            />
            <p className="text-[10px] text-faint mt-1.5 leading-relaxed">
              اگر عکس انتخاب نکنید، طرح راهنمای خودکار برنامه نمایش داده می‌شود. عکس‌ها فشرده و
              روی همین دستگاه ذخیره می‌شوند{image ? ` (حدود ${approxDataUrlKb(image)} کیلوبایت)` : ''}.
            </p>
          </div>

          <div>
            <span className="label">عنوان ژست *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: نشستن عروس روی پله با دنباله باز"
              className="field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="label">دسته‌بندی</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="label">حالت ژست</span>
              <select
                value={poseType}
                onChange={(e) => setPoseType(e.target.value as PoseType)}
                className="field"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="label">سطح سختی</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="field"
              >
                {DIFFS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="label">تعداد نفرات</span>
              <input
                type="number"
                min={1}
                max={20}
                value={peopleCount}
                onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value) || 1))}
                className="field"
              />
            </div>
          </div>

          <div>
            <span className="label">لوکیشن مناسب (چند مورد قابل انتخاب است)</span>
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_KEYS.map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLoc(l)}
                  className={`pill ${locations.includes(l) ? 'pill-on' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <ListEditor
            label="مراحل اجرای ژست *"
            hint="مثال: داماد پشت عروس می‌ایستد و دست‌ها را دور کمر او حلقه می‌کند."
            items={steps}
            setter={setSteps}
          />

          <div
            className="p-3 rounded-2xl border border-line"
            style={{ background: 'color-mix(in srgb, var(--color-gold) 8%, transparent)' }}
          >
            <ListEditor
              label="چی به سوژه بگم؟ (دیالوگ مستقیم)"
              hint="مثال: دستت را آرام دور کمرش حلقه کن، فشار نده."
              items={script}
              setter={setScript}
            />
          </div>

          <ListEditor
            label="اشتباهات رایج"
            hint="مثال: فاصله افتادن بدن‌ها و ایجاد فضای خالی"
            items={mistakes}
            setter={setMistakes}
          />

          <div>
            <span className="label">تگ‌ها (با ویرگول جدا کنید)</span>
            <input
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              placeholder="آغوش، غروب، ساحل"
              className="field"
            />
            <p className="text-[10px] text-faint mt-1">
              تگ‌ها باعث می‌شوند بعداً این ژست را سریع در جستجو پیدا کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="label">یادداشت / نکته فرم بدن</span>
              <textarea
                value={note}
                rows={2}
                onChange={(e) => setNote(e.target.value)}
                placeholder="هر نکته‌ای که موقع اجرا یادت می‌ماند..."
                className="field resize-none"
              />
            </div>
            <div>
              <span className="label">پیشنهاد لنز / تنظیمات</span>
              <input
                value={lens}
                onChange={(e) => setLens(e.target.value)}
                placeholder="85mm f/1.8"
                className="field"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 px-4 py-3 border-t border-line bg-surface/90 backdrop-blur-md">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            انصراف
          </button>
          <button onClick={submit} disabled={busy} className="btn btn-primary flex-[2]">
            <Save className="w-4 h-4" />
            {editing ? 'ذخیره تغییرات' : 'ذخیره ژست'}
          </button>
        </div>
      </div>
    </div>
  );
};
