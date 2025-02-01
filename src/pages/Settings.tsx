import React, { useEffect, useState } from 'react';

import type { RepoDownloadsInfo, Settings as SettingsModel } from '../bridge/settings';
import settingsManager from '../bridge/settings';

import './Settings.css';
import Icon, { Icons } from '../components/Icons';
import { SystemHelth } from '../../electron/shared';

const Settings: React.FC = () => {
  const [infos, set] = useState<RepoDownloadsInfo>(settingsManager.getReposInfo());
  const [systemHelth, setSystemHelth] = useState<SystemHelth|null>(null);
  const [settings, setSettings] = useState<SettingsModel>({});

  const openDevTools = () => {
    settingsManager.openDevTools();
  };

  const changeDownloadsDir = async () => {
    setSettings(await settingsManager.setDownloadPath());
  };

  useEffect(() => {
    settingsManager.fetchReposInfo().then(info => {set({...info})});
    settingsManager.getHelthInfo().then(setSystemHelth);
    settingsManager.getSettings().then(setSettings);
  }, []);

  const reposInfos = Object.values(infos);

  const totalDownloads = reposInfos.reduce((acc, { total }) => acc + total, 0);
  const lastUpdate = new Date(Math.max(...reposInfos.map(({ lastUpdate }) => lastUpdate)));

  return <div className='settings'>
    <div className='horizontal-display'>
      <h1><Icon icon={Icons.solid.faGear} size="lg" />Settings Page</h1>
      <button onClick={openDevTools}>Open DevTools</button>
      <button onClick={changeDownloadsDir}>Change Downloads Dir</button>
    </div>
    <div className='sections'>
      <section>
        <h2>Settings</h2>
        <pre>{JSON.stringify(settings, null, 2)}</pre>
      </section>
      <section>
        <h2>Total Downloads: {totalDownloads}</h2>
        {reposInfos.map(({byExt, name, total}) => {
          return <>
            <strong>{name} ({total})</strong>
            <div className='tags'>
              {Object.entries(byExt).map(([ext, count]) => (
                <span key={ext}>{ext} ({count})</span>
              ))}
            </div>
          </>;
        })}
        <span>Last Update: {lastUpdate.toLocaleString()}</span>
      </section>
      <section>
        <h2>System Helth Check</h2>
        {systemHelth ? <ul>
          <li><pre><strong>App Version:</strong> {systemHelth.appVersion}</pre></li>
          <li><pre><strong>ADB:</strong> {systemHelth.adb}</pre></li>
          <li><pre><strong>Unzip:</strong> {systemHelth.unzip}</pre></li>
          <li><pre><strong>7Zip:</strong> {systemHelth.sevenZip}</pre></li>
          <li><pre><strong>Java:</strong> {systemHelth.java}</pre></li>
        </ul> : <>Loading...</>}
      </section>
    </div>
  </div>;
};

export default Settings;