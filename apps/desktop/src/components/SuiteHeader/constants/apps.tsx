import {
	Development,
	Industry,
	ContinuousDeployment,
	AgricultureAnalytics,
	ContinuousIntegration,
	IbmWatsonMachineLearning,
	Db2Database,
	IbmCloudProjects,
	IbmWatsonKnowledgeCatalog,
	Settings,
} from "@carbon/icons-react";

// Itemname can either be a string or a jsx element
interface route {
	ItemName: string;
	render?: () => JSX.Element;
	href: string;
	// rome-ignore lint/suspicious/noExplicitAny: <explanation>
	icon?: (...args: any[]) => unknown | object;
	children?: route[];
}

export const Apps: route[] = [
	{
		ItemName: "Projetos",
		href: "/projects",
		icon: (params) => <IbmCloudProjects {...params} />,
		children: [
			{
				ItemName: "Ver Todos os projetos",
				href: "/projects/all",
			},
		],
	},
	{
		ItemName: "Coleções",
		href: "/collections",
		icon: (params) => <IbmWatsonKnowledgeCatalog {...params} />,
		children: [
			{
				ItemName: "Ver Todas as Coleções",
				href: "/collections/all",
				icon: (params) => <IbmWatsonKnowledgeCatalog {...params} />,
			},
		],
	},
	{
		ItemName: "Configurações",
		href: "/configurations",
		icon: (params) => <Settings {...params} />,
		children: [
			{
				ItemName: "Configurações Gerais",
				href: "/configurations/general",
				icon: (params) => <IbmWatsonKnowledgeCatalog {...params} />,
			},
			{
				ItemName: "Integrações",
				href: "/configurations/integrations",
				icon: (params) => <IbmWatsonKnowledgeCatalog {...params} />,
			},
			{
				ItemName: "Preferências de Usuário",
				href: "/configurations/user-preferences",
				icon: (params) => <IbmWatsonKnowledgeCatalog {...params} />,
			},
		],
	},
];
