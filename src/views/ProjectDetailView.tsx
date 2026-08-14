import React, { useState } from 'react';
import { ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { OfficeProjectEditor } from '../components/OfficeProjectEditor';

interface Props {
  project: OfficeProject;
  profile: StudioProfile | null;
  onBack: () => void;
  onSave: (p: OfficeProject) => void;
  onDelete: (id: string) => void;
}

export const ProjectDetailView: React.FC<Props> = ({ project, onBack, onSave, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  if (editing) {
    return (
      <div className="space-y-4">
        <OfficeProjectEditor project={project} onSave={(p) => { onSave(p); setEditing(false); }} onClose={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}>
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-extrabold flex-1">{project.name}</h1>
      </div>

      {/* Ceremony Section */}
      {project.ceremony && (
        <div className="card p-4">
          <h3 className="font-bold text-[14px] mb-3">بخش مراسم</h3>
          <div className="space-y-2 text-[12px] text-muted mb-4">
            <p><strong>تاریخ:</strong> {new Date(project.ceremony.date).toLocaleDateString('fa-IR')}</p>
            {project.ceremony.cameras && Object.entries(project.ceremony.cameras).filter(([_, c]) => c > 0).length > 0 && (
              <div>
                <strong>دوربین:</strong>
                <ul className="mt-1 mr-2 space-y-1">
                  {Object.entries(project.ceremony.cameras).filter(([_, c]) => c > 0).map(([name, count]) => (
                    <li key={name}>• {name}: {count} دستگاه</li>
                  ))}
                </ul>
              </div>
            )}
            {project.ceremony.services && Object.entries(project.ceremony.services).filter(([_, s]) => s.checked).length > 0 && (
              <div>
                <strong>موارد انتخاب‌شده:</strong>
                <ul className="mt-1 mr-2 space-y-1">
                  {Object.entries(project.ceremony.services).filter(([_, s]) => s.checked).map(([name, s]) => (
                    <li key={name}>• {name}{s.notes ? ': ' + s.notes : ''}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {project.ceremonyInvoice && (
            <div className="bg-surface2 p-3 rounded-lg text-[12px]">
              <strong>فاکتور:</strong>
              <div className="mt-1 space-y-1">
                {project.ceremonyInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{(item.count * item.price).toLocaleString('fa-IR')} تومان</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-line font-bold flex justify-between">
                <span>جمع:</span>
                <span>{project.ceremonyInvoice.total.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formality Section */}
      {project.formality && (
        <div className="card p-4">
          <h3 className="font-bold text-[14px] mb-3">بخش فرمالیته</h3>
          <div className="space-y-2 text-[12px] text-muted mb-4">
            <p><strong>تاریخ ضبط:</strong> {new Date(project.formality.recordDate).toLocaleDateString('fa-IR')}</p>
            {project.formality.location && <p><strong>لوکیشن:</strong> {project.formality.location}</p>}
            {project.formality.clipType && <p><strong>نوع کلیپ:</strong> {project.formality.clipType}</p>}
            {project.formality.theme && <p><strong>تم:</strong> {project.formality.theme}</p>}
            {project.formality.cameras && Object.entries(project.formality.cameras).filter(([_, c]) => c > 0).length > 0 && (
              <div>
                <strong>دوربین:</strong>
                <ul className="mt-1 mr-2 space-y-1">
                  {Object.entries(project.formality.cameras).filter(([_, c]) => c > 0).map(([name, count]) => (
                    <li key={name}>• {name}: {count} دستگاه</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {project.formalityInvoice && (
            <div className="bg-surface2 p-3 rounded-lg text-[12px]">
              <strong>فاکتور:</strong>
              <div className="mt-1 space-y-1">
                {project.formalityInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{(item.count * item.price).toLocaleString('fa-IR')} تومان</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-line font-bold flex justify-between">
                <span>جمع:</span>
                <span>{project.formalityInvoice.total.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 sticky bottom-3">
        <button onClick={() => setEditing(true)} className="btn btn-ghost flex-1"><Edit2 className="w-4 h-4" />ویرایش پروژه</button>
        <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-ghost" style={{ color: 'var(--color-rose)' }}><Trash2 className="w-4 h-4" /></button>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ background: 'rgba(4,3,8,.72)' }} onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative card p-6 text-center">
            <p className="text-[14px] mb-4">این پروژه حذف شود؟</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-ghost flex-1">انصراف</button>
              <button onClick={() => { onDelete(project.id); onBack(); }} className="btn btn-primary flex-1" style={{ background: 'var(--color-rose)' }}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
