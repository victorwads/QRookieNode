import React, { useEffect } from 'react';

import type { Game } from '../bridge/games';
import gamesManager from '../bridge/games';
import downloadManager from "../bridge/download";
import settingsManager from '../bridge/settings';

import Icon, { Icons } from '../components/Icons';
import GameCard from '../components/GameCard';
import Button from '../components/Button';

let hasPedingDownloadFolderSearch = false;

const Downloads: React.FC = () => {
  const [downloads, setDownloads] = React.useState<Game[]>([]);
  const [downloading, setDownloading] = React.useState<Game[]>([]);

  const updateDownloadedGames = async () => {
    if(hasPedingDownloadFolderSearch)
      return;
    const result = await downloadManager.getDownloadedGames().finally(() => {
      hasPedingDownloadFolderSearch = false;
    })
    setDownloads(result
      .map(id => gamesManager.getGameFromCacheById(id))
      .filter(game => game) as Game[]
    );
  };

  const changeDownloadsDir = async () => {
    await settingsManager.setDownloadPath();
    updateDownloadedGames();
  }

  useEffect(() => {
    return downloadManager.addDownloadingListener((ids) => {
      updateDownloadedGames();
      setDownloading(ids
        .map(id => gamesManager.getGameFromCacheById(id))
        .filter(game => game) as Game[]
      );
    });
  }, []);

  return <div>
    <div className='horizontal-display'>
      <h1><Icon icon={Icons.solid.faLayerGroup} size="lg" />Library Page</h1>
      <Button onClick={changeDownloadsDir} icon={Icons.solid.faFolderOpen}>Change Downloads Dir</Button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'row', padding: '1em' }}>
      {downloading.length !== 0 && <div style={{flex: 1}}>
        <h2>Downloading Games</h2>
        <div className="game-list">
          {downloading.map(game => <GameCard game={game} key={game.id}/>)}
        </div>
      </div>}
      {downloads.length !== 0 && <div style={{flex: 1}}>
        <h2>Downloaded Games</h2>
        <div className='game-list'>
          {downloads.map(game => <GameCard downloaded game={game} key={game.id}/>)}
        </div>
      </div>}
    </div>
  </div>;
};

export default Downloads;