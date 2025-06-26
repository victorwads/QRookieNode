import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import downloadManager, { GameStatusType } from "@bridge/download";
import gamesManager from "@bridge/games";
import settingsManager from "@bridge/settings";
import Button from "@components/Button";
import GameCard from "@components/GameCard";
import Icon, { Icons } from "@components/Icons";

import type { Game } from "@bridge/games";

let hasPendingDownloadFolderSearch = false;

const navbarHeight = 70;
const headerHeight = 100;

const installingStates: GameStatusType[] = [
  "installing",
  "unzipping",
  "downloading",
  "pushing app data",
  "cancelling",
];
const Library: React.FC = () => {
  const [downloads, setDownloads] = React.useState<Game[]>([]);
  const [downloading, setDownloading] = React.useState<Game[]>([]);
  const navigate = useNavigate();

  const updateDownloadedGames = async () => {
    if (hasPendingDownloadFolderSearch) return;
    const result = await downloadManager.getDownloadedGames().finally(() => {
      hasPendingDownloadFolderSearch = false;
    });
    setDownloads(
      result.map(id => gamesManager.getGameFromCacheById(id)).filter(game => game) as Game[]
    );
  };

  const changeDownloadsDir = async () => {
    await settingsManager.setDownloadPath();
    void updateDownloadedGames();
  };

  useEffect(() => {
    return downloadManager.addDownloadingListener(infos => {
      void updateDownloadedGames();
      setDownloading(
        infos
          .filter(info => installingStates.includes(info.status))
          .map(({ id }) => gamesManager.getGameFromCacheById(id))
          .filter(game => game) as Game[]
      );
    });
  }, []);

  return (
    <>
      <div className="horizontal-display">
        <h1>
          <Icon icon={Icons.solid.faLayerGroup} size="lg" />
          Library Page
        </h1>
        <Button onClick={() => void changeDownloadsDir()} icon={Icons.solid.faFolderOpen}>
          Change Downloads Dir
        </Button>
      </div>
      {downloading.length === 0 && downloads.length === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: `calc(100vh - ${navbarHeight}px - ${headerHeight}px)`,
          }}
        >
          <h2>No Games Found</h2>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", padding: "1em" }}>
        {downloading.length !== 0 && (
          <div style={{ flex: 1 }}>
            <h2>Downloading Games</h2>
            <div className="game-list">
              {downloading.map(game => (
                <GameCard
                  game={game}
                  key={game.id}
                  onSelect={() => void navigate(`/games/${game.id}`)}
                />
              ))}
            </div>
          </div>
        )}
        {downloads.length !== 0 && (
          <div style={{ flex: 1 }}>
            <h2>Downloaded Games</h2>
            <div className="game-list">
              {downloads.map(game => (
                <GameCard
                  downloaded
                  game={game}
                  key={game.id}
                  onSelect={() => void navigate(`/games/${game.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Library;
