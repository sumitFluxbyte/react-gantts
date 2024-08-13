import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{height:"100%"}}>
      <div
        style={{
          display: "flex",
          justifyItems: "center",
          justifyContent: "end",
          gap:"10px",
          marginBottom:"10px"
        }}
      >
        <Link to={"/"}>bryntum</Link>
        <Link to={"/smart-element"}>smart-element</Link>
        <Link to={"/custom"}>custom</Link>
        <Link to={"/line"}>line</Link>
      </div>
      <Outlet />
    </div>
  );
}
