/* oxlint-disable next/no-img-element -- direct asset loading preserves the supplied artwork and avoids runtime transforms */

import { Pause, Play, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Stage = {
  title: string;
  chapter: string;
  kind: 'image' | 'video' | 'cta';
  src?: string;
  poster: string;
  position?: string;
  tone: string;
};

const base = import.meta.env.BASE_URL;
const image = (name: string) => `${base}assets/images/${name}`;
const video = (name: string) => `${base}assets/videos/${name}`;
const captions = `${base}assets/captions/empty.vtt`;

const stages: Stage[] = [
  { title: 'AURA', chapter: '01 — CLEAN', kind: 'image', src: image('01_aura_clean.png'), poster: image('01_aura_clean.png'), position: '50% 34%', tone: '#968a82' },
  { title: 'AURA', chapter: '02 — REVEAL', kind: 'video', src: video('01_aura_ui_reveal.mp4'), poster: image('01_aura_clean.png'), position: '50% 34%', tone: '#998c84' },
  { title: 'AURA', chapter: '03 — COVER', kind: 'image', src: image('02_aura_cover_9x16.png'), poster: image('02_aura_cover_9x16.png'), tone: '#8f837b' },
  { title: 'Y2K MUSE', chapter: '04 — ZOOM OUT', kind: 'video', src: video('02_aura_zoomout_to_muse.mp4'), poster: image('02_aura_cover_9x16.png'), tone: '#8a786e' },
  { title: 'Y2K MUSE', chapter: '05 — CLEAN', kind: 'image', src: image('03_muse_clean.png'), poster: image('03_muse_clean.png'), tone: '#8e7b70' },
  { title: 'Y2K MUSE', chapter: '06 — REVEAL', kind: 'video', src: video('03_muse_ui_reveal.mp4'), poster: image('03_muse_clean.png'), tone: '#907c71' },
  { title: 'Y2K MUSE', chapter: '07 — FINAL', kind: 'image', src: image('04_muse_ui_9x16.png'), poster: image('04_muse_ui_9x16.png'), tone: '#8a766c' },
  { title: 'Y2K MUSE', chapter: '08 — FADE', kind: 'video', src: video('04_muse_ui_fade_and_transition.mp4'), poster: image('04_muse_ui_9x16.png'), tone: '#93857d' },
  { title: 'Y2K FASHION', chapter: '09 — TRANSFORM', kind: 'video', src: video('05_muse_to_fashion_clean.mp4'), poster: image('04_muse_ui_9x16.png'), tone: '#9c9590' },
  { title: 'Y2K FASHION', chapter: '10 — CLEAN', kind: 'image', src: image('05_fashion_clean.png'), poster: image('05_fashion_clean.png'), tone: '#a7a19c' },
  { title: 'Y2K FASHION', chapter: '11 — REVEAL', kind: 'video', src: video('06_fashion_ui_reveal.mp4'), poster: image('05_fashion_clean.png'), tone: '#a39d98' },
  { title: 'Y2K FASHION', chapter: '12 — FINAL', kind: 'image', src: image('06_fashion_ui_9x16.png'), poster: image('06_fashion_ui_9x16.png'), tone: '#9b9692' },
  { title: 'BLACK RUFFLE', chapter: '13 — CLEAN', kind: 'image', src: image('07_ruffle_clean.png'), poster: image('07_ruffle_clean.png'), tone: '#756b65' },
  { title: 'BLACK RUFFLE', chapter: '14 — REVEAL', kind: 'video', src: video('07_ruffle_ui_reveal.mp4'), poster: image('07_ruffle_clean.png'), tone: '#69605b' },
  { title: 'BLACK RUFFLE', chapter: '15 — FINAL', kind: 'image', src: image('08_ruffle_ui_9x16.png'), poster: image('08_ruffle_ui_9x16.png'), tone: '#5b5350' },
  { title: 'FULL FILM', chapter: '16 — PLAY', kind: 'cta', poster: image('08_ruffle_ui_9x16.png'), tone: '#332e2b' },
];

function MediaLayer({
  stage,
  index,
  isActive,
  reducedMotion,
  onVideoStart,
  onVideoEnd,
}: {
  stage: Stage;
  index: number;
  isActive: boolean;
  reducedMotion: boolean;
  onVideoStart: (index: number) => void;
  onVideoEnd: (index: number) => void;
}) {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || stage.kind !== 'video') return;

    if (!isActive || reducedMotion) {
      media.pause();
      if (isActive && reducedMotion) onVideoEnd(index);
      return;
    }

    onVideoStart(index);
    media.currentTime = 0;
    const attempt = media.play();
    attempt?.catch(() => window.setTimeout(() => onVideoEnd(index), 500));
    return () => media.pause();
  }, [index, isActive, onVideoEnd, onVideoStart, reducedMotion, stage.kind]);

  return (
    <div className={`media-layer ${isActive ? 'is-active' : ''}`} aria-hidden={!isActive}>
      <img className="media-backdrop" src={stage.poster} alt="" />
      <div className="portrait-frame">
        <img
          className="stage-media poster-media"
          src={stage.kind === 'image' && stage.src ? stage.src : stage.poster}
          alt={isActive ? `${stage.title} fashion look` : ''}
          style={{ objectPosition: stage.position }}
        />
        {stage.kind === 'video' && stage.src && !reducedMotion && (
          <video
            ref={mediaRef}
            className={`stage-media motion-media ${ready ? 'is-ready' : ''}`}
            src={stage.src}
            poster={stage.poster}
            muted
            playsInline
            preload="auto"
            controls={false}
            onCanPlay={() => setReady(true)}
            onPlaying={() => setReady(true)}
            onEnded={() => onVideoEnd(index)}
            style={{ objectPosition: stage.position }}
          >
            <track kind="captions" src={captions} srcLang="en" label="No dialogue" />
          </video>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const storyRef = useRef<HTMLElement>(null);
  const fullFilmRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(0);
  const requestedRef = useRef(0);
  const endedRef = useRef(new Set<number>([0]));
  const transitioningRef = useRef(false);
  const filmOpenRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const transitionTimerRef = useRef<number | undefined>(undefined);
  const advanceRef = useRef<() => void>(() => undefined);

  const [active, setActive] = useState(0);
  const [prepared, setPrepared] = useState<Set<number>>(() => new Set([0, 1]));
  const [fullFilmPrepared, setFullFilmPrepared] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);
  const [filmReady, setFilmReady] = useState(false);
  const [filmPlaying, setFilmPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const stage = stages[active];

  const prepareAround = useCallback((index: number) => {
    setPrepared((previous) => {
      const next = new Set(previous);
      next.add(index);
      if (index + 1 < stages.length) next.add(index + 1);
      return next.size === previous.size ? previous : next;
    });
    if (index >= stages.length - 2) setFullFilmPrepared(true);
  }, []);

  const advance = useCallback(() => {
    if (transitioningRef.current || filmOpenRef.current) return;
    const current = activeRef.current;
    const requested = requestedRef.current;
    if (current === requested) return;

    const direction = requested > current ? 1 : -1;
    if (direction > 0 && stages[current].kind === 'video' && !endedRef.current.has(current)) return;

    const next = current + direction;
    transitioningRef.current = true;
    endedRef.current.delete(next);
    if (stages[next].kind !== 'video' || reducedMotionRef.current) endedRef.current.add(next);
    prepareAround(next);
    activeRef.current = next;
    setActive(next);

    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      transitioningRef.current = false;
      window.setTimeout(() => advanceRef.current(), direction > 0 ? 220 : 0);
    }, 340);
  }, [prepareAround]);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      reducedMotionRef.current = query.matches;
      setReducedMotion(query.matches);
    };
    const frame = requestAnimationFrame(syncMotion);
    query.addEventListener('change', syncMotion);
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener('change', syncMotion);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const story = storyRef.current;
        if (!story || filmOpenRef.current) return;
        const distance = Math.max(1, story.offsetHeight - window.innerHeight);
        const progress = Math.min(0.999999, Math.max(0, -story.getBoundingClientRect().top / distance));
        const requested = Math.min(stages.length - 1, Math.floor(progress * stages.length));
        if (requested !== requestedRef.current) {
          requestedRef.current = requested;
          prepareAround(Math.min(requested, activeRef.current + 1));
          advanceRef.current();
        }
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(transitionTimerRef.current);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [prepareAround]);

  const handleVideoStart = useCallback((index: number) => {
    endedRef.current.delete(index);
  }, []);

  const handleVideoEnd = useCallback((index: number) => {
    endedRef.current.add(index);
    if (activeRef.current === index) window.setTimeout(() => advanceRef.current(), 240);
  }, []);

  const closeFilm = () => {
    filmOpenRef.current = false;
    fullFilmRef.current?.pause();
    setFilmOpen(false);
    setFilmReady(false);
  };

  const openFilm = () => {
    setFullFilmPrepared(true);
    filmOpenRef.current = true;
    setFilmReady(false);
    setFilmOpen(true);
    window.requestAnimationFrame(() => {
      const film = fullFilmRef.current;
      if (!film) return;
      film.currentTime = 0;
      film.muted = false;
      film.play().catch(() => undefined);
    });
  };

  const toggleFilm = () => {
    const film = fullFilmRef.current;
    if (!film) return;
    if (film.paused) film.play().catch(() => undefined);
    else film.pause();
  };

  useEffect(() => {
    if (!filmOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && closeFilm();
    document.body.classList.add('film-is-open');
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('film-is-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [filmOpen]);

  return (
    <main
      ref={storyRef}
      className="story"
      style={{ '--story-height': `${(stages.length - 1) * 72 + 100}dvh` } as React.CSSProperties}
    >
      <section
        className={`stage-shell ${filmOpen ? 'film-active' : ''}`}
        aria-label={`${stage.title}, ${stage.chapter}`}
        style={{ backgroundColor: stage.tone }}
      >
        <div className="media-stack">
          {Array.from(prepared).sort((a, b) => a - b).map((index) => (
            <MediaLayer
              key={index}
              stage={stages[index]}
              index={index}
              isActive={index === active}
              reducedMotion={reducedMotion}
              onVideoStart={handleVideoStart}
              onVideoEnd={handleVideoEnd}
            />
          ))}
        </div>
        <div className="stage-wash" aria-hidden="true" />

        <header className="site-chrome stage-interface">
          <a href="#top" className="wordmark" aria-label="VELVETTE, back to beginning">VELVETTE</a>
          <span>{stage.chapter}</span>
        </header>

        <aside className="rail stage-interface" aria-label={`Scene ${active + 1} of ${stages.length}`}>
          <span className="rail-current">{String(active + 1).padStart(2, '0')}</span>
          <span className="rail-line"><i style={{ height: `${((active + 1) / stages.length) * 100}%` }} /></span>
          <span>{String(stages.length).padStart(2, '0')}</span>
        </aside>

        <div key={active} className={`chapter-caption stage-interface ${stage.kind === 'cta' ? 'is-hidden' : ''}`}>
          <p>VELVETTE / FASHION STUDY</p>
          <h1>{stage.title}</h1>
        </div>

        {active === 0 && (
          <div className="scroll-cue stage-interface" aria-hidden="true">
            <span>SCROLL TO ENTER</span>
            <i />
          </div>
        )}

        <div className={`film-cta ${stage.kind === 'cta' ? 'is-visible' : ''} ${filmOpen ? 'is-withdrawn' : ''}`} aria-hidden={stage.kind !== 'cta'}>
          <p>VELVETTE</p>
          <span>Y2K FASHION FILM</span>
          <h1>WATCH THE<br /><em>FULL FILM</em></h1>
          <button type="button" onClick={openFilm} tabIndex={stage.kind === 'cta' ? 0 : -1}>
            <Play aria-hidden="true" size={16} fill="currentColor" />
            <span>PLAY FILM</span>
            <small>FULL</small>
          </button>
        </div>

        {fullFilmPrepared && (
          <section className={`full-film-layer ${filmOpen ? 'is-open' : ''}`} aria-label="VELVETTE full fashion film" aria-hidden={!filmOpen}>
            <img className="full-film-backdrop" src={image('08_ruffle_ui_9x16.png')} alt="" />
            <div className="full-film-frame">
              <img className="full-film-poster" src={image('08_ruffle_ui_9x16.png')} alt="" />
              <video
                ref={fullFilmRef}
                className={`full-film-video ${filmReady ? 'is-ready' : ''}`}
                src={video('08_full_film_web.mp4')}
                poster={image('08_ruffle_ui_9x16.png')}
                playsInline
                preload="auto"
                controls={false}
                onPlaying={() => setFilmPlaying(true)}
                onPause={() => setFilmPlaying(false)}
                onTimeUpdate={(event) => event.currentTarget.currentTime > 0.1 && setFilmReady(true)}
              >
                <track kind="captions" src={captions} srcLang="en" label="No dialogue" />
              </video>
            </div>
            <button className="film-close" type="button" onClick={closeFilm} aria-label="Close full film">
              <X aria-hidden="true" />
            </button>
            <button className="film-toggle" type="button" onClick={toggleFilm} aria-label={filmPlaying ? 'Pause full film' : 'Play full film'}>
              {filmPlaying ? <Pause aria-hidden="true" size={14} fill="currentColor" /> : <Play aria-hidden="true" size={14} fill="currentColor" />}
              <span>{filmPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
          </section>
        )}
      </section>

      <div className="scroll-length" id="top" aria-hidden="true" />
    </main>
  );
}
