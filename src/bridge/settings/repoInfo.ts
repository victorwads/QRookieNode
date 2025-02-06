import { GitHubRelease } from '../../../electron/shared';

// https://api.github.com/rate_limit
const storageKey = 'repoDownloadsInfo';
const storageValidTime = 1000 * 60 * 60 * 2; // 2 hours
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

export type RepoDownloadsInfo = {
  [repoName: string]: Downloads
};

export const repoDownloadsInfo: RepoDownloadsInfo = JSON.parse(localStorage.getItem(storageKey) || '{}');
export const promisse = Promise.all(Object.entries(repos).map(([repoName, alias]) => {
  const cache = repoDownloadsInfo[repoName];
  if (cache) {
    const cacheUntil = cache.lastUpdate + storageValidTime;
    if (cacheUntil > Date.now()) {
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
        let ext = asset.name.split('.').pop() || 'unknown';
        if(asset.name.includes('Windows')) {
          ext = 'Windows.'+ext; 
        } else if(asset.name.includes('Linux')) {
          ext = 'Linux.'+ext; 
        } else if(asset.name.includes('Mac')) {
          ext = 'Mac.'+ext; 
        } else if(asset.name.includes('Android')) {
          ext = 'Android.'+ext; 
        }
        downloads.byExt[ext] = (downloads.byExt[ext] || 0) + asset.download_count;
      });
    });
    repoDownloadsInfo[repoName] = downloads;
  })
}));

promisse.then(() => {
  localStorage.setItem(storageKey, JSON.stringify(repoDownloadsInfo));
})