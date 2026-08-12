import React from 'react';
import { ArtKey, LocationType, Pose } from '../types/pose';
import { getLocation } from '../data/locations';

/**
 * موتور تصویرسازی ژست‌ها (کاملاً آفلاین).
 *
 * قاعده مهم: تصویر هر ژست باید همان چیزی را نشان بدهد که در «عنوان» و
 * «مراحل اجرا» نوشته شده. برای همین به جای عکس‌های تزئینی، برای هر ژست یک
 * صحنه اختصاصی رسم می‌شود: فرم بدن عروس و داماد، جهت سر و نگاه، محل دست‌ها،
 * حالت لباس و تور، و پس‌زمینه لوکیشن.
 * اگر کاربر عکس مرجع خودش را اضافه کند، همان عکس جای این طرح را می‌گیرد.
 */

const G = 266;
const INK = 'rgba(12,10,18,.92)';
const INK_SOFT = 'rgba(12,10,18,.62)';
const HI = 'rgba(255,248,236,.55)';
const VEIL = 'rgba(255,252,246,.5)';
const PROP = 'rgba(12,10,18,.3)';
const LIGHT = 'rgba(255,250,240,.85)';

type Pt = [number, number];
type Dir = 'front' | 'left' | 'right' | 'up' | 'down';

function arm(a: Pt, b: Pt, bow = 8): string {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return `M${a[0]} ${a[1]}Q${(mx + nx * bow).toFixed(1)} ${(my + ny * bow).toFixed(1)} ${b[0]} ${b[1]}`;
}

const Limb: React.FC<{ d: string; w?: number }> = ({ d, w = 7 }) => (
  <>
    <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" />
    <path d={d} fill="none" stroke={HI} strokeWidth={1.2} strokeLinecap="round" opacity={0.45} />
  </>
);

const Join: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 7 }) => (
  <circle cx={x} cy={y} r={r} fill="rgba(255,250,240,.5)" />
);

const DIRS: Record<'left' | 'right' | 'up' | 'down', Pt> = {
  right: [1, 0],
  left: [-1, 0],
  up: [0.7, -0.7],
  down: [0.7, 0.7],
};

const Face: React.FC<{ cy: number; r: number; dir: Dir }> = ({ cy, r, dir }) => {
  if (dir === 'front') {
    return <circle cx={0} cy={cy - 2} r={r * 0.5} fill={HI} opacity={0.2} />;
  }
  const [dx, dy] = DIRS[dir];
  return (
    <>
      <circle cx={dx * r * 0.34} cy={cy + dy * r * 0.34 - 1} r={r * 0.44} fill={HI} opacity={0.22} />
      <path
        d={`M${(dx * r * 0.94).toFixed(1)} ${(cy + dy * r * 0.94).toFixed(1)}l${(dx * 3.4).toFixed(1)} ${(dy * 3.4).toFixed(1)}`}
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </>
  );
};

/* ----------------------------- داماد ----------------------------- */

type GLower = 'stand' | 'walk' | 'run' | 'sit' | 'kneel';

const GLEG: Record<GLower, string> = {
  stand: 'M-17 0L-14 -74H14L17 0H6L1.5 -44H-1.5L-6 0Z',
  walk: 'M-15 -74H15L26 -4L15 -2L4 -50L-8 -4L-19 -6Z',
  run: 'M-15 -74H15L34 -22L24 -14L2 -50L-14 -18L-24 -24Z',
  sit: 'M-18 -62L34 -56L36 -44L-18 -48ZM23 -56H36L34 -2H22Z',
  kneel: 'M-16 -60H14L34 -22L34 -8L18 -10L-2 -34L-18 -30Z',
};

const GTORSO = {
  stand: 'M-23 -122Q-27 -98 -24 -72H24Q27 -98 23 -122Q12 -131 0 -131Q-12 -131 -23 -122Z',
  sit: 'M-22 -110Q-26 -88 -23 -58H23Q26 -88 22 -110Q11 -119 0 -119Q-11 -119 -22 -110Z',
};

interface FigProps {
  x: number;
  base?: number;
  s?: number;
  flip?: boolean;
  rot?: number;
  dir?: Dir;
  tilt?: number;
  arms?: string[];
  ink?: string;
}

const Groom: React.FC<FigProps & { lower?: GLower }> = ({
  x,
  base = G,
  s = 1,
  flip,
  rot = 0,
  dir = 'front',
  tilt = 0,
  arms = [],
  lower = 'stand',
  ink = INK,
}) => {
  const seated = lower === 'sit' || lower === 'kneel';
  const hy = seated ? -134 : -148;
  return (
    <g transform={`translate(${x} ${base}) scale(${flip ? -s : s} ${s}) rotate(${rot} 0 -78)`}>
      <g fill={ink}>
        <path d={GLEG[lower]} />
        {lower === 'stand' && (
          <>
            <ellipse cx={-11.5} cy={-2} rx={8} ry={3.5} />
            <ellipse cx={11.5} cy={-2} rx={8} ry={3.5} />
          </>
        )}
        {lower === 'walk' && (
          <>
            <ellipse cx={22} cy={-3} rx={9} ry={3.5} />
            <ellipse cx={-15} cy={-5} rx={9} ry={3.5} />
          </>
        )}
        {lower === 'run' && (
          <>
            <ellipse cx={30} cy={-18} rx={9} ry={3.5} />
            <ellipse cx={-20} cy={-22} rx={9} ry={3.5} />
          </>
        )}
        {lower === 'sit' && <ellipse cx={31} cy={-2} rx={9} ry={3.5} />}
        <path d={seated ? GTORSO.sit : GTORSO.stand} />
        <rect x={-4.5} y={hy + 11} width={9} height={10} />
      </g>
      <path
        d={`M0 ${hy + 14}V${hy + 54}`}
        stroke={HI}
        strokeWidth={1.4}
        fill="none"
        opacity={0.45}
      />
      <g transform={`rotate(${tilt} 0 ${hy + 12})`}>
        <circle cx={0} cy={hy} r={12.5} fill={ink} />
        <Face cy={hy} r={12.5} dir={dir} />
      </g>
      {arms.map((d, i) => (
        <Limb key={i} d={d} />
      ))}
    </g>
  );
};

