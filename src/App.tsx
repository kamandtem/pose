import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CategoryType,
  EMPTY_FILTERS,
  FilterState,
  LocationType,
  Pose,
  ViewTab,
} from './types/pose';
import {
  Prefs,
  deleteCustomPose,
  filterPoses,
  getAllPoses,
  getFavoriteIds,
  getNextPose,
  getPrefs,
  getRecentIds,
  hasOnboarded,
  markOnboarded,
  pushRecent,
  savePrefs,
  toggleFavorite,
} from './services/storage';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SideMenu } from './components/SideMenu';
import { Splash } from './components/Splash';
import { Onboarding } from './components/Onboarding';
import { ShootMode } from './components/ShootMode';
import { AddPoseSheet } from './components/AddPoseSheet';
import { ToastData, ToastStack } from './components/Toast';

import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { FavoritesView } from './views/FavoritesView';
import { MyPosesView } from './views/MyPosesView';
import { LocationsView } from './views/LocationsView';
import { PoseDetailView } from './views/PoseDetailView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { PrinciplesView } from './views/PrinciplesView';
import { EmergencyView } from './views/EmergencyView';
import { PoseGeneratorView } from './views/PoseGeneratorView';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [leavingSplash, setLeavingSplash] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const [prefs, setPrefs] = useState<Prefs>(getPrefs());
  const [tab, setTab] = useState<ViewTab>('home');
  const [poses, setPoses] = useState<Pose[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Pose | null>(null);
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS });

  const [menuOpen, setMenuOpen] = useState(false);
  const [shootOpen, setShootOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPose, setEditingPose] = useState<Pose | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((text: string, ok = true) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, text, kind: ok ? 'ok' : 'warn' }]);
    setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 3200);
  }, []);

  const reload = useCallback(() => {
    const all = getAllPoses();
    setPoses(all);
    setFavoriteIds(getFavoriteIds());
    setRecentIds(getRecentIds());
    setPrefs(getPrefs());
    setSelected((cur) => (cur ? all.find((p) => p.id === cur.id) || null : null));
  }, []);

  useEffect(() => {
    reload();
    setShowIntro(!hasOnboarded());
    const t1 = setTimeout(() => setLeavingSplash(true), 1350);
    const t2 = setTimeout(() => setBooting(false), 1850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reload]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goTab = (t: ViewTab) => {
    setTab(t);
    scrollTop();
  };

  const openPose = (pose: Pose) => {
    setSelected(pose);
    setRecentIds(pushRecent(pose.id));
    setTab('detail');
    scrollTop();
  };

  const handleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFavoriteIds(toggleFavorite(id));
  };

  const nextPose = (sameCategory = false) => {
    const base: FilterState = sameCategory && selected
      ? { ...EMPTY_FILTERS, category: selected.category }
      : filters;
    const next = getNextPose(selected?.id, base);
    setSelected(next);
    setRecentIds(getRecentIds());
    if (!shootOpen) {
      setTab('detail');
      scrollTop();
    }
  };

  const openShootMode = () => {
    if (!selected) {
      const first = poses[0];
      if (!first) return;
      setSelected(first);
    }
    setShootOpen(true);
  };

  const openAddPose = () => {
    setEditingPose(null);
    setSheetOpen(true);
  };

  const editPose = (p: Pose) => {
    setEditingPose(p);
    setSheetOpen(true);
  };

  const removePose = (p: Pose) => {
    if (!window.confirm(`ژست «${p.title}» حذف شود؟`)) return;
    deleteCustomPose(p.id);
    if (selected?.id === p.id) setSelected(null);
    reload();
    toast('ژست حذف شد.');
  };

  const updatePrefs = (p: Prefs) => {
    savePrefs(p);
    setPrefs(p);
  };

  const pickCategory = (c: CategoryType) => {
    setFilters({ ...EMPTY_FILTERS, category: c });
    goTab('library');
  };

  const pickLocation = (l: LocationType) => {
    setFilters({ ...EMPTY_FILTERS, location: l });
    goTab('library');
  };

  const filtered = useMemo(() => filterPoses(poses, filters, favoriteIds), [poses, filters, favoriteIds]);
  const mineCount = useMemo(() => poses.filter((p) => p.isCustom).length, [poses]);

  if (booting) return <Splash leaving={leavingSplash} />;
  if (showIntro) {
    return (
      <Onboarding
        onDone={() => {
          markOnboarded();
          setShowIntro(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header
        onOpenMenu={() => setMenuOpen(true)}
        onOpenShootMode={openShootMode}
        onOpenAddPose={openAddPose}
      />

      <main className="max-w-3xl mx-auto px-3 pt-5">
        {tab === 'home' && (
          <HomeView
            poses={poses}
            favoriteIds={favoriteIds}
            recentIds={recentIds}
            onSelect={openPose}
            onToggleFavorite={handleFavorite}
            onNextPose={() => nextPose(false)}
            onOpenShootMode={openShootMode}
            onOpenAddPose={openAddPose}
            onPickCategory={pickCategory}
            onPickLocation={pickLocation}
            onTab={goTab}
          />
        )}

        {tab === 'library' && (
          <LibraryView
            poses={filtered}
            filters={filters}
            onFilters={setFilters}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleFavorite}
            onSelect={openPose}
          />
        )}

        {tab === 'locations' && <LocationsView poses={poses} onPickLocation={pickLocation} />}

        {tab === 'favorites' && (
          <FavoritesView
            poses={poses}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleFavorite}
            onSelect={openPose}
            onOpenShootMode={openShootMode}
            onTab={goTab}
          />
        )}

        {tab === 'myposes' && (
          <MyPosesView
            poses={poses}
            onSelect={openPose}
            onEdit={editPose}
            onDelete={removePose}
            onOpenAddPose={openAddPose}
          />
        )}

        {tab === 'settings' && (
          <SettingsView
            poses={poses}
            favoriteIds={favoriteIds}
            prefs={prefs}
            onPrefs={updatePrefs}
            onReload={reload}
            onToast={toast}
            onTab={goTab}
          />
        )}

        {tab === 'principles' && <PrinciplesView />}

        {tab === 'generator' && <PoseGeneratorView />}

        {tab === 'emergency' && <EmergencyView />}

        {tab === 'about' && <AboutView />}

        {tab === 'detail' && selected && (
          <PoseDetailView
            pose={selected}
            onBack={() => goTab('library')}
            isFavorite={favoriteIds.includes(selected.id)}
            onToggleFavorite={handleFavorite}
            onNextPose={() => nextPose(false)}
            onOpenShootMode={openShootMode}
            onDataChanged={reload}
            onToast={toast}
            bigScript={prefs.bigScript}
          />
        )}

        {tab === 'detail' && !selected && (
          <div className="card p-8 text-center">
            <p className="text-[13px] text-muted">ابتدا یک ژست انتخاب کنید.</p>
            <button onClick={() => goTab('library')} className="btn btn-primary mt-4">
              رفتن به کتابخانه
            </button>
          </div>
        )}
      </main>

      <BottomNav
        activeTab={tab}
        onTabChange={goTab}
        onNextPose={() => nextPose(false)}
        favoritesCount={favoriteIds.length}
      />

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeTab={tab}
        onNavigate={goTab}
        onOpenAddPose={openAddPose}
        onOpenShootMode={openShootMode}
        theme={prefs.theme}
        onToggleTheme={() =>
          updatePrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })
        }
        counts={{ total: poses.length, favorites: favoriteIds.length, mine: mineCount }}
      />

      <ShootMode
        open={shootOpen}
        pose={selected}
        onClose={() => setShootOpen(false)}
        onNext={(sameCategory) => nextPose(sameCategory)}
        isFavorite={!!selected && favoriteIds.includes(selected.id)}
        onToggleFavorite={handleFavorite}
        bigScript={prefs.bigScript}
      />

      <AddPoseSheet
        open={sheetOpen}
        editing={editingPose}
        onClose={() => setSheetOpen(false)}
        onSaved={(message, ok) => {
          toast(message, ok);
          if (ok) reload();
        }}
      />

      <ToastStack items={toasts} />
    </div>
  );
}
