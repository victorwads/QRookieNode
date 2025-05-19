import { useState } from "react";

import Icon, { Icons } from "./Icons";
import "./ToggleView.css";

interface ToggleViewProps {
  value?: boolean;
  onToggle?: (isGrid: boolean) => void;
}

const ToggleView = ({ onToggle, value = true }: ToggleViewProps) => {
  const [isGrid, setIsGrid] = useState<boolean>(value);

  const toggleView = () => {
    const newView = !isGrid;
    setIsGrid(newView);
    onToggle?.(newView);
  };

  return (
    <div className="toggle-container" onClick={toggleView} role="button" aria-label="Toggle view">
      <Icon icon={Icons.solid.faTable} className={`toggle-icon ${isGrid ? "selected" : ""}`} />
      <div className="divider"></div>
      <Icon icon={Icons.solid.faList} className={`toggle-icon ${!isGrid ? "selected" : ""}`} />
    </div>
  );
};

export default ToggleView;
