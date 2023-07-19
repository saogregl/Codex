
import React, { Children, useEffect, useRef } from "react";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import rspc, { client, queryClient } from "./lib/query";
import { pkg } from "@carbon/ibm-products";
// NOTE: must happen before component is first used
pkg.component.Datagrid = true;
pkg.component.Toolbar = true;
pkg.component.ToolbarGroup = true;
pkg.component.ToolbarButton = true;

import SuiteHeader from "./components/SuiteHeader";
import {
  Home,
} from "./routes";

import App from "./App";
import "./style.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SuiteHeader />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/data",
        element: <Home />,
      },

      {
        path: "/projects",
        element: <Home />,
      },
      {
        path: "/projects/all",
        element: <Home />,
      },
      {
        path: "/catalogs",
        element: <Home />,
      },
      {
        path: "/catalogs/all",
        element: <Home />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <React.StrictMode>
      <rspc.Provider client={client} queryClient={queryClient}>
        <RouterProvider router={router} />
      </rspc.Provider>
    </React.StrictMode>
  </>
);
