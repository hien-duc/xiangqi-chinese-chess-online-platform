"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Lobby.module.css";
import { FaUsers } from "react-icons/fa";
import { RiComputerLine } from "react-icons/ri";
import { GiChessKnight } from "react-icons/gi";
import { IoSchoolOutline } from "react-icons/io5";
import { MdOndemandVideo } from "react-icons/md";
import PlayModal from "@/components/game/modals/PlayModal";
import { useSession } from "next-auth/react";

export default function LobbyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handlePlayOnlineClick = async () => {
    if (status === "loading") return;

    if (session?.user) {
      router.push("games");
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Welcome to
          <span className={styles.highlight}>Xiangqi.com!</span>
        </h1>

        <div className={styles.optionsGrid}>
          <div
            className={`${styles.option} ${
              status === "loading" ? styles.loading : ""
            }`}
            onClick={handlePlayOnlineClick}
          >
            <div className={styles.iconWrapper}>
              <FaUsers className={styles.icon} />
            </div>
            <h2>Play Online</h2>
            <p>Play chess with players around the world</p>
          </div>

          <Link href="/play/computer" className={styles.option}>
            <div className={styles.iconWrapper}>
              <RiComputerLine className={styles.icon} />
            </div>
            <h2>Play Computer</h2>
            <p>Test your skills against AI</p>
          </Link>

          <Link href="#" className={styles.option}>
            <div className={styles.iconWrapper}>
              <GiChessKnight className={styles.icon} />
            </div>
            <h2>Puzzles</h2>
            <p>Solve chess puzzles to improve your game</p>
          </Link>

          <Link href="#" className={styles.option}>
            <div className={styles.iconWrapper}>
              <IoSchoolOutline className={styles.icon} />
            </div>
            <h2>Learn</h2>
            <p>Learn how to play Chinese Chess</p>
          </Link>

          <Link href="/watch" className={styles.option}>
            <div className={styles.iconWrapper}>
              <MdOndemandVideo className={styles.icon} />
            </div>
            <h2>Watch</h2>
            <p>Watch games from other players</p>
          </Link>
        </div>
      </div>

      <PlayModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