/* ----------------------------- عروس ----------------------------- */

type BLower = 'stand' | 'walk' | 'twirl' | 'sit' | 'train' | 'lie';
type VeilKind = 'none' | 'back' | 'long' | 'front' | 'fly';
type Bouquet = 'none' | 'low' | 'chest';

const BLEG: Record<BLower, string> = {
  stand: 'M-12 -84L-27 -4Q0 7 27 -4L12 -84Z',
  walk: 'M-14 -84L-34 -2Q-4 8 26 -6L12 -84Z',
  twirl: 'M-12 -86L-54 -12Q0 18 54 -12L12 -86Z',
  sit: 'M-12 -84L-42 -4Q0 8 44 -6L12 -84Z',
  train: 'M-12 -84L-28 -4Q14 8 68 4Q54 -14 12 -84Z',
  lie: 'M-9 -84L-15 -10Q0 -2 15 -10L9 -84ZM-15 -10Q-2 6 14 -8Q6 8 -8 4Z',
};

const Bride: React.FC<FigProps & { lower?: BLower; veil?: VeilKind; bouquet?: Bouquet }> = ({
  x,
  base = G,
  s = 1,
  flip,
  rot = 0,
  dir = 'front',
  tilt = 0,
  arms = [],
  lower = 'stand',
  veil = 'none',
  bouquet = 'none',
  ink = INK,
}) => {
  const hy = -142;
  return (
    <g transform={`translate(${x} ${base}) scale(${flip ? -s : s} ${s}) rotate(${rot} 0 -78)`}>
      {veil === 'back' && <path d={`M4 ${hy}Q40 -116 30 -22Q14 -28 8 -84Z`} fill={VEIL} />}
      {veil === 'long' && <path d={`M4 ${hy}Q52 -110 46 6Q16 -6 8 -84Z`} fill={VEIL} />}
      {veil === 'fly' && <path d={`M2 ${hy}Q78 -152 124 -76Q62 -98 8 -70Z`} fill={VEIL} />}
      <g fill={ink}>
        <path d={BLEG[lower]} />
        <path d="M-12 -84L-10.5 -118Q0 -124 10.5 -118L12 -84Z" />
        <rect x={-4} y={hy + 9} width={8} height={9} />
      </g>
      <g transform={`rotate(${tilt} 0 ${hy + 10})`}>
        <circle cx={0} cy={hy} r={11.5} fill={ink} />
        <circle cx={-9} cy={hy - 6} r={5.5} fill={ink} />
        <Face cy={hy} r={11.5} dir={dir} />
      </g>
      {veil === 'front' && (
        <path d={`M-2 ${hy - 12}Q-42 -122 -30 -14Q-4 -26 -4 -78Z`} fill="rgba(255,252,246,.38)" />
      )}
      {bouquet === 'low' && (
        <g fill={LIGHT}>
          <circle cx={16} cy={-68} r={9} />
          <circle cx={26} cy={-61} r={6} />
          <circle cx={8} cy={-58} r={6} />
        </g>
      )}
      {bouquet === 'chest' && (
        <g fill={LIGHT}>
          <circle cx={12} cy={-98} r={9} />
          <circle cx={22} cy={-93} r={6} />
          <circle cx={4} cy={-90} r={6} />
        </g>
      )}
      {arms.map((d, i) => (
        <Limb key={i} d={d} w={6} />
      ))}
    </g>
  );
};

/* --------------------------- لوازم صحنه --------------------------- */

const Bench: React.FC<{ x?: number; w?: number; y?: number }> = ({ x = 200, w = 156, y = G - 46 }) => (
  <g fill={PROP}>
    <rect x={x - w / 2} y={y} width={w} height={9} rx={3} />
    <rect x={x - w / 2 + 12} y={y + 9} width={8} height={G - y - 9} />
    <rect x={x + w / 2 - 20} y={y + 9} width={8} height={G - y - 9} />
  </g>
);

const Stairs: React.FC<{ x?: number }> = ({ x = 200 }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const w = 330 - i * 58;
      return (
        <rect
          key={i}
          x={x - w / 2}
          y={G - 15 * (3 - i)}
          width={w}
          height={15}
          rx={2}
          fill={`rgba(12,10,18,${0.14 + 0.07 * i})`}
        />
      );
    })}
  </g>
);

