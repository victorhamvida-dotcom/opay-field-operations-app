/**
 * Cross-browser compatibility helpers for:
 * Android Chrome / Samsung Internet / Firefox
 * iPhone Safari / Chrome iOS
 * Windows/HP Edge / Chrome / Firefox
 * macOS Safari / Chrome
 */

/** Safe localStorage — iOS private mode can throw */
export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

export function storageSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

export function storageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function sessionGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function sessionSet(key: string, value: string): boolean {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Clipboard with fallback for older browsers / insecure contexts */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** roundRect polyfill for older Safari / Canvas2D */
export function patchCanvasRoundRect(): void {
  const proto = CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & {
    roundRect?: (
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | number[]
    ) => void;
  };
  if (typeof proto.roundRect === 'function') return;

  proto.roundRect = function (
    x: number,
    y: number,
    w: number,
    h: number,
    radii: number | number[] = 0
  ) {
    let r = 0;
    if (typeof radii === 'number') r = radii;
    else if (Array.isArray(radii) && radii.length) r = radii[0] || 0;
    r = Math.max(0, Math.min(r, Math.min(Math.abs(w), Math.abs(h)) / 2));

    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  };
}

/** Mobile browser chrome height fix (Android + iOS) */
export function installViewportFix(): () => void {
  const setVh = () => {
    const h = window.innerHeight || document.documentElement.clientHeight || 0;
    document.documentElement.style.setProperty('--app-vh', `${h * 0.01}px`);
    document.documentElement.style.setProperty('--app-height', `${h}px`);
  };
  setVh();

  const onResize = () => setVh();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  // iOS Safari visual viewport shifts when keyboard/toolbar shows
  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
  }

  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    if (vv) {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    }
  };
}

/** Detect touch / iOS for gesture-friendly defaults */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function unlockAudioOnFirstGesture(): void {
  const unlock = () => {
    try {
      // Dynamic import avoided — sound manager already handles webkitAudioContext
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      if (ctx.state === 'suspended') ctx.resume();
      setTimeout(() => {
        try {
          ctx.close();
        } catch {
          // ignore
        }
      }, 0);
    } catch {
      // ignore
    }
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('click', unlock, { once: true });
}

/** Call once at app boot */
export function initBrowserCompat(): () => void {
  patchCanvasRoundRect();
  const disposeVh = installViewportFix();
  unlockAudioOnFirstGesture();

  // Prevent pinch-zoom gesture breaking game canvas on some Android browsers
  // while still allowing accessibility zoom via browser controls
  document.addEventListener(
    'gesturestart',
    (e) => {
      // iOS Safari legacy gesture event
      e.preventDefault();
    },
    { passive: false }
  );

  return disposeVh;
}
