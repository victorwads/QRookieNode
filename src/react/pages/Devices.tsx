import React, { useEffect } from "react";

import deviceManager from "@bridge/devices";
import gamesManager from "@bridge/games";
import Button from "@components/Button";
import DeviceInfoCard from "@components/DeviceInfoCard";
import DevicesList from "@components/DeviceList";
import GameCard from "@components/GameCard";
import Icon, { Icons } from "@components/Icons";
import UsersList from "@components/UsersList";
import { CenteredLoading } from "./Loading";

import type { AdbCommandOutput } from "@bridge/devices";
import type { Game } from "@bridge/games";

const LAST_IP_KEY = "device.lastIp";

const Devices: React.FC = () => {
  const [result, setResult] = React.useState<AdbCommandOutput["list"]>(
    deviceManager.getDevicesCache()
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connectIp, setConnectIp] = React.useState<string>(localStorage.getItem(LAST_IP_KEY) || "");
  const [pairIp, setPairIp] = React.useState<string>("");
  const [pairCode, setPairCode] = React.useState<string>("");

  const getDevices = async (serial?: string) => {
    if (serial) {
      await deviceManager.setDevice(serial);
    }
    setLoading(true);
    const devices = await deviceManager.getDevices();
    setResult(devices);
    setLoading(false);
  };

  const connectionFeedback = async (task: Promise<any>, message: string) => {
    setLoading(true);
    const result = await task;
    const devices = getDevices();
    if (!result) {
      alert(message);
    }
    await devices;
    setLoading(false);
  };

  const connectWifi = (serial: string) => {
    void connectionFeedback(
      deviceManager.connectWifi(serial),
      "Failed to connect with tcp to device " + serial
    );
  };

  const connectTcp = (connectIp: string) => {
    localStorage.setItem(LAST_IP_KEY, connectIp);
    void connectionFeedback(
      deviceManager.connectTcp(connectIp),
      "Failed to connect to address" + connectIp
    );
  };

  const pair = (pairIp: string, pairCode: string) => {
    void connectionFeedback(
      deviceManager.pair(pairIp, pairCode),
      "Failed to pair with device " +
        pairIp +
        " and code " +
        pairCode +
        ". But maybe it is already paired."
    );
  };

  useEffect(() => {
    void getDevices();
    const interval = setInterval(() => {
      void getDevices();
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <div className="horizontal-display">
        <h1>
          <Icon icon={Icons.solid.faTabletAlt} size="lg" />
          Devices Page
        </h1>
        <CenteredLoading visible={loading} />
        <Button onClick={() => void getDevices()} icon={Icons.solid.faRefresh}>
          Reload Devices
        </Button>
      </div>
      <div style={{ padding: "0 20px" }}>
        <h2>Network Connection</h2>
        <strong>With address: </strong>
        <input
          type="text"
          placeholder="0.0.0.0:5555"
          value={connectIp}
          onChange={e => setConnectIp(e.target.value)}
          style={{ width: "11em" }}
        />
        <Button onClick={() => void connectTcp(connectIp)} icon={Icons.solid.faWifi}>
          Try Connect TCP
        </Button>
      </div>
      <div style={{ padding: "0 20px" }}>
        <strong>Pair with Code: </strong>
        <input
          type="text"
          placeholder="0.0.0.0:5555"
          style={{ width: "7.4em" }}
          value={pairIp}
          onChange={e => setPairIp(e.target.value)}
        />
        <input
          type="text"
          placeholder="Code"
          style={{ width: "4em" }}
          value={pairCode}
          onChange={e => setPairCode(e.target.value)}
        />
        <Button onClick={() => pair(pairIp, pairCode)} icon={Icons.solid.faWifi}>
          Try Pair
        </Button>{" "}
        <a
          href="https://developer.android.com/tools/adb?hl=pt-br#connect-to-a-device-over-wi-fi"
          target="_blank"
          rel="noreferrer"
        >
          Instructions (Use Android System Configs)
        </a>
      </div>
      {result.devices.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <h2>No Devices Found</h2>
        </div>
      ) : (
        <div style={{ padding: "0 20px" }}>
          <DevicesList
            devices={result.devices}
            onConnect={() => void getDevices()}
            onConnectWifi={connectWifi}
          />
          {result.deviceInfo && <DeviceInfoCard deviceInfo={result.deviceInfo} />}
          <UsersList users={result.users} />
          <h2>Installed Games</h2>
          <div className="game-list">
            {(
              result.apps
                .map(game => gamesManager.getGameFromCache(game.packageName))
                .filter(game => game) as Game[]
            ).map(game => (
              <GameCard game={game} key={game.id} />
            ))}
          </div>
          <h2>Other Installed Apps</h2>
          <ul>
            {result.apps
              .filter(game => !gamesManager.getGameFromCache(game.packageName))
              .map(game => (
                <li key={game.packageName}>
                  <span style={{ display: "inline-block", width: 200 }}>
                    <strong>Version:</strong> {game.versionCode}
                  </span>
                  {game.packageName}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Devices;
