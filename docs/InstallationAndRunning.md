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

## Android / Linux Headless

Just download the QRookieAndroidTermux-x.x.x.arm64.zip version from the [releases page](./releases) inside termux, unzip it and run `./start` inside unziped folder.
After that, access it from your browser at `http://localhost:3001` or using your device IP address on your local network.

You can run the command below to download and run the latest version:
`change VERSION for the version you want`
```bash
export VERSION=0.1.1
curl -L https://github.com/victorwads/QRookieNode/releases/download/$VERSION/QRookieAndroidTermux-$VERSION.arm64.zip -o QRookieAndroidTermux-$VERSION.alpha.arm64.zip
unzip QRookieAndroidTermux-$VERSION.alpha.arm64.zip
cd QRookieHeadless-$VERSION.arm64
```
then just run `./start`

### Help

If you have any problem, please open an issue on the issues page.