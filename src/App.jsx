import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const navigate = useNavigate(); // ⬅️ for navigation

  const handleStartGame = () => {
    navigate('/Game'); // ⬅️ navigate to the Game route
  };

  return (
    <div className="App">
      <div className="start-screen">
        <div className="start-screen-content">
          <h1 className="game-title">Welcome to the Game!</h1>
          <p className="game-description">
            Get ready to experience an amazing adventure! Click below to start the game.
          </p>
          <button className="start-button" onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
