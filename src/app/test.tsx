
"use client"

import { useState, useCallback } from 'react';
// import styles from "../styles/Page.module.css";
import XiangqiBoard from "../components/XiangqiBoard";
import '../styles/xiangqiground.css';
import "./globals.css"

export default function Home() {
    const [fen, setFen] = useState('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR');
    const [turn, setTurn] = useState<'white' | 'black'>('white');

    const handleMove = useCallback((orig: string, dest: string, metadata: any) => {
        console.log('Move made:', orig, dest, metadata);
        // For testing premoves
        if (metadata.premove) {
            console.log('This was a premove!');
        }
        // Update turn
        setTurn(turn === 'white' ? 'black' : 'white');
        // Here you would normally calculate the new FEN
        // For now, we'll just update it to show state is shared
        setFen(prev => prev + ' moved');
    }, [turn]);

    const sharedConfig = {
        fen,
        turnColor: turn,
        movable: {
            free: false,
            events: {
                after: handleMove
            }
        },
        premovable: {
            enabled: true,
            showDests: true,
            events: {
                set: (orig: string, dest: string) => {
                    console.log('Premove set:', orig, dest);
                },
                unset: () => {
                    console.log('Premove unset');
                }
            }
        }
    };

    return (
        <div className="flex gap-8 p-4">
            <div>
                <h2>White&apos;s View</h2>
                <XiangqiBoard
                    config={{
                        ...sharedConfig,
                        orientation: 'white',
                        movable: {
                            ...sharedConfig.movable,
                            color: turn
                        }
                    }}
                />
            </div>
            <div>
                <h2>Black&apos;s View</h2>
                <XiangqiBoard
                    config={{
                        ...sharedConfig,
                        orientation: 'black',
                        movable: {
                            ...sharedConfig.movable,
                            color: turn
                        }
                    }}
                />
            </div>
        </div>
    );
}
