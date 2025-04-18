import React, { useEffect, useRef, useState } from 'react';
import { init, startRendering } from './js/index.js';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setPlayerDead, setTimeTaken, incrementScore, collectGem, setMonsterKilled } from '../../store/playerSlice';

let gameInitialized = false;
let gameLoop = null;

export default function Game() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    console.log("Mounting Game component...");

    if (gameInitialized) return;
    gameInitialized = true;

    // Start timer
    timerRef.current = setInterval(() => {
      setGameTime(prevTime => prevTime + 1);
    }, 1000);

    const waitForCanvas = () => {
      window.gameCanvas = canvas;
      window.isGameOver = false;

      try {
        init();
        startRendering();
        console.log("✅ Game initialized!");
      } catch (error) {
        console.error("❌ Error during game initialization:", error);
      }
    };

    waitForCanvas();

    // Cleanup function
    return () => {
      if (gameLoop) {
        cancelAnimationFrame(gameLoop);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      gameInitialized = false;
    };
  }, []);

  const handleResultsClick = () => {
    setIsGameOver(true);
    window.isGameOver = true;
    if (gameLoop) {
      cancelAnimationFrame(gameLoop);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Update Redux store with game stats
    dispatch(setPlayerDead()); // Since we're in game over screen
    dispatch(setTimeTaken(gameTime));
    
    // Update score if available
    if (window.gameScore) {
      dispatch(incrementScore(window.gameScore));
    }

    // Update gems collected
    if (window.gemsCollected) {
      // If gemsCollected is a number, add that many gems
      for (let i = 0; i < window.gemsCollected; i++) {
        dispatch(collectGem());
      }
    }

    // Update monster status if available
    if (window.monsterKilled) {
      dispatch(setMonsterKilled());
    }

    // Navigate to results screen
    navigate('/results');
  };

  return (
    <div className="game-wrapper">
     <div id="healthContainer" className={isGameOver ? 'backdrop-blur-[2px]' : ''}>
      <span id="healthText">Health:</span>
      <div id="healthBarBackground">
          <div id="healthBarFill"></div>
      </div>
    </div> 

      <canvas
        style={{ 
          imageRendering: 'pixelated',
          filter: isGameOver ? 'blur(2px)' : 'none',
          pointerEvents: isGameOver ? 'none' : 'auto'
        }}
        ref={canvasRef}
      ></canvas>
      
      <div id="gameOverScreen" className={`${isGameOver ? 'flex' : 'hidden'} fixed inset-0 flex flex-col items-center justify-center z-50`}>
    
    {/* Fullscreen Black Background */}
    <div className="absolute inset-0 bg-black opacity-90 z-0"></div>

    <div className="game-over-content relative p-10 rounded-3xl max-w-lg w-full text-center backdrop-blur-[10px] z-10">
        {/* Red Border Glow */}
        <div className="absolute inset-0 border-4 border-red-600/30 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-red-800/30 rounded-3xl"></div>

        {/* Content */}
        <div className="relative z-10 space-y-10">
            {/* Contra-Style Title */}
            <div className="relative">
                <h1 className="text-9xl font-black text-red-600 tracking-tight">
                    GAME OVER
                </h1>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/40 to-transparent"></div>
            </div>

            {/* Stats Container */}
            <div className="bg-black/60 p-10 rounded-2xl border-2 border-red-600/30 ">
                <div className="grid grid-cols-2 gap-8">
                    {/* <div className="text-left">
                        <p className="text-red-400 text-sm uppercase tracking-widest font-bold">RANK</p>
                        <p className="text-6xl font-black text-red-500 mt-2">#2</p>
                    </div> */}
                    <div className="text-left">
                        <p className="text-red-400 text-sm uppercase tracking-widest font-bold">SCORE</p>
                        <p className="text-6xl font-black text-red-500 mt-2">1500</p>
                    </div>
                </div>
            </div>

            {/* Contra-Style Button */}
            <button 
                onClick={handleResultsClick}
                className="w-full py-6 px-10 bg-red-600 text-white font-bold rounded-2xl 
                         hover:bg-red-500 transform hover:scale-[1.02] transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black/50
                         shadow-lg hover:shadow-red-500/25 active:scale-95 border-2 border-red-700 "
            >
                <span className="flex items-center justify-center gap-3 text-xl uppercase tracking-wider">
                    View Results
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </button>
        </div>
    </div>
</div>





    </div>
  );
}
