import React, { useEffect, useState } from 'react';
import { Plus, X, Save, Clock, Film, Trash2, DollarSign } from 'lucide-react';
import { OfficeProject, Ceremony, Formality, ProjectInvoice, CameraType, ServiceType, LocationTypeFormatted, ThemeType } from '../types/pose';
import { JalaliDatePicker } from './JalaliDatePicker';
import { gregorianToJalali, jalaliToIso, todayJalali, JalaliDate } from '../services/jalali';

const CAMERAS_CEREMONY: CameraType[] = ['هلی‌شات', 'FPV', 'کرین', 'دستی', 'عکاسی', 'لرزشگیر'];
const CAMERAS_FORMALITY: Exclude<CameraType, 'کرین'>[] = ['هلی‌شات', 'FPV', 'دستی', 'عکاسی', 'لرزشگیر'];
const SERVICES: ServiceType[] = ['عکاسی مراسم', 'میکس', 'آلبوم', 'عکس سر مجلسی', 'پخش کلیپ', 'TV اسلاید'];
const LOCATIONS: LocationTypeFormatted[] = ['محلی', 'شمال', 'جنوب', 'باغ عمارت'];
const THEMES: ThemeType[] = ['شاد و اکتیو', 'ارامش', 'عاشقانه احساسی'];

interface Props {
  project: OfficeProject;
  onSave: (p: OfficeProject) => void;
  onClose: () => void;
}

