import React, { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// FALLING LINES ANIMATION COMPONENT
// Shared across Login, SignUp, and Onboarding pages
// ============================================================================

interface Line {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angleRad: number;
  sinAngle: number;
  thickness: number;
  hasGlow: boolean;
}

export const FallingLinesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<Line[]>([]);
  const animationRef = useRef<number>();
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const lastFrameTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  const FRAME_INTERVAL = 1000 / 30;
  const MAX_LINES = 150;

  const createLine = useCallback((width: number, height: number, isInitial: boolean = false): Line => {
    const baseAngle = -15 + Math.random() * 30;
    const angleRad = (baseAngle * Math.PI) / 180;
    return {
      x: Math.random() * width * 1.5 - width * 0.25,
      y: isInitial ? Math.random() * height : -Math.random() * height * 0.5,
      length: 20 + Math.random() * 60,
      speed: 0.8 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.5,
      angleRad,
      sinAngle: Math.sin(angleRad) * 0.3,
      thickness: 1 + Math.random() * 2,
      hasGlow: Math.random() > 0.85,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let bgGradient: CanvasGradient | null = null;
    let glowGradient: CanvasGradient | null = null;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      dimensionsRef.current = { width, height };

      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#0a0a0a');
      bgGradient.addColorStop(0.5, '#111111');
      bgGradient.addColorStop(1, '#0d0d0d');

      glowGradient = ctx.createRadialGradient(
        width * 0.4, height * 0.5, 0,
        width * 0.4, height * 0.5, width * 0.6
      );
      glowGradient.addColorStop(0, 'rgba(180, 120, 60, 0.03)');
      glowGradient.addColorStop(1, 'transparent');

      const rawLineCount = Math.floor((width * height) / 12000);
      const lineCount = Math.min(rawLineCount, MAX_LINES);
      linesRef.current = Array.from({ length: lineCount }, () =>
        createLine(width, height, true)
      );
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden && !animationRef.current) {
        lastFrameTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = (currentTime: number) => {
      if (!isVisibleRef.current) {
        animationRef.current = undefined;
        return;
      }

      const elapsed = currentTime - lastFrameTimeRef.current;
      if (elapsed < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = currentTime - (elapsed % FRAME_INTERVAL);

      const { width, height } = dimensionsRef.current;
      const lines = linesRef.current;

      if (bgGradient) {
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
      }

      if (glowGradient) {
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.lineCap = 'round';

      const opacityGroups: { [key: string]: Line[] } = {};
      const glowLines: Line[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        line.y += line.speed * 2;
        line.x += line.sinAngle * line.speed * 2;

        if (line.y > height + line.length) {
          line.x = Math.random() * width * 1.5 - width * 0.25;
          line.y = -line.length;
        }

        if (line.hasGlow) {
          glowLines.push(line);
        } else {
          const key = `${Math.round(line.opacity * 10)}_${Math.round(line.thickness)}`;
          if (!opacityGroups[key]) opacityGroups[key] = [];
          opacityGroups[key].push(line);
        }
      }

      for (const key in opacityGroups) {
        const group = opacityGroups[key];
        if (group.length === 0) continue;

        const firstLine = group[0];
        ctx.strokeStyle = `rgba(255, 255, 255, ${firstLine.opacity})`;
        ctx.lineWidth = firstLine.thickness;
        ctx.beginPath();

        for (let i = 0; i < group.length; i++) {
          const line = group[i];
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(
            line.x + Math.sin(line.angleRad) * line.length,
            line.y + Math.cos(line.angleRad) * line.length
          );
        }
        ctx.stroke();
      }

      for (let i = 0; i < glowLines.length; i++) {
        const line = glowLines[i];
        const endX = line.x + Math.sin(line.angleRad) * line.length;
        const endY = line.y + Math.cos(line.angleRad) * line.length;

        ctx.strokeStyle = `rgba(245, 158, 11, ${line.opacity * 0.3})`;
        ctx.lineWidth = line.thickness + 4;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = `rgba(245, 180, 100, ${line.opacity * 1.3})`;
        ctx.lineWidth = line.thickness;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createLine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0a0a0a', willChange: 'transform' }}
    />
  );
};
