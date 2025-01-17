import React, { useEffect, useState } from 'react';
import sendCommand, { DevToolsCommandName, AdbCommandName, AdbCommandOutput } from '../bridge';
import Icon, { Icons } from '../components/Icons';
import { GitHubRelease } from '../../electron/comands/adb/androidToolsSetup';

const Settings: React.FC = () => {
  const [infos, set] = useState<RepoDownloadsInfo>(repoDownloadsInfo);
  const [adbHelth, setAdbHelth] = useState<string>("loading...");

  const openDevTools = () => {
    sendCommand<DevToolsCommandName>({
      type: 'devTools',
    });
  };

  useEffect(() => {
    promisse.then(() => set({...repoDownloadsInfo}));
    sendCommand<AdbCommandName, any, AdbCommandOutput>({
      type: 'adb',
    }).then(result => {
      setAdbHelth(result.helthCheck);
    });
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

// https://api.github.com/rate_limit
const storageKey = 'repoDownloadsInfo';
const storageValidTime = 1000 * 60 * 60 * 2; // 2 hours
const repoDownloadsInfo: RepoDownloadsInfo = JSON.parse(localStorage.getItem(storageKey) || '{}');
const repos = {
  "glaumar/QRookie": "Qml Rookie by Glaumar",
  "victorwads/QRookieNode": "Rookie Node by Victor Wads",
  "VRPirates/rookie": "Original Rookie",
};

type Downloads = {
  name: string,
  repo: string,
  byExt: { [ext: string]: number },
  total: number,
  lastUpdate: number
};
type RepoDownloadsInfo = {
  [repoName: string]: Downloads
};

const promisse = Promise.all(Object.entries(repos).map(([repoName, alias]) => {
  const cache = repoDownloadsInfo[repoName];
  if (cache) {
    const cacheUntil = cache.lastUpdate + storageValidTime;
    if (cacheUntil > Date.now()) {
      console.log('Using cache for', repoName);
      console.log('Cache will be used for more', (cacheUntil - Date.now()) / 1000, 'seconds');
      return Promise.resolve();
    }
  }
  console.log('Fetching', repoName);

  return fetch(`https://api.github.com/repos/${repoName}/releases`).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch repository information');
    }
  }).then((releases: GitHubRelease[]) => {
    const downloads: Downloads = {
      name: alias,
      repo: repoName,
      byExt: {},
      total: 0,
      lastUpdate: Date.now()
    };
    releases.forEach(release => {
      release.assets.forEach(asset => {
        downloads.total += asset.download_count;
        const ext = asset.name.split('.').pop() || 'unknown';
        downloads.byExt[ext] = (downloads.byExt[ext] || 0) + asset.download_count;
      });
    });
    repoDownloadsInfo[repoName] = downloads;
  })
}));

promisse.then(() => {
  localStorage.setItem(storageKey, JSON.stringify(repoDownloadsInfo));
  //const total = 
})