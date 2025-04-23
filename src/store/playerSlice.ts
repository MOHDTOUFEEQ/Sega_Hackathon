import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  score: number;
  gems: number;
  isDead: boolean;
  killedMonster: boolean;
  timeTaken: number;
  startTime: number;
  endingTime: number; 
  health: number;
  username: string;
}

const initialState: PlayerState = {
  score: 0,
  gems: 0,
  health: 100,
  isDead: false,
  username: "Kris",
  killedMonster: false,
  timeTaken: 0,
  startTime: 0,
  endingTime: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    incrementScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    collectGem: (state, action: PayloadAction<number>) => {
      state.gems = action.payload;
    },
    setPlayerDead: (state) => {
      state.isDead = true;
    },  
    setHealth: (state, action: PayloadAction<number>) => {
      state.health = action.payload;
    },
    setMonsterKilled: (state, action: PayloadAction<boolean>) => {
      state.killedMonster = action.payload;
    },
    setTimeTaken: (state, action: PayloadAction<number>) => {
      state.timeTaken = action.payload;
    },
    setStartTime: (state, action: PayloadAction<number>) => {
      state.startTime = action.payload;
    },
    setEndingTime: (state, action: PayloadAction<number>) => {
      state.endingTime = action.payload;
    },
    resetPlayerState: () => initialState,
  },
});

export const {
  incrementScore,
  collectGem,
  setPlayerDead,
  setHealth,
  setMonsterKilled,
  setTimeTaken,
  setStartTime,
  setEndingTime,
  resetPlayerState,
} = playerSlice.actions;

export default playerSlice.reducer; 