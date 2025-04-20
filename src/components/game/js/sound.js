import { Howl } from "howler";

const sound = {
	gun: new Howl({
		src: ["/sounds/Laser_Gun.wav"],
		loop: false,
		volume: 0.4,
	}),
	jump: new Howl({
		src: ["/sounds/Jump.wav"],
		loop: false,
		volume: 0.4,
	}),
	bump: new Howl({
		src: ["/sounds/Bump.wav"],
		loop: false,
		volume: 0.4,
	}),
	hurt: new Howl({
		src: ["/sounds/Hurt.wav"],
		loop: false,
	}),
	collect: new Howl({
		src: ["/sounds/Collect_Gem.wav"],
		loop: false,
	}),
	bumpSide: new Howl({
		src: ["/sounds/Bump_Side.wav"],
		loop: false,
	}),
	hitEnemy: new Howl({
		src: ["/sounds/Hit_Enemy.wav"],
		loop: false,
	}),
	touchFire: new Howl({
		src: ["/sounds/Touch_Fire.wav"],
		loop: false,
	}),
	playerDeath: new Howl({
		src: ["/sounds/Player_Died.wav"],
		loop: false,
	}),
	win: new Howl({
		src: ["/sounds/Win.wav"],
		loop: false,
	}),
	lowHealth: new Howl({
		src: ["/sounds/Low_Health.wav"],
		loop: false,
	}),
	soundtrack: new Howl({
		src: ["/sounds/Soundtrack.mp3"],
		loop: true,
		volume: 0.6,
	}),
};

export default sound;
