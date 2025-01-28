import React, { useEffect, useState } from 'react';

import type { RepoDownloadsInfo } from '../bridge/settings';
import settingsManager from '../bridge/settings';

import Icon, { Icons } from '../components/Icons';

const Settings: React.FC = () => {
  const [infos, set] = useState<RepoDownloadsInfo>(settingsManager.getReposInfo());
  const [adbHelth, setAdbHelth] = useState<string>("loading...");

  const openDevTools = () => {
    settingsManager.openDevTools();
  };

  useEffect(() => {
    settingsManager.fetchReposInfo().then(info => {set({...info})});
    settingsManager.getAdbHelth().then(setAdbHelth);
  }, []);

  const reposInfos = Object.values(infos);

  const totalDownloads = reposInfos.reduce((acc, { total }) => acc + total, 0);
  const lastUpdate = new Date(Math.max(...reposInfos.map(({ lastUpdate }) => lastUpdate)));

  return <>
    <div className='horizontal-display'>
      <h1><Icon icon={Icons.solid.faGear} size="lg" />Settings Page</h1>
      <button onClick={openDevTools}>Open DevTools</button>
    </div>
    <h2>Total Downloads: {totalDownloads}</h2>
    {reposInfos.map(({byExt, name, total}) => {
      return <>
        <strong>{name} ({total})</strong>
        <ul>
          {Object.entries(byExt).map(([ext, count]) => (
            <li key={ext}>*.{ext} ({count})</li>
          ))}
        </ul>
      </>;
    })}
    <span>Last Update: {lastUpdate.toLocaleString()}</span>
    <h2>System Helth Check</h2>
    <ul>
      <li>App Version: TODO</li>
      <li>ADB: <pre>{adbHelth}</pre></li>
      <li>Unzip: TODO</li>
      <li>7Zip: TODO</li>
      <li>Java: TODO</li>
    </ul>
  </>;
};

export default Settings;