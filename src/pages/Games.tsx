import React from 'react';
import sendCommand, { GamesCommandName, GamesCommandPayload } from '../bridge';

const Games: React.FC = () => {
  const [result, setResult] = React.useState<string>("");

  const getAdbDevices = async () => {
    const result = sendCommand<GamesCommandName, GamesCommandPayload, string>({
      type: 'games',
    });
    setResult(await result);
  };

  return (
    <div>
      <h1>Games Page</h1>
      <button onClick={getAdbDevices}>Get Games</button>
      <pre>{result}</pre>
    </div>
  );
};

export default Games;