const Wall: React.FC<{ x?: number }> = ({ x = 116 }) => (
  <rect x={x - 74} y={54} width={74} height={G - 54} fill="rgba(12,10,18,.28)" />
);

const Rail: React.FC = () => (
  <g stroke={PROP} strokeWidth={7} fill="none" strokeLinecap="round">
    <path d={`M20 ${G - 62}H380`} />
    <path d={`M60 ${G - 62}V${G}`} />
    <path d={`M340 ${G - 62}V${G}`} />
  </g>
);

const Rock: React.FC = () => (
  <path d={`M96 ${G}q10-48 74-52q68-4 84 52Z`} fill="rgba(12,10,18,.32)" />
);

const Ground: React.FC = () => (
  <path d={`M0 ${G}H400`} stroke="rgba(12,10,18,.3)" strokeWidth={3} fill="none" />
);

/* --------------------------- پس‌زمینه لوکیشن --------------------------- */

const Backdrop: React.FC<{ loc: LocationType; id: string; night?: boolean }> = ({ loc, id, night }) => {
  const c = getLocation(loc).colors;
  return (
    <g>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={night ? '#141024' : c[0]} />
          <stop offset="0.55" stopColor={night ? '#241E3A' : c[1]} />
          <stop offset="1" stopColor={night ? '#3A3352' : c[2]} />
        </linearGradient>
        <radialGradient id={`sun-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF3D6" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFF3D6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={400} height={300} fill={`url(#bg-${id})`} />
      <circle cx={312} cy={88} r={64} fill={`url(#sun-${id})`} />

      {loc === 'جنوب' && (
        <g fill="none" stroke="rgba(255,255,255,.32)" strokeWidth={3} strokeLinecap="round">
          <circle cx={312} cy={88} r={26} fill="rgba(255,246,224,.85)" stroke="none" />
          <path d={`M0 ${G - 46}H400`} stroke="rgba(255,255,255,.26)" strokeWidth={2} />
          <path d={`M18 ${G - 26}q22-9 44 0t44 0 44 0`} />
          <path d={`M186 ${G - 14}q22-9 44 0t44 0 44 0`} />
        </g>
      )}

      {loc === 'شمال' && (
        <g>
          <g stroke="rgba(10,30,20,.3)" strokeWidth={13} strokeLinecap="round">
            <path d={`M36 ${G}V88`} />
            <path d={`M92 ${G}V128`} />
            <path d={`M356 ${G}V104`} />
            <path d={`M300 ${G}V142`} />
          </g>
          <g stroke="rgba(255,255,255,.34)" strokeWidth={7} strokeLinecap="round">
            <path d="M10 194H148" />
            <path d="M232 212H392" />
            <path d="M58 230H208" />
          </g>
        </g>
      )}

      {loc === 'کویر' && (
        <g>
          <circle cx={312} cy={92} r={30} fill="rgba(255,240,208,.9)" />
          <path d={`M0 ${G - 34}q90-46 180-16t220-6v56H0z`} fill="rgba(90,52,22,.26)" />
          <path d={`M0 ${G - 12}q120-30 200-8t200-2v58H0z`} fill="rgba(90,52,22,.2)" />
        </g>
      )}

      {loc === 'باغ عمارت' && (
        <g>
          <path
            d={`M128 ${G}V148a72 72 0 0 1 144 0v${G - 148 - 0}`}
            fill="rgba(255,255,255,.1)"
            stroke="rgba(255,255,255,.3)"
            strokeWidth={4}
          />
          <g stroke="rgba(255,255,255,.26)" strokeWidth={11} strokeLinecap="round">
            <path d={`M40 ${G}V124`} />
            <path d={`M360 ${G}V124`} />
          </g>
        </g>
      )}
    </g>
  );
};

/* ------------------------------ صحنه‌ها ------------------------------ */

const Scene: React.FC<{ art: ArtKey }> = ({ art }) => {
  switch (art) {
    /* ---------- آغوش و نزدیکی ---------- */
    case 'backHug':
    case 'backHugLookBack':
      return (
        <g>
          <Groom x={214} dir="left" tilt={6} />
          <Bride
            x={194}
            dir={art === 'backHugLookBack' ? 'right' : 'front'}
            veil="back"
            arms={[arm([-11, -108], [-26, -96], -8)]}
          />
          <Limb d={arm([236, G - 114], [172, G - 92], 10)} />
          <Limb d={arm([232, G - 104], [176, G - 84], 8)} />
        </g>
      );

    case 'frontHug':
      return (
        <g>
          <Groom x={176} dir="right" />
          <Bride x={222} flip dir="left" tilt={-10} veil="back" arms={[arm([-11, -108], [-30, -100], -8)]} />
          <Limb d={arm([197, G - 116], [238, G - 96], -10)} />
          <Limb d={arm([193, G - 104], [234, G - 86], -8)} />
        </g>
      );

    case 'headOnChest':
      return (
        <g>
          <Groom x={184} dir="front" />
          <Bride x={218} flip dir="left" tilt={-18} veil="back" arms={[arm([-11, -106], [-26, -94], -8)]} />
          <Limb d={arm([205, G - 118], [228, G - 96], -10)} />
        </g>
      );

    case 'headOnShoulder':
      return (
        <g>
          <Groom x={180} dir="front" arms={[arm([-21, -118], [-26, -80], 8)]} />
          <Bride x={216} dir="front" tilt={-16} veil="back" />
          <Limb d={arm([201, G - 120], [230, G - 104], -8)} />
        </g>
      );

    case 'faceToFace':
    case 'whisper':
    case 'laugh':
      return (
        <g>
          <Groom x={162} dir="right" tilt={art === 'whisper' ? 8 : 0} arms={[arm([-21, -118], [-25, -80], 8)]} />
          <Bride
            x={238}
            flip
            dir="left"
            tilt={art === 'laugh' ? -12 : 0}
            veil="back"
            arms={[arm([-11, -112], [-15, -80], 8)]}
          />
          <Limb d={arm([183, G - 114], [207, G - 104], -6)} />
          <Limb d={arm([249, G - 110], [212, G - 100], 8)} w={6} />
          <Join x={209} y={G - 102} r={6} />
        </g>
      );

    case 'backToBack':
      return (
        <g>
          <Groom x={172} flip dir="left" arms={[arm([-21, -118], [-8, -90], 10)]} />
          <Bride x={228} dir="right" veil="back" arms={[arm([-11, -112], [0, -88], -10)]} />
        </g>
      );

    case 'sideBySide':
      return (
        <g>
          <Groom x={172} dir="front" arms={[arm([-21, -118], [-26, -80], 8)]} />
          <Bride x={228} dir="front" veil="back" bouquet="low" />
          <Limb d={arm([193, G - 116], [214, G - 94], -8)} />
          <Join x={211} y={G - 92} r={6} />
        </g>
      );

    /* ---------- بوسه‌ها ---------- */
    case 'kiss':
      return (
        <g>
          <Groom x={168} dir="right" tilt={8} />
          <Bride x={232} flip dir="left" tilt={-8} veil="back" />
          <Limb d={arm([189, G - 114], [218, G - 98], -9)} />
          <Limb d={arm([244, G - 110], [186, G - 94], 10)} w={6} />
          <Join x={200} y={G - 146} r={5} />
        </g>
      );

    case 'kissCheek':
      return (
        <g>
          <Groom x={170} dir="right" tilt={10} />
          <Bride x={230} flip dir="front" veil="back" arms={[arm([-11, -110], [-24, -96], -8)]} />
          <Limb d={arm([191, G - 114], [216, G - 100], -9)} />
          <Join x={216} y={G - 144} r={5} />
        </g>
      );

    case 'forehead':
    case 'kissForehead':
      return (
        <g>
          <Groom x={174} dir="right" tilt={12} />
          <Bride x={228} flip dir="up" tilt={-8} veil="back" />
          <Limb d={arm([194, G - 114], [216, G - 98], -9)} />
          <Limb d={arm([240, G - 108], [190, G - 96], 10)} w={6} />
          <Join x={202} y={G - 150} r={5} />
        </g>
      );

    case 'kissShoulder':
      return (
        <g>
          <Groom x={214} dir="left" tilt={22} />
          <Bride x={190} dir="front" veil="back" />
          <Limb d={arm([234, G - 112], [176, G - 92], 10)} />
          <Join x={198} y={G - 122} r={5} />
        </g>
      );

    case 'kissHand':
      return (
        <g>
          <Groom x={166} dir="right" tilt={14} />
          <Bride x={238} flip dir="left" veil="back" />
          <Limb d={arm([186, G - 118], [206, G - 132], -8)} />
          <Limb d={arm([250, G - 110], [212, G - 130], 10)} w={6} />
          <Join x={208} y={G - 132} r={6} />
        </g>
      );

    case 'kissSilhouette':
      return (
        <g>
          <Groom x={180} s={0.78} dir="right" tilt={8} ink="rgba(8,6,12,.96)" />
          <Bride x={228} s={0.78} flip dir="left" tilt={-8} veil="long" ink="rgba(8,6,12,.96)" />
          <Limb d={arm([196, G - 92], [216, G - 80], -8)} w={6} />
        </g>
      );

    /* ---------- دست‌ها و جزئیات ---------- */
    case 'handInHand':
      return (
        <g>
          <Groom x={152} dir="front" arms={[arm([-21, -118], [-26, -78], 8)]} />
          <Bride x={248} dir="front" veil="back" bouquet="low" />
          <Limb d={arm([173, G - 116], [200, G - 92], -8)} />
          <Limb d={arm([237, G - 112], [200, G - 92], 8)} w={6} />
          <Join x={200} y={G - 92} />
        </g>
      );

    case 'ringFocus':
      return (
        <g>
          <Limb d="M34 216Q140 176 198 188" w={12} />
          <Limb d="M366 226Q262 182 212 192" w={12} />
          <circle cx={204} cy={190} r={15} fill="none" stroke={LIGHT} strokeWidth={5} />
          <circle cx={204} cy={174} r={4.5} fill={LIGHT} />
        </g>
      );

    case 'handsDetail':
      return (
        <g>
          <Limb d="M30 226Q120 160 200 190" w={13} />
          <Limb d="M370 232Q280 164 202 194" w={13} />
          <Join x={200} y={192} r={11} />
        </g>
      );

    case 'bouquetLow':
      return (
        <g>
          <Bride x={200} s={1.35} base={G + 78} dir="down" veil="back" bouquet="low" arms={[arm([-11, -110], [8, -76], -10)]} />
        </g>
      );

    case 'flatlay':
      return (
        <g fill="rgba(12,10,18,.55)">
          <circle cx={112} cy={152} r={23} />
          <circle cx={112} cy={152} r={11} fill="rgba(255,250,240,.75)" />
          <rect x={172} y={102} width={72} height={50} rx={3} />
          <circle cx={302} cy={160} r={14} />
          <circle cx={322} cy={144} r={11} />
          <circle cx={284} cy={140} r={10} />
          <circle cx={312} cy={178} r={9} />
          <path d="M146 234q20-26 44-10l-6 18z" />
          <rect x={236} y={196} width={22} height={42} rx={5} />
        </g>
      );

    case 'dressHem':
      return (
        <g>
          <path d={`M60 ${G}Q200 ${G - 96} 348 ${G}Z`} fill={INK} />
          <path d={`M120 ${G - 6}q40-30 90-26`} stroke={HI} strokeWidth={2} fill="none" opacity={0.5} />
          <ellipse cx={214} cy={G - 8} rx={22} ry={9} fill="rgba(255,250,240,.8)" />
        </g>
      );

    case 'shoeDetail':
      return (
        <g>
          <Bench x={210} w={150} />
          <Bride x={206} lower="sit" dir="down" veil="back" arms={[arm([-11, -106], [18, -40], -12)]} />
          <ellipse cx={244} cy={G - 6} rx={20} ry={8} fill="rgba(255,250,240,.8)" />
        </g>
      );

    /* ---------- حرکت ---------- */
    case 'walk':
    case 'walkSideBySide':
      return (
        <g>
          <Groom x={160} lower="walk" dir="front" arms={[arm([-21, -118], [-30, -84], 10)]} />
          <Bride x={240} lower="walk" flip dir="front" veil="back" />
          {art === 'walk' && (
            <>
              <Limb d={arm([181, G - 116], [206, G - 94], -8)} />
              <Join x={204} y={G - 92} r={6} />
            </>
          )}
        </g>
      );

    case 'walkAway':
      return (
        <g>
          <Groom x={176} lower="walk" flip dir="left" />
          <Bride x={220} lower="train" dir="right" veil="long" />
          <Limb d={arm([158, G - 116], [206, G - 100], 8)} />
        </g>
      );

    case 'runTogether':
      return (
        <g>
          <Groom x={158} lower="run" dir="right" arms={[arm([-21, -118], [-42, -100], 14)]} />
          <Bride x={242} lower="walk" flip dir="left" veil="back" />
          <Limb d={arm([179, G - 116], [224, G - 100], -8)} />
        </g>
      );

    case 'jump':
      return (
        <g>
          <Groom x={166} base={G - 28} lower="run" dir="right" arms={[arm([-21, -118], [-40, -140], 12)]} />
          <Bride x={240} base={G - 24} lower="twirl" flip dir="left" veil="back" arms={[arm([-11, -112], [-32, -132], 10)]} />
          <path d={`M118 ${G}H302`} stroke="rgba(12,10,18,.18)" strokeWidth={6} strokeLinecap="round" />
        </g>
      );

    case 'splash':
      return (
        <g>
          <Groom x={168} lower="walk" dir="right" arms={[arm([-21, -118], [-30, -86], 10)]} />
          <Bride x={236} lower="walk" flip dir="left" veil="back" />
          <Limb d={arm([189, G - 116], [220, G - 98], -8)} />
          <g stroke="rgba(255,255,255,.6)" strokeWidth={3} fill="none" strokeLinecap="round">
            <path d={`M136 ${G - 4}q14-18 26-2`} />
            <path d={`M252 ${G - 6}q16-20 30-2`} />
            <path d={`M188 ${G + 2}q18-16 34 0`} />
          </g>
        </g>
      );

    case 'confetti':
      return (
        <g>
          <Groom x={176} dir="front" arms={[arm([-21, -118], [-32, -140], 10)]} />
          <Bride x={226} dir="front" veil="back" arms={[arm([-11, -112], [-26, -134], 10)]} />
          <g fill="rgba(255,250,240,.75)">
            {[
              [96, 72],
              [148, 44],
              [206, 60],
              [262, 38],
              [318, 78],
              [124, 120],
              [286, 128],
              [352, 106],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 5 : 3.5} />
            ))}
          </g>
        </g>
      );

    case 'dance':
    case 'spinTogether':
      return (
        <g>
          <Groom x={168} dir="right" arms={[arm([-21, -118], [-10, -88], 12)]} />
          <Bride x={238} flip lower="twirl" dir="left" veil="back" />
          <Limb d={arm([189, G - 118], [214, G - 108], -8)} />
          <Limb d={arm([250, G - 112], [198, G - 126], 10)} w={6} />
          <g stroke="rgba(255,255,255,.35)" strokeWidth={3} fill="none" strokeLinecap="round">
            <path d={`M296 ${G - 44}q18 18 6 36`} />
            <path d={`M112 ${G - 40}q-18 18-6 34`} />
          </g>
        </g>
      );

    case 'dip':
      return (
        <g>
          <Groom x={176} dir="right" />
          <Bride x={236} rot={52} dir="up" veil="long" arms={[arm([-11, -112], [-34, -104], -12)]} />
          <Limb d={arm([197, G - 118], [230, G - 88], -14)} />
        </g>
      );

    case 'lift':
    case 'carry':
      return (
        <g>
          <Groom x={182} dir="right" />
          <Bride
            x={246}
            base={G - 44}
            lower="lie"
            rot={-80}
            dir="right"
            veil="long"
            arms={[arm([-10, -110], [-30, -124], -10)]}
          />
          <Limb d={arm([203, G - 122], [216, G - 124], -8)} />
          <Limb d={arm([200, G - 108], [212, G - 84], -6)} />
        </g>
      );

    case 'twirl':
    case 'brideTwirl':
    case 'dressFly':
      return (
        <Bride
          x={200}
          lower="twirl"
          dir="up"
          veil="fly"
          arms={[arm([-11, -112], [-40, -96], 12), arm([11, -112], [40, -96], -12)]}
        />
      );

    case 'veilFly':
      return (
        <g>
          <Bride x={186} dir="right" veil="fly" arms={[arm([-11, -112], [-32, -128], -10)]} />
          <g stroke="rgba(255,255,255,.4)" strokeWidth={2.5} fill="none" strokeLinecap="round">
            <path d="M250 118q46 12 74 46" />
            <path d="M244 150q42 8 68 34" />
          </g>
        </g>
      );

    /* ---------- نشستن و تکیه ---------- */
    case 'sitting':
    case 'sitBench':
      return (
        <g>
          <Bench />
          <Groom x={166} lower="sit" dir="right" arms={[arm([-20, -104], [6, -64], 10)]} />
          <Bride x={234} lower="sit" flip dir="left" veil="back" arms={[arm([-11, -106], [4, -70], 10)]} />
        </g>
      );

    case 'sitStairs':
      return (
        <g>
          <Stairs />
          <Groom x={168} base={G - 30} lower="sit" dir="right" arms={[arm([-20, -104], [8, -62], 10)]} />
          <Bride x={232} base={G - 30} lower="train" flip dir="left" veil="long" arms={[arm([-11, -110], [-22, -84], 8)]} />
        </g>
      );

    case 'sitGround':
    case 'sitDune':
      return (
        <g>
          <path
            d={`M30 ${G}q90-16 164-4t176-2`}
            fill="none"
            stroke="rgba(12,10,18,.22)"
            strokeWidth={5}
          />
          <Groom x={174} lower="kneel" dir="right" arms={[arm([-20, -104], [10, -70], 10)]} />
          <Bride x={234} base={G - 4} lower="sit" flip dir="left" veil="long" arms={[arm([-11, -106], [6, -74], 10)]} />
        </g>
      );

    case 'sitRock':
      return (
        <g>
          <Rock />
          <Groom x={162} base={G - 44} lower="sit" dir="right" arms={[arm([-20, -104], [6, -64], 10)]} />
          <Bride x={224} base={G - 44} lower="sit" flip dir="left" veil="long" arms={[arm([-11, -106], [4, -70], 10)]} />
        </g>
      );

    case 'leanWall':
      return (
        <g>
          <Wall />
          <Bride x={172} dir="right" veil="back" arms={[arm([-11, -112], [-38, -104], -8)]} />
          <Groom x={238} flip dir="left" arms={[arm([-21, -118], [-30, -80], 8)]} />
          <Limb d={arm([218, G - 116], [188, G - 102], 10)} />
        </g>
      );

    case 'leanRail':
      return (
        <g>
          <Rail />
          <Groom x={172} dir="right" arms={[arm([-21, -116], [-4, -66], 12)]} />
          <Bride x={230} flip dir="left" veil="back" arms={[arm([-11, -110], [4, -70], 10)]} />
          <Limb d={arm([193, G - 112], [214, G - 100], -8)} />
        </g>
      );

    /* ---------- عروس تنها ---------- */
    case 'soloBride':
    case 'brideBouquet':
      return (
        <Bride
          x={200}
          dir="front"
          veil="back"
          bouquet="low"
          arms={[arm([-11, -112], [-4, -72], 10), arm([11, -112], [8, -74], -10)]}
        />
      );

    case 'brideProfile':
      return <Bride x={200} dir="right" veil="back" arms={[arm([-11, -112], [-6, -132], -10)]} />;

    case 'brideLookUp':
      return <Bride x={200} dir="up" veil="long" arms={[arm([-11, -112], [-16, -134], -10)]} />;

    case 'veil':
    case 'brideVeilOut':
      return (
        <g>
          <Bride x={198} dir="front" veil="long" arms={[arm([-11, -112], [-26, -130], -10)]} />
          <path
            d={`M198 ${G - 150}q52 24 44 96`}
            fill="none"
            stroke="rgba(255,252,246,.4)"
            strokeWidth={2.5}
          />
        </g>
      );

    case 'brideVeilIn':
      return <Bride x={202} dir="front" veil="front" arms={[arm([-11, -112], [-24, -128], -12)]} />;

    case 'brideTrain':
      return (
        <g>
          <Stairs />
          <Bride x={196} base={G - 30} lower="train" dir="front" veil="long" arms={[arm([-11, -112], [-20, -86], 8)]} />
        </g>
      );

    case 'brideWalkAway':
      return <Bride x={200} lower="train" flip dir="left" veil="long" arms={[arm([-11, -112], [-18, -84], 8)]} />;

    case 'brideSit':
      return (
        <g>
          <Bench />
          <Bride x={200} lower="sit" dir="front" veil="back" arms={[arm([-11, -108], [2, -70], 10)]} />
        </g>
      );

    /* ---------- داماد تنها ---------- */
    case 'soloGroom':
      return (
        <Groom
          x={200}
          dir="front"
          arms={[arm([-21, -118], [-10, -88], 12), arm([21, -118], [8, -92], -12)]}
        />
      );

    case 'groomButton':
      return <Groom x={200} dir="front" arms={[arm([-21, -118], [-2, -104], 12), arm([21, -118], [4, -100], -12)]} />;

    case 'groomTie':
      return <Groom x={200} dir="front" arms={[arm([-21, -118], [-4, -126], 12), arm([21, -118], [4, -124], -12)]} />;

    case 'groomWatch':
      return <Groom x={200} dir="down" arms={[arm([-21, -118], [4, -96], 14), arm([21, -118], [10, -98], -8)]} />;

    case 'groomProfile':
      return <Groom x={200} dir="right" arms={[arm([-21, -118], [-8, -86], 12)]} />;

    case 'groomSit':
      return (
        <g>
          <Bench />
          <Groom x={196} lower="sit" dir="front" arms={[arm([-20, -104], [8, -62], 10), arm([20, -104], [16, -66], -10)]} />
        </g>
      );

    case 'groomLean':
      return (
        <g>
          <Wall />
          <Groom x={186} dir="right" arms={[arm([-21, -118], [-40, -110], -8)]} />
        </g>
      );

    case 'groomWalk':
      return <Groom x={200} lower="walk" dir="front" arms={[arm([-21, -118], [-32, -86], 10)]} />;

    /* ---------- گروهی ---------- */
    case 'group':
    case 'groupLine':
      return (
        <g>
          {[78, 122].map((x) => (
            <Groom key={x} x={x} s={0.82} dir="front" ink={INK_SOFT} />
          ))}
          {[278, 322].map((x) => (
            <Bride key={x} x={x} s={0.82} dir="front" veil="back" ink={INK_SOFT} />
          ))}
          <Groom x={176} dir="right" />
          <Bride x={224} flip dir="left" veil="back" bouquet="low" />
        </g>
      );

    case 'groupCircle':
      return (
        <g>
          <Groom x={88} s={0.78} dir="right" ink={INK_SOFT} />
          <Bride x={136} s={0.86} dir="right" veil="back" ink={INK_SOFT} />
          <Groom x={310} s={0.78} flip dir="left" ink={INK_SOFT} />
          <Bride x={262} s={0.86} flip dir="left" veil="back" ink={INK_SOFT} />
          <Groom x={178} dir="right" />
          <Bride x={224} flip dir="left" veil="back" bouquet="chest" />
        </g>
      );

    case 'groupToast':
      return (
        <g>
          <Groom x={110} s={0.84} dir="front" ink={INK_SOFT} arms={[arm([-21, -118], [-34, -142], 10)]} />
          <Bride x={292} s={0.84} dir="front" veil="back" ink={INK_SOFT} arms={[arm([11, -112], [26, -138], -10)]} />
          <Groom x={176} dir="right" arms={[arm([-21, -118], [-36, -144], 10)]} />
          <Bride x={228} flip dir="left" veil="back" arms={[arm([-11, -112], [-28, -140], -10)]} />
          <g fill="rgba(255,250,240,.7)">
            <circle cx={72} cy={G - 148} r={6} />
            <circle cx={140} cy={G - 150} r={6} />
            <circle cx={318} cy={G - 144} r={6} />
            <circle cx={256} cy={G - 146} r={6} />
          </g>
        </g>
      );

    case 'family':
    case 'kids':
      return (
        <g>
          <Groom x={158} dir="front" arms={[arm([-21, -118], [-30, -86], 10)]} />
          <Bride x={252} dir="front" veil="back" arms={[arm([11, -112], [22, -84], -10)]} />
          <Groom x={196} s={0.52} dir="front" ink={INK_SOFT} />
          <Bride x={222} s={0.5} dir="front" ink={INK_SOFT} />
          <Limb d={arm([179, G - 116], [196, G - 62], -8)} w={6} />
          <Limb d={arm([233, G - 112], [222, G - 60], 8)} w={6} />
        </g>
      );

    /* ---------- کادرهای باز و خلاقانه ---------- */
    case 'silhouette':
      return (
        <g>
          <Groom x={180} s={0.74} dir="right" ink="rgba(8,6,12,.96)" />
          <Bride x={224} s={0.74} flip dir="left" veil="long" ink="rgba(8,6,12,.96)" />
          <Limb d={arm([196, G - 84], [214, G - 74], -6)} w={5} />
        </g>
      );

    case 'twoDots':
      return (
        <g>
          <Groom x={196} s={0.34} dir="right" ink="rgba(8,6,12,.9)" />
          <Bride x={214} s={0.34} flip dir="left" veil="back" ink="rgba(8,6,12,.9)" />
        </g>
      );

    case 'reflection':
      return (
        <g>
          <Groom x={178} base={G - 44} dir="right" />
          <Bride x={222} base={G - 44} flip dir="left" veil="back" />
          <g opacity={0.26} transform={`translate(0 ${2 * (G - 44)}) scale(1 -1)`}>
            <Groom x={178} base={G - 44} dir="right" />
            <Bride x={222} base={G - 44} flip dir="left" veil="back" />
          </g>
          <path d={`M0 ${G - 44}H400`} stroke="rgba(255,255,255,.35)" strokeWidth={2} />
        </g>
      );

    case 'arch':
      return (
        <g>
          <path
            d={`M108 ${G}V158a92 92 0 0 1 184 0v108`}
            fill="none"
            stroke={PROP}
            strokeWidth={13}
          />
          <Groom x={178} dir="right" />
          <Bride x={224} flip dir="left" veil="back" bouquet="low" />
          <Limb d={arm([199, G - 116], [212, G - 98], -8)} />
        </g>
      );

    case 'window':
      return (
        <g>
          <rect x={96} y={44} width={208} height={222} fill="rgba(255,255,255,.08)" stroke={PROP} strokeWidth={10} />
          <path d={`M200 44V266`} stroke={PROP} strokeWidth={6} />
          <Bride x={166} dir="right" veil="back" arms={[arm([-11, -112], [16, -120], -12)]} />
          <Groom x={244} flip dir="left" arms={[arm([-21, -118], [-34, -110], -8)]} />
        </g>
      );

    case 'lowAngle':
      return (
        <g>
          <Groom x={166} base={G + 34} s={1.22} dir="right" />
          <Bride x={244} base={G + 34} s={1.22} flip dir="left" veil="back" />
          <Limb d={arm([194, G - 118], [222, G - 104], -8)} w={8} />
        </g>
      );

    case 'starSky':
    case 'nightLights':
      return (
        <g>
          <g fill="rgba(255,250,240,.8)">
            {[
              [64, 58],
              [118, 92],
              [186, 48],
              [248, 84],
              [312, 54],
              [356, 104],
              [92, 132],
              [286, 132],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i % 2 ? 2.5 : 3.5} />
            ))}
          </g>
          <Groom x={182} s={0.86} dir="right" ink="rgba(8,6,12,.95)" />
          <Bride x={224} s={0.86} flip dir="left" veil="long" ink="rgba(8,6,12,.95)" />
          <Limb d={arm([200, G - 100], [214, G - 90], -6)} w={6} />
        </g>
      );

    case 'fogWalk':
      return (
        <g>
          <Groom x={182} lower="walk" flip dir="left" />
          <Bride x={222} lower="train" dir="left" veil="long" />
          <Limb d={arm([164, G - 116], [208, G - 100], 8)} />
          <g stroke="rgba(255,255,255,.4)" strokeWidth={9} strokeLinecap="round" fill="none">
            <path d={`M18 ${G - 74}H150`} />
            <path d={`M250 ${G - 56}H386`} />
            <path d={`M60 ${G - 30}H230`} />
          </g>
        </g>
      );

    default:
      return (
        <g>
          <Groom x={168} dir="right" arms={[arm([-21, -118], [-26, -80], 8)]} />
          <Bride x={232} flip dir="left" veil="back" arms={[arm([-11, -112], [-16, -80], 8)]} />
          <Limb d={arm([189, G - 114], [211, G - 102], -6)} />
        </g>
      );
  }
};

