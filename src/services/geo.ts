/**
 * گرفتن موقعیت جغرافیایی.
 * روی اندروید از @capacitor/geolocation و روی وب از navigator.geolocation استفاده می‌کند.
 */

export interface Coords {
  lat: number;
  lng: number;
}

export async function getCurrentCoords(): Promise<Coords> {
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const perm = await Geolocation.checkPermissions().catch(() => null);
      if (perm && perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        const req = await Geolocation.requestPermissions().catch(() => null);
        if (req && req.location !== 'granted' && req.coarseLocation !== 'granted') {
          throw new Error('اجازه‌ی دسترسی به موقعیت داده نشد.');
        }
      }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e: any) {
      throw new Error(e?.message || 'گرفتن موقعیت با GPS ناموفق بود.');
    }
  }

  return new Promise<Coords>((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('GPS در این دستگاه در دسترس نیست.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? 'اجازه‌ی دسترسی به موقعیت داده نشد.'
              : 'گرفتن موقعیت ناموفق بود. GPS را روشن کنید و دوباره تلاش کنید.'
          )
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/** اگر لوکیشنی انتخاب شده و مختصات دارد همان را برمی‌گرداند؛ وگرنه سراغ GPS می‌رود. */
export async function resolveCoords(selected?: { lat?: number; lng?: number } | null): Promise<Coords> {
  if (selected && typeof selected.lat === 'number' && typeof selected.lng === 'number') {
    return { lat: selected.lat, lng: selected.lng };
  }
  return getCurrentCoords();
}
