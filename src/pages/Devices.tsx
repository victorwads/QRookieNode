import React, { useEffect } from 'react';
import sendCommand, { AdbCommandName, AdbCommandOutput } from '../bridge';
import { CenteredLoading } from './Loading';
import Icon, { Icons } from '../components/Icons';
import DevicesList from '../components/DeviceList';
import DeviceInfoCard from '../components/DeviceInfoCard';
import UsersList from '../components/UsersList';


let cache: AdbCommandOutput = {
  devices: [],
  users: [],
  apps: [],
  helthCheck: 'loading...',
};

const Devices: React.FC = () => {
  const [result, setResult] = React.useState<AdbCommandOutput>(cache);
  const [loading, setLoading] = React.useState<boolean>(true);

  const getAdbDevices = async () => {
    setLoading(true);
    const result = sendCommand<AdbCommandName, any, AdbCommandOutput>({
      type: 'adb',
    });
    cache = await result;
    setResult(cache);
    setLoading(false)
  };

  useEffect(() => {
    getAdbDevices()
  }, []);

  return (
    <div>
      <div className='horizontal-display'>
        <h1><Icon icon={Icons.solid.faTabletAlt} size="lg" />Devices Page</h1>
        <CenteredLoading visible={loading} />
        <button onClick={getAdbDevices}><Icon icon={Icons.solid.faRefresh} /> Reload Devices</button>
      </div>
      <DevicesList devices={result.devices} />
      {result.deviceInfo && <DeviceInfoCard deviceInfo={result.deviceInfo} />}
      <UsersList users={result.users} />
    </div>
  );
};

export default Devices;