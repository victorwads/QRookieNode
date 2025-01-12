import React from 'react';
import sendCommand, { AdbCommandName, AdbPayload } from '../bridge';

const Devices: React.FC = () => {
  const [result, setResult] = React.useState<string>("");

  const getAdbDevices = async () => {
    const result = sendCommand<AdbCommandName, AdbPayload, string>({
      type: 'adb',
    });
    setResult(await result);
  };

  return (
    <div>
      <h1>Devices Page</h1>
      <button onClick={getAdbDevices}>Get ADB Devices</button>
      <pre>{result}</pre>
    </div>
  );
};

export default Devices;