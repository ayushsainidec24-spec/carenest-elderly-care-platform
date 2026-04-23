import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <TopBar />
        <div className="layout__content">{children}</div>
      </div>
    </div>
  );
}
