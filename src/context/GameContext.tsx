"use client"

import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const [gameId, setGameId] = useState("your_initial_game_id"); // Set initial game ID or fetch it from an API

    return (
        <GameContext.Provider value={{ gameId, setGameId }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    return useContext(GameContext);
};