"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";
import {
  Settings,
  Moon,
  Sun,
  Volume2,
  Eye,
  Languages,
  ChevronDown,
  Save,
  Swords,
} from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "light",
    sound: true,
    pieceStyle: "traditional", // traditional, modern, chinese
    notation: "chinese", // chinese, western
    boardStyle: "wooden", // wooden, modern, minimal
    highlightMoves: true,
    language: "english",
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("gameSettings", JSON.stringify(newSettings));
  };

  const pieceStyles = [
    {
      id: "traditional",
      name: "Traditional",
      preview: "/assets/pieces/black_horse.svg",
    },
    {
      id: "modern",
      name: "Modern",
      preview: "/assets/chinese-pieces/black_horse.svg",
    },
    {
      id: "chinese",
      name: "Chinese Text",
      preview: "/assets/chinese-pieces/red_horse.svg",
    },
  ];

  const boardStyles = [
    {
      id: "wooden",
      name: "Classic Wooden",
      preview: "/assets/boards/board-default.svg",
    },
    {
      id: "modern",
      name: "Modern",
      preview: "/assets/boards/board-modern.svg",
    },
    {
      id: "minimal",
      name: "Minimal",
      preview: "/assets/boards/board-minimal.svg",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Settings className={styles.headerIcon} />
        <h1>Game Settings</h1>
      </header>

      <div className={styles.settingsGrid}>
        {/* Theme Setting */}
        <div className={styles.settingCard}>
          <h2>
            <Sun className={styles.settingIcon} />
            Theme
          </h2>
          <div className={styles.themeToggle}>
            <button
              className={`${styles.themeButton} ${
                settings.theme === "light" ? styles.active : ""
              }`}
              onClick={() => updateSettings("theme", "light")}
            >
              <Sun />
              Light
            </button>
            <button
              className={`${styles.themeButton} ${
                settings.theme === "dark" ? styles.active : ""
              }`}
              onClick={() => updateSettings("theme", "dark")}
            >
              <Moon />
              Dark
            </button>
          </div>
        </div>

        {/* Piece Style Setting */}
        <div className={styles.settingCard}>
          <h2>
            <Settings className={styles.settingIcon} />
            Piece Style
          </h2>
          <div className={styles.pieceStyleGrid}>
            {pieceStyles.map((style) => (
              <div
                key={style.id}
                className={`${styles.pieceStyleOption} ${
                  settings.pieceStyle === style.id ? styles.active : ""
                }`}
                onClick={() => updateSettings("pieceStyle", style.id)}
              >
                <div className={styles.piecePreview}>
                  <Image
                    src={style.preview}
                    alt={style.name}
                    width={60}
                    height={60}
                  />
                </div>
                <span>{style.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Board Style Setting */}
        <div className={styles.settingCard}>
          <h2>
            <Swords className={styles.settingIcon} />
            Board Style
          </h2>
          <div className={styles.boardStyleGrid}>
            {boardStyles.map((style) => (
              <div
                key={style.id}
                className={`${styles.boardStyleOption} ${
                  settings.boardStyle === style.id ? styles.active : ""
                }`}
                onClick={() => updateSettings("boardStyle", style.id)}
              >
                <div className={styles.boardPreview}>
                  <Image
                    src={style.preview}
                    alt={style.name}
                    width={120}
                    height={120}
                  />
                </div>
                <span>{style.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sound Setting */}
        <div className={styles.settingCard}>
          <h2>
            <Volume2 className={styles.settingIcon} />
            Sound
          </h2>
          <button
            className={`${styles.toggleButton} ${
              settings.sound ? styles.active : ""
            }`}
            onClick={() => updateSettings("sound", !settings.sound)}
          >
            {settings.sound ? "Sound On" : "Sound Off"}
          </button>
        </div>

        {/* Move Highlighting Setting */}
        <div className={styles.settingCard}>
          <h2>
            <Eye className={styles.settingIcon} />
            Move Highlighting
          </h2>
          <button
            className={`${styles.toggleButton} ${
              settings.highlightMoves ? styles.active : ""
            }`}
            onClick={() =>
              updateSettings("highlightMoves", !settings.highlightMoves)
            }
          >
            {settings.highlightMoves ? "Highlighting On" : "Highlighting Off"}
          </button>
        </div>

        {/* Language Setting */}
        <div className={styles.settingCard}>
          <h2>
            <Languages className={styles.settingIcon} />
            Language
          </h2>
          <div className={styles.selectWrapper}>
            <select
              value={settings.language}
              onChange={(e) => updateSettings("language", e.target.value)}
              className={styles.select}
            >
              <option value="english">English</option>
              <option value="chinese">中文</option>
              <option value="vietnamese">Tiếng Việt</option>
            </select>
            <ChevronDown className={styles.selectIcon} />
          </div>
        </div>
      </div>
    </div>
  );
}
