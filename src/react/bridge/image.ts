import { isElectron } from ".";

const isDevelopment = process.env.NODE_ENV === "development";

const getImagePath = (packageName?: string): string => {
  if (!packageName) return "";
  return (
    (isElectron
      ? "game-image://"
      : (isDevelopment ? `${window.location.protocol}//${window.location.hostname}:3001` : "") +
        "/game-image/") + packageName
  );
};

export default getImagePath;
