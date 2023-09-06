import { SkeletonText } from "@carbon/react";
import { Apps as constApps } from "../components/SuiteHeader/constants/apps";
import useCollections from "./useCollections";
import { useState } from "react";
import { IbmWatsonKnowledgeCatalog } from "@carbon/icons-react";

//We will take the usual routes from the apps.tsx file and add the new routes retrieved from the database (collections) to it
export const useSideMenuItems = () => {
	const [Apps, setApps] = useState(constApps);

	const { collections, isLoadingcollections, errorCollections } =
		useCollections();

	if (isLoadingcollections) {
		//We add the loading skeleton to  the apps itemname "Coleções" children and return it
		const loadingSkeleton = {
			ItemName: "Carregando...",
			render: () => <SkeletonText paragraph width="100%" />,
			href: "/catalogs",
			icon: (params) => <IbmWatsonKnowledgeCatalog {...params} />,
		};
		const newApps = Apps.map((app) => {
			if (app.ItemName === "Coleções") {
				return {
					...app,
					children: [...app.children, loadingSkeleton],
				};
			}
			return app;
		});
		setApps(newApps);
	} else {
		for (const collection of collections) {
			//We add the new routes retrieved from the database (collections) to the apps itemname "Coleções" children and return it
			const newCollection = {
				ItemName: collection.name,
				href: `/catalogs/${collection.id}`,
				icon: (params) => <IbmWatsonKnowledgeCatalog {...params} />,
			};
			const newApps = Apps.map((app) => {
				if (app.ItemName === "Coleções") {
					return {
						...app,
						children: [newCollection, ...app.children],
					};
				}
				return app;
			});
			setApps(newApps);
		}
	}

	return { Apps };
};
