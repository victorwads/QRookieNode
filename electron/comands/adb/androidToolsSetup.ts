import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as child_process from "child_process";

const TOOL_URLS = {
    darwin: "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip",
    win32: "https://dl.google.com/android/repository/platform-tools-latest-windows.zip",
    linux: "https://dl.google.com/android/repository/platform-tools-latest-linux.zip",
};
const arch = process.arch;
const platform = getPlatform();
const toolsDir = path.join(app.getPath("userData"));
const downloadDir = path.join(toolsDir, "downloads");
const extractedDir = path.join(toolsDir, arch, platform);
export const platformToolsDir = path.join(extractedDir, "platform-tools");
export const binExt = platform === "win32" ? ".exe" : ""

function getPlatform(): "darwin" | "win32" | "linux" {
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
            file.on("finish", () => file.close(resolve));
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
    const url = TOOL_URLS[platform];

    if (force && fs.existsSync(platformToolsDir)) {
        fs.rmdirSync(platformToolsDir, { recursive: true });
    }
    if (fs.existsSync(platformToolsDir)) {
        console.log("Platform tools already exist. Skipping download.");
        return;
    }

    // Garantir que os diretórios existem
    fs.mkdirSync(downloadDir, { recursive: true });
    fs.mkdirSync(extractedDir, { recursive: true });

    const zipPath = path.join(downloadDir, `platform-tools-${platform}.zip`);

    console.log(`Downloading tools for ${platform}...`);
    await downloadFile(url, zipPath);

    console.log(`Extracting tools to ${extractedDir}...`);
    await unzipFile(zipPath, extractedDir);

    console.log("Tools setup complete!");
}