import React, { useEffect, useRef, useState, useCallback } from 'react';

// CareerBridge Signature Color Palettes - Red Noir Theme First
const CB_PALETTES = [
  {
    name: 'Red Noir',
    tubes: ['#ef233c', '#d90429', '#ff4d6d'],
    lights: ['#ef233c', '#ff758f', '#ffffff', '#800f2f']
  },
  {
    name: 'Electric Orbit',
    tubes: ['#4169E1', '#7557E8', '#38BDF8'],
    lights: ['#60A5FA', '#C084FC', '#38BDF8', '#818CF8']
  },
  {
    name: 'Cyber Aurora',
    tubes: ['#06B6D4', '#3B82F6', '#8B5CF6'],
    lights: ['#22D3EE', '#60A5FA', '#A78BFA', '#F472B6']
  },
  {
    name: 'Emerald Matrix',
    tubes: ['#10B981', '#06B6D4', '#6366F1'],
    lights: ['#34D399', '#38BDF8', '#818CF8', '#FBBF24']
  }
];

const randomColors = (count) => {
  return new Array(count)
    .fill(0)
    .map(() => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

/**
 * TubesBackground - Interactive 3D WebGL background featuring neon tubes that follow the cursor.
 * Powered by threejs-components & WebGL.
 */
export function TubesBackground({
  children,
  className = '',
  enableClickInteraction = true,
  showHint = true,
  initialPalette = null,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tubesRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        // Dynamic import avoiding bundler restrictions for remote ESM modules
        const importDynamic = new Function('url', 'return import(url)');
        const module = await importDynamic(
          'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        );
        const TubesCursor = module.default;

        if (!mounted || !canvasRef.current) return;

        const defaultPal = initialPalette || CB_PALETTES[0];

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: defaultPal.tubes,
            lights: {
              intensity: 220,
              colors: defaultPal.lights
            }
          }
        });

        tubesRef.current = app;
        setIsLoaded(true);
      } catch (error) {
        console.warn('TubesCursor 3D interactive background could not be loaded from CDN:', error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (tubesRef.current) {
        try {
          if (typeof tubesRef.current.destroy === 'function') {
            tubesRef.current.destroy();
          }
        } catch (e) {
          // ignore
        }
        tubesRef.current = null;
      }
    };
  }, [initialPalette]);

  const handleClick = useCallback((e) => {
    if (!enableClickInteraction || !tubesRef.current) return;

    // Do not randomize if user clicked on an interactive link/button
    const targetTag = e.target.tagName?.toLowerCase();
    if (['button', 'a', 'input', 'select', 'textarea'].includes(targetTag) || e.target.closest('a, button')) {
      return;
    }

    try {
      const nextIndex = (currentPaletteIndex + 1) % (CB_PALETTES.length + 1);
      setCurrentPaletteIndex(nextIndex);

      let newTubes;
      let newLights;

      if (nextIndex < CB_PALETTES.length) {
        newTubes = CB_PALETTES[nextIndex].tubes;
        newLights = CB_PALETTES[nextIndex].lights;
      } else {
        newTubes = randomColors(3);
        newLights = randomColors(4);
      }

      if (tubesRef.current.tubes?.setColors) {
        tubesRef.current.tubes.setColors(newTubes);
      }
      if (tubesRef.current.tubes?.setLightsColors) {
        tubesRef.current.tubes.setLightsColors(newLights);
      }
    } catch (err) {
      console.warn('Error updating 3D tube colors:', err);
    }
  }, [enableClickInteraction, currentPaletteIndex]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '520px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #120304 0%, #050505 50%, #0d0102 100%)',
        cursor: enableClickInteraction ? 'crosshair' : 'default',
      }}
      className={`careerbridge-tubes-wrapper ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
          opacity: isLoaded ? 1 : 0.6,
          transition: 'opacity 0.8s ease',
          zIndex: 1,
        }}
      />

      {/* Atmospheric Glow Highlights - Red Noir */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '25%',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 35, 60, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '20%',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180, 20, 40, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Interactive Cursor Hint */}
      {showHint && isLoaded && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '20px',
            zIndex: 15,
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(10, 10, 12, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(239, 35, 60, 0.25)',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '0.75rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
            userSelect: 'none',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef233c',
              display: 'inline-block',
              boxShadow: '0 0 10px #ef233c',
            }}
          />
          <span>Interactive 3D Tubes • Click to switch neon</span>
        </div>
      )}

      {/* Foreground Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default TubesBackground;

