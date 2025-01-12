import React from 'react';
import sendCommand, { DevToolsCommandName } from '../bridge';
import Icon, { Icons } from '../components/Icons';

const Settings: React.FC = () => {
  const openDevTools = () => {
    sendCommand<DevToolsCommandName>({
      type: 'devTools',
    });
  };
  
  return (
    <div className='horizontal-display'>
      <h1><Icon icon={Icons.solid.faGear} size="lg" />Settings Page</h1>
      <button onClick={openDevTools}>Open DevTools</button>
    </div>
  );
};

export default Settings;