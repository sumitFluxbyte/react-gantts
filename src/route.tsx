import { createBrowserRouter } from "react-router-dom";
import Bryntum from "./bryntum";
import "@bryntum/gantt/gantt.stockholm.css";
import Layout from "./layout";
import SmartElement from "./smartElement";
import Custom from "./custom";
import ConnectDivsWithLine from "./line";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Bryntum />,
      },
      {
        path: "/smart-element",
        element: <SmartElement />,
      },
      {
        path: "/custom",
        element: <Custom />,
      },
      {
        path: "/line",
        element: <ConnectDivsWithLine />,
      },
    ],
  },
]);
