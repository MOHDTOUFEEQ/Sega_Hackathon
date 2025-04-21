import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./components/Menu";
import Game from "./components/game/Game";
import "./App.css";

function App() {
	const navigate = useNavigate();
	const [showGame, setShowGame] = useState(false);

	const handleStartGame = () => {
		setShowGame(true);
	};

	return <div className="App">{!showGame ? <Menu onStartGame={handleStartGame} /> : <Game />}</div>;
}

export default App;
