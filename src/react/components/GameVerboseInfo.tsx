import { GameStatusInfo } from "@react/bridge/download";

export function formatSize(size: number = 0): string {
  if (size >= 1e9) return `${(size / 1e9).toFixed(2)} GB`;
  if (size >= 1e6) return `${(size / 1e6).toFixed(2)} MB`;
  if (size >= 1e3) return `${(size / 1e3).toFixed(2)} KB`;
  return `${size} B`;
}

export interface GameVerboseInfoProps {
  gameStatus: GameStatusInfo;
}

const validStatus = ["downloading", "installing", "pushing app data"];

const GameVerboseInfo: React.FC<GameVerboseInfoProps> = ({ gameStatus }: GameVerboseInfoProps) => {
  if (!validStatus.includes(gameStatus.status)) return null;
  return (
    <div style={{ flex: 1 }}>
      {gameStatus.status === "downloading" && (
        <div className="game-card-download-info">
          <strong>Downloading</strong>
          <div>
            <strong>Download URL: </strong>
            {gameStatus.url}
          </div>
          <div>
            <strong>Bytes Received: </strong>
            {gameStatus.bytesReceived}
          </div>
          <div>
            <strong>Bytes Total: </strong>
            {gameStatus.bytesTotal}
          </div>
          <div>
            <strong>Speed: </strong>
            {gameStatus.speed}
          </div>
          <div>
            <strong>Percent: </strong>
            {gameStatus.percent.toFixed(2)}%
          </div>
          <ul>
            {gameStatus.files
              .filter(info => info.percent !== 100 && info.percent !== 0)
              .map((file, index) => (
                <li key={index}>
                  <div>
                    <strong>File: </strong>
                    {file.url}
                  </div>
                  <div>
                    <strong>Bytes Received: </strong>
                    {file.bytesReceived}
                  </div>
                  <div>
                    <strong>Bytes Total: </strong>
                    {file.bytesTotal}
                  </div>
                  <div>
                    <strong>Percent: </strong>
                    {file.percent.toFixed(2)}%
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
      {gameStatus.status === "installing" && (
        <div className="game-card-download-info">
          <strong>Installing</strong>
          <div>
            <strong>Filename:</strong> {gameStatus.installingFile}
          </div>
        </div>
      )}
      {gameStatus.status === "pushing app data" && (
        <div className="game-card-download-info">
          <strong>Pushing App Data</strong>
          <div>
            <strong>Files:</strong>
            {gameStatus.file.index + 1}/{gameStatus.totalFiles}
          </div>
          <div>
            <strong>File Name: </strong>
            {gameStatus.file.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameVerboseInfo;
