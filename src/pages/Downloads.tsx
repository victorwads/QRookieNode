import React, { useEffect } from 'react';

import Icon, { Icons } from '../components/Icons';
import type { Game } from '../bridge/games';

import gamesManager from '../bridge/games';
import GameCard from '../components/GameCard';
import downloadManager from "../bridge/download";

let hasPedingDownloadFolderSearch = false;

const Downloads: React.FC = () => {
  const [downloads, setDownloads] = React.useState<Game[]>([]);
  const [downloading, setDownloading] = React.useState<Game[]>([]);

  const updateDownloadedGames = async () => {
    if(hasPedingDownloadFolderSearch)
      return;
    const result = await gamesManager.getDownloadedGames().finally(() => {
      hasPedingDownloadFolderSearch = false;
    })
    setDownloads(result
      .map(id => gamesManager.getGameFromCacheById(id))
      .filter(game => game) as Game[]
    );
  };

  useEffect(() => {
    return downloadManager.addDownloadingListener((ids) => {
      updateDownloadedGames();
      setDownloading(ids
        .map(id => gamesManager.getGameFromCacheById(id))
        .filter(game => game) as Game[]
      );
    });
  }, []);

  return <>
    <h1><Icon icon={Icons.solid.faDownload} size="lg" />Downloads Page</h1>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{flex: 1}}>
        <h2>Downloading Games</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {downloading.map(game => <GameCard game={game} key={game.id}/>)}
        </div>
      </div>
      <div style={{flex: 1}}>
        <h2>Downloaded Games</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {downloads.map(game => <GameCard game={game} key={game.id}/>)}
        </div>
      </div>
    </div>
  </>;
};

export default Downloads;