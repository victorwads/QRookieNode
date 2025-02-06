# Rookie Node (Electron Version)

QRookie-Node is an application for downloading and installing games for Quest devices, inspired by the [QRookie by **@glaumar*](https://github.com/glaumar/QRookie). This project adapts the original implementation to a modern development environment, leveraging **Node.js** and **React** for greater flexibility and ease of use across multiple platforms.

## ⚡ Key Features

- **Game Downloads**: Facilitates downloading games for Quest devices from public mirrors.
- **Modern Interface**: Built with React and a tab-based navigation system.
- **Device Management**: Handles connected devices via ADB.
- **Really Mutiplatform**: Works on Windows, Linux MacO, Android, and more. Try run it on your microwave!
    - **Server Mode**: Run as a server and access it from any device on your network using a web browser.
    - **Easy Development**: Built with Node.js and React for easy customization and contribution.

## 📦 Installation

Download on [releases page](./releases) for Mac, Linux and Windows.

### Runing on Android Termux

You can run Rookie Node on your Android device using Termux. You can run it inside your vr headset, or on your phone, tablet, or any other Android device.
Just download the Android termux version from the [releases page](./releases) run `./qrookie-node-headless` and access it from your browser at `http://localhost:3001`
or using your device IP address on your local network.

## 📚 Dependencies For Developers

- **Node.js** for logic and process management.
- **Yarn** for package management.
- **Inkscape** for icon generation.

## 🚀 Development With Eletron

- [Windows instructions](./docs/windowsDevelopment.md)


## 🛠️ Project Structure
- public/: Contains the public assets like icons and the index.html for react.
- assets/: Contains the SVG icons used in the project and script to generate PNGs.
- src/: Contains the React front-end code.
    - bridge/: Contains the code to communicate with main process using Electron or WebSocket.
    - pages/: Contains the main pages such as Games, Library, Devices, Settings, etc.
    - components/: Reusable components like TabBar and configured icons.
- electron/: Contains the Electron main process/server code.
- platforms/: Contains platform-specific scripts and configurations.
- dist/: Contains the built code (.gitignored).
    - react/: Contains the built React code.
    - electron/: Contains the built Electron code.


## 🎨 User Interface

The user interface is designed to be simple and intuitive, with a tab-based navigation system for easy access to different features. The interface is responsive and adapts to different screen sizes, making it suitable for various devices.

Using react also allows for easy customization and extension of the interface, making it easy to add new features or modify existing ones.

## 🔗 References

This project was heavily inspired and based on the work of @glaumar in [QRookie](https://github.com/glaumar/QRookie). The structure, ideas, and features were adapted to better suit the requirements of JavaScript-based platforms. 