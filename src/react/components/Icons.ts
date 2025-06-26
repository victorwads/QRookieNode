import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as solid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";

export const Icons = { solid };
export type { IconDefinition };
export default Icon;

type IconList = typeof solid;
type IconKey = keyof IconList;

interface IconSearchName {
  icon: IconDefinition;
  lowerCaseName: string;
}

export function getIconByCaseInsensitiveName(name: string): IconDefinition {
  const normalizedName = ICON_NAME_PREFIX + name.toLowerCase().replaceAll("-", "");
  const foundIcon = iconNames.find(iconName => iconName.lowerCaseName === normalizedName)?.icon;

  return foundIcon ? foundIcon : Icons.solid.faQuestion;
}

const iconNames: IconSearchName[] = [...mapIconPack(Icons.solid)];
const ICON_NAME_PREFIX = "fa";

function mapIconPack(pack: IconList): IconSearchName[] {
  return Object.keys(pack).map((iconName: string) => ({
    icon: pack[iconName as IconKey] as IconDefinition,
    lowerCaseName: iconName.toLowerCase(),
  }));
}
