"use client"

import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const [gameId, setGameId] = useState("55153a8014829a865bbf700d"); // Set initial game ID or fetch it from an API

    return (
        <GameContext.Provider value={{ gameId, setGameId }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    return useContext(GameContext);
};