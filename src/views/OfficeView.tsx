import React, { useState } from 'react';
import { Plus, Settings, FileText, TrendingUp } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { EmptyState } from '../components/EmptyState';
import { SectionGuide } from '../components/SectionGuide';

interface Props {
  projects: OfficeProject[];
  profile: StudioProfile | null;
  onAddProject: () => void;
  onSelectProject: (p: OfficeProject) => void;
  onEditProfile: () => void;
}

const fa = (n: number) => n.toLocaleString('fa-IR');

export const OfficeView: React.FC<Props> = ({ projects, profile, onAddProject, onSelectProject, onEditProfile }) => {
  return (
    <div className="space-y-4">
      <SectionGuide
        section="office"
        title="بخش دفتر کار"
        text="اینجا پروژه‌های مراسم و فرمالیته‌ات رو مدیریت کن. هر پروژه می‌تونه شامل مراسم، فرمالیته یا هردو باشه."
      />


      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-[15px]">پروژه‌ها</h2>
          <p className="text-[11px] text-muted mt-1">{fa(projects.length)} پروژه</p>
        </div>
        <button onClick={onAddProject} className="btn btn-primary" >
          <Plus className="w-4 h-4" />
          پروژه جدید
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="هنوز پروژه‌ای ثبت نشده"
          text="اولین پروژه‌ات رو با مراسم، فرمالیته یا هردو شروع کن."
          action={{ label: 'ساخت پروژه', onClick: onAddProject }}
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const ceremonyTotal = p.ceremonyInvoice?.total || 0;
            const formalityTotal = p.formalityInvoice?.total || 0;
            const total = ceremonyTotal + formalityTotal;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="card card-hover p-4 text-right"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-[14px]">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted">
                      {p.ceremony && <span className="pill">مراسم</span>}
                      {p.formality && <span className="pill">فرمالیته</span>}
                    </div>
                  </div>
                  {total > 0 && (
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-gold">{fa(total)}</p>
                      <p className="text-[10px] text-muted">درآمد</p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
