import React, { useState } from 'react';
import { Plus, X, Save, Film, Clock, Check, Minus, Trash2, MapPin, Camera, Receipt } from 'lucide-react';
import { OfficeProject, Ceremony, Formality, ProjectInvoice, CameraType, ServiceType, LocationTypeFormatted, ThemeType } from '../types/pose';
import { JalaliDatePicker } from './JalaliDatePicker';
import { jalaliToIso, todayJalali, JalaliDate } from '../services/jalali';

const CAMERAS: CameraType[] = ['دستی', 'کرین', 'لرزشگیر', 'عکاسی', 'هلی‌شات', 'FPV'];
const SERVICES: ServiceType[] = ['عکاسی مراسم', 'میکس', 'آلبوم', 'عکس سر مجلسی', 'پخش کلیپ', 'TV اسلاید'];
const LOCATIONS: LocationTypeFormatted[] = ['محلی', 'شمال', 'جنوب', 'باغ عمارت'];
const THEMES: ThemeType[] = ['شاد و اکتیو', 'ارامش', 'عاشقانه احساسی'];
type Line = { name: string; count: number; price: number };

interface Props { project: OfficeProject; onSave: (p: OfficeProject) => void; onClose: () => void; }
const money = (n: number) => n.toLocaleString('fa-IR');
const dateValue = (iso?: string): JalaliDate => {
  if (!iso) return todayJalali();
  const [y, m, d] = iso.split('-').map(Number);
  return { jy: y, jm: m, jd: d };
};
const qty = (n: number, delta: number) => Math.max(1, n + delta);

