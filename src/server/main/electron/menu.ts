import { Menu, MenuItemConstructorOptions } from "electron";

const menuTemplate: MenuItemConstructorOptions[] = [
  {
    label: "QRookie",
    submenu: [{ role: "quit" }],
  },
  {
    label: "Edit",
    submenu: [{ role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }],
  },
  {
    label: "View",
    submenu: [{ role: "reload" }, { role: "forceReload" }, { role: "toggleDevTools" }],
  },
];

export const setupMenu = () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
};
