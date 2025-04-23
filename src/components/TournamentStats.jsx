import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TournamentStats.css";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import statsBg from "/stats_bg.png";

const TournamentStats = () => {
	const navigate = useNavigate();
	const [isVisible, setIsVisible] = useState(false);
	const [displayScore, setDisplayScore] = useState(0);
	const [displayGems, setDisplayGems] = useState(0);
	const [displayTime, setDisplayTime] = useState(0);
	const [overallScore, setOverallScore] = useState(0);
	// Get state from Redux store
	const { score, gems, timeTaken, isDead, killedMonster, endingTime, startTime, health } = useAppSelector((state) => state.player);
	useEffect(() => {
		const calculateScore = () => {
			const timePenalty = endingTime - startTime;
			const baseScore = health + gems * 5;
			const elapsed = Math.floor(endingTime - startTime);
			setDisplayTime(elapsed);

			if (killedMonster) {
				return 100 + Math.round(baseScore - timePenalty + 75);
			} else {
				return 100 + Math.round(baseScore - timePenalty - 75);
			}
		};

		setOverallScore(calculateScore());
	}, [score, gems, endingTime, startTime, killedMonster, health]);

	return (
		<motion.div className="results-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
			{/* Red overlay */}
			<motion.div
				className="red-overlay"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(36, 109, 0, 0.2)",
					zIndex: 1,
				}}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.5 }}
			/>

			<motion.div
				className="background-overlay"
				style={{
					backgroundImage: `url(${statsBg})`,
					backgroundSize: "60%",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
				initial={{ scale: 1.4 }}
				animate={{ scale: 1 }}
				transition={{ duration: 2.5 }}
			/>

			<motion.div className="results-content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
				<motion.h1 className="game-finished-text" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
					<h3>Tournament Score</h3>
				</motion.h1>

				<div className="leaderboard-container">
					{Array.from({ length: 10 }, (_, i) => (
						<motion.div key={i} className="leaderboard-item" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}>
							<span className="player-name">Player{i + 1}</span>
							<span className="score-dots">................................</span>
							<span className="player-score">{Math.floor(150 + Math.random() * 200 - i * 15)}pts</span>
						</motion.div>
					))}
				</div>

				<div className="action-buttons">
					<motion.button className="action-button secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1.3 }} onClick={() => navigate("/")}>
						Home
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default TournamentStats;