export const OfficeProjectEditor: React.FC<Props> = ({ project, onSave, onClose }) => {
  const [name, setName] = useState(project.name);
  const [ceremonyOn, setCeremonyOn] = useState(Boolean(project.ceremony));
  const [formalityOn, setFormalityOn] = useState(Boolean(project.formality));
  const [ceremonyLocation, setCeremonyLocation] = useState(project.ceremony?.location || '');
  const [ceremonyDate, setCeremonyDate] = useState(dateValue(project.ceremony?.date));
  const [formalityLocation, setFormalityLocation] = useState(project.formality?.location || '');
  const [formalityDate, setFormalityDate] = useState(dateValue(project.formality?.recordDate));
  const [clipType, setClipType] = useState<LocationTypeFormatted | ''>(project.formality?.clipType || '');
  const [theme, setTheme] = useState<ThemeType | ''>(project.formality?.theme || '');
  const [ceremonyServices, setCeremonyServices] = useState<Partial<Record<ServiceType, { checked: boolean; notes?: string }>>>(project.ceremony?.services || {});
  const [ceremonyCameras, setCeremonyCameras] = useState<Partial<Record<CameraType, number>>>(project.ceremony?.cameras || {});
  const [ceremonyLines, setCeremonyLines] = useState<Line[]>(project.ceremonyInvoice?.items || []);
  const [formalityLines, setFormalityLines] = useState<Line[]>(project.formalityInvoice?.items || []);
  const [ceremonyDeposit, setCeremonyDeposit] = useState(project.ceremonyInvoice?.deposit || 0);
  const [formalityDeposit, setFormalityDeposit] = useState(project.formalityInvoice?.deposit || 0);
  const [customer, setCustomer] = useState(project.ceremonyInvoice?.customerName || project.formalityInvoice?.customerName || '');

  const toggleService = (service: ServiceType) => setCeremonyServices((v) => ({ ...v, [service]: { ...v[service], checked: !v[service]?.checked } }));
  const toggleCamera = (camera: CameraType) => setCeremonyCameras((v) => ({ ...v, [camera]: v[camera] ? 0 : 1 }));
  const cameraLines = Object.entries(ceremonyCameras).filter(([, count]) => Number(count) > 0).map(([name, count]) => ({ name: `دوربین/${name}`, count: Number(count), price: ceremonyLines.find((x) => x.name === `دوربین/${name}`)?.price || 0 }));
  const serviceLines = SERVICES.filter((s) => ceremonyServices[s]?.checked).map((name) => ({ name, count: 1, price: ceremonyLines.find((x) => x.name === name)?.price || 0 }));
  const mergedCeremonyLines = [...serviceLines, ...cameraLines, ...ceremonyLines.filter((x) => !SERVICES.includes(x.name as ServiceType) && !x.name.startsWith('دوربین/'))];
  const total = (lines: Line[]) => lines.reduce((sum, x) => sum + x.count * x.price, 0);

  const save = () => {
    const now = Date.now();
    const invoice = (items: Line[], deposit: number): ProjectInvoice | undefined => items.length || deposit ? { id: 'inv_' + now.toString(36), items, deposit, customerName: customer.trim() || undefined, total: total(items), createdAt: now, updatedAt: now } : undefined;
    const ceremony: Ceremony | undefined = ceremonyOn ? { id: project.ceremony?.id || 'cer_' + now.toString(36), location: ceremonyLocation.trim() || undefined, date: jalaliToIso(ceremonyDate), cameras: ceremonyCameras, services: ceremonyServices, createdAt: project.ceremony?.createdAt || now, updatedAt: now } : undefined;
    const formality: Formality | undefined = formalityOn ? { id: project.formality?.id || 'for_' + now.toString(36), location: formalityLocation.trim() || undefined, recordDate: jalaliToIso(formalityDate), cameras: {}, clipType: clipType || undefined, theme: theme || undefined, createdAt: project.formality?.createdAt || now, updatedAt: now } : undefined;
    onSave({ ...project, name: name.trim() || 'پروژه جدید', ceremony, formality, ceremonyInvoice: ceremonyOn ? invoice(mergedCeremonyLines, ceremonyDeposit) : undefined, formalityInvoice: formalityOn ? invoice(formalityLines, formalityDeposit) : undefined, updatedAt: now });
  };

  return <div className="space-y-4 pb-8">
    <div className="card p-4"><span className="label">نام پروژه</span><input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="نام پروژه" /><div className="mt-3"><span className="label">نام مشتری</span><input value={customer} onChange={(e) => setCustomer(e.target.value)} className="field" placeholder="نام مشتری برای فاکتور" /></div></div>
    <Toggle title="مراسم" icon={Film} active={ceremonyOn} onClick={() => setCeremonyOn(!ceremonyOn)} />
    {ceremonyOn && <section className="card p-4 space-y-4"><div><span className="label flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gold" /> لوکیشن مراسم</span><input value={ceremonyLocation} onChange={(e) => setCeremonyLocation(e.target.value)} className="field" placeholder="نام تالار یا لوکیشن" /></div><div><span className="label">تاریخ مراسم</span><JalaliDatePicker value={ceremonyDate} onChange={setCeremonyDate} /></div><div><span className="label">خدمات مراسم</span><div className="space-y-2">{SERVICES.map((service) => <button key={service} type="button" onClick={() => toggleService(service)} className="w-full flex items-center gap-3 p-3 rounded-2xl border text-right" style={{ opacity: ceremonyServices[service]?.checked ? 1 : .58, borderColor: ceremonyServices[service]?.checked ? 'var(--color-teal)' : 'var(--color-line)', background: ceremonyServices[service]?.checked ? 'color-mix(in srgb, var(--color-teal) 10%, transparent)' : 'transparent' }}><span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ceremonyServices[service]?.checked ? 'var(--color-teal)' : 'var(--color-surface2)', color: ceremonyServices[service]?.checked ? 'var(--color-bg)' : 'var(--color-muted)' }}>{ceremonyServices[service]?.checked && <Check className="w-4 h-4" />}</span><span className="flex-1 text-[12px] font-bold">{service}</span></button>)}</div></div><div><span className="label flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-gold" /> دوربین‌ها</span><div className="space-y-2">{CAMERAS.map((camera) => { const count = ceremonyCameras[camera] || 0; const on = count > 0; return <div key={camera} className="flex items-center gap-2 p-2.5 rounded-2xl border" style={{ opacity: on ? 1 : .58, borderColor: on ? 'var(--color-teal)' : 'var(--color-line)' }}><button type="button" onClick={() => toggleCamera(camera)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: on ? 'var(--color-teal)' : 'var(--color-surface2)' }}>{on && <Check className="w-4 h-4 text-bg" />}</button><span className="flex-1 text-[12px] font-bold">{camera}</span>{on && <Counter value={count} onChange={(n) => setCeremonyCameras({ ...ceremonyCameras, [camera]: n })} />}</div>; })}</div></div><InvoiceEditor title="فاکتور مراسم" items={mergedCeremonyLines} deposit={ceremonyDeposit} onDeposit={setCeremonyDeposit} onChange={setCeremonyLines} /></section>}
    <Toggle title="فرمالیته" icon={Clock} active={formalityOn} onClick={() => setFormalityOn(!formalityOn)} />
    {formalityOn && <section className="card p-4 space-y-4"><div><span className="label">لوکیشن فرمالیته</span><input value={formalityLocation} onChange={(e) => setFormalityLocation(e.target.value)} className="field" /></div><div><span className="label">تاریخ فرمالیته</span><JalaliDatePicker value={formalityDate} onChange={setFormalityDate} /></div><div><span className="label">نوع کلیپ</span><select value={clipType} onChange={(e) => setClipType(e.target.value as LocationTypeFormatted)} className="field"><option value="">انتخاب کنید</option>{LOCATIONS.map((x) => <option key={x}>{x}</option>)}</select></div><div><span className="label">تم درخواستی</span><select value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)} className="field"><option value="">انتخاب کنید</option>{THEMES.map((x) => <option key={x}>{x}</option>)}</select></div><InvoiceEditor title="فاکتور فرمالیته" items={formalityLines} deposit={formalityDeposit} onDeposit={setFormalityDeposit} onChange={setFormalityLines} /></section>}
    <div className="sticky bottom-0 flex gap-2 p-3 bg-surface/95 border-t border-line"><button onClick={onClose} className="btn btn-ghost flex-1"><X className="w-4 h-4" />انصراف</button><button onClick={save} className="btn btn-primary flex-[2]"><Save className="w-4 h-4" />ثبت پروژه</button></div>
  </div>;
};

