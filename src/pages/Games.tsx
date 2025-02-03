import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import downloadManager from '../bridge/download';
import gamesManager from '../bridge/games';
import type { Game } from '../bridge/games';

import "./Games.css";
import { CenteredLoading } from './Loading';
import Icon, { Icons } from '../components/Icons';
import GameCard from '../components/GameCard';

const Games: React.FC = () => {
  const [result, setResult] = React.useState<Game[]>(gamesManager.getCache());
  const [search, setSearch] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [limit, setLimit] = React.useState<number>(50);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getAdbDevices = async () => {
    setLoading(true);
  
    setResult(await gamesManager.getGames());
    setLoading(false);
  };

  useEffect(() => {
    getAdbDevices();
  }, []);

  const startDownloading = async (game: Game) => {
    downloadManager.downloadGame(game.id);
  }

  if (result.length > 0 && id) {
    const game = result.find(game => game.id === id)!;
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <h1>{game.name}</h1>
      <span><strong>ID:</strong> {game.id}</span>
      <span><strong>Category:</strong> {game.category}</span>
      <span><strong>Version:</strong> {game.version}</span>
      <span><strong>Last Updated:</strong> {game.lastUpdated}</span>
      <span><strong>Package Name:</strong> {game.packageName}</span>
      <div className='horizontal-display' style={{ justifyContent: 'center', flex: 1 }}>
        <GameCard game={game} onDownload={startDownloading} verbose />
      </div>
    </div>
  }

  return <>
    <div className="game-list-header">
      <Icon icon={Icons.solid.faSearch} size='xl' />
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} placeholder='Search' />
      <CenteredLoading visible={result.length === 0 || loading} />
      <strong>Limit:</strong><select onChange={e => setLimit(Number.parseInt(e.target.value))} value={`${limit}`}>
        <option value="10">10</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="250">250</option>
        <option value="500">500</option>
        <option value="1000">1000</option>
        <option value="10000">All (Not Recomended)</option>
      </select>
    </div>
    <div className="game-list">
      {result
        .map((game) => searchItemIsIncluded(search, game))
        .sort((a, b) => b.relevance - a.relevance)
        .filter(item => item.relevance > 0)
        .filter((_, i) => i < limit)
        .map((item) => item.game)
        .map((game) =>
          <GameCard key={game.id} game={game} onSelect={game => navigate(game.id ?? "")} onDownload={startDownloading} />
        )}
    </div>
  </>
};

export default Games;

interface SearchRelevance {
  relevance: number;
  game: Game;
}

const fieldToSearch: (keyof Game)[] = [
  "id",
  "category",
  "name",
  "normalName",
  "packageName",
  "version",
];

function searchItemIsIncluded(search: string, item: Game): SearchRelevance {
  search = search.trim().toLowerCase();
  const searchParts = search.split(" ");
  let relevance = 0;

  fieldToSearch.forEach((field) => {
    const fieldValue = item[field];
    if (typeof fieldValue !== "string") return;
    const fieldParts = fieldValue.toLocaleLowerCase().split(" ");
    const fieldRelevance = searchParts.reduce((acc, searchPart) => {
      return acc + fieldParts.reduce((acc, fieldPart) => {
        return acc + (fieldPart.includes(searchPart) ? 1 : 0);
      }, 0);
    }, 0);
    relevance += fieldRelevance;
  });

  return { relevance, game: item };
}