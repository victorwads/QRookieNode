# Unix Development

## 📚 Dependencies

You need to install the following dependencies:
- nvm (Node Version Manager) or Node.js Lts
- yarn (package manager) - Do not use npm
- Inkscape (for icons generation)

### If you are using NVM (Node Version Manager)

```bash
nvm install 22 # To install node 22
nvm use 22
npm install -g yarn # To install yarn, the package manager used in this project
```

## Clone the project and install the dependencies

```bash
git clone https://github.com/victorwads/QRookieNode
cd QRookieNode
yarn install # Do not use npm install
```

## 🚀 Running the project
```bash
yarn dev # To run the project in development mode
```

To Export the project:

```bash
yarn bundle:mac-dev # To export the project to mac on the dist folder
yarn bundle --linux --dir # To export the project to linux on the dist folder
```
