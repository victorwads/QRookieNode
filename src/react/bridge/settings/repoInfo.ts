import type { GitHubRelease } from "@server/commands/types";

// https://api.github.com/rate_limit
const storageKey = "repoDownloadsInfoV2";
const storageValidTime = 1000 * 60 * 60 * 2; // 2 hours
const repos = {
  // "glaumar/QRookie": "Qml Rookie by Glaumar",
  "victorwads/QRookieNode": "Rookie Node",
  "VRPirates/rookie": "Original Rookie",
};

type Downloads = {
  name: string;
  repo: string;
  byExt: { [ext: string]: number };
  total: number;
  lastAppVersion: string;
  lastUpdate: number;
};

export type RepoDownloadsInfo = {
  [repoName in keyof typeof repos]: Downloads;
};

export const repoDownloadsInfo: RepoDownloadsInfo = JSON.parse(
  localStorage.getItem(storageKey) || "{}"
);
export const repoInfo = Promise.all(
  Object.entries(repos).map(([name, alias]) => {
    const repoName = name as keyof typeof repos;
    const cache = repoDownloadsInfo[repoName];
    if (cache) {
      const cacheUntil = cache.lastUpdate + storageValidTime;
      if (cacheUntil > Date.now()) {
        console.log("Cache will be used for more", (cacheUntil - Date.now()) / 1000, "seconds");
        return Promise.resolve();
      }
    }
    console.log("Fetching", repoName);

    return fetch(`https://api.github.com/repos/${repoName}/releases`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch repository information");
        }
      })
      .then((releases: GitHubRelease[]) => {
        let lastAppVersion = "";
        if (releases.length > 0) {
          lastAppVersion = releases[0].tag_name;
        }

        const downloads: Downloads = {
          name: alias,
          repo: repoName,
          byExt: {},
          total: 0,
          lastAppVersion,
          lastUpdate: Date.now(),
        };
        releases.forEach(release => {
          release.assets.forEach(asset => {
            downloads.total += asset.download_count;
            let ext = asset.name.split(".").pop() || "unknown";
            if (asset.name.includes(".exe")) {
              ext = "Windows." + ext;
            } else if (asset.name.includes("Linux")) {
              ext = "Linux." + ext;
            } else if (asset.name.includes("Mac")) {
              ext = "Mac." + ext;
            } else if (asset.name.includes("Headless")) {
              ext = "Android/Headless." + ext;
            }
            downloads.byExt[ext] = (downloads.byExt[ext] || 0) + asset.download_count;
          });
        });
        repoDownloadsInfo[repoName] = downloads;
      });
  })
);

void repoInfo.then(() => {
  localStorage.setItem(storageKey, JSON.stringify(repoDownloadsInfo));
});
