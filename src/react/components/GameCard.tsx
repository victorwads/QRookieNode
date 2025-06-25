import { useCallback, useEffect, useState } from "react";

import type { GameStatusInfo } from "@bridge/download";
import type { Game } from "@bridge/games";

import deviceManager from "@bridge/devices";
import downloadManager from "@bridge/download";
import gameManager from "@bridge/games";
import getImagePath from "@react/bridge/image";
import BooleanView from "./BooleanView";
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

const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelect,
  onDownload,
  verbose,
  downloaded,
}: GameCardProps) => {
  const [gameStatus, setGameStatus] = useState<GameStatusInfo | null>(
    downloadManager.getGameStatusInfo(game.id)
  );
  const [comparation, setComparation] = useState<GameFileComparison[]>([]);
  const [deviceVersion, setDeviceVersion] = useState<number | null>(null);

  const install = async (justMissing: boolean = false) => {
    if (
      gameStatus?.status === "installing" ||
      gameStatus?.status === "unzipping" ||
      gameStatus?.status === "pushing app data"
    )
      return;

    const result = await gameManager.install(game.id, justMissing === true);
    if (result) {
      alert(result);
    } else {
      alert("Game installed successfully");
    }
    void loadComparation();
  };

  const remove = async () => {
    if (!window.confirm("Are you sure you want to remove this game?")) return;
    await downloadManager.remove(game.id);
    setGameStatus(null);
  };

  const cancel = () => {
    if (!window.confirm("Are you sure you want to cancel this download?")) return;
    downloadManager.cancel(game.id);
  };

  const uninstall = async () => {
    if (
      !window.confirm(
        "Are you sure you want to uninstall this game? You will lose all your progress."
      )
    )
      return;
    await gameManager.uninstall(game.id);
    await loadComparation();
    setDeviceVersion(null);
    setGameStatus(null);
  };

  const loadComparation = useCallback(async () => {
    if (verbose && game.packageName) {
      await compareFiles(game.id).then(setComparation);
      setDeviceVersion(deviceManager.getPackageVersion(game.packageName));
    }
  }, [game, verbose]);

  useEffect(() => {
    void loadComparation();

    let lastFile = "";
    return downloadManager.addListener(game.id, info => {
      setGameStatus(info ? { ...info } : null);
      if (info?.status === "pushing app data" && comparation.length > 0) {
        comparation.forEach(file => {
          if (file.fileName === lastFile) {
            file.deviceExists = true;
          }
        });
        lastFile = info.file.name;
        setComparation([...comparation]);
      }
      if (info?.status === "installed") {
        void loadComparation();
      }
    });
  }, [comparation, game, loadComparation, verbose]);

  let isDownloaded = downloadManager.isGameDownloaded(game.id);
  let isInstalled = deviceManager.isGameInstalled(game.packageName);
  const status: React.ReactNode[] = [];
  if (gameStatus?.status === "installing") {
    status.push(
      <div key={status.length} className="game-card-task">
        Installing
      </div>
    );
  } else if (gameStatus?.status === "downloading") {
    status.push(
      <div key={status.length} className="game-card-download-progress">
        {gameStatus.files.map((file, index) => {
          const totalPercentage = (file.bytesReceived / gameStatus.bytesTotal) * 100;
          return <div key={index} style={{ width: totalPercentage + "%" }}></div>;
        })}
      </div>
    );
    status.push(
      <Button key={status.length} onClick={cancel} icon={Icons.solid.faTrash}>
        Cancel
      </Button>
    );
  } else if (gameStatus?.status === "unzipping") {
    status.push(
      <div key={status.length} className="game-card-task">
        Unzipping
      </div>
    );
  } else if (gameStatus?.status === "pushing app data") {
    status.push(
      <div key={status.length} className="game-card-task">
        Pushing App data
      </div>
    );
  } else if (gameStatus?.status === "cancelling") {
    status.push(
      <div key={status.length} className="game-card-task">
        Cancelling Download
      </div>
    );
  } else {
    isInstalled = isInstalled || gameStatus?.status === "installed";
    if (isInstalled) {
      status.push(
        <Button
          key={status.length}
          wide
          onClick={() => void uninstall()}
          icon={Icons.solid.faMinusCircle}
        >
          Uninstall
        </Button>
      );
    }
    isDownloaded = isDownloaded || downloaded || false;
    if (isDownloaded) {
      if (isInstalled) {
        if (comparation.length > 0 && comparation.some(file => !file.deviceExists)) {
          status.push(
            <Button
              key={status.length}
              onClick={() => void install(true)}
              icon={Icons.solid.faDownload}
            >
              Install Missing Files
            </Button>
          );
        } else {
          status.push(
            <Button
              key={status.length}
              wide
              onClick={() => void install()}
              icon={Icons.solid.faBoxOpen}
            >
              Reinstall
            </Button>
          );
        }
      } else {
        status.push(
          <Button
            key={status.length}
            wide
            onClick={() => void install()}
            icon={Icons.solid.faDownload}
          >
            Install
          </Button>
        );
      }
      status.push(
        <Button key={status.length} onClick={() => void remove()} icon={Icons.solid.faTrash}>
          Remove
        </Button>
      );
    } else if (onDownload) {
      status.push(
        <Button
          key={status.length}
          wide
          onClick={() => void onDownload(game)}
          icon={Icons.solid.faDownload}
        >
          Download
        </Button>
      );
    }
  }

  return (
    <>
      <div className={"game-card" + (verbose ? " verbose" : "")}>
        <div
          className="game-card-image"
          onClick={() => onSelect && onSelect(game)}
          style={{ backgroundImage: `url(${getImagePath(game.packageName)})` }}
        >
          {/* Add Eye Icon */}
        </div>
        <div className="game-card-content">
          <h3 className="game-card-title" onClick={() => onSelect && onSelect(game)}>
            {game.normalName}
          </h3>
          {game.name !== game.normalName && <p className="game-card-subtitle">{game.name}</p>}
          {verbose && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flex: 1,
                textAlign: "left",
                margin: "15px",
              }}
            >
              <div style={{ marginRight: 10 }}>
                <div>
                  <strong>ID:</strong>
                </div>
                <div>
                  <strong>Version:</strong>
                </div>
                {deviceVersion && deviceVersion != game.version && (
                  <div>
                    <strong>Device Version:</strong>
                  </div>
                )}
                <div>
                  <strong>Category:</strong>
                </div>
                <div>
                  <strong>Package Name:</strong>
                </div>
                <div>
                  <strong>Last Updated:</strong>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div>{game.id}</div>
                <div>{game.version}</div>
                {deviceVersion && deviceVersion != game.version && <div>{deviceVersion}</div>}
                <div>{game.category}</div>
                <div>{game.packageName}</div>
                <div>{game.lastUpdated}</div>
              </div>
            </div>
          )}
          <p className="game-card-size">{formatSize(game.size)}</p>
          <div style={{ display: "flex", gap: 5, padding: 10, alignItems: "center" }}>{status}</div>
        </div>
      </div>
      {verbose && gameStatus && <GameVerboseInfo gameStatus={gameStatus} />}
      {isDownloaded && comparation.length > 0 && (
        <div style={{ flex: 1 }}>
          <table border={1} style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>On Local</th>
                <th>On Device</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>APK Version</b>
                </td>
                <td align="center">{game.version}</td>
                <td align="center">{deviceVersion || "Not Found"}</td>
              </tr>
              {comparation
                .sort((a, b) => (a.deviceExists === b.deviceExists ? 0 : a.deviceExists ? 1 : -1))
                .map((file, index) => (
                  <tr key={index}>
                    <td>{file.fileName}</td>
                    <td align="center">
                      <BooleanView value={file.localExists} />
                    </td>
                    <td align="center">
                      <BooleanView value={file.deviceExists} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

const compareFiles = async (id: string): Promise<GameFileComparison[]> => {
  const [localFiles, deviceFiles] = await Promise.all([
    downloadManager.getLocalFiles(id),
    gameManager.getObbFileList(id),
  ]);
  const allFiles = [
    ...localFiles.filter(file => file.trim() !== ""),
    ...deviceFiles.filter(file => file.trim() !== ""),
  ];

  return Array.from(allFiles).map(file => ({
    fileName: file,
    localExists: localFiles.includes(file),
    deviceExists: deviceFiles.includes(file),
  }));
};

interface GameFileComparison {
  fileName: string;
  localExists: boolean;
  deviceExists: boolean;
}

export default GameCard;
