import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Results.css';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const Results = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayGems, setDisplayGems] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);

  // Get state from Redux store
  const { score, gems, timeTaken, isDead, killedMonster } = useAppSelector((state) => state.player);
  const overallScore = score + gems * 10 - timeTaken;

  useEffect(() => {
    setIsVisible(true);
    
    // Animate score counting
    const scoreInterval = setInterval(() => {
      setDisplayScore(prev => {
        const step = Math.ceil(score / 20);
        return prev + step > score ? score : prev + step;
      });
    }, 50);

    // Animate gems counting
    const gemsInterval = setInterval(() => {
      setDisplayGems(prev => {
        const step = Math.ceil(gems / 20);
        return prev + step > gems ? gems : prev + step;
      });
    }, 50);

    // Animate time counting
    const timeInterval = setInterval(() => {
      setDisplayTime(prev => {
        const step = Math.ceil(timeTaken / 20);
        return prev + step > timeTaken ? timeTaken : prev + step;
      });
    }, 50);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(gemsInterval);
      clearInterval(timeInterval);
    };
  }, [score, gems, timeTaken]);

  return (
    <motion.div 
      className="results-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="background-overlay" />
      
      <motion.div 
        className="results-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1 
          className="game-finished-text"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {!killedMonster ? 'Game Over' : 'Mission Complete'}
        </motion.h1>

        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3>Final Score</h3>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
            <p className="stat-value">{overallScore}</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3>Gems Collected</h3>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.9 }}
              />
            </div>
            <p className="stat-value">{gems}</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3>Monster Status</h3>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 1 }}
              />
            </div>
            <p className="stat-value">{killedMonster ? 'Defeated' : 'Alive'}</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h3>Time Taken</h3>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 1.1 }}
              />
            </div>
            <p className="stat-value">{displayTime}s</p>
          </motion.div>
        </div>

        <div className="action-buttons">
          <motion.button
            className="action-button secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            onClick={() => navigate('/')}
          >
            Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Results; 