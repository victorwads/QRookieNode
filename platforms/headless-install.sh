check_command() {
  command -v "$1" >/dev/null 2>&1
}

YELLOW="\033[1;33m"
PURPLE="\033[1;35m"
RESET="\033[0m"

echo -e "${YELLOW}Getting last version of QRookie...${RESET}"
VERSION=$(curl -s https://api.github.com/repos/victorwads/QRookieNode/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
FILENAME="QRookieHeadless-$VERSION.zip"
FOLDER="QRookieHeadless-$VERSION"


echo -e "${YELLOW}Remove old files...${RESET}"
echo -e "${PURPLE}rm -f $FILENAME${RESET}"
rm -f "$FILENAME"
echo -e "${PURPLE}rm -rf $FOLDER${RESET}"
rm -rf "$FOLDER"


echo -e "${YELLOW}Downloading file $FILENAME...${RESET}"
curl -L https://github.com/victorwads/QRookieNode/releases/download/$VERSION/$FILENAME -o "$FILENAME"
unzip "$FILENAME"
rm -f "$FILENAME"


if ! check_command node || ! check_command yarn || ! check_command which || ! check_command 7za; then
  if [ ! -d "/data/data/com.termux" ]; then
    echo "This script is only fully auto resolvable in Termux."
    echo "Please ensure that the following binaries are available: node, yarn, which, 7za"
    exit 1
  fi

  echo -e "${YELLOW}Installing missing dependencies in Termux...${RESET}"
  export DEBIAN_FRONTEND=noninteractivegit
  termux-change-repo
  yes "y" | pkg update -y
  yes "y" | pkg install nodejs-lts yarn which p7zip -y
fi
