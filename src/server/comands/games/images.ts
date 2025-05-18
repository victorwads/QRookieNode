import { existsSync } from "fs";
import { join } from "path";

import { downloadDir, resourcesDir } from "@server/dirs";

export const getImagePath = (packageName: string) => {
  let filePath = join(downloadDir, ".meta", "thumbnails", packageName + ".jpg");
  if (!existsSync(filePath)) {
    filePath = join(resourcesDir, "assets/images/matrix.png");
  }
  return filePath;
};
