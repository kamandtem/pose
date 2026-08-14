export type CategoryType =
  | 'عروس و داماد'
  | 'عروس'
  | 'داماد'
  | 'زوج'
  | 'گروهی';

export type PoseType =
  | 'ایستاده'
  | 'نشسته'
  | 'راه رفتن'
  | 'بغل کردن'
  | 'رمانتیک'
  | 'رسمی'
  | 'خلاقانه'
  | 'حرکتی';

export type DifficultyLevel = 'آسان' | 'متوسط' | 'حرفه‌ای';

/** لوکیشن‌های اصلی برنامه */
export type LocationType = 'جنوب' | 'شمال' | 'کویر' | 'باغ عمارت';

/**
 * نوع تصویرسازی ژست (طرح گرافیکی داخلی و آفلاین).
 * هر کلید یک «صحنه» مشخص است که دقیقاً همان چیزی را نشان می‌دهد که در
 * عنوان و مراحل اجرای ژست نوشته شده؛ نه یک عکس تزئینی بی‌ربط.
 */
export type ArtKey =
  // آغوش و نزدیکی
  | 'backHug'
  | 'backHugLookBack'
  | 'frontHug'
  | 'headOnChest'
  | 'headOnShoulder'
  | 'faceToFace'
  | 'whisper'
  | 'laugh'
  | 'backToBack'
  | 'sideBySide'
  // بوسه‌ها
  | 'forehead'
  | 'kiss'
  | 'kissCheek'
  | 'kissForehead'
  | 'kissHand'
  | 'kissShoulder'
  | 'kissSilhouette'
  // دست‌ها و جزئیات
  | 'handInHand'
  | 'ringFocus'
  | 'handsDetail'
  | 'bouquetLow'
  | 'flatlay'
  | 'dressHem'
  | 'shoeDetail'
  // حرکت
  | 'walk'
  | 'walkAway'
  | 'walkSideBySide'
  | 'runTogether'
  | 'jump'
  | 'splash'
  | 'confetti'
  | 'dance'
  | 'spinTogether'
  | 'dip'
  | 'lift'
  | 'carry'
  | 'twirl'
  | 'veilFly'
  | 'dressFly'
  // نشستن و تکیه دادن
  | 'sitting'
  | 'sitBench'
  | 'sitStairs'
  | 'sitGround'
  | 'sitDune'
  | 'sitRock'
  | 'leanWall'
  | 'leanRail'
  // عروس تنها
  | 'soloBride'
  | 'brideProfile'
  | 'brideBouquet'
  | 'veil'
  | 'brideVeilOut'
  | 'brideVeilIn'
  | 'brideTrain'
  | 'brideWalkAway'
  | 'brideSit'
  | 'brideLookUp'
  | 'brideTwirl'
  // داماد تنها
  | 'soloGroom'
  | 'groomProfile'
  | 'groomButton'
  | 'groomTie'
  | 'groomWatch'
  | 'groomSit'
  | 'groomLean'
  | 'groomWalk'
  // گروهی
  | 'group'
  | 'groupLine'
  | 'groupCircle'
  | 'groupToast'
  | 'family'
  | 'kids'
  // کادرهای باز و خلاقانه
  | 'silhouette'
  | 'twoDots'
  | 'reflection'
  | 'arch'
  | 'window'
  | 'lowAngle'
  | 'starSky'
  | 'nightLights'
  | 'fogWalk';

export interface CameraTips {
  framing: string;
  cameraAngle: string;
  suggestedDistance: string;
  lensSuggestion: string;
  lightTip: string;
}

/** مرحله راحتی سوژه؛ برای مرتب‌سازی ژست‌ها از ساده به سخت */
export type ComfortStage = 'یخ‌شکن' | 'گرم شدن' | 'نزدیک شدن' | 'صمیمی' | 'حرفه‌ای';

export const COMFORT_STAGES: ComfortStage[] = [
  'یخ‌شکن',
  'گرم شدن',
  'نزدیک شدن',
  'صمیمی',
  'حرفه‌ای',
];

export interface Pose {
  id: string;
  title: string;
  category: CategoryType;
  poseType: PoseType;
  difficulty: DifficultyLevel;
  peopleCount: number;
  locations: LocationType[];
  art: ArtKey;
  tags: string[];

