import React, { useEffect, useState } from "react";
import { BasicLoading } from "./Loading";
import "./Settings.css";

import { isElectron, isWebsocket } from "@bridge";
import settingsManager, { SystemHealth } from "@bridge/settings";
import Button from "@components/Button";
import Icon, { Icons } from "@components/Icons";

import type { RepoDownloadsInfo, Settings as SettingsModel } from "@bridge/settings";

let systemHealthCache: SystemHealth | null = null;
const loadSystemHealth = async () =>
  settingsManager.getHealthInfo().then(info => {
    systemHealthCache = info;
    return info;
  });
void loadSystemHealth();

export const changeDownloadsDir = async (): Promise<SettingsModel> => {
  if (isWebsocket) {
    alert(
      "Use ROOKIE_DOWNLOADS_DIR environment variable with a valid full path to set the download dir on web server"
    );
  }
  return await settingsManager.setDownloadPath();
};

const Settings: React.FC = () => {
  const [infos, set] = useState<RepoDownloadsInfo>(settingsManager.getReposInfo());
  const [update, setUpdate] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(systemHealthCache);
  const [settings, setSettings] = useState<SettingsModel>({});

  const openDevTools = () => {
    settingsManager.openDevTools();
  };

  useEffect(() => {
    void settingsManager.fetchReposInfo().then(info => {
      set({ ...info });
    });
    if (!systemHealth) {
      void loadSystemHealth().then(setSystemHealth);
    }
    void settingsManager.getSettings().then(setSettings);
    void settingsManager.hasUpdate().then(setUpdate);
  }, [systemHealth]);

  const reposInfos = Object.values(infos);

  const totalDownloads = reposInfos.reduce((acc, { total }) => acc + total, 0);
  const lastUpdate = new Date(Math.max(...reposInfos.map(({ lastUpdate }) => lastUpdate)));

  return (
    <div className="settings">
      <div className="horizontal-display">
        <h1>
          <Icon icon={Icons.solid.faGear} size="lg" />
          Settings Page
        </h1>
        <div className="spacer" />
        {isElectron && (
          <Button onClick={openDevTools} icon={Icons.solid.faTools}>
            DevTools
          </Button>
        )}
        <Button
          onClick={() => void changeDownloadsDir().then(setSettings)}
          icon={Icons.solid.faFolderOpen}
        >
          Change Downloads Dir
        </Button>
      </div>
      <div className="sections">
        <section>
          <h2>Settings</h2>
          {Object.keys(settings).map(key => {
            const value = (settings as any)[key];
            return (
              <div key={key}>
                <strong>{key}</strong>: {value}
              </div>
            );
          })}
        </section>
        <section>
          <h2>System Health Check</h2>
          {systemHealth ? (
            <ul>
              <li>
                <pre>
                  <strong>App Version:</strong> {systemHealth.appVersion}
                  {isWebsocket ? " (Web Version)" : ""}
                </pre>
              </li>
              {isElectron && (
                <li>
                  <pre>
                    <strong>Electron Version:</strong> {systemHealth.electronVersion}
                  </pre>
                </li>
              )}
              <li>
                <pre>
                  <strong>{isElectron && "Bundled "}Node Version:</strong>{" "}
                  {systemHealth.bundledNodeVersion}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>ADB:</strong> {systemHealth.adb}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>7Zip:</strong> {systemHealth.sevenZip}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>Unzip:</strong> {systemHealth.unzip}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>Java:</strong> {systemHealth.java}
                </pre>
              </li>
            </ul>
          ) : (
            <BasicLoading visible={!systemHealth} />
          )}
        </section>
        {update && (
          <section>
            <h2>Update Available</h2>
            <a href={update} target="_blank" rel="noreferrer">
              {update}
            </a>
          </section>
        )}
        <section>
          <h2>Rookie Total Downloads: {totalDownloads}</h2>
          {reposInfos.map(({ byExt, name, total, lastAppVersion }) => {
            return (
              <div key={name}>
                <strong>
                  {name} ({total})
                </strong>{" "}
                Last Version: {lastAppVersion}
                <div className="tags">
                  {Object.entries(byExt)
                    .filter(([, count]) => count > 0)
                    .sort(([ext], [ext2]) => ext.localeCompare(ext2))
                    .map(([ext, count]) => (
                      <span key={ext}>
                        {ext} ({count})
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
          <p>Info Updated at: {lastUpdate.toLocaleString()}</p>
        </section>
      </div>
    </div>
  );
};

export default Settings;
