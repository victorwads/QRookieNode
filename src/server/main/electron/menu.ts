import { Menu } from "electron";

export const setupMenu = () => {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "QRookie",
        submenu: [
          { role: "quit" }, // Only keep the quit option
        ],
      },
    ])
  );
};
