import { join } from "path";
import { existsSync } from "fs";

import { downloadDir } from "../dirs";

export const getImagePath = (packageName: string) => {
  let filePath = join(downloadDir, ".meta", "thumbnails", packageName + ".jpg");
  if (!existsSync(filePath)) {
    filePath = join(__dirname, '../../../../assets/images/matrix.png');
  }
  return filePath;
}