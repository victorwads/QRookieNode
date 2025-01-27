# QRookie-Node

**Under development**
```
This project is in alpha releases just to test on several operational systems.
Is not ready for final users. Just developers
```

QRookie-Node is an application for downloading and installing games for Quest devices, inspired by the [QRookie](https://github.com/glaumar/QRookie) project by **@glaumar**. This project adapts the original implementation to a modern development environment, leveraging **Node.js** and **React** for greater flexibility and ease of use across multiple platforms.

## ⚡ Key Features

- **Game Downloads**: Facilitates downloading games for Quest devices from public mirrors.
- **Modern Interface**: Built with React and a tab-based navigation system.
- **Device Management**: Handles connected devices via ADB.
- **Node.js Backend**: Complete restructuring for cross-platform execution using Node.js.
- **FontAwesome Icons**: Enhanced visual interface with FontAwesome Icons.

## 📦 Installation

Download on [releases page](./releases) for your platform.

## 📚 Dependencies

### Frontend
- **React** and **React Router Dom** for navigation.
- **FontAwesome** for custom icons.

### Development
- **Node.js** for logic and process management.
- **Yarn** for package management.
- **Inkscape** for icon generation.

## 🚀 Development With Eletron

- [Windows instructions](./docs/windowsDevelopment.md)
`TODO`

## 🛠️ Project Structure
- src/pages: Contains the main pages such as Games, Downloads, Devices, Users, and Settings.
- src/components: Reusable components like TabBar and configured icons.
- src/models: TypeScript models representing system entities like GameInfo and DeviceManager.

## 🎨 User Interface

The user interface is designed to be simple and intuitive, with a tab-based navigation system for easy access to different features. The interface is responsive and adapts to different screen sizes, making it suitable for various devices.

Using react also allows for easy customization and extension of the interface, making it easy to add new features or modify existing ones.

## 🔗 References

This project was heavily inspired and based on the work of glaumar in [QRookie](https://github.com/glaumar/QRookie). The structure, ideas, and features were adapted to better suit the requirements of JavaScript-based platforms. 

The interface is inspired by the tab-based navigation system of the original [QRookie](https://github.com/glaumar/QRookie) QML project but restructured in React. Each tab is styled flexibly to adapt to different screen sizes.
