import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// ============================================================================
// TYPES
// ============================================================================

interface PiPCopyWidgetProps {
  firstName: string;
  lastName: string;
  email: string;
  ehrName: string;
  ehrUrl?: string;
  onComplete: () => void;
  onClose: () => void;
}

interface CopyFieldProps {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  highlight?: boolean;
}

// ============================================================================
// COPY FIELD COMPONENT
// ============================================================================

const CopyField: React.FC<CopyFieldProps> = ({ label, value, copied, onCopy, highlight = false }) => (
  <div className="pip-copy-field">
    <div className="pip-copy-field-info">
      <span className="pip-copy-field-label">{label}</span>
      <span className={`pip-copy-field-value ${highlight ? 'highlight' : ''}`}>{value}</span>
    </div>
    <button
      onClick={onCopy}
      className={`pip-copy-button ${copied ? 'copied' : ''}`}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  </div>
);

// ============================================================================
// MAIN PIP WIDGET COMPONENT
// ============================================================================

const PiPCopyWidgetContent: React.FC<PiPCopyWidgetProps> = ({
  firstName,
  lastName,
  email,
  ehrName,
  ehrUrl,
  onComplete,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set());
  const [ehrOpened, setEhrOpened] = useState(false);

  const handleOpenEhr = () => {
    if (ehrUrl) {
      window.open(ehrUrl, '_blank');
      setEhrOpened(true);
    }
  };

  const handleCopy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setCopiedFields(prev => new Set([...prev, field]));
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const allCopied = copiedFields.size === 3;

  return (
    <div className="pip-widget">
      {/* Header */}
      <div className="pip-header">
        <div className="pip-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Cortexa</span>
        </div>
        <button onClick={onClose} className="pip-close-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="pip-instructions">
        <p>Copy these into <strong>{ehrName}</strong></p>
      </div>

      {/* Copy Fields */}
      <div className="pip-fields">
        <CopyField
          label="First Name"
          value={firstName}
          copied={copiedField === 'firstName'}
          onCopy={() => handleCopy('firstName', firstName)}
        />
        <CopyField
          label="Last Name"
          value={lastName}
          copied={copiedField === 'lastName'}
          onCopy={() => handleCopy('lastName', lastName)}
        />
        <CopyField
          label="Email"
          value={email}
          copied={copiedField === 'email'}
          onCopy={() => handleCopy('email', email)}
          highlight
        />
      </div>

      {/* Progress indicator */}
      <div className="pip-progress">
        <div className="pip-progress-dots">
          <div className={`pip-progress-dot ${copiedFields.has('firstName') ? 'filled' : ''}`} />
          <div className={`pip-progress-dot ${copiedFields.has('lastName') ? 'filled' : ''}`} />
          <div className={`pip-progress-dot ${copiedFields.has('email') ? 'filled' : ''}`} />
        </div>
        <span className="pip-progress-text">
          {copiedFields.size}/3 copied
        </span>
      </div>

      {/* Complete Button */}
      <button
        onClick={onComplete}
        className={`pip-complete-button ${allCopied ? 'ready' : ''}`}
      >
        {allCopied ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            I've Added the Biller
          </>
        ) : (
          "I've Added the Biller"
        )}
      </button>

      {/* Role reminder */}
      <p className="pip-reminder">
        Select <strong>"Biller"</strong> as role • No permissions needed
      </p>
    </div>
  );
};

// ============================================================================
// PIP STYLES - Injected into PiP window
// ============================================================================

const getPiPStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Suisse Intl', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%);
    color: #fafaf9;
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }

  .pip-widget {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 100vh;
  }

  /* Header */
  .pip-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pip-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f5f5f4;
    font-weight: 600;
    font-size: 15px;
  }

  .pip-logo svg {
    color: #f59e0b;
  }

  .pip-close-button {
    background: transparent;
    border: none;
    color: #78716c;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .pip-close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fafaf9;
  }

  /* Open EHR Button */
  .pip-open-ehr-button {
    width: 100%;
    background: #f59e0b;
    border: none;
    color: #1c1917;
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s ease;
  }

  .pip-open-ehr-button:hover {
    background: #fbbf24;
    transform: scale(1.01);
  }

  .pip-open-ehr-button:active {
    transform: scale(0.99);
  }

  /* Instructions */
  .pip-instructions {
    text-align: center;
    padding: 8px 0;
  }

  .pip-instructions p {
    font-size: 13px;
    color: #a8a29e;
  }

  .pip-instructions strong {
    color: #fafaf9;
  }

  /* Copy Fields */
  .pip-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pip-copy-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(41, 37, 36, 0.6);
    border: 1px solid rgba(68, 64, 60, 0.5);
    border-radius: 10px;
    padding: 10px 12px;
    transition: all 0.15s ease;
  }

  .pip-copy-field:hover {
    border-color: rgba(68, 64, 60, 0.8);
    background: rgba(41, 37, 36, 0.8);
  }

  .pip-copy-field-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .pip-copy-field-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #78716c;
    font-weight: 500;
  }

  .pip-copy-field-value {
    font-size: 14px;
    color: #fafaf9;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pip-copy-field-value.highlight {
    color: #fbbf24;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
  }

  .pip-copy-button {
    background: #f59e0b;
    border: none;
    color: #1c1917;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .pip-copy-button:hover {
    background: #fbbf24;
    transform: scale(1.02);
  }

  .pip-copy-button:active {
    transform: scale(0.98);
  }

  .pip-copy-button.copied {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
  }

  /* Progress */
  .pip-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 4px 0;
  }

  .pip-progress-dots {
    display: flex;
    gap: 6px;
  }

  .pip-progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(68, 64, 60, 0.8);
    transition: all 0.2s ease;
  }

  .pip-progress-dot.filled {
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
  }

  .pip-progress-text {
    font-size: 11px;
    color: #78716c;
  }

  /* Complete Button */
  .pip-complete-button {
    width: 100%;
    background: rgba(68, 64, 60, 0.5);
    border: 1px solid rgba(68, 64, 60, 0.8);
    color: #a8a29e;
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .pip-complete-button:hover {
    background: rgba(68, 64, 60, 0.7);
    color: #fafaf9;
  }

  .pip-complete-button.ready {
    background: #f59e0b;
    border-color: #f59e0b;
    color: #1c1917;
  }

  .pip-complete-button.ready:hover {
    background: #fbbf24;
    transform: scale(1.01);
  }

  .pip-complete-button.ready:active {
    transform: scale(0.99);
  }

  /* Reminder */
  .pip-reminder {
    text-align: center;
    font-size: 11px;
    color: #57534e;
  }

  .pip-reminder strong {
    color: #78716c;
  }
`;

// ============================================================================
// AUDIBLE AUDIO HOOK - Plays sound via <audio> element for auto-PiP
// Chrome requires media to be playing through an HTML media element
// ============================================================================

export const useAudibleAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const startAudibleAudio = useCallback(() => {
    if (audioRef.current) return; // Already started

    try {
      console.log('[Cortexa PiP] Creating audio element for auto-PiP...');

      // Create a short beep sound as a data URL (440Hz for 0.3s)
      // This is a tiny WAV file encoded as base64
      const audioCtx = new AudioContext();
      const sampleRate = audioCtx.sampleRate;
      const duration = 0.3;
      const numSamples = sampleRate * duration;

      // Create buffer
      const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
      const channel = buffer.getChannelData(0);

      // Generate 440Hz tone with fade
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 8); // Quick fade out
        channel[i] = Math.sin(2 * Math.PI * 440 * t) * envelope * 0.1; // 10% volume
      }

      // Convert to WAV blob
      const wavBlob = audioBufferToWav(buffer);
      const audioUrl = URL.createObjectURL(wavBlob);

      // Create audio element
      const audio = new Audio(audioUrl);
      audio.volume = 0.15; // 15% volume - subtle
      audioRef.current = audio;

      // Play the sound
      audio.play().then(() => {
        console.log('[Cortexa PiP] Audio playing - registering for auto-PiP');
        setIsReady(true);
      }).catch(err => {
        console.error('[Cortexa PiP] Audio play failed:', err);
      });

      // Clean up URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log('[Cortexa PiP] Audio ended');
      };

      audioCtx.close();
    } catch (error) {
      console.error('[Cortexa PiP] Failed to start audible audio:', error);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsReady(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return { isReady, startAudibleAudio, stopAudio };
};

// Helper: Convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write samples
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// ============================================================================
// AUTOMATIC PIP HOOK - Registers media session handler
// ============================================================================

export const useAutoPiP = (onPiPTriggered: () => void, enabled: boolean) => {
  const callbackRef = useRef(onPiPTriggered);
  callbackRef.current = onPiPTriggered;

  useEffect(() => {
    if (!enabled) return;
    if (!('mediaSession' in navigator)) {
      console.log('[Cortexa PiP] Media Session API not supported');
      return;
    }

    console.log('[Cortexa PiP] Registering enterpictureinpicture handler...');

    navigator.mediaSession.setActionHandler('enterpictureinpicture', () => {
      console.log('[Cortexa PiP] Auto PiP triggered by tab switch!');
      callbackRef.current();
    });

    return () => {
      console.log('[Cortexa PiP] Removing enterpictureinpicture handler');
      navigator.mediaSession.setActionHandler('enterpictureinpicture', null);
    };
  }, [enabled]);
};

// ============================================================================
// PIP LAUNCHER HOOK
// ============================================================================

interface UsePiPOptions {
  firstName: string;
  lastName: string;
  email: string;
  ehrName: string;
  ehrUrl: string;
  onComplete: () => void;
}

export const usePictureInPicture = ({
  firstName,
  lastName,
  email,
  ehrName,
  ehrUrl,
  onComplete,
}: UsePiPOptions) => {
  const pipWindowRef = useRef<Window | null>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const [autoPiPEnabled, setAutoPiPEnabled] = useState(false);

  // Audible audio for automatic PiP (Chrome 134+ requires audible media)
  const { isReady: audioReady, startAudibleAudio, stopAudio } = useAudibleAudio();

  const isPiPSupported = useCallback(() => {
    return 'documentPictureInPicture' in window;
  }, []);

  const closePiP = useCallback(() => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
    }
    pipWindowRef.current = null;
    rootRef.current = null;
    stopAudio();
    setAutoPiPEnabled(false);
  }, [stopAudio]);

  const handleComplete = useCallback(() => {
    closePiP();
    onComplete();
  }, [closePiP, onComplete]);

  // Core PiP opening logic (called by auto-trigger or manually)
  const createPiPWindow = useCallback(async () => {
    console.log('[Cortexa PiP] Creating PiP window...');

    if (!isPiPSupported()) {
      console.log('[Cortexa PiP] Document PiP not supported, using fallback');
      // Fallback to popup
      const width = 340;
      const height = 480;
      const left = window.screen.width - width - 40;
      const top = 80;

      const popup = window.open(
        '',
        'cortexa-pip',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
      );

      if (popup) {
        pipWindowRef.current = popup;
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cortexa - Copy Details</title>
              <style>${getPiPStyles()}</style>
            </head>
            <body>
              <div id="pip-root"></div>
            </body>
          </html>
        `);
        popup.document.close();

        const container = popup.document.getElementById('pip-root');
        if (container) {
          rootRef.current = createRoot(container);
          rootRef.current.render(
            <PiPCopyWidgetContent
              firstName={firstName}
              lastName={lastName}
              email={email}
              ehrName={ehrName}
              onComplete={handleComplete}
              onClose={closePiP}
            />
          );
        }
      }
      return;
    }

    try {
      // @ts-ignore - Document PiP API types not yet in TypeScript
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 340,
        height: 460,
      });

      if (!pipWindow) {
        console.error('[Cortexa PiP] PiP window is null');
        return;
      }

      console.log('[Cortexa PiP] PiP window created successfully!');
      pipWindowRef.current = pipWindow;

      // Inject styles
      const style = pipWindow.document.createElement('style');
      style.textContent = getPiPStyles();
      pipWindow.document.head.appendChild(style);

      // Add Google Fonts
      const fontLink = pipWindow.document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
      pipWindow.document.head.appendChild(fontLink);

      // Create mount point
      const container = pipWindow.document.createElement('div');
      container.id = 'pip-root';
      pipWindow.document.body.appendChild(container);

      // Mount React component (no ehrUrl - tab is already open)
      rootRef.current = createRoot(container);
      rootRef.current.render(
        <PiPCopyWidgetContent
          firstName={firstName}
          lastName={lastName}
          email={email}
          ehrName={ehrName}
          onComplete={handleComplete}
          onClose={closePiP}
        />
      );

      // Handle PiP window close
      pipWindow.addEventListener('pagehide', () => {
        pipWindowRef.current = null;
        rootRef.current = null;
      });
    } catch (error) {
      console.error('[Cortexa PiP] Failed to open Document PiP:', error);
    }
  }, [firstName, lastName, email, ehrName, isPiPSupported, handleComplete, closePiP]);

  // Register auto PiP handler
  useAutoPiP(createPiPWindow, autoPiPEnabled && audioReady);

  // Main function: Opens PiP first, user clicks button inside to open EHR
  // (Auto-PiP requires Media Engagement Index which new users won't have)
  const openPiPFirst = useCallback(async () => {
    console.log('[Cortexa PiP] Opening PiP (two-click flow)...');
    await createPiPWindow();
  }, [createPiPWindow]);

  // Legacy manual open (for fallback or testing)
  const openPiP = useCallback(async () => {
    console.log('[Cortexa PiP] Manual PiP open...');
    await createPiPWindow();
  }, [createPiPWindow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePiP();
    };
  }, [closePiP]);

  return {
    openPiP: openPiPFirst,
    closePiP,
    isPiPSupported: isPiPSupported(),
  };
};

export default PiPCopyWidgetContent;
