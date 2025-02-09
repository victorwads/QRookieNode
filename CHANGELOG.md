# Changelog

## Planned Fixes and Features
- **App Layout**
    - Iprove Mobile Layout
    - Add Device Status on TabBar
    - Add Back Button on Desktop Version
- **Games Page**
    - Add List View
    - Sort by Name, Size, Date
    - Filter by Installed, Not Installed
- **Library**
    - Open Downloads Folder (Only Desktop Version)
    - Fix Install Errors not showing
        - Ask to continue or remove
    - Feature install only game data
    - Add Game Eye Icon when click is available
    - Manage Storage
    - Split Device Library and Local Library
- **Game Details**
    - Fix Game Details Page on Mobile (Responsive Wrap)
    - Show Downloaded Files
    - Show Game Storage Usage
    - Show Game Version
    - Show 
- **Devices**
    - Filter not VR android devices
    - Improve Layout
    - Add Quest System Settings Customization (Same as SideQuest Features)
        - Change User Name
        - Change Performance Configs
            - CPU, GPU, Resolution
            - Refresh Rate
            - FFR ( Fixed Foveated Rendering )
            - Streaming & Recording Quality/Configs
            - Experimental Features (Disable Proximity Sensor, etc)
    - Device Menagement
        - Reboot
        - Install External APK
        - Upload External Files to Device
- **Settings**
    - Improve Layout
    - Turn on/off Web Server (Only Desktop Version)
    - Split Settings in Sections

## Changes Log

### Changes Release 0.1.3
- Project
    - Rename electron folders and scripts to server
    - Finally solving project aliases - it was hard

### Changes Release 0.1.2
- Rename AndroidTermux to Headless (works on system with node/warn/7zip installed)
- Android Termux Install Script
    - Fix auto resolving pkg dependencies
    - Fix Start script
    - Supress getCommandPath errors
- Headless Mode
    - Show System Network IP
    - Add start --help and arguments
- Library
    - Uninstall Games

### Changes Release 0.1.1
- Update Readme
    - Install and Run Tutorials
    - Dev Documentation
- Core
     - Fully working on Android Termux 🎉
     - Auto Find Dist folder to fix find Cross Bundles assets finding
     - Big Refactor
     - Update CI
     - Fix showing app version
- Settings
    - Little Refactor
    - Change Repo Infos
https://github.com/victorwads/QRookieNode/compare/0.1.0...0.1.1


### Changes Release 0.1.0
- Core
     - Web Version 🎉- Access all IU Remotelly
     - Headless Run
     - Working on Android Proot distros.
- Games / Library
    - Download Cancelation
- Settings
    - Improve HelthCheck
    - Fix Windows Helth Check
https://github.com/victorwads/QRookieNode/compare/0.0.10...0.1.0


### Changes Release 0.0.10
- Devices
    - Connect with TCP/Wireless
    - Pair Device using Android Wireless Adb
- Games / Library
    - Improve Game Status
    - Code Refector, DownloadInfo -> GameStatus
    - Rename -> Downloads to Library
    - Not Found message / Improve Layout
- Settings
    - Improve HelthCheck
    - Fix Windows Helth Check
- Core
    - Logs are now centralized and colored
    - Linux arm64 custom Android Tools download
https://github.com/victorwads/QRookieNode/compare/0.0.9...0.0.10



### Changes Release 0.0.9
- Downloads
    - Fix game buttons logic
    - Remove from disk
    - Install games (with obb data) 🎉
    - Add Download speed info
    - Improve Install/Unzip/Pushing Info
https://github.com/victorwads/QRookieNode/compare/0.0.8...0.0.9


### Changes Release 0.0.8
- Update Windows documentation
- New Button Component with icons
- Devices
    - Load on app init
    - Auto reload on time interval
- Downloads
    - List downloaded
    - Improve Layout
    - Unziping downloads
    - HttpDownloads refactor
    - Downloads queue
- Game
    - Install games 🎉 (without custom obb/data)
    - New States ('downloading', 'installing', 'unziping
    - Improved event changes
- Settings
    - Improve layout
    - Improve System Helth Info
https://github.com/victorwads/QRookieNode/compare/0.0.7...0.0.8


### Changes Release 0.0.7
- Load games once on app init
- Fix should use system adb if installed
- Downloads
    - Download file lock
    - Redownload corrupted download files
- Settings
    - Refactor
    - Set games download directory 🎉
https://github.com/victorwads/QRookieNode/compare/0.0.6...0.0.7


### Changes Release 0.0.6
- A lot of refactoring
- Device
    - Listing Installed Games
    - Connect with other Devices
    - Connect with TCP IP (Wireless)
- Downloading Games
    - In Game Detailed progress info
    - In Downloads Tab, list downlaoding stats
    - Multiconnection download
https://github.com/victorwads/QRookieNode/compare/0.0.5...0.0.6


### Changes Release 0.0.5
- Working Download Games
https://github.com/victorwads/QRookieNode/compare/0.0.4...0.0.5


### Changes Release 0.0.4 (develop version)
- Fix redirect http requests manually
- Show machine adb system info
https://github.com/victorwads/QRookieNode/compare/0.0.3...0.0.4


### Changes Release 0.0.3
- Add Rookie Download Count status for open source repos
- Improve adbTools downloading for arm
- Ci Improviments
https://github.com/victorwads/QRookieNode/compare/0.0.2...0.0.3


### Changes Release 0.0.1
- Initial release, create app, CI, navigation, and basic components
- Show simple devices information
- List available games 
- Add improved search functionality