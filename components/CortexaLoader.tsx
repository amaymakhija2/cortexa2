import React, { useEffect, useRef, useState } from "react";

/**
 * CortexaLoader
 *
 * Refined, luxury-minimal brand reveal animation:
 * 1. Deep black canvas with subtle film grain texture
 * 2. Logo mark emerges large and commanding
 * 3. Elegant separator line draws in
 * 4. Wordmark reveals with precise letter cascade
 * 5. Brief presence hold with subtle breathing
 * 6. Dot field dispersion exit - dots fly outward revealing the app
 */

type CortexaLoaderProps = {
  durationMs?: number;
  onDone?: () => void;
};

type Dot = {
  x: number;
  y: number;
  angle: number;
  dist: number;
  phase: number;
};

// Easing functions
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - clamp01(t), 3);
}

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - clamp01(t), 5);
}

function easeInOutQuart(t: number) {
  t = clamp01(t);
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function easeInCubic(t: number) {
  return Math.pow(clamp01(t), 3);
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - clamp01(t), 4);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Generate subtle noise texture as data URL
function generateNoiseTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 150;
  canvas.height = 150;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.createImageData(150, 150);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255;
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = 8;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

export const CortexaLoader: React.FC<CortexaLoaderProps> = ({
  durationMs = 2800,
  onDone,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const [noiseUrl, setNoiseUrl] = useState<string>("");

  // Refs for animated elements
  const logoMarkRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Dot field for exit
  const dotsRef = useRef<Dot[]>([]);
  const dimensionsRef = useRef({ w: 0, h: 0, cx: 0, cy: 0 });

  useEffect(() => {
    setNoiseUrl(generateNoiseTexture());
  }, []);

  function rebuildDots(w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const spacing = Math.max(28, Math.min(42, Math.round(Math.min(w, h) / 24)));

    const dots: Dot[] = [];
    for (let y = spacing / 2; y <= h; y += spacing) {
      for (let x = spacing / 2; x <= w; x += spacing) {
        const dx = x - cx;
        const dy = y - cy;
        dots.push({
          x,
          y,
          angle: Math.atan2(dy, dx),
          dist: Math.sqrt(dx * dx + dy * dy),
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    dotsRef.current = dots;
    dimensionsRef.current = { w, h, cx, cy };
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const rect = root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    rebuildDots(rect.width, rect.height);
  }

  useEffect(() => {
    if (!noiseUrl) return;

    startRef.current = performance.now();
    resizeCanvas();

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    const animate = (now: number) => {
      const canvas = canvasRef.current;
      const logoMark = logoMarkRef.current;
      const separator = separatorRef.current;
      const wordmark = wordmarkRef.current;
      const container = containerRef.current;
      const glow = glowRef.current;
      const root = rootRef.current;

      if (!canvas || !logoMark || !separator || !wordmark || !container || !glow || !root) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h, cx, cy } = dimensionsRef.current;
      const total = prefersReduced ? 1000 : durationMs;
      const tRaw = (now - startRef.current) / total;
      const t = clamp01(tRaw);

      // === PHASE TIMING ===
      // 0.00 - 0.05: Initial pause (anticipation)
      // 0.05 - 0.28: Logo mark fades in with scale
      // 0.22 - 0.38: Separator line draws from center
      // 0.30 - 0.52: Wordmark letters cascade in
      // 0.52 - 0.68: Hold at full presence with subtle breathing
      // 0.68 - 0.82: Logo lifts up and fades
      // 0.72 - 0.98: Dots disperse outward + background fades
      // 0.92 - 1.00: Final fade

      const time = now * 0.001;

      // Logo mark animation
      const logoIn = easeOutQuint(smoothstep(0.05, 0.28, t));

      // Subtle breathing during hold phase
      const breathePhase = smoothstep(0.38, 0.55, t) * (1 - smoothstep(0.66, 0.72, t));
      const breathe = breathePhase * 0.008 * Math.sin(time * 2.0);
      const logoScale = 0.96 + 0.04 * logoIn + breathe;

      // Separator line animation
      const sepIn = easeInOutQuart(smoothstep(0.22, 0.38, t));

      // Wordmark animation
      const wordmarkIn = easeOutCubic(smoothstep(0.30, 0.48, t));

      // Logo exit - lifts up and fades
      const logoExitProgress = smoothstep(0.68, 0.84, t);
      const logoLift = easeInCubic(logoExitProgress) * -28;
      const logoExitOpacity = 1 - easeInCubic(logoExitProgress);

      // Dot dispersion exit
      const disperseProgress = easeOutQuart(smoothstep(0.72, 0.98, t));

      // Background fade
      const bgFade = smoothstep(0.90, 1.0, t);
      const overlayOpacity = 1 - bgFade;

      // Ambient glow
      const glowBreath = 0.4 + 0.1 * Math.sin(time * 1.6);
      const glowOpacity = logoIn * logoExitOpacity * glowBreath;

      // === DRAW CANVAS (dots only during exit) ===
      ctx.clearRect(0, 0, w, h);

      if (disperseProgress > 0.001) {
        const dots = dotsRef.current;
        const dotR = 1.8;

        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];

          // Disperse outward from center
          const disperseAmt = disperseProgress * 200 * (0.5 + 0.5 * (d.dist / Math.max(w, h)));
          const currentX = d.x + Math.cos(d.angle) * disperseAmt;
          const currentY = d.y + Math.sin(d.angle) * disperseAmt;

          // Skip if off screen
          if (currentX < -30 || currentX > w + 30 || currentY < -30 || currentY > h + 30) continue;

          // Fade in then out
          const dotFadeIn = smoothstep(0.72, 0.78, t);
          const dotFadeOut = smoothstep(0.88, 0.98, t);
          const twinkle = 0.9 + 0.1 * Math.sin(time * 2.2 + d.phase);
          const alpha = dotFadeIn * (1 - dotFadeOut) * twinkle * 0.6 * overlayOpacity;

          if (alpha <= 0.001) continue;

          ctx.beginPath();
          ctx.fillStyle = `rgba(235, 232, 225, ${alpha})`;
          ctx.arc(currentX, currentY, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // === UPDATE DOM ELEMENTS ===

      // Logo mark
      logoMark.style.opacity = String(logoIn * logoExitOpacity);
      logoMark.style.transform = `scale(${logoScale}) translateY(${logoLift}px)`;

      // Separator
      separator.style.opacity = String(sepIn * logoExitOpacity);
      separator.style.transform = `scaleX(${sepIn})`;

      // Wordmark
      wordmark.style.opacity = String(wordmarkIn * logoExitOpacity);
      wordmark.style.transform = `translateY(${(1 - wordmarkIn) * 8 + logoLift * 0.4}px)`;

      // Container
      container.style.transform = `translate(-50%, -50%)`;

      // Glow
      glow.style.opacity = String(glowOpacity);

      // Root opacity for final fade
      root.style.opacity = String(overlayOpacity);

      // Letter stagger for wordmark
      const letters = wordmark.querySelectorAll<HTMLSpanElement>(".loader-letter");
      letters.forEach((letter, i) => {
        const letterDelay = 0.30 + i * 0.025;
        const letterProgress = easeOutCubic(smoothstep(letterDelay, letterDelay + 0.12, t));
        letter.style.opacity = String(letterProgress * logoExitOpacity);
        letter.style.transform = `translateY(${(1 - letterProgress) * 6}px)`;
      });

      // End
      if (tRaw >= 1) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        onDone?.();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [durationMs, onDone, noiseUrl]);

  const wordmarkText = "CORTEXA";

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      {/* Deep charcoal-black base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#0a0a0a",
        }}
      />

      {/* Subtle center spotlight for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 50% 48%, rgba(18, 18, 18, 1) 0%, rgba(10, 10, 10, 1) 60%)",
        }}
      />

      {/* Film grain texture */}
      {noiseUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${noiseUrl})`,
            backgroundRepeat: "repeat",
            opacity: 0.35,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Canvas for dot dispersion */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      {/* Ambient glow behind logo */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -58%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 253, 250, 0.07) 0%, rgba(255, 252, 248, 0.025) 45%, transparent 70%)",
          filter: "blur(50px)",
          opacity: 0,
        }}
      />

      {/* Logo lockup container */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Logo mark - LARGE */}
        <div
          ref={logoMarkRef}
          style={{
            opacity: 0,
            transform: "scale(0.96)",
            marginBottom: 24,
          }}
        >
          <img
            src="/cortexa-logo-mark-white.png"
            alt=""
            style={{
              height: 88,
              width: "auto",
            }}
          />
        </div>

        {/* Elegant separator line */}
        <div
          ref={separatorRef}
          style={{
            width: 40,
            height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%)",
            marginBottom: 20,
            opacity: 0,
            transform: "scaleX(0)",
          }}
        />

        {/* Wordmark with letter cascade - LARGE */}
        <div
          ref={wordmarkRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            opacity: 0,
          }}
        >
          {wordmarkText.split("").map((char, i) => (
            <span
              key={i}
              className="loader-letter"
              style={{
                fontFamily: "'Suisse Intl', sans-serif",
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 22,
                fontWeight: 400,
                letterSpacing: "0.24em",
                opacity: 0,
                transform: "translateY(6px)",
                display: "inline-block",
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Subtle corner vignettes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.15) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
