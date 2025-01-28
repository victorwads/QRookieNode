import React, { useEffect } from 'react';

import { CenteredLoading } from './Loading';
import Icon, { Icons } from '../components/Icons';
import UsersList from '../components/UsersList';
import DevicesList from '../components/DeviceList';
import DeviceInfoCard from '../components/DeviceInfoCard';

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
  }, []);

  return (
    <div>
      <div className='horizontal-display'>
        <h1><Icon icon={Icons.solid.faTabletAlt} size="lg" />Devices Page</h1>
        <CenteredLoading visible={loading} />
        <button onClick={() => getAdbDevices()}><Icon icon={Icons.solid.faRefresh} /> Reload Devices</button>
      </div>
      <DevicesList devices={result.devices} onConnect={getAdbDevices} onConnectWifi={connectWifi} />
      {result.deviceInfo && <DeviceInfoCard deviceInfo={result.deviceInfo} />}
      <UsersList users={result.users} />
    </div>
  );
};

export default Devices;