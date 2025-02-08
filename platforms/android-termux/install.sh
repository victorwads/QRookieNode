YELLOW="\033[1;33m"
PURPLE="\033[1;35m"
RESET="\033[0m"

echo -e "${YELLOW}Getting last version of QRookie...${RESET}"
VERSION=$(curl -s https://api.github.com/repos/victorwads/QRookieNode/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
FILENAME="QRookieAndroidTermux-$VERSION.arm64.zip"
FOLDER="QRookieHeadless-$VERSION.arm64"


echo -e "${YELLOW}Remove old files...${RESET}"
echo -e "${PURPLE}rm -f $FILENAME${RESET}"
rm -f "$FILENAME"
echo -e "${PURPLE}rm -rf $FOLDER${RESET}"
rm -rf "$FOLDER"


echo -e "${YELLOW}Downloading file $FILENAME...${RESET}"
curl -L https://github.com/victorwads/QRookieNode/releases/download/$VERSION/QRookieAndroidTermux-$VERSION.arm64.zip -o "$FILENAME"
unzip "$FILENAME"
rm -f "$FILENAME"


echo -e "${YELLOW}Installing missing dependencies in Termux...${RESET}"
export DEBIAN_FRONTEND=noninteractivegit
termux-change-repo
yes "y" | pkg update -y
yes "y" | pkg install nodejs-lts yarn which p7zip -y
