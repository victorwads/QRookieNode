# 📦 Installation And 🚀 Running

## MacOs

Just download the `QRookieMacOS-x.x.x.arch.dmg` version from the [releases page](./releases), open it and magic will happen.

## Windows

Just download the `QRookieWindows-x.x.x.arch.zip` version from the [releases page](./releases), unzip it and run `qrookie-node.exe`.

## Linux

Linux have several versions, choose the one that fits your system.

### Package *.deb (Debian/Ubuntu)

Just download the `QRookieLinux-x.x.x.arch.deb` version from the [releases page](./releases), install it with `dpkg -i QRookieLinux-x.x.x.arch.deb` and run `qrookie-node`.

### Package *.rpm (Fedora)

Just download the `QRookieLinux-x.x.x.arch.rpm` version from the [releases page](./releases), install it with `rpm -i QRookieLinux-x.x.x.arch.rpm` and run `qrookie-node`.

### AppImage

Just download the `QRookieLinux-x.x.x.arch.AppImage` version from the [releases page](./releases), make it executable with `chmod +x QRookieLinux-x.x.x.arch.AppImage` and run it with `./QRookieLinux-x.x.x.arch.AppImage`.

## Android Termux / Linux Headless

Just run the script below to download the latest version:
```bash
curl -fsSL https://raw.githubusercontent.com/victorwads/QRookieNode/main/platforms/headless-install.sh | bash
```

then just run `./start`
After that, access it from your browser at `http://localhost:3001` or using your device IP address on your local network.

On termux, the script will install all dependencies and download the latest version of QRookieNode. But on linux you need to install manually the dependencies.
Dependencies:
- `nodejs`
- `yarn`
- `7zip`

### Help

If you have any problems, please open an issue on the issues page.
