import React from "react";
import "./Games.css";

import type { Game } from "@bridge/games";

import downloadManager from "@bridge/download";
import GameCard from "@components/GameCard";

interface GameDetailsPageProps {
  game: Game;
}

const GameDetailsPage: React.FC<GameDetailsPageProps> = ({ game }: GameDetailsPageProps) => {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>{game.name}</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 35,
          padding: 25,
        }}
      >
        <GameCard game={game} onDownload={() => downloadManager.downloadGame(game.id)} verbose />
      </div>
    </>
  );
};

export default GameDetailsPage;
