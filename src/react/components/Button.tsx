import "./Button.css";
import Icon, { IconDefinition } from "./Icons";

export interface ButtonProps {
  icon: IconDefinition;
  wide?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ icon, onClick, children, wide }: ButtonProps) => {
  return (
    <button className={`simple-button${wide ? " wide" : ""}`} onClick={onClick}>
      <Icon icon={icon} />
      {children}
    </button>
  );
};

export default Button;
