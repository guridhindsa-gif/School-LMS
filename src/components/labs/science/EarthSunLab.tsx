'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { LabNote, Readout, Slider } from '../Slider';

type Mode = 'day' | 'seasons';
const SEASONS = ['mar', 'jun', 'sep', 'dec'] as const;
type S = (typeof SEASONS)[number];
const DECL: Record<S, number> = { mar: 0, jun: 23.5, sep: 0, dec: -23.5 }; // Sun's declination (°)
const LAT = 28.6; // New Delhi (°N)

/** Day length (h) at latitude φ for solar declination δ (sunrise equation, ignoring refraction). */
const dayLength = (lat: number, dec: number) => {
  const x = -Math.tan((lat * Math.PI) / 180) * Math.tan((dec * Math.PI) / 180);
  return (2 * Math.acos(Math.max(-1, Math.min(1, x))) * 180) / Math.PI / 15;
};

export default function EarthSunLab() {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>('day');
  const [hour, setHour] = useState(9);
  const [season, setSeason] = useState<S>('jun');

  // Day & night (seen from above the North Pole; Sun to the left). Midnight faces away from the Sun.
  const th = (hour * 15 * Math.PI) / 180;
  const ex = 250, ey = 110, er = 70;
  const mx = ex + er * Math.cos(th), my = ey - er * Math.sin(th);
  const isDay = Math.cos(th) < 0; // on the Sun-facing (left) half
  const phase = hour === 6 ? 'sunrise' : hour === 18 ? 'sunset' : isDay ? 'day' : 'night';

  // Seasons: noon altitude and day length at New Delhi
  const dec = DECL[season];
  const noon = 90 - LAT + dec;
  const len = dayLength(LAT, dec);
  const nh = season === 'jun' ? 'summer' : season === 'dec' ? 'winter' : season === 'mar' ? 'spring' : 'autumn';
  const sh = season === 'jun' ? 'winter' : season === 'dec' ? 'summer' : season === 'mar' ? 'autumn' : 'spring';
  // axis tilt drawn in the side view: toward the Sun (left) in June, away in December, sideways at equinoxes
  const tilt = season === 'jun' ? -23.5 : season === 'dec' ? 23.5 : 0;
  const hhmm = (h: number) => `${Math.floor(h)} h ${Math.round((h % 1) * 60)} min`;

  return (
    <div className="grid gap-4">
      <div className="seg w-fit" role="radiogroup" aria-label={t('ls2.earth.view')}>
        {(['day', 'seasons'] as const).map(m => <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>{t(`ls2.earth.${m}`)}</button>)}
      </div>
      {mode === 'day' ? (
        <>
          <div className="overflow-hidden rounded-card border border-line bg-night">
            <svg viewBox="0 0 400 220" className="w-full" role="img" aria-label={t('ls2.earth.dayAria', { h: hour, p: t(`ls2.earth.ph.${phase}`) })}>
              <circle cx="20" cy="110" r="60" fill="rgb(var(--accent))" />
              {[60, 90, 110, 130, 160].map(y => <line key={y} x1="90" y1={y} x2="170" y2={y} stroke="rgb(var(--accent))" strokeOpacity=".5" strokeDasharray="6 6" />)}
              <circle cx={ex} cy={ey} r={er} fill="#2f6fb5" />
              <path d={`M${ex} ${ey - er} A${er} ${er} 0 0 1 ${ex} ${ey + er} Z`} fill="#000" opacity=".55" />
              <circle cx={ex} cy={ey} r="5" fill="#fff" />
              <circle cx={mx} cy={my} r="9" fill={isDay ? 'rgb(var(--accent))' : '#fff'} stroke="#000" strokeWidth="1.5" />
              <path d={`M${ex + er + 18} ${ey + 20} A 30 30 0 0 0 ${ex + er + 18} ${ey - 20}`} fill="none" stroke="rgb(var(--on-night))" strokeWidth="2" />
              <path d={`M${ex + er + 18} ${ey - 26} l-5 8 h10 z`} fill="rgb(var(--on-night))" />
              <text x={ex} y="208" textAnchor="middle" fontSize="11" fill="rgb(var(--on-night))">{t('ls2.earth.topView')}</text>
            </svg>
          </div>
          <Slider id="es-h" label={t('ls2.earth.time')} value={hour} min={0} max={23} unit=" h" onChange={setHour} />
          <Readout items={[[t('ls2.earth.local'), `${String(hour).padStart(2, '0')}:00`], [t('ls2.earth.youHave'), t(`ls2.earth.ph.${phase}`)], [t('ls2.earth.turn'), `${hour * 15}°`], [t('ls2.earth.rate'), '15° / h']]} />
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-card border border-line bg-night">
            <svg viewBox="0 0 400 220" className="w-full" role="img" aria-label={t('ls2.earth.seasonAria', { m: t(`ls2.earth.m.${season}`), nh: t(`ls2.earth.s.${nh}`) })}>
              <circle cx="40" cy="110" r="42" fill="rgb(var(--accent))" />
              {[80, 110, 140].map(y => <line key={y} x1="90" y1={y} x2="210" y2={y} stroke="rgb(var(--accent))" strokeOpacity=".5" strokeDasharray="6 6" />)}
              <g transform={`rotate(${tilt} 280 110)`}>
                <circle cx="280" cy="110" r="62" fill="#2f6fb5" />
                <line x1="280" y1="30" x2="280" y2="190" stroke="#fff" strokeWidth="2.5" />
                <line x1="218" y1="110" x2="342" y2="110" stroke="#fff" strokeOpacity=".6" strokeDasharray="4 4" />
                <text x="286" y="40" fontSize="11" fill="#fff">N</text>
              </g>
              <path d="M280 48 A 62 62 0 0 1 280 172 Z" fill="#000" opacity=".5" />
              <text x="280" y="210" textAnchor="middle" fontSize="11" fill="rgb(var(--on-night))">{t('ls2.earth.tiltLabel')}</text>
            </svg>
          </div>
          <div className="seg w-fit flex-wrap" role="radiogroup" aria-label={t('ls2.earth.month')}>
            {SEASONS.map(s => <button key={s} role="radio" aria-checked={season === s} onClick={() => setSeason(s)}>{t(`ls2.earth.m.${s}`)}</button>)}
          </div>
          <Readout items={[
            [t('ls2.earth.nh'), t(`ls2.earth.s.${nh}`)], [t('ls2.earth.sh'), t(`ls2.earth.s.${sh}`)],
            [t('ls2.earth.noon'), `${noon.toFixed(1)}°`], [t('ls2.earth.dayLen'), hhmm(len)],
          ]} />
        </>
      )}
      <LabNote>{t('ls2.earth.note')}</LabNote>
    </div>
  );
}
