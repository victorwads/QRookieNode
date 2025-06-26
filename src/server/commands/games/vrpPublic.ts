import log from "@server/log";
import HttpDownloader from "./downloader";

export interface VrpPublicData {
  baseUri: string;
  password: string;
}

export class VrpPublic {
  private static readonly PUBLIC_URL = "https://vrpirates.wiki/downloads/vrp-public.json";

  public async fetchData(): Promise<VrpPublicData | null> {
    const downloader = new HttpDownloader();

    try {
      log.info(`Fetching VPR public data from: ${VrpPublic.PUBLIC_URL}`);
      const data = await downloader.download(VrpPublic.PUBLIC_URL);

      const json = JSON.parse(data);

      if (!json.baseUri || !json.password) {
        log.error("Invalid data format:", json);
        return null;
      }

      // Decode password from Base64
      const baseUri = json.baseUri;
      const password = Buffer.from(json.password, "base64").toString("utf-8");

      return { baseUri, password };
    } catch (error) {
      log.error("Failed to fetch VPR public data:", error);
      return null;
    }
  }
}

export default new VrpPublic().fetchData();
