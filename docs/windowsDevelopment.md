# Windows Development

## Windows Basic Setup

Run on PowerShell as Administrator:

```powershell
winget install --id Git.Git -e --source winget
winget install -e --id CoreyButler.NVMforWindows

node install 22
node use 22
npm install -g yarn

# To icons generation
winget install -e --id Inkscape.Inkscape
```

## Git Bash

After thaat you will need to use Git Bash to run yarn and our bash scripts.

Open git bash on the project folder use for running dev mode:

```bash
yarn install
yarn dev
```

To Export the project:

```bash
yarn bundle --win
```
