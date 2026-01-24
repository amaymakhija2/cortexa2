import React from 'react';
import { Sparkles } from 'lucide-react';

// =============================================================================
// COMING SOON CARD COMPONENT
// =============================================================================
// A refined, atmospheric placeholder for features in development.
// Features floating orbs, subtle animations, and premium typography.
// =============================================================================

export type ComingSoonAccent = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';

const ACCENT_CONFIG: Record<ComingSoonAccent, {
  primary: string;
  secondary: string;
  glow: string;
  text: string;
  orb1: string;
  orb2: string;
  orb3: string;
}> = {
  violet: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.15)',
    text: 'text-violet-600',
    orb1: 'from-violet-400/30 to-violet-600/10',
    orb2: 'from-purple-300/25 to-fuchsia-500/10',
    orb3: 'from-indigo-400/20 to-violet-400/10',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.15)',
    text: 'text-blue-600',
    orb1: 'from-blue-400/30 to-blue-600/10',
    orb2: 'from-cyan-300/25 to-blue-500/10',
    orb3: 'from-sky-400/20 to-indigo-400/10',
  },
  emerald: {
    primary: '#10b981',
    secondary: '#34d399',
    glow: 'rgba(16, 185, 129, 0.15)',
    text: 'text-emerald-600',
    orb1: 'from-emerald-400/30 to-emerald-600/10',
    orb2: 'from-teal-300/25 to-green-500/10',
    orb3: 'from-green-400/20 to-emerald-400/10',
  },
  amber: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.15)',
    text: 'text-amber-600',
    orb1: 'from-amber-400/30 to-amber-600/10',
    orb2: 'from-yellow-300/25 to-orange-500/10',
    orb3: 'from-orange-400/20 to-amber-400/10',
  },
  rose: {
    primary: '#f43f5e',
    secondary: '#fb7185',
    glow: 'rgba(244, 63, 94, 0.15)',
    text: 'text-rose-600',
    orb1: 'from-rose-400/30 to-rose-600/10',
    orb2: 'from-pink-300/25 to-red-500/10',
    orb3: 'from-red-400/20 to-rose-400/10',
  },
  cyan: {
    primary: '#06b6d4',
    secondary: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.15)',
    text: 'text-cyan-600',
    orb1: 'from-cyan-400/30 to-cyan-600/10',
    orb2: 'from-teal-300/25 to-sky-500/10',
    orb3: 'from-sky-400/20 to-cyan-400/10',
  },
};

export interface ComingSoonCardProps {
  /** The accent color theme */
  accent?: ComingSoonAccent;
  /** Main headline */
  title?: string;
  /** Supporting description */
  description?: string;
  /** Feature highlights to tease */
  features?: string[];
  /** Additional className */
  className?: string;
}

/**
 * ComingSoonCard - Elegant placeholder for features in development
 */
export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  accent = 'violet',
  title = 'Coming Soon',
  description = "We're crafting something special. This feature is currently in development.",
  features = [],
  className = '',
}) => {
  const config = ACCENT_CONFIG[accent];

  return (
    <div className={`relative min-h-[60vh] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Atmospheric Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, ${config.glow} 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 80%, ${config.glow} 0%, transparent 40%),
            radial-gradient(ellipse 50% 30% at 20% 60%, ${config.glow} 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating Orbs */}
      <div
        className={`absolute w-72 h-72 rounded-full bg-gradient-to-br ${config.orb1} blur-3xl`}
        style={{
          top: '10%',
          left: '15%',
          animation: 'float1 20s ease-in-out infinite',
        }}
      />
      <div
        className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${config.orb2} blur-3xl`}
        style={{
          bottom: '5%',
          right: '10%',
          animation: 'float2 25s ease-in-out infinite',
        }}
      />
      <div
        className={`absolute w-64 h-64 rounded-full bg-gradient-to-br ${config.orb3} blur-3xl`}
        style={{
          top: '40%',
          right: '25%',
          animation: 'float3 18s ease-in-out infinite',
        }}
      />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${config.primary}20 1px, transparent 1px),
            linear-gradient(90deg, ${config.primary}20 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Icon Badge */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8"
          style={{
            background: `linear-gradient(135deg, ${config.primary}15 0%, ${config.secondary}10 100%)`,
            boxShadow: `0 8px 32px -8px ${config.primary}30, inset 0 1px 0 ${config.secondary}20`,
          }}
        >
          <Sparkles
            size={36}
            style={{ color: config.primary }}
            className="animate-pulse"
          />
        </div>

        {/* Title */}
        <h2
          className="text-4xl sm:text-5xl xl:text-6xl text-stone-800 mb-6 tracking-tight"
          style={{
            fontFamily: "'Tiempos Headline', Georgia, serif",
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p className="text-stone-500 text-lg sm:text-xl xl:text-2xl mb-10 leading-relaxed max-w-xl mx-auto">
          {description}
        </p>

        {/* Feature Pills */}
        {features.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="px-5 py-2.5 rounded-full text-sm sm:text-base font-medium"
                style={{
                  background: `linear-gradient(135deg, ${config.primary}08 0%, ${config.secondary}05 100%)`,
                  border: `1px solid ${config.primary}15`,
                  color: config.primary,
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Status Indicator */}
        <div className="mt-12 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-stone-100/80">
          <div className="relative flex h-3 w-3">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: config.primary }}
            />
            <span
              className="relative inline-flex rounded-full h-3 w-3"
              style={{ backgroundColor: config.primary }}
            />
          </div>
          <span className="text-stone-600 text-sm font-medium">In Development</span>
        </div>
      </div>

      {/* CSS Keyframes for floating animation */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 10px) scale(1.02); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(30px, -20px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, -30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ComingSoonCard;
