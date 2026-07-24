import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  onLoadError?: () => void;
  // Increment to force a fresh widget (e.g. after a failed submission)
  resetKey?: number;
}

// Module-level state so the script is only loaded once across all instances
let scriptState: 'idle' | 'loading' | 'loaded' = 'idle';
const readyCallbacks: (() => void)[] = [];

function ensureScript(onReady: () => void) {
  if (scriptState === 'loaded') {
    onReady();
    return;
  }
  readyCallbacks.push(onReady);
  if (scriptState === 'idle') {
    scriptState = 'loading';
    window.onloadTurnstileCallback = () => {
      scriptState = 'loaded';
      readyCallbacks.forEach(cb => cb());
      readyCallbacks.length = 0;
    };
    const script = document.createElement('script');
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

const Turnstile = ({ siteKey, onVerify, onExpire, onError, onLoadError, resetKey }: TurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const gotTokenRef = useRef(false);
  // Refs keep callbacks stable so we don't re-render the widget on every parent render
  const callbacksRef = useRef({ onVerify, onExpire, onError, onLoadError });
  callbacksRef.current = { onVerify, onExpire, onError, onLoadError };

  useEffect(() => {
    gotTokenRef.current = false;

    const renderWidget = () => {
      if (!containerRef.current) return;
      if (widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (_) {}
        widgetIdRef.current = null;
      }
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            gotTokenRef.current = true;
            callbacksRef.current.onVerify(token);
          },
          'expired-callback': () => callbacksRef.current.onExpire?.(),
          'error-callback': () => callbacksRef.current.onError?.(),
        });
      } catch {
        callbacksRef.current.onLoadError?.();
      }
    };

    // 1) Script-load timeout: if the api.js never loads (CSP/network blocked)
    const scriptTimeout = setTimeout(() => {
      if (widgetIdRef.current === null) callbacksRef.current.onLoadError?.();
    }, 5000);

    // 2) Challenge timeout: some browsers (Edge with strict tracking prevention,
    //    aggressive content blockers, etc.) let the widget render but silently
    //    block the challenge iframe, so no token is ever issued. If no token
    //    arrives in a reasonable window, declare Turnstile unavailable so the
    //    form can fall back to server-side honeypot + validation only.
    const challengeTimeout = setTimeout(() => {
      if (!gotTokenRef.current) callbacksRef.current.onLoadError?.();
    }, 6000);

    ensureScript(() => {
      clearTimeout(scriptTimeout);
      renderWidget();
    });

    return () => {
      clearTimeout(scriptTimeout);
      clearTimeout(challengeTimeout);
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, resetKey]);

  return <div ref={containerRef} />;
};

export default Turnstile;
