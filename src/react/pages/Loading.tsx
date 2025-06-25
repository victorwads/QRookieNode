import React from "react";
import "./Loading.css";

interface LoadingProps {
  visible?: boolean;
}

export const BasicLoading: React.FC<LoadingProps> = ({ visible }: LoadingProps) => {
  return (
    <div className={`lds-ellipsis` + (visible === true ? "" : " hide")}>
      <div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export const CenteredLoading: React.FC<LoadingProps> = ({ visible }: LoadingProps) => {
  return (
    <div
      style={{ display: visible ? "flex" : "none", justifyContent: "center", alignItems: "center" }}
    >
      <BasicLoading visible={visible} />
    </div>
  );
};
