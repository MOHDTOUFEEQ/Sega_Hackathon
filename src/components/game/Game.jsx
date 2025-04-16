import React, { useEffect, useRef } from 'react';
import { init, startRendering } from './js/index.js';
import '../../App.css';

let gameInitialized = false;

export default function Game() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    console.log("Mounting Game component...");

    if (gameInitialized) return;
    gameInitialized = true;

    const dpr = 2;
    let animationFrameId;

    const waitForCanvas = () => {
      if (!canvas || canvas.clientHeight === 0 || canvas.clientWidth === 0) {
        // Wait until canvas is rendered properly in the DOM
        animationFrameId = requestAnimationFrame(waitForCanvas);
        return;
      }

      canvas.width = 1024 * dpr;
      canvas.height = 576 * dpr;
      window.gameCanvas = canvas;

      try {
        init();
        startRendering();
        console.log("✅ Game initialized!");
      } catch (error) {
        console.error("❌ Error during game initialization:", error);
      }
    };

    waitForCanvas();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.lastTime = performance.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.gameCanvas = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="game-wrapper">
      <canvas
        style={{ imageRendering: 'pixelated' }}
        ref={canvasRef}
      ></canvas>
    </div>
  );
}
