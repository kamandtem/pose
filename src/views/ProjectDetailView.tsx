import React, { useState } from 'react';
import { ArrowRight, Edit2, Trash2, X, Plus, Minus } from 'lucide-react';
import { OfficeProject, StudioProfile, Ceremony, Formality, ServiceType, CameraType } from '../types/pose';
import { OfficeProjectEditor } from '../components/OfficeProjectEditor';

interface Props {
  project: OfficeProject;
  profile: StudioProfile | null;
  onBack: () => void;
  onSave: (p: OfficeProject) => void;
  onDelete: (id: string) => void;
}

const SERVICES = ['عکاسی مراسم', 'میکس', 'آلبوم', 'عکس سر مجلسی', 'پخش کلیپ', 'TV اسلاید'] as ServiceType[];
const CAMERAS = ['دستی', 'کرین', 'لرزشگیر', 'عکاسی', 'هلی‌شات', 'FPV'] as CameraType[];
const money = (n: number) => n.toLocaleString('fa-IR');
const cleanNumber = (str: string) => parseInt(str.replace(/[^\d]/g, '')) || 0;

export const ProjectDetailView: React.FC<Props> = ({ project, profile, onBack, onSave, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [projectName, setProjectName] = useState(project.name);
  const [ceremonyServices, setCeremonyServices] = useState<Partial<Record<ServiceType, { checked: boolean; notes?: string }>>>(project.ceremony?.services || {});
  const [ceremonyCameras, setCeremonyCameras] = useState<Partial<Record<CameraType, number>>>(project.ceremony?.cameras || {});

  const handleServiceToggle = (service: ServiceType) => {
    setCeremonyServices((v) => ({
      ...v,
      [service]: { ...v[service], checked: !v[service]?.checked },
    }));
  };

  const handleCameraToggle = (camera: CameraType) => {
    setCeremonyCameras((v) => ({
      ...v,
      [camera]: v[camera] ? 0 : 1,
    }));
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <OfficeProjectEditor
          project={project}
          onSave={(p) => {
            onSave(p);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)',
            color: 'var(--color-gold)',
          }}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onBlur={() => {
            if (projectName.trim() !== project.name) {
              onSave({ ...project, name: projectName.trim() || 'پروژه جدید' });
            }
          }}
          placeholder="نام پروژه"
          className="text-[20px] font-extrabold flex-1 bg-transparent border-0 outline-none px-2"
        />
      </div>

      {/* Ceremony Section */}
      {project.ceremony && (
        <div className="card p-4">
          <h3 className="font-bold text-[14px] mb-3">مراسم</h3>
          <p className="text-[12px] text-muted mb-4">
            <strong>تاریخ:</strong> {new Date(project.ceremony.date).toLocaleDateString('fa-IR')}
          </p>

          {/* Services with Toggle Switches */}
          <div className="space-y-3 mb-4 pb-4 border-b border-line">
            <span className="label text-[13px] font-bold">خدمات</span>
            {SERVICES.map((service) => (
              <div key={service} className="space-y-2">
                <div className="flex items-center justify-start gap-3">
                  <ToggleSwitch
                    active={ceremonyServices[service]?.checked || false}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <label className="text-[12px] font-semibold flex-1">{service}</label>
                </div>
              </div>
            ))}
          </div>

          {/* Cameras with Toggle Switches */}
          <div className="space-y-3">
            <span className="label text-[13px] font-bold">دوربین‌ها</span>
            {CAMERAS.map((camera) => (
              <div key={camera} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold">{camera}</label>
                  <ToggleSwitch
                    active={(ceremonyCameras[camera] || 0) > 0}
                    onChange={() => handleCameraToggle(camera)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 sticky bottom-3">
        <button
          onClick={() => setEditing(true)}
          className="btn btn-ghost flex-1"
        >
          <Edit2 className="w-4 h-4" />
          ویرایش پروژه
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-ghost"
          style={{ color: 'var(--color-rose)' }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(4,3,8,.72)' }}
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative card p-6 text-center">
            <p className="text-[14px] mb-4">این پروژه حذف شود؟</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost flex-1"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  onDelete(project.id);
                  onBack();
                }}
                className="btn btn-primary flex-1"
                style={{ background: 'var(--color-rose)' }}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleSwitch: React.FC<{ active: boolean; onChange: () => void }> = ({
  active,
  onChange,
}) => (
  <button
    onClick={onChange}
    className="w-10 h-6 rounded-full transition-colors flex items-center p-1"
    style={{ background: active ? 'var(--color-teal)' : 'var(--color-line)' }}
    aria-label="Toggle"
  >
    <span
      className="w-4 h-4 rounded-full bg-ink transition-transform"
      style={{ transform: active ? 'translateX(16px)' : 'translateX(0)' }}
    />
  </button>
);


    setItems(newItems);
  };

  const handlePriceChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      price: cleanNumber(value),
    };
    setItems(newItems);
  };

  const total = items.reduce((sum, x) => sum + x.count * x.price, 0) + deposit;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.72)' }}
        onClick={onClose}
      />
      <div className="relative card p-5 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-line">
          <div className="flex-1">
            <p className="text-[13px] text-muted">{profile?.name || 'آتلیه'}</p>
            <h2 className="text-[15px] font-extrabold">{project.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 ml-2"
            style={{
              background: 'color-mix(in srgb, var(--color-muted) 16%, transparent)',
              color: 'var(--color-muted)',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Items */}
        <div className="space-y-4 mb-6">
          {items.map((item, i) => (
            <div key={i} className="space-y-2">
              {/* Row 1: Service name + edit/delete icons */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-[13px] text-right flex-1">{item.name}</span>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    className="p-1.5 rounded-lg hover:bg-surface2 transition-colors"
                    title="ویرایش"
                  >
                    <Edit2 className="w-4 h-4 text-gold" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-surface2 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 text-rose" />
                  </button>
                </div>
              </div>

              {/* Row 2: Quantity +/- and Price */}
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-line bg-surface2">
                  <button
                    onClick={() => handleQuantityChange(i, -1)}
                    className="p-1 rounded-lg hover:bg-surface transition-colors"
                    title="کاهش"
                  >
                    <Minus className="w-4 h-4 text-muted" />
                  </button>
                  <span className="w-8 text-center text-[12px] font-bold text-ink">
                    {item.count}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(i, 1)}
                    className="p-1 rounded-lg hover:bg-surface transition-colors"
                    title="افزایش"
                  >
                    <Plus className="w-4 h-4 text-muted" />
                  </button>
                </div>

                {/* Price Input */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={money(item.price)}
                  onChange={(e) => handlePriceChange(i, e.target.value)}
                  placeholder="مبلغ"
                  className="field flex-1 text-[12px] text-right font-bold"
                />
              </div>

              {/* Separator */}
              {i < items.length - 1 && <div className="h-px bg-line mt-3" />}
            </div>
          ))}
        </div>

        {/* Deposit Section */}
        {deposit > 0 && (
          <div className="mb-4 pb-4 border-b border-line">
            <p className="text-[12px] text-muted mb-2">بیعانه</p>
            <p className="text-[13px] font-bold text-gold">{money(deposit)} تومان</p>
          </div>
        )}

        {/* Total */}
        <div className="mb-4 pt-3 border-t border-line">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">جمع کل</span>
            <span className="text-[15px] font-extrabold text-gold">{money(total)} تومان</span>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-primary w-full">
          بستن
        </button>
      </div>
    </div>
  );
};
