import React from "react";

import "./Loading.css";

export const BasicLoading: React.FC = () => {
  return <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>;
}

export const CenteredLoading: React.FC = () => {
  return <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
    <BasicLoading />
  </div>;
}