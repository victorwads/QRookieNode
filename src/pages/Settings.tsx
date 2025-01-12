import React from 'react';
import sendCommand, { DevToolsCommandName } from '../bridge';

const Settings: React.FC = () => {
  const openDevTools = () => {
    sendCommand<DevToolsCommandName>({
      type: 'devTools',
    });
  };
  
  return (
    <div>
      <h1>Settings Page</h1>
      <button onClick={openDevTools}>Open DevTools</button>
    </div>
  );
};

export default Settings;