import { useEffect, useState } from "react";

import gameManager from "../bridge/games";
import deviceManager from "../bridge/devices";
import downloadManager from "../bridge/download";
import type { DownloadInfo } from "../bridge/download";
import type { Game } from "../bridge/games";

import { Icons } from "./Icons";
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
  downloaded?: boolean;
  onDownload?: (game: Game) => void;
  onSelect?: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelect, onDownload, verbose, downloaded }: GameCardProps) => {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo|null>(downloadManager.getGameInfo(game.id));
  
  const install = async () => {
    if (downloadInfo?.status === 'installing' || downloadInfo?.status === 'unzipping' || downloadInfo?.status === 'pushing app data') return;
    const result = await gameManager.install(game.id);
    if (result) {
      alert(result);
    } else {
      alert('Game installed successfully');
    }
  };

  const remove = async () => {
    if(!window.confirm('Are you sure you want to remove this game?')) return;
    await downloadManager.remove(game.id);
    setDownloadInfo(null);
  }

  useEffect(() => {
    return downloadManager.addListener(game.id, (info) => {
      setDownloadInfo(info ? {...info} : null);
    });
  }, [game]);

  const status: React.ReactNode[] = [];
  if(downloadInfo?.status === 'installing') {
    status.push(<div className="game-card-unzipping">Installing</div>)
  } else if (downloadInfo?.status === 'downloading') {
    status.push(<div className="game-card-download-progress">
      {downloadInfo.files.map((file, index) => {
        const totalPercentage = file.bytesReceived / downloadInfo.bytesTotal * 100;
        return <div key={index} style={{width: totalPercentage+'%'}}></div>
      })}
    </div>)
    status.push(<Button onClick={remove} icon={Icons.solid.faTrash}>Cancel</Button>)
  } else if (downloadInfo?.status === 'unzipping') {
    status.push(<div className="game-card-unzipping">Unzipping</div>)
  } else if (downloadInfo?.status === 'pushing app data') {
    status.push(<div className="game-card-unzipping">Pushing App data</div>)
  } else {
    if (downloadInfo?.status === 'installed' || deviceManager.isGameInstalled(game.packageName)) {
      status.push(<Button wide onClick={install} icon={Icons.solid.faBoxOpen}>Reinstall</Button>)    
      status.push(<Button wide onClick={() => {alert('not implemented')}} icon={Icons.solid.faMinusCircle}>Uninstall</Button>)
    }
    if (downloaded || downloadManager.isGameDownloaded(game.id)) {
      status.push(<Button wide onClick={install} icon={Icons.solid.faDownload}>Install</Button>)
      status.push(<Button onClick={remove} icon={Icons.solid.faTrash}>Remove</Button>)
    } else if (onDownload) {
      status.push(<Button wide onClick={() => onDownload(game)} icon={Icons.solid.faDownload}>Download</Button>)
    }
  }

  return <>
    <div className="game-card">
      <div className="game-card-image" onClick={() => onSelect && onSelect(game)}>
        <img src={'game-image://' + game.packageName} alt={game.name} loading='lazy' />
      </div>
      <div className="game-card-content">
        <h3 className="game-card-title" onClick={() => onSelect && onSelect(game)}>{game.normalName}</h3>
        {game.name !== game.normalName && <p className="game-card-subtitle">{game.name}</p>}
        <p className="game-card-category">{game.category}</p>
        <p className="game-card-size">{formatSize(game.size)}</p>
      </div>
      <div  style={{display: 'flex', gap: 5, padding: 10, alignItems: 'center'}}>
        {status}
      </div>
    </div>
    {verbose && downloadInfo?.status === 'downloading' && <>
      <div className="game-card-download-info">
        <strong>Downloading</strong>
        <div><strong>Download URL: </strong>{downloadInfo.url}</div>
        <div><strong>Bytes Received: </strong>{downloadInfo.bytesReceived}</div>
        <div><strong>Bytes Total: </strong>{downloadInfo.bytesTotal}</div>
        <div><strong>Percent: </strong>{downloadInfo.percent.toFixed(2)}%</div>
        <ul>
          {downloadInfo.files
            .filter(info => info.percent !== 100 && info.percent !== 0)
            .map((file, index) => <li key={index}>
              <div><strong>File: </strong>{file.url}</div>
              <div><strong>Bytes Received: </strong>{file.bytesReceived}</div>
              <div><strong>Bytes Total: </strong>{file.bytesTotal}</div>
              <div><strong>Percent: </strong>{file.percent.toFixed(2)}%</div>
            </li>)}
        </ul>
      </div>
    </>}
    {verbose && downloadInfo?.status === 'installing' && <>
      <div className="game-card-download-info">
        <strong>Installing</strong>
        <div><strong>Filename:</strong> {downloadInfo.installingFile}</div>
      </div>
    </>}
    {verbose && downloadInfo?.status === 'pushing app data' && <>
      <div className="game-card-download-info">
        <strong>Pusing App Data</strong>
        <div><strong>Files:</strong>{downloadInfo.file.index + 1}/{downloadInfo.totalFiles}</div>
        <div><strong>File Name: </strong>{downloadInfo.file.name}</div>
      </div>
    </>}
  </>;
};

export default GameCard;