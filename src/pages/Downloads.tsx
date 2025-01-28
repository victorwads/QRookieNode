import React, { useEffect } from 'react';

import Icon, { Icons } from '../components/Icons';
import type { Game } from '../bridge/games';

import gamesManager from '../bridge/games';
import GameCard from '../components/GameCard';
import downloadManager from "../bridge/download";

const Downloads: React.FC = () => {
  const [downloads, setDownloads] = React.useState<Game[]>([]);
  const [downloading, setDownloading] = React.useState<Game[]>([]);

  useEffect(() => {
    return downloadManager.addDownloadingListener((ids) => {
      gamesManager.getDownloadedGames().then(result => {
        console.log("Downloaded games", result);
        setDownloads(result);
      });
      setDownloading(ids
        .map(id => gamesManager.getGameFromCacheById(id))
        .filter(game => game) as Game[]
      );
    });
  }, []);

  return <>
    <h1><Icon icon={Icons.solid.faDownload} size="lg" />Downloads Page</h1>
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {downloading.map(game => <GameCard game={game} key={game.id}/>)}
    </div>
    <h1>Downloaded Games</h1>
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {downloads.map(game => <GameCard game={game} key={game.id}/>)}
    </div>
  </>;
};

export default Downloads;