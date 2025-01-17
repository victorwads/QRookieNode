import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as child_process from "child_process";

export type GitHubRelease = {
  assets: { download_count: number, name: string, browser_download_url: string }[]
};

type Platform = typeof process.platform;
type ToolURL = string | (() => Promise<string>);
type ToolURLs = { [platform in Platform]?: ToolURL };

const TOOL_URLS: ToolURLs = {
  darwin: "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip",
  win32: "https://dl.google.com/android/repository/platform-tools-latest-windows.zip",
  linux: async () => {
    if (process.arch.indexOf("arm") === -1) {
      return "https://dl.google.com/android/repository/platform-tools-latest-linux.zip";
    }

    const getLastReleaseUrl = "https://api.github.com/repos/lzhiyong/android-sdk-tools/releases";
    const response = await fetch(getLastReleaseUrl);
    const releases = await response.json();
    const release: GitHubRelease = releases[0];
    const asset = release.assets.find(asset => asset.name.includes("aarch64"));
    if (!asset) {
      throw new Error("Failed to find ARM asset");
    }
    return asset.browser_download_url;
  },
};
TOOL_URLS.android = TOOL_URLS.linux;

const arch = process.arch;
const platform = getPlatform();
const userDataDir = path.join(app.getPath("userData"));
const extractedDir = path.join(userDataDir, arch, platform);
export const downloadDir = path.join(userDataDir, "downloads");
export const platformToolsDir = path.join(extractedDir, "platform-tools");
export const binExt = platform === "win32" ? ".exe" : ""

function getPlatform(): "darwin" | "win32" | "linux" | "android" {
  const platform = process.platform;
  if (platform === "darwin" || platform === "win32" || platform === "linux") {
    return platform;
  }
  throw new Error(`Unsupported platform: ${platform}`);
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve as any));
    }).on("error", (err) => {
      fs.unlinkSync(dest); // Remove arquivo corrompido
      reject(err);
    });
  });
}

function unzipFile(zipPath: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (process.platform === "win32") {
      // Use powershell no Windows
      const command = `powershell Expand-Archive -Path "${zipPath}" -DestinationPath "${dest}" -Force`;
      child_process.exec(command, (error) => {
        if (error) reject(error);
        else resolve();
      });
    } else {
      // Use unzip no macOS/Linux
      const command = `unzip -o "${zipPath}" -d "${dest}"`;
      child_process.exec(command, (error) => {
        if (error) reject(error);
        else resolve();
      });
    }
  });
}

export async function setupTools(force: boolean = false): Promise<void> {
  if (force && fs.existsSync(platformToolsDir)) {
    fs.rmdirSync(platformToolsDir, { recursive: true });
  }
  if (fs.existsSync(platformToolsDir)) {
    console.log("Platform tools already exist. Skipping download.");
    return;
  }

  let url = TOOL_URLS[platform];
  if (!url) {
    throw new Error(`No tool URL for platform: ${platform}-${arch}`);
  }
  if (typeof url === "function")
    url = await url();

  // Garantir que os diretórios existem
  fs.mkdirSync(downloadDir, { recursive: true });
  fs.mkdirSync(extractedDir, { recursive: true });

  const fileName = url.split('/').pop() + "";
  const zipPath = path.join(downloadDir, fileName);

  console.log(`Downloading tools for ${platform}-${arch} from ${url}...`);
  await downloadFile(url, zipPath);

  console.log(`Extracting tools to ${extractedDir}...`);
  await unzipFile(zipPath, extractedDir);

  console.log("Tools setup complete!");
}