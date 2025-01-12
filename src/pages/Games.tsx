import React, { useEffect } from 'react';

import "./GameCard.css";
import sendCommand, { GamesCommandName, GamesCommandPayload, Game } from '../bridge';

function formatSize(size: number): string {
  if (size >= 1e9) return `${(size / 1e9).toFixed(2)} GB`;
  if (size >= 1e6) return `${(size / 1e6).toFixed(2)} MB`;
  if (size >= 1e3) return `${(size / 1e3).toFixed(2)} KB`;
  return `${size} B`;
}

const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  return (
    <div className="game-card">
      <div
        className="game-card-image"
        style={{
          backgroundImage: `url("local-file://${game.image || ""}")`,
        }}
      >
        {/* <img src={'local-file://' + game.image} alt={game.name} /> */}
      </div>
      <div className="game-card-content">
        <h3 className="game-card-title">{game.normalName || game.name}</h3>
        <p className="game-card-subtitle">{game.name}</p>
        <p className="game-card-category">{game.category}</p>
        <p className="game-card-size">{formatSize(game.size)}</p>
      </div>
    </div>
  );
};

const Games: React.FC = () => {
  const [result, setResult] = React.useState<Game[]>([]);

  const getAdbDevices = async () => {
    const result = sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: 'games',
    });
    setResult(await result);
  };

  useEffect(() => {
    getAdbDevices();
  }, []);

  return<div className="game-list">
    {result.map((game) => (
      <GameCard key={game.id} game={game} />
    ))}
  </div>;
};

export default Games;