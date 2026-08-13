import React from 'react';
import { Heart, Play, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { EmptyState } from '../components/EmptyState';
import { SectionGuide } from '../components/SectionGuide';
import { ShootProject, deleteProject, getProjects, saveProject } from '../services/storage';

interface Props {
  poses: Pose[];
  favoriteIds: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (p: Pose) => void;
  onDelete: (p: Pose) => void;
  onAddToProject: (p: Pose) => void;
  onOpenShootMode: () => void;
  onTab: (t: ViewTab) => void;
}

export const FavoritesView: React.FC<Props> = ({
  poses,
  favoriteIds,
  onToggleFavorite,
  onSelect,
  onDelete,
  onAddToProject,
  onOpenShootMode,
  onTab,
}) => {
  const [projects, setProjects] = React.useState<ShootProject[]>(getProjects());
  const [openProject, setOpenProject] = React.useState<string | null>(null);
  const refreshProjects = () => setProjects(getProjects());
  const createProject = () => {
    const name = window.prompt('نام پروژه بعدی را بنویس');
    if (!name?.trim()) return;
    const date = window.prompt('تاریخ پروژه را وارد کن', new Date().toISOString().slice(0,10)) || new Date().toISOString().slice(0,10);
    saveProject({ id: `project-${Date.now()}`, name: name.trim(), date, poseIds: [], createdAt: Date.now() });
    refreshProjects();
  };
  const addToProject = (pose: Pose) => {
    const current = getProjects();
    if (!current.length) { createProject(); return; }
    const choice = window.prompt(`شماره پروژه را انتخاب کن:\n${current.map((p, i) => `${i + 1}. ${p.name} (${p.date})`).join('\n')}`, '1');
    const project = current[Number(choice) - 1];
    if (!project) return;
    saveProject({ ...project, poseIds: Array.from(new Set([...project.poseIds, pose.id])) });
    refreshProjects();
  };
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
              onDelete={onDelete}
              onAddToProject={onAddToProject}
            />
          ))}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-extrabold text-[15px]"><CalendarDays className="w-4 h-4 text-gold"/> پروژه بعدی</h2>
          <button onClick={createProject} className="btn btn-primary !py-2 !px-3 !text-[11px]"><Plus className="w-3.5 h-3.5"/> پروژه جدید</button>
        </div>
        {projects.length === 0 ? <div className="card p-4 text-[12px] text-muted leading-relaxed">برای پروژه بعدی اسم و تاریخ بگذار، بعد ژست‌های موردنظرت را با دکمه + کنار هر ژست اضافه کن.</div> : <div className="space-y-2.5">{projects.map((project) => { const projectPoses = project.poseIds.map((id) => poses.find((p) => p.id === id)).filter(Boolean) as Pose[]; return <div key={project.id} className="card overflow-hidden"><button onClick={()=>setOpenProject(openProject===project.id?null:project.id)} className="w-full p-4 flex items-center gap-3 text-right"><CalendarDays className="w-4 h-4 text-gold"/><span className="flex-1"><b className="block text-[13px]">{project.name}</b><span className="text-[10px] text-muted">{project.date} · {projectPoses.length} ژست</span></span><span className="text-gold text-[11px]">{openProject===project.id?'بستن':'مشاهده'}</span></button>{openProject===project.id && <div className="px-4 pb-4 space-y-2"><div className="flex gap-2"><button onClick={()=>{const name=window.prompt('نام پروژه',project.name)||project.name;const date=window.prompt('تاریخ پروژه',project.date)||project.date;saveProject({...project,name,date});refreshProjects();}} className="btn btn-ghost !py-2 !text-[11px]">ویرایش نام و تاریخ</button><button onClick={()=>{if(window.confirm('این پروژه حذف شود؟')){deleteProject(project.id);refreshProjects();}}} className="btn btn-ghost !py-2 !text-[11px]" style={{color:'var(--color-rose)'}}><Trash2 className="w-3.5 h-3.5"/>حذف پروژه</button></div>{projectPoses.length===0?<p className="text-[11px] text-muted">هنوز ژستی به این پروژه اضافه نشده.</p>:projectPoses.map(p=><div key={p.id} className="flex items-center gap-2 text-[11px] border-t border-line pt-2"><span className="flex-1">{p.title}</span><button onClick={()=>saveProject({...project,poseIds:project.poseIds.filter(id=>id!==p.id)})} className="text-rose">حذف از پروژه</button></div>)}</div>}</div>; })}</div>}
      </section>
    </div>
  );
};
