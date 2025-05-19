import Icon, { Icons } from "./Icons";

interface BooleanViewProps {
  value: boolean;
}

const BooleanView: React.FC<BooleanViewProps> = ({ value }: BooleanViewProps) => {
  return (
    <Icon
      icon={value ? Icons.solid.faCheckCircle : Icons.solid.faTimesCircle}
      style={{ color: value ? "green" : "red" }}
    />
  );
};

export default BooleanView;