export const OfficeProjectEditor: React.FC<Props> = ({ project, onSave, onClose }) => {
  const [name, setName] = useState(project.name);
  const [hasCeremony, setHasCeremony] = useState(!!project.ceremony);
  const [hasFormality, setHasFormality] = useState(!!project.formality);
  const [ceremonyDate, setCeremonyDate] = useState<JalaliDate>(() => {
    if (project.ceremony?.date) {
      const [y, m, d] = project.ceremony.date.split('-').map(Number);
      return { jy: y, jm: m, jd: d };
    }
    return todayJalali();
  });
  const [ceremonyCameras, setCeremonyCameras] = useState<Partial<Record<CameraType, number>>>(project.ceremony?.cameras || {});
  const [ceremonyServices, setCeremonyServices] = useState<Partial<Record<ServiceType, { checked: boolean; notes?: string }>>>(project.ceremony?.services || SERVICES.reduce((a, s) => ({ ...a, [s]: { checked: false } }), {}));
  const [ceremonyInvoiceItems, setCeremonyInvoiceItems] = useState<Array<{ name: string; count: number; price: number }>>(project.ceremonyInvoice?.items || []);

  const [formalityLocation, setFormalityLocation] = useState(project.formality?.location || '');
  const [formalityDate, setFormalityDate] = useState<JalaliDate>(() => {
    if (project.formality?.recordDate) {
      const [y, m, d] = project.formality.recordDate.split('-').map(Number);
      return { jy: y, jm: m, jd: d };
    }
    return todayJalali();
  });
  const [formalityCameras, setFormalityCameras] = useState<Partial<Record<Exclude<CameraType, 'کرین'>, number>>>(project.formality?.cameras || {});
  const [clipType, setClipType] = useState<LocationTypeFormatted | ''>(project.formality?.clipType || '');
  const [theme, setTheme] = useState<ThemeType | ''>(project.formality?.theme || '');
  const [formalityInvoiceItems, setFormalityInvoiceItems] = useState<Array<{ name: string; count: number; price: number }>>(project.formalityInvoice?.items || []);

  const submit = () => {
    const now = Date.now();
    const updated: OfficeProject = {
      ...project,
      name: name.trim(),
      ceremony: hasCeremony ? {
        id: project.ceremony?.id || 'cer_' + now.toString(36),
        date: jalaliToIso(ceremonyDate),
        cameras: ceremonyCameras,
        services: ceremonyServices,
        createdAt: project.ceremony?.createdAt || now,
        updatedAt: now,
      } : undefined,
      formality: hasFormality ? {
        id: project.formality?.id || 'for_' + now.toString(36),
        location: formalityLocation.trim() || undefined,
        recordDate: jalaliToIso(formalityDate),
        cameras: formalityCameras,
        clipType: clipType || undefined,
        theme: theme || undefined,
        createdAt: project.formality?.createdAt || now,
        updatedAt: now,
      } : undefined,
      ceremonyInvoice: hasCeremony && ceremonyInvoiceItems.length ? {
        id: project.ceremonyInvoice?.id || 'inv_cer_' + now.toString(36),
        items: ceremonyInvoiceItems,
        total: ceremonyInvoiceItems.reduce((s, x) => s + (x.count * x.price), 0),
        createdAt: project.ceremonyInvoice?.createdAt || now,
        updatedAt: now,
      } : undefined,
      formalityInvoice: hasFormality && formalityInvoiceItems.length ? {
        id: project.formalityInvoice?.id || 'inv_for_' + now.toString(36),
        items: formalityInvoiceItems,
        total: formalityInvoiceItems.reduce((s, x) => s + (x.count * x.price), 0),
        createdAt: project.formalityInvoice?.createdAt || now,
        updatedAt: now,
      } : undefined,
      updatedAt: now,
    };
    onSave(updated);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Project Name */}
      <div className="card p-4">
        <span className="label">نام پروژه</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="نام پروژه..." />
      </div>

      {/* Ceremony Section */}
      <div className="card p-4">
        <button onClick={() => setHasCeremony(!hasCeremony)} className="w-full flex items-center gap-3 text-right">
          <input type="checkbox" checked={hasCeremony} readOnly className="w-4 h-4" />
          <Film className="w-5 h-5 text-gold" />
          <span className="font-bold">مراسم</span>
        </button>
        {hasCeremony && (
          <div className="mt-4 pt-4 border-t border-line space-y-3">
            <div>
              <span className="label">تاریخ</span>
              <JalaliDatePicker value={ceremonyDate} onChange={setCeremonyDate} />
            </div>
            <div>
              <span className="label">دوربین</span>
              <div className="space-y-2">
                {CAMERAS_CEREMONY.map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <input type="number" min="0" value={ceremonyCameras[c] || 0} onChange={(e) => setCeremonyCameras({ ...ceremonyCameras, [c]: parseInt(e.target.value) || 0 })} placeholder="تعداد" className="field flex-1" />
                    <span className="text-[12px] w-20">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="label">موارد مورد نظر</span>
              <div className="space-y-2">
                {SERVICES.map((s) => (
                  <div key={s} className="flex items-start gap-2">
                    <input type="checkbox" checked={ceremonyServices[s]?.checked || false} onChange={(e) => setCeremonyServices({ ...ceremonyServices, [s]: { ...ceremonyServices[s], checked: e.target.checked } })} className="mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[12px] font-bold">{s}</p>
                      <input type="text" value={ceremonyServices[s]?.notes || ''} onChange={(e) => setCeremonyServices({ ...ceremonyServices, [s]: { ...ceremonyServices[s], notes: e.target.value } })} placeholder="توضیح..." className="field text-[11px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="label">فاکتور مراسم</span>
              <InvoiceEditor items={ceremonyInvoiceItems} onChange={setCeremonyInvoiceItems} />
            </div>
          </div>
        )}
      </div>

      {/* Formality Section */}
      <div className="card p-4">
        <button onClick={() => setHasFormality(!hasFormality)} className="w-full flex items-center gap-3 text-right">
          <input type="checkbox" checked={hasFormality} readOnly className="w-4 h-4" />
          <Clock className="w-5 h-5 text-teal" />
          <span className="font-bold">فرمالیته</span>
        </button>
        {hasFormality && (
          <div className="mt-4 pt-4 border-t border-line space-y-3">
            <div>
              <span className="label">لوکیشن ضبط</span>
              <input value={formalityLocation} onChange={(e) => setFormalityLocation(e.target.value)} placeholder="نام لوکیشن..." className="field" />
            </div>
            <div>
              <span className="label">تاریخ ضبط</span>
              <JalaliDatePicker value={formalityDate} onChange={setFormalityDate} />
            </div>
            <div>
              <span className="label">دوربین</span>
              <div className="space-y-2">
                {CAMERAS_FORMALITY.map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <input type="number" min="0" value={formalityCameras[c] || 0} onChange={(e) => setFormalityCameras({ ...formalityCameras, [c]: parseInt(e.target.value) || 0 })} placeholder="تعداد" className="field flex-1" />
                    <span className="text-[12px] w-20">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="label">نوع کلیپ</span>
              <select value={clipType} onChange={(e) => setClipType(e.target.value as any)} className="field">
                <option value="">انتخاب کنید</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <span className="label">تم درخواستی</span>
              <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="field">
                <option value="">انتخاب کنید</option>
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <span className="label">فاکتور فرمالیته</span>
              <InvoiceEditor items={formalityInvoiceItems} onChange={setFormalityInvoiceItems} />
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex gap-2 sticky bottom-0 px-3">
        <button onClick={onClose} className="btn btn-ghost flex-1">بستن</button>
        <button onClick={submit} className="btn btn-primary flex-1"><Save className="w-4 h-4" />ذخیره</button>
      </div>
    </div>
  );
};

const InvoiceEditor: React.FC<{ items: Array<{ name: string; count: number; price: number }>; onChange: (items: any[]) => void }> = ({ items, onChange }) => {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="text" value={item.name} onChange={(e) => { const next = [...items]; next[i].name = e.target.value; onChange(next); }} placeholder="نام" className="field flex-1 text-[12px]" />
          <input type="number" value={item.count} onChange={(e) => { const next = [...items]; next[i].count = parseInt(e.target.value) || 0; onChange(next); }} placeholder="تعداد" className="field w-16 text-[12px]" />
          <input type="number" value={item.price} onChange={(e) => { const next = [...items]; next[i].price = parseInt(e.target.value) || 0; onChange(next); }} placeholder="قیمت" className="field w-20 text-[12px]" />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="btn btn-ghost text-rose"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { name: '', count: 1, price: 0 }])} className="btn btn-ghost w-full text-gold"><Plus className="w-4 h-4" />مورد جدید</button>
      {items.length > 0 && (
        <div className="pt-2 border-t border-line text-right">
          <p className="text-[13px] font-bold">جمع: {items.reduce((s, x) => s + (x.count * x.price), 0).toLocaleString('fa-IR')} تومان</p>
        </div>
      )}
    </div>
  );
};
