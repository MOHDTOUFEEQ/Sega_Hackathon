import React, { useState } from 'react';
import './App.css';
import Game from './components/game/Game.jsx';

function App() {
  const [showGame, setShowGame] = useState(false);

  const handleStartGame = () => {
    setShowGame(true);
  };

  return (
    <div className="App">
     
        <div className="game-wrapper">
          <Game />
        </div>
     
    </div>
  );
}

export default App;
