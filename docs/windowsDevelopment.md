# Windows Development

## Windows Basic Setup

Run on PowerShell as Administrator:

```powershell
winget install --id Git.Git -e --source winget # To install git
winget install -e --id CoreyButler.NVMforWindows # To install node version manager

nvm install 22 # To install node 22
nvm use 22
npm install -g yarn # To install yarn, the package manager used in this project

# To icons generation
winget install -e --id Inkscape.Inkscape
```

## Git Bash

After thaat you will need to use Git Bash to run yarn and our bash scripts.

Open git bash on the project folder use for running dev mode:

```bash
yarn install # Do not use npm install
yarn dev
```

To Export the project:

```bash
yarn bundle --win
```
