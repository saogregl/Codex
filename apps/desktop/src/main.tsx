

import React, { Children, useEffect, useRef } from "react";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import rspc, { client, queryClient } from "./lib/query";
import { pkg } from "@carbon/ibm-products";

// NOTE: must happen before component is first used
pkg.component.Datagrid = true;
pkg.setAllComponents(true);
pkg.setAllFeatures(true);

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;



import SuiteHeader from "./components/SuiteHeader";
import {
	Home,
	Data,
	Collection,
	DataId,
	CollectionId,
	NotFound,
} from "./routes";

import "./style.scss";

const router = createBrowserRouter([
	{
		path: "/",
		element: <SuiteHeader />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "data",
				element: <Data />,
			},
			{
				path: "data/:id",
				element: <DataId />,
			},
			{
				path: "collections",
				element: <Collection />,
				children: [
					{
						path: ":id",
						element: <CollectionId />,
					},
				],
			},
			{
				path: "*",
				element: <NotFound />,
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
	</>,
);
