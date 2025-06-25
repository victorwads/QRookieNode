import React, { useEffect, useState } from "react";
import { BasicLoading } from "./Loading";
import "./Settings.css";

import { isElectron, isWebsoket } from "@bridge";
import settingsManager, { SystemHelth } from "@bridge/settings";
import Button from "@components/Button";
import Icon, { Icons } from "@components/Icons";

import type { RepoDownloadsInfo, Settings as SettingsModel } from "@bridge/settings";

let sysTemHelthCache: SystemHelth | null = null;
const loadSystemHelth = async () =>
  settingsManager.getHelthInfo().then(info => {
    sysTemHelthCache = info;
    return info;
  });
void loadSystemHelth();

export const changeDownloadsDir = async (): Promise<SettingsModel> => {
  if (isWebsoket) {
    alert(
      "Use ROOKIE_DOWNLOADS_DIR environment variable with a valid full path to set the download dir on web server"
    );
  }
  return await settingsManager.setDownloadPath();
};

const Settings: React.FC = () => {
  const [infos, set] = useState<RepoDownloadsInfo>(settingsManager.getReposInfo());
  const [update, setUpdate] = useState<string | null>(null);
  const [systemHelth, setSystemHelth] = useState<SystemHelth | null>(sysTemHelthCache);
  const [settings, setSettings] = useState<SettingsModel>({});

  const openDevTools = () => {
    settingsManager.openDevTools();
  };

  useEffect(() => {
    void settingsManager.fetchReposInfo().then(info => {
      set({ ...info });
    });
    if (!systemHelth) {
      void loadSystemHelth().then(setSystemHelth);
    }
    void settingsManager.getSettings().then(setSettings);
    void settingsManager.hasUpdate().then(setUpdate);
  }, [systemHelth]);

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
          <h2>System Helth Check</h2>
          {systemHelth ? (
            <ul>
              <li>
                <pre>
                  <strong>App Version:</strong> {systemHelth.appVersion}
                  {isWebsoket ? " (Web Version)" : ""}
                </pre>
              </li>
              {isElectron && (
                <li>
                  <pre>
                    <strong>Electron Version:</strong> {systemHelth.electronVersion}
                  </pre>
                </li>
              )}
              <li>
                <pre>
                  <strong>{isElectron && "Bundled "}Node Version:</strong>{" "}
                  {systemHelth.bundledNodeVersion}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>ADB:</strong> {systemHelth.adb}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>7Zip:</strong> {systemHelth.sevenZip}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>Unzip:</strong> {systemHelth.unzip}
                </pre>
              </li>
              <li>
                <pre>
                  <strong>Java:</strong> {systemHelth.java}
                </pre>
              </li>
            </ul>
          ) : (
            <BasicLoading visible={!systemHelth} />
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
