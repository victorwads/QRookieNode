import { useEffect, useState } from "react";

import type { GameStatusInfo } from "@bridge/download";
import type { Game } from "@bridge/games";

import deviceManager from "@bridge/devices";
import downloadManager from "@bridge/download";
import gameManager from "@bridge/games";
import getImagePath from "@react/bridge/image";
import Button from "./Button";
import GameVerboseInfo from "./GameVerboseInfo";
import { Icons } from "./Icons";

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
  const [gameStatus, setGameStatus] = useState<GameStatusInfo|null>(downloadManager.getGameStatusInfo(game.id));
  
  const install = async () => {
    if (gameStatus?.status === 'installing' || gameStatus?.status === 'unzipping' || gameStatus?.status === 'pushing app data') return;
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
    setGameStatus(null);
  }

  const cancel = async () => {
    if(!window.confirm('Are you sure you want to cancel this download?')) return;
    downloadManager.cancel(game.id);
  }

  const uninstall = async () => {
    if(!window.confirm('Are you sure you want to uninstall this game? You will lose all your progress.')) return;
    await gameManager.uninstall(game.id);
    setGameStatus(null);
  }

  useEffect(() => {
    return downloadManager.addListener(game.id, (info) => {
      setGameStatus(info ? {...info} : null);
    });
  }, [game]);

  const status: React.ReactNode[] = [];
  if(gameStatus?.status === 'installing') {
    status.push(<div key={status.length} className="game-card-task">Installing</div>)
  } else if (gameStatus?.status === 'downloading') {
    status.push(<div key={status.length} className="game-card-download-progress">
      {gameStatus.files.map((file, index) => {
        const totalPercentage = file.bytesReceived / gameStatus.bytesTotal * 100;
        return <div key={index} style={{width: totalPercentage+'%'}}></div>
      })}
    </div>)
    status.push(<Button key={status.length} onClick={cancel} icon={Icons.solid.faTrash}>Cancel</Button>)
  } else if (gameStatus?.status === 'unzipping') {
    status.push(<div key={status.length} className="game-card-task">Unzipping</div>)
  } else if (gameStatus?.status === 'pushing app data') {
    status.push(<div key={status.length} className="game-card-task">Pushing App data</div>)
  } else if (gameStatus?.status === 'cancelling') {
    status.push(<div key={status.length} className="game-card-task">Cancelling Download</div>)
  } else {
    const isInstalled = gameStatus?.status === 'installed' || deviceManager.isGameInstalled(game.packageName);
    if (isInstalled) {
      status.push(<Button key={status.length} wide onClick={uninstall} icon={Icons.solid.faMinusCircle}>Uninstall</Button>)
    }
    const isDownloaded = downloaded || downloadManager.isGameDownloaded(game.id);
    if (isDownloaded) {
      if (isInstalled) {
        status.push(<Button key={status.length} wide onClick={install} icon={Icons.solid.faBoxOpen}>Reinstall</Button>)    
      } else {
        status.push(<Button key={status.length} wide onClick={install} icon={Icons.solid.faDownload}>Install</Button>)
      }
      status.push(<Button key={status.length} onClick={remove} icon={Icons.solid.faTrash}>Remove</Button>)
    } else if (onDownload) {
      status.push(<Button key={status.length} wide onClick={() => onDownload(game)} icon={Icons.solid.faDownload}>Download</Button>)
    }
  }

  return <>
    <div className={"game-card" + (verbose ? ' verbose' : '')}>
      <div className="game-card-image" onClick={() => onSelect && onSelect(game)} style={{backgroundImage: `url(${getImagePath(game.packageName)})`}}>
        {/* Add Eye Icon */}
      </div>
      <div className="game-card-content">
        <h3 className="game-card-title" onClick={() => onSelect && onSelect(game)}>{game.normalName}</h3>
        {game.name !== game.normalName && <p className="game-card-subtitle">{game.name}</p>}
        {verbose && <div style={{ display: 'flex', flexDirection: 'row',  flex: 1, textAlign: 'left', margin: '15px' }}>
          <div style={{ marginRight: 10 }}>
            <div><strong>ID:</strong></div>
            <div><strong>Version:</strong></div>
            <div><strong>Category:</strong></div>
            <div><strong>Package Name:</strong></div>
            <div><strong>Last Updated:</strong></div>
          </div>
          <div style={{ flex: 1 }}>
            <div>{game.id}</div>
            <div>{game.version}</div>
            <div>{game.category}</div>
            <div>{game.packageName}</div>
            <div>{game.lastUpdated}</div>
          </div>
        </div>}
        <p className="game-card-size">{formatSize(game.size)}</p>
        <div  style={{display: 'flex', gap: 5, padding: 10, alignItems: 'center'}}>
          {status}
        </div>
      </div>
    </div>
    {verbose && gameStatus && <GameVerboseInfo gameStatus={gameStatus} />}
  </>;
};

export default GameCard;