  /** تصویر مرجعی که خود کاربر اضافه کرده (dataURL). اختیاری. */
  image?: string;

  steps: string[];
  bodyPosition: string;
  handPosition: string;
  footPosition: string;
  headDirection: string;
  eyeDirection: string;

  photographerScript: string[];
  commonMistakes: string[];
  variations: string[];
  cameraTips: CameraTips;

  /** امتیاز سختی/صمیمیت برای چیدمان «از ساده به سخت» (کمتر = ساده‌تر) */
  ease: number;
  /** برچسب مرحله اجرا سر صحنه */
  stage: ComfortStage;

  /** کد ثابت برای تطبیق عکس بیرونی با ژست هنگام انتقال به نسخه اصلی */
  transferCode?: string;
  isCustom?: boolean;
  createdAt?: number;
  note?: string;
  suggestedMinutes?: number;
}

export interface MyLocation {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  note?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface FilterState {
  search: string;
  category: CategoryType | 'همه';
  poseType: PoseType | 'همه';
  difficulty: DifficultyLevel | 'همه';
  location: LocationType | 'همه';
  peopleCount: number | null;
  customOnly: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  category: 'همه',
  poseType: 'همه',
  difficulty: 'همه',
  location: 'همه',
  peopleCount: null,
  customOnly: false,
};


/* ==================== بخش دفتر کار ==================== */

export interface StudioProfile {
  id: string;
  name: string;           /** نام استودیو/اتلیه */
  phone: string;          /** شماره تماس */
  craftCode: string;      /** شماره صنفی */
  address?: string;
  logo?: string;          /** dataURL of logo */
  bankName?: string;
  accountNumber?: string;
  createdAt: number;
  updatedAt: number;
}

export type CameraType = 'هلی‌شات' | 'FPV' | 'کرین' | 'دستی' | 'عکاسی' | 'لرزشگیر';
export type ServiceType = 'عکاسی مراسم' | 'میکس' | 'آلبوم' | 'عکس سر مجلسی' | 'پخش کلیپ' | 'TV اسلاید';
export type LocationTypeFormatted = 'محلی' | 'شمال' | 'جنوب' | 'باغ عمارت';
export type ThemeType = 'شاد و اکتیو' | 'ارامش' | 'عاشقانه احساسی';

export interface Ceremony {
  id: string;
  date: string;           /** ISO date */
  location?: string;
  cameras: Partial<Record<CameraType, number>>; /** camera -> count */
  services: Partial<Record<ServiceType, { checked: boolean; notes?: string }>>;
  createdAt: number;
  updatedAt: number;
}

export interface Formality {
  id: string;
  location?: string;      /** نام لوکیشن ضبط */
  recordDate: string;     /** ISO date */
  cameras: Partial<Record<Exclude<CameraType, 'کرین'>, number>>;
  clipType?: LocationTypeFormatted;
  theme?: ThemeType;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectInvoice {
  id: string;
  items: Array<{ name: string; count: number; price: number }>;  /** price per unit in تومان */
  deposit?: number;
  customerName?: string;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export interface OfficeProject {
  id: string;
  name: string;           /** نام پروژه */
  ceremony?: Ceremony;    /** اختیاری */
  formality?: Formality;  /** اختیاری */
  ceremonyInvoice?: ProjectInvoice;
  formalityInvoice?: ProjectInvoice;
  createdAt: number;
  updatedAt: number;
}

/* درآمد پروژه = مجموع فاکتور‌های موجود */
export interface ProjectRevenue {
  ceremonyTotal: number;
  formalityTotal: number;
  totalRevenue: number;
}
export interface InvoiceRecord {
  id: string;
  title: string;
  customerName: string;
  date: string;           /** ISO date */
  items: Array<{ name: string; count: number; price: number }>;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export type ViewTab =
  | 'home'
  | 'library'
  | 'locations'
  | 'mylocations'
  | 'weather'
  | 'favorites'
  | 'myposes'
  | 'office'
  | 'office-project-detail'
  | 'principles'
  | 'settings'
  | 'checklist'
  | 'detail';