const Toggle: React.FC<{ title: string; icon: React.ElementType; active: boolean; onClick: () => void }> = ({ title, icon: Icon, active, onClick }) => <button type="button" onClick={onClick} className="card w-full p-4 flex items-center gap-3 text-right" style={{ opacity: active ? 1 : .64 }}><span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: active ? 'color-mix(in srgb, var(--color-teal) 16%, transparent)' : 'var(--color-surface2)', color: active ? 'var(--color-teal)' : 'var(--color-muted)' }}><Icon className="w-4 h-4" /></span><span className="flex-1 font-extrabold">{title}</span><span className="w-11 h-6 rounded-full p-1" style={{ background: active ? 'var(--color-teal)' : 'var(--color-line)' }}><span className="block w-4 h-4 rounded-full bg-ink transition-transform" style={{ transform: active ? 'translateX(-20px)' : 'translateX(0)' }} /></span></button>;
const Counter: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => <span className="flex items-center gap-2"><button type="button" onClick={() => onChange(qty(value, -1))} className="w-7 h-7 rounded-full border border-line flex items-center justify-center"><Minus className="w-3 h-3" /></button><b className="w-5 text-center text-[12px]">{value}</b><button type="button" onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-full border border-line flex items-center justify-center"><Plus className="w-3 h-3" /></button></span>;
const InvoiceEditor: React.FC<{ title: string; items: Line[]; deposit: number; onDeposit: (n: number) => void; onChange: (items: Line[]) => void }> = ({ title, items, deposit, onDeposit, onChange }) => <div className="pt-3 border-t border-line space-y-3"><h3 className="font-extrabold flex items-center gap-2"><Receipt className="w-4 h-4 text-gold" />{title}</h3>{items.map((item, i) => <div key={i} className="flex items-center gap-2"><input value={item.name} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], name: e.target.value }; onChange(n); }} className="field flex-1 text-[11px]" placeholder="شرح خدمت" /><Counter value={item.count} onChange={(v) => { const n = [...items]; n[i] = { ...n[i], count: v }; onChange(n); }} /><input type="number" inputMode="numeric" value={item.price} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], price: Number(e.target.value) || 0 }; onChange(n); }} className="field w-28 text-[11px]" placeholder="مبلغ تومان" /><button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-rose"><Trash2 className="w-4 h-4" /></button></div>)}<button type="button" onClick={() => onChange([...items, { name: '', count: 1, price: 0 }])} className="btn btn-ghost w-full !py-2"><Plus className="w-4 h-4 text-gold" />افزودن به فاکتور</button><div><span className="label">بیعانه، تومان</span><input type="number" inputMode="numeric" value={deposit || ''} onChange={(e) => onDeposit(Number(e.target.value) || 0)} className="field" placeholder="۰" /></div><div className="flex justify-between font-extrabold text-gold"><span>جمع کل</span><span>{money(items.reduce((s, x) => s + x.count * x.price, 0))} تومان</span></div></div>;
