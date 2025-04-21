import React, { useEffect, useState, useRef } from "react";
import { Howl } from "howler";

const Menu = ({ onStartGame }) => {
	const [isAnimating, setIsAnimating] = useState(true);
	const menuMusicRef = useRef(null);

	// Create a Howl instance for the sound
	const startSound = new Howl({
		src: ["/sounds/Start_Game.wav"],
		volume: 0.8,
	});

	const hoverSound = new Howl({
		src: ["/sounds/Menu_Click.wav"],
		volume: 0.5,
	});

	useEffect(() => {
		// Create and play menu music when component mounts
		menuMusicRef.current = new Howl({
			src: ["/sounds/Menu_Music.wav"],
			loop: true,
			volume: 0.5,
			autoplay: true,
		});

		// Clean up when component unmounts
		return () => {
			if (menuMusicRef.current) {
				menuMusicRef.current.stop();
			}
		};
	}, []);

	const menuStyles = {
		position: "absolute",

		top: "50%",
		left: "50%",
		width: "100%",
		height: "100%",
		transform: "translate(-50%, -50%)",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		backgroundImage: "url('/Sega_menu.png')",
		backgroundSize: "65%",
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 2000,
	};

	const buttonStyles = {
		padding: "15px 30px",
		fontSize: "24px",
		backgroundColor: "#ff6b6b",
		color: "#ffffff",
		border: "4px solid #333333",
		borderRadius: "0px",
		cursor: "pointer",
		marginBottom: "20px",
		boxShadow: "6px 6px 0px #000000",
		fontFamily: "'Press Start 2P', 'Courier New', monospace",
		textTransform: "uppercase",
		letterSpacing: "2px",
		imageRendering: "pixelated",
		transition: "all 0.1s",
		marginLeft: "10%",
		animation: isAnimating ? "pulse 1.5s infinite alternate" : "none",
	};

	const instructionsStyles = {
		color: "#f8f878",
		fontSize: "16px",
		textAlign: "center",

		fontFamily: "'Press Start 2P', 'Courier New', monospace",
		lineHeight: "1.8",
		textShadow: "2px 2px 0px #000000",
		padding: "15px",
		border: "3px solid #f8f878",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		imageRendering: "pixelated",
		marginBottom: "12%",
		marginLeft: "10%",
	};

	const handleHover = (e) => {
		e.target.style.backgroundColor = "#ff8e8e";
		e.target.style.transform = "translate(-2px, -2px)";
		e.target.style.boxShadow = "8px 8px 0px #000000";
		setIsAnimating(false);
		hoverSound.play();
	};

	const handleMouseOut = (e) => {
		e.target.style.backgroundColor = "#ff6b6b";
		e.target.style.transform = "translate(0, 0)";
		e.target.style.boxShadow = "6px 6px 0px #000000";
		setIsAnimating(true);
	};

	const handleStartGame = () => {
		// Stop menu music when game starts
		if (menuMusicRef.current) {
			menuMusicRef.current.stop();
		}

		startSound.play();
		onStartGame();
	};

	return (
		<div style={menuStyles}>
			<style>
				{`
					@keyframes pulse {
						0% { transform: scale(1); }
						100% { transform: scale(1.05); box-shadow: 0 0 15px #ff9d9d; }
					}
				`}
			</style>
			<button style={buttonStyles} onClick={handleStartGame} onMouseOver={handleHover} onMouseOut={handleMouseOut}>
				Start Game
			</button>
			<div style={instructionsStyles}>
				<p>
					Controls:
					<br />
					W or Arrow Up: Jump
					<br />
					A/D or Arrow Left/Right: Move
					<br />
					Left Mouse: Shoot
					<br />
				</p>
			</div>
		</div>
	);
};

export default Menu;