interface Props {
  pose: Pose;
  className?: string;
  /** روی جزئیات ژست، طرح بزرگ‌تر و بدون برش نمایش داده می‌شود */
  contain?: boolean;
}

const NIGHT: ArtKey[] = ['starSky', 'nightLights', 'silhouette', 'kissSilhouette'];

export const PoseVisual: React.FC<Props> = ({ pose, className = '', contain = false }) => {
  const loc = pose.locations[0] || 'باغ عمارت';
  const hasReference = Boolean(pose.image);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} role="img" aria-label={pose.title}>
      {hasReference ? (
        <img
          src={pose.image}
          alt={`عکس واقعی مرجع: ${pose.title}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full ${contain ? 'object-contain' : 'object-cover'}`}
        />
      ) : (
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio={contain ? 'xMidYMid meet' : 'xMidYMid slice'}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <Backdrop loc={loc} id={pose.id} night={NIGHT.indexOf(pose.art) >= 0} />
          <Ground />
          <Scene art={pose.art} />
        </svg>
      )}

      <div className="absolute inset-0 pointer-events-none" style={{ background: hasReference ? 'linear-gradient(to top, rgba(8,6,14,.62), transparent 58%)' : 'transparent' }} />

      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio={contain ? 'xMidYMid meet' : 'xMidYMid slice'}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        {hasReference ? (
          <g opacity=".82">
            <Scene art={pose.art} />
          </g>
        ) : null}
      </svg>

      {hasReference ? (
        <span className="absolute bottom-2 right-2 pill !text-[9px] !py-1" style={{ background: 'rgba(8,6,14,.62)', color: '#FFF8EC', borderColor: 'rgba(255,255,255,.24)' }}>
          عکس واقعی + راهنمای فرم بدن
        </span>
      ) : null}
    </div>
  );
};
