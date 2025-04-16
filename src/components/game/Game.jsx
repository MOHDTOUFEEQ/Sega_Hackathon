import React, { useEffect, useRef } from 'react';
import { init, startRendering } from './js/index.js';
import '../../App.css';

export default function Game() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const dpr = 2;
    canvas.width = 1024 * dpr;
    canvas.height = 576 * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100vh';

    // Initialize game after canvas is ready
    const initializeGame = () => {
      try {
        // Pass the canvas to the game engine
        window.gameCanvas = canvas;
        init();
        startRendering();
      } catch (error) {
        console.error('Error initializing game:', error);
      }
    };

    // Use a small delay to ensure canvas is fully mounted
    const timer = setTimeout(initializeGame, 100);

    // Add event listeners for visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.gameCanvas = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="game-wrapper">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
} 