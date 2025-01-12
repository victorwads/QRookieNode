import React from 'react';
import sendCommand, { DevToolsCommandEvent } from '../bridge';

const Settings: React.FC = () => {
  const openDevTools = () => {
    sendCommand({
      type: 'devTools',
    } as DevToolsCommandEvent);
  };
  
  return (
    <div>
      <h1>Settings Page</h1>
      <button onClick={openDevTools}>Open DevTools</button>
    </div>
  );
};

export default Settings;