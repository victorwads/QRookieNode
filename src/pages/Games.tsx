import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "./GameCard.css";
import sendCommand, { GamesCommandName, GamesCommandPayload, Game } from '../bridge';
import GameCard from '../components/GameCard';
import { CenteredLoading } from './Loading';

let cache: Game[] = [];
const Games: React.FC = () => {
  const [result, setResult] = React.useState<Game[]>(cache);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getAdbDevices = async () => {
    const result = sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: 'games',
    });
    cache = await result;
    setResult(cache);
  };

  useEffect(() => {
    getAdbDevices();
  }, []);

  if(result.length > 0 && id) {
    const game = result.find(game => game.packageName === id)!;
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <h1>{game.name}</h1>
      <span><strong>Category:</strong> {game.category}</span>
      <span><strong>Version:</strong> {game.version}</span>
      <span><strong>Last Updated:</strong> {game.lastUpdated}</span>
      <span><strong>Package Name:</strong> {game.packageName}</span>
      <div className='horizontal-display' style={{ justifyContent: 'center', flex: 1 }}>
        <GameCard game={game} />
      </div>
    </div>
  }

  return<div className="game-list">
    {result.length === 0
      ? <CenteredLoading />
      : result
        .filter((_, i) => i < 250)
        .map((game) =>
          <GameCard key={game.id} game={game} onSelect={game => navigate(game.packageName ?? "")} />
        )}
  </div>;
};

export default Games;