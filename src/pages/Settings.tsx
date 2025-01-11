import React from 'react';

declare global {
  interface Window {
    electronAPI: {
      openDevTools: () => void;
    };
  }
}

const Settings: React.FC = () => {
  const openDevTools = () => {
    window.electronAPI.openDevTools();
  };
  
  return (
    <div>
      <h1>Settings Page</h1>
      <button onClick={openDevTools}>Open DevTools</button>
    </div>
  );
};

export default Settings;