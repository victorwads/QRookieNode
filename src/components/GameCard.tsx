import { useEffect, useState } from "react";

import gameManager from "../bridge/games";
import downloadManager from "../bridge/download";
import type { DownloadInfo } from "../bridge/download";
import type { Game } from "../bridge/games";

import Icon, { Icons } from "./Icons";
import Button from "./Button";

export function formatSize(size: number = 0): string {
  if (size >= 1e9) return `${(size / 1e9).toFixed(2)} GB`;
  if (size >= 1e6) return `${(size / 1e6).toFixed(2)} MB`;
  if (size >= 1e3) return `${(size / 1e3).toFixed(2)} KB`;
  return `${size} B`;
}

export interface GameCardProps {
  game: Game;
  verbose?: boolean;
  onDownload?: (game: Game) => void;
  onSelect?: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelect, onDownload, verbose }: GameCardProps) => {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo|null>(null);

  useEffect(() => {
    return downloadManager.addListener(game.id, (info) => {
      setDownloadInfo(info ? {...info} : null);
    });
  }, [game]);

  return <>
    <div className="game-card" onClick={() => onSelect && onSelect(game)}>
      <div className="game-card-image">
        <img src={'game-image://' + game.packageName} alt={game.name} loading='lazy' />
      </div>
      <div className="game-card-content">
        <h3 className="game-card-title">{game.normalName}</h3>
        {game.name !== game.normalName && <p className="game-card-subtitle">{game.name}</p>}
        <p className="game-card-category">{game.category}</p>
        <p className="game-card-size">{formatSize(game.size)}</p>
      </div>
      <div  style={{display: 'flex', gap: 10, padding: 10}}>
        {(!downloadInfo || downloadInfo.percent === 100) && (downloadManager.isGameDownloaded(game.id)
          ? <>
            <Button wide onClick={() => gameManager.install(game.id)} icon={Icons.solid.faBoxOpen}>Install</Button>
            <Button onClick={() => downloadManager.remove(game.id)} icon={Icons.solid.faTrash}>Remove</Button>
          </>
          : onDownload && <Button wide onClick={() => onDownload(game)} icon={Icons.solid.faDownload}>Download</Button>)}
      </div>
      {downloadInfo && downloadInfo?.percent !== 100 && (downloadInfo.percent === -1
        ? <div className="game-card-unzipping">Unzipping...</div>
        : <div className="game-card-download-progress">{downloadInfo.files.map((file, index) => {
          const totalPercentage = file.bytesReceived / downloadInfo.bytesTotal * 100;
          return <div key={index} style={{width: totalPercentage+'%'}}>{file.percent.toFixed(2)}%</div>
        })
        }</div>
      )}
    </div>
    {verbose && downloadInfo && downloadInfo.percent != -1 && downloadInfo.percent != 100 && <>
      <div className="game-card-download-info">
        <div>Download URL: {downloadInfo.url}</div>
        <div>Bytes Received: {downloadInfo.bytesReceived}</div>
        <div>Bytes Total: {downloadInfo.bytesTotal}</div>
        <div>Percent: {downloadInfo.percent.toFixed(2)}%</div>
        <ul>
          {downloadInfo.files.map((file, index) => <li key={index}>
            <div>File: {file.url}</div>
            <div>Bytes Received: {file.bytesReceived}</div>
            <div>Bytes Total: {file.bytesTotal}</div>
            <div>Percent: {file.percent.toFixed(2)}%</div>
          </li>)}
        </ul>
      </div>
    </>}
  </>;
};

export default GameCard;