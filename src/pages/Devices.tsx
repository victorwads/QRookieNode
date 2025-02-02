import React, { useEffect } from 'react';

import { CenteredLoading } from './Loading';
import Icon, { Icons } from '../components/Icons';
import UsersList from '../components/UsersList';
import DevicesList from '../components/DeviceList';
import DeviceInfoCard from '../components/DeviceInfoCard';
import GameCard from '../components/GameCard';
import Button from '../components/Button';

import gamesManager from '../bridge/games';
import type { Game } from '../bridge/games';
import deviceManager from '../bridge/devices';
import type { AdbCommandOutput } from '../bridge/devices';


const Devices: React.FC = () => {
  const [result, setResult] = React.useState<AdbCommandOutput['list']>(deviceManager.getDevicesCache());
  const [loading, setLoading] = React.useState<boolean>(true);

  const getAdbDevices = async (serial?: string) => {
    if (serial) {
      await deviceManager.setDevice(serial);
    }
    setLoading(true);
    const devices = await deviceManager.getDevices();
    setResult(devices);
    setLoading(false)
  };

  const connectWifi = async (serial: string) => {
    setLoading(true);
    const newSerial = await deviceManager.connectWifi(serial);
    if(newSerial) {
      await getAdbDevices();
    } else {
      alert('Failed to connect to wifi');
    }
    setLoading(false);
  }

  useEffect(() => {
    getAdbDevices()
    const interval = setInterval(() => {
      getAdbDevices()
    }, 10000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  return <div>
    <div className='horizontal-display'>
      <h1><Icon icon={Icons.solid.faTabletAlt} size="lg" />Devices Page</h1>
      <CenteredLoading visible={loading} />
      <Button onClick={() => getAdbDevices()} icon={Icons.solid.faRefresh}>Reload Devices</Button>
    </div>
    <div style={{padding: '0 20px'}}>{result.devices.length === 0 ? <p>No devices found</p> : <>
      <DevicesList devices={result.devices} onConnect={getAdbDevices} onConnectWifi={connectWifi} />
      {result.deviceInfo && <DeviceInfoCard deviceInfo={result.deviceInfo} />}
      <UsersList users={result.users} />
      <h2>Installed Games</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {(result.apps
          .map(game => gamesManager.getGameFromCache(game.packageName))
          .filter(game => game) as Game[])
          .map(game => <GameCard game={game} key={game.id}/>)}
      </div>
      <h2>Other Installed Apps</h2>
      <ul>
        {result.apps
          .filter(game => !gamesManager.getGameFromCache(game.packageName))
          .map(game => <li key={game.packageName}>
            <span style={{display: 'inline-block', width: 200}}><strong>Version:</strong> {game.versionCode}</span>
            {game.packageName}
          </li>)}
      </ul>
    </>}</div>
  </div>;
};

export default Devices;