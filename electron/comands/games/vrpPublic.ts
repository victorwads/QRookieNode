import HttpDownloader from "./httpDownloader";

export interface VprPublicData {
    baseUri: string;
    password: string;
}

export class VprPublic {
  private static readonly PUBLIC_URL = "https://vrpirates.wiki/downloads/vrp-public.json";

  public async fetchData(): Promise<VprPublicData | null> {
    const downloader = new HttpDownloader();

    try {
      console.log(`Fetching VPR public data from: ${VprPublic.PUBLIC_URL}`);
      const data = await downloader.download(VprPublic.PUBLIC_URL);

      const json = JSON.parse(data);

      if (!json.baseUri || !json.password) {
        console.error("Invalid data format:", json);
        return null;
      }

      // Decode password from Base64
      const baseUri = json.baseUri;
      const password = Buffer.from(json.password, "base64").toString("utf-8");

      console.log("Fetched VPR public data successfully:", { baseUri, password });

      return { baseUri, password };
    } catch (error) {
      console.error("Failed to fetch VPR public data:", error);
      return null;
    }
  }
}

export default (new VprPublic()).fetchData();