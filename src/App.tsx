import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CategoryType,
  EMPTY_FILTERS,
  FilterState,
  LocationType,
  MyLocation,
  Pose,
  ViewTab,
} from './types/pose';
import {
  Prefs,
  deletePoseEverywhere,
  promotePose,
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
  getMyLocations,
  saveMyLocation,
  deleteMyLocation,
  getSelectedLocationId,
  setSelectedLocationId,
} from './services/storage';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SideMenu } from './components/SideMenu';
import { Splash } from './components/Splash';
import { Onboarding } from './components/Onboarding';
import { ShootMode } from './components/ShootMode';
import { AddPoseSheet } from './components/AddPoseSheet';
import { ToastData, ToastStack } from './components/Toast';
import { ConfirmDialog, ConfirmRequest } from './components/ConfirmDialog';
import { AddToProjectSheet } from './components/AddToProjectSheet';
import { LogOut, Trash2 } from 'lucide-react';

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
import { MyLocationsView } from './views/MyLocationsView';
import { WeatherView } from './views/WeatherView';
import { MyLocationDialog } from './components/MyLocationDialog';

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
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [addToProjectPose, setAddToProjectPose] = useState<Pose | null>(null);
  const [myLocations, setMyLocations] = useState<MyLocation[]>([]);
  const [selectedLocationId, setSelLocId] = useState<string | null>(null);
  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<MyLocation | null>(null);
  const navDepthRef = useRef(0);

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
    setMyLocations(getMyLocations());
    setSelLocId(getSelectedLocationId());
    setSelected((cur) => (cur ? all.find((p) => p.id === cur.id) || null : null));
  }, []);

  // ناوبری برگشت: هر تغییر صفحه یک ورودی تاریخچه مرورگر می‌سازد تا دکمه برگشت
  // (چه در وب، چه دکمه سخت‌افزاری اندروید) همیشه دقیقاً یک قدم به عقب برود.
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ tab: 'home', depth: 0 }, '');
    }
  }, []);

  const askExit = useCallback(() => {
    setConfirmRequest({
      title: 'خروج از برنامه',
      text: 'آیا می‌خواهید از کارگردان ژست خارج شوید؟',
      confirmLabel: 'خروج',
      cancelLabel: 'ماندن',
      tone: 'gold',
      icon: LogOut,
      onConfirm: () => {
        const cap = (window as any).Capacitor;
        if (cap?.isNativePlatform?.()) {
          import('@capacitor/app')
            .then((mod) => mod.App.exitApp())
            .catch(() => window.close());
        } else {
          window.close();
        }
      },
    });
  }, []);

  useEffect(() => {
    const closeTopOverlay = (): boolean => {
      if (sheetOpen) { setSheetOpen(false); return true; }
      if (shootOpen) { setShootOpen(false); return true; }
      if (menuOpen) { setMenuOpen(false); return true; }
      if (confirmRequest) { setConfirmRequest(null); return true; }
      if (addToProjectPose) { setAddToProjectPose(null); return true; }
      if (locDialogOpen) { setLocDialogOpen(false); return true; }
      return false;
    };

    const onPopState = (e: PopStateEvent) => {
      if (closeTopOverlay()) {
        // اورلی بسته شد؛ ورودی تاریخچه را برای همان صفحه برمی‌گردانیم
        window.history.pushState(e.state || { tab, depth: navDepthRef.current }, '');
        return;
      }
      const state = e.state as { tab?: ViewTab; depth?: number } | null;
      if (state?.tab) {
        setTab(state.tab);
        navDepthRef.current = state.depth || 0;
      }
    };
    window.addEventListener('popstate', onPopState);

    let removeCapListener: (() => void) | undefined;
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      import('@capacitor/app')
        .then((mod) => {
          const sub = mod.App.addListener('backButton', ({ canGoBack }) => {
            if (closeTopOverlay()) return;
            if (canGoBack) window.history.back();
            else askExit();
          });
          removeCapListener = () => { sub.then((s) => s.remove()).catch(() => {}); };
        })
        .catch(() => {
          /* روی وب یا اگر پلاگین موجود نباشد، فقط popstate کار می‌کند */
        });
    }

    return () => {
      window.removeEventListener('popstate', onPopState);
      removeCapListener?.();
    };
  }, [sheetOpen, shootOpen, menuOpen, confirmRequest, addToProjectPose, locDialogOpen, askExit, tab]);

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
    if (t !== tab) {
      navDepthRef.current += 1;
      window.history.pushState({ tab: t, depth: navDepthRef.current }, '');
    }
    setTab(t);
    scrollTop();
  };

  const openPose = (pose: Pose) => {
    setSelected(pose);
    setRecentIds(pushRecent(pose.id));
    if (tab !== 'detail') {
      navDepthRef.current += 1;
      window.history.pushState({ tab: 'detail', depth: navDepthRef.current }, '');
    }
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
    setConfirmRequest({
      title: 'حذف ژست',
      text: `ژست «${p.title}» حذف شود؟ این ژست دیگر در برنامه نمایش داده نمی‌شود.`,
      confirmLabel: 'حذف ژست',
      tone: 'danger',
      icon: Trash2,
      onConfirm: () => {
        deletePoseEverywhere(p);
        if (selected?.id === p.id) setSelected(null);
        reload();
        toast('ژست حذف شد.');
      },
    });
  };

  const promote = (p: Pose) => {
    setConfirmRequest({
      title: 'انتقال به ژست‌های اصلی',
      text: `ژست «${p.title}» به ژست‌های اصلی منتقل شود؟`,
      confirmLabel: 'انتقال',
      tone: 'neutral',
      onConfirm: () => {
        if (promotePose(p.id)) {
          reload();
          toast('ژست به ژست‌های اصلی منتقل شد.');
        } else toast('انتقال ژست انجام نشد.', false);
      },
    });
  };

  const addToProject = (p: Pose) => setAddToProjectPose(p);

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

  const openAddLoc = () => {
    setEditingLoc(null);
    setLocDialogOpen(true);
  };

  const editLoc = (l: MyLocation) => {
    setEditingLoc(l);
    setLocDialogOpen(true);
  };

  const saveLoc = (loc: MyLocation) => {
    const wasEditing = !!editingLoc;
    const res = saveMyLocation(loc);
    setLocDialogOpen(false);
    if (res.ok) {
      reload();
      toast(wasEditing ? 'لوکیشن ویرایش شد.' : 'لوکیشن ذخیره شد.');
    } else {
      toast(res.error || 'ذخیره لوکیشن انجام نشد.', false);
    }
  };

  const removeLoc = (l: MyLocation) => {
    setConfirmRequest({
      title: 'حذف لوکیشن',
      text: 'لوکیشن «' + l.name + '» حذف شود؟',
      confirmLabel: 'حذف لوکیشن',
      tone: 'danger',
      icon: Trash2,
      onConfirm: () => {
        deleteMyLocation(l.id);
        reload();
        toast('لوکیشن حذف شد.');
      },
    });
  };

  const useLocationForWeather = (l: MyLocation) => {
    setSelectedLocationId(l.id);
    setSelLocId(l.id);
    goTab('weather');
  };

  const selectedLocation = useMemo(
    () => myLocations.find((l) => l.id === selectedLocationId) || null,
    [myLocations, selectedLocationId]
  );

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
            onDelete={removePose}
            onAddToProject={addToProject}
            onToggleFavorite={handleFavorite}
            onNextPose={() => nextPose(false)}
            onOpenShootMode={openShootMode}
            onOpenAddPose={openAddPose}
            onPickCategory={pickCategory}
            onPickLocation={pickLocation}
            onTab={goTab}
            selectedLocation={selectedLocation}
            onOpenWeather={() => goTab('weather')}
            onOpenMyLocations={() => goTab('mylocations')}
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
            onDelete={removePose}
            onAddToProject={addToProject}
          />
        )}

        {tab === 'locations' && <LocationsView poses={poses} onPickLocation={pickLocation} />}

        {tab === 'mylocations' && (
          <MyLocationsView
            locations={myLocations}
            selectedId={selectedLocationId}
            onAdd={openAddLoc}
            onEdit={editLoc}
            onDelete={removeLoc}
            onUseForWeather={useLocationForWeather}
          />
        )}

        {tab === 'weather' && (
          <WeatherView
            selected={selectedLocation}
            onBack={() => (window.history.length > 1 ? window.history.back() : goTab('home'))}
            onManageLocations={() => goTab('mylocations')}
          />
        )}

        {tab === 'favorites' && (
          <FavoritesView
            poses={poses}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleFavorite}
            onSelect={openPose}
            onDelete={removePose}
            onAddToProject={addToProject}
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
            onPromote={promote}
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
            onBack={() => (window.history.length > 1 ? window.history.back() : goTab('library'))}
            isFavorite={favoriteIds.includes(selected.id)}
            onToggleFavorite={handleFavorite}
            onNextPose={() => nextPose(false)}
            onOpenShootMode={openShootMode}
            onDataChanged={reload}
            onDelete={removePose}
            onAddToProject={addToProject}
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

      <ConfirmDialog request={confirmRequest} onClose={() => setConfirmRequest(null)} />

      <AddToProjectSheet
        pose={addToProjectPose}
        onClose={() => setAddToProjectPose(null)}
        onAdded={(message) => toast(message, true)}
      />

      <MyLocationDialog
        open={locDialogOpen}
        editing={editingLoc}
        onCancel={() => setLocDialogOpen(false)}
        onConfirm={saveLoc}
      />
    </div>
  );
}
